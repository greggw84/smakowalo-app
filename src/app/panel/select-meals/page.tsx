'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Check,
  ChefHat,
  Clock,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Users,
  ShoppingCart,
  Truck,
  Info,
  Filter,
  AlertTriangle,
  Lock,
  X
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import {
  calculateNextDeliveryDate,
  getDeadlineTextForDelivery,
  isDeadlinePassed,
  formatDeliveryDate,
} from "@/lib/subscription-utils"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, storageKey: 'smakowalo_auth' },
}) : null

interface Product {
  id: number
  name: string
  description: string
  image: string
  calories: number
  cook_time: number
  price: number
  diets: string[]
  allergens?: string[]
}

interface WeeklyMenu {
  id: string
  week_start_date: string
  week_end_date: string
  label: string
  items: {
    product: Product
  }[]
}

// Diet filter options matching the kreator
const DIET_FILTERS = [
  { code: 'wszystkie', name: 'Wszystkie', icon: '🍽️' },
  { code: 'wysokobiałkowa', name: 'Wysokobiałkowa', icon: '💪' },
  { code: 'niskokaloryczna', name: 'Niskokaloryczna', icon: '⚖️' },
  { code: 'keto', name: 'Keto', icon: '🥑' },
  { code: 'wegetariańska', name: 'Wegetariańska', icon: '🌱' },
  { code: 'wegańska', name: 'Wegańska', icon: '🌿' },
  { code: 'niskowęglowodanowa', name: 'Niskowęglowodanowa', icon: '🧀' },
  { code: 'pescetariańska', name: 'Pescetariańska', icon: '🐟' },
]

// Common allergens
const ALLERGEN_LABELS: Record<string, string> = {
  'gluten': 'Gluten',
  'mleko': 'Mleko/Laktoza',
  'orzechy': 'Orzechy',
  'soja': 'Soja',
  'jaja': 'Jaja',
  'ryby': 'Ryby',
  'skorupiaki': 'Skorupiaki',
  'sezam': 'Sezam',
}

