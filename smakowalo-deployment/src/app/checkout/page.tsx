'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  Truck,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  ArrowLeft,
  ShoppingCart,
  User,
  Loader2,
  Tag,
  AlertCircle,
  Percent
} from "lucide-react"
import Link from "next/link"
import { useCart } from '@/contexts/CartContext'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CustomerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    postalCode: string
    country: string
  }
}

interface PaymentFormProps {
  customerInfo: CustomerInfo
  discountCode: string
  onPaymentSuccess: () => void
}

function PaymentForm({ customerInfo, discountCode, onPaymentSuccess }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { items, totalPrice, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      // Create payment intent
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          customerInfo,
          discountCode: discountCode || undefined,
        }),
      })

      const { clientSecret, error } = await response.json()

      if (error) {
        setPaymentError(error)
        setIsProcessing(false)
        return
      }

      // Confirm payment
      const cardElement = elements.getElement(CardElement)

      if (!cardElement) {
        setPaymentError('Card element not found')
        setIsProcessing(false)
        return
      }

      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            email: customerInfo.email,
            phone: customerInfo.phone,
            address: {
              line1: customerInfo.address.street,
              city: customerInfo.address.city,
              postal_code: customerInfo.address.postalCode,
              country: customerInfo.address.country,
            },
          },
        },
      })

      if (stripeError) {
        setPaymentError(stripeError.message || 'Payment failed')
        setIsProcessing(false)
      } else {
        // Payment succeeded
        clearCart()
        // Mark that user has completed an order (for discount fraud prevention)
        localStorage.setItem('smakowalo-has-ordered', 'true')
        onPaymentSuccess()
      }
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentError('An unexpected error occurred')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>

      {paymentError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">{paymentError}</p>
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full mt-6 smakowalo-green"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Przetwarzanie płatności...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Zapłać {totalPrice.toFixed(2)} zł
          </>
        )}
      </Button>
    </form>
  )
}

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { items, totalItems, totalPrice, getFirstOrderDiscount, isFirstOrder } = useCart()

  const [step, setStep] = useState(1)
  const [discountCode, setDiscountCode] = useState('')
  const [discountError, setDiscountError] = useState('')
  const [discountApplied, setDiscountApplied] = useState(false)
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false)

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Polska'
    }
  })

  // Authentication check
  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login?callbackUrl=/checkout')
      return
    }

    // Pre-fill with session data
    if (session.user) {
      setCustomerInfo(prev => ({
        ...prev,
        email: session.user.email || '',
        firstName: session.user.name?.split(' ')[0] || '',
        lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
      }))
    }
  }, [session, status, router])

  // Check if cart is empty
  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-md mx-auto text-center">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Koszyk jest pusty
            </h1>
            <p className="text-gray-600 mb-6">
              Aby przejść do płatności, najpierw dodaj produkty do koszyka
            </p>
            <div className="space-y-3">
              <Link href="/menu">
                <Button size="lg" className="w-full smakowalo-green">
                  Zobacz menu
                </Button>
              </Link>
              <Link href="/kreator">
                <Button variant="outline" size="lg" className="w-full">
                  Stwórz plan posiłków
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const firstOrderDiscount = isFirstOrder ? subtotal * getFirstOrderDiscount() : 0
  const finalTotal = subtotal - firstOrderDiscount

  const handleCustomerInfoChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setCustomerInfo(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof CustomerInfo],
          [child]: value
        }
      }))
    } else {
      setCustomerInfo(prev => ({ ...prev, [field]: value }))
    }
  }

  const validateDiscountCode = async () => {
    if (!discountCode.trim()) return

    setIsValidatingDiscount(true)
    setDiscountError('')

    try {
      const response = await fetch('/api/validate-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode, subtotal })
      })

      const result = await response.json()

      if (result.valid) {
        setDiscountApplied(true)
        setDiscountError('')
      } else {
        setDiscountError(result.message || 'Nieprawidłowy kod rabatowy')
      }
    } catch (error) {
      setDiscountError('Błąd podczas sprawdzania kodu rabatowego')
    } finally {
      setIsValidatingDiscount(false)
    }
  }

  const renderCustomerInfoForm = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Dane do dostawy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Imię</Label>
            <Input
              id="firstName"
              value={customerInfo.firstName}
              onChange={(e) => handleCustomerInfoChange('firstName', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Nazwisko</Label>
            <Input
              id="lastName"
              value={customerInfo.lastName}
              onChange={(e) => handleCustomerInfoChange('lastName', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={customerInfo.email}
              onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              type="tel"
              value={customerInfo.phone}
              onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Adres dostawy</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="street">Ulica i numer</Label>
            <Input
              id="street"
              value={customerInfo.address.street}
              onChange={(e) => handleCustomerInfoChange('address.street', e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Miasto</Label>
              <Input
                id="city"
                value={customerInfo.address.city}
                onChange={(e) => handleCustomerInfoChange('address.city', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Kod pocztowy</Label>
              <Input
                id="postalCode"
                value={customerInfo.address.postalCode}
                onChange={(e) => handleCustomerInfoChange('address.postalCode', e.target.value)}
                required
              />
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={() => setStep(2)}
        className="w-full smakowalo-green"
        size="lg"
        disabled={!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email || !customerInfo.phone || !customerInfo.address.street || !customerInfo.address.city || !customerInfo.address.postalCode}
      >
        Przejdź do płatności
        <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
      </Button>
    </div>
  )

  const renderPaymentForm = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Płatność</h2>

        {/* Discount Code Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Tag className="w-5 h-5 mr-2" />
            Kod rabatowy
          </h3>
          <div className="flex space-x-2">
            <Input
              placeholder="Wprowadź kod rabatowy"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              disabled={discountApplied}
            />
            <Button
              type="button"
              variant="outline"
              onClick={validateDiscountCode}
              disabled={isValidatingDiscount || discountApplied || !discountCode.trim()}
            >
              {isValidatingDiscount ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : discountApplied ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                'Sprawdź'
              )}
            </Button>
          </div>
          {discountError && (
            <p className="text-red-600 text-sm mt-2">{discountError}</p>
          )}
          {discountApplied && (
            <p className="text-green-600 text-sm mt-2 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Kod rabatowy został zastosowany
            </p>
          )}
        </div>

        <Elements stripe={stripePromise}>
          <PaymentForm
            customerInfo={customerInfo}
            discountCode={discountCode}
            onPaymentSuccess={() => router.push('/payment-success')}
          />
        </Elements>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => setStep(1)}
        className="w-full"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Wróć do danych
      </Button>
    </div>
  )

  const renderOrderSummary = () => (
    <Card>
      <CardHeader>
        <CardTitle>Podsumowanie zamówienia</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium">{item.name}</h4>
                {item.selectedMeals && item.selectedMeals.length > 0 && (
                  <div className="mt-1">
                    <p className="text-sm text-gray-600">Wybrane dania:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {item.selectedMeals.map((meal, idx) => (
                        <li key={idx}>{meal}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {item.dietPreferences && item.dietPreferences.length > 0 && (
                  <div className="mt-1">
                    <p className="text-sm text-gray-600">Preferencje dietetyczne:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.dietPreferences.map((pref, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {pref}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-sm text-gray-600">Ilość: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{(item.price * item.quantity).toFixed(2)} zł</p>
              </div>
            </div>
          ))}

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Suma częściowa:</span>
              <span>{subtotal.toFixed(2)} zł</span>
            </div>

            {isFirstOrder && (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center">
                  <Percent className="w-4 h-4 mr-1" />
                  Zniżka dla nowych klientów (25%):
                </span>
                <span>-{firstOrderDiscount.toFixed(2)} zł</span>
              </div>
            )}

            {discountApplied && (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  Kod rabatowy ({discountCode}):
                </span>
                <span>-0.00 zł</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>Łącznie:</span>
              <span>{finalTotal.toFixed(2)} zł</span>
            </div>
          </div>

          {isFirstOrder && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-800 text-sm">
                  Jako nowy klient otrzymujesz 25% zniżki na pierwsze zamówienie!
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
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
              <Link href="/" className="text-xl font-bold text-[var(--smakowalo-green-dark)]">
                Smakowało
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center text-[var(--smakowalo-green-primary)] hover:underline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót do koszyka
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  {step === 1 ? 'Dane do dostawy' : 'Płatność'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {step === 1 ? renderCustomerInfoForm() : renderPaymentForm()}
              </CardContent>
            </Card>
          </div>

          <div>
            {renderOrderSummary()}
          </div>
        </div>
      </div>
    </div>
  )
}
