/*
  # Initial Database Schema

  1. New Tables
     - `profiles` - User profiles linked to auth.users
     - `user_roles` - Stores user role assignments
     - `user_activity_logs` - Tracks user activity
     - `user_preferences` - Stores user preferences
     - `api_keys` - Stores API keys for external services
     - `search_queries` - Stores search queries
     - `search_results` - Stores search results

  2. Security
     - Enable RLS on all tables
     - Add policies for proper access control
     - Create functions and triggers for admin role management
*/

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

-- Create user_activity_logs table
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  life_areas TEXT[] DEFAULT ARRAY['Career', 'Finances', 'Leisure', 'Interest'],
  sources TEXT[] DEFAULT ARRAY[]::TEXT[],
  update_interval INTERVAL DEFAULT '00:30:00',
  notification_channels TEXT[] DEFAULT ARRAY['in-app']::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL,
  description TEXT,
  service TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create search_queries table
CREATE TABLE IF NOT EXISTS public.search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  metadata JSONB,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create search_results table
CREATE TABLE IF NOT EXISTS public.search_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID NOT NULL REFERENCES public.search_queries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  content TEXT,
  content_type TEXT DEFAULT 'text',
  metadata JSONB,
  embedding VECTOR(1536),
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_saved_articles table
CREATE TABLE IF NOT EXISTS public.user_saved_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.search_results(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(user_id, article_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_user_id ON public.search_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_search_results_query_id ON public.search_results(query_id);
CREATE INDEX IF NOT EXISTS idx_search_results_published ON public.search_results(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_user_saved_articles_user_id ON public.user_saved_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_articles_article_id ON public.user_saved_articles(article_id);

-- Enable row level security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_articles ENABLE ROW LEVEL SECURITY;

-- Create function to check if a user is an admin
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

-- Create function to set admin flag based on email domain
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

-- Create trigger to set admin flag on profile creation
CREATE TRIGGER assign_admin_flag
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_admin_flag();

-- Create trigger to preserve admin flag on profile update
CREATE TRIGGER preserve_admin_flag
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_admin_flag();

-- Create function to sync admin role with profile flag
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

-- Create trigger to sync admin flag to role
CREATE TRIGGER sync_admin_role_trigger
AFTER UPDATE ON public.profiles
FOR EACH ROW
WHEN (NEW.is_admin IS DISTINCT FROM OLD.is_admin)
EXECUTE FUNCTION public.sync_admin_role();

-- Create function to handle new user creation
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
    INSERT INTO public.profiles (user_id, email, created_at, updated_at)
    VALUES (
      NEW.id, 
      user_email,
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

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to set published timestamp
CREATE OR REPLACE FUNCTION set_published_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = true AND (OLD.is_published IS NULL OR OLD.is_published = false) THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for published timestamp
CREATE TRIGGER set_published_at
BEFORE UPDATE ON public.search_results
FOR EACH ROW
WHEN (NEW.is_published IS DISTINCT FROM OLD.is_published)
EXECUTE FUNCTION set_published_timestamp();

-- Create function to log article save activity
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

-- Create trigger for article save activity
CREATE TRIGGER on_article_save
  AFTER INSERT ON public.user_saved_articles
  FOR EACH ROW EXECUTE FUNCTION log_article_save_activity();

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin());

-- Create policies for user_activity_logs table
CREATE POLICY "Users can view their own activity logs"
ON public.user_activity_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs"
ON public.user_activity_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policies for user_preferences table
CREATE POLICY "Users can manage their own preferences"
ON public.user_preferences
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- Create policies for api_keys table
CREATE POLICY "Admins can manage API keys"
ON public.api_keys
FOR ALL
TO authenticated
USING (public.is_admin());

-- Create policies for search_queries table
CREATE POLICY "Users can see their own search queries"
ON public.search_queries
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create search queries"
ON public.search_queries
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all search queries"
ON public.search_queries
FOR ALL
TO authenticated
USING (public.is_admin());

-- Create policies for search_results table
CREATE POLICY "Allow published search results access"
ON public.search_results
FOR SELECT
TO authenticated
USING (is_published = true);

CREATE POLICY "Users can view their own search results"
ON public.search_results
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM search_queries
    WHERE search_queries.id = query_id
    AND search_queries.user_id = auth.uid()
  )
);

CREATE POLICY "Allow viewing saved article content"
ON public.search_results
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_saved_articles
    WHERE user_saved_articles.article_id = id
    AND user_saved_articles.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage search results"
ON public.search_results
FOR ALL
TO authenticated
USING (public.is_admin());

-- Create policies for user_saved_articles table
CREATE POLICY "Users can view their own saved articles"
ON public.user_saved_articles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved articles"
ON public.user_saved_articles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved articles"
ON public.user_saved_articles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved articles"
ON public.user_saved_articles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Insert default API keys
INSERT INTO public.api_keys (id, key, description, service, created_at, updated_at)
VALUES 
  ('firecrawl', 'placeholder-replace-with-actual-key', 'API key for Firecrawl search service', 'firecrawl', NOW(), NOW()),
  ('cryptopanic', 'YOUR_API_KEY_HERE', 'API key for CryptoPanic news service', 'cryptopanic', NOW(), NOW()),
  ('twitter', 'YOUR_API_KEY_HERE', 'API key for Twitter feed via RapidAPI', 'twitter', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;