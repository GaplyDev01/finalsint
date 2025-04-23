import React, { useState, ReactNode, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BarChart3, Menu, X, ChevronRight, ChevronLeft, LogOut, User, Bell, 
  Settings, Search, Home, FileText, BarChart, Zap, Users, PieChart,
  LayoutDashboard, Shield, Database, GitBranch, AlertTriangle, Lock,
  RefreshCw, Globe, Bitcoin, PlusCircle, ArrowLeft, ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminLayoutProps {
  children: ReactNode;
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  apiLatency: number;
  databaseLoad: number;
  lastUpdated: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpuUsage: 32,
    memoryUsage: 64,
    apiLatency: 24,
    databaseLoad: 42,
    lastUpdated: new Date().toLocaleTimeString()
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchNotifications();
    simulateSystemMetrics();

    // Set up interval to update system metrics periodically
    const interval = setInterval(simulateSystemMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownOpen || notificationsOpen) {
        const target = e.target as HTMLElement;
        if (!target.closest('.dropdown-trigger')) {
          setProfileDropdownOpen(false);
          setNotificationsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen, notificationsOpen]);

  // Fetch user data from Supabase
  const fetchUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUserEmail(session.user.email || 'Admin User');
    }
  };

  // Fetch notifications from the database
  const fetchNotifications = async () => {
    // This is a simulation since we need to look at real database data
    // In a real implementation, you would fetch from Supabase
    try {
      const { data: activityData, error: activityError } = await supabase
        .from('user_activity_logs')
        .select('id, user_id, action, reference_id, created_at')
        .limit(5)
        .order('created_at', { ascending: false });

      if (activityError) throw activityError;

      // Simulate other system notifications
      const systemNotifications = [
        {
          id: 'sys1',
          type: 'system',
          title: 'Database connection error',
          time: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
          icon: <AlertTriangle className="h-4 w-4 text-red-400" />,
          iconBg: 'bg-red-500/20'
        },
        {
          id: 'sys2',
          type: 'user',
          title: 'New admin user registered',
          time: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
          icon: <User className="h-4 w-4 text-primary-400" />,
          iconBg: 'bg-primary-500/20'
        },
        {
          id: 'sys3',
          type: 'update',
          title: 'System update completed',
          time: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
          icon: <GitBranch className="h-4 w-4 text-green-400" />,
          iconBg: 'bg-green-500/20'
        }
      ];

      // Format activity notifications
      const activityNotifications = activityData?.map((activity, index) => ({
        id: activity.id,
        type: 'activity',
        title: `User activity: ${activity.action}`,
        time: activity.created_at,
        icon: <Bell className="h-4 w-4 text-orange-400" />,
        iconBg: 'bg-orange-500/20'
      })) || [];

      setNotifications([...systemNotifications, ...activityNotifications].sort((a, b) => 
        new Date(b.time).getTime() - new Date(a.time).getTime()
      ).slice(0, 5));

    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Simulate system metrics changes
  const simulateSystemMetrics = () => {
    setSystemMetrics({
      cpuUsage: Math.floor(Math.random() * 60) + 20, // 20-80%
      memoryUsage: Math.floor(Math.random() * 40) + 40, // 40-80%
      apiLatency: Math.floor(Math.random() * 30) + 10, // 10-40ms
      databaseLoad: Math.floor(Math.random() * 50) + 20, // 20-70%
      lastUpdated: new Date().toLocaleTimeString()
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getServerStatusClass = (value: number) => {
    if (value > 80) return 'bg-red-500';
    if (value > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Toggle sidebar expanded state
  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <div className="h-screen flex bg-dark-800">
      {/* Overlay for mobile when sidebar is open */}
      {leftSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setLeftSidebarOpen(false)}
        ></div>
      )}

      {/* Left Sidebar - Fixed on mobile, relative on desktop */}
      <div 
        className={`fixed inset-y-0 left-0 z-40 bg-dark-900 border-r border-dark-700 transform transition-all duration-300 ease-in-out ${
          leftSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 md:transition-all md:duration-300 ${
          sidebarExpanded ? 'md:w-64' : 'md:w-20'
        } md:flex-shrink-0`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className={`px-4 py-5 flex items-center ${sidebarExpanded ? 'justify-between' : 'justify-center'} border-b border-dark-700`}>
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary-400" />
              {sidebarExpanded && (
                <span className="ml-2 text-xl font-bold text-white">Admin Panel</span>
              )}
            </div>
            
            {/* Mobile Close Button */}
            <button
              className={`md:hidden text-gray-400 hover:text-white ${sidebarExpanded ? 'block' : 'hidden'}`}
              onClick={() => setLeftSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Desktop Toggle Button */}
            <button 
              onClick={toggleSidebar}
              className="hidden md:block text-gray-400 hover:text-white"
            >
              {sidebarExpanded ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
            <Link to="/admin" className={`flex items-center ${sidebarExpanded ? 'px-4' : 'px-3 justify-center'} py-2.5 text-white bg-primary-500/10 rounded-lg group`}>
              <LayoutDashboard className="h-5 w-5 text-primary-400 flex-shrink-0" />
              {sidebarExpanded && <span className="ml-3">Dashboard</span>}
            </Link>
            
            <Link to="/admin?tab=users" className={`flex items-center ${sidebarExpanded ? 'px-4' : 'px-3 justify-center'} py-2.5 text-gray-300 hover:bg-dark-700 rounded-lg group transition-colors`}>
              <Users className="h-5 w-5 text-gray-400 flex-shrink-0 group-hover:text-primary-400" />
              {sidebarExpanded && <span className="ml-3">User Management</span>}
            </Link>
            
            <Link to="/admin/search" className={`flex items-center ${sidebarExpanded ? 'px-4' : 'px-3 justify-center'} py-2.5 text-gray-300 hover:bg-dark-700 rounded-lg group transition-colors`}>
              <Globe className="h-5 w-5 text-gray-400 flex-shrink-0 group-hover:text-primary-400" />
              {sidebarExpanded && <span className="ml-3">Content Search</span>}
            </Link>
            
            <Link to="/admin/crypto" className={`flex items-center ${sidebarExpanded ? 'px-4' : 'px-3 justify-center'} py-2.5 text-gray-300 hover:bg-dark-700 rounded-lg group transition-colors`}>
              <Bitcoin className="h-5 w-5 text-gray-400 flex-shrink-0 group-hover:text-primary-400" />
              {sidebarExpanded && <span className="ml-3">Crypto News</span>}
            </Link>
            
            <Link to="/admin/add-content" className={`flex items-center ${sidebarExpanded ? 'px-4' : 'px-3 justify-center'} py-2.5 text-gray-300 hover:bg-dark-700 rounded-lg group transition-colors`}>
              <PlusCircle className="h-5 w-5 text-gray-400 flex-shrink-0 group-hover:text-primary-400" />
              {sidebarExpanded && <span className="ml-3">Add Content</span>}
            </Link>
            
            <Link to="/admin?tab=articles" className={`flex items-center ${sidebarExpanded ? 'px-4' : 'px-3 justify-center'} py-2.5 text-gray-300 hover:bg-dark-700 rounded-lg group transition-colors`}>
              <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 group-hover:text-primary-400" />
              {sidebarExpanded && <span className="ml-3">Content Management</span>}
            </Link>
            
            <Link to="/admin?tab=alerts" className={`flex items-center ${sidebarExpanded ? 'px-4' : 'px-3 justify-center'} py-2.5 text-gray-300 hover:bg-dark-700 rounded-lg group transition-colors`}>
              <AlertTriangle className="h-5 w-5 text-gray-400 flex-shrink-0 group-hover:text-primary-400" />
              {sidebarExpanded && <span className="ml-3">Alert Management</span>}
            </Link>
            
            <Link to="/admin?tab=analytics" className={`flex items-center ${sidebarExpanded ? 'px-4' : 'px-3 justify-center'} py-2.5 text-gray-300 hover:bg-dark-700 rounded-lg group transition-colors`}>
              <BarChart className="h-5 w-5 text-gray-400 flex-shrink-0 group-hover:text-primary-400" />
              {sidebarExpanded && <span className="ml-3">Analytics</span>}
            </Link>
            
            <Link to="/admin?tab=database" className={`flex items-center ${sidebarExpanded ? 'px-4' : 'px-3 justify-center'} py-2.5 text-gray-300 hover:bg-dark-700 rounded-lg group transition-colors`}>
              <Database className="h-5 w-5 text-gray-400 flex-shrink-0 group-hover:text-primary-400" />
              {sidebarExpanded && <span className="ml-3">Database</span>}
            </Link>
            
            <Link to="/admin?tab=settings" className={`flex items-center ${sidebarExpanded ? 'px-4' : 'px-3 justify-center'} py-2.5 text-gray-300 hover:bg-dark-700 rounded-lg group transition-colors`}>
              <Settings className="h-5 w-5 text-gray-400 flex-shrink-0 group-hover:text-primary-400" />
              {sidebarExpanded && <span className="ml-3">System Settings</span>}
            </Link>
            
            <div className={`pt-4 mt-4 border-t border-dark-700 ${!sidebarExpanded && 'flex flex-col items-center'}`}>
              {sidebarExpanded && (
                <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  User Area
                </h3>
              )}
              <Link to="/dashboard" className={`flex items-center ${sidebarExpanded ? 'px-4' : 'px-3 justify-center'} py-2.5 mt-2 text-gray-300 hover:bg-dark-700 rounded-lg group transition-colors`}>
                <Home className="h-5 w-5 text-gray-400 flex-shrink-0 group-hover:text-primary-400" />
                {sidebarExpanded && <span className="ml-3">Main Dashboard</span>}
              </Link>
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className={`p-4 border-t border-dark-700 ${!sidebarExpanded && 'flex justify-center'}`}>
            <button
              onClick={handleSignOut}
              className={`${sidebarExpanded ? 'w-full' : ''} flex items-center justify-center px-4 py-2 text-gray-300 hover:bg-dark-700 rounded-lg transition-colors`}
            >
              <LogOut className="h-5 w-5 text-gray-400" />
              {sidebarExpanded && <span className="ml-3">Sign out</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main content and header */}
      <div className="flex-1 flex flex-col overflow-hidden w-0 min-w-0">
        {/* Main Header */}
        <header className="bg-dark-900 border-b border-dark-700 p-4 flex items-center justify-between z-30">
          <div className="flex items-center">
            {/* Mobile Menu Toggle */}
            <button
              className="text-gray-400 hover:text-white md:hidden"
              onClick={() => setLeftSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Desktop Sidebar Toggle */}
            <button
              className="hidden md:block text-gray-400 hover:text-white mr-3"
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="ml-4 md:ml-0 relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-3 py-2 border border-dark-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-dark-700 text-white"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* System Status */}
            <div className="hidden lg:flex items-center mr-4">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm text-gray-300">System Operational</span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                className="relative text-gray-400 hover:text-white dropdown-trigger"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {notifications.length}
                </span>
              </button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-dark-800 border border-dark-700 rounded-lg shadow-lg overflow-hidden z-50">
                  <div className="p-3 border-b border-dark-700 flex justify-between items-center">
                    <h3 className="font-medium text-white">System Notifications</h3>
                    <button className="text-xs text-primary-400 hover:text-primary-300">Mark all as read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <a key={notification.id} href="#" className="block p-4 hover:bg-dark-700 border-b border-dark-700 transition-colors">
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 ${notification.iconBg} rounded-full p-2`}>
                            {notification.icon}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-white">{notification.title}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.time).toLocaleString(undefined, {
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: true,
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                  <div className="p-3 border-t border-dark-700 text-center">
                    <a href="#" className="text-sm text-primary-400 hover:text-primary-300">View all notifications</a>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                className="flex items-center text-gray-300 hover:text-white dropdown-trigger"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">
                  <Shield className="h-4 w-4" />
                </div>
                <span className="ml-2 text-sm hidden md:block">{userEmail || 'Admin User'}</span>
              </button>
              
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-lg overflow-hidden z-50">
                  <a href="#" className="block px-4 py-2 text-gray-300 hover:bg-dark-700 transition-colors">
                    <User className="inline-block h-4 w-4 mr-2" />
                    Profile
                  </a>
                  <a href="#" className="block px-4 py-2 text-gray-300 hover:bg-dark-700 transition-colors">
                    <Settings className="inline-block h-4 w-4 mr-2" />
                    Settings
                  </a>
                  <div className="border-t border-dark-700"></div>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-dark-700 transition-colors"
                  >
                    <LogOut className="inline-block h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Toggle Right Sidebar */}
            <button
              className="text-gray-400 hover:text-white"
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            >
              {rightSidebarOpen ? (
                <ChevronRight className="h-6 w-6" />
              ) : (
                <ChevronLeft className="h-6 w-6" />
              )}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-dark-800 p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile when right sidebar is open */}
      {rightSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setRightSidebarOpen(false)}
        ></div>
      )}

      {/* Right Sidebar */}
      <div 
        className={`fixed inset-y-0 right-0 z-40 w-64 bg-dark-900 border-l border-dark-700 transform transition-transform duration-300 ease-in-out ${
          rightSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } md:relative md:transition-none md:flex-shrink-0 ${rightSidebarOpen ? 'md:w-64' : 'md:w-0'}`}
      >
        <div className="h-full flex flex-col">
          <div className="px-4 py-5 flex items-center justify-between border-b border-dark-700">
            <h2 className="text-lg font-medium text-white">System Status</h2>
            <button
              className="text-gray-400 hover:text-white"
              onClick={() => setRightSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="glass-card-light p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-white font-medium">Server Health</h3>
                  <button 
                    className="text-gray-400 hover:text-white"
                    onClick={simulateSystemMetrics}
                    title="Refresh metrics"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-400 mb-3">
                  Last updated: {systemMetrics.lastUpdated}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">CPU</span>
                    <span className="text-sm text-white">{systemMetrics.cpuUsage}%</span>
                  </div>
                  <div className="w-full h-2 bg-dark-700 rounded-full">
                    <div 
                      className={`h-full ${getServerStatusClass(systemMetrics.cpuUsage)} rounded-full`} 
                      style={{ width: `${systemMetrics.cpuUsage}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Memory</span>
                    <span className="text-sm text-white">{systemMetrics.memoryUsage}%</span>
                  </div>
                  <div className="w-full h-2 bg-dark-700 rounded-full">
                    <div 
                      className={`h-full ${getServerStatusClass(systemMetrics.memoryUsage)} rounded-full`} 
                      style={{ width: `${systemMetrics.memoryUsage}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">API Latency</span>
                    <span className="text-sm text-white">{systemMetrics.apiLatency}ms</span>
                  </div>
                  <div className="w-full h-2 bg-dark-700 rounded-full">
                    <div 
                      className={`h-full ${systemMetrics.apiLatency > 50 ? 'bg-red-500' : systemMetrics.apiLatency > 30 ? 'bg-yellow-500' : 'bg-green-500'} rounded-full`} 
                      style={{ width: `${Math.min(systemMetrics.apiLatency * 2, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Database Load</span>
                    <span className="text-sm text-white">{systemMetrics.databaseLoad}%</span>
                  </div>
                  <div className="w-full h-2 bg-dark-700 rounded-full">
                    <div 
                      className={`h-full ${getServerStatusClass(systemMetrics.databaseLoad)} rounded-full`} 
                      style={{ width: `${systemMetrics.databaseLoad}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="glass-card-light p-4 rounded-lg">
                <h3 className="text-white font-medium mb-2">Recent Activity</h3>
                <div className="space-y-2">
                  {notifications.slice(0, 3).map((notification, index) => (
                    <div key={index} className="p-2 rounded-lg bg-dark-800 text-sm">
                      <div className="text-white">{notification.title}</div>
                      <div className="text-gray-400 text-xs">
                        {new Date(notification.time).toLocaleString(undefined, {
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="glass-card-light p-4 rounded-lg">
                <h3 className="text-white font-medium mb-2">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-2 bg-primary-500/20 text-primary-400 rounded-lg text-sm hover:bg-primary-500/30 transition-colors">
                    Refresh Stats
                  </button>
                  <button className="p-2 bg-secondary-500/20 text-secondary-400 rounded-lg text-sm hover:bg-secondary-500/30 transition-colors">
                    Clear Cache
                  </button>
                  <button className="p-2 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors">
                    Run Backup
                  </button>
                  <button className="p-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors">
                    Emergency Mode
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;