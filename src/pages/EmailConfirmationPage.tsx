import React, { useEffect, useState } from 'react';
import { BarChart3, CheckCircle, XCircle, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AnimatedElement from '../components/AnimatedElement';

const EmailConfirmationPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setEmail(session.user.email);
          
          // Check if email is confirmed
          if (session.user.email_confirmed_at) {
            // Email already confirmed, redirect to dashboard after a short delay
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
          } else {
            setError("Email not confirmed yet. Please check your inbox and click the confirmation link.");
          }
        } else {
          setError("No active session found. Please log in again.");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred during email confirmation");
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();
  }, [navigate]);

  const handleResendConfirmation = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      
      setError("Confirmation email resent. Please check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to resend confirmation email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-800 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 blockchain-grid opacity-30"></div>
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-radial from-primary-500/5 to-transparent opacity-30"></div>
        <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-radial from-secondary-500/5 to-transparent opacity-30"></div>
      </div>

      <div className="glass-card-light max-w-md w-full mx-auto p-8 rounded-xl border border-dark-600/80 hover:border-primary-500/30 transition-all duration-300 shadow-xl relative z-10">
        <AnimatedElement animation="fade-in-up">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center mb-6">
              <BarChart3 className="h-10 w-10 text-primary-400" />
              <span className="ml-2 text-3xl font-bold text-white">Sintillio</span>
            </Link>
            <h2 className="text-2xl font-bold text-white">Email Confirmation</h2>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fade-in-up" delay={100}>
          <div className="flex flex-col items-center justify-center space-y-6">
            {loading ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader className="h-12 w-12 text-primary-400 animate-spin" />
                <p className="text-gray-300">Verifying your email...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center space-y-4">
                <XCircle className="h-12 w-12 text-red-500" />
                <p className="text-gray-300 text-center">{error}</p>
                
                {email && (
                  <button 
                    onClick={handleResendConfirmation}
                    disabled={loading}
                    className="mt-4 px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                  >
                    {loading ? 'Sending...' : 'Resend Confirmation Email'}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="text-gray-300 text-center">
                  Your email has been confirmed successfully!
                </p>
                <p className="text-gray-400 text-center">
                  You'll be redirected to the dashboard shortly...
                </p>
              </div>
            )}

            <div className="pt-6 border-t border-dark-600 w-full flex justify-center">
              <Link 
                to="/login" 
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </div>
  );
};

export default EmailConfirmationPage;