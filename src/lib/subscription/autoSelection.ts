/**
 * Auto-selection logic for subscription meals.
 * Automatically generates meal selections based on user preferences,
 * diet restrictions, and allergies.
 */

import type { 
  Meal, 
  MealSelection, 
  UserPreferences,
  AllergyTag,
  DietTag,
} from '@/types/subscription';

/**
 * Checks if a meal contains any allergens that the user is allergic to
 * 
 * @param meal - The meal to check
 * @param userAllergies - Array of user's allergies
 * @returns true if meal contains any allergens the user is allergic to
 */
export function mealContainsAllergen(
  meal: Meal,
  userAllergies: AllergyTag[] | undefined
): boolean {
  if (!userAllergies || userAllergies.length === 0) {
    return false;
  }

  const mealAllergens = meal.allergens || [];
  
  return userAllergies.some(allergy => 
    mealAllergens.some(mealAllergen => 
      mealAllergen.toLowerCase() === allergy.toLowerCase()
    )
  );
}

/**
 * Checks if a meal fits the user's diet preferences
 * A meal fits if it matches at least one of the user's diet preferences,
 * or if the user has no diet preferences
 * 
 * @param meal - The meal to check
 * @param userDiets - Array of user's diet preferences
 * @returns true if meal fits user's diet preferences
 */
export function mealFitsDietPreferences(
  meal: Meal,
  userDiets: DietTag[] | undefined
): boolean {
  if (!userDiets || userDiets.length === 0) {
    return true; // No diet preferences = all meals fit
  }

  const mealDiets = meal.diets || [];
  
  if (mealDiets.length === 0) {
    return true; // Meal has no specific diet tags, assume universal
  }

  return userDiets.some(diet => 
    mealDiets.some(mealDiet => 
      mealDiet.toLowerCase() === diet.toLowerCase()
    )
  );
}

/**
 * Checks if a meal is suitable for a user based on preferences and allergies
 * 
 * @param meal - The meal to check
 * @param preferences - User's preferences
 * @returns true if meal is suitable
 */
export function isMealSuitableForUser(
  meal: Meal,
  preferences: UserPreferences
): boolean {
  // Check allergies first - if meal contains allergen, it's not suitable
  if (mealContainsAllergen(meal, preferences.allergies)) {
    return false;
  }

  // Check excluded ingredients
  if (preferences.excludedIngredients && preferences.excludedIngredients.length > 0) {
    const mealIngredients = (meal.ingredients || []).map(i => i.toLowerCase());
    const hasExcludedIngredient = preferences.excludedIngredients.some(excluded =>
      mealIngredients.some(ingredient => ingredient.includes(excluded.toLowerCase()))
    );
    if (hasExcludedIngredient) {
      return false;
    }
  }

  // Check diet preferences
  if (!mealFitsDietPreferences(meal, preferences.diets)) {
    return false;
  }

  return true;
}

/**
 * Filters meals that are safe for a user (no allergens)
 * 
 * @param meals - Array of meals to filter
 * @param preferences - User's preferences
 * @returns Array of safe meals
 */
export function filterSafeMeals(
  meals: Meal[],
  preferences: UserPreferences
): Meal[] {
  return meals.filter(meal => !mealContainsAllergen(meal, preferences.allergies));
}

/**
 * Filters meals that fit user's diet preferences
 * 
 * @param meals - Array of meals to filter
 * @param preferences - User's preferences
 * @returns Array of meals matching diet preferences
 */
export function filterMealsByDiet(
  meals: Meal[],
  preferences: UserPreferences
): Meal[] {
  return meals.filter(meal => mealFitsDietPreferences(meal, preferences.diets));
}

/**
 * Filters meals that are fully suitable for a user (safe + fit diet)
 * 
 * @param meals - Array of meals to filter
 * @param preferences - User's preferences
 * @returns Array of suitable meals
 */
export function filterSuitableMeals(
  meals: Meal[],
  preferences: UserPreferences
): Meal[] {
  return meals.filter(meal => isMealSuitableForUser(meal, preferences));
}

/**
 * Generates automatic meal selections based on user preferences.
 * Tries to select meals that:
 * 1. Don't contain allergens (mandatory)
 * 2. Fit user's diet preferences (preferred)
 * 3. Provide variety (avoid duplicates when possible)
 * 
 * @param availableMeals - Array of available meals in the weekly menu
 * @param preferences - User's preferences
 * @param mealsPerDay - Number of meals needed per day (people count)
 * @param numberOfDays - Number of days in the subscription
 * @returns Array of MealSelection objects
 */
