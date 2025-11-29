'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChefHat, Clock, Heart, Truck, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Logo from "@/components/Logo"
import { useCart } from "@/contexts/CartContext"

export default function HomeContent() {
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
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" className="border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-primary)] hover:text-white">
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
                  <Button
                    size="lg"
                    className="smakowalo-green text-lg px-8 py-3 rounded-lg"
                  >
                    Zacznij gotować
                  </Button>
                </Link>
                <Link href="/menu">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-[var(--smakowalo-brown)] text-[var(--smakowalo-brown)] hover:bg-[var(--smakowalo-brown)] hover:text-white text-lg px-8 py-3 rounded-lg"
                  >
                    Zobacz menu
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative w-full h-[400px] rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src="https://ugc.same-assets.com/FK44f03I3gohrH9kV2xljiQWbinpYmGw.jpeg"
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

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--smakowalo-green-primary)] mb-6">
              Świeże składniki. Idealne porcje. Zero odpadów.
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Dostarczymy pod Twoje drzwi wszystko, czego potrzebujesz do ugotowania pysznego posiłku.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center border-none shadow-md bg-white rounded-3xl hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-10">
                <div className="w-24 h-24 mx-auto mb-8 bg-white rounded-2xl flex items-center justify-center shadow-md">
                  <svg className="w-12 h-12 text-[var(--smakowalo-green-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Świeże z farm
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Współpracujemy z lokalnymi dostawcami, by zapewnić najwyższą jakość.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-md bg-white rounded-3xl hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-10">
                <div className="w-24 h-24 mx-auto mb-8 bg-white rounded-2xl flex items-center justify-center shadow-md">
                  <svg className="w-12 h-12 text-[var(--smakowalo-green-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Idealne porcje
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Odmierzone składniki dla 2 lub 4 osób. Koniec z resztkami i marnowaniem!
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-md bg-white rounded-3xl hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-10">
                <div className="w-24 h-24 mx-auto mb-8 bg-white rounded-2xl flex items-center justify-center shadow-md">
                  <svg className="w-12 h-12 text-[var(--smakowalo-green-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Stylowe pudełko
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Bezpiecznie zapakowane i gotowe do gotowania od razu po otwarciu.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gradient-to-r from-smakowalo-cream to-smakowalo-light-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
              Dlaczego my?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Oszczędzasz czas, stres, pieniądze i przyczyniasz się do dbania o planetę
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center border-none shadow-lg bg-white">
              <CardContent className="p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[var(--smakowalo-green-primary)] to-[var(--smakowalo-green-dark)] rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-[var(--smakowalo-green-dark)] mb-2">Czas</h3>
                <p className="text-sm text-gray-600">
                  Nie musisz planować posiłków ani chodzić na zakupy
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg bg-white">
              <CardContent className="p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-[var(--smakowalo-green-dark)] mb-2">Stres</h3>
                <p className="text-sm text-gray-600">
                  Wszystko dostarczymy prosto pod Twoje drzwi
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg bg-white">
              <CardContent className="p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-[var(--smakowalo-green-dark)] mb-2">Pieniądze</h3>
                <p className="text-sm text-gray-600">
                  Brak marnowania jedzenia dzięki odmierzonym składnikom
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg bg-white">
              <CardContent className="p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-[var(--smakowalo-green-dark)] mb-2">Jakość</h3>
                <p className="text-sm text-gray-600">
                  Składniki najlepszej jakości prosto od rolnika
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Fresh Ingredients This Week */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
              Świeże składniki tego tygodnia
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Poznaj najlepsze sezonowe składniki, które znajdziesz w naszych przepisach
            </p>
          </div>

          <div className="relative overflow-hidden">
            <div className="flex animate-slide gap-8 pb-8">
              {/* Ingredient Card 1 */}
              <div className="min-w-[280px] h-[200px] rounded-2xl overflow-hidden relative shadow-lg hover:scale-105 transition-transform duration-300">
                <Image
                  src="https://ugc.same-assets.com/6uEsIpTxMuSmhjFwIPSFPGzwjcRh2vqD.jpeg"
                  alt="Zioła aromatyczne"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/70 to-green-800/50" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <h3 className="text-xl font-bold mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                    Zioła aromatyczne
                  </h3>
                  <p className="text-sm opacity-95" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
                    Świeży bazylia, rozmaryn i tymianek prosto z polskich upraw ekologicznych
                  </p>
                </div>
              </div>

              {/* Ingredient Card 2 */}
              <div className="min-w-[280px] h-[200px] rounded-2xl overflow-hidden relative shadow-lg hover:scale-105 transition-transform duration-300">
                <Image
                  src="https://ugc.same-assets.com/Muz6SglCbUo0_90djilEkRKchPrx2Eu1.jpeg"
                  alt="Warzywa korzeniowe"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/70 to-orange-800/50" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <h3 className="text-xl font-bold mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                    Warzywa korzeniowe
                  </h3>
                  <p className="text-sm opacity-95" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
                    Marchew, pietruszka i seler - pełne witamin i naturalnego smaku
                  </p>
                </div>
              </div>

              {/* Ingredient Card 3 */}
              <div className="min-w-[280px] h-[200px] rounded-2xl overflow-hidden relative shadow-lg hover:scale-105 transition-transform duration-300">
                <Image
                  src="https://ugc.same-assets.com/S9kpT-NHTMMPq9-IzhEiZ0V0gHlOcoyX.jpeg"
                  alt="Pomidory sezonowe"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/70 to-red-800/50" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <h3 className="text-xl font-bold mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                    Pomidory sezonowe
                  </h3>
                  <p className="text-sm opacity-95" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
                    Słodkie pomidory koktajlowe i malinowe z lokalnych szklarni
                  </p>
                </div>
              </div>

              {/* Ingredient Card 4 */}
              <div className="min-w-[280px] h-[200px] rounded-2xl overflow-hidden relative shadow-lg hover:scale-105 transition-transform duration-300">
                <Image
                  src="https://ugc.same-assets.com/MC_XLvO1SXms579hLjizXQiMm0L7jnOV.jpeg"
                  alt="Czosnek młody"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/70 to-purple-800/50" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <h3 className="text-xl font-bold mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                    Czosnek młody
                  </h3>
                  <p className="text-sm opacity-95" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
                    Delikatny młody czosnek o łagodnym smaku, idealny do sałatek
                  </p>
                </div>
              </div>

              {/* Duplicate cards */}
              <div className="min-w-[280px] h-[200px] rounded-2xl overflow-hidden relative shadow-lg hover:scale-105 transition-transform duration-300">
                <Image
                  src="https://ugc.same-assets.com/6uEsIpTxMuSmhjFwIPSFPGzwjcRh2vqD.jpeg"
                  alt="Zioła aromatyczne"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/70 to-green-800/50" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <h3 className="text-xl font-bold mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                    Zioła aromatyczne
                  </h3>
                  <p className="text-sm opacity-95" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
                    Świeży bazylia, rozmaryn i tymianek prosto z polskich upraw ekologicznych
                  </p>
                </div>
              </div>

              <div className="min-w-[280px] h-[200px] rounded-2xl overflow-hidden relative shadow-lg hover:scale-105 transition-transform duration-300">
                <Image
                  src="https://ugc.same-assets.com/Muz6SglCbUo0_90djilEkRKchPrx2Eu1.jpeg"
                  alt="Warzywa korzeniowe"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/70 to-orange-800/50" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <h3 className="text-xl font-bold mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                    Warzywa korzeniowe
                  </h3>
                  <p className="text-sm opacity-95" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
                    Marchew, pietruszka i seler - pełne witamin i naturalnego smaku
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[var(--smakowalo-green-primary)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Nie czekaj! Zamów już dziś!
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Dołącz do tysięcy zadowolonych klientów i zacznij swoją przygodę ze zdrowymi posiłkami
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-started">
              <Button
                size="lg"
                className="bg-white text-[var(--smakowalo-green-primary)] hover:bg-gray-100 text-lg px-8 py-3 rounded-lg"
              >
                Rozpocznij teraz
              </Button>
            </Link>
            <Link href="/menu">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-[var(--smakowalo-green-primary)] text-lg px-8 py-3 rounded-lg"
              >
                Zobacz nasze plany
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-[var(--smakowalo-green-dark)] mb-8">Zacznij gotować</h2>
          <p className="text-center text-gray-600 mb-8">Wybieraj spośród różnorodnych nowych przepisów zatwierdzonych przez dietetyków każdego tygodnia</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={`recipe-${idx}`} className="group rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
                <div className="relative w-full h-40 overflow-hidden">
                  <Image
                    src={`https://picsum.photos/seed/recipe${idx}/400/300`}
                    alt="Recipe"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 bg-white">
                  <h3 className="text-sm font-semibold text-gray-800 truncate">Przepis {idx + 1}</h3>
                  <span className="text-xs text-gray-500">25 min</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/menu">
              <Button className="smakowalo-green">Zobacz pełne menu</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Band */}
      <section className="py-12 bg-[var(--smakowalo-green-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Jedzenie, z którym możesz się dobrze czuć</h2>
          <p className="text-white/90 max-w-2xl mx-auto">Smakowało kładzie nacisk na używanie zrównoważonych składników i kompensuje 100% emisji CO2 związanych z działalnością operacyjną i dystrybucją.</p>
        </div>
      </section>
    </div>
  )
}