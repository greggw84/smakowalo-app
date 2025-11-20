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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=InvalidToken', request.url))
    }

    // Check if Supabase is configured
    if (!supabase) {
      console.error('Supabase not configured')
      return NextResponse.redirect(new URL('/login?error=VerificationFailed', request.url))
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find user with this verification token
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email_verification_token', hashedToken)
      .single()

    if (profileError || !profile) {
      return NextResponse.redirect(new URL('/login?error=InvalidToken', request.url))
    }

    // Check if token is expired (24 hours)
    const tokenCreatedAt = new Date(profile.email_verification_token_expires_at)
    const now = new Date()

    if (now > tokenCreatedAt) {
      return NextResponse.redirect(new URL('/login?error=TokenExpired', request.url))
    }

    // Mark email as verified
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        email_verified: true,
        email_verification_token: null,
        email_verification_token_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    if (updateError) {
      console.error('Error verifying email:', updateError)
      return NextResponse.redirect(new URL('/login?error=VerificationFailed', request.url))
    }

    // Also update Supabase Auth user
    try {
      const { error: authError } = await supabase.auth.admin.updateUserById(
        profile.id,
        { email_confirm: true }
      )

      if (authError) {
        console.error('Error updating auth user:', authError)
      }
    } catch (error) {
      console.error('Error updating auth user:', error)
    }

    // Send welcome email
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const loginUrl = `${baseUrl}/login`
    const name = profile.first_name || 'Użytkowniku'
    const welcomeEmail = emailTemplates.welcome(name, loginUrl)

    sendEmail({
      to: profile.email,
      ...welcomeEmail
    }).then(success => {
      if (success) {
        console.log('Welcome email sent to:', profile.email)
      } else {
        console.error('Failed to send welcome email to:', profile.email)
      }
    }).catch(err => {
      console.error('Error sending welcome email:', err)
    })

    // Redirect to login with success message
    return NextResponse.redirect(new URL('/login?verified=true', request.url))
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(new URL('/login?error=VerificationFailed', request.url))
  }
}
