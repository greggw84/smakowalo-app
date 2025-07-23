'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import Logo from "@/components/Logo"

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [tokens, setTokens] = useState<{access_token: string, refresh_token: string} | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Extract tokens from URL fragments (Supabase sends them as URL fragments)
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (accessToken && refreshToken) {
        setTokens({ access_token: accessToken, refresh_token: refreshToken })
      } else {
        setError('Invalid reset link. Please request a new password reset.')
      }
    } else {
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate passwords
    if (password.length < 8) {
      setError('Hasło musi mieć co najmniej 8 znaków')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Hasła nie są identyczne')
      setLoading(false)
      return
    }

    if (!tokens) {
      setError('Invalid reset tokens. Please request a new password reset.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/reset-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(data.error || 'Wystąpił błąd podczas resetowania hasła')
      }
    } catch (err) {
      console.error('Password reset error:', err)
      setError('Wystąpił błąd podczas resetowania hasła')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-center mb-4">
              <Link href="/">
                <Logo width={120} height={32} />
              </Link>
            </div>
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-center text-[var(--smakowalo-green-dark)]">
              Hasło zostało zmienione!
            </CardTitle>
            <CardDescription className="text-center">
              Możesz teraz zalogować się używając nowego hasła
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Zostaniesz przekierowany do strony logowania za 3 sekundy...
              </p>
            </div>

            <div className="space-y-3">
              <Link href="/login">
                <Button className="w-full bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)] text-white">
                  Przejdź do logowania
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !tokens) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-center mb-4">
              <Link href="/">
                <Logo width={120} height={32} />
              </Link>
            </div>
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-center text-[var(--smakowalo-green-dark)]">
              Nieprawidłowy link
            </CardTitle>
            <CardDescription className="text-center">
              Link do resetowania hasła jest nieprawidłowy lub wygasł
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>

            <div className="space-y-3">
              <Link href="/forgot-password">
                <Button className="w-full bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)] text-white">
                  Wyślij nowy link resetowania
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Powrót do logowania
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="text-center mb-4">
            <Link href="/">
              <Logo width={120} height={32} />
            </Link>
          </div>
          <CardTitle className="text-2xl text-center text-[var(--smakowalo-green-dark)]">
            Ustaw nowe hasło
          </CardTitle>
          <CardDescription className="text-center">
            Wprowadź nowe hasło dla swojego konta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="password">Nowe hasło</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Wprowadź nowe hasło (min. 8 znaków)"
                  className="border-[var(--smakowalo-green-light)] focus:border-[var(--smakowalo-green-primary)] pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Potwierdź nowe hasło"
                className="border-[var(--smakowalo-green-light)] focus:border-[var(--smakowalo-green-primary)]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={8}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)] text-white"
              disabled={loading || !password || !confirmPassword || !tokens}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Zapisywanie...</span>
                </div>
              ) : (
                'Zmień hasło'
              )}
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground">
            <p>
              Pamiętasz hasło?{" "}
              <Link href="/login" className="text-[var(--smakowalo-green-primary)] hover:underline">
                Zaloguj się
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--smakowalo-green-primary)] border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Ładowanie...</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
