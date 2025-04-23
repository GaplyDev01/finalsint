-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search optimization

-- Create is_admin() function for checking admin status
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

----------------------
-- PROFILES MANAGEMENT
----------------------

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT false,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes on profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - with IF NOT EXISTS to avoid duplicates
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;
CREATE POLICY "Allow users to insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own profile" ON public.profiles;
CREATE POLICY "Allow users to delete their own profile"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
CREATE POLICY "System can insert profiles"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Profile admin check" ON public.profiles;
CREATE POLICY "Profile admin check"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

----------------------
-- USER ROLES
----------------------

-- Create user_roles table if not exists
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create indexes on user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_admin ON public.user_roles(user_id, role) WHERE role = 'admin';

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM auth.users 
      WHERE id = auth.uid() AND email LIKE '%@blindvibe.com'
    ) OR
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
    )
  );

----------------------
-- USER PREFERENCES
----------------------

-- Create user_preferences table if not exists
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  life_areas TEXT[] DEFAULT ARRAY['Career', 'Finances', 'Leisure', 'Interest'],
  sources TEXT[] DEFAULT ARRAY[]::text[],
  update_interval INTERVAL DEFAULT '00:30:00'::interval,
  notification_channels TEXT[] DEFAULT ARRAY['in-app'],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes on user_preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert user preferences" ON public.user_preferences;
CREATE POLICY "System can insert user preferences"
  ON public.user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

----------------------
-- USER ACTIVITY LOGS
----------------------

-- Create user_activity_logs table if not exists
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes on user_activity_logs
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action ON public.user_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_user ON public.user_activity_logs(user_id);

-- Enable RLS
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.user_activity_logs;
CREATE POLICY "Users can view their own activity logs"
  ON public.user_activity_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.user_activity_logs;
CREATE POLICY "Admins can view all activity logs"
  ON public.user_activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles
      WHERE (user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin')
    )
  );

DROP POLICY IF EXISTS "System can insert activity logs" ON public.user_activity_logs;
CREATE POLICY "System can insert activity logs"
  ON public.user_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "activity_logs_user_access" ON public.user_activity_logs;
CREATE POLICY "activity_logs_user_access"
  ON public.user_activity_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

----------------------
-- API KEYS
----------------------

-- Create api_keys table if not exists
CREATE TABLE IF NOT EXISTS public.api_keys (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL,
  description TEXT,
  service TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Admins can manage API keys" ON public.api_keys;
CREATE POLICY "Admins can manage API keys"
  ON public.api_keys
  FOR ALL
  TO authenticated
  USING (public.is_admin());

----------------------
-- SEARCH QUERIES
----------------------

-- Create search_queries table if not exists
CREATE TABLE IF NOT EXISTS public.search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes on search_queries
CREATE INDEX IF NOT EXISTS idx_search_queries_user_id ON public.search_queries(user_id);

-- Enable RLS
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can see their own search queries" ON public.search_queries;
CREATE POLICY "Users can see their own search queries"
  ON public.search_queries
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all search queries" ON public.search_queries;
CREATE POLICY "Admins can manage all search queries"
  ON public.search_queries
  FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert search queries" ON public.search_queries;
CREATE POLICY "Admins can insert search queries"
  ON public.search_queries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_roles
      WHERE (user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin')
    )
  );

----------------------
-- SEARCH RESULTS
----------------------

-- Create search_results table if not exists
CREATE TABLE IF NOT EXISTS public.search_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID NOT NULL REFERENCES public.search_queries(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  url TEXT NOT NULL,
  content TEXT,
  content_type TEXT DEFAULT 'markdown',
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT now(),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  source TEXT DEFAULT 'manual'
);

