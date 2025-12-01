import { z } from "zod";
import { getOpenAIClient } from "@/lib/openai";
import { getSupabaseServerClient } from "@/lib/supabase";

// Type definitions for new recipe tables
interface RecipeRow {
  id: number;            // w Supabase będzie BIGINT -> w TS wygodniej jako number
  name: string;
  servings: number;
  product_id: number | null;
  created_at?: string;
}

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
export const recipeResponseSchema = z.object({
  ingredients: z.array(ingredientSchema),
  nutrition: nutritionSchema,
  text: textSchema,
  steps: z.array(stepSchema),
});

export type RecipeResponse = z.infer<typeof recipeResponseSchema>;

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

export interface GenerateRecipeResult {
  success: boolean;
  recipeId?: number;
  data?: RecipeResponse;
  error?: string;
  details?: string;
}

/**
 * Generates recipe data using OpenAI
 * @param name Recipe name
 * @param servings Number of servings
 * @returns Generated recipe data or null if failed
 */
export async function generateRecipeDataFromOpenAI(
  name: string,
  servings: number
): Promise<{ data: RecipeResponse | null; error: string | null }> {
  const openai = getOpenAIClient();

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

  let recipeData: RecipeResponse | null = null;
  let lastError: string | null = null;

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
      lastError = error instanceof Error ? error.message : String(error);
      console.error(`OpenAI attempt ${attempt + 1} failed:`, lastError);
      // Continue to retry if not last attempt
    }
  }

  return { data: recipeData, error: recipeData ? null : lastError };
}

/**
 * Saves recipe data to Supabase
 * @param name Recipe name
 * @param servings Number of servings
 * @param data Recipe data from OpenAI
 * @param productId Optional product ID to link
 * @returns Recipe ID or error
 */
export async function saveRecipeToSupabase(
  name: string,
  servings: number,
  data: RecipeResponse,
  productId?: number
): Promise<{ recipeId: number | null; error: string | null }> {
  const supabase = getSupabaseServerClient();

  // Insert into recipes table
  const { data: recipeResult, error: recipeError } = await supabase
    .from("recipes")
    .insert({
      name,
      servings,
      product_id: productId ?? null,
    })
    .select("id")
    .single();

  if (recipeError || !recipeResult) {
    console.error("Failed to insert recipe:", recipeError);
    return { recipeId: null, error: recipeError?.message ?? "Unknown error" };
  }

  const recipe = recipeResult as RecipeRow;
  const recipeId = recipe.id;

  // Bulk insert ingredients
  const ingredientsToInsert = data.ingredients.map((ing) => ({
    recipe_id: recipeId,
    ingredient_name: ing.name,
    amount_grams: ing.grams,
  }));

  const { error: ingredientsError } = await supabase
    .from("ingredients")
    .insert(ingredientsToInsert);

  if (ingredientsError) {
    console.error("Failed to insert ingredients:", ingredientsError);
  }

  // Insert nutrition data
  const { error: nutritionError } = await supabase.from("nutrition").insert({
    recipe_id: recipeId,
    calories: data.nutrition.calories,
    protein: data.nutrition.protein,
    fat: data.nutrition.fat,
    carbs: data.nutrition.carbs,
    fiber: data.nutrition.fiber,
    salt: data.nutrition.salt,
    allergens: data.nutrition.allergens,
    score: data.nutrition.score,
  });

  if (nutritionError) {
    console.error("Failed to insert nutrition:", nutritionError);
  }

  // Insert generated text
  const { error: textError } = await supabase
    .from("recipe_generated_text")
    .insert({
      recipe_id: recipeId,
      short_description: data.text.short_description,
      long_description: data.text.long_description,
      health_benefits: data.text.health_benefits,
      substitutions: data.text.substitutions,
    });

  if (textError) {
    console.error("Failed to insert generated text:", textError);
  }

  // Insert recipe steps
  const stepsToInsert = data.steps.map((step) => ({
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

  return { recipeId, error: null };
}

/**
 * Full recipe generation pipeline - generates from OpenAI and saves to Supabase
 * @param name Recipe name
 * @param servings Number of servings
 * @param productId Optional product ID to link
 * @returns Result with recipe ID and data
 */
export async function generateAndSaveRecipe(
  name: string,
  servings: number,
  productId?: number
): Promise<GenerateRecipeResult> {
  // Generate data from OpenAI
  const { data, error: generateError } = await generateRecipeDataFromOpenAI(
    name,
    servings
  );

  if (!data || generateError) {
    return {
      success: false,
      error: "Failed to generate recipe data",
      details: generateError ?? undefined,
    };
  }

  // Save to Supabase
  const { recipeId, error: saveError } = await saveRecipeToSupabase(
    name,
    servings,
    data,
    productId
  );

  if (!recipeId || saveError) {
    return {
      success: false,
      error: "Failed to save recipe to database",
      details: saveError ?? undefined,
    };
  }

  return {
    success: true,
    recipeId,
    data,
  };
}

/**
 * Utility function to add delay between API calls
 * @param ms Milliseconds to delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
