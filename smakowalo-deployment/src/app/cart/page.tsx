'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import Logo from "@/components/Logo"
import { useCart } from "@/contexts/CartContext"

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart, isLoading } = useCart()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--smakowalo-green-primary)] border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Ładowanie koszyka...</p>
        </div>
      </div>
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
                <Link href="/menu" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">
                  Menu
                </Link>
                <Link href="/kreator" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">
                  Kreator
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">
                  O nas
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" className="border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]">
                  Zaloguj
                </Button>
              </Link>
              <Button className="smakowalo-green relative">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Koszyk
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/menu">
            <Button variant="outline" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Powrót do menu
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--smakowalo-green-dark)]">
            Twój koszyk
          </h1>
        </div>

        {items.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">
              Twój koszyk jest pusty
            </h2>
            <p className="text-gray-500 mb-8">
              Dodaj produkty z naszego menu, aby rozpocząć zakupy
            </p>
            <Link href="/menu">
              <Button className="smakowalo-green text-lg px-8 py-3">
                Przeglądaj menu
              </Button>
            </Link>
          </div>
        ) : (
          /* Cart with Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[var(--smakowalo-green-dark)]">
                  Produkty ({totalItems})
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Wyczyść koszyk
                </Button>
              </div>

              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-[var(--smakowalo-green-dark)] mb-1">
                          {item.name}
                        </h3>
                        <p className="text-lg font-bold text-[var(--smakowalo-green-primary)]">
                          {item.price.toFixed(2)} zł
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-lg font-semibold w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Item Total & Remove */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-[var(--smakowalo-green-primary)] mb-2">
                          {(item.price * item.quantity).toFixed(2)} zł
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-xl text-[var(--smakowalo-green-dark)]">
                    Podsumowanie zamówienia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Produkty ({totalItems}):</span>
                      <span>{totalPrice.toFixed(2)} zł</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dostawa:</span>
                      <span>{totalPrice >= 150 ? 'Gratis!' : '15.99 zł'}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Łącznie:</span>
                        <span className="text-[var(--smakowalo-green-primary)]">
                          {(totalPrice + (totalPrice >= 150 ? 0 : 15.99)).toFixed(2)} zł
                        </span>
                      </div>
                    </div>
                  </div>

                  {totalPrice < 150 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Dodaj jeszcze {(150 - totalPrice).toFixed(2)} zł</strong> do zamówienia,
                        aby otrzymać darmową dostawę!
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Link href="/checkout">
                      <Button className="w-full smakowalo-green text-lg py-3">
                        Przejdź do płatności
                      </Button>
                    </Link>
                    <Link href="/menu">
                      <Button variant="outline" className="w-full">
                        Kontynuuj zakupy
                      </Button>
                    </Link>
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    Bezpieczne płatności przez Stripe
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
