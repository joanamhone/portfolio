import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  if (pathnames.length === 0) return null;

  const breadcrumbItems = [
    { name: 'Home', path: '/', icon: Home }
  ];

  pathnames.forEach((name, index) => {
    const path = `/${pathnames.slice(0, index + 1).join('/')}`;
    let displayName = name.charAt(0).toUpperCase() + name.slice(1);
    
    // Handle specific routes
    if (name === 'cybersecurity') displayName = 'Cybersecurity';
    if (name === 'software') displayName = 'Software';
    if (name.length > 20) displayName = 'Blog Post'; // For long blog IDs
    
    breadcrumbItems.push({ name: displayName, path });
  });

  return (
    <nav className="flex items-center space-x-2 text-sm text-white/60 mb-6">
      {breadcrumbItems.map((item, index) => (
        <div key={item.path} className="flex items-center">
          {index > 0 && <ChevronRight size={14} className="mx-2" />}
          {index === 0 ? (
            <Link to={item.path} className="flex items-center hover:text-accent transition-colors">
              <item.icon size={14} className="mr-1" />
              <span>{item.name}</span>
            </Link>
          ) : index === breadcrumbItems.length - 1 ? (
            <span className="text-white/80">{item.name}</span>
          ) : (
            <Link to={item.path} className="hover:text-accent transition-colors">
              {item.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;