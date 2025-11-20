'use client'

import { useState, useEffect, useRef, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Facebook,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
  User,
  Phone
} from "lucide-react"
import Link from "next/link"
import Logo from '@/components/Logo'

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, storageKey: 'smakowalo_auth' },
}) : null

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '+48 ',
    confirmPassword: ''
  })

  // Single-flight OAuth guards
  const oauthInFlightRef = useRef(false)
  const [oauthProviderLoading, setOauthProviderLoading] = useState<'google' | 'facebook' | null>(null)
  const lastOAuthClickRef = useRef(0)

  // Validate callbackUrl to prevent open redirect attacks
  const getValidCallbackUrl = useCallback((): string => {
    const callbackUrl = searchParams?.get('callbackUrl') || '/panel'

    // Only allow relative URLs (starting with /) or URLs from the same origin
    if (callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
      return callbackUrl
    }

    // Check if it's a full URL from the same origin
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
      if (!siteUrl) {
        // In production, NEXT_PUBLIC_SITE_URL must be set
        if (process.env.NODE_ENV === 'production') {
          console.error('CRITICAL: NEXT_PUBLIC_SITE_URL is not set in production')
          return '/panel'
        }
        console.warn('NEXT_PUBLIC_SITE_URL is not set, defaulting to /panel')
        return '/panel'
      }

      const url = new URL(callbackUrl)
      const site = new URL(siteUrl)
      if (url.origin === site.origin) {
        return callbackUrl
      }
    } catch {
      // Invalid URL, fall through to default
    }

    // Default to /panel for any invalid or external URLs
    return '/panel'
  }, [searchParams])

  // Session check with Supabase init delay fix
  useEffect(() => {
    if (!supabase) return

    let cancelled = false

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!cancelled) {
        if (data?.session) {
          const callbackUrl = getValidCallbackUrl()
          router.replace(callbackUrl)
        } else {
          const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session && !cancelled) {
              const callbackUrl = getValidCallbackUrl()
              router.replace(callbackUrl)
            }
          })
          return () => listener.subscription.unsubscribe()
        }
      }
    }

    const timeout = setTimeout(() => checkSession(), 300)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [router, getValidCallbackUrl])

  // Check for verification status and errors
  useEffect(() => {
    const verified = searchParams?.get('verified')
    const reset = searchParams?.get('reset')
    const errorParam = searchParams?.get('error')

    if (verified === 'true') {
      setSuccess('Email został pomyślnie zweryfikowany! Możesz się teraz zalogować.')
      setActiveTab('signin')
    } else if (reset === 'success') {
      setSuccess('Hasło zostało pomyślnie zmienione! Zaloguj się używając nowego hasła.')
      setActiveTab('signin')
    } else if (errorParam) {
      setError('Wystąpił błąd podczas weryfikacji. Spróbuj ponownie.')
    }
  }, [searchParams])

  const handleInputChange = (field: string, value: string) => {
    // Special handling for phone field to always keep "+48 " prefix
    if (field === 'phone') {
      if (!value.startsWith('+48 ')) {
        const numbers = value.replace(/\D/g, '')
        const cleanNumbers = numbers.startsWith('48') ? numbers.slice(2) : numbers
        value = '+48 ' + cleanNumbers
      }
      const numbers = value.slice(4).replace(/\D/g, '').slice(0, 9)
      value = '+48 ' + numbers
    }

    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email i hasło są wymagane')
      return false
    }

    if (activeTab === 'signup') {
      if (!formData.firstName || !formData.lastName) {
        setError('Imię i nazwisko są wymagane')
        return false
      }

      if (!formData.phone || formData.phone === '+48 ') {
        setError('Numer telefonu jest wymagany')
        return false
      }

      const phoneNumbers = formData.phone.slice(4).replace(/\D/g, '')
      if (phoneNumbers.length !== 9) {
        setError('Podaj prawidłowy numer telefonu (9 cyfr)')
        return false
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Hasła nie są identyczne')
        return false
      }

      if (formData.password.length < 6) {
        setError('Hasło musi mieć co najmniej 6 znaków')
        return false
      }
    }

    return true
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) {
      setError('Supabase is not configured')
      return
    }

    if (!validateForm()) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password
    })

    setIsLoading(false)

    if (error) {
      setError('Nieprawidłowy email lub hasło.')
      console.error(error)
    } else if (data?.session) {
      setSuccess('Zalogowano pomyślnie! Przekierowywanie...')
      const callbackUrl = getValidCallbackUrl()
      // Wait a bit for session to persist, then redirect
      setTimeout(() => router.replace(callbackUrl), 300)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) {
      setError('Supabase is not configured')
      return
    }

    if (!validateForm()) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone
        }
      },
    })

    setIsLoading(false)

    if (error) {
      setError(`Rejestracja nie powiodła się: ${error.message}`)
    } else {
      setSuccess('Sprawdź swoją skrzynkę email i potwierdź adres, aby aktywować konto.')
      setActiveTab('signin')
      // Keep email for easy login
      setFormData({
        email: formData.email,
        password: '',
        firstName: '',
        lastName: '',
        phone: '+48 ',
        confirmPassword: ''
      })
    }
  }

  // Check OAuth guard before starting request
  const checkOAuthGuard = (provider: 'google' | 'facebook'): boolean => {
    const now = Date.now()

    if (oauthInFlightRef.current) {
      console.warn(`OAuth request already in flight, ignoring duplicate ${provider} click`)
      return false
    }

    if (now - lastOAuthClickRef.current < 300) {
      console.warn('OAuth click debounced (< 300ms since last click)')
      return false
    }

    lastOAuthClickRef.current = now
    oauthInFlightRef.current = true
    setOauthProviderLoading(provider)
    console.info(`OAuth start: ${provider}`)
    return true
  }

  const handleGoogleLogin = async () => {
    if (!supabase) {
      setError('Supabase is not configured')
      return
    }

    if (!checkOAuthGuard('google')) {
      return
    }

    const callbackUrl = getValidCallbackUrl()
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/login?callbackUrl=${encodeURIComponent(callbackUrl)}`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    })

    if (error) {
      setError('Błąd podczas logowania przez Google.')
      oauthInFlightRef.current = false
      setOauthProviderLoading(null)
    }
  }

  const handleFacebookLogin = async () => {
    if (!supabase) {
      setError('Supabase is not configured')
      return
    }

    if (!checkOAuthGuard('facebook')) {
      return
    }

    const callbackUrl = getValidCallbackUrl()
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/login?callbackUrl=${encodeURIComponent(callbackUrl)}`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: redirectUrl },
    })

    if (error) {
      setError('Błąd podczas logowania przez Facebook.')
      oauthInFlightRef.current = false
      setOauthProviderLoading(null)
    }
  }

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
            <Link href="/">
              <Button variant="outline" className="border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Strona główna
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[var(--smakowalo-green-dark)]">
              Witaj w Smakowało!
            </h2>
            <p className="mt-2 text-gray-600">
              Zaloguj się lub utwórz nowe konto
            </p>
          </div>

          <Card>
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Logowanie</TabsTrigger>
                  <TabsTrigger value="signup">Rejestracja</TabsTrigger>
                </TabsList>
              </Tabs>
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

              {success && (
                <Alert className="mb-4 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="jan@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password">Hasło</Label>
                        <Link
                          href="/forgot-password"
                          className="text-sm text-[var(--smakowalo-green-primary)] hover:underline"
                        >
                          Zapomniałeś hasła?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Wprowadź hasło"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          disabled={isLoading}
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

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full smakowalo-green"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logowanie...
                        </>
                      ) : (
                        <>
                          <User className="mr-2 h-4 w-4" />
                          Zaloguj się
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Imię</Label>
                        <Input
                          id="firstName"
                          placeholder="Jan"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Nazwisko</Label>
                        <Input
                          id="lastName"
                          placeholder="Kowalski"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="jan@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">
                        Telefon <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+48 123 456 789"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          onFocus={(e) => {
                            if (e.target.value === '+48 ' || e.target.value.length <= 4) {
                              setTimeout(() => e.target.setSelectionRange(4, 4), 0)
                            }
                          }}
                          onKeyDown={(e) => {
                            const input = e.target as HTMLInputElement
                            const cursorPos = input.selectionStart || 0
                            if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPos <= 4) {
                              e.preventDefault()
                            }
                          }}
                          disabled={isLoading}
                          className="pl-10"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Format: +48 xxx xxx xxx (9 cyfr)</p>
                    </div>

                    <div>
                      <Label htmlFor="signup-password">Hasło</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Minimum 6 znaków"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          disabled={isLoading}
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
                      <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Powtórz hasło"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full smakowalo-green"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Tworzenie konta...
                        </>
                      ) : (
                        <>
                          <User className="mr-2 h-4 w-4" />
                          Utwórz konto
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* OAuth providers */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Lub kontynuuj z</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleFacebookLogin}
                  disabled={oauthProviderLoading !== null}
                  className="w-full"
                  style={oauthProviderLoading !== null ? { pointerEvents: 'none' } : undefined}
                >
                  {oauthProviderLoading === 'facebook' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Facebook
                    </>
                  ) : (
                    <>
                      <Facebook className="mr-2 h-4 w-4" />
                      Facebook
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={oauthProviderLoading !== null}
                  className="w-full"
                  style={oauthProviderLoading !== null ? { pointerEvents: 'none' } : undefined}
                >
                  {oauthProviderLoading === 'google' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Google
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Google
                    </>
                  )}
                </Button>
              </div>

              {/* OAuth notice */}
              {typeof window !== 'undefined' && window?.location?.hostname?.includes('vercel.app') && (
                <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700 text-xs">
                    <strong>Uwaga:</strong> Facebook i Google OAuth mogą nie działać na domenach testowych.
                    Skonfiguruj własną domenę lub użyj formularza rejestracji.
                  </AlertDescription>
                </Alert>
              )}

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Tworząc konto, akceptujesz nasze{' '}
                  <Link href="/terms" className="underline">
                    Warunki użytkowania
                  </Link>{' '}
                  i{' '}
                  <Link href="/privacy" className="underline">
                    Politykę prywatności
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-smakowalo-cream to-white">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--smakowalo-green-primary)]" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
