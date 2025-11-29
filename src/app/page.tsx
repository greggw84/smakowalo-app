'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import HomeContent from '@/components/HomeContent'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, storageKey: 'smakowalo_auth' },
    })
  : null

const MAINTENANCE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === '1'
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'greghdm@gmail.com'

export default function HomePage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(MAINTENANCE)

  useEffect(() => {
    if (!MAINTENANCE || !supabase) return

    const check = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          setIsAdmin(false)
          return
        }

        if (session.user.email === ADMIN_EMAIL) {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      } finally {
        setCheckingAuth(false)
      }
    }

    check()
  }, [])

  // Jeśli maintenance wyłączony – wszyscy widzą stronę
  if (!MAINTENANCE) {
    return <HomeContent />
  }

  // Włączony maintenance – czekamy na auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Ładowanie…</p>
      </div>
    )
  }

  // Maintenance + nie-admin → komunikat
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center p-8 bg-white rounded-xl shadow">
          <h1 className="text-2xl font-bold mb-4">Strona w budowie</h1>
          <p className="text-gray-600 mb-4">
            Pracujemy nad nową wersją smakowalo.pl. Zapraszamy wkrótce!
          </p>
          <p className="text-xs text-gray-400">
            Jeśli jesteś właścicielem, zaloguj się na konto administratora, aby zobaczyć stronę.
          </p>
        </div>
      </div>
    )
  }

  // Maintenance + admin → pełny dostęp
  return <HomeContent />
}
