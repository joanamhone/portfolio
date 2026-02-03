import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { format } from 'date-fns'
import { getAllPosts, BlogPost } from '../lib/supabase'

interface BlogIndexProps {
  posts: BlogPost[]
}

export default function BlogIndex({ posts }: BlogIndexProps) {
  return (
    <>
      <Head>
        <title>Blog - Joana Promise Mhone</title>
        <meta name="description" content="Latest blog posts on cybersecurity, software development, and technology insights." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://joanamhone.com/blog/" />
      </Head>

      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Blog</h1>
            <p className="text-gray-400 text-lg">Insights on cybersecurity, software development, and technology</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
                {post.featured_image && (
                  <img 
                    src={post.featured_image} 
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-400 mb-3">
                    <time dateTime={post.created_at}>
                      {format(new Date(post.created_at), 'MMMM dd, yyyy')}
                    </time>
                  </div>
                  
                  <h2 className="text-xl font-bold mb-3 hover:text-blue-400 transition-colors">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>
                  
                  <p className="text-gray-300 mb-4 line-clamp-3">
                    {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                  </p>
                  
                  {post.categories && post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.categories.map((category) => (
                        <span
                          key={category.id}
                          className="px-2 py-1 text-xs rounded-full"
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
                  
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const posts = await getAllPosts()
    
    return {
      props: {
        posts: posts || []
      }
    }
  } catch (error) {
    console.error('Error fetching posts:', error)
    return {
      props: {
        posts: []
      }
    }
  }
}