// Reading time calculation utility
export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

// Social sharing utilities
export const shareUrls = {
  twitter: (url: string, title: string) => 
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  
  facebook: (url: string) => 
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  
  linkedin: (url: string, title: string, summary: string) => 
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`,
  
  reddit: (url: string, title: string) => 
    `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  
  email: (url: string, title: string, body: string) => 
    `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body + '\n\n' + url)}`
};

// Analytics tracking functions
import { supabase } from './supabase';

export const trackPageView = async (page: string, title?: string) => {
  if (!supabase) return;
  
  try {
    await supabase.from('analytics').insert({
      event_type: 'page_view',
      page_path: page,
      page_title: title,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

export const trackPostView = async (postId: string, postTitle: string) => {
  if (!supabase) return;
  
  try {
    await supabase.from('analytics').insert({
      event_type: 'post_view',
      post_id: postId,
      page_title: postTitle,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Post view tracking error:', error);
  }
};

export const trackUserEngagement = async (action: string, details?: any) => {
  if (!supabase) return;
  
  try {
    await supabase.from('analytics').insert({
      event_type: 'user_engagement',
      event_action: action,
      event_details: details,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Engagement tracking error:', error);
  }
};