/**
 * Extended subscription-related types for meal selection flow.
 * These types extend the base types in src/types/index.ts
 */

/**
 * Diet tags supported by the system
 */
export type DietTag = 
  | 'vegetarian'  // wegetariańska
  | 'vegan'       // wegańska
  | 'keto'        // keto
  | 'low_carb'    // niskowęglowodanowa
  | 'gluten_free' // bezglutenowa
  | 'dairy_free'  // bez nabiału
  | 'paleo'       // paleo
  | 'mediterranean' // śródziemnomorska
  | string;       // Allow custom diet tags

/**
 * Allergy tags supported by the system
 */
export type AllergyTag = 
  | 'gluten'      // gluten
  | 'dairy'       // nabiał
  | 'eggs'        // jajka
  | 'nuts'        // orzechy
  | 'peanuts'     // orzeszki ziemne
  | 'soy'         // soja
  | 'fish'        // ryby
  | 'shellfish'   // owoce morza
  | 'sesame'      // sezam
  | 'celery'      // seler
  | 'mustard'     // gorczyca
  | 'sulfites'    // siarczyny
  | string;       // Allow custom allergens

/**
 * Meal categories for filtering and preferences
 */
export type MealCategory = 
  | 'breakfast'   // śniadanie
  | 'lunch'       // lunch
  | 'dinner'      // obiad
  | 'snack'       // przekąska
  | 'dessert'     // deser
  | string;       // Allow custom categories

/**
 * User preferences for meal selection
 */
export interface UserPreferences {
  diets?: DietTag[];
  allergies?: AllergyTag[];
  enabledCategories?: MealCategory[];
  excludedIngredients?: string[];
}

/**
 * Meal/Product type for selection UI
 */
export interface Meal {
  id: number;
  name: string;
  description?: string;
  image?: string;
  calories?: number;
  cook_time?: number;
  price?: number;
  diets?: DietTag[];
  allergens?: AllergyTag[];
  categories?: MealCategory[];
  ingredients?: string[];
}

/**
 * Weekly menu structure
 */
export interface WeeklyMenu {
  id: string;
  week_start_date: string;
  week_end_date: string;
  label?: string;
  is_active?: boolean;
  items: WeeklyMenuItem[];
}

/**
 * Weekly menu item (relationship between menu and product)
 */
export interface WeeklyMenuItem {
  id?: string;
  weekly_menu_id?: string;
  product_id: number;
  product?: Meal;
  day_of_week?: number; // 0 = Sunday, 1 = Monday, etc.
}

/**
 * Meal selection for a specific day
 */
export interface MealSelection {
  productId: number;
  quantity: number;
  dayOfWeek?: number;
}

/**
 * Delivery slot information
 */
export interface DeliverySlot {
  date: Date;
  dayName: string;
  isDeadlinePassed: boolean;
  deadline: Date;
}

/**
 * Selection status for a delivery period
 * - 'open': Selection window is open, user can choose meals
 * - 'closed': Selection deadline has passed, choices are locked
 * - 'completed': User has made all required selections within the open window
 * - 'incomplete': Selection window is open but user hasn't finished selecting
 */
export type SelectionStatus = 'open' | 'closed' | 'completed' | 'incomplete';

/**
 * Detailed selection status with metadata
 */
export interface SelectionStatusInfo {
  status: SelectionStatus;
  message: string;
  deadline: Date | null;
  deadlineText: string;
  canSelect: boolean;
  selectedCount: number;
  requiredCount: number;
}

/**
 * Subscription weekly order with items
 */
export interface SubscriptionWeeklyOrder {
  id: number;
  user_id: string;
  subscription_id: number;
  weekly_menu_id?: string;
  delivery_date?: string;
  delivery_day?: string;
  status: string;
  is_auto_generated?: boolean;
  total_meals?: number;
  created_at: string;
  updated_at?: string;
  items?: SubscriptionWeeklyOrderItem[];
}

/**
 * Item in a subscription weekly order
 */
export interface SubscriptionWeeklyOrderItem {
  id?: number;
  weekly_order_id: number;
  product_id: number;
  quantity: number;
  product?: Meal;
}

/**
 * Props for the meal selection API request
 */
export interface SaveMealSelectionRequest {
  weekly_menu_id: string;
  selected_product_ids: number[];
  delivery_day?: string;
  delivery_date?: string;
}

/**
 * Response from meal selection API
 */
export interface SaveMealSelectionResponse {
  success: boolean;
  message?: string;
  order?: SubscriptionWeeklyOrder;
  error?: string;
}
