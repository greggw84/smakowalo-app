import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * GET /api/admin/weekly-menu/items
 * Get menu details with items and products joined
 */
export async function GET(req: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const menuId = searchParams.get("menu_id");

    if (!menuId) {
      return NextResponse.json(
        { error: "Missing menu_id parameter" },
        { status: 400 }
      );
    }

    // Get menu details
    const { data: menu, error: menuError } = await supabase
      .from("weekly_menus")
      .select("*")
      .eq("id", menuId)
      .single();

    if (menuError) {
      console.error("Error fetching menu:", menuError);
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Get menu items with product details
    const { data: items, error: itemsError } = await supabase
      .from("weekly_menu_items")
      .select(
        `
        id,
        weekly_menu_id,
        product_id,
        day_of_week,
        position,
        is_featured,
        created_at,
        product:products(
          id,
          name,
          description,
          image,
          price,
          calories,
          allergens,
          active
        )
      `
      )
      .eq("weekly_menu_id", menuId)
      .order("position", { ascending: true });

    if (itemsError) {
      console.error("Error fetching items:", itemsError);
      return NextResponse.json(
        { error: "Error fetching menu items" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      menu,
      items: items || [],
    });
  } catch (error) {
    console.error("❌ Error in GET /api/admin/weekly-menu/items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/weekly-menu/items
 * Add a new item to a weekly menu
 */
export async function POST(req: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { weekly_menu_id, product_id, day_of_week } = body;

    if (!weekly_menu_id || !product_id) {
      return NextResponse.json(
        { error: "Missing required fields: weekly_menu_id, product_id" },
        { status: 400 }
      );
    }

    // Verify menu exists
    const { data: menu } = await supabase
      .from("weekly_menus")
      .select("id")
      .eq("id", weekly_menu_id)
      .single();

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Get max position for ordering
    const { data: existingItems } = await supabase
      .from("weekly_menu_items")
      .select("position")
      .eq("weekly_menu_id", weekly_menu_id)
      .order("position", { ascending: false })
      .limit(1);

    const nextPosition =
      existingItems && existingItems.length > 0
        ? (existingItems[0].position || 0) + 1
        : 0;

    // Insert new item
    const { data: newItem, error: insertError } = await supabase
      .from("weekly_menu_items")
      .insert({
        weekly_menu_id,
        product_id,
        day_of_week: day_of_week || null,
        position: nextPosition,
        is_featured: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating item:", insertError);
      return NextResponse.json(
        { error: "Error creating menu item" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Item added successfully",
      item: newItem,
    });
  } catch (error) {
    console.error("❌ Error in POST /api/admin/weekly-menu/items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/weekly-menu/items
 * Update an existing menu item
 */
export async function PUT(req: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { item_id, product_id, day_of_week, position, is_featured } = body;

    if (!item_id) {
      return NextResponse.json({ error: "Missing item_id" }, { status: 400 });
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (product_id !== undefined) updateData.product_id = product_id;
    if (day_of_week !== undefined) updateData.day_of_week = day_of_week;
    if (position !== undefined) updateData.position = position;
    if (is_featured !== undefined) updateData.is_featured = is_featured;

    const { data: updatedItem, error: updateError } = await supabase
      .from("weekly_menu_items")
      .update(updateData)
      .eq("id", item_id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating item:", updateError);
      return NextResponse.json(
        { error: "Error updating menu item" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("❌ Error in PUT /api/admin/weekly-menu/items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/weekly-menu/items
 * Delete a menu item
 */
export async function DELETE(req: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("id");

    if (!itemId) {
      return NextResponse.json({ error: "Missing item id" }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from("weekly_menu_items")
      .delete()
      .eq("id", itemId);

    if (deleteError) {
      console.error("Error deleting item:", deleteError);
      return NextResponse.json(
        { error: "Error deleting menu item" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error in DELETE /api/admin/weekly-menu/items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
