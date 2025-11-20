-- =====================================================
-- Smakowało Profiles Table Migration
-- Created: 2025-11-17
-- Purpose: Store user profile data with GDPR compliance
-- =====================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  -- Primary key (matches auth.users.id)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Personal information
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,

  -- Address information
  street_address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Poland',

  -- Dietary preferences (stored as JSON array)
  dietary_preferences JSONB DEFAULT '[]'::jsonb,
  allergies JSONB DEFAULT '[]'::jsonb,

  -- Newsletter and marketing
  newsletter_subscribed BOOLEAN DEFAULT false,
  marketing_consent BOOLEAN DEFAULT false,

  -- Default meal plan settings (for kreator)
  default_people INTEGER DEFAULT 2,
  default_days INTEGER DEFAULT 3,

  -- Account metadata
  avatar_url TEXT,
  locale TEXT DEFAULT 'pl',
  timezone TEXT DEFAULT 'Europe/Warsaw',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Soft delete support (GDPR - keep record of deletion)
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~* '^\+?[0-9\s\-()]+$'),
  CONSTRAINT valid_postal_code CHECK (postal_code IS NULL OR postal_code ~* '^[0-9]{2}-[0-9]{3}$')
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Create index on deleted_at for filtering active users
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at) WHERE deleted_at IS NULL;

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- =====================================================
-- Trigger to automatically update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Function to create profile on user signup
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Sample data (optional - remove in production)
-- =====================================================

-- Insert sample profile for testing (only if you have a test user)
-- UNCOMMENT BELOW IF YOU WANT SAMPLE DATA
/*
INSERT INTO profiles (
  id,
  email,
  first_name,
  last_name,
  phone,
  street_address,
  city,
  postal_code,
  dietary_preferences,
  newsletter_subscribed,
  default_people,
  default_days
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'test@smakowalo.pl',
  'Jan',
  'Kowalski',
  '+48 123 456 789',
  'ul. Testowa 123',
  'Warszawa',
  '00-001',
  '["wegetariańska", "bezglutenowa"]'::jsonb,
  true,
  2,
  3
) ON CONFLICT (id) DO NOTHING;
*/

-- =====================================================
-- Grant permissions
-- =====================================================

-- Grant authenticated users access to profiles
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE profiles IS 'User profile information with GDPR compliance';
COMMENT ON COLUMN profiles.id IS 'User ID (matches auth.users.id)';
COMMENT ON COLUMN profiles.email IS 'User email address';
COMMENT ON COLUMN profiles.dietary_preferences IS 'Array of dietary preference codes';
COMMENT ON COLUMN profiles.allergies IS 'Array of allergen codes to avoid';
COMMENT ON COLUMN profiles.deleted_at IS 'Soft delete timestamp for GDPR compliance';
COMMENT ON COLUMN profiles.newsletter_subscribed IS 'Newsletter subscription consent';
COMMENT ON COLUMN profiles.marketing_consent IS 'Marketing communications consent';
