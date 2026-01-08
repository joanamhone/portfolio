import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, User, MessageCircle, ChevronLeft, Search, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { supabase, BlogPost, Category, isSupabaseConfigured, searchPosts, getAllCategories } from '../lib/supabase';
import { BlogSkeleton } from '../components/Skeleton';
import SubscriptionPopup from '../components/SubscriptionPopup';
import { useSubscriptionPopup } from '../hooks/useSubscriptionPopup';
import SEO from '../components/SEO';

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const { showPopup, closePopup } = useSubscriptionPopup();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Use mock data when Supabase is not configured
      setPosts([
        {
          id: '1',
          title: 'Getting Started with Cybersecurity',
          content: 'This is a sample blog post about cybersecurity...',
          excerpt: 'Learn the fundamentals of cybersecurity and how to protect your digital assets.',
          featured_image: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg',
          published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Modern Software Development Practices',
          content: 'This is a sample blog post about software development...',
          excerpt: 'Explore modern development practices and tools that every developer should know.',
          featured_image: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg',
          published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
      setLoading(false);
      return;
    }

    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await getAllCategories();
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = async () => {
    if (!isSupabaseConfigured) return;
    
    setSearching(true);
    try {
      const { data, error } = await searchPosts(searchQuery, selectedCategory || undefined);
      if (error) throw error;
      
      // Transform the data to include categories
      const transformedPosts = data?.map(post => ({
        ...post,
        categories: post.post_categories?.map((pc: any) => pc.categories).filter(Boolean) || []
      })) || [];
      
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error searching posts:', error);
    } finally {
      setSearching(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    fetchPosts();
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery || selectedCategory) {
        handleSearch();
      } else if (!searchQuery && !selectedCategory) {
        fetchPosts();
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, selectedCategory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  if (loading) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen pt-20"
      >
        <header className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Tech Insights Blog</h1>
            <p className="text-lg text-white/80 max-w-2xl">
              Exploring the latest in cybersecurity, software engineering, and technology trends.
            </p>
          </div>
        </header>
        <section className="py-8 mb-8 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <BlogSkeleton />
                <BlogSkeleton />
                <BlogSkeleton />
              </div>
            </div>
          </div>
        </section>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen pt-20"
    >
      <SEO
        title="Tech Insights Blog"
        description="Exploring the latest in cybersecurity, software engineering, and technology trends. Read expert insights and tutorials."
      />
      {/* Header */}
      <header className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <Link to="/" className="inline-flex items-center text-white/70 hover:text-accent mb-6 transition-colors">
            <ChevronLeft size={16} className="mr-1" />
            <span>Back to home</span>
          </Link>
          
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Tech Insights Blog</h1>
            <p className="text-lg text-white/80 max-w-2xl">
              Exploring the latest in cybersecurity, software engineering, and technology trends.
            </p>
          </motion.div>
        </div>
      </header>

      {/* Search and Filters */}
      <motion.section variants={itemVariants} className="mb-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="card">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-secondary border border-white/20 rounded-lg focus:outline-none focus:border-accent text-white placeholder-white/50"
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                  </div>
                )}
              </div>

              {/* Category Filter */}
              <div className="md:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-secondary border border-white/20 rounded-lg focus:outline-none focus:border-accent text-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {(searchQuery || selectedCategory) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors flex items-center space-x-2"
                >
                  <X size={16} />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.section>
      {/* Ad Space - Top Banner */}
      <motion.div variants={itemVariants} className="mb-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="bg-secondary-light/50 border border-white/10 rounded-lg p-8 text-center">
            <p className="text-white/50 text-sm">Advertisement Space - 728x90</p>
          </div>
        </div>
      </motion.div>

      {/* Blog Posts */}
      <section className="py-8 mb-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {posts.length === 0 ? (
                <motion.div variants={itemVariants} className="card text-center py-12">
                  <h3 className="text-xl font-bold mb-4">No posts yet</h3>
                  <p className="text-white/70">Check back soon for new content!</p>
                </motion.div>
              ) : (
                <div className="space-y-8">
                  {posts.map((post, index) => (
                    <motion.article
                      key={post.id}
                      variants={itemVariants}
                      custom={index}
                      className="card hover:scale-[1.02] transition-transform duration-300"
                    >
                      {post.featured_image && (
                        <div className="mb-6 rounded-lg overflow-hidden">
                          <img 
                            src={post.featured_image} 
                            alt={post.title}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-white/60 mb-4">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{format(new Date(post.created_at), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User size={14} />
                          <span>Admin</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle size={14} />
                          <span>Comments</span>
                        </div>
                      </div>
                      
                      <h2 className="text-2xl font-bold mb-4 hover:text-accent transition-colors">
                        <Link to={`/blog/${post.id}`}>{post.title}</Link>
                      </h2>
                      
                      <p className="text-white/80 mb-4 leading-relaxed">
                        {post.excerpt || post.content.substring(0, 200) + '...'}
                      </p>
                      
                      {/* Categories */}
                      {post.categories && post.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.categories.map((category) => (
                            <span
                              key={category.id}
                              className="px-2 py-1 text-xs rounded-full border"
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
                      
                      <Link 
                        to={`/blog/${post.id}`}
                        className="inline-flex items-center text-accent hover:text-accent-cyber transition-colors font-medium"
                      >
                        Read More →
                      </Link>
                    </motion.article>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Ad Space - Sidebar */}
              <motion.div variants={itemVariants} className="card">
                <div className="bg-secondary-light/50 border border-white/10 rounded-lg p-8 text-center">
                  <p className="text-white/50 text-sm">Advertisement Space - 300x250</p>
                </div>
              </motion.div>

              {/* Newsletter Signup */}
              <motion.div variants={itemVariants} className="card">
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
                  <button
                    type="submit"
                    className="w-full btn-primary"
                  >
                    Subscribe
                  </button>
                </form>
              </motion.div>

              {/* Categories */}
              <motion.div variants={itemVariants} className="card">
                <h3 className="text-xl font-bold mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setSearchQuery('');
                    }}
                    className={`block w-full text-left text-white/80 hover:text-accent transition-colors p-2 rounded ${
                      !selectedCategory ? 'bg-accent/20 text-accent' : ''
                    }`}
                  >
                    All Posts
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`block w-full text-left text-white/80 hover:text-accent transition-colors p-2 rounded ${
                        selectedCategory === category.id ? 'bg-accent/20 text-accent' : ''
                      }`}
                      style={{
                        color: selectedCategory === category.id ? category.color : undefined
                      }}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Space - Bottom Banner */}
      <motion.div variants={itemVariants} className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="bg-secondary-light/50 border border-white/10 rounded-lg p-8 text-center">
            <p className="text-white/50 text-sm">Advertisement Space - 728x90</p>
          </div>
        </div>
      </motion.div>

      {/* Subscription Popup */}
      <SubscriptionPopup isOpen={showPopup} onClose={closePopup} />
    </motion.div>
  );
};

export default Blog;