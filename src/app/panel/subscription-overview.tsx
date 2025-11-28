'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Package,
  Calendar,
  Truck,
  ChefHat,
  Edit,
  Pause,
  Play,
  X,
  Check,
  AlertCircle,
  Users,
  UtensilsCrossed,
  Clock,
  Settings,
  CreditCard,
  Loader2
} from "lucide-react"
import Link from "next/link"
import {
  formatDeliveryDate,
  calculateNextDeliveryDate,
  getDeadlineTextForDelivery,
  isSubscriptionPaused,
  isSubscriptionActive,
  SubscriptionStatus,
  POLISH_DAY_NAMES_CAPITALIZED,
} from "@/lib/subscription-utils"

interface SubscriptionOverviewProps {
  subscription: any
  weeklyOrder: any | null
  onPause: () => void
  onResume: () => void
  onCancel: () => void
  loading?: boolean
}

/**
 * Returns Polish grammar-correct label for people count
 * 1 -> "osoba", 2-4 -> "osoby", 5+ -> "osób"
 */
function formatPeopleLabel(count: number): string {
  if (count === 1) return 'osoba'
  if (count >= 2 && count <= 4) return 'osoby'
  return 'osób'
}

/**
 * Returns Polish grammar-correct label for days count
 * 1 -> "dzień", 2+ -> "dni"
 */
function formatDaysLabel(count: number): string {
  return count === 1 ? 'dzień' : 'dni'
}

/**
 * Formats the subscription plan display text with correct Polish grammar
 */
function formatPlanDisplay(people: number, days: number): string {
  return `${people} ${formatPeopleLabel(people)} × ${days} ${formatDaysLabel(days)}`
}

