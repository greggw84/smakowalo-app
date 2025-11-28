-- =====================================================
-- Fix Subscription User Linking
-- Created: 2025-11-28
-- Purpose: Allow subscriptions to be created without user_id (for webhook scenarios)
--          and add customer_email for fallback lookups
-- =====================================================

-- Step 1: Add customer_email column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'customer_email'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN customer_email TEXT;
  END IF;
END $$;

-- Step 2: Make user_id nullable to allow webhook-created subscriptions
-- This is needed because webhooks may create subscriptions before user is found
ALTER TABLE subscriptions ALTER COLUMN user_id DROP NOT NULL;

-- Step 3: Add index on customer_email for efficient lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_email ON subscriptions(customer_email);

-- Step 4: Update status constraint to include 'incomplete_expired'
-- First drop the existing constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_status' AND conrelid = 'subscriptions'::regclass
  ) THEN
    ALTER TABLE subscriptions DROP CONSTRAINT valid_status;
  END IF;
END $$;

-- Re-create with additional status
ALTER TABLE subscriptions 
ADD CONSTRAINT valid_status 
CHECK (status IN ('active', 'paused', 'canceled', 'past_due', 'unpaid', 'incomplete', 'incomplete_expired', 'trialing'));

-- Step 5: Update RLS policies to allow queries by customer_email
-- Drop existing policy if exists and create new one
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;

-- Create comprehensive policy for subscription access
-- Users can view subscriptions where:
-- 1. user_id matches their auth.uid(), OR
-- 2. customer_email matches their email (for fallback)
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR customer_email = auth.jwt() ->> 'email'
  );

-- Create policy for service role (webhooks) - allow all operations
-- Note: When using service role key, RLS is bypassed by default,
-- but we add this policy for explicit clarity
CREATE POLICY "Service role can manage all subscriptions"
  ON subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Step 6: Grant service_role full access
GRANT ALL ON subscriptions TO service_role;

-- Step 7: Add comment for documentation
COMMENT ON COLUMN subscriptions.customer_email IS 'Customer email from Stripe for fallback user lookup';

-- =====================================================
-- VERIFICATION (run manually to check):
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'subscriptions'
-- ORDER BY ordinal_position;
-- =====================================================
