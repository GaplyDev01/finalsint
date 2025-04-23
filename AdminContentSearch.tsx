import React, { useState } from 'react';
import { Search, Database, RefreshCw, AlertTriangle, Key } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import AdminSearch from '../components/AdminSearch';
import APIKeyManager from '../components/APIKeyManager';
import AnimatedElement from '../components/AnimatedElement';

interface SearchHistory {
  id: string;
  query: string;
  created_at: string;
  status: string;
  result_count: number;
}

const AdminContentSearch: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'history' | 'vectors' | 'api-keys'>('search');

  // Fetch search history
  const fetchSearchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('search_queries')
        .select(`
          id,
          query,
          created_at,
          status,
          search_results(count)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (fetchError) throw fetchError;
      
      // Transform data for display
      const formattedHistory: SearchHistory[] = data.map(item => ({
        id: item.id,
        query: item.query,
        created_at: item.created_at,
        status: item.status,
        result_count: item.search_results[0].count
      }));
      
      setSearchHistory(formattedHistory);
    } catch (err: any) {
      console.error('Error fetching search history:', err);
      setError(err.message || 'Failed to load search history');
    } finally {
      setLoading(false);
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
              <h1 className="text-2xl font-bold text-white">Content Search & Acquisition</h1>
              <p className="text-gray-400">Search the web, scrape content, and generate embeddings for AI analysis</p>
            </div>
            
            <button
              onClick={fetchSearchHistory}
              disabled={loading}
              className="flex items-center space-x-2 btn btn-outline"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh Data</span>
            </button>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fade-in-up" delay={100}>
          <div className="glass-card-light rounded-lg">
            <div className="border-b border-dark-700">
              <div className="flex flex-wrap">
                <button
                  className={`px-6 py-4 font-medium transition-colors ${
                    activeTab === 'search' 
                      ? 'text-white border-b-2 border-primary-500' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('search')}
                >
                  <Search className="h-4 w-4 inline-block mr-2" />
                  Web Search
                </button>
                
                <button
                  className={`px-6 py-4 font-medium transition-colors ${
                    activeTab === 'history' 
                      ? 'text-white border-b-2 border-primary-500' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => {
                    setActiveTab('history');
                    fetchSearchHistory();
                  }}
                >
                  <RefreshCw className="h-4 w-4 inline-block mr-2" />
                  Search History
                </button>
                
                <button
                  className={`px-6 py-4 font-medium transition-colors ${
                    activeTab === 'vectors' 
                      ? 'text-white border-b-2 border-primary-500' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('vectors')}
                >
                  <Database className="h-4 w-4 inline-block mr-2" />
                  Vector Management
                </button>

                <button
                  className={`px-6 py-4 font-medium transition-colors ${
                    activeTab === 'api-keys' 
                      ? 'text-white border-b-2 border-primary-500' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('api-keys')}
                >
                  <Key className="h-4 w-4 inline-block mr-2" />
                  API Keys
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {activeTab === 'search' && (
                <AdminSearch />
              )}
              
              {activeTab === 'history' && (
                <div>
                  {error && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                      <p className="text-red-400">{error}</p>
                    </div>
                  )}
                  
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-t-2 border-primary-500 border-solid rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <>
                      {searchHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-dark-700">
                            <thead className="bg-dark-800">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Query</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Results</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-dark-800 divide-y divide-dark-700">
                              {searchHistory.map((item) => (
                                <tr key={item.id} className="hover:bg-dark-700/50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-white truncate max-w-xs">{item.query}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-400">{formatDate(item.created_at)}</div>
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
                                    {item.result_count} results
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button className="text-primary-400 hover:text-primary-300">
                                      View Details
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400">No search history found</p>
                          <p className="text-gray-500 text-sm mt-2">Perform a search to see results here</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              
              {activeTab === 'vectors' && (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Vector Management</p>
                  <p className="text-gray-500 text-sm mt-2">This feature is coming soon</p>
                </div>
              )}

              {activeTab === 'api-keys' && (
                <APIKeyManager onUpdate={fetchSearchHistory} />
              )}
            </div>
          </div>
        </AnimatedElement>
      </div>
    </AdminLayout>
  );
};

export default AdminContentSearch;