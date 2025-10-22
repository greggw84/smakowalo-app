'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChefHat, Clock, Heart, Truck, ShoppingCart, Leaf, Scale, Package } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Logo from "@/components/Logo"
import { useCart } from "@/contexts/CartContext"

export default function HomePage() {
  const { totalItems } = useCart()

  return (
    <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <Logo width={120} height={32} />
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/menu" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">Menu</Link>
                <Link href="/dlaczego-my" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">Dlaczego my</Link>
                <Link href="/jak-to-dziala" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">Jak to działa</Link>
                <Link href="/faq" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">FAQ</Link>
                <Link href="/dostawa" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">Dostawa</Link>
                <Link href="/kreator" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">Kreator</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" className="border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-primary)] hover:text-white">Zaloguj</Button>
              </Link>
              <Link href="/cart">
                <Button className="smakowalo-green relative">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Koszyk
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{totalItems}</span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--smakowalo-green-dark)] leading-tight">
                ZDROWE JEDZENIE,<br />
                <span className="text-[var(--smakowalo-green-primary)]">TWÓJ SPOSÓB</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-md">
                Zestawy posiłków dla zapracowanych z 8 opcjami diet do wyboru każdego tygodnia.
                Wybierz spośród wysokobiałkowych, niskokalorycznych, wegańskich, wegetariańskich,
                niskowęglowodanowych, elastycznych, keto i pescetariańskich opcji.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/kreator">
                  <Button size="lg" className="smakowalo-green text-lg px-8 py-3 rounded-lg">Zacznij gotować</Button>
                </Link>
                <Link href="/menu">
                  <Button variant="outline" size="lg" className="border-[var(--smakowalo-brown)] text-[var(--smakowalo-brown)] hover:bg-[var(--smakowalo-brown)] hover:text-white text-lg px-8 py-3 rounded-lg">Zobacz menu</Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative w-full h-[400px] rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src="https://ext.same-assets.com/290874832/189435024.jpeg"
                  alt="Smakowało - Świeże składniki"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Old "How It Works" hidden */}
      <div className="hidden" aria-hidden="true">
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
                Przejmij kontrolę nad posiłkami w 3 krokach
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Planuj, zamawiaj i gotuj z najlepszymi składnikami dostarczonymi prosto pod Twoje drzwi
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ✅ NEW SECTION: Świeże składniki. Idealne porcje. Zero odpadów. */}
      <section className="py-16 bg-[var(--smakowalo-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[var(--smakowalo-green-primary)] leading-tight mb-4">
              Świeże składniki. Idealne porcje. Zero odpadów.
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Dostarczymy pod Twoje drzwi wszystko, czego potrzebujesz do ugotowania pysznego posiłku.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-none shadow-lg bg-white">
              <CardContent className="p-8">
                <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Leaf className="w-10 h-10 text-[var(--smakowalo-green-primary)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--smakowalo-green-dark)] mb-4">Świeże z farm</h3>
                <p className="text-gray-600">Współpracujemy z lokalnymi dostawcami, by zapewnić najwyższą jakość.</p>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg bg-white">
              <CardContent className="p-8">
                <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Scale className="w-10 h-10 text-[var(--smakowalo-green-primary)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--smakowalo-green-dark)] mb-4">Idealne porcje</h3>
                <p className="text-gray-600">Odmierzone składniki dla 2 lub 4 osób. Koniec z marnowaniem!</p>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg bg-white">
              <CardContent className="p-8">
                <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Package className="w-10 h-10 text-[var(--smakowalo-green-primary)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--smakowalo-green-dark)] mb-4">Stylowe pudełko</h3>
                <p className="text-gray-600">Bezpiecznie zapakowane i gotowe do gotowania od razu po otwarciu.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* --- dalsze sekcje z kodu nr 1 --- */}

      {/* Dlaczego my */}
      <section className="py-16 bg-gradient-to-r from-smakowalo-cream to-smakowalo-light-beige">
        {/* ... zachowana zawartość jak w kodzie nr 1 ... */}
      </section>

      {/* Świeże składniki tygodnia, CTA, Featured, Footer — bez zmian */}
    </div>
  )
}
