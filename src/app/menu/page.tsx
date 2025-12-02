'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, ChefHat, Loader, ShoppingCart, Plus, Flame, AlertCircle } from "lucide-react"
import { MenuGridSkeleton } from "@/components/Loading"
import { ErrorFallback } from "@/components/ErrorBoundary"
import { trackEvent } from "@/components/Analytics"
import FavoriteButton from "@/components/FavoriteButton"
import ProductImage from "@/components/ProductImage"
import Link from "next/link"
import Logo from "@/components/Logo"
import { useCart } from "@/contexts/CartContext"

// Maximum number of diet filters allowed (excluding "Wszystkie")
const MAX_DIET_FILTERS = 3

// Product interface matching Supabase weekly menu products
interface Product {
  id: number
  name: string
  description: string
  image: string
  image_url?: string // Products from weekly menu API use image_url
  cook_time: number
  difficulty: string
  diets: string[]
  calories: number
  protein: number
  ingredients: string[]
  price: number
  rating: number
  category_id: number
  servings?: number
  categories?: {
    name: string
    slug: string
  }
  // TODO: Add these fields to Supabase schema if not present:
  // cooking_time_minutes?: number
  // kcal_per_portion?: number
  // diet_types?: string[]
}

// Weekly menu interface
interface WeeklyMenu {
  id: string
  week_start_date: string
  week_end_date: string
  label: string
  items: {
    product: Product
  }[]
}

// Category interface
interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  image: string | null
  active: boolean
}

const dietTypes = [
  { code: "all", name: "Wszystkie", color: "bg-gray-500" },
  { code: "keto", name: "Keto", color: "bg-purple-500" },
  { code: "niskowęglowodanowa", name: "Niskowęglowodanowa", color: "bg-blue-500" },
  { code: "zdrowa", name: "Zdrowa", color: "bg-green-500" },
  { code: "wegetariańska", name: "Wegetariańska", color: "bg-orange-500" },
  { code: "wegańska", name: "Wegańska", color: "bg-emerald-500" }
]

// Helper function to get product image URL (prefers image_url from weekly menu, falls back to image)
const getProductImage = (product: Product): string => {
  return product.image_url || product.image || '/placeholder.jpg'
}

