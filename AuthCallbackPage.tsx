import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallbackPage() {
  const [message, setMessage] = useState('Processing authentication...');
  const navigate = useNavigate();

  useEffect(() => {
    const { hash } = window.location;
    
    const handleAuthRedirect = async () => {
      // If auth redirect contains a hash, handle it
      if (hash && hash.includes('access_token')) {
        try {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (data?.session) {
            navigate('/dashboard');
          } else {
            navigate('/login');
          }
        } catch (error) {
          console.error('Error getting session:', error);
          setMessage('Authentication failed. Please try logging in again.');
          setTimeout(() => navigate('/login'), 2000);
        }
      } else {
        // No hash present, redirect to login
        navigate('/login');
      }
    };

    handleAuthRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-800">
      <div className="glass-card p-8 text-center">
        <div className="w-10 h-10 border-t-2 border-primary-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white">{message}</p>
      </div>
    </div>
  );
}