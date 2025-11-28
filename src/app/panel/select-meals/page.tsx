'use client'

import { useState, useEffect, useMemo } from 'react'
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
  Info
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import {
  calculateNextDeliveryDate,
  getDeadlineTextForDelivery,
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

        // Get user's subscription
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
        const meals = (subs.people || 2) * (subs.days || 3)
        setRequiredMeals(meals)

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

  // Toggle meal selection
  const toggleMeal = (productId: number) => {
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
    const nextDeliveryDate = calculateNextDeliveryDate(
      subscription?.delivery_day,
      subscription?.pause_until,
      subscription?.next_delivery_date
    );
    return nextDeliveryDate 
      ? getDeadlineTextForDelivery(nextDeliveryDate)
      : 'niedziela 23:59';
  }, [subscription?.delivery_day, subscription?.pause_until, subscription?.next_delivery_date]);

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
            <p className="text-gray-600 mb-6">
              Aktualnie nie ma dostępnego menu na najbliższy tydzień. Skontaktuj się z nami.
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
                disabled={saving || selectedProductIds.length !== requiredMeals}
                className="bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Zapisywanie...
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
        {/* Week info */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Wybierz Dania na Najbliższy Tydzień
              </h1>
              <p className="text-gray-600">
                {weeklyMenu.label} ({new Date(weeklyMenu.week_start_date).toLocaleDateString('pl-PL')} - {new Date(weeklyMenu.week_end_date).toLocaleDateString('pl-PL')})
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-1">Twój plan:</p>
                  <p>{subscription?.people} osób × {subscription?.days} dni = {requiredMeals} dań</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Dostawa: {subscription?.delivery_day === 'tuesday' ? 'Wtorek' : 'Czwartek'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Ważne:</strong> Możesz zmienić wybór do {deadlineText}.
              Jeśli nic nie wybierzesz, system automatycznie dobierze dania według Twoich preferencji.
            </p>
          </div>
        </div>

        {/* Meals grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableProducts.map((product) => {
            const isSelected = selectedProductIds.includes(product.id)
            const quantity = selectedProductIds.filter(id => id === product.id).length

            return (
              <Card
                key={product.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected
                    ? 'ring-2 ring-[var(--smakowalo-green-primary)] shadow-lg'
                    : 'hover:border-[var(--smakowalo-green-primary)]'
                }`}
                onClick={() => toggleMeal(product.id)}
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <Image
                      src={product.image || '/placeholder.jpg'}
                      alt={product.name}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-10 h-10 bg-[var(--smakowalo-green-primary)] rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-6 h-6 text-white" />
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
                      <div className="flex flex-wrap gap-1">
                        {product.diets.slice(0, 3).map((diet, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs bg-green-50 text-green-700 border-green-200"
                          >
                            {diet}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

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
            </div>

            <Button
              size="lg"
              onClick={handleSave}
              disabled={saving || selectedProductIds.length !== requiredMeals}
              className="bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)] px-8"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Zapisywanie...
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
