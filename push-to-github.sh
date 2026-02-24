#!/bin/bash
# Push Soul Marketplace to GitHub
# Run this script to push the repo

echo "🧬 Soul Marketplace - GitHub Push Script"
echo "========================================="
echo ""

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
    echo "   (Don't initialize with README)"
    echo ""
    echo "3. Enter your GitHub username:"
    read USERNAME
    echo ""
    
    # Add remote
    git remote add origin "https://github.com/$USERNAME/soul-marketplace.git"
    echo "✅ Remote added: https://github.com/$USERNAME/soul-marketplace.git"
fi

echo ""
echo "📤 Pushing to GitHub..."
git push -u origin master

echo ""
echo "✅ Done!"
echo "   View at: https://github.com/$USERNAME/soul-marketplace"
