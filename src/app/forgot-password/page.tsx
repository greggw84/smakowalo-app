'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"
import Link from "next/link"
import Logo from "@/components/Logo"
import { createSupabaseComponentClient } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const supabase = createSupabaseComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setSent(true)
      } else {
        setError(data.error || 'Wystąpił błąd podczas wysyłania emaila')
      }
    } catch (err) {
      console.error('Password reset error:', err)
      setError('Wystąpił błąd podczas wysyłania emaila')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
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
              Email wysłany!
            </CardTitle>
            <CardDescription className="text-center">
              Sprawdź swoją skrzynkę odbiorczą
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Wysłaliśmy instrukcje resetowania hasła na adres:
              </p>
              <p className="font-semibold text-[var(--smakowalo-green-primary)]">
                {email}
              </p>
              <p className="text-xs text-gray-500">
                Jeśli nie widzisz emaila, sprawdź folder spam
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => setSent(false)}
                variant="outline"
                className="w-full"
              >
                Wyślij ponownie
              </Button>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="w-full text-[var(--smakowalo-green-primary)]"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
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
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-center text-[var(--smakowalo-green-dark)]">
            Zapomniałeś hasła?
          </CardTitle>
          <CardDescription className="text-center">
            Nie martw się! Wyślemy Ci instrukcje resetowania
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
              <Label htmlFor="email">Adres email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="twoj.email@przyklad.pl"
                className="border-[var(--smakowalo-green-light)] focus:border-[var(--smakowalo-green-primary)]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)] text-white"
              disabled={loading || !email}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Wysyłanie...</span>
                </div>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Wyślij instrukcje
                </>
              )}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Pamiętasz hasło?
            </p>
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-[var(--smakowalo-green-primary)] hover:underline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Powrót do logowania
              </Button>
            </Link>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>
              Nie masz jeszcze konta?{" "}
              <Link href="/register" className="text-[var(--smakowalo-green-primary)] hover:underline">
                Zarejestruj się
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
