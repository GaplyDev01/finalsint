import React from 'react';
import { Quote } from 'lucide-react';
import AnimatedElement from '../components/AnimatedElement';
import { Link } from 'react-router-dom';

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      text: "Sintillio has completely transformed how I consume financial news. The impact scores help me immediately understand which stories deserve my attention, saving me hours each day.",
      author: "Sarah Johnson",
      position: "Investment Analyst, Goldman Sachs",
      avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
    {
      text: "As a blockchain entrepreneur, staying on top of market changes is critical. Sintillio's predictive insights have helped me make strategic decisions ahead of market movements multiple times.",
      author: "Michael Chen",
      position: "Founder, BlockChain Ventures",
      avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
    {
      text: "The personalized impact scoring is unlike anything I've seen before. It's like having a financial advisor and news curator in one elegant platform. Worth every penny.",
      author: "Priya Patel",
      position: "Tech Investment Director",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-dark-800 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 blockchain-grid opacity-20"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl"></div>
        
        {/* Glowing accents */}
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-primary-400/80 rounded-full shadow-neon"></div>
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-secondary-400/80 rounded-full shadow-neon-secondary"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <AnimatedElement animation="fade-in-up" className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
            What Our Users Are <span className="text-primary-400">Saying</span>
          </h2>
          <p className="text-lg text-gray-400">
            Professionals and investors around the world trust Sintillio to navigate the complex landscape of news and market insights.
          </p>
        </AnimatedElement>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <AnimatedElement 
              key={index} 
              animation="fade-in-up" 
              delay={index * 150}
              className="glass-card-light p-8 rounded-2xl border border-dark-700 card-hover-effect"
            >
              <div className="flex flex-col h-full">
                <div className="mb-6 text-primary-400">
                  <Quote className="h-10 w-10" />
                </div>
                
                <p className="text-gray-300 flex-grow mb-6">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author} 
                    className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-primary-500/50 shadow-neon"
                  />
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-sm text-gray-400">{testimonial.position}</div>
                  </div>
                </div>
              </div>
            </AnimatedElement>
          ))}
        </div>
        
        <AnimatedElement animation="fade-in-up" delay={600} className="mt-16 text-center max-w-3xl mx-auto">
          <div className="glass-card p-8 rounded-2xl border border-primary-500/30 shadow-neon">
            <div className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
              Join over 2,000+ professionals getting personalized news insights daily
            </div>
            <p className="text-gray-400 mb-6">
              From Wall Street analysts to blockchain developers, our users save an average of 2 hours daily while making better informed decisions.
            </p>
            <Link to="/signup" className="btn btn-primary shadow-neon border border-primary-400/30 hover:shadow-neon-lg transition-all duration-300">
              Start Your Free Trial
            </Link>
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
};

export default TestimonialsSection;