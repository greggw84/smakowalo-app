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
  hasEmail: !!(process.env.EMAIL_SERVER_HOST && process.env.EMAIL_FROM)
})

const handler = NextAuth({
  // Use Supabase adapter only if configured
  adapter: hasSupabase ? SupabaseAdapter({
    url: supabaseUrl,
    secret: supabaseServiceKey,
  }) : undefined,

  providers: [
    // Facebook OAuth - only if configured
    ...(facebookClientId && facebookClientSecret ? [FacebookProvider({
      clientId: facebookClientId,
      clientSecret: facebookClientSecret,
    })] : []),

    // Google OAuth - only if configured
    ...(googleClientId && googleClientSecret ? [GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    })] : []),

    // Email magic links - configured for Gmail SMTP
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_SERVER_PORT) || 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER || 'noreply@smakowalo.pl',
          pass: process.env.EMAIL_SERVER_PASSWORD || 'placeholder', // Use App Password for Gmail
        },
        secure: false, // Use STARTTLS
      },
      from: process.env.EMAIL_FROM || 'Smakowało <noreply@smakowalo.pl>',
    }),

    // Credentials provider for testing and custom auth
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // If we have Supabase, try to authenticate with it
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
  ],

  pages: {
    signIn: '/login',
    error: '/login',
    verifyRequest: '/verify-request',
  },

  callbacks: {
    async session({ session, token, user }) {
      // Add user ID to session
      if (session.user && token.sub) {
        session.user.email = session.user.email || token.email as string
        // Store user ID in a custom way to avoid type issues
        Object.assign(session.user, { id: token.sub })
      }
      return session
    },

    async jwt({ token, user, account }) {
      // Store user ID in token
      if (user) {
        token.id = user.id
      }

      // Store provider info
      if (account) {
        token.provider = account.provider
      }

      return token
    },

    async redirect({ url, baseUrl }) {
      // Redirect to panel after successful login
      if (url.startsWith(baseUrl)) {
        return '/panel'
      }
      return `${baseUrl}/panel`
    },
  },

  events: {
    async createUser({ user }) {
      // Create profile in Supabase when user is created (only if using Supabase)
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

  // Add debug for development
  debug: process.env.NODE_ENV === 'development',
})

export { handler as GET, handler as POST }
