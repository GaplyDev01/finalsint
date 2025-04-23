// @filename: index.ts

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

    // Parse the request parameters
    const url = new URL(req.url);
    const listId = url.searchParams.get('listId') || '78468360'; // Default list ID
    const limit = parseInt(url.searchParams.get('limit') || '5'); // Default to 5 tweets

    // Get the RapidAPI key from environment variables
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    
    if (!rapidApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'RapidAPI key not configured',
          details: 'The RAPIDAPI_KEY environment variable is not set'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Call the Twitter RapidAPI endpoint
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'twitter241.p.rapidapi.com',
        'x-rapidapi-key': rapidApiKey
      }
    };

    // Make the API request
    console.log(`Fetching Twitter list timeline with list ID: ${listId}, limit: ${limit}`);
    
    const response = await fetch(`https://twitter241.p.rapidapi.com/list-timeline?listId=${listId}`, options);
    
    if (!response.ok) {
      // Handle error response
      let errorMessage = 'Unknown error';
      try {
        const errorData = await response.json();
        errorMessage = JSON.stringify(errorData);
      } catch (e) {
        errorMessage = `Status ${response.status}: ${response.statusText}`;
      }

      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Twitter API request failed: ${errorMessage}`
        }),
        {
          status: 502, // Bad Gateway
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Parse the Twitter API response
    const twitterData = await response.json();
    
    // Process and format the tweets for our frontend
    const processedTweets = twitterData.data ? twitterData.data.slice(0, limit).map((tweet: any) => {
      return {
        id: tweet.id_str,
        text: tweet.full_text || tweet.text,
        created_at: new Date(tweet.created_at).toISOString(),
        user: {
          name: tweet.user.name,
          screen_name: tweet.user.screen_name,
          profile_image_url_https: tweet.user.profile_image_url_https,
          verified: tweet.user.verified
        },
        metrics: {
          retweet_count: tweet.retweet_count,
          favorite_count: tweet.favorite_count,
          reply_count: tweet.reply_count || 0
        },
        entities: tweet.entities
      };
    }) : [];

    return new Response(
      JSON.stringify({
        success: true,
        tweets: processedTweets
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
        success: false,
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