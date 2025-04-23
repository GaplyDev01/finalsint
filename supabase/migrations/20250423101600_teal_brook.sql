/*
  # Create User Saved Articles table

  1. New Table
     - `user_saved_articles` - Allows users to save articles for later
       - `id` (uuid, primary key)
       - `user_id` (uuid, foreign key to users)
       - `article_id` (uuid, foreign key to search_results)
       - `saved_at` (timestamp)
       - `notes` (text, nullable)

  2. Security
     - Enable RLS on user_saved_articles
     - Add policy for users to view their own saved articles
     - Add policy for users to manage their own saved articles
*/

-- Create the user_saved_articles table
CREATE TABLE IF NOT EXISTS public.user_saved_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES public.search_results(id) ON DELETE CASCADE,
  saved_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  UNIQUE(user_id, article_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_saved_articles_user_id ON public.user_saved_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_articles_article_id ON public.user_saved_articles(article_id);

-- Enable row level security
ALTER TABLE public.user_saved_articles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating them
DROP POLICY IF EXISTS "Users can view their own saved articles" ON public.user_saved_articles;
DROP POLICY IF EXISTS "Users can insert their own saved articles" ON public.user_saved_articles;
DROP POLICY IF EXISTS "Users can update their own saved articles" ON public.user_saved_articles;
DROP POLICY IF EXISTS "Users can delete their own saved articles" ON public.user_saved_articles;

-- Create policies for access control
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

-- Create activity trigger for article saving
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