import React, { useState, useEffect } from 'react';
import { RefreshCw, Twitter, ExternalLink, Clock, MessageCircle, Heart, Repeat } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { supabase } from '../lib/supabase';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  user: {
    name: string;
    screen_name: string;
    profile_image_url_https: string;
    verified: boolean;
  };
  metrics?: {
    retweet_count: number;
    favorite_count: number;
    reply_count: number;
  };
  entities?: {
    urls: Array<{
      url: string;
      expanded_url: string;
      display_url: string;
    }>;
    media?: Array<{
      media_url_https: string;
      type: string;
    }>;
  };
}

interface TwitterFeedProps {
  listId?: string;
  limit?: number;
  className?: string;
}

const TwitterFeed: React.FC<TwitterFeedProps> = ({
  listId = '78468360',
  limit = 5,
  className = ''
}) => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTweets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }
      
      // Call our Twitter feed edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/twitter-feed?listId=${listId}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Twitter API failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.tweets) {
        setTweets(data.tweets);
      } else {
        throw new Error(data.error || 'Failed to fetch tweets');
      }
      
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Error fetching tweets:', err);
      setError(err.message || 'Failed to load tweets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchTweets, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [listId, limit]);

  // Format the date to display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    }
    if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m`;
    }
    if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h`;
    }
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };
  
  // Parse tweet text to make links clickable
  const parseTweetText = (text: string) => {
    // Replace URLs with clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let formattedText = text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary-400 hover:underline">${url}</a>`;
    });
    
    // Replace hashtags with clickable links
    const hashtagRegex = /(#\w+)/g;
    formattedText = formattedText.replace(hashtagRegex, (hashtag) => {
      return `<span class="text-primary-400 hover:underline cursor-pointer">${hashtag}</span>`;
    });
    
    // Replace mentions with clickable links
    const mentionRegex = /(@\w+)/g;
    formattedText = formattedText.replace(mentionRegex, (mention) => {
      return `<span class="text-primary-400 hover:underline cursor-pointer">${mention}</span>`;
    });
    
    return formattedText;
  };

  return (
    <div className={`glass-card-light rounded-lg ${className}`}>
      <div className="p-4 border-b border-dark-700 flex justify-between items-center">
        <div className="flex items-center">
          <Twitter className="h-5 w-5 text-primary-400 mr-2" />
          <h3 className="text-white font-medium">Crypto Twitter</h3>
        </div>
        <button 
          onClick={fetchTweets} 
          className="text-gray-400 hover:text-primary-400 transition-colors"
          title="Refresh tweets"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="p-0">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-t-2 border-primary-500 border-solid rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-400">Loading tweets...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-400">{error}</div>
        ) : tweets.length === 0 ? (
          <div className="p-4 text-center text-gray-400">No tweets found</div>
        ) : (
          <>
            <Swiper
              modules={[Pagination, Autoplay]}
              spaceBetween={0}
              slidesPerView={1}
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              className="tweets-carousel"
            >
              {tweets.map((tweet) => (
                <SwiperSlide key={tweet.id}>
                  <div className="p-4 border-b border-dark-700">
                    <div className="flex items-start mb-3">
                      <img 
                        src={tweet.user.profile_image_url_https} 
                        alt={tweet.user.name}
                        className="w-10 h-10 rounded-full mr-3 border border-dark-600"
                      />
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-white">{tweet.user.name}</span>
                          {tweet.user.verified && (
                            <span className="ml-1 text-primary-400">✓</span>
                          )}
                        </div>
                        <div className="text-gray-500 text-sm">@{tweet.user.screen_name}</div>
                      </div>
                      <div className="ml-auto flex items-center text-gray-500 text-sm">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(tweet.created_at)}
                      </div>
                    </div>
                    
                    <p 
                      className="text-gray-300 mb-3"
                      dangerouslySetInnerHTML={{ __html: parseTweetText(tweet.text) }}
                    ></p>
                    
                    {tweet.entities?.media && tweet.entities.media.length > 0 && (
                      <div className="mb-3 rounded-lg overflow-hidden">
                        <img 
                          src={tweet.entities.media[0].media_url_https}
                          alt="Tweet media"
                          className="w-full h-auto"
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-between text-gray-400 text-sm">
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        <span>{tweet.metrics?.reply_count || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <Repeat className="h-4 w-4 mr-1" />
                        <span>{tweet.metrics?.retweet_count || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        <span>{tweet.metrics?.favorite_count || 0}</span>
                      </div>
                      <div>
                        <a 
                          href={`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            <div className="p-3 border-t border-dark-700 text-center text-xs text-gray-500">
              {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading tweets...'}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TwitterFeed;