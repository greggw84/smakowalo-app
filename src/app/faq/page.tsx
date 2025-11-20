'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ShoppingCart,
  ChevronDown,
  Truck,
  Calendar,
  Settings,
  Phone,
  Heart,
  Clock,
  CreditCard
} from "lucide-react"
import { useState } from 'react'
import Logo from '@/components/Logo'
import { useCart } from '@/contexts/CartContext'

const faqData = [
  {
    id: 1,
    question: "Jak działają dostawy?",
    answer: "Dostawy realizowane są w wybranym przez Ciebie dniu tygodnia, w godzinach 8:00-22:00. Składniki dostarczane są w specjalnych opakowaniach termicznych, które zapewniają świeżość nawet przez kilka godzin po dostawie.",
    icon: <Truck className="w-5 h-5" />
  },
  {
    id: 2,
    question: "Czy mogę pominąć tydzień dostawy?",
    answer: "Tak, możesz wstrzymać dostawę na dowolny tydzień, korzystając z panelu użytkownika na naszej stronie lub w aplikacji. Wystarczy to zrobić do środy poprzedzającej tydzień dostawy.",
    icon: <Calendar className="w-5 h-5" />
  },
  {
    id: 3,
    question: "Czy mogę zmienić wybrane przepisy?",
    answer: "Oczywiście! Możesz zmieniać wybrane przepisy do środy poprzedzającej tydzień dostawy. Po tym terminie Twój wybór zostanie zablokowany, abyśmy mogli przygotować Twoje zamówienie.",
    icon: <Settings className="w-5 h-5" />
  },
  {
    id: 4,
    question: "Jak mogę anulować subskrypcję?",
    answer: "Subskrypcję możesz anulować w dowolnym momencie w swoim profilu na naszej stronie. Nie ma żadnych ukrytych opłat ani minimalnego okresu trwania subskrypcji.",
    icon: <Phone className="w-5 h-5" />
  },
  {
    id: 5,
    question: "Jakie metody płatności akceptujecie?",
    answer: "Akceptujemy karty kredytowe i debetowe (VISA, Mastercard), płatność BLIK oraz przelewy bankowe. Płatność jest pobierana po potwierdzeniu zamówienia.",
    icon: <CreditCard className="w-5 h-5" />
  },
  {
    id: 6,
    question: "Czy składniki są świeże?",
    answer: "Tak, wszystkie nasze składniki są świeże i najwyższej jakości. Współpracujemy z lokalnymi dostawcami, aby zapewnić najlepsze produkty sezonowe.",
    icon: <Heart className="w-5 h-5" />
  },
  {
    id: 7,
    question: "Ile czasu potrzeba na przygotowanie posiłków?",
    answer: "Większość naszych przepisów została zaprojektowana tak, aby przygotowanie posiłku zajęło nie więcej niż 30 minut. Każdy przepis zawiera szacowany czas przygotowania.",
    icon: <Clock className="w-5 h-5" />
  },
  {
    id: 8,
    question: "Czy oferujecie diety specjalne?",
    answer: "Tak! Oferujemy 8 różnych opcji dietetycznych: wegetariańską, wegańską, keto, wysokobiałkową, niskokaloryczną, bezglutenową, pescetariańską i paleo.",
    icon: <Settings className="w-5 h-5" />
  }
]

export default function FAQPage() {
  const { totalItems } = useCart()
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (id: number) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

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
                <Link href="/faq" className="text-[var(--smakowalo-green-primary)] hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium border-b-2 border-[var(--smakowalo-green-primary)]">
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
              Często zadawane pytania
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Znajdź odpowiedzi na najczęściej zadawane pytania dotyczące naszych usług
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {faqData.map((faq) => (
              <Card key={faq.id} className="border-none shadow-lg overflow-hidden">
                <div
                  className="cursor-pointer"
                  onClick={() => toggleItem(faq.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-[var(--smakowalo-green-primary)] text-white rounded-full flex items-center justify-center">
                          {faq.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-[var(--smakowalo-green-dark)]">
                          {faq.question}
                        </h3>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                          openItems.includes(faq.id) ? 'rotate-180' : ''
                        }`}
                      />
                    </div>

                    {openItems.includes(faq.id) && (
                      <div className="mt-4 pl-14">
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-[var(--smakowalo-cream)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
            Nie znalazłeś odpowiedzi?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Skontaktuj się z naszym zespołem obsługi klienta - chętnie pomożemy!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/kontakt">
              <Button
                size="lg"
                className="smakowalo-green text-lg px-8 py-3 rounded-lg"
              >
                Skontaktuj się z nami
              </Button>
            </Link>
            <Link href="tel:+48999999999">
              <Button
                variant="outline"
                size="lg"
                className="border-[var(--smakowalo-brown)] text-[var(--smakowalo-brown)] hover:bg-[var(--smakowalo-brown)] hover:text-white text-lg px-8 py-3 rounded-lg"
              >
                Zadzwoń: +48 999 999 999
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
