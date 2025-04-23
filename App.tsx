import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './sections/HeroSection';
import FeaturesSection from './sections/FeaturesSection';
import ImpactScoreSection from './sections/ImpactScoreSection';
import HowItWorksSection from './sections/HowItWorksSection';
import TestimonialsSection from './sections/TestimonialsSection';
import PricingSection from './sections/PricingSection';
import CallToAction from './sections/CallToAction';
import Footer from './components/Footer';
import { ScrollAnimationProvider } from './context/ScrollAnimationContext';
import CanvasBackground from './components/CanvasBackground';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import EmailConfirmationPage from './pages/EmailConfirmationPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminContentSearch from './pages/AdminContentSearch';
import AdminVerification from './pages/AdminVerification';
import AdminCryptoNews from './pages/AdminCryptoNews';
import AdminAddContent from './pages/AdminAddContent';
import NewsFeedPage from './pages/NewsFeedPage';
import AuthProtected from './components/AuthProtected';
import AdminProtected from './components/AdminProtected';
import { supabase } from './lib/supabase';

function LandingPage() {
  useEffect(() => {
    // Test Supabase connection by fetching profiles
    const testSupabaseConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(5);
        
        if (error) {
          console.error('Supabase query error:', error);
        } else {
          console.log('Successfully connected to Supabase. Profiles data:', data);
        }
      } catch (err) {
        console.error('Supabase connection error:', err);
      }
    };
    
    testSupabaseConnection();
  }, []);

  return (
    <ScrollAnimationProvider>
      <div className="min-h-screen flex flex-col text-gray-100 overflow-hidden relative">
        <CanvasBackground />
        <Navbar />
        <main className="flex-grow">
          <HeroSection />
          <FeaturesSection />
          <ImpactScoreSection />
          <HowItWorksSection />
          <TestimonialsSection />
          <PricingSection />
          <CallToAction />
        </main>
        <Footer />
      </div>
    </ScrollAnimationProvider>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
        <Route path="/email-confirmation" element={<EmailConfirmationPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <AuthProtected>
            <DashboardPage />
          </AuthProtected>
        } />
        
        <Route path="/news-feed" element={
          <AuthProtected>
            <NewsFeedPage />
          </AuthProtected>
        } />
        
        <Route path="/profile" element={
          <AuthProtected>
            <ProfilePage />
          </AuthProtected>
        } />
        
        <Route path="/settings" element={
          <AuthProtected>
            <SettingsPage />
          </AuthProtected>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminProtected>
            <AdminDashboardPage />
          </AdminProtected>
        } />
        
        <Route path="/admin/search" element={
          <AdminProtected>
            <AdminContentSearch />
          </AdminProtected>
        } />
        
        <Route path="/admin/verify" element={
          <AdminProtected>
            <AdminVerification />
          </AdminProtected>
        } />
        
        <Route path="/admin/crypto" element={
          <AdminProtected>
            <AdminCryptoNews />
          </AdminProtected>
        } />
        
        <Route path="/admin/add-content" element={
          <AdminProtected>
            <AdminAddContent />
          </AdminProtected>
        } />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;