-- =====================================================
-- Add Webhook Support Columns to Subscriptions Table
-- Created: 2025-11-21
-- Purpose: Add missing columns needed for webhook processing
-- =====================================================

-- Add trial_end column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'trial_end'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN trial_end TIMESTAMPTZ;
  END IF;
END $$;

-- Add delivery_day column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'delivery_day'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN delivery_day TEXT;
  END IF;
END $$;

-- Add last_payment_status column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'last_payment_status'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN last_payment_status TEXT;
  END IF;
END $$;

-- Add last_payment_date column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'last_payment_date'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN last_payment_date TIMESTAMPTZ;
  END IF;
END $$;

-- Add constraint for delivery_day
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_delivery_day'
  ) THEN
    ALTER TABLE subscriptions 
    ADD CONSTRAINT valid_delivery_day 
    CHECK (delivery_day IS NULL OR delivery_day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'));
  END IF;
END $$;

-- Add constraint for last_payment_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_payment_status'
  ) THEN
    ALTER TABLE subscriptions 
    ADD CONSTRAINT valid_payment_status 
    CHECK (last_payment_status IS NULL OR last_payment_status IN ('pending', 'succeeded', 'failed'));
  END IF;
END $$;

-- Add index for trial_end for efficient queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end ON subscriptions(trial_end);

-- Add index for last_payment_date for efficient queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_last_payment_date ON subscriptions(last_payment_date);

-- Add comments for new columns
COMMENT ON COLUMN subscriptions.trial_end IS 'End date of trial period from Stripe';
COMMENT ON COLUMN subscriptions.delivery_day IS 'Preferred delivery day of the week';
COMMENT ON COLUMN subscriptions.last_payment_status IS 'Status of the last payment attempt';
COMMENT ON COLUMN subscriptions.last_payment_date IS 'Date of the last payment attempt';

-- =====================================================
-- Verification queries (commented out)
-- =====================================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'subscriptions'
-- ORDER BY ordinal_position;
