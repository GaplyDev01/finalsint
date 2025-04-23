import React, { useEffect, useState } from 'react';
import { Clock, ExternalLink, Bookmark, FileText, Share2, ThumbsUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  content: string;
  published_at: string;
  metadata: any;
}

interface NewsFeedProps {
  limit?: number;
  className?: string;
  showSaveOption?: boolean;
}

const NewsFeed: React.FC<NewsFeedProps> = ({ limit = 10, className = '', showSaveOption = true }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchNewsFeed();
  }, [limit]);

  const fetchNewsFeed = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch published articles from search_results table
      const { data, error } = await supabase
        .from('search_results')
        .select('id, title, description, url, content, published_at, metadata')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Get user's saved articles if authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: savedData, error: savedError } = await supabase
          .from('user_saved_articles')
          .select('article_id')
          .eq('user_id', session.user.id);
          
        if (!savedError && savedData) {
          const saved = new Set(savedData.map(item => item.article_id));
          setSavedArticles(saved);
        }
      }

      setArticles(data || []);
    } catch (err: any) {
      console.error('Error fetching news feed:', err);
      setError(err.message || 'Failed to load news feed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveArticle = async (articleId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        alert('You must be logged in to save articles');
        return;
      }
      
      const isSaved = savedArticles.has(articleId);
      
      if (isSaved) {
        // Remove from saved articles
        const { error } = await supabase
          .from('user_saved_articles')
          .delete()
          .eq('user_id', session.user.id)
          .eq('article_id', articleId);
          
        if (error) throw error;
        
        // Update local state
        const newSaved = new Set(savedArticles);
        newSaved.delete(articleId);
        setSavedArticles(newSaved);
      } else {
        // Add to saved articles
        const { error } = await supabase
          .from('user_saved_articles')
          .insert({
            user_id: session.user.id,
            article_id: articleId,
            saved_at: new Date().toISOString()
          });
          
        if (error) throw error;
        
        // Update local state
        const newSaved = new Set(savedArticles);
        newSaved.add(articleId);
        setSavedArticles(newSaved);
        
        // Log activity
        await supabase
          .from('user_activity_logs')
          .insert({
            user_id: session.user.id,
            action: 'article_saved',
            reference_id: articleId
          });
      }
    } catch (err: any) {
      console.error('Error saving article:', err);
      alert('Failed to save article: ' + err.message);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    // Get time since 
    const timeSince = getTimeSince(date);
    
    return timeSince;
  };

  // Helper to get time since a date
  const getTimeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000; // seconds in a year
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000; // seconds in a month
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400; // seconds in a day
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600; // seconds in an hour
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60; // seconds in a minute
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return Math.floor(seconds) + " seconds ago";
  };

  if (loading) {
    return (
      <div className={`${className} glass-card-light rounded-lg p-6`}>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-t-2 border-primary-500 border-solid rounded-full animate-spin"></div>
        </div>
        <p className="text-center text-gray-400 mt-2">Loading news feed...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} glass-card-light rounded-lg p-6`}>
        <p className="text-center text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className={`${className} glass-card-light rounded-lg overflow-hidden`}>
      <div className="p-6 border-b border-dark-700">
        <h2 className="text-xl font-semibold text-white">Latest News</h2>
      </div>
      
      <div className="divide-y divide-dark-700">
        {articles.length > 0 ? (
          articles.map((article, index) => (
            <div key={article.id} className="p-6 hover:bg-dark-800/50 transition-colors">
              <h3 className="text-lg font-medium text-white mb-2">
                {article.title}
              </h3>
              <p className="text-gray-400 mb-3 line-clamp-2">
                {article.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{formatDate(article.published_at)}</span>
                </div>
                <div className="flex space-x-2">
                  {showSaveOption && (
                    <button 
                      onClick={() => handleSaveArticle(article.id)}
                      className={`p-1.5 rounded-full ${
                        savedArticles.has(article.id)
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'text-gray-400 hover:text-primary-400 hover:bg-dark-700'
                      } transition-colors`}
                    >
                      <Bookmark className="h-4 w-4" />
                    </button>
                  )}
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-full text-gray-400 hover:text-primary-400 hover:bg-dark-700 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button className="p-1.5 rounded-full text-gray-400 hover:text-primary-400 hover:bg-dark-700 transition-colors">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center">
            <FileText className="h-10 w-10 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400">No articles found</p>
            <p className="text-gray-500 text-sm">Check back later for updates</p>
          </div>
        )}
      </div>
      
      {articles.length > 0 && (
        <div className="p-4 border-t border-dark-700 flex justify-center">
          <button className="text-primary-400 hover:text-primary-300 text-sm font-medium">
            View More
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsFeed;