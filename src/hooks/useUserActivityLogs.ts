import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UserActivity {
  id: number;
  user_id: string;
  action: string;
  reference_id: string;
  created_at: string;
}

export default function useUserActivityLogs(limit: number = 10) {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function fetchUserActivity() {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          throw new Error('Not authenticated');
        }
        
        const { data, error: fetchError } = await supabase
          .from('user_activity_logs')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (fetchError) throw fetchError;
        
        setActivities(data || []);
      } catch (err: any) {
        console.error('Error fetching user activity:', err);
        setError(err.message || 'Failed to load activity');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserActivity();
  }, [limit, refreshTrigger]);
  
  const refresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Function to log a new activity
  const logActivity = async (action: string, referenceId: string = '') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.error('Cannot log activity: User not authenticated');
        return;
      }
      
      const { error } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: session.user.id,
          action,
          reference_id: referenceId
        });
      
      if (error) {
        console.error('Error logging activity:', error);
        return;
      }
      
      // Refresh the activity list
      refresh();
    } catch (err) {
      console.error('Error in logActivity:', err);
    }
  };
  
  return { activities, loading, error, refresh, logActivity };
}