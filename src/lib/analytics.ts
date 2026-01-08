import { supabase } from './supabase';

export interface Analytics {
  id: string;
  post_id?: string;
  event_type: 'page_view' | 'post_view' | 'post_like' | 'comment_submit' | 'newsletter_signup';
  user_ip?: string;
  user_agent?: string;
  referrer?: string;
  session_id: string;
  created_at: string;
}

export interface PostAnalytics {
  post_id: string;
  views: number;
  likes: number;
  comments: number;
  avg_read_time?: number;
  bounce_rate?: number;
}

// Generate session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Get user info
const getUserInfo = () => ({
  user_ip: '', // Will be populated by server
  user_agent: navigator.userAgent,
  referrer: document.referrer,
  session_id: getSessionId()
});

// Track page view
export const trackPageView = async (path: string) => {
  if (!supabase) return;
  
  try {
    await supabase.from('analytics').insert({
      event_type: 'page_view',
      ...getUserInfo(),
      metadata: { path }
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Track post view
export const trackPostView = async (postId: string) => {
  if (!supabase) return;
  
  try {
    await supabase.from('analytics').insert({
      post_id: postId,
      event_type: 'post_view',
      ...getUserInfo()
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Track post like
export const trackPostLike = async (postId: string) => {
  if (!supabase) return;
  
  try {
    await supabase.from('analytics').insert({
      post_id: postId,
      event_type: 'post_like',
      ...getUserInfo()
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Track comment submission
export const trackCommentSubmit = async (postId: string) => {
  if (!supabase) return;
  
  try {
    await supabase.from('analytics').insert({
      post_id: postId,
      event_type: 'comment_submit',
      ...getUserInfo()
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Track newsletter signup
export const trackNewsletterSignup = async () => {
  if (!supabase) return;
  
  try {
    await supabase.from('analytics').insert({
      event_type: 'newsletter_signup',
      ...getUserInfo()
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Get post analytics
export const getPostAnalytics = async (postId: string): Promise<PostAnalytics | null> => {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('post_id', postId);
    
    if (error) throw error;
    
    const views = data?.filter(d => d.event_type === 'post_view').length || 0;
    const likes = data?.filter(d => d.event_type === 'post_like').length || 0;
    const comments = data?.filter(d => d.event_type === 'comment_submit').length || 0;
    
    return {
      post_id: postId,
      views,
      likes,
      comments
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
};

// Get overall analytics
export const getOverallAnalytics = async () => {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const totalViews = data?.filter(d => d.event_type === 'page_view').length || 0;
    const totalPostViews = data?.filter(d => d.event_type === 'post_view').length || 0;
    const totalLikes = data?.filter(d => d.event_type === 'post_like').length || 0;
    const totalComments = data?.filter(d => d.event_type === 'comment_submit').length || 0;
    const totalSignups = data?.filter(d => d.event_type === 'newsletter_signup').length || 0;
    
    // Get unique sessions for visitor count
    const uniqueSessions = new Set(data?.map(d => d.session_id)).size;
    
    return {
      totalViews,
      totalPostViews,
      totalLikes,
      totalComments,
      totalSignups,
      uniqueVisitors: uniqueSessions,
      recentActivity: data?.slice(0, 10) || []
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
};