// vite.config.ts - Add this plugin for build-time sitemap generation
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const sitemapPlugin = () => {
  return {
    name: 'sitemap-generator',
    writeBundle: async () => {
      // Generate sitemap during build
      const { generateSitemap } = await import('./src/lib/sitemap');
      const sitemap = await generateSitemap();
      
      const fs = await import('fs');
      fs.writeFileSync('./dist/sitemap.xml', sitemap);
      console.log('✅ Sitemap generated at build time');
    }
  }
}

export default defineConfig({
  plugins: [react(), sitemapPlugin()],
  // ... rest of config
})