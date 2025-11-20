-- =====================================================
-- Smakowało Subscriptions Table Migration
-- Created: 2025-11-17
-- Purpose: Store user subscriptions with Stripe integration
-- =====================================================

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  -- Primary key
  id BIGSERIAL PRIMARY KEY,

  -- Foreign key to user
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Stripe integration
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,

  -- Subscription details
  status TEXT NOT NULL DEFAULT 'active',
  plan_type TEXT,
  plan_key TEXT,

  -- Pricing
  amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'PLN',
  price_per_delivery DECIMAL(10, 2),

  -- Meal plan configuration
  people INTEGER DEFAULT 2,
  days INTEGER DEFAULT 3,
  meal_plan_config JSONB DEFAULT '{}'::jsonb,

  -- Dietary preferences
  diets JSONB DEFAULT '[]'::jsonb,
  allergies JSONB DEFAULT '[]'::jsonb,
  selected_meals JSONB DEFAULT '[]'::jsonb,

  -- Delivery information
  next_delivery_date DATE,
  delivery_frequency TEXT DEFAULT 'weekly',

  -- Billing periods
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,

  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,

  -- Pause functionality
  pause_until DATE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'canceled', 'past_due', 'unpaid', 'incomplete', 'trialing')),
  CONSTRAINT valid_currency CHECK (currency IN ('PLN', 'EUR', 'USD')),
  CONSTRAINT valid_people CHECK (people > 0 AND people <= 10),
  CONSTRAINT valid_days CHECK (days > 0 AND days <= 7)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_delivery_date ON subscriptions(next_delivery_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own subscriptions
CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions"
  ON subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own subscriptions
CREATE POLICY "Users can delete own subscriptions"
  ON subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- Trigger to automatically update updated_at
-- =====================================================

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Grant permissions
-- =====================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON subscriptions TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE subscriptions_id_seq TO authenticated;

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE subscriptions IS 'User subscriptions with Stripe integration';
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN subscriptions.status IS 'Subscription status (active, paused, canceled, etc.)';
COMMENT ON COLUMN subscriptions.meal_plan_config IS 'JSON configuration for meal plan';
COMMENT ON COLUMN subscriptions.pause_until IS 'Date until which subscription is paused';
COMMENT ON COLUMN subscriptions.cancel_at_period_end IS 'Whether to cancel at end of current period';
