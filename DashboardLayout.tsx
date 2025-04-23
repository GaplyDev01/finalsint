import React, { useState, ReactNode, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BarChart3, Menu, X, ChevronRight, ChevronLeft, LogOut, User, Bell, 
  Settings, Search, Home, FileText, BarChart, Zap, Users, PieChart, Shield,
  ArrowLeft, ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAdminStatus() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserEmail(session.user.email || '');
        
        // Check if user has admin email
        if (session.user.email?.endsWith('@blindvibe.com')) {
          setIsAdmin(true);
        }
        
        // Check if user has admin role in user_roles table
        const { data } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .single();
          
        if (data) {
          setIsAdmin(true);
        }
        
        // Fetch user's avatar from profiles - using maybeSingle() instead of single()
        const { data: profileData } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (profileData?.avatar_url) {
          setAvatarUrl(profileData.avatar_url);
        }
      }
    }
    
    checkAdminStatus();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

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
              <BarChart3 className="h-8 w-8 text-primary-400" />
              {sidebarExpanded && (
                <span className="ml-2 text-xl font-bold text-white">Sintillio</span>
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
            <Link to="/dashboard" className={`flex items-center ${sidebarExpanded ? 'px-4' : 'px-3 justify-center'} py-2.5 text-white bg-primary-500/10 rounded-lg group`}>
              <Home className="h-5 w-5 text-primary-400 flex-shrink-0 group-hover:text-primary-300" />
              {sidebarExpanded && <span className="ml-3">Dashboard</span>}
            </Link>
            
            <Link to="/news-feed" className={`flex items-center ${sidebarExpanded ? 'px-4' : 'px-3 justify-center'} py-2.5 text-gray-300 hover:bg-dark-700 rounded-lg group transition-colors`}>
              <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 group-hover:text-primary-400" />
              {sidebarExpanded && <span className="ml-3">News Feed</span>}
            </Link>
            
            <Link to="#" className={`flex items-center ${sidebarExpanded ? 'px-4' : 'px-3 justify-center'} py-2.5 text-gray-300 hover:bg-dark-700 rounded-lg group transition-colors`}>
              <BarChart className="h-5 w-5 text-gray-400 flex-shrink-0 group-hover:text-primary-400" />
              {sidebarExpanded && <span className="ml-3">Impact Scores</span>}
            </Link>
            
            <Link to="#" className={`flex items-center ${sidebarExpanded ? 'px-4' : 'px-3 justify-center'} py-2.5 text-gray-300 hover:bg-dark-700 rounded-lg group transition-colors`}>
              <Zap className="h-5 w-5 text-gray-400 flex-shrink-0 group-hover:text-primary-400" />
              {sidebarExpanded && <span className="ml-3">Alerts</span>}
            </Link>
            
            <Link to="#" className={`flex items-center ${sidebarExpanded ? 'px-4' : 'px-3 justify-center'} py-2.5 text-gray-300 hover:bg-dark-700 rounded-lg group transition-colors`}>
              <PieChart className="h-5 w-5 text-gray-400 flex-shrink-0 group-hover:text-primary-400" />
              {sidebarExpanded && <span className="ml-3">Analytics</span>}
            </Link>
            
            <Link to="#" className={`flex items-center ${sidebarExpanded ? 'px-4' : 'px-3 justify-center'} py-2.5 text-gray-300 hover:bg-dark-700 rounded-lg group transition-colors`}>
              <Users className="h-5 w-5 text-gray-400 flex-shrink-0 group-hover:text-primary-400" />
              {sidebarExpanded && <span className="ml-3">Sources</span>}
            </Link>
            
            <div className={`pt-4 mt-4 border-t border-dark-700 ${!sidebarExpanded && 'flex flex-col items-center'}`}>
              {sidebarExpanded && (
                <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  User Settings
                </h3>
              )}
              <Link 
                to="/profile" 
                className={`flex items-center ${sidebarExpanded ? 'px-4' : 'px-3 justify-center'} py-2.5 mt-2 text-gray-300 hover:bg-dark-700 rounded-lg group transition-colors`}
              >
                <User className="h-5 w-5 text-gray-400 flex-shrink-0 group-hover:text-primary-400" />
                {sidebarExpanded && <span className="ml-3">Your Profile</span>}
              </Link>
              <Link 
                to="/settings" 
                className={`flex items-center ${sidebarExpanded ? 'px-4' : 'px-3 justify-center'} py-2.5 text-gray-300 hover:bg-dark-700 rounded-lg group transition-colors`}
              >
                <Settings className="h-5 w-5 text-gray-400 flex-shrink-0 group-hover:text-primary-400" />
                {sidebarExpanded && <span className="ml-3">Settings</span>}
              </Link>
            </div>
            
            {isAdmin && (
              <div className={`pt-4 mt-4 border-t border-dark-700 ${!sidebarExpanded && 'flex flex-col items-center'}`}>
                {sidebarExpanded && (
                  <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Admin Access
                  </h3>
                )}
                <Link 
                  to="/admin" 
                  className={`flex items-center ${sidebarExpanded ? 'px-4' : 'px-3 justify-center'} py-2.5 mt-2 text-gray-300 hover:bg-dark-700 rounded-lg group transition-colors`}
                >
                  <Shield className="h-5 w-5 text-red-400 flex-shrink-0" />
                  {sidebarExpanded && <span className="ml-3">Admin Dashboard</span>}
                </Link>
              </div>
            )}
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
            {/* Notifications */}
            <div className="relative">
              <button
                className="relative text-gray-400 hover:text-white dropdown-trigger"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  3
                </span>
              </button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-dark-800 border border-dark-700 rounded-lg shadow-lg overflow-hidden z-50">
                  <div className="p-3 border-b border-dark-700 flex justify-between items-center">
                    <h3 className="font-medium text-white">Notifications</h3>
                    <button className="text-xs text-primary-400 hover:text-primary-300">Mark all as read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <a href="#" className="block p-4 hover:bg-dark-700 border-b border-dark-700 transition-colors">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-primary-500/20 rounded-full p-2">
                          <Zap className="h-4 w-4 text-primary-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">New high-impact story detected</p>
                          <p className="text-xs text-gray-400 mt-1">5 minutes ago</p>
                        </div>
                      </div>
                    </a>
                    <a href="#" className="block p-4 hover:bg-dark-700 border-b border-dark-700 transition-colors">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-secondary-500/20 rounded-full p-2">
                          <BarChart className="h-4 w-4 text-secondary-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">Impact score predictions updated</p>
                          <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                        </div>
                      </div>
                    </a>
                    <a href="#" className="block p-4 hover:bg-dark-700 transition-colors">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-red-500/20 rounded-full p-2">
                          <BarChart className="h-4 w-4 text-red-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">Market alert: Crypto volatility</p>
                          <p className="text-xs text-gray-400 mt-1">3 hours ago</p>
                        </div>
                      </div>
                    </a>
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
                <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <span className="ml-2 text-sm hidden md:block">
                  {userEmail || 'User Profile'}
                  {isAdmin && <span className="ml-1 text-xs text-green-400">(Admin)</span>}
                </span>
              </button>
              
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-lg overflow-hidden z-50">
                  <Link to="/profile" className="block px-4 py-2 text-gray-300 hover:bg-dark-700 transition-colors">
                    <User className="inline-block h-4 w-4 mr-2" />
                    Profile
                  </Link>
                  <Link to="/settings" className="block px-4 py-2 text-gray-300 hover:bg-dark-700 transition-colors">
                    <Settings className="inline-block h-4 w-4 mr-2" />
                    Settings
                  </Link>
                  {isAdmin && (
                    <>
                      <div className="border-t border-dark-700"></div>
                      <Link to="/admin" className="block px-4 py-2 text-gray-300 hover:bg-dark-700 transition-colors">
                        <Shield className="inline-block h-4 w-4 mr-2 text-red-400" />
                        Admin Panel
                      </Link>
                    </>
                  )}
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
            <h2 className="text-lg font-medium text-white">Activity</h2>
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
                <h3 className="text-white font-medium mb-2">Recent Impact Spikes</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 mr-3">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-white">Tech Regulation</p>
                      <p className="text-xs text-gray-400">+32% impact</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mr-3">
                      <BarChart className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-white">Market Growth</p>
                      <p className="text-xs text-gray-400">+18% impact</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card-light p-4 rounded-lg">
                <h3 className="text-white font-medium mb-2">Trending Topics</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs">
                    #Blockchain
                  </span>
                  <span className="px-2 py-1 bg-secondary-500/20 text-secondary-400 rounded-full text-xs">
                    #AITechnology
                  </span>
                  <span className="px-2 py-1 bg-accent-500/20 text-accent-400 rounded-full text-xs">
                    #DigitalFinance
                  </span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                    #MarketAnalysis
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;