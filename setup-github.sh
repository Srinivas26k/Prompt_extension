#!/bin/bash

# GitHub Repository Setup Script for AI Prompt Enhancer
# This script helps you set up the repository for GitHub deployment

echo "🚀 AI Prompt Enhancer - GitHub Setup"
echo "====================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Initializing..."
    git init
    echo "✅ Git repository initialized"
fi

# Add all files
echo "📁 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Production-ready AI Prompt Enhancer with waitlist system

Features:
- Smart waitlist system (first 25 users free, then 1:10 approval ratio)
- AI prompt enhancement using OpenRouter
- Firefox browser extension
- Donation notifications every 5 minutes
- Next.js app with Supabase integration
- Complete production deployment ready

Components:
- nextjs-app/ - Main Next.js application
- firefox-extension/ - Browser extension
- complete-waitlist-setup.sql - Database schema
- GitHub Actions workflow for auto-deployment"

echo "🔧 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub"
echo "2. Add the remote origin:"
echo "   git remote add origin https://github.com/yourusername/your-repo-name.git"
echo "3. Push to GitHub:"
echo "   git push -u origin main"
echo ""
echo "4. For Vercel deployment, add these secrets in your GitHub repository:"
echo "   - VERCEL_TOKEN (from Vercel dashboard)"
echo "   - ORG_ID (your Vercel org ID)"
echo "   - PROJECT_ID (your Vercel project ID)"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - OPENROUTER_API_KEY"
echo ""
echo "5. The GitHub Action will automatically deploy to Vercel on push to main branch"
echo ""
echo "🎉 Ready for production deployment!"
