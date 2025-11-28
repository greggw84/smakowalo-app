/**
 * Subscription-related utility functions and constants.
 * Includes deadline calculation, date formatting, and status helpers.
 */

/**
 * Subscription status enumeration
 */
export const SubscriptionStatus = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  TRIALING: 'trialing',
  INCOMPLETE: 'incomplete',
  INCOMPLETE_EXPIRED: 'incomplete_expired',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
} as const;

export type SubscriptionStatusType = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

/**
 * Status labels in Polish
 */
export const SubscriptionStatusLabels: Record<string, string> = {
  [SubscriptionStatus.ACTIVE]: 'Aktywna',
  [SubscriptionStatus.PAUSED]: 'Wstrzymana',
  [SubscriptionStatus.TRIALING]: 'Okres próbny',
  [SubscriptionStatus.INCOMPLETE]: 'Oczekuje na płatność',
  [SubscriptionStatus.INCOMPLETE_EXPIRED]: 'Oczekuje na płatność',
  [SubscriptionStatus.PAST_DUE]: 'Problem z płatnością',
  [SubscriptionStatus.CANCELED]: 'Anulowana',
};

/**
 * Hours before delivery date to set as deadline.
 * Currently set to 48 hours (2 days) before delivery.
 */
export const DEADLINE_HOURS_BEFORE_DELIVERY = 48;

/**
 * Polish day names mapping (0 = Sunday, 1 = Monday, etc.)
 */
export const POLISH_DAY_NAMES: Record<number, string> = {
  0: 'niedziela',
  1: 'poniedziałek',
  2: 'wtorek',
  3: 'środa',
  4: 'czwartek',
  5: 'piątek',
  6: 'sobota',
};

/**
 * Polish day names mapping with capital first letter
 */
export const POLISH_DAY_NAMES_CAPITALIZED: Record<number, string> = {
  0: 'Niedziela',
  1: 'Poniedziałek',
  2: 'Wtorek',
  3: 'Środa',
  4: 'Czwartek',
  5: 'Piątek',
  6: 'Sobota',
};

/**
 * Calculates the deadline timestamp based on a delivery date.
 * The deadline is 48 hours (2 days) before the delivery date at 23:59.
 * 
 * @param deliveryDate - The delivery date
 * @returns The deadline date (2 days before delivery at 23:59)
 */
export function calculateDeadline(deliveryDate: Date): Date {
  const deadline = new Date(deliveryDate);
  // Subtract 2 days (48 hours / 24 hours per day = 2 days)
  deadline.setDate(deadline.getDate() - (DEADLINE_HOURS_BEFORE_DELIVERY / 24));
  // Set to 23:59 of that day
  deadline.setHours(23, 59, 0, 0);
  return deadline;
}

/**
 * Formats a deadline date as "DayName HH:MM" in Polish locale
 * e.g., "niedziela 23:59"
 * 
 * @param deadline - The deadline date
 * @returns Formatted deadline string in Polish
 */
export function formatDeadlineText(deadline: Date): string {
  const dayName = POLISH_DAY_NAMES[deadline.getDay()];
  const hours = deadline.getHours().toString().padStart(2, '0');
  const minutes = deadline.getMinutes().toString().padStart(2, '0');
  return `${dayName} ${hours}:${minutes}`;
}

/**
 * Formats a date as "DD.MM.YYYY • DayName" in Polish locale
 * 
 * @param date - The date to format
 * @returns Formatted date string in Polish (e.g., "12.12.2025 • Piątek")
 */
export function formatDeliveryDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const dayName = POLISH_DAY_NAMES_CAPITALIZED[date.getDay()];
  return `${day}.${month}.${year} • ${dayName}`;
}

/**
 * Gets the next delivery date after a given start date based on delivery day
 * 
 * @param deliveryDay - 'tuesday', 'thursday' or number (0-6)
 * @param startDate - The start date to calculate from
 * @returns The next delivery date or null if invalid delivery day
 */
export function getNextDeliveryAfterDate(
  deliveryDay: string | number | undefined,
  startDate: Date
): Date | null {
  let targetDay: number;

  if (typeof deliveryDay === 'number') {
    targetDay = deliveryDay;
  } else if (deliveryDay === 'tuesday') {
    targetDay = 2; // Tuesday
  } else if (deliveryDay === 'thursday') {
    targetDay = 4; // Thursday
  } else {
    return null;
  }

  const result = new Date(startDate);
  const currentDay = result.getDay();

  // Calculate days until next delivery day
  let daysUntilDelivery = targetDay - currentDay;
  if (daysUntilDelivery <= 0) {
    daysUntilDelivery += 7; // Move to next week
  }

  result.setDate(result.getDate() + daysUntilDelivery);
  return result;
}

/**
 * Calculates the next delivery date based on subscription data
 * 
 * @param deliveryDay - 'tuesday', 'thursday' or number (0-6)
 * @param pauseUntil - Optional pause end date string
 * @param nextDeliveryDate - Optional explicit next delivery date string
 * @returns The next delivery date or null if cannot be calculated
 */
export function calculateNextDeliveryDate(
  deliveryDay: string | number | undefined,
  pauseUntil?: string | null,
  nextDeliveryDate?: string | null
): Date | null {
  // If we have an explicit next_delivery_date, use it (unless paused)
  if (nextDeliveryDate) {
    const nextDate = new Date(nextDeliveryDate);
    if (pauseUntil) {
      const pauseEndDate = new Date(pauseUntil);
      // If pause ends after the next delivery date, calculate from pause end
      if (pauseEndDate > nextDate) {
        return getNextDeliveryAfterDate(deliveryDay, pauseEndDate);
      }
    }
    return nextDate;
  }

  // Calculate from delivery day
  const startDate = pauseUntil ? new Date(pauseUntil) : new Date();
  return getNextDeliveryAfterDate(deliveryDay, startDate);
}

/**
 * Gets the deadline text for meal selection based on delivery date
 * 
 * @param deliveryDate - The delivery date
 * @returns Formatted deadline text (e.g., "niedziela 23:59")
 */
export function getDeadlineTextForDelivery(deliveryDate: Date): string {
  const deadline = calculateDeadline(deliveryDate);
  return formatDeadlineText(deadline);
}

/**
 * Checks if the current time is past the deadline for a delivery date
 * 
 * @param deliveryDate - The delivery date
 * @returns true if the deadline has passed
 */
export function isDeadlinePassed(deliveryDate: Date): boolean {
  const deadline = calculateDeadline(deliveryDate);
  return new Date() > deadline;
}

/**
 * Checks if a subscription is paused based on status and pause_until fields
 * 
 * @param status - The subscription status
 * @param pauseUntil - Optional pause end date
 * @returns true if the subscription is paused
 */
export function isSubscriptionPaused(status: string, pauseUntil?: string | null): boolean {
  return status === SubscriptionStatus.PAUSED || !!pauseUntil;
}

/**
 * Checks if a subscription is active
 * 
 * @param status - The subscription status
 * @returns true if the subscription is active or trialing
 */
export function isSubscriptionActive(status: string): boolean {
  return status === SubscriptionStatus.ACTIVE || status === SubscriptionStatus.TRIALING;
}

/**
 * Gets the appropriate status label for a subscription
 * 
 * @param status - The subscription status
 * @param pauseUntil - Optional pause end date
 * @returns The status label in Polish
 */
export function getSubscriptionStatusLabel(status: string, pauseUntil?: string | null): string {
  if (isSubscriptionPaused(status, pauseUntil)) {
    return SubscriptionStatusLabels[SubscriptionStatus.PAUSED];
  }
  return SubscriptionStatusLabels[status] || status;
}
