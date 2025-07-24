'use client'

import { Suspense, useState, useEffect } from 'react'
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
  User
} from "lucide-react"
import Link from "next/link"
import Logo from '@/components/Logo'

function SearchWrapper() {
  const searchParams = useSearchParams()
  return <div>{/* coś tam */}</div>
}

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/panel'

  const [activeTab, setActiveTab] = useState('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push(callbackUrl)
    }
  }, [session, status, router, callbackUrl])

  const handleInputChange = (field: string, value: string) => {
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

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        isSignUp: isSignUp.toString(),
        redirect: false,
      })

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError(isSignUp ? 'Błąd podczas tworzenia konta. Spróbuj ponownie.' : 'Nieprawidłowy email lub hasło')
        } else {
          setError(result.error)
        }
      } else if (result?.ok) {
        if (isSignUp) {
          setSuccess('Konto zostało utworzone! Możesz się teraz zalogować.')
          setActiveTab('signin')
          setFormData(prev => ({ ...prev, firstName: '', lastName: '', confirmPassword: '' }))
        } else {
          router.push(callbackUrl)
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      setError('Wystąpił nieoczekiwany błąd')
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-smakowalo-cream to-white">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--smakowalo-green-primary)]" />
      </div>
    )
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* Możesz tu ewentualnie użyć <SearchWrapper /> */}
      <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white">
        {/* cała reszta interfejsu logowania/rejestracji */}
        {/* ... */}
      </div>
    </Suspense>
  )
}
