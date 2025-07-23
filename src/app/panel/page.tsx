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
  User,
  Package,
  CreditCard,
  Settings,
  Calendar,
  MapPin,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  X,
  Edit,
  Save,
  Eye,
  Trash2,
  Download,
  RefreshCw,
  Percent,
  ShoppingCart,
  Clock,
  ChefHat,
  Pause,
  Play,
  CalendarDays,
  Users,
  UtensilsCrossed
} from "lucide-react"
import Link from "next/link"
import Navigation from '@/components/Navigation'

interface Order {
  id: number
  order_number?: string
  total_amount: number
  subtotal: number
  discount_amount: number
  status: string
  created_at: string
  delivery_date?: string
  discount_details?: any[]
  order_items?: any[]
}

interface Subscription {
  id: number
  status: string
  plan_type: string
  price_per_delivery: number
  next_delivery_date?: string
  meal_plan_config?: any
  stripe_subscription_id?: string
  created_at: string
}

interface Profile {
  first_name: string
  last_name: string
  email: string
  phone: string
  street_address?: string
  city?: string
  postal_code?: string
  dietary_preferences?: string[]
  newsletter_subscribed: boolean
}

export default function PanelPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [subscriptionAction, setSubscriptionAction] = useState<{
    id: number | null
    action: 'pause' | 'resume' | 'edit_delivery' | 'edit_meals' | null
    isLoading: boolean
  }>({ id: null, action: null, isLoading: false })

  const [subscriptionEditData, setSubscriptionEditData] = useState<{
    nextDeliveryDate: string
    numberOfPeople: number
    numberOfDays: number
    selectedMeals: string[]
    dietPreferences: string[]
  }>({
    nextDeliveryDate: '',
    numberOfPeople: 2,
    numberOfDays: 3,
    selectedMeals: [],
    dietPreferences: []
  })

  const [profile, setProfile] = useState<Profile>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    street_address: '',
    city: '',
    postal_code: '',
    dietary_preferences: [],
    newsletter_subscribed: false
  })

  const [orders, setOrders] = useState<Order[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    totalSaved: 0,
    activeSubscriptions: 0
  })

  // Authentication check
  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login?callbackUrl=/panel')
      return
    }

    loadUserData()
  }, [session, status, router])

  const loadUserData = async () => {
    if (!session?.user?.email) return

    setIsLoading(true)
    try {
      // Load profile
      const profileResponse = await fetch('/api/user/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        if (profileData.profile) {
          setProfile(profileData.profile)
        }
      }

      // Load orders
      const ordersResponse = await fetch('/api/user/orders')
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        if (ordersData.orders) {
          setOrders(ordersData.orders)

          // Calculate stats
          const totalSpent = ordersData.orders.reduce((sum: number, order: Order) => sum + order.total_amount, 0)
          const totalSaved = ordersData.orders.reduce((sum: number, order: Order) => sum + (order.discount_amount || 0), 0)

          setStats(prev => ({
            ...prev,
            totalOrders: ordersData.orders.length,
            totalSpent,
            totalSaved
          }))
        }
      }

      // Load subscriptions
      const subscriptionsResponse = await fetch('/api/user/subscriptions')
      if (subscriptionsResponse.ok) {
        const subscriptionsData = await subscriptionsResponse.json()
        if (subscriptionsData.subscriptions) {
          setSubscriptions(subscriptionsData.subscriptions)
          const activeCount = subscriptionsData.subscriptions.filter((sub: Subscription) => sub.status === 'active').length
          setStats(prev => ({ ...prev, activeSubscriptions: activeCount }))
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdate = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (response.ok) {
        setIsEditing(false)
        // Show success message
        alert('Profil został zaktualizowany!')
      } else {
        alert('Błąd podczas aktualizacji profilu')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Błąd podczas aktualizacji profilu')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelSubscription = async (subscriptionId: number) => {
    if (!confirm('Czy na pewno chcesz anulować subskrypcję?')) return

    try {
      const response = await fetch(`/api/user/subscriptions/${subscriptionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadUserData()
        alert('Subskrypcja została anulowana')
      } else {
        alert('Błąd podczas anulowania subskrypcji')
      }
    } catch (error) {
      console.error('Error canceling subscription:', error)
      alert('Błąd podczas anulowania subskrypcji')
    }
  }

  const handleSubscriptionAction = async (
    subscriptionId: number,
    action: 'pause' | 'resume' | 'update_delivery_date' | 'update_meal_plan',
    data?: any
  ) => {
    setSubscriptionAction({ id: subscriptionId, action: action as any, isLoading: true })

    try {
      const response = await fetch(`/api/user/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
      })

      if (response.ok) {
        loadUserData()
        setSubscriptionAction({ id: null, action: null, isLoading: false })

        const actionMessages = {
          pause: 'Subskrypcja została wstrzymana',
          resume: 'Subskrypcja została wznowiona',
          update_delivery_date: 'Data dostawy została zaktualizowana',
          update_meal_plan: 'Plan posiłków został zaktualizowany'
        }

        alert(actionMessages[action] || 'Subskrypcja została zaktualizowana')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Błąd podczas aktualizacji subskrypcji')
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
      alert('Błąd podczas aktualizacji subskrypcji')
    } finally {
      setSubscriptionAction({ id: null, action: null, isLoading: false })
    }
  }

  const handlePauseSubscription = (subscriptionId: number) => {
    const pauseUntil = prompt('Do kiedy wstrzymać subskrypcję? (YYYY-MM-DD) Pozostaw puste dla nieokreślonego czasu:')

    if (pauseUntil !== null) { // User didn't cancel
      handleSubscriptionAction(subscriptionId, 'pause', {
        pause_until: pauseUntil || null
      })
    }
  }

  const handleResumeSubscription = (subscriptionId: number) => {
    const nextDelivery = prompt('Kiedy zaplanować następną dostawę? (YYYY-MM-DD)')

    if (nextDelivery) {
      handleSubscriptionAction(subscriptionId, 'resume', {
        next_delivery_date: nextDelivery
      })
    }
  }

  const handleUpdateDeliveryDate = (subscriptionId: number, currentDate: string) => {
    const newDate = prompt('Nowa data dostawy (YYYY-MM-DD):', currentDate)

    if (newDate && newDate !== currentDate) {
      handleSubscriptionAction(subscriptionId, 'update_delivery_date', {
        next_delivery_date: newDate
      })
    }
  }

  const handleUpdateMealPlan = (subscriptionId: number, currentConfig: any) => {
    // This would typically open a modal with meal selection
    // For now, we'll use simple prompts
    const numberOfPeople = prompt('Liczba osób:', currentConfig?.numberOfPeople?.toString() || '2')
    const numberOfDays = prompt('Liczba dni:', currentConfig?.numberOfDays?.toString() || '3')

    if (numberOfPeople && numberOfDays) {
      const updatedConfig = {
        meal_plan_config: {
          ...currentConfig,
          numberOfPeople: Number.parseInt(numberOfPeople),
          numberOfDays: Number.parseInt(numberOfDays)
        }
      }

      handleSubscriptionAction(subscriptionId, 'update_meal_plan', updatedConfig)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'confirmed':
      case 'preparing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-yellow-100 text-yellow-800'
      case 'canceled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Oczekujące',
      'confirmed': 'Potwierdzone',
      'preparing': 'Przygotowywane',
      'shipped': 'Wysłane',
      'delivered': 'Dostarczone',
      'canceled': 'Anulowane'
    }
    return statusMap[status] || status
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--smakowalo-green-primary)]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white">
      <Navigation currentPage="/panel" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--smakowalo-green-dark)]">
            Witaj, {profile.first_name || session?.user?.name?.split(' ')[0] || 'Użytkowniku'}!
          </h1>
          <p className="text-gray-600 mt-2">Zarządzaj swoim kontem i zamówieniami</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-[var(--smakowalo-green-primary)]" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Zamówienia</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="w-8 h-8 text-[var(--smakowalo-green-primary)]" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Wydano łącznie</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSpent.toFixed(2)} zł</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Percent className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Zaoszczędzono</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalSaved.toFixed(2)} zł</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <RefreshCw className="w-8 h-8 text-[var(--smakowalo-green-primary)]" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Aktywne subskrypcje</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'profile', label: 'Profil', icon: User },
                { id: 'orders', label: 'Zamówienia', icon: Package },
                { id: 'subscriptions', label: 'Subskrypcje', icon: RefreshCw },
                { id: 'settings', label: 'Ustawienia', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Dane osobowe</h2>
                  <Button
                    onClick={() => isEditing ? handleProfileUpdate() : setIsEditing(true)}
                    disabled={isSaving}
                    className="smakowalo-green"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : isEditing ? (
                      <Save className="w-4 h-4 mr-2" />
                    ) : (
                      <Edit className="w-4 h-4 mr-2" />
                    )}
                    {isSaving ? 'Zapisywanie...' : isEditing ? 'Zapisz' : 'Edytuj'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">Imię</Label>
                    <Input
                      id="firstName"
                      value={profile.first_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nazwisko</Label>
                    <Input
                      id="lastName"
                      value={profile.last_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="streetAddress">Adres</Label>
                    <Input
                      id="streetAddress"
                      value={profile.street_address}
                      onChange={(e) => setProfile(prev => ({ ...prev, street_address: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Miasto</Label>
                    <Input
                      id="city"
                      value={profile.city}
                      onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Kod pocztowy</Label>
                    <Input
                      id="postalCode"
                      value={profile.postal_code}
                      onChange={(e) => setProfile(prev => ({ ...prev, postal_code: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleProfileUpdate}
                      disabled={isSaving}
                      className="smakowalo-green"
                    >
                      Zapisz zmiany
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        loadUserData() // Reload original data
                      }}
                      disabled={isSaving}
                    >
                      Anuluj
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Historia zamówień</h2>
                  <Link href="/menu">
                    <Button className="smakowalo-green">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Złóż zamówienie
                    </Button>
                  </Link>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Brak zamówień</h3>
                    <p className="text-gray-600 mb-6">Nie masz jeszcze żadnych zamówień</p>
                    <Link href="/menu">
                      <Button className="smakowalo-green">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Złóż pierwsze zamówienie
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Zamówienie #{order.id}
                                </h3>
                                <Badge className={getStatusBadgeColor(order.status)}>
                                  {getStatusText(order.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                Data: {new Date(order.created_at).toLocaleDateString('pl-PL')}
                              </p>
                              {order.delivery_date && (
                                <p className="text-sm text-gray-600">
                                  Dostawa: {new Date(order.delivery_date).toLocaleDateString('pl-PL')}
                                </p>
                              )}
                              {order.discount_amount > 0 && (
                                <div className="flex items-center text-green-600">
                                  <Percent className="w-4 h-4 mr-1" />
                                  <span className="text-sm">
                                    Zaoszczędzono: {order.discount_amount.toFixed(2)} zł
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-[var(--smakowalo-green-primary)]">
                                {order.total_amount.toFixed(2)} zł
                              </p>
                              {order.discount_amount > 0 && (
                                <p className="text-sm text-gray-500 line-through">
                                  {order.subtotal.toFixed(2)} zł
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Subscriptions Tab */}
            {activeTab === 'subscriptions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Moje subskrypcje</h2>
                  <Link href="/kreator">
                    <Button className="smakowalo-green">
                      <ChefHat className="w-4 h-4 mr-2" />
                      Stwórz plan posiłków
                    </Button>
                  </Link>
                </div>

                {subscriptions.length === 0 ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Brak aktywnych subskrypcji</h3>
                    <p className="text-gray-600 mb-6">Nie masz jeszcze żadnych subskrypcji</p>
                    <Link href="/kreator">
                      <Button className="smakowalo-green">
                        <ChefHat className="w-4 h-4 mr-2" />
                        Stwórz plan posiłków
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subscriptions.map((subscription) => (
                      <Card key={subscription.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {subscription.plan_type} - Subskrypcja
                                </h3>
                                <Badge className={
                                  subscription.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : subscription.status === 'paused'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }>
                                  {subscription.status === 'active' ? 'Aktywna' :
                                   subscription.status === 'paused' ? 'Wstrzymana' : 'Nieaktywna'}
                                </Badge>
                              </div>

                              {subscription.next_delivery_date && (
                                <p className="text-sm text-gray-600 flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  Następna dostawa: {new Date(subscription.next_delivery_date).toLocaleDateString('pl-PL')}
                                </p>
                              )}

                              {subscription.pause_until && (
                                <p className="text-sm text-yellow-600 flex items-center">
                                  <Pause className="w-4 h-4 mr-1" />
                                  Wstrzymana do: {new Date(subscription.pause_until).toLocaleDateString('pl-PL')}
                                </p>
                              )}

                              {subscription.meal_plan_config && (
                                <div className="text-sm text-gray-600">
                                  <div className="flex items-center mb-1">
                                    <Users className="w-4 h-4 mr-1" />
                                    {subscription.meal_plan_config.numberOfPeople || 2} osoby
                                  </div>
                                  <div className="flex items-center">
                                    <CalendarDays className="w-4 h-4 mr-1" />
                                    {subscription.meal_plan_config.numberOfDays || 3} dni w tygodniu
                                  </div>
                                </div>
                              )}

                              <p className="text-sm text-gray-600">
                                Utworzona: {new Date(subscription.created_at).toLocaleDateString('pl-PL')}
                              </p>
                            </div>

                            <div className="text-right space-y-3">
                              <div>
                                <p className="text-2xl font-bold text-[var(--smakowalo-green-primary)]">
                                  {subscription.price_per_delivery.toFixed(2)} zł
                                </p>
                                <p className="text-sm text-gray-500">za dostawę</p>
                              </div>

                              {subscription.status === 'active' && (
                                <div className="space-y-2">
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handlePauseSubscription(subscription.id)}
                                      disabled={subscriptionAction.id === subscription.id && subscriptionAction.isLoading}
                                      className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                                    >
                                      <Pause className="w-4 h-4 mr-1" />
                                      Wstrzymaj
                                    </Button>

                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleUpdateDeliveryDate(subscription.id, subscription.next_delivery_date || '')}
                                      disabled={subscriptionAction.id === subscription.id && subscriptionAction.isLoading}
                                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                    >
                                      <CalendarDays className="w-4 h-4 mr-1" />
                                      Zmień datę
                                    </Button>
                                  </div>

                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleUpdateMealPlan(subscription.id, subscription.meal_plan_config)}
                                      disabled={subscriptionAction.id === subscription.id && subscriptionAction.isLoading}
                                      className="text-purple-600 border-purple-300 hover:bg-purple-50"
                                    >
                                      <UtensilsCrossed className="w-4 h-4 mr-1" />
                                      Edytuj plan
                                    </Button>

                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCancelSubscription(subscription.id)}
                                      className="text-red-600 border-red-300 hover:bg-red-50"
                                    >
                                      <X className="w-4 h-4 mr-1" />
                                      Anuluj
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {subscription.status === 'paused' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleResumeSubscription(subscription.id)}
                                  disabled={subscriptionAction.id === subscription.id && subscriptionAction.isLoading}
                                  className="text-green-600 border-green-300 hover:bg-green-50"
                                >
                                  <Play className="w-4 h-4 mr-1" />
                                  Wznów
                                </Button>
                              )}

                              {subscriptionAction.id === subscription.id && subscriptionAction.isLoading && (
                                <div className="flex items-center text-sm text-gray-500">
                                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                  Aktualizowanie...
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Ustawienia konta</h2>

                <Card>
                  <CardHeader>
                    <CardTitle>Newsletter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Subskrypcja newslettera</p>
                        <p className="text-sm text-gray-600">
                          Otrzymuj informacje o nowościach i promocjach
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.newsletter_subscribed}
                        onChange={(e) => setProfile(prev => ({ ...prev, newsletter_subscribed: e.target.checked }))}
                        className="h-4 w-4 text-[var(--smakowalo-green-primary)] rounded"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Bezpieczeństwo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Zmień hasło
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Pobierz dane osobowe
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Usuń konto
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
