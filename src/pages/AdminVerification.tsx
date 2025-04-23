import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertTriangle, RefreshCw, Database, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';

interface UserAdminStatus {
  user_id: string;
  email: string;
  has_admin_role: boolean;
  is_admin_flag: boolean;
  domain_eligible: boolean;
}

const AdminVerification: React.FC = () => {
  const [users, setUsers] = useState<UserAdminStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fixingRoles, setFixingRoles] = useState(false);

  const verifyAdminRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Get all users that should be admins (from auth.users with blindvibe.com domain)
      const { data: blindvibeUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, user_id, is_admin')
        .order('created_at');
        
      if (usersError) throw usersError;
      
      if (!blindvibeUsers || blindvibeUsers.length === 0) {
        setUsers([]);
        throw new Error('No users found in profiles');
      }
      
      // Get user IDs
      const userIds = blindvibeUsers.map(profile => profile.user_id);
      
      // Fetch user emails (this should be accessible via the auth.users or other table)
      // This is a simplified approach, in reality you might need another method
      const { data: userEmails, error: emailsError } = await supabase.auth.admin.listUsers();
      
      // If we can't get emails directly, we'll use a different approach
      // For demonstration, we'll use a placeholder
      const emailMap = new Map();
      
      if (emailsError || !userEmails) {
        console.warn("Couldn't fetch user emails directly, using simplified check");
      } else {
        userEmails.users.forEach(user => {
          emailMap.set(user.id, user.email);
        });
      }
      
      // Check if these users have admin role in user_roles table
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds)
        .eq('role', 'admin');
        
      if (rolesError) throw rolesError;
      
      // Create a map of user IDs to admin role status
      const adminRoleMap = new Map();
      userRoles?.forEach(role => {
        adminRoleMap.set(role.user_id, true);
      });
      
      // Combine the data
      const usersWithStatus: UserAdminStatus[] = blindvibeUsers.map(profile => {
        const email = emailMap.get(profile.user_id) || `user-${profile.user_id.substring(0, 8)}@example.com`;
        const domainEligible = email.endsWith('@blindvibe.com');
        
        return {
          user_id: profile.user_id,
          email: email,
          has_admin_role: adminRoleMap.has(profile.user_id),
          is_admin_flag: profile.is_admin || false,
          domain_eligible: domainEligible
        };
      });
      
      setUsers(usersWithStatus);
    } catch (err: any) {
      console.error('Error verifying admin roles:', err);
      setError(err.message || 'Failed to verify admin roles');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fix missing admin roles
  const fixMissingAdminRoles = async () => {
    try {
      setFixingRoles(true);
      setError(null);
      setSuccess(null);
      
      const missingRoles = users.filter(user => 
        (user.domain_eligible || user.is_admin_flag) && !user.has_admin_role
      );
      
      if (missingRoles.length === 0) {
        setSuccess('No missing admin roles to fix!');
        setFixingRoles(false);
        return;
      }
      
      for (const user of missingRoles) {
        // Add admin role for users missing it
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.user_id,
            role: 'admin',
            assigned_at: new Date().toISOString()
          });
          
        if (error) {
          console.error(`Error adding admin role for user ${user.email}:`, error);
        }
        
        // Update profile if is_admin flag is missing
        if (!user.is_admin_flag) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('user_id', user.user_id);
            
          if (profileError) {
            console.error(`Error updating is_admin flag for user ${user.email}:`, profileError);
          }
        }
      }
      
      setSuccess(`Fixed admin roles for ${missingRoles.length} users!`);
      // Refresh the data
      await verifyAdminRoles();
      
    } catch (err: any) {
      console.error('Error fixing admin roles:', err);
      setError(err.message || 'Failed to fix admin roles');
    } finally {
      setFixingRoles(false);
    }
  };
  
  // Initial verification
  useEffect(() => {
    verifyAdminRoles();
  }, []);
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Role Verification</h1>
            <p className="text-gray-400">Confirm that users with @blindvibe.com emails have admin roles</p>
          </div>
          
          <div className="flex space-x-4">
            <button 
              onClick={fixMissingAdminRoles}
              disabled={loading || fixingRoles}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Database className={`h-4 w-4 ${fixingRoles ? 'animate-spin' : ''}`} />
              <span>Fix Missing Roles</span>
            </button>
            
            <button 
              onClick={verifyAdminRoles}
              disabled={loading || fixingRoles}
              className="btn btn-outline flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <p className="text-green-400">{success}</p>
          </div>
        )}
        
        <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg flex items-start">
          <Info className="h-5 w-5 text-primary-400 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-primary-400 font-medium">Admin Access Protection</p>
            <p className="text-gray-300 text-sm mt-1">
              This page now checks and fixes three admin verification methods:
            </p>
            <ol className="list-decimal ml-5 mt-2 text-gray-300 text-sm space-y-1">
              <li><strong>Email Domain:</strong> Ensures users with @blindvibe.com emails have admin access</li>
              <li><strong>User Roles:</strong> Verifies the correct entry in the user_roles table</li>
              <li><strong>Profile Flag:</strong> Confirms the is_admin flag is set in profiles</li>
            </ol>
            <p className="text-gray-400 text-sm mt-2">
              All three methods work independently, providing redundancy to prevent admin access loss.
            </p>
          </div>
        </div>
        
        {loading ? (
          <div className="glass-card-light p-6 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 border-t-2 border-primary-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Verifying admin roles...</p>
            </div>
          </div>
        ) : (
          <div className="glass-card-light overflow-hidden rounded-lg">
            <div className="p-6 border-b border-dark-700">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-primary-400 mr-2" />
                <h2 className="text-lg font-medium text-white">Admin Role Status</h2>
              </div>
            </div>
            
            <div className="p-6">
              {users.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-400 mb-4">
                    Users with admin privileges: {users.filter(u => u.has_admin_role || u.is_admin_flag || u.domain_eligible).length} out of {users.length}
                  </p>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-dark-700">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email Domain</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Admin Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Admin Flag</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-700">
                        {users.map((user) => (
                          <tr key={user.user_id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.user_id.substring(0, 8)}...</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.domain_eligible ? (
                                <div className="flex items-center text-green-400">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  <span>Eligible</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-gray-400">
                                  <span>Not eligible</span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.has_admin_role ? (
                                <div className="flex items-center text-green-400">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  <span>Assigned</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-red-400">
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  <span>Missing</span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.is_admin_flag ? (
                                <div className="flex items-center text-green-400">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  <span>Set</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-red-400">
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  <span>Not Set</span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {(user.has_admin_role || user.is_admin_flag || user.domain_eligible) ? (
                                <div className="flex items-center text-green-400">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  <span>Admin Access</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-gray-400">
                                  <span>Regular User</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No users found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Create a user to see admin role verification in action
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="glass-card-light p-6 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Create a Test Admin User</h3>
          <p className="text-gray-400 mb-4">
            To test the triple admin role assignment, create a new user with an @blindvibe.com email.
            The system will automatically assign them admin privileges through all three mechanisms.
          </p>
          
          <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4">
            <p className="text-sm text-primary-400">
              <strong>How it works:</strong> The new migration adds three redundant systems:
            </p>
            <ol className="list-decimal ml-5 mt-2 text-primary-400 text-sm space-y-1">
              <li>The database trigger <code>handle_new_user</code> checks email domains and assigns admin roles</li>
              <li>The <code>set_admin_flag</code> function ensures the profile's is_admin flag is set</li>
              <li>The <code>is_admin()</code> function checks all methods when evaluating policies</li>
            </ol>
            <p className="text-sm text-primary-400 mt-2">
              This triple-verification system ensures you never lose admin access.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminVerification;