#!/bin/bash

echo "🧪 Testing hybrid blog setup..."

# Test if blog builds locally
echo "📝 Testing Next.js blog build..."
cd blog
npm install --silent
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Blog builds successfully!"
    echo "🌐 Your blog will be available at:"
    echo "   - https://yourdomain.com/blog (blog index)"
    echo "   - https://yourdomain.com/blog/post-slug (individual posts)"
    echo "   - https://yourdomain.com/blog/sitemap.xml (sitemap)"
else
    echo "❌ Blog build failed. Check the errors above."
fi

cd ..
echo "🚀 Ready for deployment!"