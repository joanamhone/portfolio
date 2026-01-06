import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, EyeOff, MessageCircle, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase, BlogPost, Comment, Subscriber, Category, getAllCategories } from '../lib/supabase';

interface PostForm {
  title: string;
  content: string;
  excerpt: string;
  featured_image: string;
  published: boolean;
  category_ids: string[];
}

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  color: string;
}

const AdminPanel: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'subscribers' | 'categories'>('posts');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PostForm>();
  const { register: registerCategory, handleSubmit: handleSubmitCategory, reset: resetCategory, setValue: setValueCategory, formState: { errors: categoryErrors } } = useForm<CategoryForm>();
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  // Filter data based on search query
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    
    setFilteredPosts(posts.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(query))
    ));
    
    setFilteredComments(comments.filter(comment =>
      comment.author_name.toLowerCase().includes(query) ||
      comment.author_email.toLowerCase().includes(query) ||
      comment.content.toLowerCase().includes(query)
    ));
    
    setFilteredSubscribers(subscribers.filter(subscriber =>
      subscriber.name.toLowerCase().includes(query) ||
      subscriber.email.toLowerCase().includes(query)
    ));
  }, [searchQuery, posts, comments, subscribers]);

  const checkAuth = async () => {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Redirect to login or show auth form
      alert('Please log in to access admin panel');
    }
  };

  const fetchData = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    try {
      const [postsRes, commentsRes, subscribersRes, categoriesRes] = await Promise.all([
        supabase.from('blog_posts').select(`
          *,
          post_categories(
            categories(*)
          )
        `).order('created_at', { ascending: false }),
        supabase.from('comments').select('*').order('created_at', { ascending: false }),
        supabase.from('subscribers').select('*').order('subscribed_at', { ascending: false }),
        getAllCategories()
      ]);

      // Transform posts to include categories
      const transformedPosts = postsRes.data?.map(post => ({
        ...post,
        categories: post.post_categories?.map((pc: any) => pc.categories).filter(Boolean) || []
      })) || [];
      
      setPosts(transformedPosts);
      setComments(commentsRes.data || []);
      setSubscribers(subscribersRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPost = async (data: PostForm) => {
    if (!supabase) {
      alert('Database not configured');
      return;
    }
    
    try {
      const postData = { 
        title: data.title,
        content,
        excerpt: data.excerpt,
        featured_image: data.featured_image,
        published: data.published
      };
      
      let postId: string;
      
      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);
        if (error) throw error;
        postId = editingPost.id;
      } else {
        const { data: newPost, error } = await supabase
          .from('blog_posts')
          .insert(postData)
          .select()
          .single();
        if (error) throw error;
        postId = newPost.id;
      }

      // Update categories
      if (selectedCategories.length > 0) {
        // Delete existing categories
        await supabase
          .from('post_categories')
          .delete()
          .eq('post_id', postId);

        // Insert new categories
        const categoryInserts = selectedCategories.map(categoryId => ({
          post_id: postId,
          category_id: categoryId
        }));

        await supabase
          .from('post_categories')
          .insert(categoryInserts);
      }

      reset();
      setContent('');
      setSelectedCategories([]);
      setEditingPost(null);
      setShowPostForm(false);
      fetchData();
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Error saving post');
    }
  };

  const deletePost = async (id: string) => {
    if (!supabase) return;
    
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', id);
        if (error) throw error;
        fetchData();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const togglePostPublished = async (post: BlogPost) => {
    if (!supabase) return;
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ published: !post.published })
        .eq('id', post.id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const approveComment = async (comment: Comment) => {
    if (!supabase) return;
    
    try {
      const { error } = await supabase
        .from('comments')
        .update({ approved: !comment.approved })
        .eq('id', comment.id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const deleteComment = async (id: string) => {
    if (!supabase) return;
    
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('id', id);
        if (error) throw error;
        fetchData();
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const editPost = (post: BlogPost) => {
    setEditingPost(post);
    setValue('title', post.title);
    setValue('excerpt', post.excerpt || '');
    setValue('featured_image', post.featured_image || '');
    setValue('published', post.published);
    setSelectedCategories(post.categories?.map(c => c.id) || []);
    setContent(post.content);
    setShowPostForm(true);
  };

  const onSubmitCategory = async (data: CategoryForm) => {
    if (!supabase) {
      alert('Database not configured');
      return;
    }
    
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(data)
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert(data);
        if (error) throw error;
      }

      resetCategory();
      setEditingCategory(null);
      setShowCategoryForm(false);
      fetchData();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!supabase) return;
    
    if (confirm('Are you sure you want to delete this category? This will remove it from all posts.')) {
      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);
        if (error) throw error;
        fetchData();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const editCategory = (category: Category) => {
    setEditingCategory(category);
    setValueCategory('name', category.name);
    setValueCategory('slug', category.slug);
    setValueCategory('description', category.description || '');
    setValueCategory('color', category.color);
    setShowCategoryForm(true);
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 gradient-text">Admin Panel</h1>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search posts, comments, subscribers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary border border-white/20 rounded-lg focus:outline-none focus:border-accent text-white placeholder-white/50"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'posts' ? 'bg-primary text-white' : 'bg-secondary-light text-white/70 hover:text-white'
            }`}
          >
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'comments' ? 'bg-primary text-white' : 'bg-secondary-light text-white/70 hover:text-white'
            }`}
          >
            Comments ({comments.filter(c => !c.approved).length})
          </button>
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'subscribers' ? 'bg-primary text-white' : 'bg-secondary-light text-white/70 hover:text-white'
            }`}
          >
            Subscribers ({subscribers.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'categories' ? 'bg-primary text-white' : 'bg-secondary-light text-white/70 hover:text-white'
            }`}
          >
            Categories ({categories.length})
          </button>
        </div>

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Blog Posts</h2>
              <button
                onClick={() => {
                  setEditingPost(null);
                  reset();
                  setContent('');
                  setShowPostForm(true);
                }}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>New Post</span>
              </button>
            </div>

            {showPostForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card mb-8"
              >
                <h3 className="text-xl font-bold mb-4">
                  {editingPost ? 'Edit Post' : 'Create New Post'}
                </h3>
                <form onSubmit={handleSubmit(onSubmitPost)} className="space-y-4">
                  <div>
                    <input
                      {...register('title', { required: 'Title is required' })}
                      type="text"
                      placeholder="Post Title"
                      className="w-full px-4 py-2 bg-secondary border border-white/20 rounded-lg focus:outline-none focus:border-accent"
                    />
                    {errors.title && (
                      <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <input
                      {...register('excerpt')}
                      type="text"
                      placeholder="Post Excerpt (optional)"
                      className="w-full px-4 py-2 bg-secondary border border-white/20 rounded-lg focus:outline-none focus:border-accent"
                    />
                  </div>
                  
                  <div>
                    <input
                      {...register('featured_image')}
                      type="url"
                      placeholder="Featured Image URL (optional)"
                      className="w-full px-4 py-2 bg-secondary border border-white/20 rounded-lg focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Content</label>
                    <div className="bg-white rounded-lg">
                      <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        style={{ minHeight: '200px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Categories</label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-secondary-light rounded-lg border border-white/20">
                      {categories.map((category) => (
                        <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories([...selectedCategories, category.id]);
                              } else {
                                setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                              }
                            }}
                            className="rounded border-white/20 bg-secondary focus:ring-accent"
                          />
                          <span className="text-sm" style={{ color: category.color }}>
                            {category.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      {...register('published')}
                      type="checkbox"
                      id="published"
                      className="rounded border-white/20 bg-secondary focus:ring-accent"
                    />
                    <label htmlFor="published" className="text-sm">
                      Publish immediately
                    </label>
                  </div>

                  <div className="flex space-x-4">
                    <button type="submit" className="btn-primary">
                      {editingPost ? 'Update Post' : 'Create Post'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPostForm(false);
                        setEditingPost(null);
                        reset();
                        setContent('');
                        setSelectedCategories([]);
                      }}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{post.title}</h3>
                    <p className="text-white/70 text-sm">
                      Created: {new Date(post.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        post.published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                      {post.categories && post.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {post.categories.map((category) => (
                            <span
                              key={category.id}
                              className="px-1 py-0.5 rounded text-xs"
                              style={{
                                backgroundColor: `${category.color}20`,
                                color: category.color
                              }}
                            >
                              {category.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => togglePostPublished(post)}
                      className="p-2 hover:bg-secondary-light rounded-lg transition-colors"
                      title={post.published ? 'Unpublish' : 'Publish'}
                    >
                      {post.published ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => editPost(post)}
                      className="p-2 hover:bg-secondary-light rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Comments</h2>
            <div className="space-y-4">
              {filteredComments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold">{comment.author_name}</h4>
                      <p className="text-white/70 text-sm">{comment.author_email}</p>
                      <p className="text-white/60 text-xs">
                        {new Date(comment.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        comment.approved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {comment.approved ? 'Approved' : 'Pending'}
                      </span>
                      <button
                        onClick={() => approveComment(comment)}
                        className="p-2 hover:bg-secondary-light rounded-lg transition-colors"
                        title={comment.approved ? 'Unapprove' : 'Approve'}
                      >
                        <MessageCircle size={16} />
                      </button>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-white/80">{comment.content}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Subscribers Tab */}
        {activeTab === 'subscribers' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Newsletter Subscribers</h2>
            <div className="space-y-4">
              {filteredSubscribers.map((subscriber) => (
                <motion.div
                  key={subscriber.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold">{subscriber.name}</h4>
                    <p className="text-white/70">{subscriber.email}</p>
                    <p className="text-white/60 text-sm">
                      Subscribed: {new Date(subscriber.subscribed_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      subscriber.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {subscriber.active ? 'Active' : 'Inactive'}
                    </span>
                    <Users size={16} className="text-white/60" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Categories</h2>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  resetCategory();
                  setShowCategoryForm(true);
                }}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>New Category</span>
              </button>
            </div>

            {showCategoryForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card mb-8"
              >
                <h3 className="text-xl font-bold mb-4">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                <form onSubmit={handleSubmitCategory(onSubmitCategory)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        {...registerCategory('name', { required: 'Name is required' })}
                        type="text"
                        placeholder="Category Name"
                        className="w-full px-4 py-2 bg-secondary border border-white/20 rounded-lg focus:outline-none focus:border-accent"
                      />
                      {categoryErrors.name && (
                        <p className="text-red-400 text-sm mt-1">{categoryErrors.name.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <input
                        {...registerCategory('slug', { required: 'Slug is required' })}
                        type="text"
                        placeholder="category-slug"
                        className="w-full px-4 py-2 bg-secondary border border-white/20 rounded-lg focus:outline-none focus:border-accent"
                      />
                      {categoryErrors.slug && (
                        <p className="text-red-400 text-sm mt-1">{categoryErrors.slug.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <textarea
                      {...registerCategory('description')}
                      placeholder="Category Description (optional)"
                      rows={3}
                      className="w-full px-4 py-2 bg-secondary border border-white/20 rounded-lg focus:outline-none focus:border-accent resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Color</label>
                    <input
                      {...registerCategory('color', { required: 'Color is required' })}
                      type="color"
                      className="w-20 h-10 bg-secondary border border-white/20 rounded-lg focus:outline-none focus:border-accent"
                    />
                    {categoryErrors.color && (
                      <p className="text-red-400 text-sm mt-1">{categoryErrors.color.message}</p>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    <button type="submit" className="btn-primary">
                      {editingCategory ? 'Update Category' : 'Create Category'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCategoryForm(false);
                        setEditingCategory(null);
                        resetCategory();
                      }}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <h3 className="font-bold text-lg">{category.name}</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => editCategory(category)}
                        className="p-1 hover:bg-secondary-light rounded transition-colors"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-white/70 text-sm mb-2">/{category.slug}</p>
                  {category.description && (
                    <p className="text-white/60 text-sm">{category.description}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminPanel;