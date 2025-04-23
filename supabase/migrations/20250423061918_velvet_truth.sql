/*
  # Fix admin role assignment for @blindvibe.com emails

  1. Changes
     - Improve user role assignment for @blindvibe.com email domains
     - Update policies to recognize both role-based and email-based admin access
     - Add migration to fix existing accounts that may have missed role assignment
*/

-- Fix any existing users with @blindvibe.com emails that don't have admin roles
DO $$
DECLARE
  blindvibe_user RECORD;
BEGIN
  -- Loop through users with @blindvibe.com emails that exist in auth.users
  -- and don't already have admin role
  FOR blindvibe_user IN 
    SELECT u.id, u.email FROM auth.users u
    WHERE u.email LIKE '%@blindvibe.com' 
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles r 
      WHERE r.user_id = u.id AND r.role = 'admin'
    )
  LOOP
    -- Insert admin role for the user if it doesn't exist
    INSERT INTO public.user_roles (user_id, role, assigned_at)
    VALUES (blindvibe_user.id, 'admin', now())
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Added admin role to user: %', blindvibe_user.email;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Improve the handle_new_user function to more reliably add admin roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  profile_id BIGINT;
  user_email TEXT;
BEGIN
  -- Get the user's email from auth.users
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = NEW.id;

  BEGIN
    -- Create a profile for the new user
    INSERT INTO public.profiles (id, user_id, created_at, updated_at)
    VALUES (
      coalesce(nextval('profiles_id_seq'::regclass), (SELECT COALESCE(MAX(id), 0) + 1 FROM public.profiles)), 
      NEW.id, 
      now(), 
      now()
    )
    RETURNING id INTO profile_id;
    
    RAISE NOTICE 'Created profile for user with id: %', profile_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  END;
  
  BEGIN
    -- Create default user preferences
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);
    
    RAISE NOTICE 'Created preferences for user: %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to create preferences for user %: %', NEW.id, SQLERRM;
  END;
  
  BEGIN
    -- Only proceed if we found a valid user email
    IF user_email IS NOT NULL AND user_email LIKE '%@blindvibe.com' THEN
      INSERT INTO public.user_roles (user_id, role, assigned_at)
      VALUES (NEW.id, 'admin', now())
      ON CONFLICT (user_id, role) DO NOTHING;
      
      RAISE NOTICE 'Assigned admin role to blindvibe user: %', user_email;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to assign admin role for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger is created or replaced
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update all admin-only policies to include email domain check

-- API Keys policy update
DROP POLICY IF EXISTS "Admins can manage API keys" ON api_keys;
CREATE POLICY "Admins can manage API keys"
ON api_keys
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  ) OR 
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() 
    AND email LIKE '%@blindvibe.com'
  )
);

-- Search queries policy update
DROP POLICY IF EXISTS "Admins can manage search queries" ON search_queries;
CREATE POLICY "Admins can manage search queries"
ON search_queries
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  ) OR 
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() 
    AND email LIKE '%@blindvibe.com'
  )
);

-- Search results policy update
DROP POLICY IF EXISTS "Admins can manage search results" ON search_results;
CREATE POLICY "Admins can manage search results"
ON search_results
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  ) OR 
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() 
    AND email LIKE '%@blindvibe.com'
  )
);

-- Ensure the tables have RLS enabled
ALTER TABLE IF EXISTS api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS search_results ENABLE ROW LEVEL SECURITY;