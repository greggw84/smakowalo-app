-- =====================================================
-- Smakowało Orders Table Migration
-- Created: 2025-11-17
-- Purpose: Store user orders and order history
-- =====================================================

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  -- Primary key
  id BIGSERIAL PRIMARY KEY,

  -- Foreign key to user
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Order identification
  order_number TEXT UNIQUE NOT NULL,

  -- Pricing
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'PLN',

  -- Order status
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',

  -- Delivery information
  delivery_date DATE,
  delivery_time_slot TEXT,
  delivery_address JSONB,

  -- Discount and promotion details
  discount_code TEXT,
  discount_details JSONB DEFAULT '[]'::jsonb,

  -- Order items (JSON array of products)
  order_items JSONB DEFAULT '[]'::jsonb,

  -- Payment information
  payment_method TEXT,
  stripe_payment_intent_id TEXT,

  -- Notes
  customer_notes TEXT,
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'canceled', 'refunded')),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')),
  CONSTRAINT valid_currency CHECK (currency IN ('PLN', 'EUR', 'USD')),
  CONSTRAINT positive_total CHECK (total_amount >= 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own orders
CREATE POLICY "Users can insert own orders"
  ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own orders (limited)
CREATE POLICY "Users can update own orders"
  ON orders
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- Trigger to automatically update updated_at
-- =====================================================

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Function to generate order number
-- =====================================================

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_order_number TEXT;
  order_count INTEGER;
BEGIN
  -- Get count of orders today
  SELECT COUNT(*) INTO order_count
  FROM orders
  WHERE DATE(created_at) = CURRENT_DATE;

  -- Generate order number: SMK-YYYYMMDD-XXXX
  new_order_number := 'SMK-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((order_count + 1)::TEXT, 4, '0');

  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Trigger to auto-generate order number
-- =====================================================

CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- =====================================================
-- Grant permissions
-- =====================================================

GRANT SELECT, INSERT, UPDATE ON orders TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE orders_id_seq TO authenticated;

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE orders IS 'User orders and order history';
COMMENT ON COLUMN orders.order_number IS 'Unique order number (auto-generated)';
COMMENT ON COLUMN orders.order_items IS 'JSON array of ordered products';
COMMENT ON COLUMN orders.discount_details IS 'JSON array of applied discounts';
COMMENT ON COLUMN orders.delivery_address IS 'JSON object with delivery address details';
