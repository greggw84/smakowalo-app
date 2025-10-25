/**
 * Pricing utilities for Smakowało meal plans
 * 
 * Price rule: numberOfPeople × numberOfDays × 30 PLN (in grosze: × 3000)
 */

/**
 * Get price for a meal plan in grosze (Polish currency subunit: 1 PLN = 100 groszy)
 * 
 * @param numberOfPeople - Number of people (2, 3, or 4)
 * @param numberOfDays - Number of days (2, 3, 4, or 5)
 * @returns Price in grosze
 * @throws Error if parameters are invalid
 */
export function getPriceForPlan(numberOfPeople: number, numberOfDays: number): number {
  // Validate numberOfPeople
  if (![2, 3, 4].includes(numberOfPeople)) {
    throw new Error(`Invalid numberOfPeople: ${numberOfPeople}. Must be 2, 3, or 4.`);
  }

  // Validate numberOfDays
  if (![2, 3, 4, 5].includes(numberOfDays)) {
    throw new Error(`Invalid numberOfDays: ${numberOfDays}. Must be 2, 3, 4, or 5.`);
  }

  // Calculate price: people × days × 30 PLN
  // Convert to grosze: × 100
  const priceInPLN = numberOfPeople * numberOfDays * 30;
  const priceInGrosze = priceInPLN * 100;

  return priceInGrosze;
}

/**
 * Build a plan key for Stripe Price lookup
 * Format: {people}x{days}
 * 
 * @param numberOfPeople - Number of people (2, 3, or 4)
 * @param numberOfDays - Number of days (2, 3, 4, or 5)
 * @returns Plan key string (e.g., "2x3", "4x5")
 */
export function buildPlanKey(numberOfPeople: number, numberOfDays: number): string {
  return `${numberOfPeople}x${numberOfDays}`;
}

/**
 * Format price in grosze to PLN string for display
 * 
 * @param priceInGrosze - Price in grosze
 * @returns Formatted price string (e.g., "180.00 zł")
 */
export function formatPriceFromGrosze(priceInGrosze: number): string {
  const priceInPLN = priceInGrosze / 100;
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(priceInPLN);
}
