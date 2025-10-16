-- Add email verification fields to profiles table
-- Run this in your Supabase SQL Editor

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verification_token TEXT,
ADD COLUMN IF NOT EXISTS email_verification_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_profiles_verification_token
ON profiles(email_verification_token)
WHERE email_verification_token IS NOT NULL;

-- Add comment to document the fields
COMMENT ON COLUMN profiles.email_verified IS 'Whether the user has verified their email address';
COMMENT ON COLUMN profiles.email_verification_token IS 'Hashed token for email verification (SHA-256)';
COMMENT ON COLUMN profiles.email_verification_token_expires_at IS 'Expiration time for the verification token';
