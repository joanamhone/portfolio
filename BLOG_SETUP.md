# Blog Setup Instructions

## Overview
Your portfolio now includes a fully functional blog system with the following features:
- Blog listing page (`/blog`)
- Individual blog post pages (`/blog/:id`)
- Admin panel for content management (`/admin`)
- Comment system with likes/dislikes
- Newsletter subscription
- Category management
- Search functionality

## Database Setup (Supabase)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key from the project settings

### 2. Environment Variables
1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Database Schema
Run these SQL commands in your Supabase SQL editor:

```sql
-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post categories junction table
CREATE TABLE post_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE(post_id, category_id)
);

-- Comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  user_ip VARCHAR(45),
  likes_count INTEGER DEFAULT 0,
  dislikes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comment likes table
CREATE TABLE comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  user_ip VARCHAR(45) NOT NULL,
  is_like BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_email, user_ip)
);

-- Analytics table
CREATE TABLE analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  user_ip VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  session_id VARCHAR(100) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscribers table
CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can read published posts" ON blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can read post categories" ON post_categories FOR SELECT USING (true);
CREATE POLICY "Public can read approved comments" ON comments FOR SELECT USING (approved = true);
CREATE POLICY "Public can read comment likes" ON comment_likes FOR SELECT USING (true);

-- Public insert policies for comments and subscriptions
CREATE POLICY "Anyone can insert comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert comment likes" ON comment_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can subscribe" ON subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert analytics" ON analytics FOR INSERT WITH CHECK (true);

-- Admin policies (you'll need to set up authentication)
-- For now, these allow all operations for authenticated users
CREATE POLICY "Authenticated users can manage posts" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage comments" ON comments FOR ALL USING (auth.role() = 'authenticated');
```

## Installation

1. Install the new dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

### Without Supabase
The blog will work with mock data if Supabase is not configured. This allows you to see the UI and functionality.

### With Supabase
Once you've set up Supabase and the environment variables:
1. Visit `/admin` to manage blog posts and categories
2. Visit `/blog` to see the public blog
3. Create posts and categories through the admin panel

## Features

### Blog (`/blog`)
- Responsive blog listing
- Search functionality
- Category filtering
- Newsletter signup
- Advertisement spaces

### Blog Post (`/blog/:id`)
- Full post content with rich text
- Comment system with nested replies
- Like/dislike functionality
- Social sharing ready

### Admin Panel (`/admin`)
- Post management (create, edit, delete, publish/unpublish)
- Category management with color coding
- Comment moderation
- Subscriber management
- Rich text editor for post content

## Customization

### Styling
All components use Tailwind CSS and follow your existing design system with:
- Dark theme
- Gradient accents
- Consistent spacing and typography

### Content
- Modify the mock data in `src/lib/supabase.ts` for demo purposes
- Customize the advertisement spaces in the blog components
- Update the newsletter signup functionality

## Security Notes

- Comments require approval by default
- User emails are collected for comment interactions
- IP addresses are stored for spam prevention
- Row Level Security is enabled on all tables