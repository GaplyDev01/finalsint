import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  growthRate: string;
}

interface ArticleStats {
  totalArticles: number;
  newArticlesToday: number;
  averageImpactScore: number;
  categoryCounts: Record<string, number>;
}

interface AlertStats {
  totalAlerts: number;
  activeAlerts: number;
  triggeredToday: number;
  byLifeArea: Record<string, number>;
}

interface AdminStats {
  users: UserStats;
  articles: ArticleStats;
  alerts: AlertStats;
  isLoading: boolean;
  error: string | null;
  refreshStats: () => void;
}

export default function useAdminStats(): AdminStats {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    growthRate: '0%'
  });
  
  const [articleStats, setArticleStats] = useState<ArticleStats>({
    totalArticles: 0,
    newArticlesToday: 0,
    averageImpactScore: 0,
    categoryCounts: {}
  });
  
  const [alertStats, setAlertStats] = useState<AlertStats>({
    totalAlerts: 0,
    activeAlerts: 0,
    triggeredToday: 0,
    byLifeArea: {}
  });

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get date range filters for today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStart = today.toISOString();
        
        // Fetch user stats
        const [
          { count: totalUsers, error: userCountError },
          { count: newUsersToday, error: newUsersError }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', todayStart)
        ]);
        
        if (userCountError) throw userCountError;
        if (newUsersError) throw newUsersError;
        
        // Simulate active users count since we don't have real-time presence data
        const activeUsers = Math.floor(Math.random() * 10) + 5; // 5-15 active users
        
        // Calculate growth rate (mock for demo)
        const growthRate = Math.floor(Math.random() * 15) + 5; // 5-20%
        
        setUserStats({
          totalUsers: totalUsers || 0,
          activeUsers,
          newUsersToday: newUsersToday || 0,
          growthRate: `+${growthRate}%`
        });
        
        // Simulate article stats since there's no articles table
        const totalArticles = Math.floor(Math.random() * 500) + 1000; // 1000-1500 articles
        const newArticlesToday = Math.floor(Math.random() * 20) + 5; // 5-25 new articles today
        const avgScore = Math.floor(Math.random() * 4) + 6; // 6-10 avg score
        
        // Simulate category distribution
        const categoryCounts = {
          'Technology': Math.floor(Math.random() * 500) + 300,
          'Finance': Math.floor(Math.random() * 400) + 250,
          'Business': Math.floor(Math.random() * 300) + 200,
          'Health': Math.floor(Math.random() * 200) + 150,
          'Other': Math.floor(Math.random() * 100) + 50
        };
        
        setArticleStats({
          totalArticles: totalArticles,
          newArticlesToday: newArticlesToday,
          averageImpactScore: avgScore,
          categoryCounts
        });
        
        // Simulate alert stats since we don't have a user_alerts table
        const totalAlerts = Math.floor(Math.random() * 100) + 200; // 200-300 alerts
        const activeAlerts = Math.floor(totalAlerts * 0.7); // ~70% active
        
        // Simulate alerts by life area
        const lifeAreaCounts: Record<string, number> = {
          'Career': Math.floor(Math.random() * 50) + 50,
          'Finances': Math.floor(Math.random() * 50) + 40,
          'Leisure': Math.floor(Math.random() * 30) + 30,
          'Interest': Math.floor(Math.random() * 20) + 20,
          'Other': Math.floor(Math.random() * 10) + 10
        };
        
        // Simulate triggered count
        const triggeredToday = Math.floor(Math.random() * 20) + 5;
        
        setAlertStats({
          totalAlerts: totalAlerts,
          activeAlerts: activeAlerts,
          triggeredToday,
          byLifeArea: lifeAreaCounts
        });
        
      } catch (err: any) {
        console.error('Error fetching admin stats:', err);
        setError(err.message || 'Failed to fetch statistics');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchStats();
  }, [refreshTrigger]);
  
  const refreshStats = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return {
    users: userStats,
    articles: articleStats,
    alerts: alertStats,
    isLoading,
    error,
    refreshStats
  };
}