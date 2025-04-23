import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, User as UserDetails, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../components/DashboardLayout';
import AnimatedElement from '../components/AnimatedElement';

interface ProfileData {
  id: number;
  user_id: string;
  role: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUserAndProfile();
  }, []);

  const fetchUserAndProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/login');
        return;
      }

      setUser(session.user);
      
      // Fetch user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }
      
      if (profileData) {
        setProfile(profileData);
        setBio(profileData.bio || '');
        setAvatarUrl(profileData.avatar_url || null);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Only allow image files
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
      setAvatarFile(file);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!user || !avatarFile) return avatarUrl;
    
    try {
      setUploadingAvatar(true);
      
      // Generate a unique file name
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, avatarFile);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      setError(error.message || 'Failed to upload avatar');
      return avatarUrl;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Upload avatar if a new one was selected
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        finalAvatarUrl = await uploadAvatar();
      }
      
      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          bio, 
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Log this activity
      const { error: logError } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: user.id,
          action: 'profile_update',
          reference_id: profile.id.toString()
        });
      
      if (logError) {
        console.error('Error logging activity:', logError);
      }
      
      setSuccess('Profile updated successfully');
      
      // Clear the avatar file after successful upload
      setAvatarFile(null);
      
      // Refetch the profile to get the updated data
      fetchUserAndProfile();
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AnimatedElement animation="fade-in-up">
          <h1 className="text-2xl font-bold text-white">Your Profile</h1>
          <p className="text-gray-400">Manage your personal information and preferences</p>
        </AnimatedElement>

        {loading ? (
          <div className="glass-card-light p-6 rounded-lg">
            <div className="flex justify-center">
              <div className="w-8 h-8 border-t-2 border-primary-500 border-solid rounded-full animate-spin"></div>
            </div>
            <p className="text-center text-gray-400 mt-2">Loading your profile...</p>
          </div>
        ) : (
          <AnimatedElement animation="fade-in-up" delay={100}>
            <div className="glass-card-light p-6 rounded-lg">
              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <p className="text-red-400">{error}</p>
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <p className="text-green-400">{success}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User Information */}
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-white">Account Information</h2>
                  <p className="text-gray-400 text-sm">Your basic account details</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                    <div className="flex items-center px-4 py-2 rounded-lg bg-dark-700 border border-dark-600">
                      <UserDetails className="h-5 w-5 text-gray-500 mr-2" />
                      <p className="text-gray-300">{user?.email}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Your email address cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Account Type</label>
                    <div className="flex items-center px-4 py-2 rounded-lg bg-dark-700 border border-dark-600">
                      <User className="h-5 w-5 text-gray-500 mr-2" />
                      <p className="text-gray-300 capitalize">{profile?.role || 'User'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Profile Information */}
                <div className="pt-4 border-t border-dark-700">
                  <div className="space-y-1 mb-6">
                    <h2 className="text-xl font-semibold text-white">Profile Information</h2>
                    <p className="text-gray-400 text-sm">Customize how others see you</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Profile Picture</label>
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-32 h-32 rounded-full bg-dark-700 border-2 border-dark-600 overflow-hidden flex items-center justify-center relative group">
                          {avatarUrl ? (
                            <img 
                              src={avatarUrl} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-16 w-16 text-gray-500" />
                          )}
                          
                          <div className="absolute inset-0 bg-dark-900/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-8 w-8 text-primary-400" />
                          </div>
                        </div>
                        
                        <label className="btn btn-outline py-2 px-4 cursor-pointer">
                          {uploadingAvatar ? 'Uploading...' : 'Upload Image'}
                          <input 
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                            disabled={uploadingAvatar}
                          />
                        </label>
                        
                        <p className="text-xs text-gray-500 text-center">
                          Recommended: Square JPG or PNG, max 2MB
                        </p>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Bio
                          </label>
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={6}
                            className="w-full px-4 py-2 rounded-lg bg-dark-700 border border-dark-600 focus:ring-primary-500 focus:border-primary-500 text-white resize-none"
                            placeholder="Tell us a bit about yourself..."
                          ></textarea>
                          <p className="text-xs text-gray-500 mt-1">
                            Share your professional background, interests, or anything you'd like others to know
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="pt-6 flex justify-end border-t border-dark-700">
                  <button
                    type="submit"
                    disabled={saving || uploadingAvatar}
                    className="btn btn-primary px-6"
                  >
                    {saving ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        Saving...
                      </>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </AnimatedElement>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;