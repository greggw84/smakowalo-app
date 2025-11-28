'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  X,
  Loader2,
  Calendar,
  ChefHat,
  Search,
  Package,
  Save
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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
  price: number
  calories?: number
  cook_time?: number
  diets?: string[]
}

interface WeeklyMenu {
  id: string
  week_start_date: string
  week_end_date: string
  label: string
  is_active: boolean
  is_published: boolean
}

interface MenuProduct {
  product_id: number
  position: number
  product: Product
}

export default function WeeklyMenuEditorPage() {
  const router = useRouter()
  const params = useParams()
  const menuId = params?.id as string

  const [session, setSession] = useState<{ access_token: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Menu data
  const [menu, setMenu] = useState<WeeklyMenu | null>(null)
  const [menuProducts, setMenuProducts] = useState<MenuProduct[]>([])
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([])

  // All available products for selection
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showProductSelector, setShowProductSelector] = useState(false)

  // Auth check
  useEffect(() => {
    if (!supabase) return

    const checkAuth = async () => {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (!authSession) {
        router.push('/login')
        return
      }

      // Check admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authSession.user.id)
        .single()

      if (profile?.role !== 'admin') {
        alert('Brak uprawnień administratora')
        router.push('/panel')
        return
      }

      setSession(authSession)
    }

    checkAuth()
  }, [router])

  // Load menu and products
  const loadMenuData = useCallback(async () => {
    if (!session || !menuId) return

    try {
      setLoading(true)

      // Fetch menu details
      const menuResponse = await fetch(`/api/admin/weekly-menu?id=${menuId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const menuData = await menuResponse.json()
      if (!menuData.success) {
        throw new Error(menuData.error || 'Failed to load menu')
      }

      // Find the specific menu
      const currentMenu = menuData.menus?.find((m: WeeklyMenu) => m.id === menuId)
      if (!currentMenu) {
        throw new Error('Menu not found')
      }
      setMenu(currentMenu)

      // Fetch menu items
      const itemsResponse = await fetch(`/api/admin/weekly-menu/items?menu_id=${menuId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json()
        if (itemsData.success && itemsData.items) {
          setMenuProducts(itemsData.items)
          setSelectedProductIds(itemsData.items.map((item: MenuProduct) => item.product_id))
        }
      }

      // Fetch all available products
      const productsResponse = await fetch('/api/products')
      const productsData = await productsResponse.json()
      if (productsData.success && productsData.products) {
        setAllProducts(productsData.products)
      }

    } catch (error) {
      console.error('Error loading menu data:', error)
      alert('Błąd podczas ładowania menu')
    } finally {
      setLoading(false)
    }
  }, [session, menuId])

  useEffect(() => {
    if (session && menuId) {
      loadMenuData()
    }
  }, [session, menuId, loadMenuData])

  // Filter products based on search
  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Toggle product selection
  const toggleProductSelection = (productId: number) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  // Remove product from menu
  const removeProductFromMenu = (productId: number) => {
    setSelectedProductIds(prev => prev.filter(id => id !== productId))
  }

  // Save menu products
  const handleSave = async () => {
    if (!session || !menuId) return

    setSaving(true)
    try {
      const response = await fetch('/api/admin/weekly-menu', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          menu_id: menuId,
          product_ids: selectedProductIds
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('✅ Menu zaktualizowane!')
        await loadMenuData()
      } else {
        throw new Error(result.error || 'Błąd podczas zapisywania')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd'
      alert(`❌ Błąd: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  // Get selected products with full details
  const selectedProducts = allProducts.filter(p => selectedProductIds.includes(p.id))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--smakowalo-green-primary)]" />
      </div>
    )
  }

  if (!menu) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Menu nie znalezione</p>
          <Link href="/admin/weekly-menu">
            <Button>Wróć do listy</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/weekly-menu">
                <Button variant="ghost">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Wróć
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{menu.label}</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(menu.week_start_date).toLocaleDateString('pl-PL')} - {new Date(menu.week_end_date).toLocaleDateString('pl-PL')}
                  </span>
                  {menu.is_active && (
                    <Badge className="bg-green-100 text-green-800 ml-2">Aktywne</Badge>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Zapisz zmiany
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Selected Products */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Produkty w menu ({selectedProductIds.length})
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowProductSelector(!showProductSelector)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Dodaj produkty
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ChefHat className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Brak produktów w menu</p>
                    <p className="text-sm">Kliknij "Dodaj produkty" aby wybrać dania</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm font-medium text-gray-400 w-6">
                          {index + 1}.
                        </span>
                        <Image
                          src={product.image || '/placeholder.jpg'}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            {product.calories && <span>{product.calories} kcal</span>}
                            {product.cook_time && <span>• {product.cook_time} min</span>}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProductFromMenu(product.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Product Selector */}
          <div>
            <Card className={showProductSelector ? '' : 'opacity-50'}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  Wybierz produkty
                </CardTitle>
                <div className="mt-2">
                  <Input
                    placeholder="Szukaj produktów..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                    disabled={!showProductSelector}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-[600px] overflow-y-auto space-y-2">
                  {filteredProducts.map(product => {
                    const isSelected = selectedProductIds.includes(product.id)
                    return (
                      <div
                        key={product.id}
                        onClick={() => showProductSelector && toggleProductSelection(product.id)}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-gray-50 hover:bg-gray-100'
                        } ${!showProductSelector ? 'pointer-events-none' : ''}`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isSelected
                            ? 'bg-[var(--smakowalo-green-primary)] text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          {isSelected ? <Check className="w-4 h-4" /> : null}
                        </div>
                        <Image
                          src={product.image || '/placeholder.jpg'}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {product.name}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.diets?.slice(0, 2).map((diet, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs"
                              >
                                {diet}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {product.price?.toFixed(2)} zł
                        </span>
                      </div>
                    )
                  })}

                  {filteredProducts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Brak produktów pasujących do wyszukiwania</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
