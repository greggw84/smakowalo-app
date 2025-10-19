'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2, Eye, EyeOff, Lock } from "lucide-react"
import Link from "next/link"
import Logo from '@/components/Logo'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function ResetPasswordContent() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)

  // Detect Supabase recovery link in hash
  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('type=recovery')) {
      setTokenValid(true)
    } else {
      setError('Nieprawidłowy lub wygasły link resetujący hasło.')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!tokenValid) {
      setError('Brak ważnego tokenu resetowania hasła.')
      return
    }

    if (!password || !confirmPassword) {
      setError('Wszystkie pola są wymagane.')
      return
    }

    if (password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków.')
      return
    }

    if (password !== confirmPassword) {
      setError('Hasła nie są identyczne.')
      return
    }

    setIsLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        console.error('Error updating password:', updateError)
        setError('Nie udało się zmienić hasła: ' + updateError.message)
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/login?reset=success'), 2000)
      }
    } catch (err) {
      console.error('Reset password error:', err)
      setError('Wystąpił nieoczekiwany błąd. Spróbuj ponownie.')
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ SUCCESS VIEW
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-center text-2xl text-[var(--smakowalo-green-dark)]">
              Hasło zostało zmienione!
            </CardTitle>
            <CardDescription className="text-center">
              Przekierowywanie do strony logowania...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Możesz teraz zalogować się używając nowego hasła.
            </p>
            <Link href="/login">
              <Button className="smakowalo-green">
                Przejdź do logowania
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ✅ MAIN FORM
  return (
    <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <Logo width={120} height={32} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-[var(--smakowalo-green-dark)]">
              Ustaw nowe hasło
            </h2>
            <p className="mt-2 text-gray-600">
              Wprowadź swoje nowe hasło poniżej
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Nowe hasło</CardTitle>
              <CardDescription>
                Hasło musi mieć co najmniej 6 znaków
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password">Nowe hasło</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 znaków"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading || !tokenValid}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Powtórz nowe hasło"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading || !tokenValid}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !tokenValid}
                  className="w-full smakowalo-green"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetowanie...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Zmień hasło
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <p className="text-gray-600">
                  Pamiętasz hasło?{' '}
                  <Link href="/login" className="text-[var(--smakowalo-green-primary)] hover:underline font-medium">
                    Zaloguj się
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
