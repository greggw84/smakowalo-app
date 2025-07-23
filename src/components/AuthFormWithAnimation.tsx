'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Facebook, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Logo from "@/components/Logo"
import { signIn } from 'next-auth/react'
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

type AuthMode = 'login' | 'register'

interface AuthFormProps {
  initialMode?: AuthMode
}

export default function AuthFormWithAnimation({ initialMode = 'login' }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [isAnimating, setIsAnimating] = useState(false)

  // Login state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  // Register state
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false,
    newsletter: false
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { signUp } = useAuth()
  const router = useRouter()

  const switchMode = (newMode: AuthMode) => {
    if (newMode === mode) return

    setIsAnimating(true)
    setTimeout(() => {
      setMode(newMode)
      setError('')
      setSuccess('')
      setTimeout(() => {
        setIsAnimating(false)
      }, 100)
    }, 250)
  }

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setRegisterData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: loginData.email,
        password: loginData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Nieprawidłowy email lub hasło')
      } else {
        router.push('/panel')
      }
    } catch (err) {
      setError('Wystąpił błąd podczas logowania')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      setError('Hasła nie są zgodne')
      setLoading(false)
      return
    }

    if (registerData.password.length < 8) {
      setError('Hasło musi mieć minimum 8 znaków')
      setLoading(false)
      return
    }

    if (!registerData.terms) {
      setError('Musisz zaakceptować regulamin')
      setLoading(false)
      return
    }

    try {
      await signUp(registerData.email, registerData.password, {
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        phone: registerData.phone,
        newsletter: registerData.newsletter
      })

      setSuccess('Konto zostało utworzone! Sprawdź swoją skrzynkę email aby potwierdzić konto.')
      setTimeout(() => {
        switchMode('login')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas rejestracji')
    } finally {
      setLoading(false)
    }
  }

  const handleFacebookLogin = async () => {
    setLoading(true)
    try {
      await signIn('facebook', {
        callbackUrl: '/panel',
        redirect: true
      })
    } catch (error) {
      setError('Wystąpił błąd podczas logowania przez Facebook')
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await signIn('google', {
        callbackUrl: '/panel',
        redirect: true
      })
    } catch (error) {
      setError('Wystąpił błąd podczas logowania przez Google')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden">
          <Card
            className={`transition-all duration-500 ease-in-out transform ${
              isAnimating ? 'translate-x-8 opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'
            }`}
          >
            <CardHeader className="space-y-1">
              <div className="text-center mb-4">
                <Link href="/">
                  <Logo width={120} height={32} />
                </Link>
              </div>
              <CardTitle className="text-2xl text-center text-[var(--smakowalo-green-dark)]">
                {mode === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
              </CardTitle>
              <CardDescription className="text-center">
                {mode === 'login'
                  ? 'Zaloguj się do swojego konta, aby kontynuować'
                  : 'Dołącz do tysięcy zadowolonych klientów'
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error/Success Messages */}
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded">
                  {success}
                </div>
              )}

              {/* Social Login Buttons */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                  type="button"
                  disabled={loading}
                  onClick={handleFacebookLogin}
                >
                  <Facebook className="mr-2 h-4 w-4" />
                  {mode === 'login' ? 'Zaloguj przez Facebook' : 'Zarejestruj się przez Facebook'}
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-red-600 text-red-600 hover:bg-red-50"
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleLogin}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {mode === 'login' ? 'Zaloguj przez Google' : 'Zarejestruj się przez Google'}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    {mode === 'login' ? 'Lub zaloguj się emailem' : 'Lub zarejestruj się emailem'}
                  </span>
                </div>
              </div>

              {/* Login Form */}
              {mode === 'login' && (
                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="twoj.email@przykład.pl"
                      className="border-[var(--smakowalo-green-light)] focus:border-[var(--smakowalo-green-primary)]"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Hasło</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      className="border-[var(--smakowalo-green-light)] focus:border-[var(--smakowalo-green-primary)]"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        className="rounded border-[var(--smakowalo-green-light)]"
                        checked={loginData.rememberMe}
                        onChange={handleLoginChange}
                        disabled={loading}
                      />
                      <span>Zapamiętaj mnie</span>
                    </label>
                    <Link href="/forgot-password" className="text-sm text-[var(--smakowalo-green-primary)] hover:underline">
                      Zapomniałeś hasła?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)] text-white"
                    disabled={loading}
                  >
                    {loading ? 'Logowanie...' : 'Zaloguj się'}
                  </Button>
                </form>
              )}

              {/* Register Form */}
              {mode === 'register' && (
                <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Imię</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="Jan"
                        value={registerData.firstName}
                        onChange={handleRegisterChange}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nazwisko</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Kowalski"
                        value={registerData.lastName}
                        onChange={handleRegisterChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="twoj@email.com"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+48 123 456 789"
                      value={registerData.phone}
                      onChange={handleRegisterChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Hasło</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Minimum 8 znaków"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Powtórz hasło"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      name="terms"
                      className="rounded border-gray-300 mt-1"
                      checked={registerData.terms}
                      onChange={handleRegisterChange}
                      required
                      disabled={loading}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      Akceptuję{" "}
                      <Link href="/regulamin" className="text-[var(--smakowalo-green-primary)] hover:underline">
                        Regulamin
                      </Link>{" "}
                      i{" "}
                      <Link href="/polityka-prywatnosci" className="text-[var(--smakowalo-green-primary)] hover:underline">
                        Politykę Prywatności
                      </Link>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="newsletter"
                      name="newsletter"
                      className="rounded border-gray-300 mt-1"
                      checked={registerData.newsletter}
                      onChange={handleRegisterChange}
                      disabled={loading}
                    />
                    <Label htmlFor="newsletter" className="text-sm">
                      Chcę otrzymywać newsletter z nowościami i ofertami specjalnymi
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full smakowalo-green"
                    disabled={loading}
                  >
                    {loading ? 'Tworzenie konta...' : 'Utwórz konto'}
                  </Button>
                </form>
              )}

              {/* Switch Mode */}
              <div className="text-center text-sm">
                <span className="text-gray-600">
                  {mode === 'login' ? 'Nie masz jeszcze konta?' : 'Masz już konto?'}{' '}
                </span>
                <button
                  type="button"
                  onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                  className="text-[var(--smakowalo-green-primary)] hover:underline font-medium transition-colors"
                  disabled={loading}
                >
                  {mode === 'login' ? 'Zarejestruj się' : 'Zaloguj się'}
                </button>
              </div>

              <div className="text-center">
                <Link
                  href="/"
                  className="text-sm text-gray-600 hover:text-[var(--smakowalo-green-primary)] flex items-center justify-center transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Powrót do strony głównej
                </Link>
              </div>

              {/* Terms */}
              {mode === 'login' && (
                <div className="text-center text-xs text-muted-foreground">
                  <p>
                    Logując się, akceptujesz nasze{" "}
                    <Link href="/regulamin" className="text-[var(--smakowalo-green-primary)] hover:underline">
                      Warunki użytkowania
                    </Link>{" "}
                    i{" "}
                    <Link href="/polityka-prywatnosci" className="text-[var(--smakowalo-green-primary)] hover:underline">
                      Politykę prywatności
                    </Link>
                    .
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
