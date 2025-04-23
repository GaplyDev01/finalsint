// @filename: index.ts
import { createClient } from 'npm:@supabase/supabase-js@2.38.5';
import { load } from "npm:cheerio@1.0.0-rc.12";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface CryptoPanicPost {
  id: number;
  title: string;
  published_at: string;
  url: string;
  domain: string;
  currencies: Array<{
    code: string;
    title: string;
    slug: string;
    url: string;
  }>;
  source?: {
    title: string;
    region: string;
    domain: string;
    url?: string;
  };
  metadata?: {
    description?: string;
    image?: string;
  };
  kind?: string;
  created_at: string;
  panic_score?: number;
}

interface CryptoPanicResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CryptoPanicPost[];
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

    // Parse request parameters
    const url = new URL(req.url);
    const cryptoFilters = url.searchParams.get('currencies') || 'BTC,ETH'; // Default to BTC,ETH
    const filter = url.searchParams.get('filter') || 'hot'; // Default to hot posts
    const limit = parseInt(url.searchParams.get('limit') || '10'); // Default to 10 articles
    const kind = url.searchParams.get('kind') || 'news'; // Default to news (not media)
    const regions = url.searchParams.get('regions') || 'en'; // Default to English

    // Create a search query record in the database
    const { data: searchQuery, error: queryError } = await supabase
      .from('search_queries')
      .insert({
        query: `CryptoPanic: ${cryptoFilters} (${filter})`,
        user_id: user.id,
        metadata: {
          source: 'cryptopanic',
          filters: {
            currencies: cryptoFilters,
            filter,
            kind,
            regions
          },
          limit,
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

    // Get the CryptoPanic API key from environment variables
    const cryptopanicApiKey = Deno.env.get('CRYPTOPANIC_API_KEY');
    
    if (!cryptopanicApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'CryptoPanic API key not configured',
          details: 'The CRYPTOPANIC_API_KEY environment variable is not set'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Call CryptoPanic API with the correct endpoints and parameters
    const cryptopanicUrl = `https://cryptopanic.com/api/v1/posts/?auth_token=${cryptopanicApiKey}&public=true&currencies=${cryptoFilters}&filter=${filter}&kind=${kind}&regions=${regions}&metadata=true`;
    
    console.log(`Calling CryptoPanic API: ${cryptopanicUrl.replace(/auth_token=([^&]*)/, 'auth_token=[REDACTED]')}`);
    
    const cryptopanicResponse = await fetch(cryptopanicUrl, {
      headers: {
        'User-Agent': 'Sintillio/1.0 (admin@example.com)'
      }
    });

    if (!cryptopanicResponse.ok) {
      // Try to get error details from response
      let errorMessage = 'Unknown error';
      try {
        const errorData = await cryptopanicResponse.json();
        errorMessage = JSON.stringify(errorData);
      } catch (e) {
        errorMessage = `Status ${cryptopanicResponse.status}: ${cryptopanicResponse.statusText}`;
      }

      // Update the search query status to failed
      await supabase
        .from('search_queries')
        .update({ 
          status: 'failed',
          metadata: { 
            ...searchQuery.metadata,
            error: errorMessage
          }
        })
        .eq('id', searchQuery.id);

      return new Response(
        JSON.stringify({ 
          error: 'CryptoPanic API request failed',
          status: cryptopanicResponse.status,
          statusText: cryptopanicResponse.statusText,
          details: errorMessage
        }),
        {
          status: 502, // Bad Gateway
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const cryptopanicData: CryptoPanicResponse = await cryptopanicResponse.json();
    
    if (!cryptopanicData.results || cryptopanicData.results.length === 0) {
      // Update the search query status to succeeded but empty
      await supabase
        .from('search_queries')
        .update({ 
          status: 'completed',
          metadata: { 
            ...searchQuery.metadata,
            message: 'No results found'
          }
        })
        .eq('id', searchQuery.id);

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'No results found',
          query_id: searchQuery.id
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Initialize embedding model
    const embeddingModel = new Supabase.ai.Session('gte-small');
    const processedPosts = [];

    // Process each post from CryptoPanic
    for (const post of cryptopanicData.results) {
      try {
        console.log(`Processing post: ${post.title}`);
        
        let fullContent = '';
        let markdownContent = '';
        
        // Try to scrape the full article content
        if (post.url && post.source?.url) {
          try {
            // Only try to scrape if we have the original URL (requires approved API access)
            const sourceUrl = post.source.url;
            const response = await fetch(sourceUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; CryptoNewsBot/1.0; +http://example.com)',
              },
              signal: AbortSignal.timeout(10000) // 10 second timeout
            });
            
            if (response.ok) {
              const html = await response.text();
              const $ = load(html);
              
              // Remove script tags, style tags, and other unwanted elements
              $('script, style, nav, footer, header, aside').remove();
              
              // Extract article content (this is a simple extraction and might need refinement)
              let articleText = '';
              $('article, .article, .post, .content, main').each((_, elem) => {
                articleText += $(elem).text().trim() + '\n\n';
              });
              
              // If we couldn't find article content, try getting content from paragraphs
              if (!articleText) {
                $('p').each((_, elem) => {
                  const text = $(elem).text().trim();
                  if (text.length > 100) { // Only include substantial paragraphs
                    articleText += text + '\n\n';
                  }
                });
              }
              
              if (articleText) {
                fullContent = articleText.trim();
                
                // Create a simple markdown version
                markdownContent = `# ${post.title}\n\n`;
                
                if (post.metadata?.description) {
                  markdownContent += `${post.metadata.description}\n\n`;
                }
                
                markdownContent += `## Article Content\n\n${fullContent}\n\n`;
                markdownContent += `Source: [${post.domain}](${sourceUrl})\n`;
                
                if (post.currencies && post.currencies.length > 0) {
                  markdownContent += '\n## Related Cryptocurrencies\n\n';
                  post.currencies.forEach(currency => {
                    markdownContent += `- ${currency.title} (${currency.code})\n`;
                  });
                }
              }
            }
          } catch (scrapeError) {
            console.error('Error scraping article:', scrapeError);
            // If scraping fails, we'll fall back to just the description
          }
        }
        
        // If we couldn't scrape or there was an error, use the description as content
        if (!fullContent && post.metadata?.description) {
          fullContent = post.metadata.description;
          
          // Create a simple markdown version with just the description
          markdownContent = `# ${post.title}\n\n`;
          markdownContent += `${post.metadata.description}\n\n`;
          markdownContent += `Source: [${post.domain}](${post.url})\n`;
          
          if (post.currencies && post.currencies.length > 0) {
            markdownContent += '\n## Related Cryptocurrencies\n\n';
            post.currencies.forEach(currency => {
              markdownContent += `- ${currency.title} (${currency.code})\n`;
            });
          }
        }
        
        // If we still have no content, use the title
        if (!fullContent) {
          fullContent = post.title;
          markdownContent = `# ${post.title}\n\n`;
          markdownContent += `Source: [${post.domain}](${post.url})\n`;
        }
        
        // Generate embedding from title, description and content
        const textToEmbed = `${post.title} ${post.metadata?.description || ''} ${fullContent}`.trim();
        const embedding = await embeddingModel.run(textToEmbed, { 
          mean_pool: true, 
          normalize: true 
        });
        
        // Prepare metadata
        const metadata = {
          source: 'cryptopanic',
          sourceMetadata: {
            domain: post.domain,
            source: post.source,
            currencies: post.currencies,
            kind: post.kind,
            originalId: post.id
          },
          image: post.metadata?.image || null,
          panic_score: post.panic_score || null
        };
        
        // Insert into search_results
        const { data: searchResult, error: insertError } = await supabase
          .from('search_results')
          .insert({
            query_id: searchQuery.id,
            title: post.title,
            description: post.metadata?.description || '',
            url: post.url,
            content: markdownContent || '',
            content_type: 'markdown',
            metadata,
            embedding,
            is_published: true,
            published_at: post.published_at || new Date().toISOString(),
            source: 'cryptopanic'
          })
          .select('id, title')
          .single();

        if (insertError) {
          console.error(`Error inserting search result for "${post.title}":`, insertError);
          continue;
        }
        
        console.log(`Successfully processed post: ${searchResult.title} (ID: ${searchResult.id})`);
        processedPosts.push(searchResult);

      } catch (error) {
        console.error(`Error processing post "${post.title}":`, error);
      }
    }

    // Update the search query status to completed
    await supabase
      .from('search_queries')
      .update({ 
        status: 'completed',
        metadata: {
          ...searchQuery.metadata,
          processed: processedPosts.length,
          total: cryptopanicData.results.length
        }
      })
      .eq('id', searchQuery.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed ${processedPosts.length} out of ${cryptopanicData.results.length} posts`,
        query_id: searchQuery.id,
        processed_posts: processedPosts.map(post => ({ id: post.id, title: post.title }))
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