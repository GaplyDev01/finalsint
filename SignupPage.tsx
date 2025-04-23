import React, { useState } from 'react';
import { BarChart3, UserPlus, Mail, Lock, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AnimatedElement from '../components/AnimatedElement';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDetailedError(null);

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    // Check password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      console.log("Starting signup process with email:", email);
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            // Automatically set admin to true if it's a blindvibe.com email
            // This is for UI purposes, the actual role is handled by the database trigger
            is_admin: email.endsWith('@blindvibe.com')
          }
        },
      });

      if (signUpError) {
        console.error("Signup error:", signUpError);
        throw signUpError;
      }
      
      if (data && data.user) {
        console.log("User created successfully:", data.user.id);
        
        // User preferences will be created by the database trigger now
        // No need to manually create them here
        
        setShowVerification(true);
      } else {
        throw new Error("User creation failed without error message");
      }
    } catch (error: any) {
      console.error("Caught exception during signup:", error);
      
      // Display a user-friendly error message
      setError(error.message || 'Failed to sign up');
      
      // If the error has more details, display them separately
      if (error.details || error.hint || (typeof error === 'object' && error.data)) {
        const details = error.details || error.hint || JSON.stringify(error.data);
        setDetailedError(details);
      }
    } finally {
      setLoading(false);
    }
  };

  if (showVerification) {
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
              <BarChart3 className="h-12 w-12 text-primary-400 mx-auto" />
              <h2 className="text-2xl font-bold text-white mt-4">Check your email</h2>
              <p className="text-gray-400 mt-2">
                We've sent a verification link to <span className="text-white font-semibold">{email}</span>
              </p>
            </div>

            <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/30 mb-6">
              <p className="text-sm text-gray-300">
                Please check your email and click the verification link to complete your registration.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setShowVerification(false)}
                className="w-full flex justify-center items-center py-2 px-4 border border-dark-600 rounded-lg shadow-sm text-white bg-dark-700 hover:bg-dark-600 focus:outline-none transition-colors"
              >
                Back to sign up
              </button>
              
              <Link 
                to="/login"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none transition-colors"
              >
                Go to login
              </Link>
            </div>
          </AnimatedElement>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-800 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 blockchain-grid opacity-30"></div>
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-radial from-primary-500/5 to-transparent opacity-30"></div>
        <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-radial from-secondary-500/5 to-transparent opacity-30"></div>
        
        {/* Dynamic elements */}
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-primary-500/30 rounded-full animate-float"></div>
        <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-secondary-500/30 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="glass-card-light max-w-md w-full mx-auto p-8 rounded-xl border border-dark-600/80 hover:border-primary-500/30 transition-all duration-300 shadow-xl relative z-10">
        <AnimatedElement animation="fade-in-up">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center mb-6">
              <BarChart3 className="h-10 w-10 text-primary-400" />
              <span className="ml-2 text-3xl font-bold text-white">Sintillio</span>
            </Link>
            <h2 className="text-2xl font-bold text-white">Create an account</h2>
            <p className="text-gray-400 mt-2">Join the future of news intelligence</p>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fade-in-up" delay={100}>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-red-400 text-sm">{error}</span>
                {detailedError && (
                  <div className="mt-1 text-xs text-red-400/80">
                    {detailedError}
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-dark-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-dark-700 text-white"
                  placeholder="your@email.com"
                />
              </div>
              {email.endsWith('@blindvibe.com') && (
                <p className="text-green-400 text-sm mt-1">
                  ✓ You will receive admin access with this email domain.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-dark-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-dark-700 text-white"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters long
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-dark-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-dark-700 text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <UserPlus className="h-5 w-5 mr-2" />
                )}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>
        </AnimatedElement>

        <AnimatedElement animation="fade-in-up" delay={200}>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </AnimatedElement>
      </div>
    </div>
  );
};

export default SignupPage;