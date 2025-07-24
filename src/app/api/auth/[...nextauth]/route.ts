import NextAuth from 'next-auth'
import FacebookProvider from 'next-auth/providers/facebook'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import CredentialsProvider from 'next-auth/providers/credentials'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import { createClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const facebookClientId = process.env.FACEBOOK_CLIENT_ID || ''
const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET || ''
const googleClientId = process.env.GOOGLE_CLIENT_ID || ''
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || ''

// Check if we have real Supabase credentials
const hasSupabase = supabaseUrl.startsWith('https://') &&
                   !supabaseUrl.includes('placeholder') &&
                   supabaseServiceKey.length > 50 &&
                   !supabaseServiceKey.includes('placeholder')

// Create Supabase client only if we have valid credentials
const supabase = hasSupabase ? createClient(supabaseUrl, supabaseServiceKey) : null

console.log('NextAuth Config:', {
  hasSupabase,
  hasFacebook: !!(facebookClientId && facebookClientSecret),
  hasGoogle: !!(googleClientId && googleClientSecret),
  hasEmail: !!(process.env.EMAIL_SERVER_HOST && process.env.EMAIL_FROM),
  isProduction: process.env.NODE_ENV === 'production'
})

const handler = NextAuth({
  // Use Supabase adapter only if configured
  adapter: hasSupabase ? SupabaseAdapter({
    url: supabaseUrl,
    secret: supabaseServiceKey,
  }) : undefined,

  providers: [
    // Credentials provider for testing and fallback auth
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        firstName: { label: 'First Name', type: 'text' },
        lastName: { label: 'Last Name', type: 'text' },
        isSignUp: { label: 'Is Sign Up', type: 'hidden' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // If this is a sign up request
        if (credentials.isSignUp === 'true') {
          // For test domains, create user directly without email verification
          if (supabase) {
            try {
              // Check if user already exists
              const { data: existingUser } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', credentials.email)
                .single()

              if (existingUser) {
                throw new Error('User already exists')
              }

              // Create user in Supabase auth
              const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: credentials.email,
                password: credentials.password,
                email_confirm: true, // Skip email verification for test
                user_metadata: {
                  first_name: credentials.firstName,
                  last_name: credentials.lastName
                }
              })

              if (authError || !authData.user) {
                console.error('Error creating user:', authError)
                throw new Error('Failed to create user')
              }

              return {
                id: authData.user.id,
                email: authData.user.email,
                name: `${credentials.firstName} ${credentials.lastName}`.trim(),
              }
            } catch (error) {
              console.error('Sign up error:', error)
              return null
            }
          } else {
            // Fallback for no database - create test user
            return {
              id: Date.now().toString(),
              email: credentials.email,
              name: `${credentials.firstName} ${credentials.lastName}`.trim(),
            }
          }
        }

        // Regular sign in
        if (supabase) {
          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email: credentials.email,
              password: credentials.password,
            })

            if (error || !data.user) {
              return null
            }

            return {
              id: data.user.id,
              email: data.user.email,
              name: `${data.user.user_metadata?.first_name || ''} ${data.user.user_metadata?.last_name || ''}`.trim(),
            }
          } catch (error) {
            console.error('Supabase authentication error:', error)
            return null
          }
        }

        // Fallback test credentials for development
        if (credentials.email === 'test@example.com' && credentials.password === 'password') {
          return {
            id: '1',
            email: credentials.email,
            name: 'Test User',
          }
        }

        return null
      }
    }),

    // Facebook OAuth - only if configured AND not on test domain
    ...(facebookClientId && facebookClientSecret && !process.env.VERCEL_URL?.includes('vercel.app') ? [FacebookProvider({
      clientId: facebookClientId,
      clientSecret: facebookClientSecret,
    })] : []),

    // Google OAuth - only if configured AND not on test domain
    ...(googleClientId && googleClientSecret && !process.env.VERCEL_URL?.includes('vercel.app') ? [GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    })] : []),

    // Email magic links - only if SMTP is properly configured
    ...(process.env.EMAIL_SERVER_HOST &&
        process.env.EMAIL_SERVER_PASSWORD &&
        !process.env.EMAIL_SERVER_PASSWORD.includes('placeholder') &&
        !process.env.VERCEL_URL?.includes('vercel.app') ? [EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_SERVER_PORT) || 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER || 'noreply@smakowalo.pl',
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        secure: false,
      },
      from: process.env.EMAIL_FROM || 'Smakowało <noreply@smakowalo.pl>',
    })] : []),
  ],

  pages: {
    signIn: '/login',
    error: '/login',
    verifyRequest: '/verify-request',
  },

  callbacks: {
    async session({ session, token, user }) {
      if (session.user && token.sub) {
        session.user.email = session.user.email || token.email as string
        Object.assign(session.user, { id: token.sub })
      }
      return session
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }

      if (account) {
        token.provider = account.provider
      }

      return token
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return url
      }
      return `${baseUrl}/panel`
    },
  },

  events: {
    async createUser({ user }) {
      if (user.email && supabase) {
        try {
          const { error } = await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            first_name: user.name?.split(' ')[0] || '',
            last_name: user.name?.split(' ').slice(1).join(' ') || '',
            newsletter_subscribed: false,
          })

          if (error) {
            console.error('Error creating user profile:', error)
          } else {
            console.log('User profile created successfully for:', user.email)
          }
        } catch (error) {
          console.error('Error creating user profile:', error)
        }
      }
    },

    async signIn({ user, account, profile }) {
      console.log('User signed in:', {
        provider: account?.provider,
        email: user.email,
        userId: user.id
      })
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  debug: process.env.NODE_ENV === 'development',
})

export { handler as GET, handler as POST }
