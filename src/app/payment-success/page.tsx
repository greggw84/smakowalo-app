'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader } from 'lucide-react'
import Logo from '@/components/Logo'
import Link from 'next/link'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'processing'>('processing')

  const paymentIntentId = searchParams.get('payment_intent')
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret')
  const redirectStatus = searchParams.get('redirect_status')

  useEffect(() => {
    // Check payment status based on redirect_status
    if (redirectStatus === 'succeeded') {
      setPaymentStatus('success')
    } else if (redirectStatus === 'failed') {
      setPaymentStatus('failed')
    }
    setLoading(false)
  }, [redirectStatus])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader className="h-12 w-12 text-[var(--smakowalo-green-primary)] mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">Sprawdzamy status płatności...</h2>
            <p className="text-gray-600">Proszę czekać</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <Logo width={120} height={32} />
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8 text-center">
            {paymentStatus === 'success' ? (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
                  Płatność zakończona sukcesem!
                </h1>
                <p className="text-gray-600 mb-6">
                  Dziękujemy za zakup! Twoje zamówienie zostało przyjęte i wkrótce otrzymasz potwierdzenie na email.
                </p>

                {paymentIntentId && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-gray-600">
                      <strong>ID płatności:</strong> {paymentIntentId}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    onClick={() => window.location.assign('/')}
                    className="w-full smakowalo-green"
                  >
                    Powrót do strony głównej
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.assign('/menu')}
                    className="w-full"
                  >
                    Zamów ponownie
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-red-500 text-2xl">✗</span>
                </div>
                <h1 className="text-2xl font-bold text-red-600 mb-4">
                  Płatność nieudana
                </h1>
                <p className="text-gray-600 mb-6">
                  Wystąpił problem z przetworzeniem płatności. Proszę spróbować ponownie.
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={() => window.location.assign('/checkout')}
                    className="w-full smakowalo-green"
                  >
                    Spróbuj ponownie
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.assign('/')}
                    className="w-full"
                  >
                    Powrót do strony głównej
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <Loader className="h-12 w-12 text-[var(--smakowalo-green-primary)] mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-semibold mb-2">Sprawdzamy status płatności...</h2>
              <p className="text-gray-600">Proszę czekać</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}
