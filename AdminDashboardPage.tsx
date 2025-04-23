import React, { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, TrendingUp, RefreshCw, Globe, Activity, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import useAdminStats from '../hooks/useAdminStats';
import useUserActivity from '../hooks/useUserActivity';
import AnimatedElement from '../components/AnimatedElement';
import ActivityFeed from '../components/ActivityFeed';

interface DashboardSummary {
  totalUsers: number;
  totalArticles: number;
  activeAlerts: number;
  systemHealth: number;
}

const AdminDashboardPage: React.FC = () => {
  const { users, articles, alerts, isLoading, refreshStats } = useAdminStats();
  const { activities, loading: activitiesLoading, error: activitiesError, refresh: refreshActivities } = useUserActivity(10);
  const [summary, setSummary] = useState<DashboardSummary>({
    totalUsers: 0,
    totalArticles: 0,
    activeAlerts: 0,
    systemHealth: 0
  });
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'alerts'>('overview');
  
  const fetchDashboardData = async () => {
    try {
      // Fetch summary data for the admin dashboard
      const { data: profilesCount, error: profilesError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      // Use search_results for articles count instead of user_article_scores
      const { data: articlesCount, error: articlesError } = await supabase
        .from('search_results')
        .select('*', { count: 'exact', head: true });
        
      if (profilesError) {
        console.error('Error fetching profiles count:', profilesError);
      }
      
      if (articlesError) {
        console.error('Error fetching articles count:', articlesError);
      }
      
      // Simulate alerts count since we don't have an alerts table
      const alertsCount = Math.floor(Math.random() * 50) + 10;
      
      // Set the dashboard summary
      setSummary({
        totalUsers: profilesCount?.count || 0,
        totalArticles: articlesCount?.count || 0,
        activeAlerts: alertsCount,
        systemHealth: 92 // Simulated system health score
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  // Load dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <AnimatedElement animation="fade-in-up">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400">System overview and management</p>
            </div>
          </AnimatedElement>
          
          <AnimatedElement animation="fade-in-up" delay={100}>
            <button
              onClick={() => {
                refreshStats();
                fetchDashboardData();
              }}
              className="btn btn-outline flex items-center space-x-2"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>
          </AnimatedElement>
        </div>

        <AnimatedElement animation="fade-in-up" delay={200}>
          <div className="glass-card-light p-6 rounded-lg border border-dark-700">
            <div className="mb-6">
              <div className="flex flex-wrap border-b border-dark-700">
                <button
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === 'overview' ? 'text-white border-b-2 border-primary-500' : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === 'users' ? 'text-white border-b-2 border-primary-500' : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('users')}
                >
                  User Activity
                </button>
                <button
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === 'content' ? 'text-white border-b-2 border-primary-500' : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('content')}
                >
                  Content Stats
                </button>
                <button
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === 'alerts' ? 'text-white border-b-2 border-primary-500' : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('alerts')}
                >
                  Alert Analytics
                </button>
              </div>
            </div>

            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="glass-card p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400 mr-3">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Total Users</div>
                        <div className="text-2xl font-bold text-white">{users.totalUsers}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-500">Active today:</div>
                      <div className="text-green-400">{users.activeUsers}</div>
                    </div>
                  </div>
                  
                  <div className="glass-card p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary-500/20 flex items-center justify-center text-secondary-400 mr-3">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">News Articles</div>
                        <div className="text-2xl font-bold text-white">{articles.totalArticles}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-500">Added today:</div>
                      <div className="text-secondary-400">+{articles.newArticlesToday}</div>
                    </div>
                  </div>
                  
                  <div className="glass-card p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-lg bg-accent-500/20 flex items-center justify-center text-accent-400 mr-3">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">User Growth</div>
                        <div className="text-2xl font-bold text-white">{users.growthRate}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-500">New users today:</div>
                      <div className="text-accent-400">{users.newUsersToday}</div>
                    </div>
                  </div>
                  
                  <div className="glass-card p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 mr-3">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Avg. Impact Score</div>
                        <div className="text-2xl font-bold text-white">{articles.averageImpactScore}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-500">System Health:</div>
                      <div className="text-green-400">92%</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <div className="glass-card p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white">User Activity</h3>
                        <a href="#" className="text-primary-400 text-sm flex items-center hover:text-primary-300">
                          View All <ChevronRight className="ml-1 h-4 w-4" />
                        </a>
                      </div>
                      <ActivityFeed 
                        activities={activities}
                        loading={activitiesLoading}
                        error={activitiesError}
                        onRefresh={refreshActivities}
                        limit={5}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="glass-card p-6 rounded-lg h-full">
                      <h3 className="font-semibold text-white mb-4">Content Categories</h3>
                      <div className="space-y-4">
                        {Object.entries(articles.categoryCounts).map(([category, count], index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300 text-sm">{category}</span>
                              <span className="text-white text-sm font-medium">{count}</span>
                            </div>
                            <div className="h-2 w-full bg-dark-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                                style={{ width: `${(count / articles.totalArticles * 100).toFixed(1)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'users' && (
              <div className="p-4">
                <h3 className="text-lg font-medium text-white mb-4">User Analytics</h3>
                <p className="text-gray-400">Detailed user activity and engagement data will be displayed here.</p>
              </div>
            )}
            
            {activeTab === 'content' && (
              <div className="p-4">
                <h3 className="text-lg font-medium text-white mb-4">Content Performance</h3>
                <p className="text-gray-400">Content engagement metrics and performance analytics will be displayed here.</p>
              </div>
            )}
            
            {activeTab === 'alerts' && (
              <div className="p-4">
                <h3 className="text-lg font-medium text-white mb-4">Alert System Analytics</h3>
                <p className="text-gray-400">Alert system performance and trigger analytics will be displayed here.</p>
              </div>
            )}
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fade-in-up" delay={300}>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            <div className="md:col-span-3 glass-card-light p-6 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <a 
                  href="/admin/search"
                  className="p-4 bg-primary-500/10 text-primary-400 rounded-lg flex items-center transition-colors hover:bg-primary-500/20"
                >
                  <Globe className="h-5 w-5 mr-3" />
                  <span>Search Web</span>
                </a>
                <a 
                  href="/admin/crypto"
                  className="p-4 bg-secondary-500/10 text-secondary-400 rounded-lg flex items-center transition-colors hover:bg-secondary-500/20"
                >
                  <BarChart3 className="h-5 w-5 mr-3" />
                  <span>Crypto News</span>
                </a>
                <button 
                  className="p-4 bg-accent-500/10 text-accent-400 rounded-lg flex items-center transition-colors hover:bg-accent-500/20"
                >
                  <FileText className="h-5 w-5 mr-3" />
                  <span>Content Manager</span>
                </button>
                <button 
                  className="p-4 bg-red-500/10 text-red-400 rounded-lg flex items-center transition-colors hover:bg-red-500/20"
                >
                  <Users className="h-5 w-5 mr-3" />
                  <span>User Manager</span>
                </button>
              </div>
            </div>
            
            <div className="md:col-span-3 glass-card-light p-6 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">System Health</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">API Health</span>
                    <span className="text-white text-sm font-medium">98%</span>
                  </div>
                  <div className="h-2 w-full bg-dark-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500"
                      style={{ width: '98%' }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Database Performance</span>
                    <span className="text-white text-sm font-medium">92%</span>
                  </div>
                  <div className="h-2 w-full bg-dark-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500"
                      style={{ width: '92%' }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Server Load</span>
                    <span className="text-white text-sm font-medium">78%</span>
                  </div>
                  <div className="h-2 w-full bg-dark-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500"
                      style={{ width: '78%' }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Storage Usage</span>
                    <span className="text-white text-sm font-medium">45%</span>
                  </div>
                  <div className="h-2 w-full bg-dark-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500"
                      style={{ width: '45%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;