'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, Loader2, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Logo from '@/components/Logo'

// ✅ Tworzymy instancję Supabase tylko raz
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, storageKey: 'smakowalo_auth' },
})

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Sprawdzenie sesji
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data?.session) router.replace('/panel')
    }
    checkSession()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError('Nieprawidłowy email lub hasło.')
      console.error(error)
    } else if (data?.session) {
      setSuccess('Zalogowano pomyślnie! Przekierowywanie...')
      setTimeout(() => router.replace('/panel'), 800)
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login` },
    })
    if (error) setError('Błąd podczas logowania przez Google.')
  }

  const handleFacebookLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login` },
    })
    if (error) setError('Błąd podczas logowania przez Facebook.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white">
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <Logo width={120} height={32} />
          </Link>
          <Link href="/">
            <Button variant="outline" className="text-[var(--smakowalo-green-primary)] border-[var(--smakowalo-green-primary)]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Strona główna
            </Button>
          </Link>
        </div>
      </nav>

      <div className="flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full shadow-md">
          <CardHeader>
            <h2 className="text-2xl font-bold text-center text-[var(--smakowalo-green-dark)]">
              Witaj w Smakowało!
            </h2>
            <p className="text-center text-gray-600 mt-1">
              Zaloguj się, aby kontynuować
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="jan@przyklad.pl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Hasło</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full smakowalo-green">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logowanie...
                  </>
                ) : (
                  'Zaloguj się'
                )}
              </Button>
            </form>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <span>lub</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={handleFacebookLogin} className="w-full">
                Facebook
              </Button>
              <Button variant="outline" onClick={handleGoogleLogin} className="w-full">
                Google
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              Tworząc konto, akceptujesz nasze{' '}
              <Link href="/terms" className="underline">
                Warunki użytkowania
              </Link>{' '}
              i{' '}
              <Link href="/privacy" className="underline">
                Politykę prywatności
              </Link>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// 🔧 Poprawka: wrapper z Suspense dla useSearchParams
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-500">Ładowanie...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}
