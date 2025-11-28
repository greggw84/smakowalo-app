'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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
  EyeOff,
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
  UtensilsCrossed,
  Heart,
  Loader2,
  Key,
  Shield,
  FileText
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import Navigation from '@/components/Navigation'
import { useFavorites } from '@/contexts/FavoritesContext'
import FavoriteButton from '@/components/FavoriteButton'
import SubscriptionTab from './subscription-tab'

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, storageKey: 'smakowalo_auth' },
}) : null

interface Order {
  id: number
  order_number?: string
  total_amount: number
  subtotal: number
  discount_amount: number
  status: string
  created_at: string
  delivery_date?: string
  discount_details?: unknown[]
  order_items?: unknown[]
}

// Subscription weekly order interface for displaying in orders tab
interface SubscriptionWeeklyOrder {
  id: number
  subscription_id: number
  weekly_menu_id?: number
  delivery_date?: string
  delivery_day?: string
  status: string
  is_auto_generated?: boolean
  total_meals?: number
  created_at: string
  updated_at?: string
}

interface Subscription {
  id: number
  stripe_subscription_id?: string
  stripe_customer_id?: string
  status: string
  plan_type?: string
  plan_key?: string
  people?: number
  days?: number
  amount?: number
  price_per_delivery: number
  next_delivery_date?: string
  current_period_end?: string
  meal_plan_config?: any
  diets?: string[]
  allergies?: string[]
  selected_meals?: string[]
  cancel_at_period_end?: boolean
  created_at: string
  pause_until?: string
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

// Favorites Tab Component
function FavoritesTabContent() {
  const { favorites, favoritesCount, clearFavorites } = useFavorites()

  if (favoritesCount === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Brak ulubionych dań
          </h3>
          <p className="text-gray-600 mb-6">
            Dodaj swoje ulubione przepisy, aby móc łatwo do nich wrócić.
          </p>
          <Link href="/menu">
            <Button className="bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)]">
              Przeglądaj menu
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Twoje ulubione dania</h2>
          <p className="text-gray-600">
            Masz {favoritesCount} {favoritesCount === 1 ? 'ulubione danie' : favoritesCount < 5 ? 'ulubione dania' : 'ulubionych dań'}
          </p>
        </div>
        <Button
          onClick={clearFavorites}
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Wyczyść wszystkie
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map((favorite) => (
          <Card key={favorite.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-32">
              <Image
                src={favorite.image}
                alt={favorite.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2">
                <FavoriteButton
                  product={favorite}
                  variant="minimal"
                  className="bg-white/90 backdrop-blur-sm"
                />
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                {favorite.name}
              </h3>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span>{favorite.price.toFixed(2)} zł</span>
                <span className="text-xs">
                  {new Date(favorite.addedAt).toLocaleDateString('pl-PL')}
                </span>
              </div>
              <Link href={`/danie/${favorite.id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  Zobacz przepis
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center pt-6">
        <Link href="/ulubione">
          <Button variant="outline" className="border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]">
            Zobacz wszystkie ulubione
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function PanelPage() {
  const router = useRouter()
  const { favoritesCount } = useFavorites()

  // Supabase states
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Password change dialog
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' })
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })
  const [passwordError, setPasswordError] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Delete account dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  // Export data dialog
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [isExportingData, setIsExportingData] = useState(false)

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
  const [subscriptionOrders, setSubscriptionOrders] = useState<SubscriptionWeeklyOrder[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    totalSaved: 0,
    activeSubscriptions: 0
  })

  const [subscriptionAction, setSubscriptionAction] = useState<{
    id: number | null
    action: 'pause' | 'resume' | 'edit_delivery' | 'edit_meals' | null
    isLoading: boolean
  }>({ id: null, action: null, isLoading: false })

  // Supabase auth check
  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let cancelled = false

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (cancelled) return

        if (error) {
          console.error('Supabase auth error:', error)
          router.replace('/login?callbackUrl=/panel')
          return
        }

        if (session?.user) {
          console.log('✅ User authenticated:', session.user.email)
          setUser(session.user)

          setProfile(prev => ({
            ...prev,
            email: session.user.email || '',
            first_name: session.user.user_metadata?.first_name || session.user.user_metadata?.name?.split(' ')[0] || '',
            last_name: session.user.user_metadata?.last_name || session.user.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
            phone: session.user.user_metadata?.phone || ''
          }))

          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (cancelled) return

            if (event === 'SIGNED_OUT') {
              router.replace('/login?callbackUrl=/panel')
            }
          })

          await loadUserData(session.user)

          setLoading(false)
        } else {
          console.log('🚫 No session, redirecting to login')
          router.replace('/login?callbackUrl=/panel')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        if (!cancelled) {
          router.replace('/login?callbackUrl=/panel')
        }
      }
    }

    // Increase delay to allow Supabase session to fully persist after login
    const timer = setTimeout(checkAuth, 500)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [router])

  const loadUserData = async (currentUser: { id: string; email?: string | null }) => {
    if (!currentUser || !supabase) return
    
    // Email is required for some queries
    const userEmail = currentUser.email || ''

    try {
      // Load profile from Supabase
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      if (profileData) {
        setProfile(prev => ({ ...prev, ...profileData }))
      }

      // Load orders - query by user_id OR customer_email to handle legacy orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .or(`user_id.eq.${currentUser.id},customer_email.eq.${userEmail}`)
        .order('created_at', { ascending: false })
      
      if (ordersError) {
        console.error('Error loading orders:', ordersError)
      } else if (ordersData) {
        setOrders(ordersData)
        if (process.env.NODE_ENV === 'development') {
          console.log('📦 Loaded orders:', ordersData.length)
        }
      }

      // Load subscription weekly orders - these are the actual deliveries
      const { data: subOrdersData, error: subOrdersError } = await supabase
        .from('subscription_weekly_orders')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('delivery_date', { ascending: false })
      
      if (subOrdersError) {
        console.error('Error loading subscription orders:', subOrdersError)
      } else if (subOrdersData) {
        setSubscriptionOrders(subOrdersData)
        if (process.env.NODE_ENV === 'development') {
          console.log('📦 Loaded subscription orders:', subOrdersData.length)
        }
      }

      // Load subscriptions - query by user_id OR customer_email
      const { data: subsData, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .or(`user_id.eq.${currentUser.id},customer_email.eq.${userEmail}`)
        .order('created_at', { ascending: false })
      
      if (subsError) {
        console.error('Error loading subscriptions:', subsError)
      } else if (subsData) {
        setSubscriptions(subsData)
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Loaded subscriptions:', subsData.length)
        }
      }

      // Calculate stats - include paused subscriptions in count
      // For active subscriptions: count those with active, trialing, past_due, or paused status
      const activeSubsCount = subsData?.filter(s => ['active', 'trialing', 'past_due', 'paused'].includes(s.status)).length || 0
      
      // Total orders includes both regular orders and subscription weekly orders
      const regularOrdersCount = ordersData?.length || 0
      const subscriptionOrdersCount = subOrdersData?.length || 0
      const totalOrdersCount = regularOrdersCount + subscriptionOrdersCount
      
      const totalSpent = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      const totalSaved = ordersData?.reduce((sum, order) => sum + (order.discount_amount || 0), 0) || 0
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Panel stats:', {
          regularOrders: regularOrdersCount,
          subscriptionOrders: subscriptionOrdersCount,
          totalOrders: totalOrdersCount,
          activeSubscriptions: activeSubsCount,
          totalSpent,
          totalSaved
        })
      }
      
      setStats({
        totalOrders: totalOrdersCount,
        totalSpent,
        totalSaved,
        activeSubscriptions: activeSubsCount
      })

    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const handleProfileUpdate = async () => {
    if (!user || !supabase) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profile,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setIsEditing(false)
      alert('Profil został zaktualizowany!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Błąd podczas aktualizacji profilu')
    } finally {
      setIsSaving(false)
    }
  }

  // Password change functionality
  const handlePasswordChange = async () => {
    if (!supabase) return

    setPasswordError('')

    // Validation
    if (!passwordData.new || !passwordData.confirm) {
      setPasswordError('Wypełnij wszystkie pola')
      return
    }

    if (passwordData.new.length < 6) {
      setPasswordError('Hasło musi mieć minimum 6 znaków')
      return
    }

    if (passwordData.new !== passwordData.confirm) {
      setPasswordError('Nowe hasła nie są identyczne')
      return
    }

    setIsChangingPassword(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      })

      if (error) throw error

      setShowPasswordDialog(false)
      setPasswordData({ current: '', new: '', confirm: '' })
      alert('Hasło zostało zmienione pomyślnie!')
    } catch (error: any) {
      console.error('Password change error:', error)
      setPasswordError(error.message || 'Błąd podczas zmiany hasła')
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Export user data (GDPR)
  const handleExportData = async () => {
    if (!user || !supabase) return

    setIsExportingData(true)

    try {
      // Collect all user data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const userData = {
        profile: profileData,
        account: {
          email: user.email,
          created_at: user.created_at,
          last_sign_in: user.last_sign_in_at
        },
        orders: orders,
        subscriptions: subscriptions,
        favorites: [],
        exported_at: new Date().toISOString()
      }

      // Create downloadable JSON file
      const dataStr = JSON.stringify(userData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `smakowalo-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setShowExportDialog(false)
      alert('Dane zostały pobrane!')
    } catch (error) {
      console.error('Export error:', error)
      alert('Błąd podczas eksportu danych')
    } finally {
      setIsExportingData(false)
    }
  }

  // Delete account functionality
  const handleDeleteAccount = async () => {
    if (!user || !supabase) return

    if (deleteConfirmText !== 'USUŃ KONTO') {
      alert('Wpisz "USUŃ KONTO" aby potwierdzić')
      return
    }

    setIsDeletingAccount(true)

    try {
      // Call API to delete account
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      // Sign out and redirect
      await supabase.auth.signOut()
      router.push('/')
      alert('Konto zostało usunięte')
    } catch (error) {
      console.error('Delete account error:', error)
      alert('Błąd podczas usuwania konta')
      setIsDeletingAccount(false)
    }
  }

  // Subscription management
  const handlePauseSubscription = async (subscriptionId: number, stripeSubId?: string) => {
    const pauseUntil = prompt('Do kiedy wstrzymać subskrypcję? (YYYY-MM-DD) Pozostaw puste dla nieokreślonego czasu:')

    if (pauseUntil !== null) {
      setSubscriptionAction({ id: subscriptionId, action: 'pause', isLoading: true })

      try {
        const response = await fetch('/api/subscriptions/pause', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription_id: subscriptionId,
            stripe_subscription_id: stripeSubId,
            pause_until: pauseUntil || null
          })
        })

        if (!response.ok) throw new Error('Failed to pause subscription')

        await loadUserData(user)
        alert('Subskrypcja została wstrzymana')
      } catch (error) {
        console.error('Pause subscription error:', error)
        alert('Błąd podczas wstrzymywania subskrypcji')
      } finally {
        setSubscriptionAction({ id: null, action: null, isLoading: false })
      }
    }
  }

  const handleResumeSubscription = async (subscriptionId: number, stripeSubId?: string) => {
    setSubscriptionAction({ id: subscriptionId, action: 'resume', isLoading: true })

    try {
      const response = await fetch('/api/subscriptions/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_id: subscriptionId,
          stripe_subscription_id: stripeSubId
        })
      })

      if (!response.ok) throw new Error('Failed to resume subscription')

      await loadUserData(user)
      alert('Subskrypcja została wznowiona')
    } catch (error) {
      console.error('Resume subscription error:', error)
      alert('Błąd podczas wznawiania subskrypcji')
    } finally {
      setSubscriptionAction({ id: null, action: null, isLoading: false })
    }
  }

  const handleCancelSubscription = async (subscriptionId: number, stripeSubId?: string) => {
    if (!confirm('Czy na pewno chcesz anulować subskrypcję? Ta akcja jest nieodwracalna.')) return

    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_id: subscriptionId,
          stripe_subscription_id: stripeSubId
        })
      })

      if (!response.ok) throw new Error('Failed to cancel subscription')

      await loadUserData(user)
      alert('Subskrypcja została anulowana')
    } catch (error) {
      console.error('Cancel subscription error:', error)
      alert('Błąd podczas anulowania subskrypcji')
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'confirmed': case 'preparing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-yellow-100 text-yellow-800'
      case 'canceled': case 'failed': return 'bg-red-100 text-red-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'skipped': return 'bg-orange-100 text-orange-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Oczekujące', 
      'confirmed': 'Potwierdzone', 
      'preparing': 'Przygotowywane',
      'shipped': 'Wysłane', 
      'delivered': 'Dostarczone', 
      'canceled': 'Anulowane',
      // Subscription weekly order statuses
      'scheduled': 'Zaplanowane',
      'skipped': 'Pominięte',
      'failed': 'Nieudane'
    }
    return statusMap[status] || status
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white">
        <Navigation currentPage="/panel" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="p-6 animate-pulse">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="ml-3 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--smakowalo-green-primary)]" />
              <p className="text-gray-600 text-sm">Ładowanie panelu...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white">
      <Navigation currentPage="/panel" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--smakowalo-green-dark)]">
            Witaj, {profile.first_name || 'Użytkowniku'}!
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
                { id: 'favorites', label: 'Ulubione', icon: Heart },
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
                    <Input id="email" type="email" value={profile.email} disabled />
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
                      value={profile.street_address || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, street_address: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Miasto</Label>
                    <Input
                      id="city"
                      value={profile.city || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Kod pocztowy</Label>
                    <Input
                      id="postalCode"
                      value={profile.postal_code || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, postal_code: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                {isEditing && (
                  <div className="flex space-x-3">
                    <Button onClick={handleProfileUpdate} disabled={isSaving} className="smakowalo-green">
                      Zapisz zmiany
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        loadUserData(user)
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
                {orders.length === 0 && subscriptionOrders.length === 0 ? (
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
                  <>
                    {/* Subscription Weekly Orders (Deliveries) */}
                    {subscriptionOrders.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                          <RefreshCw className="w-5 h-5 mr-2 text-[var(--smakowalo-green-primary)]" />
                          Dostawy subskrypcji
                        </h3>
                        {subscriptionOrders.map((subOrder) => (
                          <Card key={`sub-${subOrder.id}`}>
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-3">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      Dostawa #{subOrder.id}
                                    </h3>
                                    <Badge className={getStatusBadgeColor(subOrder.status)}>
                                      {getStatusText(subOrder.status)}
                                    </Badge>
                                    {subOrder.is_auto_generated && (
                                      <Badge variant="outline" className="text-xs">
                                        Auto
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    Dostawa: {subOrder.delivery_date 
                                      ? new Date(subOrder.delivery_date).toLocaleDateString('pl-PL') 
                                      : 'Nie ustalono'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Utworzono: {new Date(subOrder.created_at).toLocaleDateString('pl-PL')}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-700">
                                    {subOrder.total_meals || 0} posiłków
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Regular Orders */}
                    {orders.length > 0 && (
                      <div className="space-y-4">
                        {subscriptionOrders.length > 0 && (
                          <h3 className="text-lg font-semibold text-gray-700 flex items-center mt-6">
                            <Package className="w-5 h-5 mr-2 text-[var(--smakowalo-green-primary)]" />
                            Pozostałe zamówienia
                          </h3>
                        )}
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
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-[var(--smakowalo-green-primary)]">
                                    {order.total_amount.toFixed(2)} zł
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Subscriptions Tab */}
            {activeTab === 'subscriptions' && (
              <SubscriptionTab />
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && <FavoritesTabContent />}

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
                        <p className="text-sm text-gray-600">Otrzymuj informacje o nowościach i promocjach</p>
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
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Bezpieczeństwo i prywatność
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowPasswordDialog(true)}
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Zmień hasło
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowExportDialog(true)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Pobierz dane osobowe (GDPR)
                    </Button>
                    <Separator />
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => setShowDeleteDialog(true)}
                    >
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

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zmiana hasła</DialogTitle>
            <DialogDescription>
              Wprowadź nowe hasło. Musi mieć minimum 6 znaków.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {passwordError}
              </div>
            )}
            <div>
              <Label htmlFor="new-password">Nowe hasło</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.new}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                  placeholder="Nowe hasło"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirm-password">Potwierdź hasło</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                  placeholder="Powtórz nowe hasło"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Anuluj
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={isChangingPassword}
              className="smakowalo-green"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Zmieniam...
                </>
              ) : (
                'Zmień hasło'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eksport danych osobowych</DialogTitle>
            <DialogDescription>
              Pobierz wszystkie swoje dane w formacie JSON zgodnie z GDPR.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded">
            <p className="text-sm text-blue-800">
              Plik będzie zawierał:
            </p>
            <ul className="text-sm text-blue-700 mt-2 ml-4 list-disc">
              <li>Dane profilu</li>
              <li>Historia zamówień</li>
              <li>Subskrypcje</li>
              <li>Ulubione przepisy</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Anuluj
            </Button>
            <Button
              onClick={handleExportData}
              disabled={isExportingData}
              className="smakowalo-green"
            >
              {isExportingData ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eksportowanie...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Pobierz dane
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Usuń konto</DialogTitle>
            <DialogDescription>
              Ta akcja jest nieodwracalna. Wszystkie twoje dane zostaną trwale usunięte.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 p-4 rounded">
              <p className="text-sm text-red-800 font-medium mb-2">
                Zostaną usunięte:
              </p>
              <ul className="text-sm text-red-700 ml-4 list-disc">
                <li>Profil i dane osobowe</li>
                <li>Historia zamówień</li>
                <li>Aktywne subskrypcje</li>
                <li>Ulubione przepisy</li>
              </ul>
            </div>
            <div>
              <Label htmlFor="delete-confirm">
                Wpisz <strong>USUŃ KONTO</strong> aby potwierdzić
              </Label>
              <Input
                id="delete-confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="USUŃ KONTO"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Anuluj
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount || deleteConfirmText !== 'USUŃ KONTO'}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeletingAccount ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Usuwanie...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Usuń konto
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