export default function SubscriptionOverview({
  subscription,
  weeklyOrder,
  onPause,
  onResume,
  onCancel,
  loading = false
}: SubscriptionOverviewProps) {
  const router = useRouter()
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showPauseDialog, setShowPauseDialog] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  // Function to open Stripe Customer Portal
  const handleOpenCustomerPortal = async () => {
    setPortalLoading(true)
    try {
      // Get Supabase session
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
      })

      const data = await response.json()

      if (response.ok && data.url) {
        // Redirect to Stripe Customer Portal
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create portal session')
      }
    } catch (error: any) {
      console.error('Error opening Customer Portal:', error)
      alert('Nie udało się otworzyć panelu płatności. Spróbuj ponownie.')
    } finally {
      setPortalLoading(false)
    }
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Brak aktywnej subskrypcji
          </h3>
          <p className="text-gray-600 mb-4">
            Nie masz jeszcze aktywnej subskrypcji Smakowało.
          </p>
          <Link href="/kreator">
            <Button className="bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)]">
              Rozpocznij subskrypcję
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  const isPaused = isSubscriptionPaused(subscription.status, subscription.pause_until)
  const isActive = isSubscriptionActive(subscription.status)
  const isIncomplete = subscription.status === SubscriptionStatus.INCOMPLETE || subscription.status === SubscriptionStatus.INCOMPLETE_EXPIRED
  const isPastDue = subscription.status === SubscriptionStatus.PAST_DUE
  const requiredMeals = (subscription.people || 2) * (subscription.days || 3)
  const hasSelectedMeals = weeklyOrder && weeklyOrder.items && weeklyOrder.items.length > 0

  // Calculate next delivery date with proper formatting
  const computedNextDeliveryDate = calculateNextDeliveryDate(
    subscription.delivery_day,
    subscription.pause_until,
    subscription.next_delivery_date
  )

  // Format delivery date as "DD.MM.YYYY • DayName" for next delivery display
  const nextDeliveryFormatted = computedNextDeliveryDate 
    ? formatDeliveryDate(computedNextDeliveryDate)
    : 'Nie ustalono'

  // Calculate deadline text (48 hours before delivery)
  const deadlineText = computedNextDeliveryDate
    ? getDeadlineTextForDelivery(computedNextDeliveryDate)
    : 'niedziela 23:59'

  // Format delivery day - shows the upcoming delivery date with day name
  // Per requirements, this should show the specific date (e.g., "12.12.2025 • Czwartek")
  // When date cannot be computed, fall back to just the recurring day name
  const deliveryDayDisplay = computedNextDeliveryDate
    ? formatDeliveryDate(computedNextDeliveryDate)
    : (subscription.delivery_day === 'tuesday' ? 'Wtorek' : 
       subscription.delivery_day === 'thursday' ? 'Czwartek' : 'Nie ustalono')

  return (
    <div className="space-y-6">
      {/* Incomplete Status Banner */}
      {isIncomplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4" role="alert" aria-live="polite">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h4 className="font-bold text-gray-900">Subskrypcja oczekuje na płatność</h4>
              <p className="text-sm text-gray-700 mt-1">
                Twoja subskrypcja wymaga dokończenia płatności. Sprawdź swój email lub skontaktuj się z obsługą.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Past Due Status Banner */}
      {isPastDue && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert" aria-live="polite">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h4 className="font-bold text-gray-900">Problem z płatnością</h4>
              <p className="text-sm text-gray-700 mt-1">
                Nie udało się pobrać płatności. Zaktualizuj metodę płatności, aby kontynuować subskrypcję.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-red-600 text-red-600 hover:bg-red-50"
                onClick={handleOpenCustomerPortal}
                disabled={portalLoading}
                aria-label="Zaktualizuj metodę płatności"
              >
                {portalLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    Ładowanie...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" aria-hidden="true" />
                    Zaktualizuj płatność
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Banner */}
      {isPaused && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4" role="alert" aria-live="polite">
          <div className="flex items-start space-x-3">
            <Pause className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h4 className="font-bold text-gray-900">Subskrypcja wstrzymana</h4>
              <p className="text-sm text-gray-700">
                Twoja subskrypcja jest wstrzymana do {subscription.pause_until ? new Date(subscription.pause_until).toLocaleDateString('pl-PL') : 'odwołania'}.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={onResume}
              >
                <Play className="w-4 h-4 mr-2" />
                Wznów subskrypcję
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Subscription Card */}
      <Card className="overflow-hidden">
        <div className={`p-6 text-white ${
          isPaused 
            ? 'bg-gradient-to-r from-gray-500 to-gray-600' 
            : 'bg-gradient-to-r from-green-500 to-green-600'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Package className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Twoja Subskrypcja</h2>
              </div>
              <p className={isPaused ? 'text-gray-100' : 'text-green-50'}>
                {formatPlanDisplay(subscription.people || 2, subscription.days || 3)} tygodniowo
              </p>
            </div>
            <Badge
              variant="secondary"
              className={`${
                isActive 
                  ? 'bg-white text-green-600' 
                  : isPaused 
                    ? 'bg-white text-gray-600' 
                    : isIncomplete
                      ? 'bg-orange-100 text-orange-800'
                      : isPastDue
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
              }`}
            >
              {isActive 
                ? (subscription.status === SubscriptionStatus.TRIALING ? 'Okres próbny' : 'Aktywna')
                : isPaused 
                  ? 'Wstrzymana' 
                  : isIncomplete
                    ? 'Oczekuje na płatność'
                    : isPastDue
                      ? 'Problem z płatnością'
                      : subscription.status
              }
            </Badge>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Subscription Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Truck className="w-5 h-5 text-[var(--smakowalo-green-primary)]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Dzień dostawy</p>
                <p className="font-bold text-gray-900">{deliveryDayDisplay}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Następna dostawa</p>
                <p className="font-bold text-gray-900">
                  {isPaused && subscription.pause_until ? (
                    <>
                      <span className="text-yellow-600">Wstrzymana do</span>
                      <br />
                      <span className="text-sm font-normal text-gray-600">
                        {formatDeliveryDate(new Date(subscription.pause_until))}
                      </span>
                    </>
                  ) : (
                    nextDeliveryFormatted
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <UtensilsCrossed className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Dania tygodniowo</p>
                <p className="font-bold text-gray-900">{requiredMeals} posiłków</p>
              </div>
            </div>
          </div>

          {/* Weekly Order Status */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <ChefHat className={`w-6 h-6 ${
                  hasSelectedMeals ? 'text-green-600' : 'text-gray-400'
                } flex-shrink-0 mt-0.5`} />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    {hasSelectedMeals
                      ? 'Dania wybrane!'
                      : 'Wybierz dania na najbliższy tydzień'
                    }
                  </h4>
                  {hasSelectedMeals ? (
                    <p className="text-sm text-gray-600">
                      Wybrałeś {weeklyOrder.items.length} dań.
                      Możesz zmienić wybór do {deadlineText}.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">
                      System automatycznie dobierze dania jeśli nic nie wybierzesz.
                      Deadline: {deadlineText}.
                    </p>
                  )}
                </div>
              </div>
              <Link href="/panel/select-meals">
                <Button
                  variant="outline"
                  className="border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)] hover:bg-green-50"
                >
                  {hasSelectedMeals ? 'Zmień wybór' : 'Wybierz dania'}
                </Button>
              </Link>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/panel/change-delivery">
              <Button variant="outline" className="w-full justify-start">
                <Truck className="w-4 h-4 mr-2" />
                Zmień dzień dostawy
              </Button>
            </Link>

            <Button
              variant="outline"
              className="w-full justify-start text-blue-600 border-blue-300 hover:bg-blue-50"
              onClick={handleOpenCustomerPortal}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Ładowanie...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Zarządzaj płatnościami
                </>
              )}
            </Button>

            {isActive ? (
              <Button
                variant="outline"
                className="w-full justify-start text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                onClick={() => setShowPauseDialog(true)}
              >
                <Pause className="w-4 h-4 mr-2" />
                Pomiń najbliższy tydzień
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start text-green-600 border-green-300 hover:bg-green-50"
                onClick={onResume}
              >
                <Play className="w-4 h-4 mr-2" />
                Wznów dostawy
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => setShowCancelDialog(true)}
            >
              <X className="w-4 h-4 mr-2" />
              Anuluj subskrypcję
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dietary Preferences */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Twoje Preferencje
          </h3>

          {/* People and Days Info */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Plan:</p>
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="outline" 
                className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1"
              >
                <Users className="w-3 h-3 mr-1.5" />
                {formatPlanDisplay(subscription.people || 2, subscription.days || 3)}
              </Badge>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Diety:</p>
            <div className="flex flex-wrap gap-2">
              {subscription.diets && Array.isArray(subscription.diets) && subscription.diets.length > 0 ? (
                subscription.diets.map((diet: string | number, idx: number) => {
                  // Handle case where diet might be stored as a number (count)
                  const dietLabel = typeof diet === 'number' 
                    ? `Dieta ${diet}` 
                    : diet
                  return (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="bg-green-50 text-green-700 border-green-200 px-3 py-1"
                    >
                      {dietLabel}
                    </Badge>
                  )
                })
              ) : subscription.dietary_preferences && Array.isArray(subscription.dietary_preferences) && subscription.dietary_preferences.length > 0 ? (
                subscription.dietary_preferences.map((pref: string, idx: number) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className="bg-green-50 text-green-700 border-green-200 px-3 py-1"
                  >
                    {pref}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-400 text-sm italic">Brak wybranych diet</span>
              )}
            </div>
          </div>

          {subscription.allergies && Array.isArray(subscription.allergies) && subscription.allergies.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Alergie:</p>
              <div className="flex flex-wrap gap-2">
                {subscription.allergies.map((allergy: string, idx: number) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className="bg-red-50 text-red-700 border-red-200 px-3 py-1"
                  >
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Link href="/panel/manage-plan">
            <Button variant="ghost" size="sm" className="mt-4">
              <Edit className="w-4 h-4 mr-2" />
              Edytuj preferencje
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Pause Dialog */}
      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pomiń najbliższy tydzień</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz pominąć najbliższą dostawę?
              Nie zostaniesz obciążony za ten tydzień.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                Twoja subskrypcja zostanie wznowiona automatycznie w kolejnym tygodniu.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPauseDialog(false)}>
              Anuluj
            </Button>
            <Button
              onClick={() => {
                onPause()
                setShowPauseDialog(false)
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Tak, pomiń tydzień
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anuluj subskrypcję</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz anulować subskrypcję Smakowało?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-1">Stracisz dostęp do:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Cotygodniowych dostaw świeżych produktów</li>
                    <li>Dostępu do ekskluzywnych przepisów</li>
                    <li>Rabatów i promocji dla stałych klientów</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Subskrypcja zostanie anulowana po zakończeniu bieżącego okresu rozliczeniowego.
              Nie będziesz już obciążany za kolejne tygodnie.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Nie, zostań
            </Button>
            <Button
              onClick={() => {
                onCancel()
                setShowCancelDialog(false)
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Tak, anuluj subskrypcję
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
