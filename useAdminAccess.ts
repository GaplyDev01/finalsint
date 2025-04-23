import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function useAdminAccess() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        setLoading(true);
        setError(null);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        
        // First check: Domain-based admin access
        const userEmail = session.user.email;
        if (userEmail && userEmail.endsWith('@blindvibe.com')) {
          console.log('Domain-based admin access granted');
          setIsAdmin(true);
          setLoading(false);
          return;
        }
        
        // Second check: Role-based admin access
        const { data: role, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();
          
        if (rolesError) {
          throw rolesError;
        }
        
        // Check if admin role was found
        if (role) {
          console.log('Role-based admin access granted');
          setIsAdmin(true);
        } else {
          console.log('No admin access found');
          setIsAdmin(false);
        }
      } catch (err: any) {
        console.error('Error checking admin status:', err);
        setError(err.message || 'Failed to check admin status');
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }
    
    checkAdminStatus();
  }, []);
  
  return { isAdmin, loading, error };
}