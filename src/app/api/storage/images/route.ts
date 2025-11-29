import { type NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import { MENU_IMAGES_BUCKET, getStorageImageUrl, listStorageImages } from '@/lib/supabase-storage'

/**
 * GET /api/storage/images - List all images in the menu-images bucket
 * Useful for debugging and admin functions
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const folder = url.searchParams.get('folder') || undefined

    const supabase = createSupabaseClient()

    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured',
        bucket: MENU_IMAGES_BUCKET,
        message: 'Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables',
      }, { status: 500 })
    }

    // List files in the bucket
    const files = await listStorageImages(folder)

    if (!files) {
      return NextResponse.json({
        success: false,
        error: 'Failed to list images',
        bucket: MENU_IMAGES_BUCKET,
        folder: folder || '(root)',
      }, { status: 500 })
    }

    // Generate public URLs for each file
    const filesWithUrls = files.map(file => ({
      name: file.name,
      id: file.id,
      created_at: file.created_at,
      updated_at: file.updated_at,
      metadata: file.metadata,
      publicUrl: getStorageImageUrl(folder ? `${folder}/${file.name}` : file.name),
    }))

    return NextResponse.json({
      success: true,
      bucket: MENU_IMAGES_BUCKET,
      folder: folder || '(root)',
      count: filesWithUrls.length,
      files: filesWithUrls,
    })
  } catch (error) {
    console.error('Storage images API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