export default function SelectMealsPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Subscription data
  const [subscription, setSubscription] = useState<any>(null)
  const [requiredMeals, setRequiredMeals] = useState(0)

  // Weekly menu
  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenu | null>(null)
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])

  // Selected meals
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([])
  const [existingOrder, setExistingOrder] = useState<any>(null)

  // Filtering
  const [activeDietFilter, setActiveDietFilter] = useState<string>('wszystkie')
  const [showOnlyMatching, setShowOnlyMatching] = useState(false)

  // Deadline state
  const [isSelectionLocked, setIsSelectionLocked] = useState(false)
  const [nextDeliveryDate, setNextDeliveryDate] = useState<Date | null>(null)

  // Auth check
  useEffect(() => {
    if (!supabase) return

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login?callbackUrl=/panel/select-meals')
        return
      }
      setSession(session)
    }

    checkSession()

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.push('/login?callbackUrl=/panel/select-meals')
        } else {
          setSession(session)
        }
      }
    )

    return () => authSubscription.unsubscribe()
  }, [router])

  // Fetch subscription and weekly menu
  useEffect(() => {
    if (!session?.user) return

    const fetchData = async () => {
      try {
        setLoading(true)

        // Get user's subscription - include paused and trialing statuses
        const { data: subsData, error: subsError } = await supabase!
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .in('status', ['active', 'trialing', 'paused'])
          .order('created_at', { ascending: false })
          .limit(1)
        
        // Handle no subscription found
        if (subsError || !subsData || subsData.length === 0) {
          router.push('/panel')
          return
        }
        
        const subs = subsData[0]

        setSubscription(subs)
        const meals = (subs.people || 2) * (subs.days || 3)
        setRequiredMeals(meals)

        // Calculate next delivery date and check if selection is locked
        const deliveryDate = calculateNextDeliveryDate(
          subs.delivery_day,
          subs.pause_until,
          subs.next_delivery_date
        )
        setNextDeliveryDate(deliveryDate)
        
        if (deliveryDate) {
          const locked = isDeadlinePassed(deliveryDate)
          setIsSelectionLocked(locked)
        }

        // Get current weekly menu
        const menuResponse = await fetch('/api/menu/weekly/current')
        const menuData = await menuResponse.json()

        if (menuData.success && menuData.menu) {
          setWeeklyMenu(menuData.menu)

          // Extract products
          const products = menuData.menu.items
            .map((item: any) => item.product)
            .filter((p: any) => p !== null)

          setAvailableProducts(products)
        }

        // Get existing order
        const { data: { user } } = await supabase!.auth.getUser()
        if (user) {
          const orderResponse = await fetch('/api/subscription/weekly-order', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          })
          const orderData = await orderResponse.json()

          if (orderData.success && orderData.order) {
            setExistingOrder(orderData.order)
            // Pre-select meals from existing order
            const selectedIds = orderData.order.items?.map((item: any) => item.product_id) || []
            setSelectedProductIds(selectedIds)
          }
        }

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session, router])

  // Get user allergies from subscription
  const userAllergies = useMemo(() => {
    return subscription?.allergies || []
  }, [subscription?.allergies])

  // Get user diets from subscription  
  const userDiets = useMemo(() => {
    return subscription?.diets || subscription?.dietary_preferences || []
  }, [subscription?.diets, subscription?.dietary_preferences])

  // Check if a product contains any of the user's allergens
  const hasAllergenConflict = useCallback((product: Product): boolean => {
    if (!userAllergies.length || !product.allergens?.length) return false
    return product.allergens.some(allergen => 
      userAllergies.some((userAllergen: string) => 
        allergen.toLowerCase().includes(userAllergen.toLowerCase()) ||
        userAllergen.toLowerCase().includes(allergen.toLowerCase())
      )
    )
  }, [userAllergies])

  // Check if a product matches user's diet preferences
  const matchesDietPreferences = useCallback((product: Product): boolean => {
    if (!userDiets.length || !product.diets?.length) return true // No preference = everything matches
    return product.diets.some(diet => 
      userDiets.some((userDiet: string) => 
        diet.toLowerCase().includes(userDiet.toLowerCase()) ||
        userDiet.toLowerCase().includes(diet.toLowerCase())
      )
    )
  }, [userDiets])

  // Filtered products based on diet filter and allergens
  const filteredProducts = useMemo(() => {
    let products = availableProducts

    // Apply diet filter
    if (activeDietFilter !== 'wszystkie') {
      products = products.filter(product => 
        product.diets?.some(diet => 
          diet.toLowerCase().includes(activeDietFilter.toLowerCase())
        )
      )
    }

    // If showing only matching, filter by user preferences and exclude allergen conflicts
    if (showOnlyMatching) {
      products = products.filter(product => 
        matchesDietPreferences(product) && !hasAllergenConflict(product)
      )
    }

    return products
  }, [availableProducts, activeDietFilter, showOnlyMatching, matchesDietPreferences, hasAllergenConflict])

  // Toggle meal selection
  const toggleMeal = (productId: number) => {
    // Don't allow changes if selection is locked
    if (isSelectionLocked) {
      return
    }

    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(prev => prev.filter(id => id !== productId))
    } else {
      if (selectedProductIds.length < requiredMeals) {
        setSelectedProductIds(prev => [...prev, productId])
      } else {
        alert(`Możesz wybrać maksymalnie ${requiredMeals} dań`)
      }
    }
  }

  // Save selection
  const handleSave = async () => {
    if (isSelectionLocked) {
      alert('Wybór dań jest zamknięty. Minął termin 48 godzin przed dostawą.')
      return
    }

    if (selectedProductIds.length !== requiredMeals) {
      alert(`Musisz wybrać dokładnie ${requiredMeals} dań (${selectedProductIds.length}/${requiredMeals})`)
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/subscription/weekly-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          weekly_menu_id: weeklyMenu?.id,
          selected_product_ids: selectedProductIds,
          delivery_day: subscription?.delivery_day || 'tuesday'
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('✅ Twój wybór został zapisany!')
        router.push('/panel')
      } else {
        throw new Error(result.error || 'Nie udało się zapisać')
      }

    } catch (error: any) {
      console.error('Error saving selection:', error)
      alert(`❌ Wystąpił błąd: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Calculate deadline text based on next delivery date (48 hours before delivery)
  const deadlineText = useMemo(() => {
    return nextDeliveryDate 
      ? getDeadlineTextForDelivery(nextDeliveryDate)
      : 'niedziela 23:59';
  }, [nextDeliveryDate]);

  // Format the next delivery date for display
  const nextDeliveryFormatted = useMemo(() => {
    return nextDeliveryDate ? formatDeliveryDate(nextDeliveryDate) : 'Nie ustalono'
  }, [nextDeliveryDate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--smakowalo-green-primary)]" />
      </div>
    )
  }

  if (!weeklyMenu || availableProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Brak menu tygodniowego</h2>
            <p className="text-gray-600 mb-4">
              Aktualnie nie ma dostępnego menu na najbliższy tydzień.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Menu na kolejny tydzień pojawi się wkrótce. Sprawdź ponownie później lub skontaktuj się z nami.
            </p>
            <Link href="/panel">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Wróć do panelu
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/panel">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Wróć do panelu
              </Button>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Wybrano:</p>
                <p className={`text-lg font-bold ${
                  selectedProductIds.length === requiredMeals
                    ? 'text-green-600'
                    : 'text-gray-900'
                }`}>
                  {selectedProductIds.length} / {requiredMeals}
                </p>
              </div>

              <Button
                size="lg"
                onClick={handleSave}
                disabled={saving || selectedProductIds.length !== requiredMeals || isSelectionLocked}
                className="bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Zapisywanie...
                  </>
                ) : isSelectionLocked ? (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Wybór zamknięty
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Zapisz wybór
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Selection locked banner */}
        {isSelectionLocked && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Lock className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-800">Wybór dań zamknięty</h4>
                <p className="text-sm text-red-700 mt-1">
                  Minął termin 48 godzin przed dostawą ({nextDeliveryFormatted}). 
                  Nie możesz już zmienić wyboru dań na ten tydzień.
                </p>
                {existingOrder && (
                  <p className="text-sm text-red-600 mt-2">
                    Twoje wybrane dania zostały już zapisane i przygotowywane.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Week info */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isSelectionLocked ? 'Twoje dania na ten tydzień' : 'Wybierz dania na najbliższy tydzień'}
              </h1>
              <p className="text-gray-600">
                {weeklyMenu.label} ({new Date(weeklyMenu.week_start_date).toLocaleDateString('pl-PL')} - {new Date(weeklyMenu.week_end_date).toLocaleDateString('pl-PL')})
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 lg:min-w-[280px]">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-1">Twój plan:</p>
                  <p>{subscription?.people} osób × {subscription?.days} dni = {requiredMeals} dań</p>
                  <p className="text-xs text-gray-500 mt-1">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Dostawa: {nextDeliveryFormatted}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Deadline info */}
          {!isSelectionLocked && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700">
                <Clock className="w-4 h-4 inline mr-1" />
                <strong>Termin wyboru:</strong> do {deadlineText}.
                Jeśli nic nie wybierzesz, system automatycznie dobierze dania według Twoich preferencji.
              </p>
            </div>
          )}

          {/* User preferences reminder */}
          {(userDiets.length > 0 || userAllergies.length > 0) && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold text-purple-800">Twoje preferencje:</span>
                {userDiets.map((diet: string, idx: number) => (
                  <Badge key={`diet-${idx}`} variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    {diet}
                  </Badge>
                ))}
                {userAllergies.map((allergy: string, idx: number) => (
                  <Badge key={`allergy-${idx}`} variant="outline" className="bg-red-100 text-red-800 border-red-300">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {ALLERGEN_LABELS[allergy] || allergy}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          {!isSelectionLocked && (
            <div className="bg-white border rounded-lg p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filtruj:</span>
                  <div className="flex flex-wrap gap-2">
                    {DIET_FILTERS.map((filter) => (
                      <button
                        key={filter.code}
                        onClick={() => setActiveDietFilter(filter.code)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          activeDietFilter === filter.code
                            ? 'bg-[var(--smakowalo-green-primary)] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {filter.icon} {filter.name}
                      </button>
                    ))}
                  </div>
                </div>

                {(userDiets.length > 0 || userAllergies.length > 0) && (
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnlyMatching}
                      onChange={(e) => setShowOnlyMatching(e.target.checked)}
                      className="w-4 h-4 text-[var(--smakowalo-green-primary)] rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Pokaż tylko pasujące do moich preferencji
                    </span>
                  </label>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Meals grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const isSelected = selectedProductIds.includes(product.id)
            const hasAllergen = hasAllergenConflict(product)
            const matchesDiet = matchesDietPreferences(product)
            const isDisabled = isSelectionLocked || hasAllergen

            return (
              <Card
                key={product.id}
                className={`transition-all ${
                  isDisabled 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'cursor-pointer hover:shadow-lg'
                } ${
                  isSelected
                    ? 'ring-2 ring-[var(--smakowalo-green-primary)] shadow-lg'
                    : isDisabled 
                      ? ''
                      : 'hover:border-[var(--smakowalo-green-primary)]'
                } ${
                  hasAllergen 
                    ? 'border-red-300 bg-red-50/30' 
                    : matchesDiet && userDiets.length > 0
                      ? 'border-green-200'
                      : ''
                }`}
                onClick={() => !isDisabled && toggleMeal(product.id)}
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <Image
                      src={product.image || '/placeholder.jpg'}
                      alt={product.name}
                      width={400}
                      height={300}
                      className={`w-full h-48 object-cover rounded-t-lg ${hasAllergen ? 'grayscale' : ''}`}
                    />
                    
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-10 h-10 bg-[var(--smakowalo-green-primary)] rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    )}
                    
                    {/* Allergen warning */}
                    {hasAllergen && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md flex items-center space-x-1 shadow-lg">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs font-medium">Zawiera alergeny</span>
                      </div>
                    )}

                    {/* Diet match indicator */}
                    {!hasAllergen && matchesDiet && userDiets.length > 0 && (
                      <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-md flex items-center space-x-1 shadow-lg">
                        <Check className="w-4 h-4" />
                        <span className="text-xs font-medium">Pasuje do diety</span>
                      </div>
                    )}

                    {/* Locked indicator */}
                    {isSelectionLocked && isSelected && (
                      <div className="absolute inset-0 bg-black/20 rounded-t-lg flex items-center justify-center">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{product.cook_time} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ChefHat className="w-4 h-4" />
                        <span>{product.calories} kcal</span>
                      </div>
                    </div>

                    {/* Diet badges */}
                    {product.diets && product.diets.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {product.diets.slice(0, 3).map((diet, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className={`text-xs ${
                              userDiets.some((ud: string) => ud.toLowerCase().includes(diet.toLowerCase()))
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : 'bg-green-50 text-green-700 border-green-200'
                            }`}
                          >
                            {diet}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Allergen badges */}
                    {product.allergens && product.allergens.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {product.allergens.slice(0, 3).map((allergen, idx) => {
                          const isUserAllergen = userAllergies.some((ua: string) => 
                            allergen.toLowerCase().includes(ua.toLowerCase()) ||
                            ua.toLowerCase().includes(allergen.toLowerCase())
                          )
                          return (
                            <Badge
                              key={idx}
                              variant="outline"
                              className={`text-xs ${
                                isUserAllergen
                                  ? 'bg-red-100 text-red-800 border-red-300'
                                  : 'bg-orange-50 text-orange-700 border-orange-200'
                              }`}
                            >
                              {isUserAllergen && <AlertTriangle className="w-3 h-3 mr-1" />}
                              {ALLERGEN_LABELS[allergen] || allergen}
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty filtered state */}
        {filteredProducts.length === 0 && availableProducts.length > 0 && (
          <div className="text-center py-12">
            <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Brak dań pasujących do wybranych filtrów</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setActiveDietFilter('wszystkie')
                setShowOnlyMatching(false)
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Wyczyść filtry
            </Button>
          </div>
        )}

        {/* Empty state */}
        {availableProducts.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Brak dostępnych dań w tym tygodniu</p>
          </div>
        )}

        {/* Bottom action bar */}
        <div className="sticky bottom-0 bg-white border-t shadow-lg mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Wybrano dań:</p>
              <p className={`text-2xl font-bold ${
                selectedProductIds.length === requiredMeals
                  ? 'text-green-600'
                  : 'text-gray-900'
              }`}>
                {selectedProductIds.length} / {requiredMeals}
              </p>
              {isSelectionLocked && (
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <Lock className="w-3 h-3 mr-1" />
                  Wybór zamknięty
                </p>
              )}
            </div>

            <Button
              size="lg"
              onClick={handleSave}
              disabled={saving || selectedProductIds.length !== requiredMeals || isSelectionLocked}
              className="bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)] px-8"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Zapisywanie...
                </>
              ) : isSelectionLocked ? (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Wybór zamknięty
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Zapisz wybór ({selectedProductIds.length}/{requiredMeals})
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
