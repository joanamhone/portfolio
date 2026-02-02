-- Create post_likes table
CREATE TABLE post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_ip TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_ip)
);

-- Add RLS policies
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view post likes" ON post_likes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert post likes" ON post_likes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own likes" ON post_likes
  FOR DELETE USING (true);