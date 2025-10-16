'use client'

import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)

    // Here you could send error to monitoring service like Sentry
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { contexts: { errorInfo } })
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-[var(--smakowalo-cream)] flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center shadow-xl">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl text-[var(--smakowalo-green-dark)]">
                Ups! Coś poszło nie tak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Wystąpił nieoczekiwany błąd. Przepraszamy za niedogodności.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-left">
                  <p className="text-sm text-red-800 font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)]"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Odśwież stronę
                </Button>

                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]">
                    <Home className="w-4 h-4 mr-2" />
                    Strona główna
                  </Button>
                </Link>
              </div>

              <div className="text-xs text-gray-500 mt-4">
                Jeśli problem się powtarza, skontaktuj się z nami:{' '}
                <a href="mailto:pomoc@smakowalo.pl" className="text-[var(--smakowalo-green-primary)] hover:underline">
                  pomoc@smakowalo.pl
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Simple error fallback component for specific sections
export function ErrorFallback({
  error,
  resetError,
  message = "Wystąpił błąd podczas ładowania tej sekcji"
}: {
  error?: Error
  resetError?: () => void
  message?: string
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-3" />
      <h3 className="text-lg font-semibold text-red-800 mb-2">Błąd</h3>
      <p className="text-red-700 mb-4">{message}</p>

      {process.env.NODE_ENV === 'development' && error && (
        <div className="bg-red-100 border border-red-300 rounded p-3 mb-4 text-left">
          <code className="text-sm text-red-800">{error.message}</code>
        </div>
      )}

      {resetError && (
        <Button
          onClick={resetError}
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Spróbuj ponownie
        </Button>
      )}
    </div>
  )
}
