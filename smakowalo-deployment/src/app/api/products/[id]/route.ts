import { type NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Product = Database['public']['Tables']['products']['Row']
type ProductUpdate = Database['public']['Tables']['products']['Update']

// GET /api/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params
    const productId = Number.parseInt(id)
    if (Number.isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        ),
        reviews (
          id,
          rating,
          title,
          comment,
          verified_purchase,
          created_at,
          profiles (
            first_name,
            last_name
          )
        )
      `)
      .eq('id', productId)
      .eq('active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      console.error('Error fetching product:', error)
      return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
    }

    return NextResponse.json({
      product,
      success: true
    })

  } catch (error) {
    console.error('Product API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params
    const productId = Number.parseInt(id)
    if (Number.isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const body = await request.json()

    // Update slug if name is changed
    if (body.name) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }

    // Convert string values to appropriate types
    const updateData: ProductUpdate = {}

    if (body.name) updateData.name = body.name
    if (body.slug) updateData.slug = body.slug
    if (body.description) updateData.description = body.description
    if (body.image) updateData.image = body.image
    if (body.price) updateData.price = Number.parseFloat(body.price)
    if (body.old_price !== undefined) updateData.old_price = body.old_price ? Number.parseFloat(body.old_price) : null
    if (body.category_id) updateData.category_id = Number.parseInt(body.category_id)
    if (body.cook_time) updateData.cook_time = Number.parseInt(body.cook_time)
    if (body.servings) updateData.servings = Number.parseInt(body.servings)
    if (body.difficulty) updateData.difficulty = body.difficulty
    if (body.calories) updateData.calories = Number.parseInt(body.calories)
    if (body.protein) updateData.protein = Number.parseFloat(body.protein)
    if (body.carbs) updateData.carbs = Number.parseFloat(body.carbs)
    if (body.fat) updateData.fat = Number.parseFloat(body.fat)
    if (body.fiber) updateData.fiber = Number.parseFloat(body.fiber)
    if (body.ingredients) updateData.ingredients = body.ingredients
    if (body.allergens) updateData.allergens = body.allergens
    if (body.equipment !== undefined) updateData.equipment = body.equipment
    if (body.instructions) updateData.instructions = body.instructions
    if (body.nutrition_per_100g !== undefined) updateData.nutrition_per_100g = body.nutrition_per_100g
    if (body.tags) updateData.tags = body.tags
    if (body.diets) updateData.diets = body.diets
    if (body.active !== undefined) updateData.active = body.active
    if (body.featured !== undefined) updateData.featured = body.featured
    if (body.stock_quantity !== undefined) updateData.stock_quantity = Number.parseInt(body.stock_quantity)
    if (body.sku !== undefined) updateData.sku = body.sku

    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
    }

    return NextResponse.json({
      product,
      success: true,
      message: 'Product updated successfully'
    })

  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/products/[id] - Delete product (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params
    const productId = Number.parseInt(id)
    if (Number.isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    // Soft delete by setting active to false
    const { error } = await supabase
      .from('products')
      .update({ active: false })
      .eq('id', productId)

    if (error) {
      console.error('Error deleting product:', error)
      return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })

  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
