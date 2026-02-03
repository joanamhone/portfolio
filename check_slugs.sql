-- Check if slug column exists and see current data
SELECT id, title, slug, created_at FROM blog_posts ORDER BY created_at DESC LIMIT 5;

-- If slugs are NULL, generate them for existing posts
UPDATE blog_posts 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
) 
WHERE slug IS NULL OR slug = '';

-- Check the results
SELECT id, title, slug FROM blog_posts WHERE slug IS NOT NULL;