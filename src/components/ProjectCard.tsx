import React from 'react';
import SkillBadge from './SkillBadge';

interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  accentColor: 'cyber' | 'software';
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, description, tags, accentColor }) => {
  return (
    <div className="card neon-border h-full flex flex-col">
      <h3 className="font-bold text-lg mb-3">{title}</h3>
      <p className="text-white/80 mb-4 flex-grow">{description}</p>
      <div className="flex flex-wrap gap-2 mt-auto">
        {tags.map((tag, index) => (
          <SkillBadge key={index} label={tag} type={accentColor} />
        ))}
      </div>
    </div>
  );
};

export default ProjectCard;