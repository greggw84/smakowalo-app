// components/Navigation.tsx
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShoppingCart, User, Heart, LogOut } from 'lucide-react'
import Logo from './Logo'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface NavigationProps {
  currentPage?: string
}

export default function Navigation({ currentPage }: NavigationProps) {
  const { totalItems } = useCart()
  const { favoritesCount } = useFavorites()
  const router = useRouter()
  const { user, loading, signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isActive = (path: string) => currentPage === path

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
        </div>
      </div>
    </nav>
  )
}