export function generateAutoSelection(
  availableMeals: Meal[],
  preferences: UserPreferences,
  mealsPerDay: number,
  numberOfDays: number
): MealSelection[] {
  const requiredMeals = mealsPerDay * numberOfDays;
  const selections: MealSelection[] = [];
  const usedMealIds = new Set<number>();

  // First filter: Safe meals (no allergens) - MANDATORY
  const safeMeals = filterSafeMeals(availableMeals, preferences);

  if (safeMeals.length === 0) {
    console.warn('No safe meals available after filtering allergens');
    return [];
  }

  // Second filter: Meals that fit diet preferences - PREFERRED
  const preferredMeals = filterMealsByDiet(safeMeals, preferences);

  // Use preferred meals first, then fall back to safe meals
  const mealPool = preferredMeals.length > 0 ? preferredMeals : safeMeals;
  const fallbackPool = preferredMeals.length > 0 ? safeMeals : [];

  // Helper to add a meal to selections
  const addMeal = (meal: Meal): boolean => {
    if (selections.length >= requiredMeals) {
      return false;
    }
    
    selections.push({
      productId: meal.id,
      quantity: 1,
    });
    usedMealIds.add(meal.id);
    return true;
  };

  // First pass: Select unique meals from preferred pool
  for (const meal of mealPool) {
    if (!usedMealIds.has(meal.id)) {
      if (!addMeal(meal)) break;
    }
  }

  // Second pass: If we need more, try fallback pool (safe but not preferred)
  if (selections.length < requiredMeals && fallbackPool.length > 0) {
    for (const meal of fallbackPool) {
      if (!usedMealIds.has(meal.id)) {
        if (!addMeal(meal)) break;
      }
    }
  }

  // Third pass: If still need more, allow duplicates from preferred meals
  if (selections.length < requiredMeals) {
    let loopCount = 0;
    const maxLoops = requiredMeals * 2; // Prevent infinite loop

    while (selections.length < requiredMeals && loopCount < maxLoops) {
      for (const meal of mealPool) {
        if (!addMeal(meal)) break;
      }
      loopCount++;
    }
  }

  // Final pass: If still need more, use any safe meal
  if (selections.length < requiredMeals && safeMeals.length > 0) {
    let loopCount = 0;
    const maxLoops = requiredMeals * 2;

    while (selections.length < requiredMeals && loopCount < maxLoops) {
      for (const meal of safeMeals) {
        if (!addMeal(meal)) break;
      }
      loopCount++;
    }
  }

  return selections;
}

/**
 * Validates that all meal selections are safe for a user
 * 
 * @param selections - Array of meal selection product IDs
 * @param availableMeals - Array of available meals
 * @param preferences - User's preferences
 * @returns Object with validation result and any unsafe meal names
 */
export function validateSelections(
  selections: number[],
  availableMeals: Meal[],
  preferences: UserPreferences
): { isValid: boolean; unsafeMeals: string[] } {
  const unsafeMeals: string[] = [];

  for (const productId of selections) {
    const meal = availableMeals.find(m => m.id === productId);
    if (meal && mealContainsAllergen(meal, preferences.allergies)) {
      unsafeMeals.push(meal.name);
    }
  }

  return {
    isValid: unsafeMeals.length === 0,
    unsafeMeals,
  };
}

/**
 * Gets meals that the user should be warned about (contain allergens)
 * 
 * @param meals - Array of meals to check
 * @param preferences - User's preferences
 * @returns Array of meal IDs that contain user's allergens
 */
export function getMealsWithAllergenWarning(
  meals: Meal[],
  preferences: UserPreferences
): number[] {
  return meals
    .filter(meal => mealContainsAllergen(meal, preferences.allergies))
    .map(meal => meal.id);
}

/**
 * Gets meals that are highlighted as recommended (fit diet preferences)
 * 
 * @param meals - Array of meals to check
 * @param preferences - User's preferences
 * @returns Array of meal IDs that are recommended
 */
export function getRecommendedMeals(
  meals: Meal[],
  preferences: UserPreferences
): number[] {
  return meals
    .filter(meal => 
      !mealContainsAllergen(meal, preferences.allergies) && 
      mealFitsDietPreferences(meal, preferences.diets)
    )
    .map(meal => meal.id);
}
