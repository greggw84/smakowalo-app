-- ============================================================================
-- Enhanced Subscriptions Table for Stripe Integration
-- ============================================================================
-- 
-- This migration enhances the subscriptions table to support:
-- - Dynamic Stripe subscription plans (12 combinations: 2-4 people × 2-5 days)
-- - Detailed metadata tracking (diets, allergies, selected meals)
-- - Stripe customer and subscription IDs
-- - Period tracking and cancellation handling
--
-- Run this on your Supabase project or PostgreSQL database
-- ============================================================================

-- Drop the old subscriptions table if it exists (if you need to preserve data, 
-- create a backup first with: CREATE TABLE subscriptions_backup AS SELECT * FROM subscriptions;)
DROP TABLE IF EXISTS subscriptions CASCADE;

-- Create enhanced subscriptions table
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  
  -- Stripe identifiers
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  price_id TEXT NOT NULL,
  
  -- Customer info
  customer_email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Subscription status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'unpaid', 'canceled', 'incomplete', 'incomplete_expired', 'trialing', 'paused')),
  
  -- Pricing info
  amount DECIMAL(10,2) NOT NULL, -- Weekly price in PLN
  currency TEXT NOT NULL DEFAULT 'pln',
  
  -- Plan configuration (people × days)
  people INTEGER NOT NULL CHECK (people IN (2, 3, 4)),
  days INTEGER NOT NULL CHECK (days IN (2, 3, 4, 5)),
  plan_key TEXT NOT NULL, -- e.g., "2x3", "4x5"
  
  -- Dietary preferences and selections
  diets TEXT[] DEFAULT '{}', -- Array of diet names
  allergies TEXT[] DEFAULT '{}', -- Array of allergy names/ids
  selected_meals TEXT[] DEFAULT '{}', -- Array of meal names for first delivery
  
  -- Period tracking
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  
  -- Cancellation tracking
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  
  -- Legacy fields (for backwards compatibility with old code)
  plan_type TEXT, -- e.g., 'basic', 'premium' - deprecated, use plan_key instead
  meal_plan_config JSONB, -- Deprecated, use specific columns instead
  price_per_delivery DECIMAL(10,2), -- Deprecated, use amount instead
  delivery_frequency INTEGER, -- Deprecated for weekly subscriptions
  next_delivery_date DATE, -- Deprecated, use current_period_end instead
  last_delivery_date DATE,
  pause_until DATE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_customer_email ON subscriptions(customer_email);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan_key ON subscriptions(plan_key);
CREATE INDEX idx_subscriptions_created_at ON subscriptions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR customer_email = auth.jwt() ->> 'email'
  );

-- Service role can insert/update (for webhook handler)
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- Grant necessary permissions (adjust as needed for your setup)
-- For Supabase, the service role already has full access
-- For custom PostgreSQL, you might need:
-- GRANT SELECT, INSERT, UPDATE ON subscriptions TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON subscriptions TO service_role;

-- Comments for documentation
COMMENT ON TABLE subscriptions IS 'Stores Stripe subscription data with enhanced metadata for people, days, diets, and allergies';
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'Stripe subscription ID (sub_xxx)';
COMMENT ON COLUMN subscriptions.stripe_customer_id IS 'Stripe customer ID (cus_xxx)';
COMMENT ON COLUMN subscriptions.plan_key IS 'Plan identifier in format {people}x{days}, e.g., 2x3, 4x5';
COMMENT ON COLUMN subscriptions.people IS 'Number of people in subscription (2, 3, or 4)';
COMMENT ON COLUMN subscriptions.days IS 'Number of days per week (2, 3, 4, or 5)';
COMMENT ON COLUMN subscriptions.amount IS 'Weekly subscription price in PLN';
COMMENT ON COLUMN subscriptions.diets IS 'Array of selected diet names (e.g., {Wegetariańska, Keto})';
COMMENT ON COLUMN subscriptions.allergies IS 'Array of allergen names/ids to exclude';
COMMENT ON COLUMN subscriptions.selected_meals IS 'Array of meal names selected for first delivery';

-- Sample query to view active subscriptions with plan details
-- SELECT 
--   id,
--   customer_email,
--   plan_key,
--   people,
--   days,
--   amount || ' ' || currency AS weekly_price,
--   status,
--   current_period_end,
--   created_at
-- FROM subscriptions
-- WHERE status IN ('active', 'trialing')
-- ORDER BY created_at DESC;
