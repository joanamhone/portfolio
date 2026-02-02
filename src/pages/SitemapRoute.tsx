import React, { useEffect, useState } from 'react';
import { generateSitemap } from '../lib/sitemap';

const SitemapRoute: React.FC = () => {
  const [sitemapXML, setSitemapXML] = useState('');

  useEffect(() => {
    const loadSitemap = async () => {
      const xml = await generateSitemap();
      setSitemapXML(xml);
      
      // Set proper content type
      document.contentType = 'application/xml';
    };
    
    loadSitemap();
  }, []);

  // Return raw XML
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: sitemapXML }}
      style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}
    />
  );
};

export default SitemapRoute;