'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { signIn, getSession, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

function LoginContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/panel'

  const [activeTab, setActiveTab] = useState('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResendingVerification, setIsResendingVerification] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showResendVerification, setShowResendVerification] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    confirmPassword: ''
  })

  const redirectCheckDone = useRef(false)

  // Redirect if already authenticated - ONE TIME CHECK
  useEffect(() => {
    // Only check once
    if (redirectCheckDone.current) {
      return
    }

    console.log('🔄 Login Page - Auth Check:', {
      status,
      hasSession: !!session,
      userEmail: session?.user?.email,
      callbackUrl
    })

    // If authenticated, redirect immediately
    if (status === 'authenticated' && session) {
      console.log('✅ Already authenticated, redirecting to:', callbackUrl)
      redirectCheckDone.current = true
      window.location.href = callbackUrl
      return
    }

    // If not loading anymore, mark check as done
    if (status !== 'loading') {
      redirectCheckDone.current = true
    }
  }, [status, session, callbackUrl])

  // Check for verification status, password reset, and errors
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
    } else if (errorParam === 'InvalidToken') {
      setError('Link weryfikacyjny jest nieprawidłowy.')
      setShowResendVerification(true)
    } else if (errorParam === 'TokenExpired') {
      setError('Link weryfikacyjny wygasł. Wyślij nowy link weryfikacyjny.')
      setShowResendVerification(true)
    } else if (errorParam === 'VerificationFailed') {
      setError('Weryfikacja nie powiodła się. Spróbuj ponownie.')
      setShowResendVerification(true)
    }
  }, [searchParams])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleResendVerification = async () => {
    if (!formData.email) {
      setError('Podaj adres email, aby wysłać ponownie link weryfikacyjny')
      return
    }

    setIsResendingVerification(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || 'Email weryfikacyjny został wysłany!')
        setShowResendVerification(false)
      } else {
        setError(data.error || 'Nie udało się wysłać emaila weryfikacyjnego')
      }
    } catch (error) {
      setError('Wystąpił błąd podczas wysyłania emaila')
    } finally {
      setIsResendingVerification(false)
    }
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

      if (!formData.phone) {
        setError('Numer telefonu jest wymagany')
        return false
      }

      // Validate Polish phone number format
      const phoneRegex = /^(\+48)?[\s-]?(\d{3})[\s-]?(\d{3})[\s-]?(\d{3})$/
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        setError('Podaj prawidłowy numer telefonu (9 cyfr lub +48 xxx xxx xxx)')
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

  const handleCredentialsAuth = async (isSignUp = false) => {
    if (!validateForm()) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isSignUp) {
        // Handle signup separately to prevent automatic sign in
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          isSignUp: 'true',
          redirect: false,
        })

        // For signup, even if result is not ok, it might be successful
        // (we return null to prevent auto sign in)

        // Check if we're in demo mode (Supabase not configured)
        const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL

        if (isDemo) {
          setSuccess('⚠️ DEMO MODE: Konto zostało utworzone (lokalnie). Możesz się teraz zalogować z dowolnym hasłem. Skonfiguruj Supabase dla pełnej funkcjonalności.')
        } else {
          setSuccess('Konto zostało utworzone! Sprawdź swoją skrzynkę email i potwierdź adres, aby dokończyć rejestrację.')
        }

        setActiveTab('signin')
        setFormData({
          email: formData.email, // Keep email for easy login
          password: '',
          firstName: '',
          lastName: '',
          phone: '',
          confirmPassword: ''
        })
      } else {
        // Handle sign in normally
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          isSignUp: 'false',
          redirect: false,
        })

        if (result?.error) {
          if (result.error === 'CredentialsSignin') {
            setError('Nieprawidłowy email lub hasło. Jeśli dopiero się zarejestrowałeś, zweryfikuj swój email przed zalogowaniem.')
            setShowResendVerification(true)
          } else {
            setError(result.error)
          }
        } else if (result?.ok) {
          console.log('✅ Login successful, redirecting immediately...')
          setSuccess('Logowanie pomyślne! Przekierowywanie...')
          // Force immediate redirect with window.location to ensure session cookies are loaded
          setTimeout(() => {
            window.location.href = callbackUrl
          }, 500)
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      // Show more detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true)
    setError('')

    try {
      await signIn(provider, { callbackUrl })
    } catch (error) {
      console.error('OAuth error:', error)
      setError(`Błąd podczas logowania przez ${provider}`)
      setIsLoading(false)
    }
  }

  // Show loading spinner while checking session (briefly)
  if (status === 'loading' && !redirectCheckDone.current) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-smakowalo-cream to-white">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--smakowalo-green-primary)]" />
      </div>
    )
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
                    {showResendVerification && (
                      <div className="mt-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleResendVerification}
                          disabled={isResendingVerification}
                          className="w-full sm:w-auto"
                        >
                          {isResendingVerification ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Wysyłanie...
                            </>
                          ) : (
                            <>
                              <Mail className="mr-2 h-4 w-4" />
                              Wyślij ponownie link weryfikacyjny
                            </>
                          )}
                        </Button>
                      </div>
                    )}
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
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="jan@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={isLoading}
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
                      onClick={() => handleCredentialsAuth(false)}
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
                  </div>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Imię</Label>
                        <Input
                          id="firstName"
                          placeholder="Jan"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          disabled={isLoading}
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
                          disabled={isLoading}
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Format: +48 xxx xxx xxx lub 9 cyfr</p>
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
                      />
                    </div>

                    <Button
                      onClick={() => handleCredentialsAuth(true)}
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
                  </div>
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
                  onClick={() => handleOAuthSignIn('facebook')}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Facebook className="mr-2 h-4 w-4" />
                  Facebook
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={isLoading}
                  className="w-full"
                >
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
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
