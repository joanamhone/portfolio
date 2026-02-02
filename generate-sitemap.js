// Run this script to generate sitemap with your blog posts
// node generate-sitemap.js

const fs = require('fs');

const generateSitemap = () => {
  const baseUrl = 'https://joanamhone.com';
  
  // Add your actual blog post IDs here
  const blogPosts = [
    '3c4457e8-a9a6-4132-90b1-eb86f0f31182',
    // Add more blog post IDs as you create them
  ];

  let urls = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/blog', priority: '0.9', changefreq: 'daily' },
    { url: '/cybersecurity', priority: '0.8', changefreq: 'monthly' },
    { url: '/software', priority: '0.8', changefreq: 'monthly' },
    { url: '/search', priority: '0.6', changefreq: 'monthly' }
  ];

  // Add blog posts
  blogPosts.forEach(postId => {
    urls.push({
      url: `/blog/${postId}`,
      priority: '0.7',
      changefreq: 'weekly'
    });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ url, priority, changefreq }) => `  <url>
    <loc>${baseUrl}${url}</loc>
    <priority>${priority}</priority>
    <changefreq>${changefreq}</changefreq>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync('./public/sitemap.xml', sitemap);
  console.log('Sitemap generated successfully!');
};

generateSitemap();