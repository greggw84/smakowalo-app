// components/Navigation.tsx
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShoppingCart, User, Heart, LogOut, Menu, X } from 'lucide-react'
import Logo from './Logo'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

interface NavigationProps {
  currentPage?: string
}

export default function Navigation({ currentPage }: NavigationProps) {
  const { totalItems } = useCart()
  const { favoritesCount } = useFavorites()
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      setIsMobileMenuOpen(false)
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isActive = (path: string) => currentPage === path

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <Logo width={120} height={32} />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {[
                { href: '/menu', label: 'Menu' },
                { href: '/dlaczego-my', label: 'Dlaczego my' },
                { href: '/jak-to-dziala', label: 'Jak to działa' },
                { href: '/faq', label: 'FAQ' },
                { href: '/dostawa', label: 'Dostawa' },
                { href: '/kreator', label: 'Kreator' },
                { href: '/ulubione', label: 'Ulubione', icon: Heart, count: favoritesCount },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium relative ${
                    isActive(item.href)
                      ? 'text-[var(--smakowalo-green-primary)] border-b-2 border-[var(--smakowalo-green-primary)]'
                      : 'text-gray-700 hover:text-[var(--smakowalo-green-primary)]'
                  }`}
                >
                  {item.icon && <item.icon className="w-4 h-4 inline mr-1" />}
                  {item.label}
                  {item.count! > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.count}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side: Auth + Cart */}
          <div className="flex items-center space-x-4">
            {/* Desktop Auth + Cart - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-4">
              {loading ? (
                <Button variant="outline" disabled className="border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]">
                  <User className="w-4 h-4 mr-2 animate-pulse" />
                </Button>
              ) : user ? (
                <>
                  {/* Wyloguj */}
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Wyloguj
                  </Button>

                  {/* Panel */}
                  <Link href="/panel">
                    <Button
                      variant={isActive('/panel') ? 'default' : 'outline'}
                      className={
                        isActive('/panel')
                          ? 'bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)]'
                          : 'border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]'
                      }
                    >
                      <User className="w-4 h-4 mr-2" />
                      Panel
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/login">
                  <Button variant="outline" className="border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]">
                    Zaloguj
                  </Button>
                </Link>
              )}

              {/* Koszyk */}
              <Link href="/cart">
                <Button className="bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)] relative">
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

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="icon"
              className="md:hidden border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={closeMobileMenu}
          />
          
          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 md:hidden overflow-y-auto">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <Logo width={100} height={26} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeMobileMenu}
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col p-4 space-y-2">
                {[
                  { href: '/menu', label: 'Menu' },
                  { href: '/dlaczego-my', label: 'Dlaczego my' },
                  { href: '/jak-to-dziala', label: 'Jak to działa' },
                  { href: '/faq', label: 'FAQ' },
                  { href: '/dostawa', label: 'Dostawa' },
                  { href: '/kreator', label: 'Kreator' },
                  { href: '/ulubione', label: 'Ulubione', icon: Heart, count: favoritesCount },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`px-4 py-3 rounded-md text-base font-medium flex items-center justify-between ${
                      isActive(item.href)
                        ? 'bg-[var(--smakowalo-green-light)] text-[var(--smakowalo-green-primary)]'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex items-center">
                      {item.icon && <item.icon className="w-5 h-5 mr-2" />}
                      {item.label}
                    </span>
                    {item.count! > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {item.count}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t my-2" />

              {/* Cart */}
              <div className="px-4 pb-4">
                <Link href="/cart" onClick={closeMobileMenu}>
                  <Button className="w-full bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)] relative">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Koszyk
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </Button>
                </Link>
              </div>

              {/* Divider */}
              <div className="border-t my-2" />

              {/* Auth Actions */}
              <div className="px-4 pb-4 space-y-2">
                {loading ? (
                  <Button variant="outline" disabled className="w-full border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]">
                    <User className="w-5 h-5 mr-2 animate-pulse" />
                    Ładowanie...
                  </Button>
                ) : user ? (
                  <>
                    <Link href="/panel" onClick={closeMobileMenu}>
                      <Button
                        variant={isActive('/panel') ? 'default' : 'outline'}
                        className={`w-full ${
                          isActive('/panel')
                            ? 'bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)]'
                            : 'border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]'
                        }`}
                      >
                        <User className="w-5 h-5 mr-2" />
                        Panel
                      </Button>
                    </Link>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      Wyloguj
                    </Button>
                  </>
                ) : (
                  <Link href="/login" onClick={closeMobileMenu}>
                    <Button variant="outline" className="w-full border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]">
                      <User className="w-5 h-5 mr-2" />
                      Zaloguj
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
