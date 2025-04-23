import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, ArrowRight, Database, Coins, Bitcoin, Check, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import AnimatedElement from '../components/AnimatedElement';

interface FetchState {
  loading: boolean;
  error: string | null;
  success: string | null;
  results: any[] | null;
  lastFetched: string | null;
}

const AdminCryptoNews: React.FC = () => {
  const [fetchState, setFetchState] = useState<FetchState>({
    loading: false,
    error: null,
    success: null,
    results: null,
    lastFetched: null,
  });
  
  const [filters, setFilters] = useState({
    currencies: 'BTC,ETH,SOL,XRP,ADA,DOGE',
    filter: 'hot',
    kind: 'news',
    limit: 10,
    regions: 'en'
  });
  
  const [isApiConfigured, setIsApiConfigured] = useState<boolean>(true); // Assume configured until verified otherwise
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  useEffect(() => {
    // We don't need to check API key anymore as we're using environment variables
    fetchQueryHistory();
  }, []);

  // Fetch history of crypto news queries
  const fetchQueryHistory = async () => {
    try {
      setLoadingHistory(true);
      
      const { data, error } = await supabase
        .from('search_queries')
        .select(`
          id,
          query,
          created_at,
          status,
          metadata,
          search_results(count)
        `)
        .eq('metadata->source', 'cryptopanic')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      setHistory(data || []);
    } catch (err: any) {
      console.error('Error fetching query history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Fetch crypto news from CryptoPanic
  const fetchCryptoNews = async () => {
    try {
      setFetchState({
        loading: true,
        error: null,
        success: null,
        results: null,
        lastFetched: null
      });
      
      // Get current session for the auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to fetch crypto news');
      }

      // Call the crypto-news-fetcher edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crypto-news-fetcher?currencies=${filters.currencies}&filter=${filters.filter}&kind=${filters.kind}&limit=${filters.limit}&regions=${filters.regions}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          }
        }
      );

      // Parse the response
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Server responded with ${response.status}: ${response.statusText}`);
      }
      
      // Update state with successful response
      setFetchState({
        loading: false,
        error: null,
        success: `Successfully fetched ${data.processed_posts?.length || 0} crypto news articles!`,
        results: data.processed_posts || [],
        lastFetched: new Date().toISOString()
      });
      
      // Refresh the query history
      fetchQueryHistory();
    } catch (err: any) {
      console.error('Error fetching crypto news:', err);
      setFetchState({
        ...fetchState,
        loading: false,
        error: err.message || 'An error occurred while fetching crypto news',
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AnimatedElement animation="fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Crypto News Integration</h1>
              <p className="text-gray-400">Fetch the latest cryptocurrency news and add it to your news feed</p>
            </div>
            
            <button
              onClick={fetchQueryHistory}
              disabled={loadingHistory}
              className="btn btn-outline flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loadingHistory ? 'animate-spin' : ''}`} />
              <span>Refresh History</span>
            </button>
          </div>
        </AnimatedElement>

        {!isApiConfigured && (
          <AnimatedElement animation="fade-in-up" delay={100}>
            <div className="glass-card-light p-6 rounded-lg border-2 border-yellow-500/30">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">CryptoPanic API Configuration Required</h3>
                  <p className="text-gray-300 mb-4">
                    The CryptoPanic API key needs to be added to your environment variables. Please add the following to your Netlify environment variables or .env.local file:
                  </p>
                  
                  <div className="bg-dark-800 p-4 rounded-lg mb-4 font-mono text-sm">
                    <code>CRYPTOPANIC_API_KEY=your_api_key_here</code>
                  </div>
                  
                  <p className="text-gray-400 text-sm">
                    You can get a free API key by signing up at{' '}
                    <a 
                      href="https://cryptopanic.com/developers/api/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300"
                    >
                      cryptopanic.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </AnimatedElement>
        )}

        <AnimatedElement animation="fade-in-up" delay={200}>
          <div className="glass-card-light rounded-lg overflow-hidden">
            <div className="p-6 border-b border-dark-700">
              <h2 className="text-xl font-semibold text-white mb-4">Fetch Crypto News</h2>
              
              {fetchState.error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <p className="text-red-400">{fetchState.error}</p>
                </div>
              )}
              
              {fetchState.success && (
                <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <p className="text-green-400">{fetchState.success}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Cryptocurrencies (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={filters.currencies}
                      onChange={(e) => setFilters({...filters, currencies: e.target.value})}
                      placeholder="BTC,ETH,SOL,..."
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use crypto ticker symbols separated by commas (max 50)
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Filter Type
                      </label>
                      <select
                        value={filters.filter}
                        onChange={(e) => setFilters({...filters, filter: e.target.value})}
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-white"
                      >
                        <option value="hot">Hot</option>
                        <option value="rising">Rising</option>
                        <option value="bullish">Bullish</option>
                        <option value="bearish">Bearish</option>
                        <option value="important">Important</option>
                      </select>
                    </div>
                    
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Content Type
                      </label>
                      <select
                        value={filters.kind}
                        onChange={(e) => setFilters({...filters, kind: e.target.value})}
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-white"
                      >
                        <option value="news">News</option>
                        <option value="media">Media</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Number of Articles
                      </label>
                      <select
                        value={filters.limit}
                        onChange={(e) => setFilters({...filters, limit: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-white"
                      >
                        <option value={5}>5 articles</option>
                        <option value={10}>10 articles</option>
                        <option value={15}>15 articles</option>
                        <option value={20}>20 articles</option>
                        <option value={30}>30 articles</option>
                      </select>
                    </div>
                    
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Regions
                      </label>
                      <select
                        value={filters.regions}
                        onChange={(e) => setFilters({...filters, regions: e.target.value})}
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-white"
                      >
                        <option value="en">English</option>
                        <option value="de">German</option>
                        <option value="nl">Dutch</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="it">Italian</option>
                        <option value="pt">Portuguese</option>
                        <option value="ru">Russian</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-6">
                    <button
                      onClick={fetchCryptoNews}
                      disabled={fetchState.loading}
                      className="btn btn-primary px-6 py-2 flex items-center space-x-2"
                    >
                      {fetchState.loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Fetching...</span>
                        </>
                      ) : (
                        <>
                          <Bitcoin className="h-5 w-5" />
                          <span>Fetch Crypto News</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-medium text-white mb-4">Recent Fetches</h3>
              
              {loadingHistory ? (
                <div className="flex justify-center py-4">
                  <div className="w-8 h-8 border-t-2 border-primary-500 border-solid rounded-full animate-spin"></div>
                </div>
              ) : history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-dark-700">
                    <thead>
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Query</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Results</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-dark-800 divide-y divide-dark-700">
                      {history.map((item) => (
                        <tr key={item.id} className="hover:bg-dark-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Coins className="h-4 w-4 text-primary-400 mr-2" />
                              <span className="text-sm font-medium text-white">{item.query}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {formatDate(item.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              item.status === 'completed' 
                                ? 'bg-green-500/20 text-green-400' 
                                : item.status === 'processing' 
                                  ? 'bg-primary-500/20 text-primary-400'
                                  : 'bg-red-500/20 text-red-400'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {item.search_results[0].count} articles
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center space-x-2">
                              <a 
                                href={`/dashboard`}
                                className="text-primary-400 hover:text-primary-300 flex items-center"
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                <span>View in Feed</span>
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Coins className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No crypto news fetches yet</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Use the form above to fetch cryptocurrency news
                  </p>
                </div>
              )}
            </div>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fade-in-up" delay={300}>
          <div className="glass-card-light p-6 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="h-5 w-5 text-primary-400" />
              <h3 className="text-lg font-semibold text-white">How It Works</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-dark-800/50 p-4 rounded-lg border border-dark-700">
                <h4 className="font-medium text-white mb-2">1. Environment Variables</h4>
                <p className="text-gray-400 text-sm">
                  This tool uses the CRYPTOPANIC_API_KEY environment variable to securely store your API key.
                  The key is stored in your Netlify environment variables or .env.local file.
                </p>
              </div>
              
              <div className="bg-dark-800/50 p-4 rounded-lg border border-dark-700">
                <h4 className="font-medium text-white mb-2">2. Fetch News from CryptoPanic</h4>
                <p className="text-gray-400 text-sm">
                  The system connects to CryptoPanic's API to retrieve the latest cryptocurrency news articles
                  based on your selected filters.
                </p>
              </div>
              
              <div className="bg-dark-800/50 p-4 rounded-lg border border-dark-700">
                <h4 className="font-medium text-white mb-2">3. Scrape Full Content</h4>
                <p className="text-gray-400 text-sm">
                  For each article, the system attempts to scrape the full content from the original source website
                  to provide more comprehensive information.
                </p>
              </div>
              
              <div className="bg-dark-800/50 p-4 rounded-lg border border-dark-700">
                <h4 className="font-medium text-white mb-2">4. Generate Embeddings</h4>
                <p className="text-gray-400 text-sm">
                  The content is automatically vectorized using AI embeddings, enabling semantic search
                  and relevance scoring for each article.
                </p>
              </div>
              
              <div className="bg-dark-800/50 p-4 rounded-lg border border-dark-700">
                <h4 className="font-medium text-white mb-2">5. Add to News Feed</h4>
                <p className="text-gray-400 text-sm">
                  Articles are immediately published to your platform's global news feed, making them
                  available to all users.
                </p>
              </div>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </AdminLayout>
  );
};

export default AdminCryptoNews;