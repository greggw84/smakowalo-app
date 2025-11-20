'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Loader, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError('Brak ID sesji. Skontaktuj się z supportem.')
      setLoading(false)
      return
    }

    // Verify the session and redirect to panel after a short delay
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [sessionId])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Wystąpił błąd</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/panel">
              <Button className="w-full">
                Przejdź do panelu
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-[#4A7C59] mx-auto mb-4" />
          <p className="text-gray-600">Przetwarzanie płatności...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Subskrypcja utworzona pomyślnie! 🎉
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              Co dalej?
            </h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Otrzymasz email z potwierdzeniem subskrypcji</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Masz 7 dni darmowego okresu próbnego</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Pierwsza dostawa nastąpi w wybranym przez Ciebie terminie</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Możesz zarządzać subskrypcją w panelu użytkownika</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              Zarządzanie subskrypcją
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              W panelu użytkownika możesz:
            </p>
            <ul className="space-y-1 text-gray-600 text-sm">
              <li>• Wstrzymać i wznowić subskrypcję</li>
              <li>• Zmienić plan posiłków</li>
              <li>• Anulować subskrypcję</li>
              <li>• Sprawdzić historię płatności</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/panel" className="flex-1">
              <Button className="w-full bg-[#4A7C59] hover:bg-[#3d6849]">
                Przejdź do panelu
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/menu" className="flex-1">
              <Button variant="outline" className="w-full">
                Zobacz menu
              </Button>
            </Link>
          </div>

          <p className="text-center text-sm text-gray-500">
            ID sesji: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{sessionId}</code>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="h-12 w-12 animate-spin text-[#4A7C59]" />
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  )
}
