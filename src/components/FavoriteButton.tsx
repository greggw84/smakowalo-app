'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFavorites } from '@/contexts/FavoritesContext'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  product: {
    id: number
    name: string
    image: string
    price: number
  }
  variant?: 'default' | 'icon' | 'minimal'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  showText?: boolean
}

export default function FavoriteButton({
  product,
  variant = 'default',
  size = 'default',
  className = '',
  showText = true
}: FavoriteButtonProps) {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const [isAnimating, setIsAnimating] = useState(false)

  const isProductFavorite = isFavorite(product.id)

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)

    if (isProductFavorite) {
      removeFromFavorites(product.id)
    } else {
      addToFavorites(product)
    }
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleToggleFavorite}
        className={cn(
          "p-2 rounded-full transition-all duration-200 hover:bg-gray-100",
          isAnimating && "scale-110",
          className
        )}
        aria-label={isProductFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
      >
        <Heart
          className={cn(
            "w-5 h-5 transition-all duration-200",
            isProductFavorite
              ? "fill-red-500 text-red-500"
              : "text-gray-400 hover:text-red-400"
          )}
        />
      </button>
    )
  }

  if (variant === 'icon') {
    return (
      <Button
        onClick={handleToggleFavorite}
        variant="outline"
        size={size}
        className={cn(
          "transition-all duration-200",
          isProductFavorite
            ? "bg-red-50 border-red-200 hover:bg-red-100"
            : "hover:bg-gray-50",
          isAnimating && "scale-105",
          className
        )}
        aria-label={isProductFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
      >
        <Heart
          className={cn(
            "w-4 h-4 transition-all duration-200",
            isProductFavorite
              ? "fill-red-500 text-red-500"
              : "text-gray-500"
          )}
        />
      </Button>
    )
  }

  return (
    <Button
      onClick={handleToggleFavorite}
      variant={isProductFavorite ? "default" : "outline"}
      size={size}
      className={cn(
        "transition-all duration-200 flex items-center gap-2",
        isProductFavorite
          ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
          : "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300",
        isAnimating && "scale-105",
        className
      )}
    >
      <Heart
        className={cn(
          "w-4 h-4 transition-all duration-200",
          isProductFavorite ? "fill-white" : "fill-none"
        )}
      />
      {showText && (
        <span className="text-sm">
          {isProductFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
        </span>
      )}
    </Button>
  )
}
