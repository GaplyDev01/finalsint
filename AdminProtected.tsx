import { ReactNode, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Navigate, useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import useAdminAccess from '../hooks/useAdminAccess';

interface AdminProtectedProps {
  children: ReactNode;
}

export default function AdminProtected({ children }: AdminProtectedProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { isAdmin, loading: adminLoading, error: adminError } = useAdminAccess();
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      setUser(session.user);
      
      // Set up auth state listener
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        async (_event, session) => {
          setUser(session?.user || null);
          if (!session) {
            navigate('/login');
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }

    checkUser();
  }, [navigate]);

  // Only finish loading when both user and admin checks are complete
  useEffect(() => {
    if (!adminLoading && user !== null) {
      setLoading(false);
    }
  }, [adminLoading, user]);

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-800">
        <div className="glass-card p-8 text-center">
          <div className="w-10 h-10 border-t-2 border-primary-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-800">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">You don't have permission to access the admin area. Please contact your administrator if you believe this is an error.</p>
          {adminError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{adminError}</p>
            </div>
          )}
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}