import React from 'react';
import { BarChart3, Twitter, Facebook, Instagram, Linkedin, Mail, ChevronRight } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-900 text-gray-300 pt-16 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-radial from-primary-500/5 to-transparent opacity-30"></div>
        <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-radial from-secondary-500/5 to-transparent opacity-30"></div>
        <div className="absolute inset-0 blockchain-grid"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 group">
              <BarChart3 className="h-8 w-8 text-primary-400 group-hover:text-primary-300 transition-colors" />
              <span className="text-2xl font-bold text-white group-hover:text-primary-300 transition-colors">Sintillio</span>
            </div>
            <p className="text-gray-400">
              Redefining news consumption with AI-powered impact scoring and personalized insights for professionals and investors.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-500 hover:text-primary-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Product</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" /> Features
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" /> Impact Score
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" /> AI News Feed
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" /> Market Insights
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" /> Blockchain Analytics
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" /> About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" /> Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" /> Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" /> Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" /> Press Kit
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Subscribe</h3>
            <p className="text-gray-400 mb-4">
              Get the latest news and updates from Sintillio delivered to your inbox.
            </p>
            <form className="space-y-3">
              <div className="flex items-center">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="px-4 py-2 rounded-l-full focus:outline-none text-gray-800 bg-dark-700 border-2 border-dark-600 focus:border-primary-500 transition-colors text-sm w-full"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-colors px-4 py-2 rounded-r-full"
                >
                  <Mail className="h-5 w-5 text-white" />
                </button>
              </div>
              <p className="text-xs text-gray-500">
                By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
              </p>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Sintillio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;