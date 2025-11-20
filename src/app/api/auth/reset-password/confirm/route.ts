import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token i nowe hasło są wymagane' },
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
      console.error('Supabase not configured')
      return NextResponse.json(
        { error: 'Usługa resetowania hasła jest tymczasowo niedostępna' },
        { status: 503 }
      )
    }

    // Hash the token to compare
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find all users and check metadata (since we can't query metadata directly)
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers()

    if (listError || !authUsers) {
      console.error('Error listing users:', listError)
      return NextResponse.json(
        { error: 'Nieprawidłowy lub wygasły token resetowania hasła' },
        { status: 400 }
      )
    }

    // Find user with matching reset token
    let matchedUser = null
    for (const user of authUsers.users) {
      const metadata = user.user_metadata
      if (metadata?.password_reset_token === hashedToken) {
        // Check if token is expired
        const expiresAt = new Date(metadata.password_reset_expires)
        const now = new Date()

        if (now > expiresAt) {
          return NextResponse.json(
            { error: 'Token resetowania hasła wygasł. Poproś o nowy.' },
            { status: 400 }
          )
        }

        matchedUser = user
        break
      }
    }

    if (!matchedUser) {
      return NextResponse.json(
        { error: 'Nieprawidłowy token resetowania hasła' },
        { status: 400 }
      )
    }

    // Update user password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      matchedUser.id,
      {
        password: password,
        user_metadata: {
          password_reset_token: null,
          password_reset_expires: null,
          first_name: matchedUser.user_metadata?.first_name,
          last_name: matchedUser.user_metadata?.last_name
        }
      }
    )

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { error: 'Nie udało się zaktualizować hasła' },
        { status: 500 }
      )
    }

    console.log('✅ Password reset successful for user:', matchedUser.email)

    return NextResponse.json(
      { message: 'Hasło zostało pomyślnie zmienione. Możesz się teraz zalogować.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Password reset confirm error:', error)
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas resetowania hasła' },
      { status: 500 }
    )
  }
}
