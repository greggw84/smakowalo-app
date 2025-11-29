# Menu Images - Supabase Storage Configuration

This document describes how menu/product images are stored and fetched in the Smakowało application.

## Overview

The application supports two image URL formats:
1. **Full URLs** - External image URLs (e.g., `https://example.com/image.jpg`)
2. **Storage paths** - Paths to images in Supabase Storage (e.g., `products/dish-1.jpg`)

## Supabase Storage Bucket Setup

### 1. Create the Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the sidebar
3. Click **New bucket**
4. Create a bucket with these settings:
   - **Name**: `menu-images`
   - **Public**: ✅ Enable (allows public access to images)
   - **File size limit**: 5MB (recommended)
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

### 2. Configure Bucket Policies (RLS)

For a public bucket, you may need to add a policy to allow public access:

```sql
-- Allow public read access to menu-images bucket
CREATE POLICY "Public access for menu-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');
```

### 3. Upload Images

You can upload images:

**Via Supabase Dashboard:**
1. Go to Storage → `menu-images`
2. Click "Upload" and select images
3. Images will be accessible at:
   ```
   {SUPABASE_URL}/storage/v1/object/public/menu-images/{filename}
   ```

**Via Code:**
```typescript
import { createSupabaseClient } from '@/lib/supabase'

const supabase = createSupabaseClient()

// Upload an image
const { data, error } = await supabase.storage
  .from('menu-images')
  .upload('products/dish-1.jpg', file, {
    cacheControl: '3600',
    upsert: false
  })
```

## Image URL Conventions

### Product Images

Store product images using one of these patterns:

1. **By product ID**: `products/{product_id}.jpg`
2. **By slug**: `products/{product_slug}.jpg`
3. **Organized by category**: `{category_slug}/{product_slug}.jpg`

### Database Image Field

In the `products` table, the `image` column can contain:

- **Full URL**: `https://example.com/image.jpg` - Used as-is
- **Storage path**: `products/dish-1.jpg` - Converted to public URL automatically

## How It Works

### Backend Processing

The API routes automatically process image URLs:

1. When fetching products, the `processProductImages()` function is called
2. For each product:
   - If `image` starts with `http://` or `https://`, it's used as-is
   - Otherwise, it's treated as a storage path and converted to a public URL

```typescript
// Example: Storage path → Public URL
'products/dish-1.jpg' 
→ 'https://xyz.supabase.co/storage/v1/object/public/menu-images/products/dish-1.jpg'
```

### Frontend Component

The `ProductImage` component handles:
- Loading images from any source
- Graceful fallback to a placeholder if loading fails
- Proper sizing for Next.js Image optimization

## Environment Variables

Required environment variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## API Endpoints

### List Storage Images

```
GET /api/storage/images
GET /api/storage/images?folder=products
```

Returns:
```json
{
  "success": true,
  "bucket": "menu-images",
  "folder": "(root)",
  "count": 10,
  "files": [
    {
      "name": "dish-1.jpg",
      "publicUrl": "https://xyz.supabase.co/storage/v1/object/public/menu-images/dish-1.jpg"
    }
  ]
}
```

## Fallback Behavior

If an image fails to load:
1. The `ProductImage` component switches to a placeholder image
2. In development, a warning is logged to the console
3. The user experience is not interrupted

Default placeholder:
```
https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop
```

## Migration Guide

### From External URLs to Storage

1. Upload images to Supabase Storage bucket
2. Update the `image` field in the `products` table:

```sql
-- Example: Update a product to use storage path
UPDATE products 
SET image = 'products/kurczak-tikka.jpg'
WHERE id = 61;
```

### Bulk Update

```sql
-- Update all products to use storage paths
UPDATE products 
SET image = 'products/' || slug || '.jpg'
WHERE image LIKE 'https://external-site.com%';
```

## Troubleshooting

### Images Not Displaying

1. **Check bucket exists**: Verify `menu-images` bucket exists in Supabase
2. **Check public access**: Ensure bucket is public or RLS allows access
3. **Check image path**: Verify the path matches files in storage
4. **Check CORS**: Ensure Supabase URL is in Next.js `remotePatterns`

### API Returns Empty Images

1. Check Supabase environment variables are set correctly
2. Verify the storage bucket has files
3. Check the API response source field (should be `supabase`)

## Related Files

- `/src/lib/supabase-storage.ts` - Storage helper functions
- `/src/components/ProductImage.tsx` - Image component with fallback
- `/src/app/api/products/route.ts` - Products API with image processing
- `/src/app/api/storage/images/route.ts` - Storage listing API
