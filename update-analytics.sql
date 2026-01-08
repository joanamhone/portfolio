-- Update analytics table to support new event types
ALTER TABLE analytics DROP CONSTRAINT IF EXISTS analytics_event_type_check;

ALTER TABLE analytics ADD CONSTRAINT analytics_event_type_check 
CHECK (event_type IN (
  'page_view', 
  'post_view', 
  'post_like', 
  'comment_submit', 
  'newsletter_signup',
  'link_click',
  'scroll_depth',
  'time_on_page',
  'download',
  'search',
  'social_share'
));