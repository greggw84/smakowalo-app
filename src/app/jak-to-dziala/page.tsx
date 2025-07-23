'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ChefHat,
  Clock,
  Heart,
  Truck,
  Check,
  ShoppingBag,
  Star,
  Utensils,
  Leaf,
  Apple,
  Search,
  Calendar,
  Settings,
  Phone,
  Gift,
  ShoppingCart
} from "lucide-react"
import { motion } from 'framer-motion'
import Logo from '@/components/Logo'
import { useCart } from '@/contexts/CartContext'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

export default function HowItWorksPage() {
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
                <Link href="/jak-to-dziala" className="text-[var(--smakowalo-green-primary)] hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium border-b-2 border-[var(--smakowalo-green-primary)]">
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
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
              Jak to działa?
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Smakowało to prosta droga do przygotowania pysznych i zdrowych posiłków w Twoim domu
            </p>
          </motion.div>

          <motion.div
            className="relative max-w-4xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src="https://ugc.same-assets.com/yWMNbhlTX4AVv8WTXEUpGk9Is8pDmQQy.png"
              alt="Jak to działa - proces"
              width={1200}
              height={600}
              className="rounded-xl shadow-2xl"
            />

            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-8 py-4 rounded-full shadow-lg">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-medium text-gray-700 ml-1"></span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Process Steps with Icons */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
              Trzy proste kroki
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nasz proces jest prosty, szybki i dopasowany do Twojego stylu życia
            </p>
          </motion.div>

          <div className="relative">
            {/* Connecting gradient line */}
            <div className="hidden lg:block absolute left-0 right-0 top-1/2 h-2 bg-gradient-to-r from-[var(--smakowalo-green-light)] via-[var(--smakowalo-green-primary)] to-[var(--smakowalo-green-dark)] transform -translate-y-1/2 rounded-full" />

            {/* Steps */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {/* Step 1 */}
              <motion.div variants={fadeIn} className="relative">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                  <div className="h-48 bg-[var(--smakowalo-green-light)] relative overflow-hidden">
                    <Image
                      src="https://ugc.same-assets.com/KmJWlYuAK7-CX7fsF_9isSbLCW5wD0EC.png"
                      alt="Wybierz swoje dania"
                      fill
                      className="opacity-90 hover:scale-105 transition-transform duration-500 object-cover 2xl:m-[0px] 2xl:p-[0px]"
                    />
                    <div className="absolute top-4 right-4 bg-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-[var(--smakowalo-green-primary)]">1</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="w-16 h-16 -mt-14 mb-4 bg-gradient-to-br from-[var(--smakowalo-green-primary)] to-[var(--smakowalo-green-dark)] rounded-xl flex items-center justify-center shadow-lg">
                      <Search className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-[var(--smakowalo-green-dark)] mb-3">
                      Wybierz dania
                    </h3>

                    <p className="text-gray-600 mb-4">
                      Wybieraj spośród różnorodnych przepisów, dopasowanych do Twoich preferencji żywieniowych i celów dietetycznych.
                    </p>

                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <div className="rounded-full bg-green-100 p-1 mr-2 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm">Personalizowane diety - wegańskie, wegetariańskie, keto i inne</span>
                      </li>
                      <li className="flex items-start">
                        <div className="rounded-full bg-green-100 p-1 mr-2 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm">Różnorodne przepisy odświeżane co tydzień</span>
                      </li>
                      <li className="flex items-start">
                        <div className="rounded-full bg-green-100 p-1 mr-2 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm">Pełna informacja o wartościach odżywczych</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Step indicator for mobile */}
                <div className="lg:hidden flex justify-center mt-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--smakowalo-green-primary)] flex items-center justify-center shadow-lg">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div variants={fadeIn} className="relative lg:mt-12">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                  <div className="h-48 bg-[var(--smakowalo-brown-light)] relative overflow-hidden">
                    <Image
                      src="https://ugc.same-assets.com/jx0nZYOSWgecP-9gpaRbvp_hMa7t96pM.png"
                      alt="Dostawa pod drzwi"
                      fill
                      className="object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-[var(--smakowalo-green-primary)]">2</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="w-16 h-16 -mt-14 mb-4 bg-gradient-to-br from-[var(--smakowalo-brown)] to-[var(--smakowalo-brown-dark)] rounded-xl flex items-center justify-center shadow-lg">
                      <Truck className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-[var(--smakowalo-green-dark)] mb-3">
                      Otrzymaj dostawę
                    </h3>

                    <p className="text-gray-600 mb-4">
                      Świeże składniki w dokładnie odmierzonych ilościach trafiają prosto pod Twoje drzwi w wybranym terminie.
                    </p>

                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <div className="rounded-full bg-green-100 p-1 mr-2 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm">Ekologiczne opakowania zachowujące świeżość</span>
                      </li>
                      <li className="flex items-start">
                        <div className="rounded-full bg-green-100 p-1 mr-2 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm">Składniki najwyższej jakości od lokalnych dostawców</span>
                      </li>
                      <li className="flex items-start">
                        <div className="rounded-full bg-green-100 p-1 mr-2 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm">Elastyczne terminy dostaw dopasowane do Ciebie</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Step indicator for mobile */}
                <div className="lg:hidden flex justify-center mt-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--smakowalo-brown)] flex items-center justify-center shadow-lg">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div variants={fadeIn} className="relative">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                  <div className="h-48 bg-[var(--smakowalo-green-light)] relative overflow-hidden">
                    <Image
                      src="https://ugc.same-assets.com/Yse4l_kLAZPOG-8bejHm-1oGapX0r1rW.png"
                      alt="Gotuj z przyjemnością"
                      fill
                      className="opacity-90 hover:scale-105 transition-transform duration-500 object-cover 2xl:my-[0px] 2xl:px-[0px]"
                    />
                    <div className="absolute top-4 right-4 bg-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-[var(--smakowalo-green-primary)]">3</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="w-16 h-16 -mt-14 mb-4 bg-gradient-to-br from-[var(--smakowalo-green-primary)] to-[var(--smakowalo-green-dark)] rounded-xl flex items-center justify-center shadow-lg">
                      <Utensils className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-[var(--smakowalo-green-dark)] mb-3">
                      Gotuj i ciesz się
                    </h3>

                    <p className="text-gray-600 mb-4">
                      Przygotuj pyszne posiłki z pomocą naszych przejrzystych i łatwych instrukcji krok po kroku.
                    </p>

                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <div className="rounded-full bg-green-100 p-1 mr-2 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm">Instrukcje krok po kroku ze zdjęciami</span>
                      </li>
                      <li className="flex items-start">
                        <div className="rounded-full bg-green-100 p-1 mr-2 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm">Większość dań gotowych w mniej niż 30 minut</span>
                      </li>
                      <li className="flex items-start">
                        <div className="rounded-full bg-green-100 p-1 mr-2 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm">Przepisy dostosowane do każdego poziomu umiejętności</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Step indicator for mobile */}
                <div className="lg:hidden flex justify-center mt-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--smakowalo-green-primary)] flex items-center justify-center shadow-lg">
                    <ChefHat className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section with Grid Layout */}
      <section className="py-24 bg-[var(--smakowalo-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
              Dlaczego warto wybrać Smakowało?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Korzyści, które przekonały już tysiące zadowolonych klientów
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Benefit 1 */}
            <motion.div variants={fadeIn} whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
              <Card className="border-none shadow-xl h-full bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--smakowalo-green-dark)] mb-4 text-center">
                    Oszczędność czasu
                  </h3>
                  <p className="text-gray-600 text-center">
                    Nie tracisz czasu na planowanie posiłków, kompletowanie listy zakupów i chodzenie po sklepach.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Benefit 2 */}
            <motion.div variants={fadeIn} whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
              <Card className="border-none shadow-xl h-full bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--smakowalo-green-dark)] mb-4 text-center">
                    Redukcja stresu
                  </h3>
                  <p className="text-gray-600 text-center">
                    Dostarczamy wszystko, czego potrzebujesz, prosto pod Twoje drzwi w dogodnym dla Ciebie terminie.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Benefit 3 */}
            <motion.div variants={fadeIn} whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
              <Card className="border-none shadow-xl h-full bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Settings className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--smakowalo-green-dark)] mb-4 text-center">
                    Kontrola nad dietą
                  </h3>
                  <p className="text-gray-600 text-center">
                    Znasz dokładną zawartość składników odżywczych w każdym posiłku, co pomaga w utrzymaniu zdrowej diety.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Benefit 4 */}
            <motion.div variants={fadeIn} whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
              <Card className="border-none shadow-xl h-full bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Leaf className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--smakowalo-green-dark)] mb-4 text-center">
                    Ekologia
                  </h3>
                  <p className="text-gray-600 text-center">
                    Zmniejszasz marnowanie żywności dzięki dokładnie odmierzonym porcjom, a nasze opakowania są przyjazne dla środowiska.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* User Testimonials with Photos */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
              Co mówią nasi klienci
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Poznaj opinie osób, które już korzystają z Smakowało
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Testimonial 1 */}
            <motion.div variants={fadeIn} className="bg-white rounded-xl shadow-xl p-8 relative">
              <div className="flex items-center mb-6">
                <Image
                  src="https://ugc.same-assets.com/USM3DfZqKhrPCRMcPRkwYOK1sipZ-FEu.jpeg"
                  alt="Kasia z Warszawy"
                  width={64}
                  height={64}
                  className="border-4 border-[var(--smakowalo-green-light)] object-cover rounded-[9786px]"
                />
                <div className="ml-4">
                  <h4 className="font-bold text-[var(--smakowalo-green-dark)]">Kasia z Warszawy</h4>
                  <div className="flex">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Smakowało to najlepsze co mogło mnie spotkać! Jako zapracowana mama dwójki dzieci nie miałam czasu na planowanie zdrowych posiłków. Teraz wszystko przychodzi pod drzwi, a ja mogę gotować z dziećmi pyszne i zdrowe dania."
              </p>
              <div className="absolute -top-3 -left-3 text-4xl text-[var(--smakowalo-green-primary)]">"</div>
              <div className="absolute -bottom-3 -right-3 text-4xl text-[var(--smakowalo-green-primary)]">"</div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div variants={fadeIn} className="bg-white rounded-xl shadow-xl p-8 relative">
              <div className="flex items-center mb-6">
                <Image
                  src="https://ext.same-assets.com/817389662/testimonial-2.jpg"
                  alt="Tomek z Krakowa"
                  width={64}
                  height={64}
                  className="rounded-full border-4 border-[var(--smakowalo-green-light)]"
                />
                <div className="ml-4">
                  <h4 className="font-bold text-[var(--smakowalo-green-dark)]">Tomek z Krakowa</h4>
                  <div className="flex">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Jako osoba na diecie keto, zawsze miałem problem ze znalezieniem odpowiednich składników i przepisów. Dzięki Smakowało moja dieta stała się prosta i smaczna. Polecam każdemu kto dba o zdrowie!"
              </p>
              <div className="absolute -top-3 -left-3 text-4xl text-[var(--smakowalo-green-primary)]">"</div>
              <div className="absolute -bottom-3 -right-3 text-4xl text-[var(--smakowalo-green-primary)]">"</div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div variants={fadeIn} className="bg-white rounded-xl shadow-xl p-8 relative">
              <div className="flex items-center mb-6">
                <Image
                  src="https://ext.same-assets.com/817389662/testimonial-3.jpg"
                  alt="Ania z Wrocławia"
                  width={64}
                  height={64}
                  className="rounded-full border-4 border-[var(--smakowalo-green-light)]"
                />
                <div className="ml-4">
                  <h4 className="font-bold text-[var(--smakowalo-green-dark)]">Ania z Wrocławia</h4>
                  <div className="flex">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Jestem weganką i zawsze marzyłam o większej różnorodności dań. Smakowało spełniło to marzenie! Każdy tydzień przynosi nowe, kreatywne przepisy, a jakość składników jest zawsze najwyższa."
              </p>
              <div className="absolute -top-3 -left-3 text-4xl text-[var(--smakowalo-green-primary)]">"</div>
              <div className="absolute -bottom-3 -right-3 text-4xl text-[var(--smakowalo-green-primary)]">"</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section with Accordion */}
      <section className="py-24 bg-[var(--smakowalo-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
              Często zadawane pytania
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Znajdź odpowiedzi na najczęściej zadawane pytania
            </p>
          </motion.div>

          <motion.div
            className="max-w-3xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <motion.div variants={fadeIn} className="border-b border-gray-100">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[var(--smakowalo-green-dark)] mb-3 flex items-center">
                    <Truck className="w-5 h-5 mr-2 text-[var(--smakowalo-green-primary)]" />
                    Jak działają dostawy?
                  </h3>
                  <p className="text-gray-600">
                    Dostawy realizowane są w wybranym przez Ciebie dniu tygodnia, w godzinach 8:00-22:00. Składniki dostarczane są w specjalnych opakowaniach termicznych, które zapewniają świeżość nawet przez kilka godzin po dostawie.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={fadeIn} className="border-b border-gray-100">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[var(--smakowalo-green-dark)] mb-3 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-[var(--smakowalo-green-primary)]" />
                    Czy mogę pominąć tydzień dostawy?
                  </h3>
                  <p className="text-gray-600">
                    Tak, możesz wstrzymać dostawę na dowolny tydzień, korzystając z panelu użytkownika na naszej stronie lub w aplikacji. Wystarczy to zrobić do środy poprzedzającej tydzień dostawy.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={fadeIn} className="border-b border-gray-100">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[var(--smakowalo-green-dark)] mb-3 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-[var(--smakowalo-green-primary)]" />
                    Czy mogę zmienić wybrane przepisy?
                  </h3>
                  <p className="text-gray-600">
                    Oczywiście! Możesz zmieniać wybrane przepisy do środy poprzedzającej tydzień dostawy. Po tym terminie Twój wybór zostanie zablokowany, abyśmy mogli przygotować Twoje zamówienie.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={fadeIn}>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[var(--smakowalo-green-dark)] mb-3 flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-[var(--smakowalo-green-primary)]" />
                    Jak mogę anulować subskrypcję?
                  </h3>
                  <p className="text-gray-600">
                    Subskrypcję możesz anulować w dowolnym momencie w swoim profilu na naszej stronie. Nie ma żadnych ukrytych opłat ani minimalnego okresu trwania subskrypcji.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[var(--smakowalo-green-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <motion.div
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Gotowy na kulinarne przygody?
              </h2>
              <p className="text-lg text-white/90 mb-8">
                Dołącz do tysięcy zadowolonych klientów i zacznij swoją przygodę ze zdrowymi posiłkami. Pierwszy box z 25% zniżką!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/kreator">
                  <Button
                    size="lg"
                    className="bg-white text-[var(--smakowalo-green-primary)] hover:bg-gray-100 text-lg px-8 py-6 rounded-lg"
                  >
                    Rozpocznij teraz
                  </Button>
                </Link>
                <Link href="/menu">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-[var(--smakowalo-green-primary)] text-lg px-8 py-6 rounded-lg"
                  >
                    Zobacz nasze menu
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="lg:w-1/2 relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Image
                src="https://ugc.same-assets.com/UAiOzOoHGw2LPCLyClnViKsLdyJCWKdK.png"
                alt="Gotowe danie Smakowało"
                width={600}
                height={400}
                className="rounded-xl shadow-2xl"
              />
              <div className="absolute -bottom-5 -right-5 bg-white p-4 rounded-xl shadow-lg transform rotate-3">
                <div className="flex items-center">
                  <div className="font-bold text-[var(--smakowalo-green-primary)] text-3xl mr-2">25%</div>
                  <div className="text-gray-700">
                    <div className="font-semibold">RABATU</div>
                    <div className="text-xs">na pierwszy box</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
