-- =====================================================
-- NutriChef Recipe Data Tables
-- Migration for Smakowało Nutrition Auto-Generator
-- =====================================================

-- Table: recipes
-- Stores recipe metadata linked to products
CREATE TABLE IF NOT EXISTS recipes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    servings integer NOT NULL DEFAULT 2,
    product_id bigint REFERENCES products(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Table: ingredients
-- Stores ingredients for each recipe with gram amounts
CREATE TABLE IF NOT EXISTS ingredients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_name text NOT NULL,
    amount_grams numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Table: nutrition
-- Stores nutritional information for each recipe
CREATE TABLE IF NOT EXISTS nutrition (
    recipe_id uuid PRIMARY KEY REFERENCES recipes(id) ON DELETE CASCADE,
    calories numeric NOT NULL,
    protein numeric NOT NULL,
    fat numeric NOT NULL,
    carbs numeric NOT NULL,
    fiber numeric NOT NULL,
    salt numeric NOT NULL,
    allergens text[] NOT NULL DEFAULT '{}',
    score integer NOT NULL CHECK (score >= 0 AND score <= 100),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Table: recipe_generated_text
-- Stores AI-generated text content for recipes
CREATE TABLE IF NOT EXISTS recipe_generated_text (
    recipe_id uuid PRIMARY KEY REFERENCES recipes(id) ON DELETE CASCADE,
    short_description text NOT NULL,
    long_description text NOT NULL,
    health_benefits text NOT NULL,
    substitutions text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Table: recipe_steps
-- Stores step-by-step preparation instructions
CREATE TABLE IF NOT EXISTS recipe_steps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    "order" integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- =====================================================
-- Indexes for better query performance
-- =====================================================

-- Index on recipes.product_id for linking to products
CREATE INDEX IF NOT EXISTS idx_recipes_product_id ON recipes(product_id);

-- Index on recipes.name for search
CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes(name);

-- Index on ingredients.recipe_id for joining
CREATE INDEX IF NOT EXISTS idx_ingredients_recipe_id ON ingredients(recipe_id);

-- Index on recipe_steps.recipe_id for joining
CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe_id ON recipe_steps(recipe_id);

-- Index on recipe_steps order for sorting
CREATE INDEX IF NOT EXISTS idx_recipe_steps_order ON recipe_steps(recipe_id, "order");

-- =====================================================
-- Row Level Security (RLS) policies
-- Adjust these based on your authentication needs
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_generated_text ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;

-- Public read access for recipes (adjust as needed)
CREATE POLICY "Allow public read access to recipes" ON recipes
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to ingredients" ON ingredients
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to nutrition" ON nutrition
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to recipe_generated_text" ON recipe_generated_text
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to recipe_steps" ON recipe_steps
    FOR SELECT USING (true);

-- Service role has full access (for API routes using service key)
CREATE POLICY "Allow service role full access to recipes" ON recipes
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access to ingredients" ON ingredients
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access to nutrition" ON nutrition
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access to recipe_generated_text" ON recipe_generated_text
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access to recipe_steps" ON recipe_steps
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- Triggers for updated_at timestamps
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for recipes
CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for nutrition
CREATE TRIGGER update_nutrition_updated_at
    BEFORE UPDATE ON nutrition
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for recipe_generated_text
CREATE TRIGGER update_recipe_generated_text_updated_at
    BEFORE UPDATE ON recipe_generated_text
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
