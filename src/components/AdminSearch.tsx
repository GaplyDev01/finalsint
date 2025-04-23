import React, { useState, useRef } from 'react';
import { Search, Send, ExternalLink, Download, ArrowDown, File, Globe, Database, AlertCircle, Filter, Calendar, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SearchResult {
  title: string;
  description: string;
  url: string;
  markdown?: string;
  links?: string[];
  metadata?: any;
}

interface AdminSearchProps {
  onResultsChange?: (results: SearchResult[]) => void;
}

const AdminSearch: React.FC<AdminSearchProps> = ({ onResultsChange }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [queryId, setQueryId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [searchOptions, setSearchOptions] = useState({
    limit: 5,
    formats: ['markdown'],
    lang: 'en',
    country: 'us',
    tbs: '', // Time-based search parameter
  });
  
  const formRef = useRef<HTMLFormElement>(null);

  // Available time-based search options
  const timeOptions = [
    { value: '', label: 'Any time' },
    { value: 'qdr:h', label: 'Past hour' },
    { value: 'qdr:d', label: 'Past 24 hours' },
    { value: 'qdr:w', label: 'Past week' },
    { value: 'qdr:m', label: 'Past month' },
    { value: 'qdr:y', label: 'Past year' },
  ];

  const checkAdminStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { isAdmin: false, error: 'No active session' };
      }

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle(); // Changed from .single() to .maybeSingle()

      if (roleError) {
        return { isAdmin: false, error: `Role check error: ${roleError.message}`, details: roleError };
      }

      // roleData will be null if no admin role is found
      return { isAdmin: !!roleData, userId: session.user.id };
    } catch (err: any) {
      return { isAdmin: false, error: `Admin check error: ${err.message}` };
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setResults([]);
      setQueryId(null);
      setDebugInfo(null);
      
      // First, verify admin status
      const adminCheck = await checkAdminStatus();
      setDebugInfo(adminCheck);
      
      if (!adminCheck.isAdmin) {
        throw new Error(`Admin verification failed: ${adminCheck.error || 'Not an admin'}`);
      }
      
      // Get current session for the auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to perform a search');
      }
      
      console.log('Making search request with token:', session.access_token.substring(0, 10) + '...');
      
      // Call our edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/firecrawl-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          query,
          limit: searchOptions.limit,
          lang: searchOptions.lang,
          country: searchOptions.country,
          tbs: searchOptions.tbs,
          scrapeOptions: {
            formats: searchOptions.formats
          }
        })
      });
      
      // Try to parse response regardless of status
      let data;
      try {
        data = await response.json();
      } catch (err) {
        console.error('Failed to parse response JSON:', err);
        data = { error: 'Failed to parse response' };
      }
      
      // Update debug info with response details
      setDebugInfo(prev => ({
        ...prev,
        responseStatus: response.status,
        responseStatusText: response.statusText,
        responseData: data
      }));
      
      if (!response.ok) {
        throw new Error(data.error || `Server responded with ${response.status}: ${response.statusText}`);
      }
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to perform search');
      }
      
      setResults(data.results || []);
      setQueryId(data.query_id || null);
      
      // Call the callback if provided
      if (onResultsChange) {
        onResultsChange(data.results || []);
      }
      
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'An error occurred during search');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleResultExpansion = (url: string) => {
    if (expandedResult === url) {
      setExpandedResult(null);
    } else {
      setExpandedResult(url);
    }
  };
  
  const handleGenerateEmbeddings = async () => {
    if (!queryId) {
      setError("No search query ID found. Please perform a search first.");
      return;
    }
    
    try {
      setGenerating(true);
      setError(null);
      
      // Get current session for the auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to generate embeddings');
      }
      
      // Call our embedding generation edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          queryId: queryId
        })
      });
      
      // Parse the response
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Server responded with ${response.status}: ${response.statusText}`);
      }
      
      // Update the search query status in the UI
      const { error: updateError } = await supabase
        .from('search_queries')
        .update({ status: 'embedded' })
        .eq('id', queryId);
      
      if (updateError) {
        console.warn('Failed to update query status locally:', updateError);
      }
      
      // Show success message
      alert(`Success! Generated embeddings for ${data.processed} out of ${data.total} search results. The articles are now available in the global news feed.`);
      
    } catch (err: any) {
      console.error('Embedding generation error:', err);
      setError(err.message || 'An error occurred during embedding generation');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="glass-card-light rounded-lg overflow-hidden">
      <div className="p-6 border-b border-dark-700">
        <h2 className="text-xl font-semibold text-white mb-4">Web Search & Content Scraper</h2>
        
        <form ref={formRef} onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col space-y-4">
            {/* Main search input */}
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your search query..."
                className="w-full pl-10 pr-14 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-primary-500 focus:border-primary-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-400 hover:text-primary-300 disabled:text-gray-600 transition-colors"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-t-transparent border-primary-500 rounded-full animate-spin"></div>
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            
            {/* Search parameters section - always visible */}
            <div className="bg-dark-800/50 rounded-lg border border-dark-700 p-4">
              <div className="flex items-center mb-3">
                <Filter className="h-4 w-4 text-primary-400 mr-2" />
                <h3 className="text-sm font-medium text-white">Search Parameters</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Result Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Result Limit</label>
                  <select
                    value={searchOptions.limit}
                    onChange={(e) => setSearchOptions({...searchOptions, limit: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value={3}>3 results</option>
                    <option value={5}>5 results</option>
                    <option value={10}>10 results</option>
                    <option value={20}>20 results</option>
                    <option value={30}>30 results</option>
                  </select>
                </div>
                
                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Language</label>
                  <select
                    value={searchOptions.lang}
                    onChange={(e) => setSearchOptions({...searchOptions, lang: e.target.value})}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                    <option value="ja">Japanese</option>
                    <option value="ru">Russian</option>
                    <option value="ar">Arabic</option>
                    <option value="hi">Hindi</option>
                    <option value="pt">Portuguese</option>
                  </select>
                </div>
                
                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Region/Country</label>
                  <select
                    value={searchOptions.country}
                    onChange={(e) => setSearchOptions({...searchOptions, country: e.target.value})}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="us">United States</option>
                    <option value="gb">United Kingdom</option>
                    <option value="ca">Canada</option>
                    <option value="au">Australia</option>
                    <option value="in">India</option>
                    <option value="de">Germany</option>
                    <option value="fr">France</option>
                    <option value="jp">Japan</option>
                    <option value="br">Brazil</option>
                    <option value="mx">Mexico</option>
                    <option value="es">Spain</option>
                    <option value="it">Italy</option>
                  </select>
                </div>
                
                {/* Time-based search */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <Calendar className="h-4 w-4 inline-block mr-1" />
                    Time Period
                  </label>
                  <select
                    value={searchOptions.tbs}
                    onChange={(e) => setSearchOptions({...searchOptions, tbs: e.target.value})}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:ring-primary-500 focus:border-primary-500"
                  >
                    {timeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Content Format Options */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Content Format</label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="format-markdown"
                      checked={searchOptions.formats.includes('markdown')}
                      onChange={(e) => {
                        const updated = e.target.checked 
                          ? [...searchOptions.formats, 'markdown'] 
                          : searchOptions.formats.filter(f => f !== 'markdown');
                        setSearchOptions({...searchOptions, formats: updated});
                      }}
                      className="rounded border-dark-600 text-primary-500 focus:ring-primary-500"
                    />
                    <label htmlFor="format-markdown" className="text-sm text-gray-300">Markdown</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="format-links"
                      checked={searchOptions.formats.includes('links')}
                      onChange={(e) => {
                        const updated = e.target.checked 
                          ? [...searchOptions.formats, 'links'] 
                          : searchOptions.formats.filter(f => f !== 'links');
                        setSearchOptions({...searchOptions, formats: updated});
                      }}
                      className="rounded border-dark-600 text-primary-500 focus:ring-primary-500"
                    />
                    <label htmlFor="format-links" className="text-sm text-gray-300">Extract Links</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="format-html"
                      checked={searchOptions.formats.includes('html')}
                      onChange={(e) => {
                        const updated = e.target.checked 
                          ? [...searchOptions.formats, 'html'] 
                          : searchOptions.formats.filter(f => f !== 'html');
                        setSearchOptions({...searchOptions, formats: updated});
                      }}
                      className="rounded border-dark-600 text-primary-500 focus:ring-primary-500"
                    />
                    <label htmlFor="format-html" className="text-sm text-gray-300">HTML Content</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="format-screenshot"
                      checked={searchOptions.formats.includes('screenshot')}
                      onChange={(e) => {
                        const updated = e.target.checked 
                          ? [...searchOptions.formats, 'screenshot'] 
                          : searchOptions.formats.filter(f => f !== 'screenshot');
                        setSearchOptions({...searchOptions, formats: updated});
                      }}
                      className="rounded border-dark-600 text-primary-500 focus:ring-primary-500"
                    />
                    <label htmlFor="format-screenshot" className="text-sm text-gray-300">Page Screenshot</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
            <div>
              <p className="text-red-400">{error}</p>
              
              {/* Debug information toggle */}
              {debugInfo && (
                <div className="mt-2">
                  <button
                    onClick={() => document.getElementById('debug-info')?.classList.toggle('hidden')}
                    className="text-xs text-gray-400 flex items-center"
                  >
                    <Info className="h-3 w-3 mr-1" />
                    Toggle debug information
                  </button>
                  
                  <pre id="debug-info" className="hidden mt-2 p-2 bg-dark-800 text-xs text-gray-400 rounded-lg overflow-x-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-10 h-10 border-2 border-t-transparent border-primary-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Searching and scraping content...</p>
          </div>
        )}
        
        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Search Results ({results.length})</h3>
              
              {queryId && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleGenerateEmbeddings}
                    disabled={generating}
                    className="flex items-center space-x-1 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-transparent border-primary-400 rounded-full animate-spin mr-2"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4" />
                        <span>Generate Embeddings & Add to News Feed</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className="glass-card border border-dark-600 hover:border-primary-500/30 transition-all duration-200 rounded-lg overflow-hidden"
                >
                  <div className="p-4 cursor-pointer" onClick={() => toggleResultExpansion(result.url)}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-medium mb-1">{result.title || 'Untitled'}</h4>
                        <p className="text-green-400 text-sm mb-2">{result.url}</p>
                        <p className="text-gray-400 text-sm">{result.description || 'No description available'}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <a 
                          href={result.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-primary-400 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button 
                          className="p-2 text-gray-400 hover:text-primary-400 transition-colors"
                        >
                          <ArrowDown className={`h-4 w-4 transition-transform ${expandedResult === result.url ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {expandedResult === result.url && (
                    <div className="border-t border-dark-600 p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-2">
                          <File className="h-4 w-4 text-primary-400" />
                          <h5 className="text-white font-medium">Content Preview</h5>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            className="px-3 py-1 bg-dark-700 text-gray-300 rounded hover:bg-dark-600 transition-colors text-xs"
                            onClick={() => {
                              const blob = new Blob([result.markdown || ''], { type: 'text/markdown' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${result.title || 'content'}.md`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            }}
                          >
                            <Download className="h-3 w-3 inline-block mr-1" />
                            Download Markdown
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-2 bg-dark-800 p-4 rounded-lg max-h-60 overflow-y-auto">
                        <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                          {result.markdown || 'No content available'}
                        </pre>
                      </div>
                      
                      {result.links && result.links.length > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Globe className="h-4 w-4 text-secondary-400" />
                            <h5 className="text-white font-medium">Links ({result.links.length})</h5>
                          </div>
                          
                          <div className="bg-dark-800 p-4 rounded-lg max-h-40 overflow-y-auto">
                            <ul className="space-y-1">
                              {result.links.map((link, i) => (
                                <li key={i} className="text-primary-400 text-sm hover:text-primary-300 truncate">
                                  <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {!loading && results.length === 0 && !error && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Search the web to find and scrape content</p>
            <p className="text-gray-500 text-sm mt-2">Results will be saved for AI processing</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSearch;