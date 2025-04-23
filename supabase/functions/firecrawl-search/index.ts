// @filename: index.ts
import { createClient } from 'npm:@supabase/supabase-js@2.38.5';

// Define the API URL for Firecrawl
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v1/search';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface SearchRequest {
  query: string;
  limit?: number;
  lang?: string;
  country?: string;
  tbs?: string;
  scrapeOptions?: {
    formats: string[];
  };
}

interface SearchResult {
  title: string;
  description: string;
  url: string;
  markdown?: string;
  html?: string;
  links?: string[];
  metadata?: {
    title: string;
    description: string;
    sourceURL: string;
    statusCode: number;
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Extract the authorization token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate that the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized', 
          details: authError ? authError.message : 'No user found' 
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log(`User authenticated: ${user.id}`);

    // Check if user's email ends with @blindvibe.com (direct admin check)
    const isDirectAdmin = user.email && user.email.endsWith('@blindvibe.com');
    let isRoleAdmin = false;

    if (!isDirectAdmin) {
      // Check if user has admin role in profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (!profileError && profile && profile.is_admin) {
        isRoleAdmin = true;
        console.log('User has admin access via profile flag');
      } else {
        // Check user_roles table for admin role
        const { data: userRoles, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (!roleError && userRoles) {
          isRoleAdmin = true;
          console.log('User has admin access via role assignment');
        }
      }
    } else {
      console.log('User has direct admin access via email domain');
    }

    // Verify user is an admin through either method
    if (!isDirectAdmin && !isRoleAdmin) {
      return new Response(
        JSON.stringify({ 
          error: 'Admin privileges required',
          details: 'User is not an admin by email domain or role assignment' 
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Get the Firecrawl API key from environment variables
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    
    if (!firecrawlApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Firecrawl API key not configured',
          details: 'The FIRECRAWL_API_KEY environment variable is not set'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Parse the request
    const requestData = await req.json() as SearchRequest;
    
    // Validate the request data
    if (!requestData.query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Create a search query record in the database
    const { data: searchQuery, error: queryError } = await supabase
      .from('search_queries')
      .insert({
        query: requestData.query,
        user_id: user.id,
        metadata: {
          limit: requestData.limit || 10,
          lang: requestData.lang || 'en',
          country: requestData.country || 'us',
          tbs: requestData.tbs || '',
          scrapeOptions: requestData.scrapeOptions || { formats: ['markdown'] },
        },
        status: 'processing'
      })
      .select()
      .single();

    if (queryError) {
      console.error('Error creating search query:', queryError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create search query',
          details: queryError.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Call the Firecrawl API
    console.log(`Calling Firecrawl API for query: ${requestData.query.substring(0, 50)}...`);
    const firecrawlResponse = await fetch(FIRECRAWL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firecrawlApiKey}`
      },
      body: JSON.stringify({
        query: requestData.query,
        limit: requestData.limit || 10,
        lang: requestData.lang || 'en',
        country: requestData.country || 'us',
        tbs: requestData.tbs || '',
        scrapeOptions: requestData.scrapeOptions || { formats: ['markdown'] }
      })
    });

    if (!firecrawlResponse.ok) {
      // Try to get error details from response
      let firecrawlError = 'Unknown error';
      try {
        const errorData = await firecrawlResponse.json();
        firecrawlError = JSON.stringify(errorData);
      } catch (e) {
        firecrawlError = `Status ${firecrawlResponse.status}: ${firecrawlResponse.statusText}`;
      }

      // Update the search query status to failed
      await supabase
        .from('search_queries')
        .update({ 
          status: 'failed',
          metadata: { 
            ...searchQuery.metadata,
            error: firecrawlError
          }
        })
        .eq('id', searchQuery.id);

      return new Response(
        JSON.stringify({ 
          error: 'Firecrawl API request failed',
          status: firecrawlResponse.status,
          statusText: firecrawlResponse.statusText,
          details: firecrawlError
        }),
        {
          status: 502, // Bad Gateway
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Parse the Firecrawl API response
    const firecrawlData = await firecrawlResponse.json();
    
    if (!firecrawlData.success || !firecrawlData.data) {
      // Update the search query status to failed
      await supabase
        .from('search_queries')
        .update({ 
          status: 'failed',
          metadata: { 
            ...searchQuery.metadata,
            firecrawlResponse: firecrawlData
          }
        })
        .eq('id', searchQuery.id);

      return new Response(
        JSON.stringify({ 
          error: 'Firecrawl API returned an error', 
          details: firecrawlData 
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Process the search results
    const searchResults = firecrawlData.data as SearchResult[];
    
    // Insert the search results into the database
    const searchResultsToInsert = searchResults.map(result => ({
      query_id: searchQuery.id,
      title: result.title,
      description: result.description,
      url: result.url,
      content: result.markdown || '',
      content_type: 'markdown',
      metadata: {
        links: result.links || [],
        originalMetadata: result.metadata || {},
      }
    }));

    const { error: insertError } = await supabase
      .from('search_results')
      .insert(searchResultsToInsert);

    if (insertError) {
      console.error('Error inserting search results:', insertError);
      
      // Update the search query status to failed
      await supabase
        .from('search_queries')
        .update({ 
          status: 'partial',
          metadata: { 
            ...searchQuery.metadata,
            error: insertError.message
          }
        })
        .eq('id', searchQuery.id);

      return new Response(
        JSON.stringify({ 
          error: 'Failed to store search results',
          details: insertError.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Update the search query status to completed
    await supabase
      .from('search_queries')
      .update({ status: 'completed' })
      .eq('id', searchQuery.id);

    // Return the search results
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Search completed successfully',
        query_id: searchQuery.id,
        results: searchResults
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});