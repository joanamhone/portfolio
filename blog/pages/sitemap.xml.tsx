import { GetServerSideProps } from 'next'
import { getAllPosts } from '../lib/supabase'

function generateSiteMap(posts: any[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://joanamhone.com/blog</loc>
       <priority>0.9</priority>
       <changefreq>daily</changefreq>
     </url>
     ${posts
       .map((post) => {
         return `
       <url>
           <loc>https://joanamhone.com/blog/${post.slug}</loc>
           <lastmod>${new Date(post.updated_at).toISOString().split('T')[0]}</lastmod>
           <priority>0.8</priority>
           <changefreq>weekly</changefreq>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    const posts = await getAllPosts()
    const sitemap = generateSiteMap(posts || [])

    res.setHeader('Content-Type', 'text/xml')
    res.write(sitemap)
    res.end()

    return {
      props: {},
    }
  } catch (error) {
    console.error('Error generating sitemap:', error)
    res.statusCode = 500
    res.end()
    return {
      props: {},
    }
  }
}

export default SiteMap