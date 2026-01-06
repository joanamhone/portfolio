import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Shield, Code, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-secondary/90 backdrop-blur-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <motion.div 
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "loop", ease: "linear" }}
            className="relative w-8 h-8"
          >
            <div className="absolute inset-0 bg-primary rounded-full opacity-70"></div>
            <div className="absolute inset-[2px] bg-secondary rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-primary-light rounded-full"></div>
            </div>
          </motion.div>
          <span className="font-bold text-xl gradient-text">Joana Promise Mhone</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <NavLink to="/" icon={<Home size={16} />} label="Home" />
          <NavLink to="/cybersecurity" icon={<Shield size={16} />} label="Cybersecurity" />
          <NavLink to="/software" icon={<Code size={16} />} label="Software" />
          <NavLink to="/blog" icon={<BookOpen size={16} />} label="Blog" />
        </div>

        {/* Mobile Navigation Toggle */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-white focus:outline-none"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="md:hidden absolute top-full left-0 right-0 bg-secondary/95 backdrop-blur-md shadow-lg"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <MobileNavLink to="/" icon={<Home size={18} />} label="Home" />
            <MobileNavLink to="/cybersecurity" icon={<Shield size={18} />} label="Cybersecurity" />
            <MobileNavLink to="/software" icon={<Code size={18} />} label="Software" />
            <MobileNavLink to="/blog" icon={<BookOpen size={18} />} label="Blog" />
          </div>
        </motion.div>
      )}
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={`relative flex items-center space-x-1 font-medium transition-colors duration-300 ${
        isActive ? 'text-accent' : 'text-white hover:text-accent-cyber'
      }`}
    >
      {icon}
      <span>{label}</span>
      {isActive && (
        <motion.div 
          layoutId="navIndicator"
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent" 
        />
      )}
    </Link>
  );
};

const MobileNavLink: React.FC<NavLinkProps> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={`flex items-center space-x-3 p-3 rounded-md transition-colors duration-300 ${
        isActive ? 'bg-primary/20 text-accent' : 'text-white hover:bg-primary/10 hover:text-accent-cyber'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export default Navbar;