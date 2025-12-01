import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAIClient } from "@/lib/openai";
import { getSupabaseServerClient } from "@/lib/supabase";

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
});

// Ingredient schema
const ingredientSchema = z.object({
  name: z.string(),
  grams: z.number(),
});

// Nutrition schema
const nutritionSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  fat: z.number(),
  carbs: z.number(),
  fiber: z.number(),
  salt: z.number(),
  allergens: z.array(z.string()),
  score: z.number().int().min(0).max(100),
});

// Text fields schema
const textSchema = z.object({
  short_description: z.string(),
  long_description: z.string(),
  health_benefits: z.string(),
  substitutions: z.string(),
});

// Step schema
const stepSchema = z.object({
  order: z.number().int().min(1),
  title: z.string(),
  description: z.string(),
});

// Full OpenAI response schema
const recipeResponseSchema = z.object({
  ingredients: z.array(ingredientSchema),
  nutrition: nutritionSchema,
  text: textSchema,
  steps: z.array(stepSchema),
});

type RecipeResponse = z.infer<typeof recipeResponseSchema>;

// System prompt for OpenAI
const SYSTEM_PROMPT = `You are a highly accurate recipe nutrition generator for Smakowało, a Polish ready-meal subscription service similar to GreenChef. 
Given a recipe name and number of servings, produce:

1. Realistic ingredients list with grams (European units)
2. Nutritional values (kcal, protein, fat, carbs, fiber, salt)
3. Allergens (array)
4. Health score 0–100
5. Short description (max 25 words)
6. Long description (2–4 sentences)
7. Health benefits
8. Ingredient substitutions

Return ONLY valid JSON. No comments, no explanation, no text outside JSON.`;

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
          details: parseResult.error.errors,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const { name, servings } = parseResult.data;

    // Get OpenAI client
    const openai = getOpenAIClient();

    // Build user prompt
    const userPrompt = `Generate recipe data for: "${name}" with ${servings} servings.

Return the response in this exact JSON structure:
{
  "ingredients": [
    {"name": "Ingredient name", "grams": 250}
  ],
  "nutrition": {
    "calories": 780,
    "protein": 52,
    "fat": 29,
    "carbs": 72,
    "fiber": 6,
    "salt": 1.8,
    "allergens": ["allergen1"],
    "score": 86
  },
  "text": {
    "short_description": "Max 25 words description",
    "long_description": "2-4 sentences description",
    "health_benefits": "Health benefits text",
    "substitutions": "Possible substitutions"
  },
  "steps": [
    {
      "order": 1,
      "title": "Step title",
      "description": "Step description"
    }
  ]
}`;

    // Call OpenAI with retry logic
    let recipeData: RecipeResponse | null = null;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const promptToUse =
          attempt === 0
            ? userPrompt
            : "Fix JSON and return ONLY valid JSON for the same structure.";

        const completion = await openai.chat.completions.create({
          model: "gpt-4.1-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: promptToUse },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
          throw new Error("Empty response from OpenAI");
        }

        // Try to parse JSON from the response
        // Handle potential markdown code blocks
        let jsonContent = content.trim();
        if (jsonContent.startsWith("```json")) {
          jsonContent = jsonContent.slice(7);
        }
        if (jsonContent.startsWith("```")) {
          jsonContent = jsonContent.slice(3);
        }
        if (jsonContent.endsWith("```")) {
          jsonContent = jsonContent.slice(0, -3);
        }
        jsonContent = jsonContent.trim();

        const parsedJson = JSON.parse(jsonContent);

        // Validate against schema
        const validationResult = recipeResponseSchema.safeParse(parsedJson);

        if (!validationResult.success) {
          throw new Error(
            `Invalid JSON structure: ${validationResult.error.message}`
          );
        }

        recipeData = validationResult.data;
        break; // Success, exit retry loop
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`OpenAI attempt ${attempt + 1} failed:`, lastError);
        // Continue to retry if not last attempt
      }
    }

    if (!recipeData) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate valid recipe data after retries",
          details: lastError?.message,
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // Get Supabase client
    const supabase = getSupabaseServerClient();

    // Insert into recipes table
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .insert({
        name,
        servings,
      })
      .select("id")
      .single();

    if (recipeError || !recipe) {
      console.error("Failed to insert recipe:", recipeError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to save recipe to database",
          details: recipeError?.message,
        },
        { status: 500, headers: corsHeaders }
      );
    }

    const recipeId = recipe.id;

    // Bulk insert ingredients
    const ingredientsToInsert = recipeData.ingredients.map((ing) => ({
      recipe_id: recipeId,
      ingredient_name: ing.name,
      amount_grams: ing.grams,
    }));

    const { error: ingredientsError } = await supabase
      .from("ingredients")
      .insert(ingredientsToInsert);

    if (ingredientsError) {
      console.error("Failed to insert ingredients:", ingredientsError);
      // Continue with other inserts, but log the error
    }

    // Insert nutrition data
    const { error: nutritionError } = await supabase.from("nutrition").insert({
      recipe_id: recipeId,
      calories: recipeData.nutrition.calories,
      protein: recipeData.nutrition.protein,
      fat: recipeData.nutrition.fat,
      carbs: recipeData.nutrition.carbs,
      fiber: recipeData.nutrition.fiber,
      salt: recipeData.nutrition.salt,
      allergens: recipeData.nutrition.allergens,
      score: recipeData.nutrition.score,
    });

    if (nutritionError) {
      console.error("Failed to insert nutrition:", nutritionError);
    }

    // Insert generated text
    const { error: textError } = await supabase
      .from("recipe_generated_text")
      .insert({
        recipe_id: recipeId,
        short_description: recipeData.text.short_description,
        long_description: recipeData.text.long_description,
        health_benefits: recipeData.text.health_benefits,
        substitutions: recipeData.text.substitutions,
      });

    if (textError) {
      console.error("Failed to insert generated text:", textError);
    }

    // Insert recipe steps
    const stepsToInsert = recipeData.steps.map((step) => ({
      recipe_id: recipeId,
      order: step.order,
      title: step.title,
      description: step.description,
    }));

    const { error: stepsError } = await supabase
      .from("recipe_steps")
      .insert(stepsToInsert);

    if (stepsError) {
      console.error("Failed to insert steps:", stepsError);
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        recipe_id: recipeId,
        data: recipeData,
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