-- Create indexes on search_results
CREATE INDEX IF NOT EXISTS idx_search_results_query_id ON public.search_results(query_id);
CREATE INDEX IF NOT EXISTS idx_search_results_published ON public.search_results(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_search_results_source ON public.search_results(source);

-- Enable RLS
ALTER TABLE public.search_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own search results" ON public.search_results;
CREATE POLICY "Users can view their own search results"
  ON public.search_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM search_queries
      WHERE search_queries.id = query_id
      AND search_queries.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Allow published search results access" ON public.search_results;
CREATE POLICY "Allow published search results access"
  ON public.search_results
  FOR SELECT
  TO authenticated
  USING (is_published = true);

DROP POLICY IF EXISTS "Allow viewing saved article content" ON public.search_results;
CREATE POLICY "Allow viewing saved article content"
  ON public.search_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_saved_articles
      WHERE user_saved_articles.article_id = id
      AND user_saved_articles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage search results" ON public.search_results;
CREATE POLICY "Admins can manage search results"
  ON public.search_results
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Create trigger function for published_at
CREATE OR REPLACE FUNCTION set_published_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = true AND (OLD.is_published IS NULL OR OLD.is_published = false) THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on the search_results table
DROP TRIGGER IF EXISTS set_published_at ON public.search_results;
CREATE TRIGGER set_published_at
BEFORE UPDATE ON public.search_results
FOR EACH ROW
WHEN (NEW.is_published IS DISTINCT FROM OLD.is_published)
EXECUTE FUNCTION set_published_timestamp();

----------------------
-- USER SAVED ARTICLES
----------------------

-- Create user_saved_articles table if not exists
CREATE TABLE IF NOT EXISTS public.user_saved_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.search_results(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(user_id, article_id)
);

-- Create indexes on user_saved_articles
CREATE INDEX IF NOT EXISTS idx_user_saved_articles_user_id ON public.user_saved_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_articles_article_id ON public.user_saved_articles(article_id);

-- Enable RLS
ALTER TABLE public.user_saved_articles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own saved articles" ON public.user_saved_articles;
CREATE POLICY "Users can view their own saved articles"
  ON public.user_saved_articles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own saved articles" ON public.user_saved_articles;
CREATE POLICY "Users can insert their own saved articles"
  ON public.user_saved_articles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own saved articles" ON public.user_saved_articles;
CREATE POLICY "Users can update their own saved articles"
  ON public.user_saved_articles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own saved articles" ON public.user_saved_articles;
CREATE POLICY "Users can delete their own saved articles"
  ON public.user_saved_articles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger function for logging article saves
CREATE OR REPLACE FUNCTION log_article_save_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log article save activity
  INSERT INTO public.user_activity_logs (
    user_id, 
    action, 
    reference_id
  ) VALUES (
    NEW.user_id,
    'article_saved',
    NEW.article_id::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_article_save ON public.user_saved_articles;
CREATE TRIGGER on_article_save
  AFTER INSERT ON public.user_saved_articles
  FOR EACH ROW EXECUTE FUNCTION log_article_save_activity();

----------------------
-- ADMIN FUNCTIONS AND TRIGGERS
----------------------

-- Create function to handle admin role assignment
CREATE OR REPLACE FUNCTION set_admin_flag()
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
EXECUTE FUNCTION set_admin_flag();

-- Fix assign_admin_flag trigger if needed
DROP TRIGGER IF EXISTS assign_admin_flag ON public.profiles;
CREATE TRIGGER assign_admin_flag
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION set_admin_flag();

-- Add a trigger to sync roles with profiles
CREATE OR REPLACE FUNCTION sync_admin_role()
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
EXECUTE FUNCTION sync_admin_role();

-- Create handle_new_user function for new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Get the user's email from auth.users
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = NEW.id;

    BEGIN
        -- Create a profile for the new user
        INSERT INTO public.profiles (user_id, created_at, updated_at)
        VALUES (NEW.id, now(), now());
        
        RAISE NOTICE 'Created profile for user: %', NEW.id;
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

-- Create trigger for new user handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

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

-- Final check: add admin role to anyone with @blindvibe.com email who doesn't have it
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

-- Initialize API keys
INSERT INTO public.api_keys (id, key, description, service, created_at, updated_at)
VALUES
  ('cryptopanic', 'API_KEY_PLACEHOLDER', 'API key for CryptoPanic news service', 'cryptopanic', NOW(), NOW()),
  ('firecrawl', 'API_KEY_PLACEHOLDER', 'API key for FireCrawl search service', 'firecrawl', NOW(), NOW()),
  ('twitter', 'API_KEY_PLACEHOLDER', 'API key for Twitter feed via RapidAPI', 'twitter', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;