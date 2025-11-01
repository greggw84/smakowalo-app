// components/Navigation.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShoppingCart, User, Heart, LogOut, Menu, X } from 'lucide-react'
import Logo from './Logo'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Navigation() {
  const { totalItems } = useCart()
  const { favoritesCount } = useFavorites()
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      setMobileMenuOpen(false)
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isActive = (path: string) => pathname === path

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const menuItems = [
    { href: '/menu', label: 'Menu' },
    { href: '/dlaczego-my', label: 'Dlaczego my' },
    { href: '/jak-to-dziala', label: 'Jak to działa' },
    { href: '/faq', label: 'FAQ' },
    { href: '/dostawa', label: 'Dostawa' },
    { href: '/kreator', label: 'Kreator' },
    { href: '/ulubione', label: 'Ulubione', icon: Heart, count: favoritesCount },
  ]

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" onClick={closeMobileMenu}>
            <Logo width={120} height={32} />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {menuItems.map((item) => (
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
          <div className="flex items-center space-x-2 md:space-x-4">
            {loading ? (
              <Button variant="outline" disabled className="hidden sm:flex border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]">
                <User className="w-4 h-4 mr-2 animate-pulse" />
              </Button>
            ) : user ? (
              <>
                {/* Wyloguj - Hidden on mobile */}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="hidden sm:flex border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Wyloguj
                </Button>

                {/* Panel */}
                <Link href="/panel" onClick={closeMobileMenu}>
                  <Button
                    variant={isActive('/panel') ? 'default' : 'outline'}
                    className={
                      isActive('/panel')
                        ? 'bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)]'
                        : 'border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]'
                    }
                    size="sm"
                  >
                    <User className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Panel</span>
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/login" onClick={closeMobileMenu}>
                <Button variant="outline" className="border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]" size="sm">
                  <span className="hidden sm:inline">Zaloguj</span>
                  <User className="w-4 h-4 sm:hidden" />
                </Button>
              </Link>
            )}

            {/* Koszyk */}
            <Link href="/cart" onClick={closeMobileMenu}>
              <Button className="bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)] relative" size="sm">
                <ShoppingCart className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Koszyk</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.href)
                    ? 'bg-[var(--smakowalo-green-light)] text-[var(--smakowalo-green-primary)]'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-[var(--smakowalo-green-primary)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                    {item.label}
                  </div>
                  {item.count! > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.count}
                    </span>
                  )}
                </div>
              </Link>
            ))}
            {/* Mobile auth actions */}
            {user && (
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 mt-2"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Wyloguj
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
