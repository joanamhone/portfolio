import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { format } from 'date-fns'
import { getAllPosts, getPostBySlug, BlogPost } from '../lib/supabase'

interface BlogPostProps {
  post: BlogPost
}

export default function BlogPostPage({ post }: BlogPostProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 160),
    "image": post.featured_image,
    "author": {
      "@type": "Person",
      "name": "Joana Promise Mhone"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Joana Promise Mhone",
      "logo": {
        "@type": "ImageObject",
        "url": "https://joanamhone.com/favicon.png"
      }
    },
    "datePublished": post.created_at,
    "dateModified": post.updated_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://joanamhone.com/blog/${post.slug}`
    }
  }

  return (
    <>
      <Head>
        <title>{post.title} - Joana Promise Mhone</title>
        <meta name="description" content={post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 160)} />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Joana Promise Mhone" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 160)} />
        <meta property="og:image" content={post.featured_image} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.created_at} />
        <meta property="article:modified_time" content={post.updated_at} />
        <link rel="canonical" href={`https://joanamhone.com/blog/${post.slug}`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <nav className="mb-8">
            <Link href="/blog" className="text-blue-400 hover:text-blue-300">
              ← Back to blog
            </Link>
          </nav>

          <article className="max-w-4xl mx-auto">
            {post.featured_image && (
              <img 
                src={post.featured_image} 
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
              />
            )}

            <header className="mb-8">
              <div className="flex items-center text-sm text-gray-400 mb-4">
                <time dateTime={post.created_at}>
                  {format(new Date(post.created_at), 'MMMM dd, yyyy')}
                </time>
                <span className="mx-2">•</span>
                <span>By Joana Promise Mhone</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {post.title}
              </h1>

              {post.categories && post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.categories.map((category) => (
                    <span
                      key={category.id}
                      className="px-3 py-1 text-sm rounded-full"
                      style={{
                        backgroundColor: `${category.color}20`,
                        color: category.color
                      }}
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              )}
            </header>

            <div 
              className="prose prose-invert prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <footer className="mt-12 pt-8 border-t border-gray-700">
              <div className="text-center">
                <p className="text-gray-400 mb-4">
                  Thanks for reading! Share your thoughts in the comments.
                </p>
                <Link 
                  href="/blog"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Read More Posts
                </Link>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const posts = await getAllPosts()
    const paths = posts?.map((post) => ({
      params: { slug: post.slug }
    })) || []

    return {
      paths,
      fallback: 'blocking'
    }
  } catch (error) {
    console.error('Error generating paths:', error)
    return {
      paths: [],
      fallback: 'blocking'
    }
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const post = await getPostBySlug(params?.slug as string)
    
    return {
      props: {
        post
      }
    }
  } catch (error) {
    console.error('Error fetching post:', error)
    return {
      notFound: true
    }
  }
}