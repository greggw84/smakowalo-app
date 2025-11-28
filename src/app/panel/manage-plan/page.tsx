'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, UtensilsCrossed, Loader2, AlertCircle, Check, Heart, AlertTriangle } from "lucide-react"
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

// Diet types - same as kreator
const dietTypes = [
  { id: 1, name: "Wysokobiałkowa", description: "Zwiększona zawartość białka", code: "wysokobiałkowa", icon: "💪" },
  { id: 2, name: "Niskokaloryczna", description: "Dania o niskiej kaloryczności", code: "niskokaloryczna", icon: "⚖️" },
  { id: 3, name: "Keto", description: "Niska zawartość węglowodanów", code: "keto", icon: "🥑" },
  { id: 4, name: "Wegetariańska", description: "Bez mięsa, z nabiałem", code: "wegetariańska", icon: "🌱" },
  { id: 5, name: "Wegańska", description: "Bez produktów odzwierzęcych", code: "wegańska", icon: "🌿" },
  { id: 6, name: "Niskowęglowodanowa", description: "Ograniczone węglowodany", code: "niskowęglowodanowa", icon: "🧀" },
  { id: 7, name: "Pescetariańska", description: "Z rybami i owocami morza", code: "pescetariańska", icon: "🐟" },
  { id: 8, name: "Elastyczna", description: "Różnorodne opcje", code: "elastyczna", icon: "🍽️" },
]

// Allergy options - same as kreator
const allergyOptions = [
  { id: 'gluten', name: 'Gluten' },
  { id: 'mleko', name: 'Mleko/Laktoza' },
  { id: 'orzechy', name: 'Orzechy' },
  { id: 'soja', name: 'Soja' },
  { id: 'jaja', name: 'Jaja' },
  { id: 'ryby', name: 'Ryby' },
  { id: 'skorupiaki', name: 'Skorupiaki' },
  { id: 'sezam', name: 'Sezam' },
]

interface SubscriptionData {
  id: number
  stripe_subscription_id?: string
  people?: number
  days?: number
  diets?: string[]
  allergies?: string[]
  status: string
}

