import React from 'react';
import { TrendingUp, TrendingDown, BellRing, AlertTriangle } from 'lucide-react';
import AnimatedElement from '../components/AnimatedElement';

const ImpactScoreSection: React.FC = () => {
  const impactCategories = [
    { label: "Career", percentage: 78, color: "bg-gradient-to-r from-primary-500 to-primary-600" },
    { label: "Investments", percentage: 92, color: "bg-gradient-to-r from-secondary-500 to-secondary-600" },
    { label: "Personal", percentage: 45, color: "bg-gradient-to-r from-accent-500 to-accent-600" },
    { label: "Industry", percentage: 85, color: "bg-gradient-to-r from-purple-500 to-purple-600" },
  ];

  return (
    <section id="impact-score" className="py-16 md:py-24 bg-dark-800 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 blockchain-grid opacity-30"></div>
        <div className="absolute top-20 right-0 w-full h-1/2 bg-gradient-radial from-primary-500/10 to-transparent opacity-60"></div>
        <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl"></div>
        
        {/* Animated dots */}
        <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-primary-500/30 rounded-full animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-secondary-500/30 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <AnimatedElement animation="fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
                Your Personal <span className="text-primary-400">Impact Score</span>
              </h2>
            </AnimatedElement>
            
            <AnimatedElement animation="fade-in-up" delay={100}>
              <p className="text-lg text-gray-400 mb-8">
                Sintillio's proprietary Impact Score quantifies how each news story affects your specific circumstances. 
                Say goodbye to information overload and focus on what truly matters to you.
              </p>
            </AnimatedElement>
          
            <div className="space-y-6">
              {impactCategories.map((category, index) => (
                <AnimatedElement key={index} animation="fade-in-up" delay={200 + index * 100}>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-medium">{category.label} Impact</span>
                      <span className="text-white font-semibold">{category.percentage}%</span>
                    </div>
                    <div className="h-3 w-full bg-dark-700 rounded-full overflow-hidden border border-dark-600">
                      <div 
                        className={`h-full ${category.color} shadow-neon transition-all duration-1000 ease-out`} 
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </AnimatedElement>
              ))}
            </div>
            
            <AnimatedElement animation="fade-in-up" delay={600}>
              <div className="mt-10">
                <a href="#sign-up" className="btn btn-primary shadow-neon border border-primary-400/30 hover:shadow-neon-lg transition-all duration-300">
                  Get Your Personal Impact Score
                </a>
              </div>
            </AnimatedElement>
          </div>
          
          <AnimatedElement animation="scale-in" delay={300}>
            <div className="glass-card-light rounded-3xl overflow-hidden backdrop-blur-md border border-dark-600/80 hover:border-primary-500/30 transition-all duration-300 shadow-xl depth-3">
              <div className="bg-gradient-to-r from-dark-900 to-dark-800 text-white p-6 border-b border-dark-700">
                <h3 className="text-2xl font-semibold mb-2">Impact Dashboard</h3>
                <p className="text-gray-400">
                  Real-time impact scoring shown in action
                </p>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 p-5 rounded-xl bg-dark-800/50 border border-dark-600 card-hover-effect">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-200">Daily Impact</h4>
                      <div className="flex items-center text-green-400">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">+12%</span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white">76<span className="text-lg font-normal text-gray-500">/100</span></div>
                    <div className="mt-2 text-sm text-gray-400">Higher than usual impact today</div>
                  </div>
                  
                  <div className="flex-1 p-5 rounded-xl bg-dark-800/50 border border-dark-600 card-hover-effect">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-200">Alerts</h4>
                      <div className="flex items-center text-red-400">
                        <BellRing className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">3 new</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/30 text-red-400 flex items-center justify-center border border-red-500/30">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/30 text-orange-400 flex items-center justify-center border border-orange-500/30">
                        <TrendingDown className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/30 text-green-400 flex items-center justify-center border border-green-500/30">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-400">Crypto market volatility + 2 others</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-200">Top Impact Stories</h4>
                  
                  <div className="bg-gradient-to-br from-dark-800/50 to-dark-700/30 border border-primary-500/30 p-5 rounded-xl card-hover-effect">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-primary-400 font-medium mb-1">BREAKING NEWS • FINANCE</div>
                        <h5 className="font-medium text-white">Major Cryptocurrency Exchange Announces New Regulations</h5>
                      </div>
                      <div className="ml-4 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center font-bold shadow-neon border border-primary-400/30">
                        94
                      </div>
                    </div>
                    <div className="mt-3 p-3 glass-card-light rounded-lg">
                      <div className="text-sm text-gray-200 font-medium">Impact Analysis:</div>
                      <div className="text-sm text-gray-400">This directly affects your blockchain investments and could impact prices by 15-20% in the short term.</div>
                    </div>
                  </div>
                  
                  <div className="bg-dark-800/50 border border-dark-600 p-5 rounded-xl hover:border-secondary-500/30 transition-all duration-300 card-hover-effect">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 font-medium mb-1">TECH • 2 HOURS AGO</div>
                        <h5 className="font-medium text-white">AI Integration Boosts Financial Tech Products</h5>
                      </div>
                      <div className="ml-4 w-14 h-14 rounded-full bg-gradient-to-br from-secondary-500 to-secondary-600 text-white flex items-center justify-center font-bold shadow-neon-secondary border border-secondary-400/30">
                        78
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-dark-800/50 border border-dark-600 p-5 rounded-xl hover:border-green-500/30 transition-all duration-300 card-hover-effect">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 font-medium mb-1">CAREER • 4 HOURS AGO</div>
                        <h5 className="font-medium text-white">Job Market Expands in Blockchain Development Sector</h5>
                      </div>
                      <div className="ml-4 w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center font-bold border border-green-400/30">
                        65
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <a href="#" className="text-primary-400 font-medium flex items-center justify-center hover:text-primary-300 transition-colors">
                    View Full Impact Report
                  </a>
                </div>
              </div>
            </div>
          </AnimatedElement>
        </div>
      </div>
    </section>
  );
};

export default ImpactScoreSection;