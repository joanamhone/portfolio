import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
}

const SEO: React.FC<SEOProps> = ({
  title = 'Joana Promise Mhone - Cybersecurity & Software Development',
  description = 'Cybersecurity professional and software developer passionate about creating secure, innovative solutions.',
  image = '/og-image.jpg',
  url = window.location.href,
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'Joana Promise Mhone',
  tags = []
}) => {
  const siteTitle = 'Joana Promise Mhone';
  const fullTitle = title.includes(siteTitle) ? title : `${title} | ${siteTitle}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && (
        <meta property="article:author" content={author} />
      )}
      {tags.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === 'article' ? 'BlogPosting' : 'WebSite',
          "headline": title,
          "description": description,
          "image": image,
          "url": url,
          "author": {
            "@type": "Person",
            "name": author
          },
          ...(publishedTime && { "datePublished": publishedTime }),
          ...(modifiedTime && { "dateModified": modifiedTime }),
          ...(type === 'website' && {
            "name": siteTitle,
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${window.location.origin}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          })
        })}
      </script>
    </Helmet>
  );
};

export default SEO;