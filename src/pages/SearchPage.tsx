import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Calendar, User, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { supabase, BlogPost, isSupabaseConfigured } from '../lib/supabase';
import SEO from '../components/SEO';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || !isSupabaseConfigured) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
      setSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      performSearch(query.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-20"
    >
      <SEO
        title={query ? `Search results for "${query}"` : 'Search'}
        description={`Search through blog posts and articles on cybersecurity and software development.`}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/blog" className="inline-flex items-center text-white/70 hover:text-accent mb-6 transition-colors">
          <ChevronLeft size={16} className="mr-1" />
          <span>Back to blog</span>
        </Link>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 gradient-text">
            {query ? `Search results for "${query}"` : 'Search'}
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-12 pr-4 py-4 bg-secondary border border-white/20 rounded-lg focus:outline-none focus:border-accent text-white placeholder-white/50 text-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-accent hover:bg-accent-cyber text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
              <p className="text-white/70 mt-4">Searching...</p>
            </div>
          )}

          {/* Results */}
          {searched && !loading && (
            <div>
              <p className="text-white/70 mb-6">
                {results.length} result{results.length !== 1 ? 's' : ''} found
                {query && ` for "${query}"`}
              </p>

              {results.length === 0 ? (
                <div className="text-center py-12">
                  <Search size={48} className="mx-auto text-white/30 mb-4" />
                  <h3 className="text-xl font-bold mb-2">No results found</h3>
                  <p className="text-white/70">
                    Try different keywords or browse our <Link to="/blog" className="text-accent hover:underline">latest posts</Link>
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {results.map((post) => (
                    <motion.article
                      key={post.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="card hover:scale-[1.02] transition-transform duration-300"
                    >
                      {post.featured_image && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                          <img 
                            src={post.featured_image} 
                            alt={post.title}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-white/60 mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{format(new Date(post.created_at), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User size={14} />
                          <span>Admin</span>
                        </div>
                      </div>
                      
                      <h2 className="text-xl font-bold mb-3 hover:text-accent transition-colors">
                        <Link to={`/blog/${post.id}`}>{post.title}</Link>
                      </h2>
                      
                      <p className="text-white/80 mb-4 leading-relaxed">
                        {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...'}
                      </p>
                      
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
          )}

          {/* Search Tips */}
          {!searched && (
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Search Tips</h3>
              <ul className="text-white/80 space-y-2">
                <li>• Use specific keywords related to cybersecurity or software development</li>
                <li>• Try different variations of your search terms</li>
                <li>• Search for topics like "security", "development", "programming", etc.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SearchPage;