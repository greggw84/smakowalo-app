import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase";
import { generateAndSaveRecipe, delay } from "@/lib/recipe-generator";

export const runtime = "nodejs";

// Longer timeout for batch operations
export const maxDuration = 300; // 5 minutes

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Request body schema
const requestSchema = z.object({
  servings: z.number().int().min(1).default(2),
  force: z.boolean().default(false), // Force regeneration even if recipe exists
});

interface BatchError {
  productId: number;
  productName: string;
  error: string;
}

// Type for product query result
interface ProductRow {
  id: number;
  name: string;
}

// Type for recipe query result
interface RecipeRow {
  id: string;
}

// Handle preflight CORS requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * Batch generate recipe data for all active products
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body (optional)
    let servings = 2;
    let force = false;

    try {
      const body = await request.json();
      const parseResult = requestSchema.safeParse(body);
      if (parseResult.success) {
        servings = parseResult.data.servings;
        force = parseResult.data.force;
      }
    } catch {
      // Body is optional, use defaults
    }

    // Get Supabase client
    const supabase = getSupabaseServerClient();

    // Fetch all active products
    const { data: productsResult, error: productsError } = await supabase
      .from("products")
      .select("id, name")
      .eq("active", true)
      .order("id", { ascending: true });

    if (productsError) {
      console.error("Failed to fetch products:", productsError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch products from database",
          details: productsError.message,
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // Type assertion for products
    const products = (productsResult as unknown as ProductRow[]) || [];

    if (products.length === 0) {
      return NextResponse.json(
        {
          success: true,
          createdCount: 0,
          skippedCount: 0,
          message: "No active products found",
        },
        { status: 200, headers: corsHeaders }
      );
    }

    let createdCount = 0;
    let skippedCount = 0;
    const errors: BatchError[] = [];

    // Process products sequentially to avoid rate limits
    for (const product of products) {
      try {
        // Check if recipe already exists for this product
        const { data: existingRecipeResult, error: checkError } = await supabase
          .from("recipes")
          .select("id")
          .eq("product_id", product.id)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          // PGRST116 = not found, which is expected
          console.error(
            `Error checking existing recipe for product ${product.id}:`,
            checkError
          );
        }

        const existingRecipe = existingRecipeResult as unknown as RecipeRow | null;

        if (existingRecipe && !force) {
          // Recipe already exists, skip
          skippedCount++;
          console.log(
            `Skipped product ${product.id} (${product.name}) - recipe already exists`
          );
          continue;
        }

        // Generate and save recipe
        const result = await generateAndSaveRecipe(
          product.name,
          servings,
          product.id
        );

        if (result.success) {
          createdCount++;
          console.log(
            `Generated recipe for product ${product.id} (${product.name})`
          );
        } else {
          errors.push({
            productId: product.id,
            productName: product.name,
            error: result.error ?? "Unknown error",
          });
          console.error(
            `Failed to generate recipe for product ${product.id}:`,
            result.error
          );
        }

        // Add delay between API calls to avoid rate limits (400ms)
        await delay(400);
      } catch (error) {
        errors.push({
          productId: product.id,
          productName: product.name,
          error: error instanceof Error ? error.message : String(error),
        });
        console.error(
          `Error processing product ${product.id}:`,
          error
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        createdCount,
        skippedCount,
        totalProcessed: products.length,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error in batch generate-recipe-data:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
