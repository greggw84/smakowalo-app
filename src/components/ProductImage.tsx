'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'

/**
 * Default placeholder image for products
 */
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop'

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
  const [imgSrc, setImgSrc] = useState<string>(src || PLACEHOLDER_IMAGE)
  const [hasError, setHasError] = useState(false)

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
