-- Create analytics table for tracking user interactions
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('page_view', 'post_view', 'post_like', 'comment_submit', 'newsletter_signup')),
  user_ip INET,
  user_agent TEXT,
  referrer TEXT,
  session_id VARCHAR(100) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_post_id ON analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for tracking)
CREATE POLICY "Allow public inserts" ON analytics
  FOR INSERT WITH CHECK (true);

-- Create policy to allow admin reads
CREATE POLICY "Allow admin reads" ON analytics
  FOR SELECT USING (true);

-- Grant permissions
GRANT INSERT ON analytics TO anon;
GRANT SELECT ON analytics TO authenticated;