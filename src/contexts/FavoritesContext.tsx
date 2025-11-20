'use client'

import type React from 'react'
import { createContext, useContext, useState, useEffect } from 'react'
import { trackEvent } from '@/components/Analytics'

interface FavoriteItem {
  id: number
  name: string
  image: string
  price: number
  addedAt: string
}

interface FavoritesContextType {
  favorites: FavoriteItem[]
  addToFavorites: (item: Omit<FavoriteItem, 'addedAt'>) => void
  removeFromFavorites: (id: number) => void
  isFavorite: (id: number) => boolean
  clearFavorites: () => void
  favoritesCount: number
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])

  // Load favorites from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFavorites = localStorage.getItem('smakowalo-favorites')
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites))
        } catch (error) {
          console.error('Error loading favorites from localStorage:', error)
        }
      }
    }
  }, [])

  // Save favorites to localStorage whenever favorites change (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('smakowalo-favorites', JSON.stringify(favorites))
    }
  }, [favorites])

  const addToFavorites = (item: Omit<FavoriteItem, 'addedAt'>) => {
    const newItem: FavoriteItem = {
      ...item,
      addedAt: new Date().toISOString()
    }

    setFavorites(prev => {
      // Check if item already exists
      if (prev.some(fav => fav.id === item.id)) {
        return prev
      }
      return [...prev, newItem]
    })

    // Track analytics event
    trackEvent.viewProduct(item.id.toString(), item.name, item.price)
  }

  const removeFromFavorites = (id: number) => {
    setFavorites(prev => prev.filter(item => item.id !== id))
  }

  const isFavorite = (id: number) => {
    return favorites.some(item => item.id === id)
  }

  const clearFavorites = () => {
    setFavorites([])
  }

  const favoritesCount = favorites.length

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        clearFavorites,
        favoritesCount,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
