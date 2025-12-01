import { createSupabaseClient } from './supabase'

/**
 * Storage bucket name for menu/product images
 * This should match the bucket created in Supabase Storage
 */
export const MENU_IMAGES_BUCKET = 'menu-images'

/**
 * Default placeholder image when product image is not available
 */
export const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop'

/**
 * Check if a URL is a Supabase Storage path (not a full URL)
 * Storage paths typically don't start with http:// or https://
 */
export function isStoragePath(imagePath: string): boolean {
  if (!imagePath) return false
  return !imagePath.startsWith('http://') && !imagePath.startsWith('https://')
}

/**
 * Generate a public URL for an image stored in Supabase Storage
 * If the image is already a full URL, return it as-is
 * If it's a storage path, generate the public URL
 *
 * @param imagePath - The image path (either storage path or full URL)
 * @param bucket - The storage bucket name (defaults to MENU_IMAGES_BUCKET)
 * @returns The public URL for the image
 */
export function getStorageImageUrl(
  imagePath: string | null | undefined,
  bucket: string = MENU_IMAGES_BUCKET
): string {
  // Return placeholder if no image path
  if (!imagePath) {
    return PLACEHOLDER_IMAGE
  }

  // If it's already a full URL, return as-is
  if (!isStoragePath(imagePath)) {
    return imagePath
  }

  // Get Supabase client to generate public URL
  const supabase = createSupabaseClient()

  if (!supabase) {
    // If Supabase is not configured, try to construct URL manually
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      // Construct public URL pattern: {supabase_url}/storage/v1/object/public/{bucket}/{path}
      const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
      return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`
    }
    // Fall back to placeholder if we can't construct URL
    return PLACEHOLDER_IMAGE
  }

  // Use Supabase client to get public URL
  const { data } = supabase.storage.from(bucket).getPublicUrl(imagePath)
  return data.publicUrl
}

/**
 * Process a product's image field to ensure it's a valid URL
 * This handles both storage paths and existing URLs
 *
 * @param product - The product object with an image field
 * @returns The product with a valid image URL
 */
export function processProductImage<T extends { image?: string | null }>(
  product: T
): T & { image: string } {
  return {
    ...product,
    image: getStorageImageUrl(product.image),
  }
}

/**
 * Process multiple products' image fields
 *
 * @param products - Array of products with image fields
 * @returns Array of products with valid image URLs
 */
export function processProductImages<T extends { image?: string | null }>(
  products: T[]
): (T & { image: string })[] {
  return products.map(processProductImage)
}

/**
 * List all images in the menu-images bucket
 * Useful for debugging and admin functions
 *
 * @param folder - Optional folder path within the bucket
 * @returns Array of file objects or null if error
 */
export async function listStorageImages(folder?: string) {
  const supabase = createSupabaseClient()

  if (!supabase) {
    console.error('Supabase client not configured')
    return null
  }

  try {
    const { data, error } = await supabase.storage
      .from(MENU_IMAGES_BUCKET)
      .list(folder || '', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      })

    if (error) {
      console.error('Error listing storage images:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Failed to list storage images:', err)
    return null
  }
}

/**
 * Validate if an image URL is accessible.
 *
 * This utility function can be used for:
 * - Pre-validating image URLs before displaying them
 * - Checking if Supabase Storage URLs are accessible
 * - Admin tools to verify uploaded images
 * - Background jobs that verify image availability
 *
 * @example
 * ```typescript
 * import { validateImageUrl } from '@/lib/supabase-storage'
 *
 * // Check if an image URL is accessible
 * const isValid = await validateImageUrl('https://example.com/image.jpg')
 * if (!isValid) {
 *   console.log('Image is not accessible')
 * }
 *
 * // With custom timeout
 * const isValid = await validateImageUrl(url, 3000) // 3 second timeout
 * ```
 *
 * @param url - The image URL to validate
 * @param timeoutMs - Timeout in milliseconds (default: 5000ms)
 * @returns Promise resolving to true if image loads, false otherwise
 */
export async function validateImageUrl(url: string, timeoutMs = 5000): Promise<boolean> {
  if (!url) return false

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    })
    return response.ok
  } catch {
    return false
  } finally {
    clearTimeout(timeoutId)
  }
}
