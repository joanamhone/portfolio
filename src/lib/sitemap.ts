import { supabase } from './supabase';

export const generateSitemap = async () => {
  const baseUrl = 'https://joanamhone.com'; // Replace with your actual domain
  
  let urls = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/blog', priority: '0.9', changefreq: 'daily' },
    { url: '/cybersecurity', priority: '0.8', changefreq: 'monthly' },
    { url: '/software', priority: '0.8', changefreq: 'monthly' },
    { url: '/search', priority: '0.6', changefreq: 'monthly' }
  ];

  // Add blog posts
  if (supabase) {
    try {
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('id, updated_at')
        .eq('published', true);

      if (posts) {
        posts.forEach(post => {
          urls.push({
            url: `/blog/${post.id}`,
            priority: '0.7',
            changefreq: 'weekly',
            lastmod: post.updated_at
          });
        });
      }
    } catch (error) {
      console.error('Error fetching posts for sitemap:', error);
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ url, priority, changefreq, lastmod }) => `
  <url>
    <loc>${baseUrl}${url}</loc>
    <priority>${priority}</priority>
    <changefreq>${changefreq}</changefreq>
    ${lastmod ? `<lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
  </url>`).join('')}
</urlset>`;

  return sitemap;
};