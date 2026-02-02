import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnalyticsChartProps {
  data: any[];
  timeRange: string;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data, timeRange }) => {
  const [animatedData, setAnimatedData] = useState<any[]>([]);

  // Group data by day
  const groupedData = (data || []).reduce((acc: any, item) => {
    const date = new Date(item.created_at).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { date, views: 0, comments: 0, shares: 0, likes: 0, total: 0 };
    }
    
    if (item.event_type === 'post_view') acc[date].views++;
    if (item.event_type === 'comment_submit') acc[date].comments++;
    if (item.event_type === 'social_share') acc[date].shares++;
    if (item.event_type === 'post_like') acc[date].likes++;
    acc[date].total = acc[date].views + acc[date].comments + acc[date].shares + acc[date].likes;
    
    return acc;
  }, {});

  const chartData = Object.values(groupedData).slice(-7); // Last 7 days
  const maxValue = Math.max(...(chartData as any[]).map(d => d.total), 1);
  
  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(chartData as any[]);
    }, 300);
    return () => clearTimeout(timer);
  }, [chartData]);

  // Generate SVG path for line
  const generatePath = (dataKey: 'views' | 'comments' | 'shares' | 'likes') => {
    if (animatedData.length === 0 || maxValue === 0) return '';
    
    const points = animatedData.map((d, i) => {
      const x = 20 + (i * 360) / Math.max(animatedData.length - 1, 1);
      const y = 140 - ((d[dataKey] / maxValue) * 100);
      return `${x},${y}`;
    }).filter(point => !point.includes('NaN'));
    
    if (points.length === 0) return '';
    return `M ${points.join(' L ')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Analytics Timeline
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Real-time engagement metrics</p>
      </div>
      
      <div className="p-6">
        {chartData.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 animate-pulse"></div>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Collecting data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 shadow-lg shadow-cyan-500/50"></div>
                <span className="text-gray-600 dark:text-cyan-300">Views</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-500/50"></div>
                <span className="text-gray-600 dark:text-emerald-300">Comments</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-500 shadow-lg shadow-purple-500/50"></div>
                <span className="text-gray-600 dark:text-purple-300">Shares</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-400 to-red-500 shadow-lg shadow-red-500/50"></div>
                <span className="text-gray-600 dark:text-red-300">Likes</span>
              </div>
            </div>
            
            {/* SVG Chart */}
            <div className="relative">
              <svg width="100%" height="160" viewBox="0 0 400 160" className="overflow-visible">
                <defs>
                  <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/> 
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Grid */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line
                    key={i}
                    x1="20"
                    y1={20 + i * 30}
                    x2="380"
                    y2={20 + i * 30}
                    stroke="url(#gridGradient)"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                ))}
                
                {/* Views Line */}
                <motion.path
                  d={generatePath('views')}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="3"
                  filter="url(#glow)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                
                {/* Comments Line */}
                <motion.path
                  d={generatePath('comments')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  filter="url(#glow)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 0.3, ease: "easeInOut" }}
                />
                
                {/* Shares Line */}
                <motion.path
                  d={generatePath('shares')}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                  filter="url(#glow)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 0.6, ease: "easeInOut" }}
                />
                
                {/* Likes Line */}
                <motion.path
                  d={generatePath('likes')}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  filter="url(#glow)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 0.9, ease: "easeInOut" }}
                />
                
                {/* Data points */}
                {animatedData.map((d, i) => {
                  const x = 20 + (i * 360) / Math.max(animatedData.length - 1, 1);
                  const yViews = 140 - ((d.views / maxValue) * 100);
                  const yComments = 140 - ((d.comments / maxValue) * 100);
                  const yShares = 140 - ((d.shares / maxValue) * 100);
                  const yLikes = 140 - ((d.likes / maxValue) * 100);
                  
                  // Skip if coordinates are invalid
                  if (isNaN(x) || isNaN(yViews) || isNaN(yComments) || isNaN(yShares) || isNaN(yLikes)) {
                    return null;
                  }
                  
                  return (
                    <g key={i}>
                      {/* Views point */}
                      {d.views > 0 && (
                        <motion.circle
                          cx={x}
                          cy={yViews}
                          r="4"
                          fill="#06b6d4"
                          className="drop-shadow-lg"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 2 + i * 0.1 }}
                        />
                      )}
                      {/* Comments point */}
                      {d.comments > 0 && (
                        <motion.circle
                          cx={x}
                          cy={yComments}
                          r="4"
                          fill="#10b981"
                          className="drop-shadow-lg"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 2.3 + i * 0.1 }}
                        />
                      )}
                      {/* Shares point */}
                      {d.shares > 0 && (
                        <motion.circle
                          cx={x}
                          cy={yShares}
                          r="4"
                          fill="#8b5cf6"
                          className="drop-shadow-lg"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 2.6 + i * 0.1 }}
                        />
                      )}
                      {/* Likes point */}
                      {d.likes > 0 && (
                        <motion.circle
                          cx={x}
                          cy={yLikes}
                          r="4"
                          fill="#ef4444"
                          className="drop-shadow-lg"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 2.9 + i * 0.1 }}
                        />
                      )}
                    </g>
                  );
                }).filter(Boolean)}
              </svg>
              
              {/* Date labels */}
              <div className="flex justify-between mt-4 px-5">
                {animatedData.map((d, i) => (
                  <motion.div
                    key={i}
                    className="text-xs text-gray-500 dark:text-gray-400 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3 + i * 0.1 }}
                  >
                    {new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AnalyticsChart;