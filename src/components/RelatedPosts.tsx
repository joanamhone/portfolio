import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { supabase, BlogPost, isSupabaseConfigured } from '../lib/supabase';

interface RelatedPostsProps {
  currentPostId: string;
  categories?: string[];
  limit?: number;
}

const RelatedPosts: React.FC<RelatedPostsProps> = ({ 
  currentPostId, 
  categories = [], 
  limit = 3 
}) => {
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedPosts();
  }, [currentPostId, categories]);

  const fetchRelatedPosts = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .neq('id', currentPostId)
        .order('created_at', { ascending: false })
        .limit(limit);

      // If we have categories, try to find posts with similar categories first
      if (categories.length > 0) {
        const { data: categoryPosts } = await supabase
          .from('blog_posts')
          .select(`
            *,
            post_categories!inner(
              category_id
            )
          `)
          .eq('published', true)
          .neq('id', currentPostId)
          .in('post_categories.category_id', categories)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (categoryPosts && categoryPosts.length > 0) {
          setRelatedPosts(categoryPosts);
          setLoading(false);
          return;
        }
      }

      // Fallback to latest posts
      const { data, error } = await query;
      if (error) throw error;
      setRelatedPosts(data || []);
    } catch (error) {
      console.error('Error fetching related posts:', error);
      setRelatedPosts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white/10 h-32 rounded-lg mb-3"></div>
            <div className="bg-white/10 h-4 rounded mb-2"></div>
            <div className="bg-white/10 h-3 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Related Posts</h3>
      <div className="space-y-4">
        {relatedPosts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.id}`}
            className="block group hover:scale-[1.02] transition-transform duration-300"
          >
            <div className="bg-secondary/50 rounded-lg p-4 border border-white/10 hover:border-accent/50 transition-colors">
              {post.featured_image && (
                <div className="mb-3 rounded overflow-hidden">
                  <img 
                    src={post.featured_image} 
                    alt={post.title}
                    className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              
              <h4 className="font-medium text-white group-hover:text-accent transition-colors mb-2 line-clamp-2">
                {post.title}
              </h4>
              
              <div className="flex items-center space-x-3 text-xs text-white/60">
                <div className="flex items-center space-x-1">
                  <Calendar size={12} />
                  <span>{format(new Date(post.created_at), 'MMM dd')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User size={12} />
                  <span>Admin</span>
                </div>
              </div>
              
              {post.excerpt && (
                <p className="text-white/70 text-sm mt-2 line-clamp-2">
                  {post.excerpt}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;