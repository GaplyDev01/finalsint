import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Filter, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../components/DashboardLayout';
import NewsFeed from '../components/NewsFeed';
import AnimatedElement from '../components/AnimatedElement';

interface CategoryFilter {
  name: string;
  value: string;
  selected: boolean;
  color: string;
}

interface SortOption {
  name: string;
  value: string;
}

const NewsFeedPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalArticles, setTotalArticles] = useState(0);
  const [feedContent, setFeedContent] = useState<any[]>([]);
  
  // Filter and sort options
  const [categories, setCategories] = useState<CategoryFilter[]>([
    { name: 'Technology', value: 'technology', selected: true, color: 'bg-primary-500/20 text-primary-400' },
    { name: 'Finance', value: 'finance', selected: true, color: 'bg-secondary-500/20 text-secondary-400' },
    { name: 'Blockchain', value: 'blockchain', selected: true, color: 'bg-accent-500/20 text-accent-400' },
    { name: 'Crypto', value: 'crypto', selected: true, color: 'bg-red-500/20 text-red-400' },
    { name: 'Markets', value: 'markets', selected: true, color: 'bg-purple-500/20 text-purple-400' },
    { name: 'Business', value: 'business', selected: true, color: 'bg-green-500/20 text-green-400' },
  ]);
  
  const [sortOptions] = useState<SortOption[]>([
    { name: 'Latest', value: 'latest' },
    { name: 'Impact Score', value: 'impact' },
    { name: 'Trending', value: 'trending' },
  ]);
  
  const [selectedSortOption, setSelectedSortOption] = useState('latest');
  
  useEffect(() => {
    fetchArticleCount();
  }, []);
  
  const fetchArticleCount = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch count of published articles
      const { count, error } = await supabase
        .from('search_results')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);
      
      if (error) throw error;
      
      setTotalArticles(count || 0);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching article count:', err);
      setError(err.message);
      setLoading(false);
    }
  };
  
  const toggleCategory = (categoryValue: string) => {
    setCategories(categories.map(cat => 
      cat.value === categoryValue ? { ...cat, selected: !cat.selected } : cat
    ));
  };
  
  const handleRefresh = () => {
    fetchArticleCount();
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AnimatedElement animation="fade-in-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">News Feed</h1>
              <p className="text-gray-400">
                {totalArticles} articles curated for your interests
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleRefresh} 
                className="p-2 text-gray-400 hover:text-primary-400 transition-colors rounded-full hover:bg-dark-700"
                title="Refresh feed"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search articles..."
                    className="pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-white w-full md:w-64"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedElement>
        
        <AnimatedElement animation="fade-in-up" delay={100}>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button 
                  key={category.value}
                  onClick={() => toggleCategory(category.value)}
                  className={`px-3 py-1 rounded-full transition-colors flex items-center ${
                    category.selected ? category.color : 'bg-dark-700 text-gray-400'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-400 mr-2">Sort by:</span>
              <select
                value={selectedSortOption}
                onChange={e => setSelectedSortOption(e.target.value)}
                className="bg-dark-700 border border-dark-600 rounded-lg text-white px-3 py-1 focus:ring-primary-500 focus:border-primary-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </AnimatedElement>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main articles feed - 8 columns on large screens */}
          <div className="lg:col-span-8">
            <AnimatedElement animation="fade-in-up" delay={150}>
              <NewsFeed className="mb-6" limit={6} showSaveOption={true} />
            </AnimatedElement>
            
            {/* RSS Widget - Wall */}
            <AnimatedElement animation="fade-in-up" delay={200}>
              <div className="glass-card-light p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Latest News From Partners</h2>
                <div className="rss-wall-container">
                  <rssapp-wall id="_LGUsXhQQjR11Xad5"></rssapp-wall>
                </div>
              </div>
            </AnimatedElement>
          </div>
          
          {/* Sidebar content - 4 columns on large screens */}
          <div className="lg:col-span-4">
            <AnimatedElement animation="fade-in-up" delay={200}>
              {/* Featured Articles */}
              <div className="glass-card-light rounded-lg overflow-hidden mb-6">
                <div className="p-4 border-b border-dark-700">
                  <h3 className="font-medium text-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary-400" />
                    Featured Articles
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start">
                      <div className="w-12 h-12 rounded-lg bg-dark-700 flex items-center justify-center text-primary-400 mr-3 flex-shrink-0">
                        {i}
                      </div>
                      <div>
                        <h4 className="font-medium text-white text-sm">
                          {i === 1 ? "The Future of Blockchain Technology in Finance" :
                           i === 2 ? "Understanding Cryptocurrency Market Trends" :
                           "AI Integration Boosts Financial Tech Products"}
                        </h4>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {i === 1 ? "2 hours ago" :
                           i === 2 ? "5 hours ago" :
                           "Yesterday"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedElement>
            
            <AnimatedElement animation="fade-in-up" delay={250}>
              {/* RSS Widget - Imageboard */}
              <div className="glass-card-light p-4 rounded-lg mb-6">
                <h3 className="font-medium text-white mb-3">Visual News Updates</h3>
                <div className="rss-imageboard-container">
                  <rssapp-imageboard id="42FcfdlCLvy0JfS0"></rssapp-imageboard>
                </div>
              </div>
            </AnimatedElement>
          </div>
        </div>
        
        {/* CoinGecko Price Widget */}
        <AnimatedElement animation="fade-in-up" delay={300}>
          <div className="glass-card-light p-4 rounded-lg">
            <h3 className="font-medium text-white mb-3">Cryptocurrency Market Snapshot</h3>
            <div className="coingecko-widget-container">
              <gecko-coin-price-marquee-widget locale="en" dark-mode="true" outlined="true" coin-ids="bitcoin,ethereum,ripple,cardano,solana,polkadot,matic-network,dogecoin" initial-currency="usd"></gecko-coin-price-marquee-widget>
            </div>
          </div>
        </AnimatedElement>
      </div>

      {/* Load the external scripts */}
      <script src="https://widget.rss.app/v1/wall.js" type="text/javascript" async></script>
      <script src="https://widget.rss.app/v1/imageboard.js" type="text/javascript" async></script>
      <script src="https://widgets.coingecko.com/gecko-coin-price-marquee-widget.js"></script>
    </DashboardLayout>
  );
};

export default NewsFeedPage;