import React from 'react';
import { ArrowRight, LineChart, BarChart3, BarChart, Zap } from 'lucide-react';
import AnimatedElement from '../components/AnimatedElement';
import { Link } from 'react-router-dom';

const CallToAction: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-dark-800 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 blockchain-grid opacity-10"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-dark-800 to-transparent"></div>
        
        {/* Abstract patterns and animated elements */}
        <div className="absolute top-20 left-10 opacity-10 animate-float">
          <BarChart3 className="w-32 h-32" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-10 animate-float" style={{ animationDelay: '2s' }}>
          <LineChart className="w-24 h-24" />
        </div>
        <div className="absolute top-1/2 left-1/3 opacity-10 animate-float" style={{ animationDelay: '1s' }}>
          <BarChart className="w-20 h-20" />
        </div>
        <div className="absolute top-1/3 right-1/4 opacity-10 animate-float" style={{ animationDelay: '3s' }}>
          <Zap className="w-16 h-16" />
        </div>
        
        {/* Glowing accents */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-primary-400/80 rounded-full shadow-neon"></div>
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-secondary-400/80 rounded-full shadow-neon-secondary"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedElement animation="fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
              Transform how you consume news with blockchain-powered insights
            </h2>
          </AnimatedElement>
          
          <AnimatedElement animation="fade-in-up" delay={100}>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Join thousands of professionals and investors who are making more informed decisions with Sintillio's AI-powered news platform.
            </p>
          </AnimatedElement>
          
          <AnimatedElement animation="fade-in-up" delay={200}>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link to="/signup" className="btn btn-primary shadow-neon border border-primary-400/30 hover:shadow-neon-lg transition-all duration-300">
                Start Your Free 14-Day Trial
              </Link>
              <a href="#demo" className="btn btn-outline backdrop-blur-sm border-2 border-white/20 text-white hover:border-white/40 hover:bg-white/5 flex items-center">
                Request a Demo <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </div>
          </AnimatedElement>
          
          <AnimatedElement animation="fade-in-up" delay={300}>
            <div className="glass-card p-6 max-w-2xl mx-auto border border-dark-700/70 hover:border-primary-500/30 transition-all duration-300">
              <div className="font-medium mb-2 text-primary-400">No credit card required</div>
              <p className="text-gray-400 text-sm">
                Start with a free 14-day trial with full access to all features. Cancel anytime.
                We'll send you a reminder 3 days before your trial ends.
              </p>
            </div>
          </AnimatedElement>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;