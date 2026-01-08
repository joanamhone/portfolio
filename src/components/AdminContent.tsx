import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, EyeOff, MessageCircle, Users, BarChart3, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase, BlogPost, Comment, Subscriber, Category, getAllCategories } from '../lib/supabase';
import AnalyticsDashboard from './AnalyticsDashboard';
import SubscribersManager from './SubscribersManager';
import NewsletterComposer from './NewsletterComposer';
import CommentsManager from './CommentsManager';
import CategoriesManager from './CategoriesManager';

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

interface AdminContentProps {
  onLogout: () => void;
}

const AdminContent: React.FC<AdminContentProps> = ({ onLogout }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'subscribers' | 'categories' | 'analytics' | 'newsletter'>('posts');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Persist active tab in localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem('adminActiveTab') as typeof activeTab;
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    localStorage.setItem('adminActiveTab', tab);
  };

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PostForm>();
  const { register: registerCategory, handleSubmit: handleSubmitCategory, reset: resetCategory, setValue: setValueCategory, formState: { errors: categoryErrors } } = useForm<CategoryForm>();
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

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

  const fetchData = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching admin data...');
      
      // Test direct subscribers query
      const testSubs = await supabase.from('subscribers').select('*');
      console.log('Direct subscribers test:', testSubs);
      
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

      console.log('Subscribers error:', subscribersRes.error);
      console.log('Subscribers data:', subscribersRes);
      
      const transformedPosts = postsRes.data?.map(post => ({
        ...post,
        categories: post.post_categories?.map((pc: any) => pc.categories).filter(Boolean) || []
      })) || [];
      
      setPosts(transformedPosts);
      setComments(commentsRes.data || []);
      setSubscribers(subscribersRes.data || []);
      setCategories(categoriesRes.data || []);
      
      console.log('Set subscribers:', subscribersRes.data?.length || 0);
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

      if (selectedCategories.length > 0) {
        await supabase.from('post_categories').delete().eq('post_id', postId);
        const categoryInserts = selectedCategories.map(categoryId => ({
          post_id: postId,
          category_id: categoryId
        }));
        await supabase.from('post_categories').insert(categoryInserts);
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
    if (!supabase || !confirm('Are you sure?')) return;
    try {
      await supabase.from('blog_posts').delete().eq('id', id);
      fetchData();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const togglePostPublished = async (post: BlogPost) => {
    if (!supabase) return;
    try {
      await supabase.from('blog_posts').update({ published: !post.published }).eq('id', post.id);
      fetchData();
    } catch (error) {
      console.error('Error updating post:', error);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Dashboard</h1>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-sm min-h-screen border-r border-gray-200 dark:border-gray-700">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => handleTabChange('posts')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'posts'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Edit size={16} className="mr-3" />
              Posts
              <span className="ml-auto bg-gray-200 dark:bg-gray-600 text-xs px-2 py-1 rounded-full">
                {posts.length}
              </span>
            </button>
            
            <button
              onClick={() => handleTabChange('comments')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'comments'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <MessageCircle size={16} className="mr-3" />
              Comments
              <span className="ml-auto bg-red-200 dark:bg-red-600 text-xs px-2 py-1 rounded-full">
                {comments.filter(c => !c.approved).length}
              </span>
            </button>
            
            <button
              onClick={() => handleTabChange('categories')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'categories'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Trash2 size={16} className="mr-3" />
              Categories
              <span className="ml-auto bg-gray-200 dark:bg-gray-600 text-xs px-2 py-1 rounded-full">
                {categories.length}
              </span>
            </button>
            
            <button
              onClick={() => handleTabChange('subscribers')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'subscribers'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Users size={16} className="mr-3" />
              Subscribers
              <span className="ml-auto bg-gray-200 dark:bg-gray-600 text-xs px-2 py-1 rounded-full">
                {subscribers.length}
              </span>
            </button>
            
            <button
              onClick={() => handleTabChange('newsletter')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'newsletter'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Mail size={16} className="mr-3" />
              Newsletter
            </button>
            
            <button
              onClick={() => handleTabChange('analytics')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <BarChart3 size={16} className="mr-3" />
              Analytics
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {activeTab}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage your {activeTab}
                </p>
              </div>
              
              {(activeTab === 'posts' || activeTab === 'categories') && (
                <button
                  onClick={() => {
                    if (activeTab === 'posts') {
                      setEditingPost(null);
                      reset();
                      setContent('');
                      setShowPostForm(true);
                    } else {
                      setEditingCategory(null);
                      resetCategory();
                      setShowCategoryForm(true);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors"
                >
                  <Plus size={16} />
                  <span>Add {activeTab === 'posts' ? 'Post' : 'Category'}</span>
                </button>
              )}
              
              {/* Refresh Button */}
              <button
                onClick={fetchData}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Refresh
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="mt-4 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {activeTab === 'posts' && (
              <div className="p-6">
                {showPostForm ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {editingPost ? 'Edit Post' : 'Create New Post'}
                      </h3>
                      <button
                        onClick={() => {
                          setShowPostForm(false);
                          setEditingPost(null);
                          reset();
                          setContent('');
                        }}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        ×
                      </button>
                    </div>
                    
                    <form onSubmit={handleSubmit(onSubmitPost)} className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Title
                            </label>
                            <input
                              {...register('title', { required: 'Title is required' })}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {errors.title && (
                              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Content
                            </label>
                            <div className="bg-white rounded-md" style={{ minHeight: '500px' }}>
                              <style>
                                {`
                                  .ql-editor {
                                    color: #000 !important;
                                    font-size: 14px;
                                    line-height: 1.6;
                                  }
                                  .ql-editor p, .ql-editor h1, .ql-editor h2, .ql-editor h3 {
                                    color: #000 !important;
                                  }
                                `}
                              </style>
                              <ReactQuill
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                style={{ minHeight: '450px' }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Excerpt
                            </label>
                            <textarea
                              {...register('excerpt')}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Featured Image URL
                            </label>
                            <input
                              {...register('featured_image')}
                              type="url"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="flex items-center space-x-2">
                              <input
                                {...register('published')}
                                type="checkbox"
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Publish immediately
                              </span>
                            </label>
                          </div>
                          
                          <div className="flex space-x-3">
                            <button
                              type="submit"
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                              {editingPost ? 'Update' : 'Create'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowPostForm(false);
                                setEditingPost(null);
                                reset();
                                setContent('');
                              }}
                              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPosts.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">No posts found</p>
                      </div>
                    ) : (
                      <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Title
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredPosts.map((post) => (
                              <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {post.title}
                                    </div>
                                    {post.excerpt && (
                                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                        {post.excerpt}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    post.published
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  }`}>
                                    {post.published ? 'Published' : 'Draft'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(post.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-medium">
                                  <div className="flex items-center justify-end space-x-2">
                                    <button
                                      onClick={() => togglePostPublished(post)}
                                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                      title={post.published ? 'Unpublish' : 'Publish'}
                                    >
                                      {post.published ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    <button
                                      onClick={() => editPost(post)}
                                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button
                                      onClick={() => deletePost(post.id)}
                                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'comments' && (
              <CommentsManager comments={comments} onRefresh={fetchData} />
            )}
            
            {activeTab === 'categories' && (
              <CategoriesManager categories={categories} onRefresh={fetchData} />
            )}
            
            {activeTab === 'subscribers' && (
              <SubscribersManager subscribers={subscribers} onRefresh={fetchData} />
            )}
            
            {activeTab === 'newsletter' && (
              <NewsletterComposer subscribers={subscribers} />
            )}
            
            {activeTab === 'analytics' && (
              <AnalyticsDashboard posts={posts} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminContent;