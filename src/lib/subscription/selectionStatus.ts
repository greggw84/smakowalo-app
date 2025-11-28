/**
 * Selection status logic for subscription meal selection.
 * Handles deadline calculations and status determination.
 */

import type { SelectionStatus, SelectionStatusInfo, DeliverySlot, SubscriptionWeeklyOrder } from '@/types/subscription';
import { DEADLINE_HOURS_BEFORE_DELIVERY, calculateDeadline, formatDeadlineText, POLISH_DAY_NAMES_CAPITALIZED } from '@/lib/subscription-utils';

/**
 * Checks if the selection deadline has passed for a given delivery date
 * 
 * @param deliveryDate - The delivery date
 * @param now - Optional current time for testing
 * @returns true if the deadline has passed
 */
export function isSelectionDeadlinePassed(deliveryDate: Date, now: Date = new Date()): boolean {
  const deadline = calculateDeadline(deliveryDate);
  return now > deadline;
}

/**
 * Gets the selection status for a delivery slot
 * 
 * @param now - Current time
 * @param deliverySlot - The delivery slot to check
 * @param currentSelections - Array of currently selected meal IDs
 * @param requiredMealsCount - Number of meals required for the subscription
 * @returns SelectionStatus - 'open', 'closed', 'completed', or 'incomplete'
 */
export function getSelectionStatus(
  now: Date,
  deliverySlot: DeliverySlot | null,
  currentSelections: number[] | null,
  requiredMealsCount: number
): SelectionStatus {
  // If no delivery slot, assume incomplete
  if (!deliverySlot) {
    return 'incomplete';
  }

  const deadline = calculateDeadline(deliverySlot.date);
  const isDeadlinePassed = now > deadline;

  // If deadline passed, selection is closed
  if (isDeadlinePassed) {
    return 'closed';
  }

  // If deadline not passed, check if user has made selections
  const selectedCount = currentSelections?.length ?? 0;

  if (selectedCount === 0) {
    return 'open'; // Window open, no selections yet
  }

  if (selectedCount >= requiredMealsCount) {
    return 'completed'; // User has selected all required meals
  }

  return 'incomplete'; // User started but hasn't finished
}

/**
 * Gets detailed selection status information with Polish messages
 * 
 * @param now - Current time
 * @param deliveryDate - The delivery date
 * @param currentSelections - Array of currently selected meal IDs
 * @param requiredMealsCount - Number of meals required
 * @returns SelectionStatusInfo with status, message, and metadata
 */
export function getSelectionStatusInfo(
  now: Date,
  deliveryDate: Date | null,
  currentSelections: number[] | null,
  requiredMealsCount: number
): SelectionStatusInfo {
  const selectedCount = currentSelections?.length ?? 0;

  if (!deliveryDate) {
    return {
      status: 'incomplete',
      message: 'Brak ustalonej daty dostawy',
      deadline: null,
      deadlineText: 'Nie ustalono',
      canSelect: false,
      selectedCount,
      requiredCount: requiredMealsCount,
    };
  }

  const deadline = calculateDeadline(deliveryDate);
  const deadlineText = formatDeadlineText(deadline);
  const isDeadlinePassed = now > deadline;

  if (isDeadlinePassed) {
    return {
      status: 'closed',
      message: 'Wybór dań zamknięty 48h przed dostawą',
      deadline,
      deadlineText,
      canSelect: false,
      selectedCount,
      requiredCount: requiredMealsCount,
    };
  }

  if (selectedCount === 0) {
    return {
      status: 'open',
      message: `Wybierz dania do ${deadlineText}`,
      deadline,
      deadlineText,
      canSelect: true,
      selectedCount,
      requiredCount: requiredMealsCount,
    };
  }

  if (selectedCount >= requiredMealsCount) {
    return {
      status: 'completed',
      message: `Dania wybrane (${selectedCount}/${requiredMealsCount})`,
      deadline,
      deadlineText,
      canSelect: true, // User can still change selection until deadline
      selectedCount,
      requiredCount: requiredMealsCount,
    };
  }

  return {
    status: 'incomplete',
    message: `Wybrano ${selectedCount}/${requiredMealsCount} dań`,
    deadline,
    deadlineText,
    canSelect: true,
    selectedCount,
    requiredCount: requiredMealsCount,
  };
}

/**
 * Creates a delivery slot object from a date and delivery day
 * 
 * @param deliveryDate - The delivery date
 * @param now - Optional current time for testing
 * @returns DeliverySlot object
 */
export function createDeliverySlot(deliveryDate: Date, now: Date = new Date()): DeliverySlot {
  const deadline = calculateDeadline(deliveryDate);
  const dayIndex = deliveryDate.getDay();
  
  return {
    date: deliveryDate,
    dayName: POLISH_DAY_NAMES_CAPITALIZED[dayIndex] || 'Nieznany',
    isDeadlinePassed: now > deadline,
    deadline,
  };
}

/**
 * Polish status labels for UI
 */
export const SELECTION_STATUS_LABELS: Record<SelectionStatus, string> = {
  open: 'Wybór dań otwarty',
  closed: 'Wybór dań zamknięty',
  completed: 'Dania wybrane',
  incomplete: 'Wybierz dania',
};

/**
 * Gets the Polish label for a selection status
 * 
 * @param status - The selection status
 * @returns Polish label string
 */
export function getSelectionStatusLabel(status: SelectionStatus): string {
  return SELECTION_STATUS_LABELS[status] || 'Nieznany status';
}

/**
 * Determines if the user should be prompted to select meals
 * (when window is open and selections are incomplete)
 * 
 * @param status - Current selection status
 * @returns true if user should be prompted
 */
export function shouldPromptForSelection(status: SelectionStatus): boolean {
  return status === 'open' || status === 'incomplete';
}

/**
 * Gets the badge color class for a selection status
 * 
 * @param status - The selection status
 * @returns Tailwind CSS class string for badge styling
 */
export function getSelectionStatusBadgeClass(status: SelectionStatus): string {
  switch (status) {
    case 'open':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'closed':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    case 'completed':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'incomplete':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

/**
 * Gets the button variant based on selection status
 * For the "Chcę sam wybrać dania" button
 * 
 * @param status - The selection status
 * @returns Button styling info
 */
export function getSelectMealsButtonStyle(status: SelectionStatus): {
  variant: 'default' | 'outline' | 'secondary';
  className: string;
  disabled: boolean;
  label: string;
} {
  switch (status) {
    case 'open':
      return {
        variant: 'default',
        className: 'bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)] text-white',
        disabled: false,
        label: 'Chcę sam wybrać dania',
      };
    case 'incomplete':
      return {
        variant: 'default',
        className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
        disabled: false,
        label: 'Dokończ wybór dań',
      };
    case 'completed':
      return {
        variant: 'outline',
        className: 'border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)] hover:bg-green-50',
        disabled: false,
        label: 'Zmień wybór dań',
      };
    case 'closed':
      return {
        variant: 'secondary',
        className: 'bg-gray-100 text-gray-500 cursor-not-allowed',
        disabled: true,
        label: 'Wybór dań zamknięty',
      };
    default:
      return {
        variant: 'outline',
        className: '',
        disabled: false,
        label: 'Wybierz dania',
      };
  }
}