// Helper function to truncate text
const truncateText = (text: string | null | undefined, maxLength: number) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}
// Add component for diet type badges
function DietBadge({ type }: { type: string }) {
  const getBadgeStyle = () => {
    switch (type.toLowerCase()) {
      case 'wegetariańska':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'wegańska':
        return 'bg-emerald-500 text-white hover:bg-emerald-600';
      case 'pescetariańska':
        return 'bg-cyan-500 text-white hover:bg-cyan-600';
      case 'keto':
        return 'bg-amber-500 text-white hover:bg-amber-600';
      case 'wysokobiałkowa':
        return 'bg-purple-500 text-white hover:bg-purple-600';
      case 'niskokaloryczna':
        return 'bg-pink-400 text-white hover:bg-pink-500';
      default:
        return 'bg-gray-500 text-white hover:bg-gray-600';
    }
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${getBadgeStyle()}`}>
      {type}
    </span>
  );
}

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenu | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Changed from single diet to array of selected diets for multi-select with limit
  const [selectedDiets, setSelectedDiets] = useState<string[]>(['all'])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [expandedIds, setExpandedIds] = useState<number[]>([])
  const [dataSource, setDataSource] = useState<string>('')
  const [filterLimitMessage, setFilterLimitMessage] = useState<string | null>(null)
  const filterMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { addItem, totalItems } = useCart()

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (filterMessageTimeoutRef.current) {
        clearTimeout(filterMessageTimeoutRef.current)
      }
    }
  }, [])

  // Handle diet filter selection with limit enforcement
  const handleDietSelect = useCallback((dietCode: string) => {
    // Clear any existing timeout
    if (filterMessageTimeoutRef.current) {
      clearTimeout(filterMessageTimeoutRef.current)
      filterMessageTimeoutRef.current = null
    }
    setFilterLimitMessage(null)

    if (dietCode === 'all') {
      // "Wszystkie" clears all other filters and selects only "all"
      setSelectedDiets(['all'])
      return
    }

    setSelectedDiets(prev => {
      // If "all" is currently selected, remove it and add the new diet
      if (prev.includes('all')) {
        return [dietCode]
      }

      // If already selected, remove it (but ensure at least one remains)
      if (prev.includes(dietCode)) {
        const newDiets = prev.filter(d => d !== dietCode)
        // If no diets remain, revert to "Wszystkie"
        if (newDiets.length === 0) {
          return ['all']
        }
        return newDiets
      }

      // If trying to add a 4th filter, show message and prevent selection
      if (prev.length >= MAX_DIET_FILTERS) {
        setFilterLimitMessage(`Możesz wybrać maksymalnie ${MAX_DIET_FILTERS} preferencje jednocześnie`)
        // Hide message after 3 seconds with cleanup
        filterMessageTimeoutRef.current = setTimeout(() => {
          setFilterLimitMessage(null)
          filterMessageTimeoutRef.current = null
        }, 3000)
        return prev
      }

      // Add the new diet
      return [...prev, dietCode]
    })
  }, [])

  // Fetch products from weekly menu API (primary) or products API (fallback)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        console.log('🔍 Fetching menu data...')

        // First try to get the weekly menu (same source as /panel/select-meals)
        try {
          const menuResponse = await fetch('/api/menu/weekly/current')
          const menuData = await menuResponse.json()

          if (menuData.success && menuData.menu?.items?.length > 0) {
            setWeeklyMenu(menuData.menu)
            
            // Extract products from weekly menu items using WeeklyMenu type structure
            const weeklyProducts = (menuData.menu as WeeklyMenu).items
              .map((item) => item.product)
              .filter((p): p is Product => p !== null)

            if (weeklyProducts.length > 0) {
              setProducts(weeklyProducts)
              setDataSource('supabase-weekly-menu')
              console.log(`✅ Loaded ${weeklyProducts.length} products from weekly menu (Supabase)`)
              
              // Also fetch categories for filtering
              const categoriesResponse = await fetch('/api/categories')
              const categoriesData = await categoriesResponse.json()
              if (categoriesData.success && categoriesData.categories) {
                setCategories(categoriesData.categories)
              }
              
              setLoading(false)
              return
            }
          }
          console.log('⚠️ No weekly menu products found, falling back to products API')
        } catch (weeklyMenuError) {
          console.log('⚠️ Weekly menu fetch failed, falling back to products API:', weeklyMenuError)
        }

        // Fallback to products API
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ])

        const [productsData, categoriesData] = await Promise.all([
          productsResponse.json(),
          categoriesResponse.json()
        ])

        console.log('📦 Menu Data Response:', {
          success: productsData.success,
          source: productsData.source,
          products_count: productsData.products?.length || 0,
          categories_count: categoriesData.categories?.length || 0
        })

        if (productsData.success && productsData.products) {
          setProducts(productsData.products)
          setDataSource(productsData.source || 'api')
          console.log(`✅ Loaded ${productsData.products.length} products from ${productsData.source || 'API'}`)
        } else {
          setError('Nie udało się pobrać produktów')
        }

        if (categoriesData.success && categoriesData.categories) {
          setCategories(categoriesData.categories)
        }
      } catch (err) {
        console.error('❌ Error fetching menu data:', err)
        setError('Wystąpił błąd podczas ładowania danych menu')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter products by selected diets and category
  const filteredProducts = products.filter(product => {
    // If "all" is selected, match all products
    const matchesDiet = selectedDiets.includes('all') || 
      // Match if product has any of the selected diets
      (product.diets ?? []).some(diet => selectedDiets.includes(diet.toLowerCase()))
    const matchesCategory = selectedCategory === null || product.category_id === selectedCategory
    return matchesDiet && matchesCategory
  })

  // Handle adding product to cart
  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price
    })

    // Track cart addition for analytics
    trackEvent.addToCart(
      product.id.toString(),
      product.name,
      product.price,
      1
    )
  }

  // Handle product view tracking
  const handleProductView = (product: Product) => {
    trackEvent.viewProduct(
      product.id.toString(),
      product.name,
      product.price
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <Logo width={120} height={32} />
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/menu" className="text-[var(--smakowalo-green-primary)] hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium border-b-2 border-[var(--smakowalo-green-primary)]">
                  Menu
                </Link>
                <Link href="/dlaczego-my" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">
                  Dlaczego my
                </Link>
                <Link href="/jak-to-dziala" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">
                  Jak to działa
                </Link>
                <Link href="/faq" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">
                  FAQ
                </Link>
                <Link href="/dostawa" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">
                  Dostawa
                </Link>
                <Link href="/kreator" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">
                  Kreator
                </Link>
                <Link href="/ulubione" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">
                  Ulubione
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" className="border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]">
                  Zaloguj
                </Button>
              </Link>
              <Link href="/cart">
                <Button className="smakowalo-green relative">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Koszyk
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
            Menu tego tygodnia
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Wybierz spośród różnorodnych, zdrowych przepisów zaprojektowanych przez naszych dietetyków.
            Nowe menu każdego tygodnia!
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-6">
          {/* Diet Filters */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-[var(--smakowalo-green-dark)]">
                Filtruj według preferencji dietetycznych:
              </h3>
              {!selectedDiets.includes('all') && (
                <span className="text-sm text-gray-500">
                  ({selectedDiets.length}/{MAX_DIET_FILTERS} wybranych)
                </span>
              )}
            </div>
            
            {/* Filter limit warning message */}
            {filterLimitMessage && (
              <div className="mb-4 flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{filterLimitMessage}</span>
              </div>
            )}
            
            <div className="flex flex-wrap gap-3">
              {dietTypes.map((diet) => {
                const isSelected = selectedDiets.includes(diet.code)
                const isDisabled = !isSelected && 
                                   !selectedDiets.includes('all') && 
                                   selectedDiets.length >= MAX_DIET_FILTERS &&
                                   diet.code !== 'all'
                
                return (
                  <Button
                    key={diet.code}
                    variant={isSelected ? "default" : "outline"}
                    className={`${isSelected
                      ? "bg-[var(--smakowalo-green-primary)] text-white"
                      : isDisabled
                        ? "border-gray-300 text-gray-400 cursor-not-allowed opacity-50"
                        : "border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-primary)] hover:text-white"
                    } transition-all`}
                    onClick={() => handleDietSelect(diet.code)}
                    disabled={isDisabled}
                  >
                    <div className={`w-3 h-3 rounded-full ${diet.color} mr-2`} />
                    {diet.name}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin text-[var(--smakowalo-green-primary)] mx-auto mb-4" />
              <p className="text-gray-600">Ładowanie produktów...</p>
            </div>
            <MenuGridSkeleton count={12} />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)]"
              >
                Spróbuj ponownie
              </Button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-600 text-lg mb-4">
                  {selectedDiets.includes('all') && selectedCategory === null
                    ? 'Brak dostępnych produktów'
                    : "Brak produktów dla wybranych filtrów"
                  }
                </p>
                {(!selectedDiets.includes('all') || selectedCategory !== null) && (
                  <div className="space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedDiets(['all'])
                        setSelectedCategory(null)
                      }}
                      className="border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]"
                    >
                      Wyczyść filtry
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const productImage = getProductImage(product)
                  const diets = product.diets ?? []
                  
                  return (
                  <Card
                    key={product.id}
                    className="w-full overflow-hidden shadow hover:shadow-xl cursor-pointer flex flex-col transition-shadow duration-200"
                  >
                    <div className="relative h-56">
                      <ProductImage
                        src={productImage}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />

                      <div className="absolute top-2 right-2 flex items-center space-x-2">
                        <FavoriteButton
                          product={{
                            id: product.id,
                            name: product.name,
                            image: productImage,
                            price: product.price
                          }}
                          variant="minimal"
                          className="bg-white/90 backdrop-blur-sm"
                        />
                      </div>

                    </div>

                    <CardContent className="p-4 flex-1 flex flex-col">
                      <h3 className="text-base font-bold text-[var(--smakowalo-green-dark)] line-clamp-2 mb-2">
                        {product.name}
                      </h3>

                      {/* Meta row with time and calories - prominent display */}
                      <div className="flex items-center gap-4 text-sm text-gray-700 mb-3 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-[var(--smakowalo-green-primary)]" />
                          <span className="font-medium">{product.cook_time} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <span className="font-medium">{product.calories} kcal</span>
                        </div>
                        {product.protein > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Białko:</span>
                            <span className="font-medium">{product.protein}g</span>
                          </div>
                        )}
                      </div>

                      {/* Diet labels */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {diets.slice(0, 3).map((diet) => (
                          <DietBadge key={`diet-${product.id}-${diet}`} type={diet} />
                        ))}
                        {diets.length > 3 && (
                          <span className="text-xs px-1.5 py-0.5 text-gray-500 bg-gray-100 rounded-full">+{diets.length - 3}</span>
                        )}
                      </div>

                      {/* Difficulty indicator */}
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Poziom:</span>
                        <span className={`font-medium ${
                          product.difficulty === 'Łatwy' ? 'text-green-600' :
                          product.difficulty === 'Średni' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {product.difficulty || 'Średni'}
                        </span>
                      </div>

                      <div className="mt-auto pt-2">
                        <Link
                          href={`/danie/${product.id}`}
                          className="block"
                          onClick={() => handleProductView(product)}
                        >
                          <Button className="w-full smakowalo-green" size="sm">
                            Zobacz przepis
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                  )
                })}
              </div>
            )
        )}

        {/* CTA Section */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="bg-gradient-to-r from-[var(--smakowalo-green-primary)] to-[var(--smakowalo-green-dark)] rounded-lg p-8 mt-12">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">
                Gotowy na rozpoczęcie?
              </h2>
              <p className="text-lg mb-6 opacity-90">
                Skorzystaj z kreatora, aby stworzyć idealny zestaw posiłków dla siebie
              </p>
              <Link href="/kreator">
                <Button
                  size="lg"
                  className="bg-white text-[var(--smakowalo-green-primary)] hover:bg-gray-100 text-lg px-8 py-3"
                >
                  Stwórz swój box
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Additional CTA */}
        {!loading && !error && (
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
              Nie możesz się zdecydować?
            </h3>
            <p className="text-gray-600 mb-6">
              Pozwól naszemu kreatorowi pomóc Ci wybrać idealne dania dla Twoich preferencji
            </p>
            <Link href="/kreator">
              <Button
                size="lg"
                className="smakowalo-green text-lg px-8 py-3"
              >
                Użyj kreatora zamówień
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
