/*
  # Add news feed support and embeddings

  1. New Columns
    - `search_results`
      - `is_published` (boolean) - Flag to indicate if the result is published to the news feed
      - `published_at` (timestamp) - When the result was published to the news feed

  2. Policies
    - Update RLS policies for public access to published search results

  3. Indexes
    - Add index on `is_published` for faster news feed queries
*/

-- Add fields to the search_results table for news feed functionality
ALTER TABLE IF EXISTS public.search_results 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Create a trigger to automatically set published_at when is_published is set to true
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

-- Create an index on is_published for faster news feed queries
CREATE INDEX IF NOT EXISTS idx_search_results_published 
ON public.search_results(is_published, published_at);

-- Add vector extension if not already added (for embeddings support)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add policy for public access to published search results
DROP POLICY IF EXISTS "Allow public access to published search results" ON public.search_results;
CREATE POLICY "Allow public access to published search results"
ON public.search_results
FOR SELECT
TO authenticated
USING (is_published = true);