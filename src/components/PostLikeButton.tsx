import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PostLikeButtonProps {
  postId: string;
  initialLikes?: number;
}

const PostLikeButton: React.FC<PostLikeButtonProps> = ({ postId, initialLikes = 0 }) => {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [userIp, setUserIp] = useState('');

  useEffect(() => {
    // Get user IP
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => setUserIp(data.ip))
      .catch(() => setUserIp('unknown'));

    // Check if user already liked this post
    checkUserLike();
    fetchLikes();
  }, [postId]);

  const checkUserLike = async () => {
    if (!supabase || !userIp) return;
    
    try {
      const { data } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_ip', userIp)
        .single();
      
      setIsLiked(!!data);
    } catch (error) {
      // User hasn't liked this post
      setIsLiked(false);
    }
  };

  const fetchLikes = async () => {
    if (!supabase) return;
    
    try {
      const { count } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);
      
      setLikes(count || 0);
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  const handleLike = async () => {
    if (!supabase || !userIp) return;

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_ip', userIp);
        
        setLikes(prev => prev - 1);
        setIsLiked(false);
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_ip: userIp
          });
        
        setLikes(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <button
      onClick={handleLike}
      className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-300 ${
        isLiked
          ? 'bg-red-500/20 border-red-500 text-red-400'
          : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/30'
      }`}
    >
      <Heart 
        size={18} 
        className={`transition-all duration-300 ${isLiked ? 'fill-current' : ''}`} 
      />
      <span className="text-sm font-medium">{likes}</span>
    </button>
  );
};

export default PostLikeButton;