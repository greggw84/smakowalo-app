'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, CheckCircle, AlertCircle, Send } from 'lucide-react'
import { trackEvent } from './Analytics'

interface NewsletterSignupProps {
  variant?: 'default' | 'compact' | 'inline'
  title?: string
  description?: string
  className?: string
  placeholder?: string
}

export default function NewsletterSignup({
  variant = 'default',
  title = 'Zapisz się do newslettera',
  description = 'Otrzymuj najnowsze przepisy, promocje i inspiracje kulinarne bezpośrednio na swoją skrzynkę.',
  className = '',
  placeholder = 'Twój adres email'
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setErrorMessage('Proszę podać adres email')
      setStatus('error')
      return
    }

    if (!validateEmail(email)) {
      setErrorMessage('Proszę podać prawidłowy adres email')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      // Here you would integrate with your email service (Mailchimp, ConvertKit, etc.)
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setStatus('success')
        setEmail('')

        // Track newsletter signup
        trackEvent.newsletterSignup(email)
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Wystąpił błąd podczas zapisywania')
      }
    } catch (error) {
      console.error('Newsletter signup error:', error)
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Wystąpił błąd podczas zapisywania')
    }
  }

  // Compact variant for sidebars or small spaces
  if (variant === 'compact') {
    return (
      <div className={`bg-[var(--smakowalo-cream)] rounded-lg p-4 ${className}`}>
        <div className="flex items-center mb-3">
          <Mail className="w-5 h-5 text-[var(--smakowalo-green-primary)] mr-2" />
          <h3 className="font-semibold text-[var(--smakowalo-green-dark)]">Newsletter</h3>
        </div>

        {status === 'success' ? (
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-800">Dziękujemy za zapis!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className="text-sm"
              disabled={status === 'loading'}
            />

            {status === 'error' && (
              <p className="text-red-600 text-xs">{errorMessage}</p>
            )}

            <Button
              type="submit"
              disabled={status === 'loading'}
              size="sm"
              className="w-full bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)]"
            >
              {status === 'loading' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Zapisz się'
              )}
            </Button>
          </form>
        )}
      </div>
    )
  }

  // Inline variant for footer or content sections
  if (variant === 'inline') {
    return (
      <div className={`${className}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-[var(--smakowalo-green-dark)] mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>

          {status === 'success' ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Dziękujemy za zapis!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 min-w-0 flex-shrink-0">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                className="w-64"
                disabled={status === 'loading'}
              />
              <Button
                type="submit"
                disabled={status === 'loading'}
                className="bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)]"
              >
                {status === 'loading' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          )}
        </div>

        {status === 'error' && (
          <div className="flex items-center text-red-600 mt-2">
            <AlertCircle className="w-4 h-4 mr-2" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}
      </div>
    )
  }

  // Default card variant
  return (
    <Card className={`shadow-xl ${className}`}>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-[var(--smakowalo-green-primary)] rounded-full flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-xl text-[var(--smakowalo-green-dark)]">
          {title}
        </CardTitle>
        <p className="text-gray-600">{description}</p>
      </CardHeader>

      <CardContent>
        {status === 'success' ? (
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Dziękujemy za zapis!
            </h3>
            <p className="text-green-700">
              Wkrótce otrzymasz pierwszy newsletter z najlepszymi przepisami.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                disabled={status === 'loading'}
                className={status === 'error' ? 'border-red-500' : ''}
              />
              {status === 'error' && (
                <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)]"
            >
              {status === 'loading' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Zapisywanie...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Zapisz się do newslettera
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Nie wysyłamy spamu. Możesz zrezygnować w każdej chwili.
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
