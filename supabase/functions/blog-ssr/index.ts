import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const slug = url.pathname.split('/').pop()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error || !post) {
      return new Response('Post not found', { status: 404, headers: corsHeaders })
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title} - Joana Promise Mhone</title>
  <meta name="description" content="${post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 160)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://joanamhone.com/blog/${post.slug}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${post.title}">
  <meta property="og:description" content="${post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 160)}">
  <meta property="og:image" content="${post.featured_image || ''}">
  <meta property="og:type" content="article">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "${post.title}",
    "description": "${post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 160)}",
    "image": "${post.featured_image || ''}",
    "author": {
      "@type": "Person",
      "name": "Joana Promise Mhone"
    },
    "datePublished": "${post.created_at}",
    "dateModified": "${post.updated_at}"
  }
  </script>
</head>
<body>
  <article>
    <h1>${post.title}</h1>
    <div>${post.content}</div>
  </article>
</body>
</html>`

    return new Response(html, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})