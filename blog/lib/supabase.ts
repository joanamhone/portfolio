import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  featured_image?: string
  slug: string
  published: boolean
  created_at: string
  updated_at: string
  categories?: Category[]
}

export interface Category {
  id: string
  name: string
  color: string
}

export const getAllPosts = async () => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      post_categories(
        categories(*)
      )
    `)
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  
  return data?.map(post => ({
    ...post,
    categories: post.post_categories?.map((pc: any) => pc.categories).filter(Boolean) || []
  }))
}

export const getPostBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      post_categories(
        categories(*)
      )
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error) throw error
  
  return {
    ...data,
    categories: data.post_categories?.map((pc: any) => pc.categories).filter(Boolean) || []
  }
}