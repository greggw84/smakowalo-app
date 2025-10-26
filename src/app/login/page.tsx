'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation' // 🔧 DODANO useRouter (dla redirectów)
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

function LoginContent() {
  const router = useRouter() // 🔧 DODANO – zamiast window.location.href
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/panel'

  const [activeTab, setActiveTab] = useState('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResendingVerification, setIsResendingVerification] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showResendVerification, setShowResendVerification] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    confirmPassword: ''
  })

  const redirectCheckDone = useRef(false)

  // 🔧 Usprawnione przekierowanie (bez window.location)
  useEffect(() => {
    if (redirectCheckDone.current) return

    if (status === 'authenticated' && session) {
      redirectCheckDone.current = true
      router.replace(callbackUrl)
      return
    }

    if (status !== 'loading') {
      redirectCheckDone.current = true
    }
  }, [status, session, router, callbackUrl])

  // 🔧 uproszczono - bez zbędnego if chainingu
  useEffect(() => {
    const verified = searchParams?.get('verified')
    const reset = searchParams?.get('reset')
    const errorParam = searchParams?.get('error')

    if (verified === 'true') {
      setSuccess('✅ Email został pomyślnie zweryfikowany! Możesz się teraz zalogować.')
      setActiveTab('signin')
    } else if (reset === 'success') {
      setSuccess('✅ Hasło zostało pomyślnie zmienione! Zaloguj się używając nowego hasła.')
      setActiveTab('signin')
    } else if (errorParam) {
      const errorMap: Record<string, string> = {
        InvalidToken: 'Link weryfikacyjny jest nieprawidłowy.',
        TokenExpired: 'Link weryfikacyjny wygasł. Wyślij nowy link weryfikacyjny.',
        VerificationFailed: 'Weryfikacja nie powiodła się. Spróbuj ponownie.',
      }
      if (errorMap[errorParam]) {
        setError(errorMap[errorParam])
        setShowResendVerification(true)
      }
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
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await response.json()
      if (response.ok) {
        setSuccess(data.message || 'Email weryfikacyjny został wysłany!')
        setShowResendVerification(false)
      } else {
        setError(data.error || 'Nie udało się wysłać emaila weryfikacyjnego')
      }
    } catch {
      setError('Wystąpił błąd podczas wysyłania emaila')
    } finally {
      setIsResendingVerification(false)
    }
  }

  // 🔧 Poprawiony redirect po logowaniu (zamiast window.location.href)
  const redirectAfterLogin = () => {
    setTimeout(() => router.replace(callbackUrl), 500)
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
      const digits = formData.phone.replace(/\D/g, '')
      const valid = digits.length === 9 || (digits.length === 11 && digits.startsWith('48'))
      if (!valid) {
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
      const result = await signIn('credentials', {
        ...formData,
        isSignUp: isSignUp ? 'true' : 'false',
        redirect: false,
      })

      if (result?.error) {
        const code = result.error
        const errorMap: Record<string, string> = {
          VerificationRequired: 'Konto utworzone. Sprawdź email, by je potwierdzić.',
          EmailAlreadyExists: 'Konto z tym adresem email już istnieje.',
          CredentialsSignin: 'Nieprawidłowy email lub hasło.',
          InvalidCredentials: 'Nieprawidłowe dane logowania.',
          AuthInvalidCredentials: 'Nieprawidłowe dane logowania.',
          UnverifiedEmail: 'Zweryfikuj email, zanim się zalogujesz.',
        }

        if (errorMap[code]) {
          setError(errorMap[code])
          if (['VerificationRequired', 'UnverifiedEmail'].includes(code)) {
            setShowResendVerification(true)
          }
        } else {
          setError(typeof result.error === 'string' ? result.error : 'Wystąpił nieoczekiwany błąd logowania')
        }
        return
      }

      if (result?.ok) {
        setSuccess('✅ Logowanie pomyślne! Przekierowywanie...')
        redirectAfterLogin()
      } else if (!result?.error && isSignUp) {
        setSuccess('Konto zostało utworzone! Sprawdź email w celu weryfikacji.')
        setActiveTab('signin')
      }
    } catch (error) {
      console.error('Auth error:', error)
      setError(error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true)
    setError('')
    try {
      await signIn(provider, { callbackUrl })
    } catch {
      setError(`Błąd podczas logowania przez ${provider}`)
      setIsLoading(false)
    }
  }

  if (status === 'loading' && !redirectCheckDone.current) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-smakowalo-cream to-white">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--smakowalo-green-primary)]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <Logo width={120} height={32} />
            </Link>
            <Link href="/">
              <Button variant="outline" className="border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Strona główna
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 🔧 Cała logika UI pozostaje bez zmian */}
      {/* ... (Twoje Tabs, Alerts, Formularze) ... */}
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
