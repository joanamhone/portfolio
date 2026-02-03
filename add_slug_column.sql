-- Add slug column to blog_posts table
ALTER TABLE blog_posts ADD COLUMN slug TEXT UNIQUE;

-- Generate slugs for existing posts (run this after adding the column)
UPDATE blog_posts 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
) 
WHERE slug IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);