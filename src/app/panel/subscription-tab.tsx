'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import SubscriptionOverview from './subscription-overview'
import { Loader2 } from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, storageKey: 'smakowalo_auth' },
}) : null

export default function SubscriptionTab() {
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)
  const [weeklyOrder, setWeeklyOrder] = useState<any>(null)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    if (!supabase) return

    const loadData = async () => {
      try {
        setLoading(true)

        // Get session
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        setSession(session)

        // Get subscription (active, trialing, or past_due)
        const { data: subs } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .in('status', ['active', 'trialing', 'past_due'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        setSubscription(subs)

        // Get current weekly order
        if (subs) {
          const orderResponse = await fetch('/api/subscription/weekly-order', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          })
          const orderData = await orderResponse.json()
          if (orderData.success) {
            setWeeklyOrder(orderData.order)
          }
        }

      } catch (error) {
        console.error('Error loading subscription:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handlePause = async () => {
    if (!subscription || !session) return

    try {
      const response = await fetch('/api/subscription/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'pause',
          subscription_id: subscription.id
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('✅ Subskrypcja wstrzymana')
        window.location.reload()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      alert(`❌ Błąd: ${error.message}`)
    }
  }

  const handleResume = async () => {
    if (!subscription || !session) return

    try {
      const response = await fetch('/api/subscription/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'resume',
          subscription_id: subscription.id
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('✅ Subskrypcja wznowiona')
        window.location.reload()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      alert(`❌ Błąd: ${error.message}`)
    }
  }

  const handleCancel = async () => {
    if (!subscription || !session) return

    try {
      const response = await fetch('/api/subscription/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'cancel',
          subscription_id: subscription.id
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('✅ Subskrypcja zostanie anulowana po zakończeniu bieżącego okresu')
        window.location.reload()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      alert(`❌ Błąd: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--smakowalo-green-primary)]" />
      </div>
    )
  }

  return (
    <SubscriptionOverview
      subscription={subscription}
      weeklyOrder={weeklyOrder}
      onPause={handlePause}
      onResume={handleResume}
      onCancel={handleCancel}
      loading={loading}
    />
  )
}
