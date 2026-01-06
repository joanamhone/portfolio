import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Only create client if both URL and key are provided
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Types
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  categories?: Category[];
  post_categories?: any[];
}

export interface Comment {
  id: string;
  post_id: string;
  parent_id?: string;
  author_name: string;
  author_email: string;
  content: string;
  approved: boolean;
  created_at: string;
  user_ip?: string;
  likes_count?: number;
  dislikes_count?: number;
  replies?: Comment[];
}

export interface Subscriber {
  id: string;
  email: string;
  name: string;
  active: boolean;
  subscribed_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  created_at: string;
}

// API Functions
export const getAllCategories = async () => {
  if (!isSupabaseConfigured || !supabase) {
    return { data: [], error: null };
  }
  
  return await supabase
    .from('categories')
    .select('*')
    .order('name');
};

export const searchPosts = async (query?: string, categoryId?: string) => {
  if (!isSupabaseConfigured || !supabase) {
    return { data: [], error: null };
  }

  let queryBuilder = supabase
    .from('blog_posts')
    .select(`
      *,
      post_categories(
        categories(*)
      )
    `)
    .eq('published', true);

  if (query) {
    queryBuilder = queryBuilder.or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`);
  }

  if (categoryId) {
    queryBuilder = queryBuilder.eq('post_categories.category_id', categoryId);
  }

  return await queryBuilder.order('created_at', { ascending: false });
};

export const getPostWithCategories = async (id: string) => {
  if (!isSupabaseConfigured || !supabase) {
    return { data: null, error: null };
  }

  return await supabase
    .from('blog_posts')
    .select(`
      *,
      post_categories(
        categories(*)
      )
    `)
    .eq('id', id)
    .eq('published', true)
    .single();
};

export const getCommentsWithReplies = async (postId: string) => {
  if (!isSupabaseConfigured || !supabase) {
    return { data: [], error: null };
  }

  return await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .eq('approved', true)
    .is('parent_id', null)
    .order('created_at', { ascending: false });
};

export const likeComment = async (commentId: string, userEmail: string, userIp: string, isLike: boolean) => {
  if (!isSupabaseConfigured || !supabase) {
    return { error: null };
  }

  return await supabase
    .from('comment_likes')
    .upsert({
      comment_id: commentId,
      user_email: userEmail,
      user_ip: userIp,
      is_like: isLike
    }, {
      onConflict: 'comment_id,user_email,user_ip'
    });
};

export const getUserCommentLikes = async (userEmail: string, userIp: string) => {
  if (!isSupabaseConfigured || !supabase) {
    return { data: [], error: null };
  }

  return await supabase
    .from('comment_likes')
    .select('*')
    .eq('user_email', userEmail)
    .eq('user_ip', userIp);
};