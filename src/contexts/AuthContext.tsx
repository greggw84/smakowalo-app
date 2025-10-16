'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createSupabaseComponentClient } from '@/lib/supabase'
import type { User, Session, AuthResponse } from '@supabase/supabase-js'

interface UserData {
  firstName: string
  lastName: string
  phone: string
  newsletter: boolean
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData: UserData) => Promise<AuthResponse>
  signIn: (email: string, password: string) => Promise<AuthResponse>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createSupabaseComponentClient()

  // Check if Supabase is configured
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

  useEffect(() => {
    if (!isConfigured || !supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Supabase not available:', error)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
        }
      )

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Supabase auth subscription failed:', error)
    }
  }, [supabase, isConfigured])

  const signUp = async (email: string, password: string, userData: UserData) => {
    if (!isConfigured || !supabase) {
      throw new Error('Supabase is not configured')
    }

    // Call signup API endpoint
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        newsletter: userData.newsletter
      })
    })

    const result = await response.json()

    if (!response.ok || result.error) {
      throw new Error(result.error || 'Nie udało się utworzyć konta')
    }

    return { data: result.data, error: null }
  }

  const signIn = async (email: string, password: string) => {
    if (!isConfigured || !supabase) {
      throw new Error('Supabase is not configured')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return { data, error }
  }

  const signOut = async () => {
    if (!isConfigured || !supabase) {
      throw new Error('Supabase is not configured')
    }

    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
