import { useEffect } from 'react';

export const useAutoSEO = (postId?: string, title?: string) => {
  useEffect(() => {
    if (!postId || !title) return;

    // Auto-submit to Google for indexing (requires Google Search Console API)
    const submitToGoogle = async () => {
      try {
        // This would require Google Search Console API setup
        // For now, we'll just ping the sitemap
        fetch('/sitemap.xml', { method: 'HEAD' });
        
        // Log for manual submission
        console.log(`New blog post created: ${title}`);
        console.log(`URL: https://joanamhone.com/blog/${postId}`);
        console.log('Consider submitting to Google Search Console manually');
      } catch (error) {
        console.error('SEO automation error:', error);
      }
    };

    // Delay to ensure post is fully created
    setTimeout(submitToGoogle, 2000);
  }, [postId, title]);
};

export const generateStructuredData = (post: any) => {
  return {
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
      "@id": `https://joanamhone.com/blog/${post.id}`
    }
  };
};