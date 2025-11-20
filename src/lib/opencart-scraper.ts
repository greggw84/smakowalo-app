// OpenCart Web Scraper - scrapes public catalog pages
// Use this when OpenCart doesn't have REST API installed

import * as cheerio from 'cheerio'

const OPENCART_URL = process.env.OPENCART_URL || 'https://shop.smakowalo.pl'

export interface ScrapedProduct {
  id: number
  name: string
  description: string
  image: string
  price: number
  category_id: number
  category_name: string
  categories: string[]  // All categories this product belongs to
}

// Helper function to convert OpenCart image paths to full URLs
function toImageUrl(imagePath: string): string {
  if (!imagePath) return ''
  if (imagePath.startsWith('http')) return imagePath

  const base = OPENCART_URL.endsWith('/') ? OPENCART_URL.slice(0, -1) : OPENCART_URL

  let cleanPath = imagePath

  // IMPORTANT: Remove cache paths to get original high-quality images
  // OpenCart creates cached/resized images in cache/catalog/...
  // We want the original from catalog/...
  if (cleanPath.includes('cache/')) {
    // Remove 'cache/' prefix
    cleanPath = cleanPath.replace(/cache\//, '')
    // Remove size suffixes like -500x500, -228x228, etc.
    cleanPath = cleanPath.replace(/-\d+x\d+(\.\w+)$/, '$1')
    console.log(`🔄 Converted cached image to original: ${imagePath} -> ${cleanPath}`)
  }

  // OpenCart images are typically in /image/ directory
  // If path starts with 'catalog/', add 'image/' prefix
  if (cleanPath.startsWith('catalog/')) {
    return `${base}/image/${cleanPath}`
  }
  // If path already starts with 'image/', use it as is
  if (cleanPath.startsWith('image/')) {
    return `${base}/${cleanPath}`
  }
  // Otherwise assume it's a relative path and add to base
  cleanPath = cleanPath.replace(/^\//, '')
  return `${base}/${cleanPath}`
}

// Category mapping from OpenCart
const CATEGORIES = [
  { id: 20, name: 'Keto', path: '20' },
  { id: 18, name: 'Niskowęglowodanowa', path: '18' },
  { id: 25, name: 'Wegetariańska', path: '25' },
  { id: 24, name: 'Fast fit', path: '24' },
  { id: 33, name: 'Wegańska', path: '33' },
  { id: 34, name: 'Flexi', path: '34' },
]

async function fetchHTML(url: string): Promise<string> {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${url}`)
  }
  return response.text()
}

function extractProductId(url: string): number {
  const match = url.match(/product_id=(\d+)/)
  return match ? Number.parseInt(match[1]) : 0
}

function extractPrice(priceText: string): number {
  // Remove currency and parse: "35.00 PLN" -> 35.00
  const cleaned = priceText.replace(/[^0-9.,]/g, '').replace(',', '.')
  return Number.parseFloat(cleaned) || 0
}

export async function scrapeProducts(): Promise<ScrapedProduct[]> {
  console.log('🕷️ Scraping OpenCart catalog pages...')

  // Use a Map to track products and their categories
  const productsMap = new Map<number, ScrapedProduct>()

  for (const category of CATEGORIES) {
    try {
      const categoryUrl = `${OPENCART_URL}/index.php?route=product/category&path=${category.path}`
      console.log(`📄 Scraping category: ${category.name} (${categoryUrl})`)

      const html = await fetchHTML(categoryUrl)
      const $ = cheerio.load(html)

      // Find all product cards
      $('.product-layout').each((i, element) => {
        try {
          const productLink = $(element).find('.product-thumb h4 a').attr('href')
          const productName = $(element).find('.product-thumb h4 a').text().trim()
          // Try to get the highest quality image available
          // Check data-src first (lazy load original), then src (may be thumbnail)
          const productImage = $(element).find('.product-thumb .image img').attr('data-src')
                             || $(element).find('.product-thumb .image img').attr('src')
          const productPrice = $(element).find('.price').first().text().trim()

          if (!productLink || !productName) return

          const productId = extractProductId(productLink)
          const price = extractPrice(productPrice)

          // Check if product already exists in map
          if (productsMap.has(productId)) {
            // Add category to existing product
            const existing = productsMap.get(productId)!
            if (!existing.categories.includes(category.name)) {
              existing.categories.push(category.name)
              console.log(`  ➕ Added category "${category.name}" to: ${productName} (ID: ${productId})`)
            }
          } else {
            // Create new product with first category
            productsMap.set(productId, {
              id: productId,
              name: productName,
              description: '', // Will be filled from individual product page if needed
              image: productImage ? toImageUrl(productImage) : '',
              price: price,
              category_id: category.id,
              category_name: category.name,
              categories: [category.name]  // Start with this category
            })

            console.log(`  ✓ ${productName} (${price} PLN) - Category: ${category.name}`)
          }
        } catch (err) {
          console.error('  ❌ Error parsing product:', err)
        }
      })
    } catch (err) {
      console.error(`❌ Error scraping category ${category.name}:`, err)
    }
  }

  const allProducts = Array.from(productsMap.values())
  console.log(`✅ Scraped ${allProducts.length} unique products with categories`)

  // Log products with multiple categories
  const multiCategory = allProducts.filter(p => p.categories.length > 1)
  if (multiCategory.length > 0) {
    console.log(`🏷️  Products in multiple categories: ${multiCategory.length}`)
    multiCategory.forEach(p => {
      console.log(`   - ${p.name}: [${p.categories.join(', ')}]`)
    })
  }

  return allProducts
}

export async function scrapeProductById(productId: number): Promise<ScrapedProduct | null> {
  try {
    const productUrl = `${OPENCART_URL}/index.php?route=product/product&product_id=${productId}`
    console.log(`🕷️ Scraping product page: ${productUrl}`)

    const html = await fetchHTML(productUrl)
    const $ = cheerio.load(html)

    const name = $('#content h1').first().text().trim()
    const description = $('#tab-description').text().trim()

    // Try multiple selectors for product image
    let image = ''

    // Try main product image
    image = $('.product-left .thumbnail img').first().attr('src') || ''

    // Fallback to thumbnails
    if (!image) {
      image = $('.thumbnails img').first().attr('src') || ''
    }

    // Fallback to any image in product area
    if (!image) {
      image = $('.product-left img').first().attr('src') || ''
    }

    // Fallback to any product image
    if (!image) {
      image = $('img[itemprop="image"]').first().attr('src') || ''
    }

    console.log(`📷 Found image for product ${productId}:`, image)

    const priceText = $('#content .price').first().text().trim()
    const price = extractPrice(priceText)

    if (!name) {
      console.warn(`⚠️ No name found for product ${productId}`)
      return null
    }

    return {
      id: productId,
      name,
      description: description || 'Opis niedostępny',
      image: image ? toImageUrl(image) : '',
      price,
      category_id: 0,
      category_name: '',
      categories: []  // Unknown categories for single product scrape
    }
  } catch (err) {
    console.error(`❌ Error scraping product ${productId}:`, err)
    return null
  }
}

export async function scrapeCategories() {
  return CATEGORIES.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
    description: null,
    image: null,
    active: true
  }))
}
