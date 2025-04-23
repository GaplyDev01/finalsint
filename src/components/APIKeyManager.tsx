import React, { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, AlertCircle, CheckCircle, Key, RefreshCw, LockKeyhole } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface APIKey {
  id: string;
  key: string;
  description: string | null;
  service: string;
  created_at: string;
  updated_at: string;
}

interface APIKeyManagerProps {
  onUpdate?: () => void;
}

const APIKeyManager: React.FC<APIKeyManagerProps> = ({ onUpdate }) => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [editValues, setEditValues] = useState<Record<string, { key: string, description: string }>>({});

  // Fetch API keys from Supabase
  const fetchAPIKeys = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('api_keys')
        .select('*')
        .order('service');

      if (fetchError) throw fetchError;

      setApiKeys(data || []);

      // Initialize edit values
      const initialEditValues: Record<string, { key: string, description: string }> = {};
      data?.forEach(key => {
        initialEditValues[key.id] = { 
          key: key.key, 
          description: key.description || '' 
        };
      });
      setEditValues(initialEditValues);

    } catch (err: any) {
      console.error('Error fetching API keys:', err);
      setError(err.message || 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  // Toggle visibility of an API key
  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  // Toggle edit mode for an API key
  const toggleEditMode = (keyId: string) => {
    const newEditMode = {
      ...editMode,
      [keyId]: !editMode[keyId]
    };
    setEditMode(newEditMode);

    // Reset to original values if canceling edit
    if (!newEditMode[keyId]) {
      const key = apiKeys.find(k => k.id === keyId);
      if (key) {
        setEditValues({
          ...editValues,
          [keyId]: { 
            key: key.key, 
            description: key.description || '' 
          }
        });
      }
    }
  };

  // Handle input changes
  const handleInputChange = (keyId: string, field: 'key' | 'description', value: string) => {
    setEditValues(prev => ({
      ...prev,
      [keyId]: {
        ...prev[keyId],
        [field]: value
      }
    }));
  };

  // Save API key changes
  const saveAPIKey = async (keyId: string) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const { key, description } = editValues[keyId];

      const { error: updateError } = await supabase
        .from('api_keys')
        .update({ 
          key,
          description,
          updated_at: new Date().toISOString()
        })
        .eq('id', keyId);

      if (updateError) throw updateError;

      setSuccess(`API key ${keyId} updated successfully`);
      toggleEditMode(keyId);
      fetchAPIKeys();

      // Call onUpdate if provided
      if (onUpdate) {
        onUpdate();
      }

    } catch (err: any) {
      console.error('Error updating API key:', err);
      setError(err.message || `Failed to update API key ${keyId}`);
    } finally {
      setSaving(false);
    }
  };

  // Load API keys on component mount
  useEffect(() => {
    fetchAPIKeys();
  }, []);

  return (
    <div className="glass-card-light rounded-lg overflow-hidden">
      <div className="p-6 border-b border-dark-700 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">API Credentials</h2>
          <p className="text-gray-400 text-sm">Manage API keys for external services</p>
        </div>
        <button
          onClick={fetchAPIKeys}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-primary-400 transition-colors rounded-full hover:bg-dark-700"
          title="Refresh API keys"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-6">
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

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-t-2 border-primary-500 border-solid rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {apiKeys.length > 0 ? (
              apiKeys.map(apiKey => (
                <div 
                  key={apiKey.id}
                  className="glass-card p-4 rounded-lg border border-dark-600 hover:border-primary-500/30 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <Key className="h-5 w-5 text-primary-400 mr-2" />
                        <h3 className="text-lg font-medium text-white">
                          {apiKey.service === 'firecrawl' ? 'Firecrawl API' : apiKey.service}
                        </h3>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        {apiKey.description || `API key for ${apiKey.service}`}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleEditMode(apiKey.id)}
                      className={`px-3 py-1 text-sm rounded ${
                        editMode[apiKey.id]
                          ? 'bg-dark-600 text-gray-300'
                          : 'bg-primary-500/10 text-primary-400 hover:bg-primary-500/20'
                      } transition-colors`}
                    >
                      {editMode[apiKey.id] ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  <div className="mt-4">
                    {editMode[apiKey.id] ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            API Key
                          </label>
                          <div className="relative">
                            <input
                              type={visibleKeys[apiKey.id] ? 'text' : 'password'}
                              value={editValues[apiKey.id]?.key || ''}
                              onChange={(e) => handleInputChange(apiKey.id, 'key', e.target.value)}
                              className="w-full pl-10 pr-10 py-2 border border-dark-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-dark-700 text-white"
                              placeholder="Enter API key"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <LockKeyhole className="h-5 w-5 text-gray-500" />
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleKeyVisibility(apiKey.id)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                            >
                              {visibleKeys[apiKey.id] ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={editValues[apiKey.id]?.description || ''}
                            onChange={(e) => handleInputChange(apiKey.id, 'description', e.target.value)}
                            className="w-full px-4 py-2 border border-dark-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-dark-700 text-white"
                            placeholder="Description (optional)"
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <button
                            onClick={() => saveAPIKey(apiKey.id)}
                            disabled={saving}
                            className="btn btn-primary px-4 py-2 flex items-center space-x-2"
                          >
                            {saving ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                <span>Save Changes</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium text-gray-300">API Key:</div>
                          <div className="bg-dark-700 px-4 py-1 rounded text-gray-400 flex-1 flex items-center">
                            <div className="flex-1">••••••••••••••••••••••••••••</div>
                            <button
                              onClick={() => toggleKeyVisibility(apiKey.id)}
                              className="text-gray-500 hover:text-gray-300 ml-2"
                            >
                              {visibleKeys[apiKey.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        {visibleKeys[apiKey.id] && (
                          <div className="mt-2 p-2 bg-dark-700 rounded text-sm text-gray-300 font-mono break-all">
                            {apiKey.key}
                          </div>
                        )}
                        
                        <div className="mt-2 text-xs text-gray-500">
                          Last updated: {new Date(apiKey.updated_at).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Key className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No API keys found</p>
                <p className="text-gray-500 text-sm mt-2">Contact an administrator to add API keys</p>
              </div>
            )}
            
            <p className="text-sm text-gray-500 mt-4">
              <AlertCircle className="h-4 w-4 inline-block mr-1" />
              API keys are encrypted and stored securely. Only administrators can view and manage keys.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default APIKeyManager;