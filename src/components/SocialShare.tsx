import React from 'react';
import { Share2, Twitter, Facebook, Linkedin, Mail, MessageCircle } from 'lucide-react';
import { shareUrls } from '../lib/utils';

interface SocialShareProps {
  url: string;
  title: string;
  description: string;
  className?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ 
  url, 
  title, 
  description, 
  className = '' 
}) => {
  const handleShare = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <span className="text-sm text-white/70 font-medium">Share:</span>
      
      {navigator.share && (
        <button
          onClick={handleNativeShare}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          title="Share"
        >
          <Share2 size={16} className="text-white/70" />
        </button>
      )}
      
      <button
        onClick={() => handleShare(shareUrls.twitter(url, title))}
        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-full transition-colors"
        title="Share on Twitter"
      >
        <Twitter size={16} className="text-blue-400" />
      </button>
      
      <button
        onClick={() => handleShare(shareUrls.facebook(url))}
        className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-full transition-colors"
        title="Share on Facebook"
      >
        <Facebook size={16} className="text-blue-500" />
      </button>
      
      <button
        onClick={() => handleShare(shareUrls.linkedin(url, title, description))}
        className="p-2 bg-blue-700/20 hover:bg-blue-700/30 rounded-full transition-colors"
        title="Share on LinkedIn"
      >
        <Linkedin size={16} className="text-blue-600" />
      </button>
      
      <button
        onClick={() => handleShare(shareUrls.reddit(url, title))}
        className="p-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-full transition-colors"
        title="Share on Reddit"
      >
        <MessageCircle size={16} className="text-orange-400" />
      </button>
      
      <button
        onClick={() => window.location.href = shareUrls.email(url, title, description)}
        className="p-2 bg-gray-500/20 hover:bg-gray-500/30 rounded-full transition-colors"
        title="Share via Email"
      >
        <Mail size={16} className="text-gray-400" />
      </button>
    </div>
  );
};

export default SocialShare;