export default function ManagePlanPage() {
  const router = useRouter()
  const [session, setSession] = useState<{ access_token: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPreferences, setSavingPreferences] = useState(false)

  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [numberOfPeople, setNumberOfPeople] = useState(2)
  const [numberOfDays, setNumberOfDays] = useState(3)
  const [selectedDiets, setSelectedDiets] = useState<string[]>([])
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])

  // Track original values for comparison
  const [originalPeople, setOriginalPeople] = useState(2)
  const [originalDays, setOriginalDays] = useState(3)
  const [originalDiets, setOriginalDiets] = useState<string[]>([])
  const [originalAllergies, setOriginalAllergies] = useState<string[]>([])

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

  const loadSubscription = async (session: { user: { id: string } }) => {
    try {
      setLoading(true)

      const { data: subs } = await supabase!
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .in('status', ['active', 'trialing', 'past_due', 'paused'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!subs) {
        router.push('/panel')
        return
      }

      setSubscription(subs)
      
      // Set current values
      const people = subs.people || 2
      const days = subs.days || 3
      const diets = subs.diets || []
      const allergies = subs.allergies || []

      setNumberOfPeople(people)
      setNumberOfDays(days)
      setSelectedDiets(diets)
      setSelectedAllergies(allergies)

      // Store original values
      setOriginalPeople(people)
      setOriginalDays(days)
      setOriginalDiets(diets)
      setOriginalAllergies(allergies)

    } catch (error) {
      console.error('Error loading subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentPrice = PRICING[`${numberOfPeople}-${numberOfDays}`] || 0
  const currentPriceId = PRICE_IDS[`${numberOfPeople}-${numberOfDays}`] || ''
  const oldPrice = PRICING[`${originalPeople}-${originalDays}`] || 0
  
  // Check if plan (price-affecting) changes were made
  const hasPlanChanges = numberOfPeople !== originalPeople || numberOfDays !== originalDays
  
  // Check if preferences (non-price-affecting) changes were made
  const hasPreferenceChanges = 
    JSON.stringify(selectedDiets.sort()) !== JSON.stringify(originalDiets.sort()) ||
    JSON.stringify(selectedAllergies.sort()) !== JSON.stringify(originalAllergies.sort())
  
  // Any changes at all
  const hasChanges = hasPlanChanges || hasPreferenceChanges

  const handleDietToggle = (dietCode: string) => {
    setSelectedDiets(prev => {
      if (prev.includes(dietCode)) {
        return prev.filter(d => d !== dietCode)
      }
      // Allow max 3 diets
      if (prev.length >= 3) {
        return prev
      }
      return [...prev, dietCode]
    })
  }

  const handleAllergyToggle = (allergyId: string) => {
    setSelectedAllergies(prev => {
      if (prev.includes(allergyId)) {
        return prev.filter(a => a !== allergyId)
      }
      return [...prev, allergyId]
    })
  }

  const handleSave = async () => {
    if (!hasChanges || !subscription) {
      alert('Nie wprowadzono żadnych zmian')
      return
    }

    setSaving(true)
    try {
      // Prepare update data
      const updateData: Record<string, unknown> = {
        diets: selectedDiets,
        allergies: selectedAllergies,
        updated_at: new Date().toISOString()
      }

      // Only update people/days if they changed
      if (hasPlanChanges) {
        updateData.people = numberOfPeople
        updateData.days = numberOfDays
      }

      // Update in database
      const { error: updateError } = await supabase!
        .from('subscriptions')
        .update(updateData)
        .eq('id', subscription.id)

      if (updateError) throw updateError

      // Update Stripe subscription if plan changed and Stripe subscription exists
      if (hasPlanChanges && subscription.stripe_subscription_id && currentPriceId) {
        setSavingPreferences(false) // This is a Stripe update
        const response = await fetch('/api/subscription/update-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            subscription_id: subscription.id,
            stripe_subscription_id: subscription.stripe_subscription_id,
            new_price_id: currentPriceId,
            people: numberOfPeople,
            days: numberOfDays,
            diets: selectedDiets,
            allergies: selectedAllergies
          })
        })

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Błąd aktualizacji w Stripe')
        }
      }

      alert('✅ Preferencje zostały zaktualizowane!')
      router.push('/panel')

    } catch (error: unknown) {
      console.error('Error updating plan:', error)
      const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd'
      alert(`❌ Błąd: ${errorMessage}`)
    } finally {
      setSaving(false)
      setSavingPreferences(false)
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
          Edytuj Preferencje Subskrypcji
        </h1>
        <p className="text-gray-600 mb-8">
          Dostosuj plan, preferencje dietetyczne i alergeny
        </p>

        {/* Current vs New Plan Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Obecne ustawienia</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Liczba osób:</span>
                  <span className="font-bold">{originalPeople}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Posiłków tygodniowo:</span>
                  <span className="font-bold">{originalDays}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-gray-600">Cena:</span>
                  <span className="text-xl font-bold text-gray-900">{oldPrice} zł/tydzień</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={hasChanges ? 'ring-2 ring-[var(--smakowalo-green-primary)]' : ''}>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">
                {hasChanges ? 'Nowe ustawienia' : 'Bez zmian'}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Liczba osób:</span>
                  <span className={`font-bold ${numberOfPeople !== originalPeople ? 'text-[var(--smakowalo-green-primary)]' : ''}`}>
                    {numberOfPeople}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Posiłków tygodniowo:</span>
                  <span className={`font-bold ${numberOfDays !== originalDays ? 'text-[var(--smakowalo-green-primary)]' : ''}`}>
                    {numberOfDays}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-gray-600">Cena:</span>
                  <span className={`text-xl font-bold ${
                    hasPlanChanges ? 'text-[var(--smakowalo-green-primary)]' : 'text-gray-900'
                  }`}>
                    {currentPrice} zł/tydzień
                  </span>
                </div>
                {hasPlanChanges && currentPrice !== oldPrice && (
                  <div className="text-sm text-gray-500">
                    {currentPrice > oldPrice 
                      ? `+${(currentPrice - oldPrice).toFixed(0)} zł/tydzień` 
                      : `-${(oldPrice - currentPrice).toFixed(0)} zł/tydzień`}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Selection */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-6">Rozmiar pudełka</h3>

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
                      type="button"
                      className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                        numberOfPeople === num
                          ? 'bg-[var(--smakowalo-green-primary)] text-white border-[var(--smakowalo-green-primary)]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--smakowalo-green-primary)]'
                      }`}
                      onClick={() => setNumberOfPeople(num)}
                    >
                      {num} {num === 1 ? 'osoba' : num < 5 ? 'osoby' : 'osób'}
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
                      type="button"
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

        {/* Diet Preferences */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-2">
              <Heart className="w-5 h-5 inline mr-2" />
              Preferencje dietetyczne
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Wybierz do 3 typów diet. Pomożemy dopasować menu do Twoich preferencji.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {dietTypes.map((diet) => {
                const isSelected = selectedDiets.includes(diet.code)
                const isDisabled = !isSelected && selectedDiets.length >= 3

                return (
                  <button
                    key={diet.id}
                    type="button"
                    onClick={() => handleDietToggle(diet.code)}
                    disabled={isDisabled}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? 'bg-green-50 border-[var(--smakowalo-green-primary)] ring-1 ring-[var(--smakowalo-green-primary)]'
                        : isDisabled
                          ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                          : 'bg-white border-gray-200 hover:border-[var(--smakowalo-green-primary)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-2xl">{diet.icon}</span>
                      {isSelected && (
                        <div className="w-5 h-5 bg-[var(--smakowalo-green-primary)] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">{diet.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{diet.description}</p>
                  </button>
                )
              })}
            </div>

            {selectedDiets.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Wybrane:</span>
                {selectedDiets.map(code => {
                  const diet = dietTypes.find(d => d.code === code)
                  return diet ? (
                    <Badge key={code} variant="secondary" className="bg-green-100 text-green-800">
                      {diet.icon} {diet.name}
                    </Badge>
                  ) : null
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Allergies */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-2">
              <AlertTriangle className="w-5 h-5 inline mr-2" />
              Alergeny i nietolerancje
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Zaznacz składniki, których chcesz unikać. Będziemy filtrować dla Ciebie przepisy.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {allergyOptions.map((allergy) => {
                const isSelected = selectedAllergies.includes(allergy.id)

                return (
                  <label
                    key={allergy.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-orange-50 border-orange-400'
                        : 'bg-white border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleAllergyToggle(allergy.id)}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                    />
                    <span className={`text-sm font-medium ${isSelected ? 'text-orange-800' : 'text-gray-700'}`}>
                      {allergy.name}
                    </span>
                  </label>
                )
              })}
            </div>

            {selectedAllergies.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Unikane składniki:</span>
                {selectedAllergies.map(id => {
                  const allergy = allergyOptions.find(a => a.id === id)
                  return allergy ? (
                    <Badge key={id} variant="secondary" className="bg-orange-100 text-orange-800">
                      {allergy.name}
                    </Badge>
                  ) : null
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-1">Ważne informacje:</p>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li>Zmiana rozmiaru pudełka wejdzie w życie od następnego cyklu rozliczeniowego</li>
                <li>Cena zostanie automatycznie dostosowana</li>
                <li>Preferencje dietetyczne i alergeny będą używane do filtrowania menu</li>
                <li>Po zmianie planu będziesz musiał wybrać nową liczbę dań</li>
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
