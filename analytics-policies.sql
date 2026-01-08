-- Enable RLS on analytics table
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