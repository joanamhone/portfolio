import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Code, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col"
    >
      {/* Hero Section */}
      <section className="py-20 md:py-32 px-4">
        <div className="container mx-auto text-center">
          <motion.h1 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Welcome to <span className="gradient-text">My Portfolio</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12"
          >
            Explore my journey through the worlds of cybersecurity and software engineering. 
            Choose your path below to see specialized projects and experiences.
          </motion.p>
        </div>
      </section>

      {/* Path Selection */}
      <section className="flex-grow flex flex-col md:flex-row items-stretch px-4 pb-20">
        <div className="container mx-auto flex flex-col md:flex-row gap-8">
          {/* Cybersecurity Path */}
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex-1"
          >
            <Link to="/cybersecurity" className="pathway pathway-cyber group block h-full">
              <div className="pathway-content">
                <div className="bg-secondary/30 p-3 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Shield size={40} className="text-accent-cyber" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Cybersecurity Engineer</h2>
                <p className="text-white/90 mb-6">
                  Explore my cybersecurity projects, certifications, and expertise in protecting digital assets and infrastructure.
                </p>
                <div className="inline-flex items-center space-x-2 text-accent-cyber font-medium">
                  <span>View Portfolio</span>
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Software Engineering Path */}
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex-1"
          >
            <Link to="/software" className="pathway pathway-software group block h-full">
              <div className="pathway-content">
                <div className="bg-secondary/30 p-3 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Code size={40} className="text-accent-software" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Software Engineer</h2>
                <p className="text-white/90 mb-6">
                  Discover my software development projects, technical skills, and creative solutions across various platforms.
                </p>
                <div className="inline-flex items-center space-x-2 text-accent-software font-medium">
                  <span>View Portfolio</span>
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;