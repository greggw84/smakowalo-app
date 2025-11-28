import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Helper to verify admin access
 */
async function verifyAdmin(
  req: NextRequest,
  supabase: ReturnType<typeof createClient>
) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return { error: "Unauthorized", status: 401 };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

  if (authError || !user) {
    return { error: "Unauthorized", status: 401 };
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Forbidden - Admin only", status: 403 };
  }

  return { user };
}

/**
 * GET /api/admin/products
 * Get all products for admin dropdown selection
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
    const authResult = await verifyAdmin(req, supabase);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active_only") === "true";
    const search = searchParams.get("search");

    // Build query
    let query = supabase
      .from("products")
      .select("id, name, description, image, price, calories, allergens, active")
      .order("name", { ascending: true });

    // Filter by active status if requested
    if (activeOnly) {
      query = query.eq("active", true);
    }

    // Search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json(
        { error: "Error fetching products" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      products: products || [],
    });
  } catch (error) {
    console.error("❌ Error in GET /api/admin/products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
