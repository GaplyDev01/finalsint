import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UserActivity {
  id: number;
  user_id: string;
  action: string;
  reference_id: string;
  created_at: string;
  user_email?: string;
}

export default function useUserActivity(limit: number = 10) {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function fetchUserActivity() {
      try {
        setLoading(true);
        
        // Fetch user activity logs
        const { data: activityData, error: activityError } = await supabase
          .from('user_activity_logs')
          .select('id, user_id, action, reference_id, created_at')
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (activityError) throw activityError;
        
        if (activityData && activityData.length > 0) {
          // Get unique user IDs from activity data
          const userIds = [...new Set(activityData.map(activity => activity.user_id))];
          
          // Fetch user emails for those IDs
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('user_id, email:user_id')
            .in('user_id', userIds);
          
          if (userError) throw userError;
          
          // Create a map of user IDs to emails
          const userMap = new Map();
          if (userData) {
            userData.forEach(user => {
              userMap.set(user.user_id, user.email);
            });
          }
          
          // Enrich activity data with user emails
          const enrichedActivity = activityData.map(activity => ({
            ...activity,
            user_email: userMap.get(activity.user_id) || 'Unknown User'
          }));
          
          setActivities(enrichedActivity);
        } else {
          setActivities([]);
        }
      } catch (err: any) {
        console.error('Error fetching user activity:', err);
        setError(err.message || 'Failed to load user activity');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserActivity();
  }, [limit, refreshTrigger]);
  
  const refresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return { activities, loading, error, refresh };
}