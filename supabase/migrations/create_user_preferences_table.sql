-- Migration: Create user_preferences table
-- This table stores user preferences for the Kreator feature
-- Created: 2025-10-25

CREATE TABLE IF NOT EXISTS user_preferences (
  email TEXT PRIMARY KEY,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_email ON user_preferences(email);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE user_preferences IS 'Stores user preferences for Kreator (meal creator) including diet preferences, allergen selections, and meal planning settings';
COMMENT ON COLUMN user_preferences.email IS 'User email address (primary key)';
COMMENT ON COLUMN user_preferences.preferences IS 'JSON object containing: numberOfPeople (2-4), numberOfDays (2-5), selectedDiets (array of up to 3 diet IDs), selectedAllergies (array of allergen strings: gluten, mleko, orzechy, soja, jaja, ryby, skorupiaki, sezam)';
COMMENT ON COLUMN user_preferences.updated_at IS 'Timestamp of last update';
