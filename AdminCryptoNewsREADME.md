# Environment Variables Setup

To use the CryptoPanic API integration, you'll need to set up environment variables rather than using the API keys table. This approach is more secure and follows best practices.

## Setting Up Environment Variables

### Local Development
1. Create a `.env.local` file in your project root (it's already included in the project)
2. Add the following line:
   ```
   CRYPTOPANIC_API_KEY=your_api_key_here
   ```
3. Replace `your_api_key_here` with your actual CryptoPanic API key

### Netlify Deployment
1. Go to your Netlify site dashboard
2. Navigate to Site Settings > Environment variables
3. Add a new variable:
   - Key: `CRYPTOPANIC_API_KEY`
   - Value: Your actual CryptoPanic API key
4. Save the changes

## Setting Up Supabase Edge Function Environment Variable
1. In your Supabase dashboard, go to Settings > API
2. Scroll down to "Project Secrets"
3. Add a new secret:
   - Name: `CRYPTOPANIC_API_KEY`
   - Value: Your actual CryptoPanic API key
4. Save the changes

This will make your API key available to the edge functions as `Deno.env.get('CRYPTOPANIC_API_KEY')`.

## Getting a CryptoPanic API Key
1. Sign up at [CryptoPanic](https://cryptopanic.com/)
2. Go to [API Documentation](https://cryptopanic.com/developers/api/)
3. Your API key will be displayed on that page once you're logged in