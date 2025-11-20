'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, Trash2, ShoppingCart, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Logo from '@/components/Logo'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useCart } from '@/contexts/CartContext'
import FavoriteButton from '@/components/FavoriteButton'
import { trackEvent } from '@/components/Analytics'

export default function FavoritesPageClient() {
  const { favorites, clearFavorites, favoritesCount } = useFavorites()
  const { addItem } = useCart()

  const handleAddToCart = (favorite: any) => {
    addItem({
      id: favorite.id,
      name: favorite.name,
      image: favorite.image,
      price: favorite.price
    })

    trackEvent.addToCart(
      favorite.id.toString(),
      favorite.name,
      favorite.price,
      1
    )
  }

  return (
    <div className="min-h-screen bg-[var(--smakowalo-cream)]">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <Logo width={120} height={32} />
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/menu" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">
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
                <Link href="/ulubione" className="text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium border-b-2 border-[var(--smakowalo-green-primary)]">
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
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[var(--smakowalo-green-primary)]">Strona główna</Link>
            <span>/</span>
            <span className="text-[var(--smakowalo-green-dark)] font-medium">Ulubione dania</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--smakowalo-green-dark)] mb-2">
              Twoje ulubione dania
            </h1>
            <p className="text-gray-600">
              {favoritesCount === 0
                ? 'Nie masz jeszcze żadnych ulubionych dań'
                : `Masz ${favoritesCount} ${favoritesCount === 1 ? 'ulubione danie' : favoritesCount < 5 ? 'ulubione dania' : 'ulubionych dań'}`
              }
            </p>
          </div>

          {favoritesCount > 0 && (
            <Button
              onClick={clearFavorites}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Wyczyść wszystkie
            </Button>
          )}
        </div>

        {/* Empty State */}
        {favoritesCount === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl p-12 shadow-lg max-w-md mx-auto">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Brak ulubionych dań
              </h3>
              <p className="text-gray-600 mb-6">
                Dodaj swoje ulubione przepisy, aby móc łatwo do nich wrócić.
              </p>
              <div className="space-y-3">
                <Link href="/menu">
                  <Button className="w-full bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)]">
                    Przeglądaj menu
                  </Button>
                </Link>
                <Link href="/kreator">
                  <Button variant="outline" className="w-full border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]">
                    Użyj kreatora
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Favorites Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48">
                  <Image
                    src={favorite.image}
                    alt={favorite.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <FavoriteButton
                      product={favorite}
                      variant="minimal"
                      className="bg-white/90 backdrop-blur-sm"
                    />
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-black/60 text-white px-2 py-1 rounded text-xs">
                      {favorite.price.toFixed(2)} zł
                    </span>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-bold text-[var(--smakowalo-green-dark)] mb-2 line-clamp-2">
                    {favorite.name}
                  </h3>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="mr-4">30 min</span>
                    <Users className="w-4 h-4 mr-1" />
                    <span>2 osoby</span>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    Dodano: {new Date(favorite.addedAt).toLocaleDateString('pl-PL')}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/danie/${favorite.id}`} className="flex-1">
                      <Button variant="outline" className="w-full text-sm">
                        Zobacz przepis
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleAddToCart(favorite)}
                      size="sm"
                      className="bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)]"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA Section */}
        {favoritesCount > 0 && (
          <div className="bg-gradient-to-r from-[var(--smakowalo-green-primary)] to-[var(--smakowalo-green-dark)] rounded-lg p-8 mt-12">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">
                Chcesz odkryć więcej smaków?
              </h2>
              <p className="text-lg mb-6 opacity-90">
                Sprawdź nasze aktualne menu lub skorzystaj z kreatora
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/menu">
                  <Button
                    size="lg"
                    className="bg-white text-[var(--smakowalo-green-primary)] hover:bg-gray-100"
                  >
                    Przeglądaj menu
                  </Button>
                </Link>
                <Link href="/kreator">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-[var(--smakowalo-green-primary)]"
                  >
                    Stwórz swój box
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
