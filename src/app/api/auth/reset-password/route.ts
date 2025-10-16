import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, emailTemplates } from '@/lib/email'
import crypto from 'node:crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

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

    if (!supabase) {
      console.error('Supabase not configured')
      return NextResponse.json(
        { error: 'Usługa resetowania hasła jest tymczasowo niedostępna' },
        { status: 503 }
      )
    }

    // Find user by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    // Always return success to prevent email enumeration
    if (profileError || !profile) {
      console.log('User not found for password reset:', email)
      return NextResponse.json(
        { message: 'Jeśli konto istnieje, email z linkiem do resetowania hasła został wysłany.' },
        { status: 200 }
      )
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // 1 hour

    // Store reset token in Supabase Auth user metadata
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      profile.id,
      {
        user_metadata: {
          password_reset_token: hashedToken,
          password_reset_expires: expiresAt.toISOString(),
          first_name: profile.first_name,
          last_name: profile.last_name
        }
      }
    )

    if (updateError) {
      console.error('Error storing reset token:', updateError)
      return NextResponse.json(
        { error: 'Nie udało się wysłać emaila resetującego hasło' },
        { status: 500 }
      )
    }

    // Send password reset email
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

    const name = profile.first_name || 'Użytkowniku'
    const resetEmail = emailTemplates.passwordReset(name, resetUrl)

    const emailSent = await sendEmail({
      to: email,
      ...resetEmail
    })

    if (!emailSent) {
      console.error('Failed to send reset email to:', email)
      // Still return success to prevent email enumeration
    }

    console.log('✅ Password reset email sent to:', email)

    return NextResponse.json(
      { message: 'Email z linkiem do resetowania hasła został wysłany. Sprawdź swoją skrzynkę.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas wysyłania emaila' },
      { status: 500 }
    )
  }
}
