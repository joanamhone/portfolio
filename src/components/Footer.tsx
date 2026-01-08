import React from 'react';
import { Github, Linkedin} from 'lucide-react';
import NewsletterSubscription from './NewsletterSubscription';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary/80 backdrop-blur-sm py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Joana Promise Mhone</h3>
            <p className="text-white/70 text-sm mb-4">
              Cybersecurity professional and software developer passionate about creating secure, innovative solutions.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="https://github.com/joanamhone" icon={<Github size={18} />} label="GitHub" />
              <SocialLink href="https://www.linkedin.com/in/joana-mhone-46a03b1b6" icon={<Linkedin size={18} />} label="LinkedIn" />
            </div>
          </div>
          
          <div className="flex justify-center md:justify-end">
            <NewsletterSubscription />
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/70 text-sm">&copy; {new Date().getFullYear()} Joana Promise Mhone. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

interface SocialLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const SocialLink: React.FC<SocialLinkProps> = ({ href, icon, label }) => {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-white/70 hover:text-accent transition-colors duration-300"
      aria-label={label}
    >
      {icon}
    </a>
  );
};

export default Footer;