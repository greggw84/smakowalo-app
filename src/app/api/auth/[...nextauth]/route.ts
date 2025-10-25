import NextAuth from 'next-auth'
import FacebookProvider from 'next-auth/providers/facebook'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import CredentialsProvider from 'next-auth/providers/credentials'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, emailTemplates } from '@/lib/email'
import crypto from 'node:crypto'

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

export const authOptions = {
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
        phone: { label: 'Phone', type: 'tel' },
        isSignUp: { label: 'Is Sign Up', type: 'hidden' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // If this is a sign up request
        if (credentials.isSignUp === 'true') {
          if (supabase) {
            // Supabase sign up flow
            try {
              // Check if user already exists
              const { data: existingUser } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', credentials.email)
                .single()

              if (existingUser) {
                throw new Error('EmailAlreadyExists')
              }

              // Determine if we should auto-confirm email (for development)
              const isDevelopment = process.env.NODE_ENV === 'development'

              // Create user in Supabase auth
              const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: credentials.email,
                password: credentials.password,
                email_confirm: isDevelopment, // Auto-confirm in development only
                user_metadata: {
                  first_name: credentials.firstName,
                  last_name: credentials.lastName,
                  phone: credentials.phone
                }
              })

              if (authError || !authData.user) {
                console.error('Error creating user:', authError)
                throw new Error('SignupFailed')
              }

              // Create profile in profiles table
              const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                  id: authData.user.id,
                  email: credentials.email,
                  first_name: credentials.firstName || '',
                  last_name: credentials.lastName || '',
                  phone: credentials.phone || ''
                })

              if (profileError) {
                console.error('❌ Error creating profile:', profileError)
                // Try to clean up auth user if profile creation fails
                await supabase.auth.admin.deleteUser(authData.user.id)
                throw new Error('SignupFailed')
              }

              console.log('✅ User created successfully:', credentials.email)
              console.log('✅ Profile created in database')

              if (!isDevelopment) {
                console.log('📧 Email verification required - user must verify email before login')
              }

              // Return user to allow automatic sign in (only in dev mode)
              if (isDevelopment) {
                return {
                  id: authData.user.id,
                  email: credentials.email,
                  name: `${credentials.firstName} ${credentials.lastName}`.trim()
                }
              }
              // In production, don't auto-login - require email verification
              throw new Error('VerificationRequired')
            } catch (error) {
              console.error('Sign up error:', error)
              // Re-throw known errors, or use a fallback
              if (error instanceof Error) {
                const knownErrors = ['EmailAlreadyExists', 'VerificationRequired', 'SignupFailed']
                if (knownErrors.includes(error.message)) {
                  throw error
                }
              }
              throw new Error('SignupFailed')
            }
          } else {
            // FALLBACK: Demo mode without Supabase
            console.log('⚠️ Demo mode: Creating user without database (Supabase not configured)')
            console.log('User would be created:', {
              email: credentials.email,
              name: `${credentials.firstName} ${credentials.lastName}`
            })

            // Simulate successful signup
            throw new Error('DEMO_SIGNUP_SUCCESS')
          }
        }

        // Regular sign in
        if (supabase) {
          try {
            // Try to sign in with Supabase Auth
            const { data, error } = await supabase.auth.signInWithPassword({
              email: credentials.email,
              password: credentials.password,
            })

            if (error || !data.user) {
              console.error('❌ Login failed:', error?.message)
              return null
            }

            // Check if profile exists in database
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', credentials.email)
              .single()

            // If no profile exists, create it now (for existing users)
            if (!profile) {
              console.log('⚠️ Profile missing, creating for:', credentials.email)
              await supabase
                .from('profiles')
                .insert({
                  id: data.user.id,
                  email: data.user.email || credentials.email,
                  first_name: data.user.user_metadata?.first_name || '',
                  last_name: data.user.user_metadata?.last_name || '',
                  phone: ''
                })
              console.log('✅ Profile created during login')
            }

            console.log('✅ Login successful:', credentials.email)

            return {
              id: data.user.id,
              email: data.user.email,
              name: `${data.user.user_metadata?.first_name || ''} ${data.user.user_metadata?.last_name || ''}`.trim(),
            }
          } catch (error) {
            console.error('❌ Authentication error:', error)
            return null
          }
        }

        // FALLBACK: Demo mode without Supabase
        // Allow any email/password to sign in for testing
        console.log('⚠️ Demo mode: Signing in without database (Supabase not configured)')
        console.log('Demo user login:', credentials.email)

        // Accept any credentials for demo mode
        return {
          id: Buffer.from(credentials.email).toString('base64').substring(0, 10),
          email: credentials.email,
          name: credentials.email.split('@')[0],
        }
      }
    }),

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
      // Handle relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      // Handle full URLs that start with baseUrl
      if (url.startsWith(baseUrl)) {
        return url
      }
      // Default to panel
      return `${baseUrl}/panel`
    },
  },

  events: {
    async createUser({ user }) {
      if (user.email && supabase) {
        try {
          // Generate email verification token
          const verificationToken = crypto.randomBytes(32).toString('hex')
          const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex')
          const expiresAt = new Date()
          expiresAt.setHours(expiresAt.getHours() + 24) // 24 hours

          const { error } = await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            first_name: user.name?.split(' ')[0] || '',
            last_name: user.name?.split(' ').slice(1).join(' ') || '',
            phone: ''
          })

          if (error) {
            console.error('Error creating user profile:', error)
          } else {
            console.log('User profile created successfully for:', user.email)

            // Send verification email
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
            const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`
            const name = user.name?.split(' ')[0] || 'Użytkowniku'

            const verificationEmail = emailTemplates.emailVerification(name, verificationUrl)

            sendEmail({
              to: user.email,
              ...verificationEmail
            }).then(success => {
              if (success) {
                console.log('Verification email sent to:', user.email)
              } else {
                console.error('Failed to send verification email to:', user.email)
              }
            }).catch(err => {
              console.error('Error sending verification email:', err)
            })
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

  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Remove domain to fix cookie issues on production
        domain: undefined,
      },
    },
  },

  useSecureCookies: process.env.NODE_ENV === 'production',

  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
