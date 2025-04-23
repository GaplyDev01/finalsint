/*
  # Add CryptoPanic News Integration

  1. Changes
     - Add source field to search_results table to track where articles came from
     - Add entry in api_keys table for CryptoPanic API (if not exists)

  2. Security
     - No changes to RLS policies required (using existing policies)
*/

-- Add source field to search_results if it doesn't exist
ALTER TABLE IF EXISTS public.search_results
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Create index on source field for faster queries
CREATE INDEX IF NOT EXISTS idx_search_results_source
ON public.search_results(source);

-- Add CryptoPanic API key entry if it doesn't exist
INSERT INTO public.api_keys (id, key, description, service, created_at, updated_at)
VALUES (
  'cryptopanic', 
  'YOUR_API_KEY_HERE', -- Replace with actual API key from CryptoPanic
  'API key for CryptoPanic news service', 
  'cryptopanic',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;