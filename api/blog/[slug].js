import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const { slug } = req.query

  try {
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error || !post) {
      return res.status(404).send(`<!DOCTYPE html>
<html><head><title>Post Not Found</title></head>
<body><h1>Post not found</h1></body></html>`)
    }

    const cleanTitle = post.title.replace(/"/g, '&quot;')
    const cleanExcerpt = (post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 160)).replace(/"/g, '&quot;')

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cleanTitle} - Joana Promise Mhone</title>
  <meta name="description" content="${cleanExcerpt}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://joanamhone.com/blog/${post.slug}">
  
  <meta property="og:title" content="${cleanTitle}">
  <meta property="og:description" content="${cleanExcerpt}">
  <meta property="og:image" content="${post.featured_image || ''}">
  <meta property="og:type" content="article">
  
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "${cleanTitle}",
    "description": "${cleanExcerpt}",
    "image": "${post.featured_image || ''}",
    "author": {
      "@type": "Person",
      "name": "Joana Promise Mhone"
    },
    "datePublished": "${post.created_at}",
    "dateModified": "${post.updated_at}"
  }
  </script>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .content { line-height: 1.6; }
  </style>
</head>
<body>
  <article>
    <h1>${cleanTitle}</h1>
    <div class="content">${post.content}</div>
  </article>
</body>
</html>`

    res.setHeader('Content-Type', 'text/html')
    res.status(200).send(html)

  } catch (error) {
    res.status(500).send(`Error: ${error.message}`)
  }
}