import React from 'react';
import { Clock, User, Settings, Zap, FileText, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ActivityItem {
  id: number;
  user_id: string;
  action: string;
  reference_id: string;
  created_at: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  className?: string;
  limit?: number;
}

// Helper to get icon based on action type
const getActionIcon = (action: string) => {
  switch (action) {
    case 'profile_update':
      return <User className="h-4 w-4 text-primary-400" />;
    case 'settings_update':
      return <Settings className="h-4 w-4 text-secondary-400" />;
    case 'alert_created':
      return <Zap className="h-4 w-4 text-accent-400" />;
    case 'article_read':
      return <FileText className="h-4 w-4 text-purple-400" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
};

// Helper to get background color based on action type
const getActionBgColor = (action: string) => {
  switch (action) {
    case 'profile_update':
      return 'bg-primary-500/20';
    case 'settings_update':
      return 'bg-secondary-500/20';
    case 'alert_created':
      return 'bg-accent-500/20';
    case 'article_read':
      return 'bg-purple-500/20';
    default:
      return 'bg-gray-500/20';
  }
};

// Helper to get friendly action description
const getActionDescription = (action: string, referenceId: string) => {
  switch (action) {
    case 'profile_update':
      return 'Updated your profile information';
    case 'settings_update':
      return 'Changed your account settings';
    case 'alert_created':
      return `Created a new alert (ID: ${referenceId.substring(0, 8)}...)`;
    case 'article_read':
      return `Read an article (ID: ${referenceId.substring(0, 8)}...)`;
    default:
      return action.replace(/_/g, ' ');
  }
};

// Format date to readable string
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  
  // Get time since 
  const timeSince = getTimeSince(date);
  
  // Format time
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Format date
  const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const formattedDateString = date.toLocaleDateString(undefined, dateOptions);
  
  return { 
    relative: timeSince,
    formatted: `${formattedDateString}, ${timeString}`
  };
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

const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities, 
  loading, 
  error, 
  onRefresh,
  className = '',
  limit = 5
}) => {
  const displayActivities = activities.slice(0, limit);
  
  if (loading) {
    return (
      <div className={`${className} glass-card-light p-4 rounded-lg`}>
        <div className="flex justify-center">
          <div className="w-6 h-6 border-t-2 border-primary-500 border-solid rounded-full animate-spin"></div>
        </div>
        <p className="text-center text-gray-400 mt-2 text-sm">Loading activity...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`${className} glass-card-light p-4 rounded-lg`}>
        <p className="text-center text-red-400 text-sm">{error}</p>
      </div>
    );
  }
  
  return (
    <div className={`${className} glass-card-light rounded-lg h-full`}>
      <div className="p-4 border-b border-dark-700 flex justify-between items-center">
        <h3 className="text-white font-medium">Recent Activity</h3>
        <button 
          onClick={onRefresh}
          className="text-gray-400 hover:text-primary-400 transition-colors p-1 rounded-full hover:bg-dark-700"
          title="Refresh activity feed"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4 space-y-4">
        {displayActivities.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-4">No activity recorded yet.</p>
        ) : (
          displayActivities.map((activity) => {
            const dateInfo = formatDate(activity.created_at);
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 ${getActionBgColor(activity.action)} rounded-full p-2`}>
                  {getActionIcon(activity.action)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{getActionDescription(activity.action, activity.reference_id)}</p>
                  <p className="text-xs text-gray-400">
                    {dateInfo.relative}
                  </p>
                </div>
                <div className="text-xs text-gray-500 hidden sm:block">
                  {dateInfo.formatted}
                </div>
              </div>
            );
          })
        )}
      </div>
      {activities.length > limit && (
        <div className="p-3 border-t border-dark-700 text-center">
          <a href="#" className="text-sm text-primary-400 hover:text-primary-300">View all activity</a>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;