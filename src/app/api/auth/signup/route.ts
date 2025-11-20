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

    // AUTO-CONFIRM FOR ALL USERS (no email verification required)
    // We'll send a welcome email instead
    console.log('📝 Creating user:', email)

    let authData: any;
    let authError: any;

    // Use admin API to auto-confirm (no email verification needed)
    const result = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm immediately
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone: phone
      }
    })
    authData = result.data
    authError = result.error

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

    // Send welcome email through our SMTP
    const welcomeEmail = emailTemplates.welcome(
      firstName || 'Użytkowniku',
      `${siteUrl}/panel`
    )

    sendEmail({
      to: email,
      ...welcomeEmail
    }).then(success => {
      if (success) {
        console.log('✅ Welcome email sent to:', email)
      } else {
        console.warn('⚠️ Failed to send welcome email to:', email)
      }
    }).catch(err => {
      console.error('❌ Error sending welcome email:', err)
    })

    // Return success - user can login immediately
    console.log('✅ User auto-confirmed - can login immediately')
    return NextResponse.json(
      {
        data: {
          user: {
            id: authData.user.id,
            email: email
          },
          requiresEmailVerification: false,
          message: 'Konto utworzone pomyślnie! Możesz się teraz zalogować.'
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
