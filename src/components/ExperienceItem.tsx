import React from 'react';
import { motion } from 'framer-motion';

interface ExperienceItemProps {
  title: string;
  company: string;
  period: string;
  description: string;
  highlights: string[];
}

const ExperienceItem: React.FC<ExperienceItemProps> = ({ 
  title, 
  company, 
  period, 
  description, 
  highlights 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="card"
    >
      <div className="md:flex md:justify-between md:items-start mb-4">
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-white/80">{company}</p>
        </div>
        <p className="text-white/60 mt-1 md:mt-0">{period}</p>
      </div>
      
      <p className="text-white/80 mb-4">{description}</p>
      
      {highlights.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Key Achievements</h4>
          <ul className="list-disc pl-5 space-y-1 text-white/80">
            {highlights.map((highlight, index) => (
              <li key={index}>{highlight}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default ExperienceItem;