-- Add status_text column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS status_text TEXT DEFAULT ''; 