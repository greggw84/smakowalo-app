'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ShoppingCart, User, Menu, X } from "lucide-react"
import Logo from '@/components/Logo'
import { useCart } from '@/contexts/CartContext'
import { useState } from 'react'

interface NavigationProps {
  currentPage?: string
}

export default function Navigation({ currentPage }: NavigationProps) {
  const { data: session, status } = useSession()
  const { totalItems } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigationItems = [
    { href: '/menu', label: 'Menu' },
    { href: '/dlaczego-my', label: 'Dlaczego my' },
    { href: '/jak-to-dziala', label: 'Jak to działa' },
    { href: '/faq', label: 'FAQ' },
    { href: '/dostawa', label: 'Dostawa' },
    { href: '/kreator', label: 'Kreator' },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <Logo width={120} height={32} />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === item.href
                      ? 'text-[var(--smakowalo-green-primary)] border-b-2 border-[var(--smakowalo-green-primary)]'
                      : 'text-gray-700 hover:text-[var(--smakowalo-green-primary)]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Auth & Cart */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="animate-pulse">
                <div className="h-9 w-20 bg-gray-200 rounded"></div>
              </div>
            ) : !session ? (
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-primary)] hover:text-white"
                >
                  Zaloguj
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/panel">
                  <Button
                    variant="outline"
                    className="border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-primary)] hover:text-white"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Panel
                  </Button>
                </Link>

                {/* Only show basket if user is logged in */}
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
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    currentPage === item.href
                      ? 'text-[var(--smakowalo-green-primary)] bg-green-50'
                      : 'text-gray-700 hover:text-[var(--smakowalo-green-primary)] hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="pt-4 pb-3 border-t border-gray-200">
                {status === 'loading' ? (
                  <div className="animate-pulse px-3">
                    <div className="h-9 w-full bg-gray-200 rounded"></div>
                  </div>
                ) : !session ? (
                  <div className="px-3">
                    <Link href="/login">
                      <Button
                        variant="outline"
                        className="w-full border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Zaloguj
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="px-3 space-y-3">
                    <Link href="/panel">
                      <Button
                        variant="outline"
                        className="w-full border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Panel
                      </Button>
                    </Link>

                    {/* Only show basket if user is logged in */}
                    <Link href="/cart">
                      <Button
                        className="w-full smakowalo-green relative"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Koszyk
                        {totalItems > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {totalItems}
                          </span>
                        )}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
