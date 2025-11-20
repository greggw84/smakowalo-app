-- Migration: Weekly Menu System
-- Created: 2025-11-19
-- Purpose: Menu tygodniowe, zamówienia tygodniowe, zarządzanie dostawami

-- ============================================================================
-- 1. WEEKLY MENUS - Menu tygodniowe
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.weekly_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    label VARCHAR(100) NOT NULL, -- np. "Tydzień 24-30 listopada 2025"
    is_active BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false, -- czy widoczne dla klientów
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),

    -- Tylko jedno menu może być aktywne na raz
    CONSTRAINT unique_active_menu UNIQUE NULLS NOT DISTINCT (is_active)
        WHERE is_active = true
);

-- Index dla szybkiego wyszukiwania aktywnego menu
CREATE INDEX idx_weekly_menus_active ON public.weekly_menus(is_active) WHERE is_active = true;
CREATE INDEX idx_weekly_menus_dates ON public.weekly_menus(week_start_date, week_end_date);

-- ============================================================================
-- 2. WEEKLY MENU ITEMS - Produkty w menu tygodniowym
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.weekly_menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weekly_menu_id UUID NOT NULL REFERENCES public.weekly_menus(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL, -- ID produktu z bazy (lub OpenCart)
    position INTEGER DEFAULT 0, -- kolejność wyświetlania
    is_featured BOOLEAN DEFAULT false, -- czy wyróżnione
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_weekly_menu_items_menu ON public.weekly_menu_items(weekly_menu_id);
CREATE INDEX idx_weekly_menu_items_product ON public.weekly_menu_items(product_id);

-- ============================================================================
-- 3. SUBSCRIPTION WEEKLY ORDERS - Zamówienia tygodniowe subskrybentów
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscription_weekly_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    weekly_menu_id UUID NOT NULL REFERENCES public.weekly_menus(id),

    -- Informacje o zamówieniu
    delivery_date DATE NOT NULL,
    delivery_day VARCHAR(20) NOT NULL, -- 'tuesday' | 'thursday'
    status VARCHAR(50) DEFAULT 'pending', -- pending | confirmed | delivered | cancelled

    -- Metadane
    is_auto_generated BOOLEAN DEFAULT false, -- czy system sam dobrał dania
    total_meals INTEGER NOT NULL, -- people × days

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    confirmed_at TIMESTAMPTZ,

    -- Jeden order na tydzień dla danego użytkownika
    CONSTRAINT unique_user_weekly_order UNIQUE(user_id, weekly_menu_id)
);

CREATE INDEX idx_weekly_orders_user ON public.subscription_weekly_orders(user_id);
CREATE INDEX idx_weekly_orders_subscription ON public.subscription_weekly_orders(subscription_id);
CREATE INDEX idx_weekly_orders_delivery ON public.subscription_weekly_orders(delivery_date);

-- ============================================================================
-- 4. SUBSCRIPTION WEEKLY ORDER ITEMS - Dania w zamówieniu
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscription_weekly_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weekly_order_id UUID NOT NULL REFERENCES public.subscription_weekly_orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1, -- ile porcji (zazwyczaj people × days / liczba dań)
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_weekly_order_items_order ON public.subscription_weekly_order_items(weekly_order_id);

-- ============================================================================
-- 5. UPDATE SUBSCRIPTIONS TABLE - Dodaj kolumny dla dostaw
-- ============================================================================

-- Dodaj kolumny do istniejącej tabeli subscriptions
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS delivery_day VARCHAR(20) DEFAULT 'tuesday', -- 'tuesday' | 'thursday'
ADD COLUMN IF NOT EXISTS next_delivery_date DATE,
ADD COLUMN IF NOT EXISTS last_delivery_date DATE,
ADD COLUMN IF NOT EXISTS cutoff_day VARCHAR(20) DEFAULT 'sunday', -- dzień deadline do zmian
ADD COLUMN IF NOT EXISTS cutoff_time TIME DEFAULT '23:59:00';

-- ============================================================================
-- 6. RLS (Row Level Security) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE public.weekly_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_weekly_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_weekly_order_items ENABLE ROW LEVEL SECURITY;

-- Weekly Menus - publiczne dla wszystkich (read), admin może edytować
CREATE POLICY "Weekly menus are viewable by everyone"
    ON public.weekly_menus FOR SELECT
    TO authenticated
    USING (is_published = true OR is_active = true);

