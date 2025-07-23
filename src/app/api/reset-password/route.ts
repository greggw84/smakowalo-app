import { type NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

// POST /api/reset-password - Send password reset email
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Send password reset email using Supabase Auth
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
    })

    if (error) {
      console.error('Password reset error:', error)

      // Don't reveal if email exists or not for security
      // Always return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we have sent you a password reset link.'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent you a password reset link.'
    })

  } catch (error) {
    console.error('Reset password API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/reset-password - Update password with reset token
export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { password, access_token, refresh_token } = body

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: 'Invalid reset tokens' }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 })
    }

    // Set the session using the tokens from the reset link
    const { error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token
    })

    if (sessionError) {
      console.error('Session error:', sessionError)
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 })
    }

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. You can now log in with your new password.'
    })

  } catch (error) {
    console.error('Update password API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
