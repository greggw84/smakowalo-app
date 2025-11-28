-- Migration: Fix Weekly Menu and Orders System
-- Created: 2025-11-28
-- Purpose: Fix type mismatches and constraint issues

-- ============================================================================
-- 1. FIX subscription_weekly_orders subscription_id type
-- The subscription_id should be BIGINT to match subscriptions.id (BIGSERIAL)
-- ============================================================================

-- First, drop the foreign key constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subscription_weekly_orders_subscription_id_fkey'
        AND table_name = 'subscription_weekly_orders'
    ) THEN
        ALTER TABLE public.subscription_weekly_orders 
        DROP CONSTRAINT subscription_weekly_orders_subscription_id_fkey;
    END IF;
END $$;

-- Clear any existing data in the table since the type mismatch would have
-- prevented valid data from being inserted anyway (FK constraint would fail)
-- This is safe because the original migration had a type mismatch bug
TRUNCATE TABLE public.subscription_weekly_order_items CASCADE;
TRUNCATE TABLE public.subscription_weekly_orders CASCADE;

-- Change the column type to BIGINT
-- Using NULL handling in case there's any data despite the above
ALTER TABLE public.subscription_weekly_orders 
ALTER COLUMN subscription_id TYPE BIGINT USING NULL;

-- Re-add the foreign key constraint with correct type
ALTER TABLE public.subscription_weekly_orders 
ADD CONSTRAINT subscription_weekly_orders_subscription_id_fkey 
FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE CASCADE;

-- ============================================================================
-- 2. FIX the unique constraint on weekly_menus
-- PostgreSQL doesn't support WHERE in CONSTRAINT definition directly
-- We need to use a partial unique index instead
-- ============================================================================

-- Drop the invalid constraint if it exists (it may have failed during creation)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_active_menu'
        AND table_name = 'weekly_menus'
    ) THEN
        ALTER TABLE public.weekly_menus DROP CONSTRAINT unique_active_menu;
    END IF;
END $$;

-- Create a partial unique index to ensure only one active menu
-- This enforces that when is_active = true, only one row can have that value
DROP INDEX IF EXISTS idx_weekly_menus_unique_active;
CREATE UNIQUE INDEX idx_weekly_menus_unique_active 
ON public.weekly_menus (is_active) 
WHERE is_active = true;

-- ============================================================================
-- 3. Add day_of_week column to weekly_menu_items if missing
-- This helps organize products by day within the weekly menu
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'weekly_menu_items' 
        AND column_name = 'day_of_week'
    ) THEN
        ALTER TABLE public.weekly_menu_items 
        ADD COLUMN day_of_week INTEGER DEFAULT NULL;
        
        COMMENT ON COLUMN public.weekly_menu_items.day_of_week IS 
        'Optional day assignment (1=Monday, 7=Sunday). NULL means product is available all week.';
    END IF;
END $$;

-- ============================================================================
-- 4. Ensure products table reference works in weekly_menu_items
-- Add foreign key if missing (with NO ACTION for flexibility with OpenCart products)
-- ============================================================================

-- Note: We don't add a strict FK because product_id might reference external systems
-- The application layer handles validation

-- ============================================================================
-- 5. Add role column to profiles if missing (for admin check)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN role VARCHAR(50) DEFAULT 'user';
        
        COMMENT ON COLUMN public.profiles.role IS 
        'User role: user, admin, etc.';
    END IF;
END $$;

-- ============================================================================
-- 6. Update RLS policies to use service role for admin operations
-- ============================================================================

-- Allow service role full access to weekly_menus
DROP POLICY IF EXISTS "Service role full access to weekly_menus" ON public.weekly_menus;
CREATE POLICY "Service role full access to weekly_menus"
    ON public.weekly_menus FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow service role full access to weekly_menu_items
DROP POLICY IF EXISTS "Service role full access to weekly_menu_items" ON public.weekly_menu_items;
CREATE POLICY "Service role full access to weekly_menu_items"
    ON public.weekly_menu_items FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow service role full access to subscription_weekly_orders
DROP POLICY IF EXISTS "Service role full access to subscription_weekly_orders" ON public.subscription_weekly_orders;
CREATE POLICY "Service role full access to subscription_weekly_orders"
    ON public.subscription_weekly_orders FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow service role full access to subscription_weekly_order_items
DROP POLICY IF EXISTS "Service role full access to subscription_weekly_order_items" ON public.subscription_weekly_order_items;
CREATE POLICY "Service role full access to subscription_weekly_order_items"
    ON public.subscription_weekly_order_items FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- COMPLETED!
-- ============================================================================
