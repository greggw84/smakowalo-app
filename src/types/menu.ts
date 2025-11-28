/**
 * Shared types for weekly menus and menu items.
 * Used by both admin panel and API routes.
 */

/**
 * Day of the week type for menu items
 */
export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

/**
 * Day of week options for UI components
 */
export const DAY_OF_WEEK_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: "monday", label: "Poniedziałek" },
  { value: "tuesday", label: "Wtorek" },
  { value: "wednesday", label: "Środa" },
  { value: "thursday", label: "Czwartek" },
  { value: "friday", label: "Piątek" },
  { value: "saturday", label: "Sobota" },
  { value: "sunday", label: "Niedziela" },
];

/**
 * Product type for admin panel usage
 */
export interface Product {
  id: number;
  name: string;
  description: string | null;
  image_url?: string | null;
  image?: string | null;
  price: number;
  calories?: number | null;
  allergens?: string[] | null;
  active: boolean;
}

/**
 * Weekly menu type matching Supabase schema
 */
export interface WeeklyMenu {
  id: number;
  week_start_date: string;
  week_end_date: string;
  label: string;
  is_active: boolean;
  is_published?: boolean;
  created_at: string;
  created_by?: string;
  items_count?: number;
}

/**
 * Weekly menu with item count for list view
 */
export interface WeeklyMenuWithCount extends WeeklyMenu {
  items?: { count: number }[];
}

/**
 * Weekly menu item type matching Supabase schema
 */
export interface WeeklyMenuItem {
  id: number;
  weekly_menu_id: number;
  product_id: number;
  day_of_week: DayOfWeek | null;
  position?: number;
  is_featured?: boolean;
  created_at: string;
}

/**
 * Weekly menu item with joined product data
 */
export interface WeeklyMenuItemWithProduct extends WeeklyMenuItem {
  product: Product | null;
}

/**
 * Form data for creating/editing weekly menus
 */
export interface WeeklyMenuFormData {
  week_start_date: string;
  week_end_date: string;
  label: string;
  is_active: boolean;
}

/**
 * Form data for creating/editing menu items
 */
export interface WeeklyMenuItemFormData {
  product_id: number;
  day_of_week: DayOfWeek | null;
}

/**
 * API response for weekly menus list
 */
export interface WeeklyMenusListResponse {
  success: boolean;
  menus: WeeklyMenuWithCount[];
  error?: string;
}

/**
 * API response for single weekly menu with items
 */
export interface WeeklyMenuDetailResponse {
  success: boolean;
  menu: WeeklyMenu;
  items: WeeklyMenuItemWithProduct[];
  error?: string;
}

/**
 * API response for products list
 */
export interface ProductsListResponse {
  success: boolean;
  products: Product[];
  error?: string;
}
