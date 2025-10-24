"""tsx
"use client"

import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import NewsletterSignup from "./NewsletterSignup"
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Mail,
  MapPin,
  Send
} from "lucide-react"

export function Footer() {
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send the email to a subscription service
    alert('Dziękujemy za zapisanie się do newslettera!')
  }

  return (
    <footer className="bg-[var(--smakowalo-green-dark)] text-white">
      {/* Pre-footer promotional band */}
      <div className="bg-[#1d3a25] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-bold text-white">Pierwszy box z 25% zniżką</h3>
              <p className="text-gray-300 mt-1">Zapisz się i otrzymaj swój pierwszy box ze zniżką!</p>
            </div>
            <div className="flex-shrink-0">
              <Link href="/kreator">
                <Button className="bg-white text-[var(--smakowalo-green-primary)] hover:bg-gray-100 font-medium px-6 py-3">
                  Zacznij już dzisiaj
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1 - About */}
          <div>
            <div className="mb-6">
              <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
                <h3 className="text-2xl font-bold mb-2">Smakowało</h3>
                <div className="w-12 h-1 bg-[var(--smakowalo-green-primary)]" />
              </Link>
            </div>
            <p className="text-gray-300 mb-6">
              Dostarczamy najlepsze składniki i przepisy prosto pod Twoje drzwi, abyś mógł cieszyć się zdrowymi i pysznymi posiłkami bez stresu.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="w-10 h-10 rounded-full bg-[#2b4c35] flex items-center justify-center hover:bg-[var(--smakowalo-green-primary)] transition-colors">
                <Facebook size={18} />
              </a>
              <a href="https://instagram.com" className="w-10 h-10 rounded-full bg-[#2b4c35] flex items-center justify-center hover:bg-[var(--smakowalo-green-primary)] transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://twitter.com" className="w-10 h-10 rounded-full bg-[#2b4c35] flex items-center justify-center hover:bg-[var(--smakowalo-green-primary)] transition-colors">
                <Twitter size={18} />
              </a>
              <a href="https://linkedin.com" className="w-10 h-10 rounded-full bg-[#2b4c35] flex items-center justify-center hover:bg-[var(--smakowalo-green-primary)] transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Nawigacja</h3>
              <div className="w-12 h-1 bg-[var(--smakowalo-green-primary)]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-white mb-3">Menu</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <Link href="/" className="hover:text-white transition-colors hover:underline flex items-center">
                      <span className="mr-2">›</span>Strona główna
                    </Link>
                  </li>
                  <li>
                    <Link href="/menu" className="hover:text-white transition-colors hover:underline flex items-center">
                      <span className="mr-2">›</span>Aktualne menu
                    </Link>
                  </li>
                  <li>
                    <Link href="/kreator" className="hover:text-white transition-colors hover:underline flex items-center">
                      <span className="mr-2">›</span>Kreator
                    </Link>
                  </li>
                  <li>
                    <Link href="/jak-to-dziala" className="hover:text-white transition-colors hover:underline flex items-center">
                      <span className="mr-2">›</span>Jak to działa
                    </Link>
                  </li>
                  <li>
                    <Link href="/dostawa" className="hover:text-white transition-colors hover:underline flex items-center">
                      <span className="mr-2">›</span>Dostawa
                    </Link>
                  </li>
                  <li>
                    <Link href="/ulubione" className="hover:text-white transition-colors hover:underline flex items-center">
                      <span className="mr-2">›</span>Ulubione
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-3">Pomoc</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <Link href="/faq" className="hover:text-white transition-colors hover:underline flex items-center">
                      <span className="mr-2">›</span>FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="/kontakt" className="hover:text-white transition-colors hover:underline flex items-center">
                      <span className="mr-2">›</span>Kontakt
                    </Link>
                  </li>
                  <li>
                    <Link href="/regulamin" className="hover:text-white transition-colors hover:underline flex items-center">
                      <span className="mr-2">›</span>Regulamin
                    </Link>
                  </li>
                  <li>
                    <Link href="/polityka-prywatnosci" className="hover:text-white transition-colors hover:underline flex items-center">
                      <span className="mr-2">›</span>Prywatność
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Column 3 - Contact */}
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Kontakt</h3>
              <div className="w-12 h-1 bg-[var(--smakowalo-green-primary)]" />
            </div>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-[var(--smakowalo-green-primary)] mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-300">
                  Ks. Józefa Bryzy 42/2<br />
                  62-080 Tarnowo Podgórne
                </span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-[var(--smakowalo-green-primary)] mr-3 flex-shrink-0" />
                <a href="mailto:kontakt@smakowalo.pl" className="text-gray-300 hover:text-white transition-colors">kontakt@smakowalo.pl</a>
              </li>

              {/* Moved company identifiers here */}
              <li>
                <span className="text-sm text-gray-300">KRS: 0001093816 | NIP: 7812067133 | REGON: 528059450</span>
              </li>
            </ul>
          </div>

          {/* Column 4 - Newsletter */}
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Newsletter</h3>
              <div className="w-12 h-1 bg-[var(--smakowalo-green-primary)]" />
            </div>
            <NewsletterSignup
              variant="inline"
              title=""
              description="Zapisz się, aby otrzymywać najnowsze promocje i przepisy."
              placeholder="Twój adres email"
              className="text-white"
            />
            <div className="mt-6">
              <h4 className="font-medium text-white mb-3">Metody płatności</h4>
              <div className="flex items-center space-x-3">
                <div className="bg-white p-2 rounded w-16 h-8 flex items-center justify-center">
                  <span className="text-[#635BFF] text-sm font-bold">stripe</span>
                </div>
                <div className="bg-white p-2 rounded w-16 h-8 flex items-center justify-center">
                  <span className="text-[#8FBC00] text-sm font-bold">PayU</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Removed the "Dane firmy" boxed section as requested */}

        {/* Eco commitment */}
        <div className="mt-8 pt-8 border-t border-[#3a604a]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center">
              <div className="bg-[var(--smakowalo-green-primary)] p-2 rounded-full mr-4">
                <span className="text-white text-sm">🌱</span>
              </div>
              <p className="text-gray-300 text-sm">
                Kompensujemy 100% emisji CO2 związanych z naszą działalnością i dystrybucją
              </p>
            </div>
            <div className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} <Link href="/" className="hover:text-white transition-colors">Smakowało</Link>. Wszystkie prawa zastrzeżone.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}