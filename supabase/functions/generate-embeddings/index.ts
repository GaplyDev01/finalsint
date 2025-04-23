// @filename: index.ts
import { createClient } from 'npm:@supabase/supabase-js@2.38.5';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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

    // Check if user is an admin (either by email domain or role)
    const isDirectAdmin = user.email && user.email.endsWith('@blindvibe.com');
    let isRoleAdmin = false;

    if (!isDirectAdmin) {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError) {
        return new Response(
          JSON.stringify({ 
            error: 'Role verification failed', 
            details: roleError.message 
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      isRoleAdmin = !!roleData;
    }

    // Verify admin status
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

    // Parse the request body to get the query ID
    const requestData = await req.json();
    if (!requestData.queryId) {
      return new Response(
        JSON.stringify({ error: 'Query ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const queryId = requestData.queryId;
    
    // Get the search results for this query
    const { data: searchResults, error: resultsError } = await supabase
      .from('search_results')
      .select('id, title, description, content, url, content_type')
      .eq('query_id', queryId)
      .is('embedding', null); // Only select results without embeddings

    if (resultsError) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch search results', 
          details: resultsError.message 
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (!searchResults || searchResults.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'No search results found without embeddings',
          processed: 0
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Initialize embedding model
    console.log('Initializing embedding model...');
    const model = new Supabase.ai.Session('gte-small');
    let processedCount = 0;

    // Process each result and generate embeddings
    for (const result of searchResults) {
      try {
        console.log(`Processing result: ${result.id}`);
        // Combine title, description and content for a complete embedding
        const textToEmbed = `${result.title} ${result.description || ''} ${result.content || ''}`.trim();
        
        if (!textToEmbed) {
          console.warn(`Empty text to embed for result ${result.id}, skipping`);
          continue;
        }
        
        console.log(`Generating embedding for result ${result.id}`);
        // Generate embedding
        const embedding = await model.run(textToEmbed, { 
          mean_pool: true, 
          normalize: true 
        });

        console.log(`Updating search result ${result.id} with embedding`);
        // Update the search result with the embedding
        const { error: updateError } = await supabase
          .from('search_results')
          .update({ 
            embedding,
            // Also add the content to the global news feed
            is_published: true,
            published_at: new Date().toISOString()
          })
          .eq('id', result.id);

        if (updateError) {
          console.error(`Error updating embedding for result ${result.id}:`, updateError);
          continue;
        }

        processedCount++;
        console.log(`Successfully processed result ${result.id}`);
      } catch (error) {
        console.error(`Error generating embedding for result ${result.id}:`, error);
      }
    }

    // Update the search query status
    console.log(`Updating search query ${queryId} status to embedded`);
    const { error: updateQueryError } = await supabase
      .from('search_queries')
      .update({ status: 'embedded' })
      .eq('id', queryId);
      
    if (updateQueryError) {
      console.error(`Error updating search query status: ${updateQueryError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Embeddings generated successfully',
        processed: processedCount,
        total: searchResults.length
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