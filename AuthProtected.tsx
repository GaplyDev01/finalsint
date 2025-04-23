import { ReactNode, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Navigate, useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';

interface AuthProtectedProps {
  children: ReactNode;
}

export default function AuthProtected({ children }: AuthProtectedProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      
      setUser(session?.user || null);
      setLoading(false);
      
      // Set up auth state listener
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        (_event, session) => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-800">
        <div className="glass-card p-8 text-center">
          <div className="w-10 h-10 border-t-2 border-primary-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}