import { loadStripe } from '@stripe/stripe-js'
import Stripe from 'stripe'

// Client-side Stripe
export const getStripe = () => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!publishableKey) {
    console.warn('Stripe publishable key not found')
    return null
  }
  return loadStripe(publishableKey)
}

// Server-side Stripe - lazy initialization
export const getServerStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('Stripe secret key not configured')
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-06-30.basil',
  })
}

// Payment methods configuration
export const PAYMENT_METHODS = {
  STRIPE: 'stripe',
  PRZELEWY24: 'przelewy24',
  CARD: 'card'
} as const

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS]

// Stripe payment intent options
export const createPaymentIntentOptions = (
  amount: number,
  currency = 'pln',
  metadata?: Record<string, string>
): Stripe.PaymentIntentCreateParams => ({
  amount: Math.round(amount * 100), // Convert to cents
  currency,
  metadata,
  payment_method_types: ['card', 'p24'], // Include Przelewy24
  automatic_payment_methods: {
    enabled: true,
  },
})

// Format price for display
export const formatPrice = (amount: number, currency = 'PLN'): string => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
  }).format(amount)
}
