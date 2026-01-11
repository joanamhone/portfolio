-- Check current analytics data
SELECT * FROM analytics LIMIT 10;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'analytics';

-- Fix permissions if needed
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public inserts" ON analytics;
DROP POLICY IF EXISTS "Allow admin reads" ON analytics;

CREATE POLICY "Allow public inserts" ON analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin reads" ON analytics
  FOR SELECT USING (true);

GRANT INSERT ON analytics TO anon;
GRANT SELECT ON analytics TO authenticated;