/*
  # Fix API Keys Permissions

  1. Changes
     - Update RLS policies for the api_keys table
     - Simplify admin access check to avoid permission errors with auth.users table
     - Create proper policies for authenticated users with admin role

  2. Security
     - Enable RLS on api_keys table
     - Admin users can manage all API keys
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Admins can manage API keys" ON api_keys;

-- Create a more secure policy that avoids direct auth.users table access
CREATE POLICY "Admins can manage API keys"
ON api_keys
FOR ALL
TO authenticated
USING (
  -- Check if user has admin role in user_roles table
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
  -- The check for blindvibe.com emails will be handled by the profiles table's is_admin flag
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS api_keys ENABLE ROW LEVEL SECURITY;

-- Set up a special profile read policy just for checking admin status
DROP POLICY IF EXISTS "Anyone can read profile for admin check" ON profiles;
CREATE POLICY "Anyone can read profile for admin check"
ON profiles
FOR SELECT
TO authenticated
USING (true);

-- Make sure the CryptoPanic API key exists
INSERT INTO api_keys (id, key, description, service, created_at, updated_at)
VALUES (
  'cryptopanic', 
  'YOUR_API_KEY_HERE',
  'API key for CryptoPanic news service', 
  'cryptopanic',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;