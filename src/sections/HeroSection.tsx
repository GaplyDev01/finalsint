import React from 'react';
import { TrendingUp, ChevronRight, Bitcoin, BarChart } from 'lucide-react';
import AnimatedElement from '../components/AnimatedElement';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <section className="pt-28 pb-16 md:pt-36 md:pb-24 flex items-center justify-center relative overflow-hidden bg-dark-800">
      <div className="absolute inset-0 z-0">
        {/* Create dynamic canvas background elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full border border-primary-500/10 animate-spin-slow"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full border border-secondary-500/10 animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
        <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-primary-500/20 rounded-full animate-float"></div>
        <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-secondary-500/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        
        {/* Glowing accent points */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary-400/80 rounded-full shadow-neon"></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-secondary-400/80 rounded-full shadow-neon-secondary"></div>
        
        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-radial from-primary-500/5 to-transparent opacity-30"></div>
        <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-radial from-secondary-500/5 to-transparent opacity-30"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <AnimatedElement animation="fade-in-up">
              <div className="bg-gradient-to-r from-primary-500/10 to-primary-400/20 backdrop-blur-sm text-primary-400 rounded-full inline-flex items-center px-4 py-1.5 mb-5 border border-primary-500/20 shadow-lg">
                <TrendingUp className="w-4 h-4 mr-1.5" />
                <span className="text-sm font-medium">Web3 News Intelligence</span>
              </div>
            </AnimatedElement>
            
            <AnimatedElement animation="fade-in-up" delay={100}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 text-glow">Decentralized</span> News Impact Scoring
              </h1>
            </AnimatedElement>
            
            <AnimatedElement animation="fade-in-up" delay={200}>
              <p className="text-lg text-gray-400 mb-8 max-w-lg mx-auto lg:mx-0">
                Sintillio delivers blockchain-powered insights through the lens of your career, investments, and interests, 
                using AI to help you navigate market shifts and digital asset opportunities.
              </p>
            </AnimatedElement>
            
            <AnimatedElement animation="fade-in-up" delay={300}>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link to="/signup" className="btn btn-primary shadow-neon border border-primary-400/50">
                  Start Free Trial
                </Link>
                <a href="#how-it-works" className="btn btn-outline backdrop-blur-sm border-2 border-primary-400/50 hover:border-primary-400 flex items-center">
                  Explore the Technology <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </div>
            </AnimatedElement>
            
            {/* Moved Bitcoin prediction card here */}
            <AnimatedElement animation="fade-in" delay={400} className="mt-6">
              <div className="bg-gradient-to-br from-dark-800 to-dark-900 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-dark-600/80 hover:border-secondary-500/30 max-w-sm mx-auto lg:mx-0 text-white shadow-lg shadow-dark-900/30 transition-all duration-300 card-hover-effect depth-3">
                <div className="text-sm font-medium mb-3 text-white flex items-center">
                  <Bitcoin className="w-5 h-5 mr-2 text-secondary-400" /> 
                  <span>Market Prediction</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary-500/20 to-secondary-600/30 text-secondary-400 rounded-xl flex items-center justify-center shadow-neon-secondary border border-secondary-500/30 transition-transform duration-300">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-sm leading-tight">
                    BTC price likely to <span className="text-secondary-400 font-medium">increase 2.3%</span> in next 24h
                  </div>
                </div>
              </div>
            </AnimatedElement>
            
            <AnimatedElement animation="fade-in" delay={500}>
              <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-8">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      src={`https://images.pexels.com/photos/91227${i}/pexels-photo-91227${i}.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2`}
                      alt={`User ${i}`}
                      className="w-10 h-10 rounded-full border-2 border-dark-700 object-cover shadow-lg"
                    />
                  ))}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/30 to-primary-700/50 text-primary-300 text-xs flex items-center justify-center border-2 border-dark-700 shadow-lg backdrop-blur-sm">
                    +2k
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  <span className="text-gray-300 font-semibold">2,000+ professionals</span> trust our blockchain insights
                </div>
              </div>
            </AnimatedElement>
          </div>
          
          <AnimatedElement animation="scale-in" delay={200} className="lg:ml-auto">
            <div className="relative">
              {/* Animated background glow */}
              <div className="absolute -z-10 inset-0 bg-gradient-conic from-primary-500/20 via-secondary-500/20 to-accent-500/20 rounded-3xl blur-xl opacity-70 animate-pulse-slow"></div>
              
              {/* Main card */}
              <div className="glass-card-light overflow-hidden rounded-3xl shadow-2xl backdrop-blur-md border border-dark-600/80 hover:border-primary-500/30 transition-colors duration-300">
                <div className="bg-gradient-to-r from-dark-900 to-dark-800 p-4 text-white flex items-center justify-between border-b border-dark-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm flex items-center">
                    <BarChart className="h-4 w-4 mr-2 text-primary-400" />
                    <span>Sintillio Dashboard</span>
                  </div>
                  <div></div>
                </div>
                <div className="p-6 md:p-8 flex flex-col space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">Your Impact Feed</h3>
                    <div className="flex items-center space-x-1 bg-gradient-to-r from-primary-500/20 to-primary-600/20 text-primary-400 px-3 py-1 rounded-full text-sm border border-primary-500/30 shadow-lg">
                      <TrendingUp className="w-4 h-4" />
                      <span>High impact day</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      {
                        title: "Fed Raises Interest Rates by 0.5%",
                        impact: 85,
                        color: "from-red-500 to-red-600"
                      },
                      {
                        title: "New Blockchain Regulations Announced",
                        impact: 72,
                        color: "from-orange-500 to-orange-600"
                      },
                      {
                        title: "Tech Giant Acquires AI Startup",
                        impact: 64,
                        color: "from-yellow-500 to-yellow-600"
                      },
                      {
                        title: "Market Recovery in Asian Stock Exchange",
                        impact: 45,
                        color: "from-green-500 to-green-600"
                      }
                    ].map((item, i) => (
                      <div key={i} className="glass-card p-4 rounded-xl flex items-center justify-between border border-dark-600/80 hover:border-primary-500/30 transition-all duration-300 card-hover-effect">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{item.title}</h4>
                          <div className="text-sm text-gray-400">2 hours ago • Finance</div>
                        </div>
                        <div className="ml-4 w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-md shadow-lg border border-white/10 bg-gradient-to-br backdrop-blur-sm" style={{backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`, '--tw-gradient-from': item.color.split(' ')[0].replace('from-', ''), '--tw-gradient-to': item.color.split(' ')[1].replace('to-', '')}}>
                          {item.impact}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-2">
                    <Link to="/signup" className="w-full btn btn-primary bg-gradient-to-r from-primary-500 to-primary-600 shadow-neon border border-primary-400/30 hover:shadow-neon-lg transition-all duration-300">
                      View Your Full Impact Report
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedElement>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;