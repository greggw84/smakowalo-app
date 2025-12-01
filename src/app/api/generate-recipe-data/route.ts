import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAndSaveRecipe } from "@/lib/recipe-generator";

// Try Edge runtime, fallback to Node if needed
export const runtime = "nodejs";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Request body schema
const requestSchema = z.object({
  name: z.string().min(1, "Recipe name is required"),
  servings: z.number().int().min(1).default(2),
  productId: z.number().int().optional(),
});

// Handle preflight CORS requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * Generate recipe data using OpenAI and store in Supabase
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const parseResult = requestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
          details: parseResult.error.issues,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const { name, servings, productId } = parseResult.data;

    // Generate and save recipe using shared function
    const result = await generateAndSaveRecipe(name, servings, productId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          details: result.details,
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        recipe_id: result.recipeId,
        data: result.data,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error in generate-recipe-data:", error);

    // Handle JSON parsing errors specifically
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body",
        },
        { status: 400, headers: corsHeaders }
      );
    }

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
