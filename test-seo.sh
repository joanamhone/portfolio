#!/bin/bash

echo "🔍 Testing SEO improvements..."

DOMAIN="your-vercel-domain.com"  # Replace with your actual domain

echo "📄 Testing blog index page..."
curl -s "https://$DOMAIN/blog" | grep -q "<title>" && echo "✅ Blog index has title tag" || echo "❌ Blog index missing title"

echo "🗺️ Testing sitemap..."
curl -s "https://$DOMAIN/blog/sitemap.xml" | grep -q "<urlset>" && echo "✅ Sitemap is accessible" || echo "❌ Sitemap not found"

echo "🤖 Testing robots.txt..."
curl -s "https://$DOMAIN/robots.txt" | grep -q "Sitemap" && echo "✅ Robots.txt has sitemap" || echo "❌ Robots.txt needs sitemap"

echo ""
echo "🎯 Manual tests to do:"
echo "1. Visit https://$DOMAIN/blog - should show blog listing"
echo "2. Click on a blog post - should show individual post"
echo "3. View page source - should see full HTML content (not just React loading)"
echo "4. Test Google PageSpeed Insights: https://pagespeed.web.dev/"