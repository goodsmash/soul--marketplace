#!/bin/bash
# GitHub Push Script for Soul Marketplace

echo "🚀 Pushing Soul Marketplace to GitHub"
echo "======================================"
echo ""

cd ~/.openclaw/skills/soul-marketplace

# Check if remote exists
if git remote -v > /dev/null 2>&1; then
    echo "✅ Remote already configured"
    git remote -v
else
    echo "📝 GitHub Setup Required"
    echo ""
    echo "1. Create a new repository on GitHub:"
    echo "   https://github.com/new"
    echo ""
    echo "2. Repository name: soul-marketplace"
    echo "   Make it Public"
    echo "   Don't initialize with README (we have one)"
    echo ""
    echo "3. Copy the repository URL, then run:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/soul-marketplace.git"
    echo ""
    echo "4. Then push:"
    echo "   git push -u origin master"
    echo ""
    exit 1
fi

echo ""
echo "📤 Pushing to GitHub..."
git push -u origin master

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESSFULLY PUSHED TO GITHUB!"
    echo "======================================"
    echo ""
    echo "Repository URL:"
    git remote get-url origin
    echo ""
    echo "View at: https://github.com/YOUR_USERNAME/soul-marketplace"
    echo ""
    echo "Next: Deploy to Vercel!"
    echo "   cd ui && vercel --prod"
else
    echo ""
    echo "❌ Push failed. Check your GitHub credentials."
fi
