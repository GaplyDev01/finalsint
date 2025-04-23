import React from 'react';
import { TrendingUp, Zap, Brain, Shield, BarChart3, Newspaper, Tag, Briefcase } from 'lucide-react';
import AnimatedElement from '../components/AnimatedElement';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Personal Impact Scoring",
      description: "Every news story is scored based on how it directly impacts your career, investments, and personal interests.",
      color: "bg-gradient-to-br from-primary-500/20 to-primary-700/30 text-primary-400 border-primary-500/30",
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Analysis",
      description: "Advanced AI algorithms analyze news content to extract meaningful insights tailored to your specific situation.",
      color: "bg-gradient-to-br from-secondary-500/20 to-secondary-700/30 text-secondary-400 border-secondary-500/30",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Market Impact Predictions",
      description: "Understand how news will affect your investments with blockchain-focused market predictions.",
      color: "bg-gradient-to-br from-accent-500/20 to-accent-700/30 text-accent-400 border-accent-500/30",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Real-time Alerts",
      description: "Receive instant notifications for high-impact news that requires your immediate attention.",
      color: "bg-gradient-to-br from-red-500/20 to-red-700/30 text-red-400 border-red-500/30",
    },
    {
      icon: <Newspaper className="h-6 w-6" />,
      title: "Curated News Feed",
      description: "Your daily news feed is intelligently curated to show you what matters most to you.",
      color: "bg-gradient-to-br from-purple-500/20 to-purple-700/30 text-purple-400 border-purple-500/30",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Proactive Planning",
      description: "Get actionable recommendations to mitigate risk and capitalize on opportunities from breaking news.",
      color: "bg-gradient-to-br from-green-500/20 to-green-700/30 text-green-400 border-green-500/30",
    },
    {
      icon: <Tag className="h-6 w-6" />,
      title: "Custom Categories",
      description: "Create personalized news categories that align with your specific interests and investments.",
      color: "bg-gradient-to-br from-blue-500/20 to-blue-700/30 text-blue-400 border-blue-500/30",
    },
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "Industry-Specific Insights",
      description: "Tailored analysis for professionals across finance, tech, healthcare, and more.",
      color: "bg-gradient-to-br from-indigo-500/20 to-indigo-700/30 text-indigo-400 border-indigo-500/30",
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-dark-800 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full blockchain-grid opacity-30"></div>
        <div className="absolute top-40 -right-20 w-80 h-80 bg-secondary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
        
        {/* Animated elements */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-primary-400/80 rounded-full shadow-neon"></div>
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-secondary-400/80 rounded-full shadow-neon-secondary"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <AnimatedElement animation="fade-in-up" className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
            Transforming News into <span className="text-primary-400">Personalized Intelligence</span>
          </h2>
          <p className="text-lg text-gray-400">
            Our platform doesn't just deliver news—it delivers understanding. See how Sintillio's unique features 
            help you grasp the true impact of global events on your personal and professional life.
          </p>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <AnimatedElement 
              key={index}
              animation="fade-in-up"
              delay={index * 100} 
              className="feature-card glass-card-light card-hover-effect"
            >
              <div className={`${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg border transition-transform group-hover:scale-110`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400">
                {feature.description}
              </p>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;