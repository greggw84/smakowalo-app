'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface CartItem {
  id: number
  name: string
  image: string
  price: number
  quantity: number
  selectedMeals?: string[]
  dietPreferences?: string[]
  numberOfPeople?: number
  numberOfDays?: number
  pricePerPortion?: number
  totalPortions?: number
  isMealPlan?: boolean
}

interface CartContextType {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  isLoading: boolean
  getFirstOrderDiscount: () => number
  isFirstOrder: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFirstOrder, setIsFirstOrder] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Handle mounting and localStorage access only on client
  useEffect(() => {
    setIsMounted(true)

    try {
      if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem('smakowalo-cart')
        const hasOrderedBefore = localStorage.getItem('smakowalo-has-ordered')

        if (savedCart) {
          try {
            setItems(JSON.parse(savedCart))
          } catch (error) {
            console.error('Error parsing saved cart:', error)
            localStorage.removeItem('smakowalo-cart')
          }
        }

        if (hasOrderedBefore === 'true') {
          setIsFirstOrder(false)
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save cart to localStorage whenever items change (only after mount)
  useEffect(() => {
    if (!isLoading && isMounted && typeof window !== 'undefined') {
      try {
        localStorage.setItem('smakowalo-cart', JSON.stringify(items))
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
    }
  }, [items, isLoading, isMounted])

  const addItem = (newItem: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === newItem.id)

      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      // Add new item
      return [...prevItems, { ...newItem, quantity }]
    })
  }

  const removeItem = (id: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id))
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getFirstOrderDiscount = () => {
    // 25% discount for first-time customers
    return isFirstOrder ? 0.25 : 0
  }

  // Only calculate totals after mount to avoid hydration mismatch
  const totalItems = isMounted ? items.reduce((sum, item) => sum + item.quantity, 0) : 0
  const subtotal = isMounted ? items.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0
  const discount = subtotal * getFirstOrderDiscount()
  const totalPrice = subtotal - discount

  const value: CartContextType = {
    items: isMounted ? items : [],
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isLoading,
    getFirstOrderDiscount,
    isFirstOrder,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
