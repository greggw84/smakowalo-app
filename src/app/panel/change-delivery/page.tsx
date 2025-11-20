'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Truck, Loader2, Check, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, storageKey: 'smakowalo_auth' },
}) : null

export default function ChangeDeliveryPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [subscription, setSubscription] = useState<any>(null)
  const [deliveryDay, setDeliveryDay] = useState<'tuesday' | 'thursday'>('tuesday')

  useEffect(() => {
    if (!supabase) return

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login?callbackUrl=/panel/change-delivery')
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
      setDeliveryDay(subs.delivery_day || 'tuesday')

    } catch (error) {
      console.error('Error loading subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasChanges = deliveryDay !== subscription?.delivery_day

  const handleSave = async () => {
    if (!hasChanges) {
      alert('Nie wprowadzono żadnych zmian')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase!
        .from('subscriptions')
        .update({
          delivery_day: deliveryDay,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id)

      if (error) throw error

      alert('✅ Dzień dostawy został zmieniony!')
      router.push('/panel')

    } catch (error: any) {
      console.error('Error updating delivery day:', error)
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

  const currentDayName = subscription?.delivery_day === 'tuesday' ? 'Wtorek' : 'Czwartek'
  const newDayName = deliveryDay === 'tuesday' ? 'Wtorek' : 'Czwartek'

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
          Zmień Dzień Dostawy
        </h1>
        <p className="text-gray-600 mb-8">
          Wybierz preferowany dzień tygodnia dla Twoich dostaw
        </p>

        {/* Current vs New */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Obecny Dzień</h3>
              <div className="flex items-center space-x-3">
                <Truck className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="font-bold text-xl">{currentDayName}</p>
                  <p className="text-sm text-gray-600">Dostawa: 8:00 - 21:00</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={hasChanges ? 'ring-2 ring-[var(--smakowalo-green-primary)]' : ''}>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">
                {hasChanges ? 'Nowy Dzień' : 'Bez zmian'}
              </h3>
              <div className="flex items-center space-x-3">
                <Truck className={`w-8 h-8 ${
                  hasChanges ? 'text-[var(--smakowalo-green-primary)]' : 'text-gray-400'
                }`} />
                <div>
                  <p className={`font-bold text-xl ${
                    hasChanges ? 'text-[var(--smakowalo-green-primary)]' : 'text-gray-900'
                  }`}>
                    {newDayName}
                  </p>
                  <p className="text-sm text-gray-600">Dostawa: 8:00 - 21:00</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Day Selection */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h3 className="font-bold text-lg mb-6">Wybierz Dzień Dostawy</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tuesday */}
              <button
                onClick={() => setDeliveryDay('tuesday')}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  deliveryDay === 'tuesday'
                    ? 'bg-[var(--smakowalo-green-primary)] text-white border-[var(--smakowalo-green-primary)] shadow-lg'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--smakowalo-green-primary)]'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Truck className="w-8 h-8" />
                    <h3 className="text-2xl font-bold">Wtorek</h3>
                  </div>
                  {deliveryDay === 'tuesday' && (
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-[var(--smakowalo-green-primary)]" />
                    </div>
                  )}
                </div>
                <p className={deliveryDay === 'tuesday' ? 'text-green-50' : 'text-gray-600'}>
                  Dostawa we wtorek między 8:00 - 21:00
                </p>
              </button>

              {/* Thursday */}
              <button
                onClick={() => setDeliveryDay('thursday')}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  deliveryDay === 'thursday'
                    ? 'bg-[var(--smakowalo-green-primary)] text-white border-[var(--smakowalo-green-primary)] shadow-lg'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--smakowalo-green-primary)]'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Truck className="w-8 h-8" />
                    <h3 className="text-2xl font-bold">Czwartek</h3>
                  </div>
                  {deliveryDay === 'thursday' && (
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-[var(--smakowalo-green-primary)]" />
                    </div>
                  )}
                </div>
                <p className={deliveryDay === 'thursday' ? 'text-green-50' : 'text-gray-600'}>
                  Dostawa w czwartek między 8:00 - 21:00
                </p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-1">Ważne informacje:</p>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li>Zmiana dnia dostawy wejdzie w życie od następnego tygodnia</li>
                <li>Pamiętaj o wyborze dań do niedzieli 23:59</li>
                <li>Dostawa jest zawsze w cenie subskrypcji</li>
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
