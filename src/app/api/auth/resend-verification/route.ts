import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, emailTemplates } from '@/lib/email'
import crypto from 'node:crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Check if we have valid Supabase credentials
const hasSupabase = supabaseUrl.startsWith('https://') &&
                   !supabaseUrl.includes('placeholder') &&
                   supabaseServiceKey.length > 50 &&
                   !supabaseServiceKey.includes('placeholder')

const supabase = hasSupabase ? createClient(supabaseUrl, supabaseServiceKey) : null

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email jest wymagany' },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    if (!supabase) {
      console.error('Supabase not configured')
      return NextResponse.json(
        { error: 'Usługa weryfikacji email jest tymczasowo niedostępna' },
        { status: 503 }
      )
    }

    // Find user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'Jeśli konto istnieje, email weryfikacyjny został wysłany.' },
        { status: 200 }
      )
    }

    // Check if already verified
    if (profile.email_verified) {
      return NextResponse.json(
        { error: 'Email jest już zweryfikowany' },
        { status: 400 }
      )
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hours

    // Update profile with new token
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        email_verification_token: hashedToken,
        email_verification_token_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    if (updateError) {
      console.error('Error updating verification token:', updateError)
      return NextResponse.json(
        { error: 'Nie udało się wysłać emaila weryfikacyjnego' },
        { status: 500 }
      )
    }

    // Send verification email
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`

    const name = profile.first_name || 'Użytkowniku'
    const verificationEmail = emailTemplates.emailVerification(name, verificationUrl)

    const emailSent = await sendEmail({
      to: email,
      ...verificationEmail
    })

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Nie udało się wysłać emaila weryfikacyjnego' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Email weryfikacyjny został wysłany!' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas wysyłania emaila' },
      { status: 500 }
    )
  }
}
