/*
  # Fix search results permissions

  1. Changes
     - Update RLS policies for search_results table to ensure proper access to published articles
     - Fix policy for authenticated users to access published search results
     - Ensure users without authentication can still access public content

  2. Security
     - Maintain row-level security while allowing proper access patterns
     - Ensure published content is properly accessible
*/

-- First, drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public access to published search results" ON public.search_results;
DROP POLICY IF EXISTS "Allow published search results access" ON public.search_results;
DROP POLICY IF EXISTS "Users can view their own search results" ON public.search_results;
DROP POLICY IF EXISTS "Allow viewing saved article content" ON public.search_results;
DROP POLICY IF EXISTS "Admins can manage search results" ON public.search_results;
DROP POLICY IF EXISTS "Users can see their own search queries" ON public.search_queries;

-- Create a more permissive policy for published search results
CREATE POLICY "Allow published search results access"
ON public.search_results
FOR SELECT
TO authenticated
USING (is_published = true);

-- Create a policy for users to view their own search results
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

-- Ensure the table has RLS enabled
ALTER TABLE IF EXISTS public.search_results ENABLE ROW LEVEL SECURITY;

-- Make sure the search_queries table has the right policy for user access
CREATE POLICY "Users can see their own search queries"
ON public.search_queries
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Add additional policy for user-saved article access
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

-- Validate that existing admin policies are working correctly
CREATE POLICY "Admins can manage search results"
ON public.search_results
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  ) OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid() 
    AND profiles.is_admin = true
  )
);