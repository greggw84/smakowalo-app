'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { PLACEHOLDER_IMAGE } from '@/lib/supabase-storage'

interface ProductImageProps {
  src: string | null | undefined
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
}

/**
 * Determines if the provided src is a valid image source
 */
function isValidSrc(src: string | null | undefined): src is string {
  return typeof src === 'string' && src.length > 0
}

/**
 * A robust image component for product images that handles errors gracefully
 * Falls back to a placeholder image if the original fails to load
 */
export function ProductImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  priority = false,
  sizes,
}: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(isValidSrc(src) ? src : PLACEHOLDER_IMAGE)
  const [hasError, setHasError] = useState(false)

  // Update imgSrc when src prop changes
  useEffect(() => {
    if (isValidSrc(src)) {
      setImgSrc(src)
      setHasError(false)
    } else {
      setImgSrc(PLACEHOLDER_IMAGE)
    }
  }, [src])

  const handleError = useCallback(() => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(PLACEHOLDER_IMAGE)
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[ProductImage] Failed to load image: ${src}, using placeholder`)
      }
    }
  }, [hasError, src])

  // Use placeholder if src is empty or null
  const imageSrc = imgSrc || PLACEHOLDER_IMAGE

  if (fill) {
    return (
      <Image
        src={imageSrc}
        alt={alt}
        fill
        className={className}
        onError={handleError}
        priority={priority}
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
      />
    )
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width || 400}
      height={height || 400}
      className={className}
      onError={handleError}
      priority={priority}
      sizes={sizes}
    />
  )
}

export default ProductImage
