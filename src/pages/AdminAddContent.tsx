import React, { useState } from 'react';
import { Search, Newspaper, AlertCircle, CheckCircle, ArrowRight, Bitcoin, Database, RefreshCw, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import AnimatedElement from '../components/AnimatedElement';

const AdminAddContent: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  
  // Web search form state
  const [query, setQuery] = useState('');
  const [searchLimit, setSearchLimit] = useState(5);
  
  // Crypto news form state
  const [currencies, setCurrencies] = useState('BTC,ETH,SOL,XRP,ADA,DOGE');
  const [filter, setFilter] = useState('hot');
  const [cryptoLimit, setCryptoLimit] = useState(10);
  
  // Handle web search submission
  const handleWebSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setResults([]);
      
      // Get current session for the auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to perform a search');
      }
      
      // Call the firecrawl-search edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/firecrawl-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          query,
          limit: searchLimit,
          scrapeOptions: {
            formats: ['markdown']
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to perform search');
      }
      
      setResults(data.results || []);
      setSuccess(`Successfully fetched ${data.results?.length || 0} articles. Articles are being processed and will appear in the news feed shortly.`);
      
      // Generate embeddings for the search results
      if (data.query_id) {
        try {
          const embeddingResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-embeddings`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              queryId: data.query_id
            })
          });
          
          const embeddingData = await embeddingResponse.json();
          
          if (embeddingResponse.ok && embeddingData.success) {
            setSuccess(`Articles fetched and embeddings generated successfully! ${embeddingData.processed} out of ${embeddingData.total} articles are now published to the news feed.`);
          } else {
            console.error('Embedding generation response:', embeddingData);
            setSuccess(`Articles fetched, but there was an issue generating embeddings: ${embeddingData.error || 'Unknown error'}`);
          }
        } catch (embeddingError: any) {
          console.error('Error generating embeddings:', embeddingError);
          setSuccess(`Articles fetched, but there was an issue generating embeddings: ${embeddingError.message}`);
        }
      }
      
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'An error occurred during search');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle crypto news fetch
  const handleCryptoFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setResults([]);
      
      // Get current session for the auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to fetch crypto news');
      }
      
      // Call the crypto-news-fetcher edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crypto-news-fetcher?currencies=${currencies}&filter=${filter}&limit=${cryptoLimit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch crypto news');
      }
      
      setResults(data.processed_posts || []);
      setSuccess(`Successfully fetched ${data.processed_posts?.length || 0} crypto news articles! Articles are now published to the news feed.`);
      
    } catch (err: any) {
      console.error('Crypto news fetch error:', err);
      setError(err.message || 'An error occurred while fetching crypto news');
    } finally {
      setLoading(false);
    }
  };

  // Check news feed for published articles
  const checkNewsFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error, count } = await supabase
        .from('search_results')
        .select('id, title, description, url, created_at, is_published', { count: 'exact' })
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      setSuccess(`Found ${count} published articles in the news feed. The most recent ${data.length} are shown below.`);
      setResults(data || []);
      
    } catch (err: any) {
      console.error('Error checking news feed:', err);
      setError(err.message || 'An error occurred checking the news feed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AnimatedElement animation="fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Add Content to News Feed</h1>
              <p className="text-gray-400">Use this utility to populate your news feed with real articles</p>
            </div>
          </div>
        </AnimatedElement>

        {error && (
          <AnimatedElement animation="fade-in-up" delay={100}>
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
              <p className="text-red-400">{error}</p>
            </div>
          </AnimatedElement>
        )}
        
        {success && (
          <AnimatedElement animation="fade-in-up" delay={100}>
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <p className="text-green-400">{success}</p>
            </div>
          </AnimatedElement>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatedElement animation="fade-in-up" delay={200}>
            <div className="glass-card-light rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Search className="h-5 w-5 text-primary-400" />
                <h2 className="text-lg font-semibold text-white">Web Search</h2>
              </div>
              
              <form onSubmit={handleWebSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Search Query
                  </label>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter search terms (e.g., 'cryptocurrency news')"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Number of Articles
                  </label>
                  <select
                    value={searchLimit}
                    onChange={(e) => setSearchLimit(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-white"
                  >
                    <option value={3}>3 articles</option>
                    <option value={5}>5 articles</option>
                    <option value={10}>10 articles</option>
                    <option value={15}>15 articles</option>
                  </select>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="w-full btn btn-primary flex justify-center items-center"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5 mr-2" />
                        <span>Search and Add to News Feed</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </AnimatedElement>
          
          <AnimatedElement animation="fade-in-up" delay={300}>
            <div className="glass-card-light rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Bitcoin className="h-5 w-5 text-primary-400" />
                <h2 className="text-lg font-semibold text-white">Crypto News</h2>
              </div>
              
              <form onSubmit={handleCryptoFetch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Cryptocurrencies (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={currencies}
                    onChange={(e) => setCurrencies(e.target.value)}
                    placeholder="BTC,ETH,SOL,..."
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-white"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Filter
                    </label>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-white"
                    >
                      <option value="hot">Hot</option>
                      <option value="rising">Rising</option>
                      <option value="bullish">Bullish</option>
                      <option value="bearish">Bearish</option>
                      <option value="important">Important</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Number of Articles
                    </label>
                    <select
                      value={cryptoLimit}
                      onChange={(e) => setCryptoLimit(parseInt(e.target.value))}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-white"
                    >
                      <option value={5}>5 articles</option>
                      <option value={10}>10 articles</option>
                      <option value={15}>15 articles</option>
                      <option value={20}>20 articles</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn btn-primary flex justify-center items-center"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span>Fetching...</span>
                      </>
                    ) : (
                      <>
                        <Bitcoin className="h-5 w-5 mr-2" />
                        <span>Fetch Crypto News</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </AnimatedElement>
        </div>
        
        <AnimatedElement animation="fade-in-up" delay={400}>
          <div className="glass-card-light rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Newspaper className="h-5 w-5 text-primary-400" />
                <h2 className="text-lg font-semibold text-white">Current News Feed</h2>
              </div>
              
              <button
                onClick={checkNewsFeed}
                disabled={loading}
                className="px-4 py-2 bg-dark-700 text-gray-300 rounded-lg flex items-center space-x-2 hover:bg-dark-600 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Check News Feed</span>
              </button>
            </div>
            
            {loading && results.length === 0 ? (
              <div className="flex justify-center py-6">
                <div className="w-8 h-8 border-t-2 border-primary-500 border-solid rounded-full animate-spin"></div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="p-4 border border-dark-600 rounded-lg hover:border-primary-500/30 transition-all">
                    <h3 className="text-white font-medium mb-1">{result.title}</h3>
                    <p className="text-gray-400 text-sm mb-2">{result.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {new Date(result.created_at).toLocaleString()}
                      </div>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-400 hover:text-primary-300 flex items-center text-sm"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Source
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400">No articles found. Use the tools above to add content to your news feed.</p>
              </div>
            )}
            
            <div className="mt-6 p-4 bg-dark-800 rounded-lg">
              <h3 className="text-white font-medium mb-2">Add Articles to News Feed</h3>
              <p className="text-gray-400 text-sm">
                Use the tools above to add articles to your news feed. When articles are successfully fetched, they are
                automatically marked as published and will appear in the news feed. The process has two steps:
              </p>
              <ol className="mt-2 space-y-1 text-sm text-gray-400 list-decimal list-inside">
                <li>Fetch articles using Web Search or Crypto News</li>
                <li>Articles are then processed and added to the news feed</li>
              </ol>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </AdminLayout>
  );
};

export default AdminAddContent;