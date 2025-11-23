-- =====================================================
-- Fix RLS Policies for Webhook Operations
-- Created: 2025-11-22
-- Updated: 2025-11-23
-- Purpose: Allow service role to bypass RLS for webhook operations
-- =====================================================
--
-- WHAT THIS MIGRATION DOES:
-- 1. Drops ALL existing RLS policies on subscriptions and orders tables
-- 2. Creates new unified policies that allow:
--    - Service role (webhooks) to manage ALL subscriptions/orders
--    - Regular users to manage only their own data
-- 3. Grants necessary permissions to service_role
--
-- WHY THIS IS NEEDED:
-- Stripe webhooks use service_role credentials and need to create/update
-- subscriptions without being blocked by RLS policies.
--
-- HOW TO RUN THIS MIGRATION:
-- 1. Open Supabase Dashboard
-- 2. Go to: SQL Editor → New Query
-- 3. Copy EVERYTHING from line 29 onwards (all SQL code below)
-- 4. Paste into the SQL Editor
-- 5. Click "Run" button (or press Ctrl/Cmd + Enter)
--
-- DO NOT type the file path in SQL Editor!
-- You must copy and paste the SQL code itself.
-- =====================================================

-- Drop ALL existing policies on subscriptions table
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscriptions" ON subscriptions;

-- Drop ALL existing policies on orders table
DROP POLICY IF EXISTS "Service role can manage orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Users can delete own orders" ON orders;

-- Create bypass policy for service role on subscriptions
-- Service role should be able to insert/update subscriptions from webhooks
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions
  FOR ALL
  USING (
    -- Allow service role to bypass RLS
    auth.jwt() ->> 'role' = 'service_role'
    OR
    -- Or allow users to manage their own
    auth.uid() = user_id
  )
  WITH CHECK (
    -- Allow service role to bypass RLS
    auth.jwt() ->> 'role' = 'service_role'
    OR
    -- Or allow users to manage their own
    auth.uid() = user_id
  );

-- Create bypass policy for service role on orders
-- Service role should be able to create orders from webhooks
CREATE POLICY "Service role can manage orders"
  ON orders
  FOR ALL
  USING (
    -- Allow service role to bypass RLS
    auth.jwt() ->> 'role' = 'service_role'
    OR
    -- Or allow users to manage their own
    auth.uid() = user_id
  )
  WITH CHECK (
    -- Allow service role to bypass RLS
    auth.jwt() ->> 'role' = 'service_role'
    OR
    -- Or allow users to manage their own
    auth.uid() = user_id
  );

-- Grant all permissions to service role explicitly
GRANT ALL ON subscriptions TO service_role;
GRANT ALL ON orders TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Comments
COMMENT ON POLICY "Service role can manage subscriptions" ON subscriptions IS 
  'Allows service role (webhooks) to bypass RLS and manage all subscriptions, while users can only manage their own';
COMMENT ON POLICY "Service role can manage orders" ON orders IS 
  'Allows service role (webhooks) to bypass RLS and manage all orders, while users can only manage their own';
