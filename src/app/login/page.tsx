'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Loader2, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { Alert, AlertDescription } from '@/components/ui/alert'

// ✅ Stwórz klienta Supabase raz
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, storageKey: 'smakowalo_auth' },
})

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [session, setSession] = useState<any>(null)

  // ✅ Sprawdzenie czy użytkownik już zalogowany
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data?.session) {
        setSession(data.session)
        router.replace('/panel')
      }
    }
    getSession()
  }, [router])

  // ✅ Odbieranie tokenów z Supabase (redirect z Google/Facebook)
  useEffect(() => {
    const handleAuth = async () => {
      const hashParams = window.location.hash
      if (hashParams.includes('access_token')) {
        const { data, error } = await supabase.auth.getSession()
        if (!error && data?.session) {
          router.replace('/panel')
        }
      }
    }
    handleAuth()
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
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
      },
    })
    if (error) setError('Błąd podczas logowania przez Google.')
  }

  const handleFacebookLogin = async () => {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
      },
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
            <p className="text-center text-gray-600 mt-1">Zaloguj się, aby kontynuować</p>
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
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-3h2v-2c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2v1.8h2.6l-.4 3h-2.2v7A10 10 0 0 0 22 12Z" />
                </svg>
                Facebook
              </Button>
              <Button variant="outline" onClick={handleGoogleLogin} className="w-full">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              Tworząc konto, akceptujesz nasze{' '}
              <Link href="/terms" className="underline">Warunki użytkowania</Link> i{' '}
              <Link href="/privacy" className="underline">Politykę prywatności</Link>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
