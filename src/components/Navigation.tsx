'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShoppingCart, User, Heart, LogOut } from 'lucide-react'
import Logo from './Logo'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useSession, signOut } from 'next-auth/react'

interface NavigationProps {
  currentPage?: string
}

export default function Navigation({ currentPage }: NavigationProps) {
  const { totalItems } = useCart()
  const { favoritesCount } = useFavorites()
  const { data: session, status } = useSession()

  const isActive = (path: string) => currentPage === path

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <Logo width={120} height={32} />
          </Link>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/menu"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/menu')
                    ? 'text-[var(--smakowalo-green-primary)] border-b-2 border-[var(--smakowalo-green-primary)]'
                    : 'text-gray-700 hover:text-[var(--smakowalo-green-primary)]'
                }`}
              >
                Menu
              </Link>
              <Link
                href="/dlaczego-my"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/dlaczego-my')
                    ? 'text-[var(--smakowalo-green-primary)] border-b-2 border-[var(--smakowalo-green-primary)]'
                    : 'text-gray-700 hover:text-[var(--smakowalo-green-primary)]'
                }`}
              >
                Dlaczego my
              </Link>
              <Link
                href="/jak-to-dziala"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/jak-to-dziala')
                    ? 'text-[var(--smakowalo-green-primary)] border-b-2 border-[var(--smakowalo-green-primary)]'
                    : 'text-gray-700 hover:text-[var(--smakowalo-green-primary)]'
                }`}
              >
                Jak to działa
              </Link>
              <Link
                href="/faq"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/faq')
                    ? 'text-[var(--smakowalo-green-primary)] border-b-2 border-[var(--smakowalo-green-primary)]'
                    : 'text-gray-700 hover:text-[var(--smakowalo-green-primary)]'
                }`}
              >
                FAQ
              </Link>
              <Link
                href="/dostawa"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/dostawa')
                    ? 'text-[var(--smakowalo-green-primary)] border-b-2 border-[var(--smakowalo-green-primary)]'
                    : 'text-gray-700 hover:text-[var(--smakowalo-green-primary)]'
                }`}
              >
                Dostawa
              </Link>
              <Link
                href="/kreator"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/kreator')
                    ? 'text-[var(--smakowalo-green-primary)] border-b-2 border-[var(--smakowalo-green-primary)]'
                    : 'text-gray-700 hover:text-[var(--smakowalo-green-primary)]'
                }`}
              >
                Kreator
              </Link>
              <Link
                href="/ulubione"
                className={`px-3 py-2 rounded-md text-sm font-medium relative ${
                  isActive('/ulubione')
                    ? 'text-[var(--smakowalo-green-primary)] border-b-2 border-[var(--smakowalo-green-primary)]'
                    : 'text-gray-700 hover:text-[var(--smakowalo-green-primary)]'
                }`}
              >
                <Heart className="w-4 h-4 inline mr-1" />
                Ulubione
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {status === 'authenticated' && session ? (
              <>
                <Button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Wyloguj
                </Button>

                <Link href="/panel">
                  <Button
                    variant={isActive('/panel') ? 'default' : 'outline'}
                    className={isActive('/panel')
                      ? 'bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)]'
                      : 'border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]'
                    }
                  >
                    <User className="w-4 h-4 mr-2" />
                    Panel
                  </Button>
                </Link>
              </>
            ) : status === 'loading' ? (
              <Button variant="outline" disabled className="border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]">
                <User className="w-4 h-4 mr-2 animate-pulse" />
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)]">
                  Zaloguj
                </Button>
              </Link>
            )}

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
