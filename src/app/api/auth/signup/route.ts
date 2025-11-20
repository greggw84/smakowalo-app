import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, emailTemplates } from '@/lib/email'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

const hasSupabase = supabaseUrl.startsWith('https://') &&
                   !supabaseUrl.includes('placeholder') &&
                   supabaseServiceKey.length > 50 &&
                   !supabaseServiceKey.includes('placeholder')

const supabase = hasSupabase ? createClient(supabaseUrl, supabaseServiceKey) : null

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, newsletter } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email i hasło są wymagane' },
        { status: 400 }
      )
    }

    if (!phone) {
      return NextResponse.json(
        { error: 'Numer telefonu jest wymagany' },
        { status: 400 }
      )
    }

    // Validate Polish phone number format
    const phoneRegex = /^(\+48)?[\s-]?(\d{3})[\s-]?(\d{3})[\s-]?(\d{3})$/
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Podaj prawidłowy numer telefonu (9 cyfr lub +48 xxx xxx xxx)' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Hasło musi mieć co najmniej 6 znaków' },
        { status: 400 }
      )
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase nie jest skonfigurowany' },
        { status: 503 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Użytkownik o tym adresie email już istnieje' },
        { status: 400 }
      )
    }

    // AUTO-CONFIRM IN DEV, REQUIRE VERIFICATION IN PROD
    const isDevelopment = process.env.NODE_ENV === 'development'

    console.log('📝 Creating user:', email, 'isDev:', isDevelopment)

    let authData: any;
    let authError: any;

    if (isDevelopment) {
      // Development: Use admin API to auto-confirm
      const result = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm in development
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          phone: phone
        }
      })
      authData = result.data
      authError = result.error
    } else {
      // Production: Use regular signup which triggers Supabase verification emails
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone
          },
          emailRedirectTo: `${siteUrl}/login?verified=true`
        }
      })
      authData = result.data
      authError = result.error

      // Send our custom verification email as well (backup)
      if (result.data.user && !result.data.user.email_confirmed_at) {
        const verificationEmail = emailTemplates.emailVerification(
          firstName || 'Użytkowniku',
          `${siteUrl}/login?email=${encodeURIComponent(email)}`
        )

        sendEmail({
          to: email,
          ...verificationEmail
        }).then(success => {
          if (success) {
            console.log('✅ Verification email sent to:', email)
          } else {
            console.warn('⚠️ Failed to send backup verification email to:', email)
          }
        }).catch(err => {
          console.error('❌ Error sending backup verification email:', err)
        })
      }
    }

    if (authError || !authData.user) {
      console.error('❌ Error creating user:', authError)
      return NextResponse.json(
        { error: authError?.message || 'Nie udało się utworzyć użytkownika' },
        { status: 500 }
      )
    }

    // Create profile in database
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        first_name: firstName || '',
        last_name: lastName || '',
        phone: phone || '',
        newsletter_subscribed: newsletter || false
      })

    if (profileError) {
      console.error('❌ Error creating profile:', profileError)
      // Try to clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Nie udało się utworzyć profilu użytkownika' },
        { status: 500 }
      )
    }

    console.log('✅ User registered successfully:', email)

    // Different response based on environment
    if (isDevelopment) {
      console.log('✅ Auto-confirmed in development mode')
      return NextResponse.json(
        {
          data: {
            user: {
              id: authData.user.id,
              email: email
            },
            requiresEmailVerification: false,
            message: 'Konto utworzone i automatycznie potwierdzone (tryb deweloperski)'
          },
          error: null
        },
        { status: 201 }
      )
    }

    console.log('📧 Email verification required - verification email sent to:', email)
    return NextResponse.json(
      {
        data: {
          user: {
            id: authData.user.id,
            email: email
          },
          requiresEmailVerification: true,
          message: 'Konto utworzone! Sprawdź swoją skrzynkę email i kliknij link weryfikacyjny, aby dokończyć rejestrację.'
        },
        error: null
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Signup error:', error)
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas rejestracji' },
      { status: 500 }
    )
  }
}
