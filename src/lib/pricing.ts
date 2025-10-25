/**
 * Pricing helper for Smakowalo subscription plans
 * 
 * Calculates weekly subscription prices based on:
 * - Number of people (2, 3, 4)
 * - Days per week (2, 3, 4, 5)
 * 
 * Base pricing: 30 PLN per portion
 */

export interface PlanConfig {
  people: number
  days: number
}

export interface PlanPricing {
  people: number
  days: number
  planKey: string
  weeklyAmount: number // in grosze (PLN cents)
  weeklyAmountPLN: number // in PLN
  pricePerPortion: number // in PLN
  totalPortions: number
}

// Supported plan configurations
export const SUPPORTED_PEOPLE = [2, 3, 4] as const
export const SUPPORTED_DAYS = [2, 3, 4, 5] as const

// Base price per portion in PLN
export const PRICE_PER_PORTION = 30

/**
 * Generate plan key for lookup in Stripe
 * Format: {people}x{days}
 * Example: 2x3, 4x5
 */
export function getPlanKey(people: number, days: number): string {
  return `${people}x${days}`
}

/**
 * Validate plan configuration
 */
export function isValidPlan(people: number, days: number): boolean {
  return (
    SUPPORTED_PEOPLE.includes(people as any) &&
    SUPPORTED_DAYS.includes(days as any)
  )
}

/**
 * Calculate price for a subscription plan
 * Returns amount in grosze (PLN cents) for Stripe
 */
export function getPriceForPlan(people: number, days: number): number {
  if (!isValidPlan(people, days)) {
    throw new Error(
      `Unsupported plan configuration: ${people} people, ${days} days. ` +
      `Supported people: ${SUPPORTED_PEOPLE.join(', ')}. ` +
      `Supported days: ${SUPPORTED_DAYS.join(', ')}.`
    )
  }

  // Calculate total portions per week
  const totalPortions = people * days

  // Weekly price in PLN
  const weeklyPricePLN = totalPortions * PRICE_PER_PORTION

  // Convert to grosze (cents) for Stripe
  const weeklyPriceGrosze = Math.round(weeklyPricePLN * 100)

  return weeklyPriceGrosze
}

/**
 * Get full pricing details for a plan
 */
export function getPlanPricing(people: number, days: number): PlanPricing {
  if (!isValidPlan(people, days)) {
    throw new Error(
      `Unsupported plan configuration: ${people} people, ${days} days`
    )
  }

  const totalPortions = people * days
  const weeklyAmountPLN = totalPortions * PRICE_PER_PORTION
  const weeklyAmount = Math.round(weeklyAmountPLN * 100)

  return {
    people,
    days,
    planKey: getPlanKey(people, days),
    weeklyAmount, // in grosze
    weeklyAmountPLN, // in PLN
    pricePerPortion: PRICE_PER_PORTION,
    totalPortions
  }
}

/**
 * Get all supported plan combinations with pricing
 */
export function getAllPlans(): PlanPricing[] {
  const plans: PlanPricing[] = []

  for (const people of SUPPORTED_PEOPLE) {
    for (const days of SUPPORTED_DAYS) {
      plans.push(getPlanPricing(people, days))
    }
  }

  return plans
}

/**
 * Parse plan key back to people and days
 */
export function parsePlanKey(planKey: string): { people: number; days: number } | null {
  const match = planKey.match(/^(\d+)x(\d+)$/)
  if (!match) return null

  const people = Number.parseInt(match[1], 10)
  const days = Number.parseInt(match[2], 10)

  if (!isValidPlan(people, days)) return null

  return { people, days }
}
