'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CheckCircle,
  Package,
  Mail,
  Calendar,
  ArrowRight,
  Home,
  User
} from "lucide-react"
import Link from "next/link"
import Logo from '@/components/Logo'

export default function PaymentSuccessPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderDetails, setOrderDetails] = useState<any>(null)

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!session) {
      router.push('/login?callbackUrl=/payment-success')
      return
    }

    // Get payment intent ID from URL if available
    const paymentIntentId = searchParams?.get('payment_intent')
    if (paymentIntentId) {
      // You could fetch order details here using the payment intent ID
      console.log('Payment Intent ID:', paymentIntentId)
    }
  }, [session, router, searchParams])

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
            <div className="flex items-center space-x-4">
              <Link href="/panel">
                <Button variant="outline" className="border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]">
                  <User className="w-4 h-4 mr-2" />
                  Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--smakowalo-green-dark)] mb-2">
            Płatność zakończona sukcesem!
          </h1>
          <p className="text-lg text-gray-600">
            Dziękujemy za zamówienie. Twoje świeże składniki są już przygotowywane.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Mail className="w-8 h-8 text-[var(--smakowalo-green-primary)] mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Potwierdzenie email</h3>
              <p className="text-sm text-gray-600">
                Wysłaliśmy potwierdzenie zamówienia na Twój adres email
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 text-[var(--smakowalo-green-primary)] mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Przygotowanie</h3>
              <p className="text-sm text-gray-600">
                Nasz zespół już przygotowuje Twoje świeże składniki
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-[var(--smakowalo-green-primary)] mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Dostawa</h3>
              <p className="text-sm text-gray-600">
                Otrzymasz szczegóły dostawy w ciągu 24 godzin
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Co dalej?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-[var(--smakowalo-green-primary)] text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium">Sprawdź email</h4>
                <p className="text-sm text-gray-600">
                  Potwierdzenie zamówienia zostało wysłane na Twój adres email wraz ze szczegółami.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-[var(--smakowalo-green-primary)] text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium">Śledź status zamówienia</h4>
                <p className="text-sm text-gray-600">
                  W panelu klienta możesz śledzić aktualny status przygotowania i dostawy.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-[var(--smakowalo-green-primary)] text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium">Przygotuj się na gotowanie</h4>
                <p className="text-sm text-gray-600">
                  Wraz z dostawą otrzymasz szczegółowe przepisy i instrukcje przygotowania.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/panel">
            <Button className="smakowalo-green">
              <User className="w-4 h-4 mr-2" />
              Przejdź do panelu
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>

          <Link href="/">
            <Button variant="outline" className="border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]">
              <Home className="w-4 h-4 mr-2" />
              Strona główna
            </Button>
          </Link>
        </div>

        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="font-medium text-green-800">Dziękujemy za zaufanie!</p>
              <p className="text-sm text-green-700">
                Jeśli masz pytania, skontaktuj się z nami pod adresem kontakt@smakowalo.pl
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
