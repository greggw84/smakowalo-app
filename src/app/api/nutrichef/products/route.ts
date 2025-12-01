import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export const runtime = "nodejs";

// Type definitions
interface ProductRow {
  id: number;
  name: string;
  active: boolean;
  calories: string | null;
  allergens: string[] | null;
}

interface RecipeRow {
  id: string;
  product_id: number | null;
}

/**
 * GET /api/nutrichef/products
 * Fetches all products with recipe status for NutriChef admin UI
 */
export async function GET() {
  try {
    const supabase = getSupabaseServerClient();

    // Fetch all products
    const { data: productsResult, error: productsError } = await supabase
      .from("products")
      .select("id, name, active, calories, allergens")
      .order("id", { ascending: true });

    if (productsError) {
      console.error("Failed to fetch products:", productsError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch products",
          details: productsError.message,
        },
        { status: 500 }
      );
    }

    // Type assertion for products
    const products = (productsResult as unknown as ProductRow[]) || [];

    // Fetch all recipes to check which products have recipes
    const { data: recipesResult, error: recipesError } = await supabase
      .from("recipes")
      .select("id, product_id");

    if (recipesError) {
      console.error("Failed to fetch recipes:", recipesError);
      // Continue without recipe info - non-critical
    }

    // Type assertion for recipes
    const recipes = (recipesResult as unknown as RecipeRow[]) || [];

    // Create a map of product_id to recipe_id
    const recipeMap = new Map<number, string>();
    for (const recipe of recipes) {
      if (recipe.product_id) {
        recipeMap.set(recipe.product_id, recipe.id);
      }
    }

    // Combine products with recipe status
    const productsWithRecipeStatus = products.map((product) => ({
      id: product.id,
      name: product.name,
      active: product.active,
      calories: product.calories,
      allergens: product.allergens,
      hasRecipe: recipeMap.has(product.id),
      recipeId: recipeMap.get(product.id),
    }));

    return NextResponse.json({
      success: true,
      products: productsWithRecipeStatus,
    });
  } catch (error) {
    console.error("Error in GET /api/nutrichef/products:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
