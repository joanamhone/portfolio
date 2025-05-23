import React from 'react';

interface SkillBadgeProps {
  label: string;
  type: 'cyber' | 'software';
}

const SkillBadge: React.FC<SkillBadgeProps> = ({ label, type }) => {
  const bgColor = type === 'cyber' 
    ? 'bg-accent-cyber/20 text-accent-cyber border-accent-cyber/30' 
    : 'bg-accent-software/20 text-accent-software border-accent-software/30';
  
  return (
    <span className={`text-xs px-2 py-1 rounded border ${bgColor}`}>
      {label}
    </span>
  );
};

export default SkillBadge;