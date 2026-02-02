import React, { useState, useEffect } from 'react';
import { BarChart3, Eye, Heart, MessageCircle, Users, TrendingUp, Calendar, Share2, MousePointer, Search, Clock, Target } from 'lucide-react';
import { getOverallAnalytics, getPostAnalytics } from '../lib/analytics';
import { BlogPost } from '../lib/supabase';
import AnalyticsChart from './AnalyticsChart';

interface AnalyticsDashboardProps {
  posts: BlogPost[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ posts }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [postAnalytics, setPostAnalytics] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [posts]);

  const fetchAnalytics = async () => {
    console.log('🔍 Starting analytics fetch...');
    setLoading(true);
    try {
      const overall = await getOverallAnalytics();
      console.log('📊 Overall analytics result:', overall);
      setAnalytics(overall);

      // Fetch analytics for each post
      const postAnalyticsData: Record<string, any> = {};
      for (const post of posts.slice(0, 10)) { // Limit to top 10 posts
        console.log('📝 Fetching analytics for post:', post.id);
        const postData = await getPostAnalytics(post.id);
        console.log('📈 Post analytics result:', postData);
        if (postData) {
          postAnalyticsData[post.id] = postData;
        }
      }
      console.log('📊 All post analytics:', postAnalyticsData);
      setPostAnalytics(postAnalyticsData);
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Views',
      value: analytics?.totalViews || 0,
      icon: Eye,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      name: 'Total Likes',
      value: analytics?.totalLikes || 0,
      icon: Heart,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900'
    },
    {
      name: 'Unique Visitors',
      value: analytics?.uniqueVisitors || 0,
      icon: Users,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900'
    },
    {
      name: 'Social Shares',
      value: analytics?.totalShares || 0,
      icon: Share2,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900'
    },
    {
      name: 'Comments',
      value: analytics?.totalComments || 0,
      icon: MessageCircle,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your blog performance and engagement
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar size={16} className="text-gray-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <Icon size={24} className={stat.color} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value.toLocaleString()}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Chart */}
      <AnalyticsChart data={analytics?.recentActivity || []} timeRange={timeRange} />

      {/* Top Performing Posts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <TrendingUp size={20} className="text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Performing Posts</h3>
          </div>
        </div>
        <div className="p-6">
          {posts.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No posts to analyze yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.slice(0, 5).map((post) => {
                const analytics = postAnalytics[post.id];
                return (
                  <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">{post.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Published {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Eye size={16} className="mr-1" />
                        <span>{analytics?.views || 0}</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Heart size={16} className="mr-1" />
                        <span>{analytics?.likes || 0}</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Users size={16} className="mr-1" />
                        <span>{analytics?.unique_views || 0}</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Share2 size={16} className="mr-1" />
                        <span>{analytics?.shares || 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Referrers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Target size={20} className="text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Traffic Sources</h3>
            </div>
          </div>
          <div className="p-6">
            {!analytics?.topReferrers || analytics.topReferrers.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No referrer data yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.topReferrers.map(([domain, count]: [string, number], index: number) => (
                  <div key={domain} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{index + 1}</span>
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">{domain}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{count} visits</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          <div className="p-6">
            {analytics?.recentActivity?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics?.recentActivity?.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {activity.event_type.replace('_', ' ')} 
                        {activity.post_id && ' on post'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activity.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;