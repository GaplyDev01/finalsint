/*
  # Fix admin role preservation and privileges

  1. Changes
     - Create a more robust admin role assignment and preservation system
     - Add safeguards to prevent admin role loss
     - Improve existing RLS policies to better detect admin status
*/

-- First, create a function to validate admin status that checks multiple sources
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has admin role in user_roles table
  IF EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if the user's email has @blindvibe.com domain
  IF EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() 
    AND email LIKE '%@blindvibe.com'
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has is_admin flag in profiles
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND is_admin = true
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Not an admin
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Improve set_admin_flag function to use email domain check and preserve status
CREATE OR REPLACE FUNCTION public.set_admin_flag() 
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Get the user's email from auth.users
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = NEW.user_id;

    -- Set is_admin to true if:
    -- 1. Email is from blindvibe.com domain OR
    -- 2. User already has admin role in user_roles
    IF user_email LIKE '%@blindvibe.com' OR EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = NEW.user_id AND role = 'admin'
    ) THEN
        NEW.is_admin = TRUE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a trigger to update admin flag whenever profiles are updated
DROP TRIGGER IF EXISTS preserve_admin_flag ON public.profiles;
CREATE TRIGGER preserve_admin_flag
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_admin_flag();

-- Fix assign_admin_flag trigger if needed
DROP TRIGGER IF EXISTS assign_admin_flag ON public.profiles;
CREATE TRIGGER assign_admin_flag
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_admin_flag();

-- Add a trigger to sync roles with profiles
CREATE OR REPLACE FUNCTION public.sync_admin_role() 
RETURNS TRIGGER AS $$
BEGIN
    -- When a profile is updated to have admin flag
    IF NEW.is_admin = TRUE AND (OLD IS NULL OR OLD.is_admin = FALSE) THEN
        -- Insert admin role if it doesn't exist
        INSERT INTO user_roles (user_id, role, assigned_at)
        VALUES (NEW.user_id, 'admin', now())
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to sync admin flag to role
DROP TRIGGER IF EXISTS sync_admin_role_trigger ON public.profiles;
CREATE TRIGGER sync_admin_role_trigger
AFTER UPDATE ON public.profiles
FOR EACH ROW
WHEN (NEW.is_admin IS DISTINCT FROM OLD.is_admin)
EXECUTE FUNCTION public.sync_admin_role();

-- Make sure all @blindvibe.com users have admin flag in profiles
UPDATE profiles
SET is_admin = TRUE
FROM auth.users
WHERE profiles.user_id = auth.users.id
AND auth.users.email LIKE '%@blindvibe.com'
AND (profiles.is_admin IS NULL OR profiles.is_admin = FALSE);

-- Make sure all users with admin role have admin flag in profiles
UPDATE profiles
SET is_admin = TRUE
FROM user_roles
WHERE profiles.user_id = user_roles.user_id
AND user_roles.role = 'admin'
AND (profiles.is_admin IS NULL OR profiles.is_admin = FALSE);

-- Update all policies to use the is_admin() function
-- API Keys policy update
DROP POLICY IF EXISTS "Admins can manage API keys" ON api_keys;
CREATE POLICY "Admins can manage API keys"
ON api_keys
FOR ALL
TO authenticated
USING (public.is_admin());

-- Search queries policy update
DROP POLICY IF EXISTS "Admins can manage all search queries" ON search_queries;
CREATE POLICY "Admins can manage all search queries"
ON search_queries
FOR ALL
TO authenticated
USING (public.is_admin());

-- Search results policy update
DROP POLICY IF EXISTS "Admins can manage search results" ON search_results;
CREATE POLICY "Admins can manage search results"
ON search_results
FOR ALL
TO authenticated
USING (public.is_admin());

-- Final check: add admin role to anyone with @blindvibe.com email who doesn't have it
-- Skip if they already have the role
DO $$
DECLARE
    blindvibe_user RECORD;
BEGIN
    FOR blindvibe_user IN 
        SELECT id, email FROM auth.users
        WHERE email LIKE '%@blindvibe.com'
    LOOP
        -- Insert the admin role if it doesn't exist
        INSERT INTO user_roles (user_id, role, assigned_at)
        VALUES (blindvibe_user.id, 'admin', now())
        ON CONFLICT (user_id, role) DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Make sure we have the right indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_user_roles_admin ON user_roles(user_id, role) WHERE role = 'admin';