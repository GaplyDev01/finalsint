import React, { useState } from 'react';
import { Check, Info } from 'lucide-react';
import AnimatedElement from '../components/AnimatedElement';
import { Link } from 'react-router-dom';

const PricingSection: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  
  const plans = [
    {
      name: "Starter",
      description: "Perfect for individual professionals seeking personalized news insights.",
      price: isAnnual ? 9 : 14,
      features: [
        "Daily Personalized News Feed",
        "Basic Impact Scoring",
        "Career & Investment Categorization",
        "Mobile App Access",
        "5 Custom News Categories",
      ],
      cta: "Start Free Trial",
      highlight: false,
    },
    {
      name: "Professional",
      description: "Advanced features for serious investors and career-focused individuals.",
      price: isAnnual ? 19 : 29,
      features: [
        "Everything in Starter",
        "Real-time High Impact Alerts",
        "Market Prediction Insights",
        "Blockchain Analytics Dashboard",
        "15 Custom News Categories",
        "Action Recommendations",
        "Weekly Impact Report",
      ],
      cta: "Get Professional",
      highlight: true,
    },
    {
      name: "Enterprise",
      description: "Custom solutions for teams and organizations with specialized needs.",
      price: "Custom",
      features: [
        "Everything in Professional",
        "Team Collaboration Features",
        "API Access",
        "Custom Integrations",
        "Industry-specific Models",
        "Dedicated Account Manager",
        "Custom Impact Metrics",
        "Private Data Sources",
      ],
      cta: "Contact Sales",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-16 md:py-24 bg-dark-800 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 blockchain-grid opacity-30"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-secondary-500/5 rounded-full blur-3xl"></div>
        
        {/* Dynamic elements */}
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-primary-500/30 rounded-full animate-float"></div>
        <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-secondary-500/30 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="container-custom relative z-10">
        <AnimatedElement animation="fade-in-up" className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
            Simple, Transparent <span className="text-primary-400">Pricing</span>
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Choose the plan that fits your needs. All plans include a 14-day free trial with full access to all features.
          </p>
          
          <div className="inline-flex items-center p-1 bg-dark-700/70 rounded-full border border-dark-600">
            <button
              className={`py-2 px-6 rounded-full transition-all ${
                isAnnual ? 'bg-dark-600 text-white shadow-lg' : 'text-gray-400'
              }`}
              onClick={() => setIsAnnual(true)}
            >
              Annual <span className="text-green-400 text-sm font-medium">Save 35%</span>
            </button>
            <button
              className={`py-2 px-6 rounded-full transition-all ${
                !isAnnual ? 'bg-dark-600 text-white shadow-lg' : 'text-gray-400'
              }`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </button>
          </div>
        </AnimatedElement>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <AnimatedElement 
              key={index} 
              animation="fade-in-up" 
              delay={index * 150}
              className={`glass-card-light rounded-2xl overflow-hidden transition-all ${
                plan.highlight 
                  ? 'border-2 border-primary-500/50 shadow-neon relative transform hover:-translate-y-1' 
                  : 'border border-dark-700/70 hover:border-primary-500/30'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 inset-x-0 transform -translate-y-1/2">
                  <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium px-4 py-1 rounded-full shadow-neon border border-primary-400/30">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-6 h-12">{plan.description}</p>
                
                <div className="mb-6">
                  {typeof plan.price === 'number' ? (
                    <div className="flex items-end">
                      <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">${plan.price}</span>
                      <span className="text-gray-400 ml-2">/{isAnnual ? 'month, billed annually' : 'month'}</span>
                    </div>
                  ) : (
                    <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">{plan.price}</div>
                  )}
                </div>
                
                <Link 
                  to="/signup" 
                  className={`w-full flex justify-center py-3 rounded-lg font-medium mb-6 transition-colors ${
                    plan.highlight 
                      ? 'btn btn-primary shadow-neon border border-primary-400/30' 
                      : 'bg-dark-700 hover:bg-dark-600 text-gray-300 border border-dark-600 hover:border-primary-500/30'
                  }`}
                >
                  {plan.cta}
                </Link>
                
                <div className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedElement>
          ))}
        </div>
        
        <AnimatedElement animation="fade-in" delay={600} className="mt-16 glass-card p-6 rounded-xl border border-dark-700 hover:border-primary-500/30 max-w-4xl mx-auto transition-all duration-300">
          <div className="flex items-start">
            <div className="mr-4 mt-1">
              <Info className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Need a custom solution?</h4>
              <p className="text-gray-400 mb-4">
                We offer tailored enterprise solutions for organizations with specific needs. Our team can create custom 
                impact scoring models for your industry, integrate with your existing systems, and provide dedicated support.
              </p>
              <a href="#contact" className="text-primary-400 font-medium hover:text-primary-300 transition-colors">
                Contact our sales team →
              </a>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
};

export default PricingSection;