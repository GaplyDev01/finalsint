import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-dark-800/90 backdrop-blur-md shadow-lg py-3 border-b border-dark-700' : 'bg-transparent py-5'
      }`}
    >
      <div className="container-custom flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <BarChart3 className="h-8 w-8 text-primary-400 group-hover:text-primary-300 transition-colors" />
            <span className="text-2xl font-bold text-white group-hover:text-primary-300 transition-colors">Sintillio</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-300 hover:text-primary-400 transition-colors">
            Features
          </a>
          <a href="#impact-score" className="text-gray-300 hover:text-primary-400 transition-colors">
            Impact Score
          </a>
          <a href="#how-it-works" className="text-gray-300 hover:text-primary-400 transition-colors">
            How It Works
          </a>
          <div className="relative group">
            <button className="flex items-center text-gray-300 hover:text-primary-400 transition-colors">
              Solutions <ChevronDown className="ml-1 h-4 w-4" />
            </button>
            <div className="absolute z-10 left-0 mt-2 w-48 rounded-md shadow-lg bg-dark-700 border border-dark-600 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <a
                  href="#professionals"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-600 hover:text-primary-400"
                  role="menuitem"
                >
                  For Professionals
                </a>
                <a
                  href="#investors"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-600 hover:text-primary-400"
                  role="menuitem"
                >
                  For Investors
                </a>
                <a
                  href="#enterprises"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-600 hover:text-primary-400"
                  role="menuitem"
                >
                  For Enterprises
                </a>
              </div>
            </div>
          </div>
          <a href="#pricing" className="text-gray-300 hover:text-primary-400 transition-colors">
            Pricing
          </a>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <Link to="/login" className="text-gray-300 hover:text-primary-400 transition-colors">
            Log in
          </Link>
          <Link to="/signup" className="btn btn-primary">
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-300 hover:text-primary-400 transition-colors"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-dark-800/95 border-t border-dark-700 backdrop-blur-md shadow-lg transition-all duration-300 ease-in-out transform ${
          isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="container-custom py-4 space-y-4">
          <a href="#features" className="block text-gray-300 hover:text-primary-400 transition-colors py-2">
            Features
          </a>
          <a href="#impact-score" className="block text-gray-300 hover:text-primary-400 transition-colors py-2">
            Impact Score
          </a>
          <a href="#how-it-works" className="block text-gray-300 hover:text-primary-400 transition-colors py-2">
            How It Works
          </a>
          <div className="py-2">
            <button 
              className="flex items-center justify-between w-full text-gray-300 hover:text-primary-400 transition-colors"
              onClick={() => {
                const solutionsPanel = document.getElementById('mobile-solutions');
                if (solutionsPanel) {
                  solutionsPanel.classList.toggle('hidden');
                }
              }}
            >
              Solutions <ChevronDown className="ml-1 h-4 w-4" />
            </button>
            <div id="mobile-solutions" className="hidden pl-4 mt-2 space-y-2">
              <a
                href="#professionals"
                className="block text-gray-300 hover:text-primary-400 transition-colors py-2"
              >
                For Professionals
              </a>
              <a
                href="#investors"
                className="block text-gray-300 hover:text-primary-400 transition-colors py-2"
              >
                For Investors
              </a>
              <a
                href="#enterprises"
                className="block text-gray-300 hover:text-primary-400 transition-colors py-2"
              >
                For Enterprises
              </a>
            </div>
          </div>
          <a href="#pricing" className="block text-gray-300 hover:text-primary-400 transition-colors py-2">
            Pricing
          </a>
          <div className="flex flex-col space-y-3 pt-3 border-t border-dark-600">
            <Link to="/login" className="text-gray-300 hover:text-primary-400 transition-colors py-2">
              Log in
            </Link>
            <Link to="/signup" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;