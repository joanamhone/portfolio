import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Reply, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Comment } from '../lib/supabase';

interface CommentItemProps {
  comment: Comment;
  userLikes: Record<string, boolean>;
  onLike: (commentId: string, isLike: boolean, userEmail?: string) => void;
  onReply: (commentId: string) => void;
  level: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  userLikes,
  onLike,
  onReply,
  level
}) => {
  const [userEmail, setUserEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'like' | 'dislike' } | null>(null);

  const handleLikeAction = (isLike: boolean) => {
    if (!userEmail) {
      setPendingAction({ type: isLike ? 'like' : 'dislike' });
      setShowEmailInput(true);
      return;
    }
    onLike(comment.id, isLike, userEmail);
  };

  const submitEmailAndAction = () => {
    if (pendingAction && userEmail) {
      onLike(comment.id, pendingAction.type === 'like', userEmail);
      setShowEmailInput(false);
      setPendingAction(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${level > 0 ? 'ml-8 border-l-2 border-white/10 pl-4' : ''}`}
    >
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h5 className="font-bold text-white">{comment.author_name}</h5>
            <p className="text-white/60 text-sm">
              {format(new Date(comment.created_at), 'MMM dd, yyyy • h:mm a')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleLikeAction(true)}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors ${
                userLikes[comment.id] === true
                  ? 'bg-green-500/20 text-green-400'
                  : 'hover:bg-green-500/10 text-white/60 hover:text-green-400'
              }`}
            >
              <ThumbsUp size={14} />
              <span>{comment.likes_count || 0}</span>
            </button>
            <button
              onClick={() => handleLikeAction(false)}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors ${
                userLikes[comment.id] === false
                  ? 'bg-red-500/20 text-red-400'
                  : 'hover:bg-red-500/10 text-white/60 hover:text-red-400'
              }`}
            >
              <ThumbsDown size={14} />
              <span>{comment.dislikes_count || 0}</span>
            </button>
            <button
              onClick={() => onReply(comment.id)}
              className="flex items-center space-x-1 px-2 py-1 rounded text-sm text-white/60 hover:text-accent transition-colors"
            >
              <Reply size={14} />
              <span>Reply</span>
            </button>
          </div>
        </div>
        
        <p className="text-white/80 mb-4 leading-relaxed">{comment.content}</p>

        {/* Email Input Modal */}
        {showEmailInput && (
          <div className="bg-secondary-light/80 p-4 rounded-lg border border-white/20 mb-4">
            <p className="text-sm text-white/80 mb-3">
              Please provide your email to {pendingAction?.type} this comment:
            </p>
            <div className="flex space-x-2">
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 bg-secondary border border-white/20 rounded focus:outline-none focus:border-accent text-sm"
              />
              <button
                onClick={submitEmailAndAction}
                className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-cyber transition-colors text-sm"
              >
                Submit
              </button>
              <button
                onClick={() => {
                  setShowEmailInput(false);
                  setPendingAction(null);
                  setUserEmail('');
                }}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-6 space-y-4">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                userLikes={userLikes}
                onLike={onLike}
                onReply={onReply}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CommentItem;