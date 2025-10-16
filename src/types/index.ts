// Cart and Shopping Types
export interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedMeals?: string[];
  dietPreferences?: string[];
  numberOfPeople?: number;
  numberOfDays?: number;
  pricePerPortion?: number;
  totalPortions?: number;
  isMealPlan?: boolean;
}

// Customer Information Types
export interface CustomerAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: CustomerAddress;
}

// Payment and Discount Types
export interface DiscountDetail {
  type: string;
  description: string;
  amount: number;
}

export interface PaymentIntentMetadata {
  user_email: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_address: string;
  items: string;
  subtotal: string;
  total_discount: string;
  final_amount: string;
  discount_details: string;
  is_first_order: string;
}

// Database Update Types
export interface OrderUpdateFields {
  status: string;
  updated_at: string;
  delivery_date?: string;
  notes?: string;
}

export interface SubscriptionUpdateFields {
  status?: string;
  pause_until?: string | null;
  next_delivery_date?: string;
  meal_plan_config?: Record<string, unknown>;
  price_per_delivery?: number;
  canceled_at?: string;
  updated_at: string;
}

// Order and Subscription Types
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface EmailAddress {
  email: string;
  name?: string;
}

// API Request/Response Types
export interface StatusUpdateRequest {
  status: 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'canceled';
  delivery_date?: string;
  notes?: string;
}

export interface SubscriptionUpdateRequest {
  action: 'pause' | 'resume' | 'cancel' | 'update_delivery_date' | 'update_meal_plan';
  pause_until?: string;
  next_delivery_date?: string;
  meal_plan_config?: {
    selectedMeals?: string[];
    dietPreferences?: string[];
    numberOfPeople?: number;
    numberOfDays?: number;
  };
}

// Stripe Types Extensions
export interface StripeErrorType {
  message?: string;
  code?: string;
  type?: string;
}

// Supabase Data Types
export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  street_address?: string;
  city?: string;
  postal_code?: string;
  dietary_preferences?: string[];
  newsletter_subscribed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  order_number?: string;
  total_amount: number;
  subtotal: number;
  discount_amount: number;
  status: string;
  created_at: string;
  delivery_date?: string;
  discount_details?: DiscountDetail[];
  order_items?: unknown[];
}

export interface Subscription {
  id: number;
  status: string;
  plan_type: string;
  price_per_delivery: number;
  next_delivery_date?: string;
  meal_plan_config?: Record<string, unknown>;
  stripe_subscription_id?: string;
  created_at: string;
  pause_until?: string;
}
