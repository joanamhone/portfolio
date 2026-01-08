import { supabase } from './supabase';

export interface Analytics {
  id: string;
  post_id?: string;
  event_type: 'page_view' | 'post_view' | 'post_like' | 'comment_submit' | 'newsletter_signup' | 'link_click' | 'scroll_depth' | 'time_on_page' | 'download' | 'search' | 'social_share';
  user_ip?: string;
  user_agent?: string;
  referrer?: string;
  session_id: string;
  metadata?: any;
  created_at: string;
}

export interface PostAnalytics {
  post_id: string;
  views: number;
  unique_views: number;
  likes: number;
  comments: number;
  shares: number;
  avg_time_on_page?: number;
  bounce_rate?: number;
  scroll_depth?: number;
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
      metadata: { path, timestamp: Date.now() }
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Track post view with time tracking
export const trackPostView = async (postId: string) => {
  if (!supabase) return;
  
  const startTime = Date.now();
  sessionStorage.setItem(`post_start_${postId}`, startTime.toString());
  
  try {
    await supabase.from('analytics').insert({
      post_id: postId,
      event_type: 'post_view',
      ...getUserInfo(),
      metadata: { start_time: startTime }
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Track time on page when user leaves
export const trackTimeOnPage = async (postId: string) => {
  if (!supabase) return;
  
  const startTime = sessionStorage.getItem(`post_start_${postId}`);
  if (!startTime) return;
  
  const timeSpent = Date.now() - parseInt(startTime);
  
  try {
    await supabase.from('analytics').insert({
      post_id: postId,
      event_type: 'time_on_page',
      ...getUserInfo(),
      metadata: { time_spent: timeSpent, duration_seconds: Math.round(timeSpent / 1000) }
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Track scroll depth
export const trackScrollDepth = async (postId: string, depth: number) => {
  if (!supabase) return;
  
  try {
    await supabase.from('analytics').insert({
      post_id: postId,
      event_type: 'scroll_depth',
      ...getUserInfo(),
      metadata: { scroll_percentage: depth }
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Track link clicks
export const trackLinkClick = async (url: string, linkText: string, postId?: string) => {
  if (!supabase) return;
  
  try {
    await supabase.from('analytics').insert({
      post_id: postId || null,
      event_type: 'link_click',
      ...getUserInfo(),
      metadata: { url, link_text: linkText, is_external: !url.includes(window.location.hostname) }
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Track social shares
export const trackSocialShare = async (platform: string, postId?: string) => {
  if (!supabase) return;
  
  try {
    await supabase.from('analytics').insert({
      post_id: postId || null,
      event_type: 'social_share',
      ...getUserInfo(),
      metadata: { platform }
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Track search queries
export const trackSearch = async (query: string, results_count: number) => {
  if (!supabase) return;
  
  try {
    await supabase.from('analytics').insert({
      event_type: 'search',
      ...getUserInfo(),
      metadata: { query, results_count }
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

// Get comprehensive post analytics
export const getPostAnalytics = async (postId: string): Promise<PostAnalytics | null> => {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('post_id', postId);
    
    if (error) throw error;
    
    const views = data?.filter(d => d.event_type === 'post_view').length || 0;
    const unique_views = new Set(data?.filter(d => d.event_type === 'post_view').map(d => d.session_id)).size;
    const likes = data?.filter(d => d.event_type === 'post_like').length || 0;
    const comments = data?.filter(d => d.event_type === 'comment_submit').length || 0;
    const shares = data?.filter(d => d.event_type === 'social_share').length || 0;
    
    // Calculate average time on page
    const timeData = data?.filter(d => d.event_type === 'time_on_page' && d.metadata?.duration_seconds);
    const avg_time_on_page = timeData?.length ? 
      timeData.reduce((sum, d) => sum + (d.metadata?.duration_seconds || 0), 0) / timeData.length : 0;
    
    // Calculate average scroll depth
    const scrollData = data?.filter(d => d.event_type === 'scroll_depth' && d.metadata?.scroll_percentage);
    const scroll_depth = scrollData?.length ?
      scrollData.reduce((sum, d) => sum + (d.metadata?.scroll_percentage || 0), 0) / scrollData.length : 0;
    
    return {
      post_id: postId,
      views,
      unique_views,
      likes,
      comments,
      shares,
      avg_time_on_page: Math.round(avg_time_on_page),
      scroll_depth: Math.round(scroll_depth)
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
};

// Get overall analytics with detailed insights
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
    const totalShares = data?.filter(d => d.event_type === 'social_share').length || 0;
    const totalSignups = data?.filter(d => d.event_type === 'newsletter_signup').length || 0;
    const totalLinkClicks = data?.filter(d => d.event_type === 'link_click').length || 0;
    const totalSearches = data?.filter(d => d.event_type === 'search').length || 0;
    
    // Get unique sessions for visitor count
    const uniqueSessions = new Set(data?.map(d => d.session_id)).size;
    
    // Get top referrers
    const referrers = data?.filter(d => d.referrer && d.referrer !== '')
      .reduce((acc: any, d) => {
        const domain = new URL(d.referrer).hostname;
        acc[domain] = (acc[domain] || 0) + 1;
        return acc;
      }, {});
    
    const topReferrers = Object.entries(referrers || {})
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5);
    
    // Get popular search terms
    const searches = data?.filter(d => d.event_type === 'search' && d.metadata?.query)
      .reduce((acc: any, d) => {
        const query = d.metadata.query.toLowerCase();
        acc[query] = (acc[query] || 0) + 1;
        return acc;
      }, {});
    
    const topSearches = Object.entries(searches || {})
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5);
    
    return {
      totalViews,
      totalPostViews,
      totalLikes,
      totalComments,
      totalShares,
      totalSignups,
      totalLinkClicks,
      totalSearches,
      uniqueVisitors: uniqueSessions,
      topReferrers,
      topSearches,
      recentActivity: data?.slice(0, 20) || []
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
};