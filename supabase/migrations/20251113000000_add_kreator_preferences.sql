-- Add kreator preferences columns to profiles table
-- This migration adds support for storing user preferences for the meal plan creator

-- Add dietary preferences column (array of diet IDs/codes)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS dietary_preferences TEXT[] DEFAULT '{}';

-- Add allergens column (array of allergen codes)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS allergens TEXT[] DEFAULT '{}';

-- Add default number of people
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS default_people_count INTEGER DEFAULT 2;

-- Add default number of days
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS default_days_count INTEGER DEFAULT 3;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_dietary_preferences ON profiles USING GIN (dietary_preferences);
CREATE INDEX IF NOT EXISTS idx_profiles_allergens ON profiles USING GIN (allergens);

-- Add comment for documentation
COMMENT ON COLUMN profiles.dietary_preferences IS 'User dietary preferences (IDs from dietTypes array in kreator)';
COMMENT ON COLUMN profiles.allergens IS 'User allergen exclusions (IDs from allergyOptions array in kreator)';
COMMENT ON COLUMN profiles.default_people_count IS 'Default number of people for meal plans';
COMMENT ON COLUMN profiles.default_days_count IS 'Default number of days for meal plans';