CREATE POLICY "Admins can manage weekly menus"
    ON public.weekly_menus FOR ALL
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Weekly Menu Items - publiczne (read)
CREATE POLICY "Weekly menu items are viewable by everyone"
    ON public.weekly_menu_items FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.weekly_menus
            WHERE id = weekly_menu_id
            AND (is_published = true OR is_active = true)
        )
    );

CREATE POLICY "Admins can manage weekly menu items"
    ON public.weekly_menu_items FOR ALL
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Subscription Weekly Orders - użytkownik widzi tylko swoje
CREATE POLICY "Users can view their own weekly orders"
    ON public.subscription_weekly_orders FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weekly orders"
    ON public.subscription_weekly_orders FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly orders"
    ON public.subscription_weekly_orders FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Subscription Weekly Order Items - użytkownik widzi tylko swoje
CREATE POLICY "Users can view their own weekly order items"
    ON public.subscription_weekly_order_items FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.subscription_weekly_orders
            WHERE id = weekly_order_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own weekly order items"
    ON public.subscription_weekly_order_items FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.subscription_weekly_orders
            WHERE id = weekly_order_id AND user_id = auth.uid()
        )
    );

-- ============================================================================
-- 7. FUNCTIONS - Pomocnicze funkcje
-- ============================================================================

-- Funkcja do automatycznego ustawiania updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggery dla updated_at
CREATE TRIGGER update_weekly_menus_updated_at
    BEFORE UPDATE ON public.weekly_menus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_orders_updated_at
    BEFORE UPDATE ON public.subscription_weekly_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funkcja do obliczania następnej daty dostawy
CREATE OR REPLACE FUNCTION calculate_next_delivery_date(
    p_delivery_day VARCHAR,
    p_from_date DATE DEFAULT CURRENT_DATE
)
RETURNS DATE AS $$
DECLARE
    v_target_day_num INTEGER;
    v_current_day_num INTEGER;
    v_days_until_delivery INTEGER;
BEGIN
    -- Mapowanie dni na numery (0 = niedziela, 1 = poniedziałek, ...)
    v_target_day_num := CASE p_delivery_day
        WHEN 'sunday' THEN 0
        WHEN 'monday' THEN 1
        WHEN 'tuesday' THEN 2
        WHEN 'wednesday' THEN 3
        WHEN 'thursday' THEN 4
        WHEN 'friday' THEN 5
        WHEN 'saturday' THEN 6
        ELSE 2 -- default wtorek
    END;

    v_current_day_num := EXTRACT(DOW FROM p_from_date)::INTEGER;

    -- Oblicz ile dni do następnego wybranego dnia
    IF v_current_day_num <= v_target_day_num THEN
        v_days_until_delivery := v_target_day_num - v_current_day_num;
    ELSE
        v_days_until_delivery := 7 - v_current_day_num + v_target_day_num;
    END IF;

    -- Jeśli to dzisiaj, przesuń o tydzień
    IF v_days_until_delivery = 0 THEN
        v_days_until_delivery := 7;
    END IF;

    RETURN p_from_date + v_days_until_delivery;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. SAMPLE DATA (opcjonalne - do testów)
-- ============================================================================

-- Przykładowe menu tygodniowe (zakomentowane - odkomentuj do testów)
/*
INSERT INTO public.weekly_menus (week_start_date, week_end_date, label, is_active, is_published)
VALUES
    ('2025-11-24', '2025-11-30', 'Tydzień 24-30 listopada 2025', true, true);
*/

-- ============================================================================
-- 9. COMMENTS - Komentarze dla dokumentacji
-- ============================================================================

COMMENT ON TABLE public.weekly_menus IS 'Menu tygodniowe - każdy tydzień ma swoje menu produktów';
COMMENT ON TABLE public.weekly_menu_items IS 'Produkty w menu tygodniowym';
COMMENT ON TABLE public.subscription_weekly_orders IS 'Zamówienia tygodniowe subskrybentów - wybór dań na dany tydzień';
COMMENT ON TABLE public.subscription_weekly_order_items IS 'Dania wybrane w zamówieniu tygodniowym';

COMMENT ON COLUMN public.weekly_menus.is_active IS 'Tylko jedno menu może być aktywne - to jest "obecny tydzień"';
COMMENT ON COLUMN public.weekly_menus.is_published IS 'Czy menu jest widoczne dla klientów';
COMMENT ON COLUMN public.subscription_weekly_orders.is_auto_generated IS 'Czy system automatycznie dobrał dania (user nic nie wybrał)';
