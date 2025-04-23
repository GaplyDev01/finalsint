import React from 'react';
import { Zap, BarChart, PieChart, Users, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import AnimatedElement from '../components/AnimatedElement';
import ActivityFeed from '../components/ActivityFeed';
import NewsFeed from '../components/NewsFeed';
import TwitterFeed from '../components/TwitterFeed';
import useUserActivityLogs from '../hooks/useUserActivityLogs';

const DashboardPage: React.FC = () => {
  const { activities, loading: activitiesLoading, error: activitiesError, refresh: refreshActivities } = useUserActivityLogs(5);

  const cards = [
    {
      title: "Impact Score",
      value: "76",
      change: "+12%",
      trend: "up",
      color: "from-primary-500 to-primary-600",
      icon: <Zap className="h-5 w-5" />,
    },
    {
      title: "News Stories",
      value: "128",
      change: "+24",
      trend: "up",
      color: "from-secondary-500 to-secondary-600",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      title: "Engagement",
      value: "84%",
      change: "+5%",
      trend: "up",
      color: "from-green-500 to-green-600",
      icon: <PieChart className="h-5 w-5" />,
    },
    {
      title: "Sources",
      value: "42",
      change: "-2",
      trend: "down",
      color: "from-accent-500 to-accent-600",
      icon: <Users className="h-5 w-5" />,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AnimatedElement animation="fade-in-up">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Welcome back. Here's your news impact summary.</p>
        </AnimatedElement>

        <AnimatedElement animation="fade-in-up" delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => (
              <div 
                key={index}
                className="glass-card-light p-6 rounded-xl border border-dark-700 hover:border-primary-500/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} bg-opacity-20 flex items-center justify-center text-white`}>
                    {card.icon}
                  </div>
                  <div className="flex items-center space-x-1">
                    {card.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <span className={card.trend === "up" ? "text-green-400 text-sm" : "text-red-400 text-sm"}>
                      {card.change}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm text-gray-400">{card.title}</h3>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedElement>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <AnimatedElement animation="fade-in-up" delay={200} className="lg:col-span-7">
            <NewsFeed limit={4} />
          </AnimatedElement>

          <AnimatedElement animation="fade-in-up" delay={250} className="lg:col-span-5">
            <div className="grid grid-cols-1 gap-6">
              <TwitterFeed />
              <ActivityFeed 
                activities={activities}
                loading={activitiesLoading}
                error={activitiesError}
                onRefresh={refreshActivities}
              />
            </div>
          </AnimatedElement>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedElement animation="fade-in-up" delay={500} className="md:col-span-3">
            <div className="glass-card-light rounded-xl border border-dark-700 hover:border-primary-500/30 transition-all duration-300 h-full">
              <div className="p-6 border-b border-dark-700">
                <h2 className="text-lg font-medium text-white">Upcoming Events</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-dark-800/50 border border-dark-700/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-white">Quarterly Economic Report</h3>
                        <p className="text-sm text-gray-400">Tomorrow, 10:00 AM</p>
                      </div>
                      <div className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded-md text-xs">
                        High Impact
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-dark-800/50 border border-dark-700/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-white">Tech Conference 2025</h3>
                        <p className="text-sm text-gray-400">May 15, 9:00 AM</p>
                      </div>
                      <div className="px-2 py-1 bg-secondary-500/20 text-secondary-400 rounded-md text-xs">
                        Medium Impact
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-dark-800/50 border border-dark-700/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-white">Blockchain Regulation Announcement</h3>
                        <p className="text-sm text-gray-400">May 18, 2:00 PM</p>
                      </div>
                      <div className="px-2 py-1 bg-red-500/20 text-red-400 rounded-md text-xs">
                        Critical Impact
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedElement>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;