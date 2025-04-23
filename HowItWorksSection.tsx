import React from 'react';
import { Brain, Database, TrendingUp, Search, Users } from 'lucide-react';
import AnimatedElement from '../components/AnimatedElement';
import { Link } from 'react-router-dom';

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "1. Create Your Profile",
      description: "Set up your profile with your career details, investment portfolio, and personal interests to tailor your experience.",
      color: "bg-gradient-to-br from-primary-500/20 to-primary-700/30 text-primary-400 border-primary-500/30",
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: "2. AI News Gathering",
      description: "Our AI continuously monitors thousands of news sources to collect relevant information in real-time.",
      color: "bg-gradient-to-br from-secondary-500/20 to-secondary-700/30 text-secondary-400 border-secondary-500/30",
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "3. Personalized Analysis",
      description: "Advanced algorithms analyze how each story impacts your specific circumstances and priorities.",
      color: "bg-gradient-to-br from-accent-500/20 to-accent-700/30 text-accent-400 border-accent-500/30",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "4. Impact Scoring",
      description: "Each news item receives an impact score from 1-100 based on its relevance and potential effect on you.",
      color: "bg-gradient-to-br from-purple-500/20 to-purple-700/30 text-purple-400 border-purple-500/30",
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "5. Actionable Insights",
      description: "Receive tailored recommendations to help you respond to news in ways that benefit your financial and career goals.",
      color: "bg-gradient-to-br from-green-500/20 to-green-700/30 text-green-400 border-green-500/30",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-dark-800 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 blockchain-grid opacity-30"></div>
        <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-radial from-secondary-500/10 to-transparent opacity-30"></div>
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-radial from-primary-500/10 to-transparent opacity-30"></div>
        
        {/* Dynamic background elements */}
        <div className="absolute bottom-1/4 right-1/4 w-4 h-4 bg-primary-500/20 rounded-full animate-float"></div>
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-secondary-500/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary-400/80 rounded-full shadow-neon"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <AnimatedElement animation="fade-in-up" className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
            How <span className="text-primary-400">Sintillio</span> Works
          </h2>
          <p className="text-lg text-gray-400">
            Our innovative platform uses AI and blockchain technologies to transform how you consume news.
            Here's the step-by-step process behind our impact scoring system.
          </p>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {steps.map((step, index) => (
            <AnimatedElement 
              key={index} 
              animation="fade-in-up" 
              delay={index * 100}
              className="relative"
            >
              <div className="glass-card-light p-6 rounded-2xl border border-dark-600/80 hover:border-primary-500/30 transition-all duration-300 h-full card-hover-effect">
                <div className={`${step.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg border transition-transform duration-300`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-400">
                  {step.description}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/4 -right-4 transform z-10">
                  <div className="w-8 h-8 text-primary-400 rotate-90 md:rotate-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </div>
                </div>
              )}
            </AnimatedElement>
          ))}
        </div>
        
        <AnimatedElement animation="fade-in-up" delay={600} className="mt-16 text-center">
          <Link to="/signup" className="btn btn-primary shadow-neon border border-primary-400/30 hover:shadow-neon-lg transition-all duration-300">
            Experience Sintillio Today
          </Link>
        </AnimatedElement>
      </div>
    </section>
  );
};

export default HowItWorksSection;