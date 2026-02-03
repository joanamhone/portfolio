#!/bin/bash

echo "🚀 Building hybrid Next.js + Vite deployment..."

# Build main Vite app
echo "📦 Building main Vite app..."
npm run build

# Build Next.js blog
echo "📝 Building Next.js blog..."
cd blog
npm install
npm run build
cd ..

echo "✅ Build complete! Ready for Vercel deployment."