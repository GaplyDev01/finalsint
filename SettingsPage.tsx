import React, { useState, useEffect } from 'react';
import { Settings, Bell, Clock, Newspaper, Save, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../components/DashboardLayout';
import AnimatedElement from '../components/AnimatedElement';

// Define the structure for user preferences
interface UserPreferences {
  user_id: string;
  life_areas: string[];
  sources: string[];
  update_interval: string;
  notification_channels: string[];
}

// Define available sources and notification channels
const availableSources = [
  { id: 'bloomberg', name: 'Bloomberg' },
  { id: 'cnbc', name: 'CNBC' },
  { id: 'reuters', name: 'Reuters' },
  { id: 'wsj', name: 'Wall Street Journal' },
  { id: 'ft', name: 'Financial Times' },
  { id: 'coindesk', name: 'CoinDesk' },
  { id: 'cointelegraph', name: 'Cointelegraph' },
  { id: 'techcrunch', name: 'TechCrunch' },
  { id: 'wired', name: 'Wired' },
  { id: 'verge', name: 'The Verge' }
];

const availableNotificationChannels = [
  { id: 'in-app', name: 'In-App Notifications' },
  { id: 'email', name: 'Email Alerts' },
  { id: 'push', name: 'Push Notifications' }
];

const updateIntervalOptions = [
  { value: '00:15:00', label: '15 minutes' },
  { value: '00:30:00', label: '30 minutes' },
  { value: '01:00:00', label: '1 hour' },
  { value: '02:00:00', label: '2 hours' },
  { value: '04:00:00', label: '4 hours' },
  { value: '08:00:00', label: '8 hours' },
  { value: '24:00:00', label: 'Daily' }
];

const SettingsPage: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lifeAreaHidden] = useState(true); // Since life areas are fixed for each user

  // Helper to format interval for display
  const parseIntervalToString = (intervalStr: string): string => {
    // Find matching option
    const option = updateIntervalOptions.find(opt => opt.value === intervalStr);
    if (option) return option.label;
    
    // Fallback: parse interval manually (basic implementation)
    try {
      if (intervalStr.startsWith('00:15')) return '15 minutes';
      if (intervalStr.startsWith('00:30')) return '30 minutes';
      if (intervalStr.startsWith('01:00')) return '1 hour';
      if (intervalStr.startsWith('02:00')) return '2 hours';
      if (intervalStr.startsWith('04:00')) return '4 hours';
      if (intervalStr.startsWith('08:00')) return '8 hours';
      if (intervalStr.startsWith('24:00')) return 'Daily';
      
      return intervalStr;
    } catch {
      return '30 minutes';
    }
  };

  // Fetch user preferences from Supabase
  const fetchUserPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('You must be logged in to view settings');
      }
      
      // Fetch user's preferences
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setPreferences(data);
      } else {
        // If no preferences exist (should not happen with the trigger), create default
        const defaultPreferences: UserPreferences = {
          user_id: session.user.id,
          life_areas: ['Career', 'Finances', 'Leisure', 'Interest'],
          sources: [],
          update_interval: '00:30:00',
          notification_channels: ['in-app']
        };
        
        setPreferences(defaultPreferences);
      }
    } catch (err: any) {
      console.error('Error fetching preferences:', err);
      setError(err.message || 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  // Save updated preferences to Supabase
  const savePreferences = async () => {
    if (!preferences) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: preferences.user_id,
          sources: preferences.sources,
          update_interval: preferences.update_interval,
          notification_channels: preferences.notification_channels,
          life_areas: preferences.life_areas // Keep life areas as is
        });
      
      if (error) {
        throw error;
      }
      
      // Log the activity
      const { error: logError } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: preferences.user_id,
          action: 'settings_update',
          reference_id: 'preferences'
        });
      
      if (logError) {
        console.error('Error logging activity:', logError);
      }
      
      setSuccess('Your preferences have been updated successfully');
      
      // Refetch to ensure we have the latest data
      fetchUserPreferences();
    } catch (err: any) {
      console.error('Error saving preferences:', err);
      setError(err.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    savePreferences();
  };

  // Handle toggle for sources
  const toggleSource = (sourceId: string) => {
    if (!preferences) return;
    
    const updatedSources = [...preferences.sources];
    
    if (updatedSources.includes(sourceId)) {
      // Remove the source
      const index = updatedSources.indexOf(sourceId);
      updatedSources.splice(index, 1);
    } else {
      // Add the source
      updatedSources.push(sourceId);
    }
    
    setPreferences({
      ...preferences,
      sources: updatedSources
    });
  };

  // Handle toggle for notification channels
  const toggleNotificationChannel = (channelId: string) => {
    if (!preferences) return;
    
    const updatedChannels = [...preferences.notification_channels];
    
    if (updatedChannels.includes(channelId)) {
      // Remove the channel
      const index = updatedChannels.indexOf(channelId);
      updatedChannels.splice(index, 1);
    } else {
      // Add the channel
      updatedChannels.push(channelId);
    }
    
    setPreferences({
      ...preferences,
      notification_channels: updatedChannels
    });
  };

  // Handle update interval change
  const handleUpdateIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      update_interval: e.target.value
    });
  };

  // Load user preferences on component mount
  useEffect(() => {
    fetchUserPreferences();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AnimatedElement animation="fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Settings</h1>
              <p className="text-gray-400">Manage your news preferences and notification settings</p>
            </div>
            <button 
              className="btn btn-outline flex items-center space-x-2"
              onClick={fetchUserPreferences}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </AnimatedElement>

        {loading ? (
          <div className="glass-card-light p-6 rounded-lg">
            <div className="flex justify-center">
              <div className="w-8 h-8 border-t-2 border-primary-500 border-solid rounded-full animate-spin"></div>
            </div>
            <p className="text-center text-gray-400 mt-2">Loading your preferences...</p>
          </div>
        ) : (
          <AnimatedElement animation="fade-in-up" delay={100}>
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <p className="text-red-400">{error}</p>
                </div>
              )}
              
              {success && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <p className="text-green-400">{success}</p>
                </div>
              )}
              
              {/* News Sources */}
              <div className="glass-card-light p-6 rounded-lg mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Newspaper className="h-5 w-5 text-primary-400" />
                  <h2 className="text-xl font-semibold text-white">News Sources</h2>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Select the news sources you want to include in your feed. We'll prioritize content from these sources.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {availableSources.map((source) => (
                    <div 
                      key={source.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        preferences?.sources.includes(source.id)
                          ? 'bg-primary-500/10 border-primary-500/50 text-white'
                          : 'bg-dark-700/50 border-dark-600 text-gray-300 hover:border-primary-500/30'
                      }`}
                      onClick={() => toggleSource(source.id)}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`source-${source.id}`}
                          checked={preferences?.sources.includes(source.id) || false}
                          className="mr-3 h-4 w-4 text-primary-500 rounded border-gray-700 focus:ring-primary-500"
                          onChange={() => {}} // Handled by parent div click
                        />
                        <label htmlFor={`source-${source.id}`} className="flex-1 cursor-pointer">
                          {source.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Life Areas - Hidden since these are fixed */}
              {!lifeAreaHidden && (
                <div className="glass-card-light p-6 rounded-lg mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-5 w-5 text-primary-400">🧠</div>
                    <h2 className="text-xl font-semibold text-white">Life Areas</h2>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    These areas are used to categorize news based on their impact on different aspects of your life.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {preferences?.life_areas.map((area) => (
                      <div key={area} className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/50 text-white">
                        {area}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Update Interval */}
              <div className="glass-card-light p-6 rounded-lg mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="h-5 w-5 text-primary-400" />
                  <h2 className="text-xl font-semibold text-white">Update Frequency</h2>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  How often should we check for new personalized content? More frequent updates will provide more timely news but may increase resource usage.
                </p>
                
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Update Interval
                  </label>
                  <select 
                    value={preferences?.update_interval || '00:30:00'}
                    onChange={handleUpdateIntervalChange}
                    className="w-full px-4 py-2 rounded-lg bg-dark-700 border border-dark-600 focus:ring-primary-500 focus:border-primary-500 text-white"
                  >
                    {updateIntervalOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Current setting: Updates every {parseIntervalToString(preferences?.update_interval || '00:30:00')}
                  </p>
                </div>
              </div>
              
              {/* Notification Channels */}
              <div className="glass-card-light p-6 rounded-lg mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Bell className="h-5 w-5 text-primary-400" />
                  <h2 className="text-xl font-semibold text-white">Notification Channels</h2>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Choose how you want to receive notifications about high-impact news and alerts.
                </p>
                
                <div className="space-y-4">
                  {availableNotificationChannels.map((channel) => (
                    <div 
                      key={channel.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        preferences?.notification_channels.includes(channel.id)
                          ? 'bg-primary-500/10 border-primary-500/50 text-white'
                          : 'bg-dark-700/50 border-dark-600 text-gray-300 hover:border-primary-500/30'
                      }`}
                      onClick={() => toggleNotificationChannel(channel.id)}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`channel-${channel.id}`}
                          checked={preferences?.notification_channels.includes(channel.id) || false}
                          className="mr-3 h-4 w-4 text-primary-500 rounded border-gray-700 focus:ring-primary-500"
                          onChange={() => {}} // Handled by parent div click
                        />
                        <label htmlFor={`channel-${channel.id}`} className="flex-1 cursor-pointer">
                          {channel.name}
                        </label>
                      </div>
                      
                      {channel.id === 'email' && preferences?.notification_channels.includes(channel.id) && (
                        <p className="text-xs text-gray-400 mt-2 ml-7">
                          Email notifications will be sent to your account email address
                        </p>
                      )}
                      
                      {channel.id === 'push' && preferences?.notification_channels.includes(channel.id) && (
                        <p className="text-xs text-gray-400 mt-2 ml-7">
                          Push notifications require browser permissions to be enabled
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary px-6 py-2 flex items-center space-x-2"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Save Preferences</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </AnimatedElement>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;