'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Users, UtensilsCrossed, Loader2, AlertCircle, Check } from "lucide-react"
import Link from "next/link"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, storageKey: 'smakowalo_auth' },
}) : null

// Pricing table (same as kreator)
const PRICING: Record<string, number> = {
  '2-2': 180, '2-3': 270, '2-4': 360, '2-5': 449,
  '3-2': 270, '3-3': 405, '3-4': 540, '3-5': 675,
  '4-2': 360, '4-3': 540, '4-4': 720, '4-5': 900,
}

const PRICE_IDS: Record<string, string> = {
  '2-2': process.env.NEXT_PUBLIC_STRIPE_PRICE_2_2 || '',
  '2-3': process.env.NEXT_PUBLIC_STRIPE_PRICE_2_3 || '',
  '2-4': process.env.NEXT_PUBLIC_STRIPE_PRICE_2_4 || '',
  '2-5': process.env.NEXT_PUBLIC_STRIPE_PRICE_2_5 || '',
  '3-2': process.env.NEXT_PUBLIC_STRIPE_PRICE_3_2 || '',
  '3-3': process.env.NEXT_PUBLIC_STRIPE_PRICE_3_3 || '',
  '3-4': process.env.NEXT_PUBLIC_STRIPE_PRICE_3_4 || '',
  '3-5': process.env.NEXT_PUBLIC_STRIPE_PRICE_3_5 || '',
  '4-2': process.env.NEXT_PUBLIC_STRIPE_PRICE_4_2 || '',
  '4-3': process.env.NEXT_PUBLIC_STRIPE_PRICE_4_3 || '',
  '4-4': process.env.NEXT_PUBLIC_STRIPE_PRICE_4_4 || '',
  '4-5': process.env.NEXT_PUBLIC_STRIPE_PRICE_4_5 || '',
}

export default function ManagePlanPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [subscription, setSubscription] = useState<any>(null)
  const [numberOfPeople, setNumberOfPeople] = useState(2)
  const [numberOfDays, setNumberOfDays] = useState(3)

  useEffect(() => {
    if (!supabase) return

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login?callbackUrl=/panel/manage-plan')
        return
      }
      setSession(session)
      await loadSubscription(session)
    }

    checkSession()
  }, [router])

  const loadSubscription = async (session: any) => {
    try {
      setLoading(true)

      const { data: subs } = await supabase!
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single()

      if (!subs) {
        router.push('/panel')
        return
      }

      setSubscription(subs)
      setNumberOfPeople(subs.people || 2)
      setNumberOfDays(subs.days || 3)

    } catch (error) {
      console.error('Error loading subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentPrice = PRICING[`${numberOfPeople}-${numberOfDays}`] || 0
  const currentPriceId = PRICE_IDS[`${numberOfPeople}-${numberOfDays}`] || ''
  const oldPrice = PRICING[`${subscription?.people}-${subscription?.days}`] || 0
  const hasChanges = numberOfPeople !== subscription?.people || numberOfDays !== subscription?.days

  const handleSave = async () => {
    if (!hasChanges) {
      alert('Nie wprowadzono żadnych zmian')
      return
    }

    setSaving(true)
    try {
      // Update in database
      const { error: updateError } = await supabase!
        .from('subscriptions')
        .update({
          people: numberOfPeople,
          days: numberOfDays,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id)

      if (updateError) throw updateError

      // Update Stripe subscription if exists
      if (subscription.stripe_subscription_id && currentPriceId) {
        const response = await fetch('/api/subscription/update-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            subscription_id: subscription.id,
            stripe_subscription_id: subscription.stripe_subscription_id,
            new_price_id: currentPriceId,
            people: numberOfPeople,
            days: numberOfDays
          })
        })

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Błąd aktualizacji w Stripe')
        }
      }

      alert('✅ Plan został zaktualizowany!')
      router.push('/panel')

    } catch (error: any) {
      console.error('Error updating plan:', error)
      alert(`❌ Błąd: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--smakowalo-green-primary)]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/panel">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Wróć do panelu
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Zmień Plan Subskrypcji
        </h1>
        <p className="text-gray-600 mb-8">
          Dostosuj liczbę osób i posiłków do swoich potrzeb
        </p>

        {/* Current vs New Plan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Obecny Plan</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Liczba osób:</span>
                  <span className="font-bold">{subscription?.people}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Posiłków tygodniowo:</span>
                  <span className="font-bold">{subscription?.days}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-gray-600">Cena:</span>
                  <span className="text-xl font-bold text-gray-900">{oldPrice} zł</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={hasChanges ? 'ring-2 ring-[var(--smakowalo-green-primary)]' : ''}>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">
                {hasChanges ? 'Nowy Plan' : 'Bez zmian'}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Liczba osób:</span>
                  <span className="font-bold">{numberOfPeople}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Posiłków tygodniowo:</span>
                  <span className="font-bold">{numberOfDays}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-gray-600">Cena:</span>
                  <span className={`text-xl font-bold ${
                    hasChanges ? 'text-[var(--smakowalo-green-primary)]' : 'text-gray-900'
                  }`}>
                    {currentPrice} zł
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Selection */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-6">Wybierz Nowy Plan</h3>

            <div className="space-y-6">
              <div>
                <label className="block font-bold text-gray-900 mb-3">
                  <Users className="w-5 h-5 inline mr-2" />
                  Liczba osób
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[2, 3, 4].map((num) => (
                    <button
                      key={num}
                      className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                        numberOfPeople === num
                          ? 'bg-[var(--smakowalo-green-primary)] text-white border-[var(--smakowalo-green-primary)]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--smakowalo-green-primary)]'
                      }`}
                      onClick={() => setNumberOfPeople(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-900 mb-3">
                  <UtensilsCrossed className="w-5 h-5 inline mr-2" />
                  Posiłków tygodniowo
                </label>
                <div className="grid grid-cols-4 gap-4">
                  {[2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                        numberOfDays === num
                          ? 'bg-[var(--smakowalo-green-primary)] text-white border-[var(--smakowalo-green-primary)]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--smakowalo-green-primary)]'
                      }`}
                      onClick={() => setNumberOfDays(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-1">Ważne informacje:</p>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li>Zmiana planu wejdzie w życie od następnego cyklu rozliczeniowego</li>
                <li>Cena zostanie automatycznie dostosowana w Stripe</li>
                <li>Będziesz musiał wybrać nową liczbę dań zgodną z planem</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <Link href="/panel">
            <Button variant="outline">
              Anuluj
            </Button>
          </Link>

          <Button
            size="lg"
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)]"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Zapisywanie...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Zapisz zmiany
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
