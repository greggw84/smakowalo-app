'use client'

import { useState, useEffect } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { getStripe, formatPrice, PAYMENT_METHODS, type PaymentMethod } from '@/lib/stripe'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Shield, Zap } from 'lucide-react'

interface PaymentFormProps {
  amount: number
  orderId?: string
  onSuccess?: (paymentIntentId: string) => void
  onError?: (error: string) => void
}

const PaymentMethodSelector = ({
  selectedMethod,
  onMethodChange
}: {
  selectedMethod: PaymentMethod
  onMethodChange: (method: PaymentMethod) => void
}) => {
  const methods = [
    {
      id: PAYMENT_METHODS.CARD,
      name: 'Karta płatnicza',
      description: 'Visa, Mastercard, American Express',
      icon: CreditCard,
      badge: 'Szybkie'
    },
    {
      id: PAYMENT_METHODS.PRZELEWY24,
      name: 'Przelewy24',
      description: 'Bezpieczne płatności online',
      icon: Shield,
      badge: 'Popularne'
    }
  ]

  return (
    <div className="space-y-3 mb-6">
      <h3 className="text-lg font-semibold">Wybierz metodę płatności</h3>
      <div className="grid gap-3">
        {methods.map((method) => {
          const Icon = method.icon
          return (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all ${
                selectedMethod === method.id
                  ? 'border-[var(--smakowalo-green-primary)] bg-green-50'
                  : 'hover:border-gray-300'
              }`}
              onClick={() => onMethodChange(method.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-6 w-6 text-[var(--smakowalo-green-primary)]" />
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {method.name}
                        <Badge variant="secondary" className="text-xs">
                          {method.badge}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">{method.description}</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedMethod === method.id
                      ? 'border-[var(--smakowalo-green-primary)] bg-[var(--smakowalo-green-primary)]'
                      : 'border-gray-300'
                  }`}>
                    {selectedMethod === method.id && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

const CheckoutForm = ({ amount, orderId, onSuccess, onError }: PaymentFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PAYMENT_METHODS.CARD)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      })

      if (error) {
        onError?.(error.message || 'Wystąpił błąd podczas płatności')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess?.(paymentIntent.id)
      }
    } catch (err) {
      onError?.('Wystąpił nieoczekiwany błąd')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentMethodSelector
        selectedMethod={selectedMethod}
        onMethodChange={setSelectedMethod}
      />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Szczegóły płatności</h3>
        <PaymentElement
          options={{
            layout: 'tabs',
            paymentMethodOrder: selectedMethod === PAYMENT_METHODS.PRZELEWY24
              ? ['p24', 'card']
              : ['card', 'p24']
          }}
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Do zapłaty:</span>
          <span className="text-[var(--smakowalo-green-primary)]">
            {formatPrice(amount)}
          </span>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)] text-white h-12 text-lg"
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            <span>Przetwarzanie...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Zapłać {formatPrice(amount)}</span>
          </div>
        )}
      </Button>

      <div className="text-xs text-gray-500 text-center">
        <Shield className="h-4 w-4 inline mr-1" />
        Twoje dane są bezpieczne i szyfrowane
      </div>
    </form>
  )
}

export default function PaymentForm({ amount, orderId, onSuccess, onError }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    // Create payment intent
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            metadata: {
              orderId: orderId || 'unknown',
            },
          }),
        })

        const data = await response.json()

        if (data.error) {
          setError(data.error)
        } else {
          setClientSecret(data.clientSecret)
        }
      } catch (err) {
        setError('Nie udało się zainicjować płatności')
      } finally {
        setLoading(false)
      }
    }

    createPaymentIntent()
  }, [amount, orderId])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[var(--smakowalo-green-primary)] border-t-transparent" />
            <span>Przygotowujemy płatność...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Spróbuj ponownie
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const stripePromise = getStripe()

  if (!stripePromise || !clientSecret) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-gray-600">
            Płatności są tymczasowo niedostępne
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#1D4940',
            borderRadius: '8px',
          },
        },
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-[var(--smakowalo-green-dark)]">
            Bezpieczna płatność
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CheckoutForm
            amount={amount}
            orderId={orderId}
            onSuccess={onSuccess}
            onError={onError}
          />
        </CardContent>
      </Card>
    </Elements>
  )
}
