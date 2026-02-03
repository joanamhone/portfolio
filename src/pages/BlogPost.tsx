import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, ChevronLeft, Send, ThumbsUp, ThumbsDown, Reply, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { supabase, BlogPost, Comment, isSupabaseConfigured, getPostWithCategories, getCommentsWithReplies, likeComment, getUserCommentLikes } from '../lib/supabase';
import CommentItem from '../components/CommentItem';
import SubscriptionPopup from '../components/SubscriptionPopup';
import { useSubscriptionPopup } from '../hooks/useSubscriptionPopup';
import SEO from '../components/SEO';
import SocialShare from '../components/SocialShare';
import RelatedPosts from '../components/RelatedPosts';
import { calculateReadingTime } from '../lib/utils';
import { trackPostView, trackCommentSubmit, trackTimeOnPage, trackScrollDepth, trackLinkClick } from '../lib/analytics';
import { useToast } from '../components/Toast';
import PostLikeButton from '../components/PostLikeButton';
import { generateStructuredData } from '../hooks/useAutoSEO';
import Breadcrumbs from '../components/Breadcrumbs';

interface CommentForm {
  author_name: string;
  author_email: string;
  content: string;
  subscribe: boolean;
  parent_id?: string;
}

const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [blogImages, setBlogImages] = useState<any[]>([]);
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [userIp, setUserIp] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const { showPopup, closePopup } = useSubscriptionPopup();
  const { showToast } = useToast();
  const readingTime = post ? calculateReadingTime(post.content) : 0;

  // Scroll tracking
  useEffect(() => {
    if (!id) return;
    
    let maxScroll = 0;
    const handleScroll = () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > maxScroll && scrollPercent % 25 === 0) { // Track at 25%, 50%, 75%, 100%
        maxScroll = scrollPercent;
        trackScrollDepth(id, scrollPercent);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  // Track time on page when leaving
  useEffect(() => {
    if (!id) return;
    
    const handleBeforeUnload = () => {
      trackTimeOnPage(id);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      trackTimeOnPage(id); // Track when component unmounts
    };
  }, [id]);

  // Track link clicks
  useEffect(() => {
    if (!id) return;
    
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A') {
        const link = target as HTMLAnchorElement;
        trackLinkClick(link.href, link.textContent || '', id);
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, [id]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentForm>();

  // Get user IP for anonymous identification
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => setUserIp(data.ip))
      .catch(() => setUserIp('unknown'));
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Use mock data when Supabase is not configured
      setPost({
        id: id || '1',
        title: 'Sample Blog Post',
        content: 'This is a sample blog post content. In a real application, this would be loaded from your Supabase database.',
        excerpt: 'This is a sample excerpt.',
        featured_image: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg',
        published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setComments([]);
      setLoading(false);
      return;
    }

    if (id) {
      fetchPost();
      fetchComments();
      // Track post view
      trackPostView(id);
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const { data, error } = await getPostWithCategories(id!);

      if (error) throw error;
      
      // Transform the data to include categories
      const transformedPost = {
        ...data,
        categories: data.post_categories?.map((pc: any) => pc.categories).filter(Boolean) || []
      };
      
      setPost(transformedPost);
      
      // Parse images if they exist
      try {
        const parsedImages = data.images ? JSON.parse(data.images) : [];
        setBlogImages(parsedImages);
      } catch {
        setBlogImages([]);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await getCommentsWithReplies(id!);

      if (error) throw error;
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLikes = async (email: string) => {
    if (!userIp || !email) return;
    
    try {
      const { data, error } = await getUserCommentLikes(email, userIp);
      if (error) throw error;
      
      const likesMap: Record<string, boolean> = {};
      data?.forEach(like => {
        likesMap[like.comment_id] = like.is_like;
      });
      setUserLikes(likesMap);
    } catch (error) {
      console.error('Error fetching user likes:', error);
    }
  };

  const onSubmitComment = async (data: CommentForm) => {
    if (data.subscribe) {
      setShowSubscribeModal(true);
      return;
    }
    await submitComment(data);
  };

  const submitComment = async (data: CommentForm) => {
    if (!supabase) {
      showToast('error', 'Comments are not available without database configuration');
      return;
    }
    
    setSubmitting(true);
    try {
      // Submit comment
      const { error: commentError } = await supabase
        .from('comments')
        .insert({
          post_id: id,
          parent_id: data.parent_id || null,
          author_name: data.author_name,
          author_email: data.author_email,
          content: data.content,
          user_ip: userIp
        });

      if (commentError) throw commentError;

      // Subscribe to mailing list if requested
      if (data.subscribe) {
        const { error: subscribeError } = await supabase
          .from('subscribers')
          .insert({
            email: data.author_email,
            name: data.author_name
          });

        if (subscribeError && !subscribeError.message.includes('duplicate')) {
          throw subscribeError;
        }
      }

      reset();
      setReplyingTo(null);
      showToast('success', '🎉 Thanks for your comment! It will appear after approval.');
      
      // Track comment submission
      trackCommentSubmit(id!);
      
      fetchComments(); // Refresh comments
      fetchUserLikes(data.author_email);
    } catch (error) {
      console.error('Error submitting comment:', error);
      showToast('error', 'Oops! Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
      setShowSubscribeModal(false);
    }
  };

  const handleLikeComment = async (commentId: string, isLike: boolean, userEmail?: string) => {
    if (!userEmail) {
      alert('Please provide your email to like/dislike comments');
      return;
    }

    try {
      const { error } = await likeComment(commentId, userEmail, userIp, isLike);
      if (error) throw error;
      
      fetchComments(); // Refresh to get updated counts
      fetchUserLikes(userEmail);
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Link to="/blog" className="text-accent hover:underline">← Back to blog</Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8"
    >
      <SEO
        title={post?.title}
        description={post?.excerpt || post?.content.replace(/<[^>]*>/g, '').substring(0, 160)}
        image={post?.featured_image}
        type="article"
        publishedTime={post?.created_at}
        modifiedTime={post?.updated_at}
        tags={post?.categories?.map(c => c.name)}
      />
      
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData(post))
        }}
      />
      
      {/* Additional SEO meta tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="author" content="Joana Promise Mhone" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href={`https://joanamhone.com/blog/${post.id}`} />
      <div className="container mx-auto py-8">
        <Breadcrumbs />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-3">
            <Link to="/blog" className="inline-flex items-center text-white/70 hover:text-accent mb-6 transition-colors">
              <ChevronLeft size={16} className="mr-1" />
              <span>Back to blog</span>
            </Link>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* Top Images */}
              {blogImages.filter(img => img.position === 'top').map(img => (
                <div key={img.id} className="mb-8 rounded-lg overflow-hidden">
                  <img 
                    src={img.url} 
                    alt={img.alt}
                    className="w-full h-64 md:h-96 object-cover"
                  />
                </div>
              ))}
              
              {/* Fallback to featured_image if no top images */}
              {blogImages.filter(img => img.position === 'top').length === 0 && post.featured_image && (
                <div className="mb-8 rounded-lg overflow-hidden">
                  <img 
                    src={post.featured_image} 
                    alt={post.title}
                    className="w-full h-64 md:h-96 object-cover"
                  />
                </div>
              )}

              <div className="flex items-center space-x-4 text-sm text-white/60 mb-6">
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>{format(new Date(post.created_at), 'MMMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User size={14} />
                  <span>Admin</span>
                </div>
                <div className="text-white/40">•</div>
                <span>{readingTime} min read</span>
              </div>

              <section className="py-12 bg-secondary/50 rounded-lg px-8 mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-8 gradient-text">
                  {post.title}
                </h1>

                {/* Categories */}
                {post.categories && post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {post.categories.map((category) => (
                      <span
                        key={category.id}
                        className="px-3 py-1 text-sm rounded-full border"
                        style={{
                          backgroundColor: `${category.color}20`,
                          borderColor: `${category.color}50`,
                          color: category.color
                        }}
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Middle Images */}
                {blogImages.filter(img => img.position === 'middle').map(img => (
                  <div key={img.id} className="mb-8 rounded-lg overflow-hidden">
                    <img 
                      src={img.url} 
                      alt={img.alt}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                ))}

                <div 
                  className="prose prose-invert max-w-none mb-8"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Bottom Images */}
                {blogImages.filter(img => img.position === 'bottom').map(img => (
                  <div key={img.id} className="mb-8 rounded-lg overflow-hidden">
                    <img 
                      src={img.url} 
                      alt={img.alt}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                ))}
              </section>

              {/* Social Share and Like */}
              <div className="border-t border-white/20 pt-6 mb-8">
                <div className="flex items-center justify-between">
                  <PostLikeButton postId={post.id} />
                  <SocialShare
                    url={window.location.href}
                    title={post.title}
                    description={post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 160)}
                    postId={post.id}
                  />
                </div>
              </div>
            </motion.div>

            {/* Comments Section */}
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-12"
            >
              <h3 className="text-2xl font-bold mb-8">Comments ({comments.length})</h3>

              {/* Comment Form */}
              <div className="card mb-8">
                <h4 className="text-xl font-bold mb-4">Leave a Comment</h4>
                <form onSubmit={handleSubmit((data) => onSubmitComment({ ...data, parent_id: replyingTo || undefined }))} className="space-y-4">
                  {replyingTo && (
                    <div className="bg-primary/20 p-3 rounded-lg flex items-center justify-between">
                      <span className="text-sm">Replying to comment</span>
                      <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        {...register('author_name', { required: 'Name is required' })}
                        type="text"
                        placeholder="Your Name"
                        className="w-full px-4 py-2 bg-secondary border border-white/20 rounded-lg focus:outline-none focus:border-accent"
                      />
                      {errors.author_name && (
                        <p className="text-red-400 text-sm mt-1">{errors.author_name.message}</p>
                      )}
                    </div>
                    <div>
                      <input
                        {...register('author_email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        type="email"
                        placeholder="Your Email"
                        className="w-full px-4 py-2 bg-secondary border border-white/20 rounded-lg focus:outline-none focus:border-accent"
                      />
                      {errors.author_email && (
                        <p className="text-red-400 text-sm mt-1">{errors.author_email.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <textarea
                      {...register('content', { required: 'Comment is required' })}
                      rows={4}
                      placeholder="Your comment..."
                      className="w-full px-4 py-2 bg-secondary border border-white/20 rounded-lg focus:outline-none focus:border-accent resize-none"
                    />
                    {errors.content && (
                      <p className="text-red-400 text-sm mt-1">{errors.content.message}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      {...register('subscribe')}
                      type="checkbox"
                      id="subscribe"
                      className="rounded border-white/20 bg-secondary focus:ring-accent"
                    />
                    <label htmlFor="subscribe" className="text-sm text-white/80">
                      Subscribe to newsletter for updates
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary inline-flex items-center space-x-2"
                  >
                    <Send size={16} />
                    <span>{submitting ? 'Submitting...' : 'Post Comment'}</span>
                  </button>
                </form>
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    userLikes={userLikes}
                    onLike={handleLikeComment}
                    onReply={setReplyingTo}
                    level={0}
                  />
                ))}
                {comments.length === 0 && (
                  <p className="text-white/60 text-center py-8">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            </motion.section>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Related Posts */}
            <RelatedPosts 
              currentPostId={post.id}
              categories={post.categories?.map(c => c.id)}
            />

            {/* Newsletter Signup */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Stay Updated</h3>
              <p className="text-white/80 mb-4">
                Subscribe to get the latest posts delivered to your inbox.
              </p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-2 bg-secondary border border-white/20 rounded-lg focus:outline-none focus:border-accent"
                />
                <button type="submit" className="w-full btn-primary">
                  Subscribe
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>

      {/* Subscription Popup */}
      <SubscriptionPopup isOpen={showPopup} onClose={closePopup} />

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-secondary-light rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">Subscribe to Newsletter</h3>
            <p className="text-white/80 mb-6">
              Would you like to subscribe to our newsletter to receive updates on new posts?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  const formData = new FormData();
                  // Get form data and submit with subscribe = true
                  handleSubmit((data) => submitComment({ ...data, subscribe: true }))();
                }}
                className="btn-primary flex-1"
              >
                Yes, Subscribe
              </button>
              <button
                onClick={() => {
                  handleSubmit((data) => submitComment({ ...data, subscribe: false }))();
                }}
                className="btn-outline flex-1"
              >
                No, Just Comment
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default BlogPostPage;