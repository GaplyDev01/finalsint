# Sintillio - AI-Powered Impact News Platform

Sintillio is an AI-powered news platform designed to deliver personalized news based on impact scoring. The platform integrates with various data sources including crypto news APIs, web search, and Twitter to provide a comprehensive news experience.

## Key Features

- **AI-Powered Impact Scoring**: News articles are scored based on their potential impact on users' interests, careers, and investments
- **Personalized News Feed**: Content is tailored to each user's preferences and interests
- **Admin Dashboard**: Complete admin interface for managing content, users, and system settings
- **Multi-layered Admin Security**: Triple verification system ensures admin privileges are preserved
- **Content Search & Acquisition**: Integrated web search and content scraping capabilities
- **Crypto News Integration**: Direct integration with cryptocurrency news sources
- **Vector Embeddings**: Semantic search and content recommendations using AI embeddings

## Tech Stack

- **Frontend**: React with TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **APIs**: Supabase Edge Functions for secure API integrations
- **AI**: OpenAI embeddings via Supabase AI

## Environment Variables

The following environment variables are required:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
CRYPTOPANIC_API_KEY=your-cryptopanic-api-key
RAPIDAPI_KEY=your-rapidapi-key
FIRECRAWL_API_KEY=your-firecrawl-api-key
```

Store these in:
1. Local development: `.env.local` file (copy from `.env.example`)
2. Production: Netlify environment variables 
3. Supabase Edge Functions: Project Secrets in Supabase dashboard

## Admin Role Management

This project implements multiple layers of admin role verification to ensure admin privileges are preserved:

1. **Email Domain Check**: Users with `@blindvibe.com` email domains automatically receive admin privileges
2. **Role-Based Check**: The `user_roles` table tracks explicit admin role assignments
3. **Profile Flag**: The `profiles.is_admin` flag provides a third verification method

The system includes database triggers and functions to maintain consistency across all three verification methods.

## Database Schema

The key tables in the database schema include:

- `profiles`: User profile information and preferences
- `user_roles`: Role assignments for each user
- `user_preferences`: User preferences for notifications and content
- `user_activity_logs`: Audit trail of user activities
- `api_keys`: Secure storage of external API keys (admin access only)
- `search_queries`: Record of search operations performed
- `search_results`: Content retrieved from searches, with embeddings
- `user_saved_articles`: Bookmarked articles for users

## Edge Functions

The platform includes the following Supabase Edge Functions:

1. `crypto-news-fetcher`: Fetches news from CryptoPanic API
2. `firecrawl-search`: Web search and content scraping
3. `generate-embeddings`: Creates vector embeddings for semantic search
4. `twitter-feed`: Fetches tweets using RapidAPI
5. `verify-admin-roles`: Admin role verification utility

## Getting Started

1. Clone this repository
2. Copy `.env.example` to `.env.local` and fill in your Supabase credentials
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start the development server
5. Visit `http://localhost:5173` to view the application

## Deployment

The application is configured for deployment on Netlify. The Supabase database and edge functions are automatically deployed when changes are pushed to the Supabase project.