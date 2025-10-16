'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ShoppingCart,
  Clock,
  Heart,
  Truck,
  Leaf,
  Shield,
  Star,
  Users,
  Award,
  TrendingUp
} from "lucide-react"
import Logo from '@/components/Logo'
import { useCart } from '@/contexts/CartContext'

export default function WhyUsPage() {
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
                <Link href="/dlaczego-my" className="text-[var(--smakowalo-green-primary)] hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium border-b-2 border-[var(--smakowalo-green-primary)]">
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
      <section className="relative pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
              Dlaczego warto wybrać Smakowało?
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Odkryj, co wyróżnia nas na tle konkurencji i dlaczego tysiące klientów ufa naszej jakości każdego dnia
            </p>
          </div>
        </div>
      </section>

      {/* Main Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Benefit 1 */}
            <Card className="text-center border-none shadow-xl h-full bg-white hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
                  Oszczędność czasu
                </h3>
                <p className="text-gray-600">
                  Nie tracisz czasu na planowanie posiłków, kompletowanie listy zakupów i chodzenie po sklepach.
                </p>
              </CardContent>
            </Card>

            {/* Benefit 2 */}
            <Card className="text-center border-none shadow-xl h-full bg-white hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
                  Redukcja stresu
                </h3>
                <p className="text-gray-600">
                  Dostarczamy wszystko, czego potrzebujesz, prosto pod Twoje drzwi w dogodnym dla Ciebie terminie.
                </p>
              </CardContent>
            </Card>

            {/* Benefit 3 */}
            <Card className="text-center border-none shadow-xl h-full bg-white hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
                  Zero marnowania
                </h3>
                <p className="text-gray-600">
                  Brak marnowania jedzenia dzięki dokładnie odmierzonym składnikom i precyzyjnie zaplanowanym porcjom.
                </p>
              </CardContent>
            </Card>

            {/* Benefit 4 */}
            <Card className="text-center border-none shadow-xl h-full bg-white hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
                  Ekologia
                </h3>
                <p className="text-gray-600">
                  Składniki najlepszej jakości prosto od rolnika w ekologicznych opakowaniach.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-[var(--smakowalo-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
              Liczby mówią same za siebie
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nasze osiągnięcia i zaufanie klientów w liczbach
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[var(--smakowalo-green-primary)] to-[var(--smakowalo-green-dark)] rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div className="text-3xl font-bold text-[var(--smakowalo-green-dark)] mb-2">50,000+</div>
              <div className="text-gray-600">Zadowolonych klientów</div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                <Award className="w-10 h-10 text-white" />
              </div>
              <div className="text-3xl font-bold text-[var(--smakowalo-green-dark)] mb-2">1,000,000+</div>
              <div className="text-gray-600">Dostarczonych posiłków</div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <Star className="w-10 h-10 text-white" />
              </div>
              <div className="text-3xl font-bold text-[var(--smakowalo-green-dark)] mb-2">4.9/5</div>
              <div className="text-gray-600">Średnia ocen klientów</div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <div className="text-3xl font-bold text-[var(--smakowalo-green-dark)] mb-2">98%</div>
              <div className="text-gray-600">Klientów poleca nas znajomym</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Guarantees */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
              Nasze gwarancje jakości
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Zobowiązujemy się do najwyższych standardów w każdym aspekcie naszej działalności
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
                  100% Gwarancja świeżości
                </h3>
                <p className="text-gray-600 mb-4">
                  Jeśli nie jesteś zadowolony ze świeżości składników, zwrócimy Ci pieniądze bez pytań.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Składniki prosto od producentów</li>
                  <li>• Kontrola jakości na każdym etapie</li>
                  <li>• Specjalne opakowania termiczne</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
                  Punktualność dostaw
                </h3>
                <p className="text-gray-600 mb-4">
                  Dostarczamy w wybranym przez Ciebie terminie lub oferujemy rekompensatę.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Elastyczne okna czasowe</li>
                  <li>• Powiadomienia SMS o dostawie</li>
                  <li>• Możliwość zmiany terminu</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
                  Satysfakcja gwarantowana
                </h3>
                <p className="text-gray-600 mb-4">
                  Jeśli nie jesteś w 100% zadowolony, skontaktuj się z nami - znajdziemy rozwiązanie.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Obsługa klienta 24/7</li>
                  <li>• Bezpłatne anulowanie</li>
                  <li>• Elastyczne zmiany w menu</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[var(--smakowalo-green-primary)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Przekonaj się sam!
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Dołącz do tysięcy zadowolonych klientów i rozpocznij swoją przygodę ze zdrowymi posiłkami już dziś
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/kreator">
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
                Zobacz nasze menu
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
