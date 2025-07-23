'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, ChefHat, Loader, ShoppingCart, Plus, Star, Flame } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import Logo from "@/components/Logo"
import { useCart } from "@/contexts/CartContext"

// Product interface matching our Supabase types
interface Product {
  id: number
  name: string
  description: string
  image: string
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

// Helper function to truncate text
const truncateText = (text: string, maxLength: number) => {
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDiet, setSelectedDiet] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [expandedIds, setExpandedIds] = useState<number[]>([])
  const { addItem, totalItems } = useCart()

  // Fetch products and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch products and categories in parallel
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ])

        const [productsData, categoriesData] = await Promise.all([
          productsResponse.json(),
          categoriesResponse.json()
        ])

        if (productsData.success && productsData.products) {
          setProducts(productsData.products)
        } else {
          setError('Nie udało się pobrać produktów')
        }

        if (categoriesData.success && categoriesData.categories) {
          setCategories(categoriesData.categories)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Wystąpił błąd podczas ładowania danych')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter products by selected diet and category
  const filteredProducts = products.filter(product => {
    const matchesDiet = selectedDiet === 'all' || product.diets.includes(selectedDiet)
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
          {/* Category Filters */}
          {categories.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-[var(--smakowalo-green-dark)] mb-4">
                Filtuj według kategorii:
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  className={selectedCategory === null
                    ? "bg-[var(--smakowalo-brown)] text-white"
                    : "border-[var(--smakowalo-brown)] text-[var(--smakowalo-brown)] hover:bg-[var(--smakowalo-brown)] hover:text-white"
                  }
                  onClick={() => setSelectedCategory(null)}
                >
                  Wszystkie kategorie
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className={selectedCategory === category.id
                      ? "bg-[var(--smakowalo-brown)] text-white"
                      : "border-[var(--smakowalo-brown)] text-[var(--smakowalo-brown)] hover:bg-[var(--smakowalo-brown)] hover:text-white"
                    }
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Diet Filters */}
          <div>
            <h3 className="text-lg font-semibold text-[var(--smakowalo-green-dark)] mb-4">
              Filtruj według preferencji dietetycznych:
            </h3>
            <div className="flex flex-wrap gap-3">
              {dietTypes.map((diet) => (
                <Button
                  key={diet.code}
                  variant={selectedDiet === diet.code ? "default" : "outline"}
                  className={selectedDiet === diet.code
                    ? "bg-[var(--smakowalo-green-primary)] text-white"
                    : "border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-primary)] hover:text-white"
                  }
                  onClick={() => setSelectedDiet(diet.code)}
                >
                  <div className={`w-3 h-3 rounded-full ${diet.color} mr-2`} />
                  {diet.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin text-[var(--smakowalo-green-primary)] mx-auto mb-4" />
              <p className="text-gray-600">Ładowanie produktów...</p>
            </div>
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
                  {selectedDiet === 'all' && selectedCategory === null
                    ? 'Brak dostępnych produktów'
                    : "Brak produktów dla wybranych filtrów"
                  }
                </p>
                {(selectedDiet !== 'all' || selectedCategory !== null) && (
                  <div className="space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedDiet('all')
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
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="w-full overflow-hidden shadow hover:shadow-xl cursor-pointer flex flex-col"
                  >
                    <div className="relative h-56">
                      <Image
                        src={product.image || 'https://via.placeholder.com/300x200?text=Brak+zdjęcia'}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2 flex space-x-2">
                        {Math.random() > 0.7 && (
                          <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded">Nowość</span>
                        )}
                        {Math.random() > 0.5 && (
                          <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded">Popularne</span>
                        )}
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="bg-gray-800/70 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {product.cook_time} min
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-md flex items-center">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold ml-0.5 mr-1">{product.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <CardContent className="p-4 flex-1 flex flex-col">
                      <h3 className="text-base font-bold text-[var(--smakowalo-green-dark)] line-clamp-2">
                        {product.name}
                      </h3>

                      <p className="text-xs text-gray-600 line-clamp-2 mt-1 mb-2">
                        {product.description}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {product.diets.slice(0, 2).map((diet) => (
                          <DietBadge key={`diet-${product.id}-${diet}`} type={diet} />
                        ))}
                        {product.diets.length > 2 && (
                          <span className="text-xs px-1 text-gray-500">+{product.diets.length - 2}</span>
                        )}
                      </div>

                      <div className="flex gap-6 text-xs my-2">
                        <div className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          <span>{product.servings ?? 1} os.</span>
                        </div>
                        <div className="flex items-center">
                          <Flame className="w-3 h-3 mr-1" />
                          <span>{product.calories} kcal</span>
                        </div>
                        <div className="flex items-center">
                          <span className={product.difficulty === 'Łatwy' ? 'text-green-500' :
                                           product.difficulty === 'Średni' ? 'text-amber-500' : 'text-red-500'}>
                            {product.difficulty}
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2 my-2">
                        {['ostre', 'wegetariańskie', 'zdrowsze', 'słodkie'].map((tag, idx) =>
                          Math.random() > 0.6 ? (
                            <div key={idx} className={`w-6 h-6 rounded-full ${
                              idx === 0 ? 'bg-red-500' :
                              idx === 1 ? 'bg-green-500' :
                              idx === 2 ? 'bg-blue-500' : 'bg-amber-500'
                            } flex items-center justify-center`}>
                            </div>
                          ) : null
                        )}
                      </div>

                      <div className="mt-auto pt-3">
                        <Link href={`/danie/${product.id}`} className="block">
                          <Button className="w-full smakowalo-green" size="sm">
                            Zobacz przepis
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
