import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export const runtime = "nodejs";

// Type definitions
interface ProductRow {
  id: number;
  name: string;
  description: string;
  image: string;
  active: boolean;
}

interface RecipeRow {
  id: string;
  name: string;
  servings: number;
  created_at: string;
}

interface NutritionRow {
  recipe_id: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  salt: number;
  allergens: string[];
  score: number;
}

interface IngredientRow {
  id: string;
  ingredient_name: string;
  amount_grams: number;
}

interface StepRow {
  id: string;
  order: number;
  title: string;
  description: string;
}

interface GeneratedTextRow {
  recipe_id: string;
  short_description: string;
  long_description: string;
  health_benefits: string;
  substitutions: string;
}

/**
 * GET /api/nutrichef/products/[productId]
 * Fetches complete recipe data for a single product
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const resolvedParams = await params;
    const productId = Number.parseInt(resolvedParams.productId, 10);

    if (isNaN(productId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid product ID",
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Fetch product
    const { data: productResult, error: productError } = await supabase
      .from("products")
      .select("id, name, description, image, active")
      .eq("id", productId)
      .single();

    if (productError || !productResult) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
          details: productError?.message,
        },
        { status: 404 }
      );
    }

    const product = productResult as unknown as ProductRow;

    // Fetch recipe for this product
    const { data: recipeResult, error: recipeError } = await supabase
      .from("recipes")
      .select("id, name, servings, created_at")
      .eq("product_id", productId)
      .single();

    if (recipeError && recipeError.code !== "PGRST116") {
      console.error("Error fetching recipe:", recipeError);
    }

    const recipe = recipeResult as unknown as RecipeRow | null;

    let nutrition: NutritionRow | null = null;
    let ingredients: IngredientRow[] = [];
    let steps: StepRow[] = [];
    let generatedText: GeneratedTextRow | null = null;

    // If recipe exists, fetch related data
    if (recipe) {
      // Fetch nutrition
      const { data: nutritionResult, error: nutritionError } = await supabase
        .from("nutrition")
        .select("*")
        .eq("recipe_id", recipe.id)
        .single();

      if (nutritionError && nutritionError.code !== "PGRST116") {
        console.error("Error fetching nutrition:", nutritionError);
      }
      nutrition = nutritionResult as unknown as NutritionRow | null;

      // Fetch ingredients
      const { data: ingredientsResult, error: ingredientsError } = await supabase
        .from("ingredients")
        .select("id, ingredient_name, amount_grams")
        .eq("recipe_id", recipe.id)
        .order("id", { ascending: true });

      if (ingredientsError) {
        console.error("Error fetching ingredients:", ingredientsError);
      }
      ingredients = (ingredientsResult as unknown as IngredientRow[]) || [];

      // Fetch steps
      const { data: stepsResult, error: stepsError } = await supabase
        .from("recipe_steps")
        .select("id, order, title, description")
        .eq("recipe_id", recipe.id)
        .order("order", { ascending: true });

      if (stepsError) {
        console.error("Error fetching steps:", stepsError);
      }
      steps = (stepsResult as unknown as StepRow[]) || [];

      // Fetch generated text
      const { data: textResult, error: textError } = await supabase
        .from("recipe_generated_text")
        .select("*")
        .eq("recipe_id", recipe.id)
        .single();

      if (textError && textError.code !== "PGRST116") {
        console.error("Error fetching generated text:", textError);
      }
      generatedText = textResult as unknown as GeneratedTextRow | null;
    }

    return NextResponse.json({
      success: true,
      data: {
        product,
        recipe,
        nutrition,
        ingredients,
        steps,
        generatedText,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/nutrichef/products/[productId]:", error);
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
