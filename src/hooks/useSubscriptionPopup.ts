import { useState, useEffect } from 'react';

export const useSubscriptionPopup = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Don't show if already subscribed or dismissed this session
    const isSubscribed = localStorage.getItem('newsletter_subscribed');
    const isDismissed = sessionStorage.getItem('popup_dismissed');
    
    if (isSubscribed || isDismissed) {
      return;
    }

    // Show popup after 30 seconds of page load
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 30000);

    // Also show on scroll (50% of page)
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      if (scrollPercent > 50 && !showPopup) {
        setShowPopup(true);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showPopup]);

  const closePopup = () => {
    setShowPopup(false);
  };

  return { showPopup, closePopup };
};