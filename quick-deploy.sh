#!/bin/bash

# Quick Deploy Script for NBA Team Wheel
# Sets up everything needed for online hosting

echo "🏀 NBA Team Wheel - Quick Deploy Setup"
echo "======================================"

# Add PWA script to index.html if not already there
if ! grep -q "setup-pwa.js" index.html; then
    echo "📱 Adding PWA functionality to index.html..."
    
    # Add PWA script before closing body tag
    sed -i.bak 's|</body>|<script src="setup-pwa.js"></script>\n</body>|g' index.html
    
    echo "✅ PWA script added to index.html"
else
    echo "✅ PWA script already in index.html"
fi

# Create basic app icon (you can replace this with a real icon later)
echo "🎨 Creating placeholder app icons..."
echo "Note: Replace these with real basketball-themed icons for better appearance"

# Create placeholder icon files (these will be replaced with real icons)
for size in 72 96 128 144 152 192 384 512; do
    echo "Creating ${size}x${size} icon..."
    # This creates a simple colored square - replace with real icons
    echo "<svg width='${size}' height='${size}' xmlns='http://www.w3.org/2000/svg'><rect width='${size}' height='${size}' fill='#ff6b35'/><text x='50%' y='50%' font-family='Arial' font-size='${size}' text-anchor='middle' dy='.35em' fill='white'>🏀</text></svg>" > "public/icons/icon-${size}x${size}.png"
done

echo "✅ Placeholder icons created"

# Create .gitignore for deployment
if [ ! -f .gitignore ]; then
    echo "📝 Creating .gitignore file..."
    cat > .gitignore << EOF
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Temporary files
*.tmp
*.temp
.cache/
EOF
    echo "✅ .gitignore created"
else
    echo "✅ .gitignore already exists"
fi

# Create netlify.toml for Netlify deployment
echo "🌐 Creating netlify.toml for Netlify deployment..."
cat > netlify.toml << EOF
[build]
  publish = "."
  command = "echo 'NBA Team Wheel ready for deployment'"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "*.svg"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "*.json"
  [headers.values]
    Cache-Control = "public, max-age=86400"

[[redirects]]
  from = "/sw.js"
  to = "/public/sw.js"
  status = 200

[[redirects]]
  from = "/manifest.json"
  to = "/public/manifest.json"
  status = 200
EOF

echo "✅ netlify.toml created"

# Create vercel.json for Vercel deployment
echo "🚀 Creating vercel.json for Vercel deployment..."
cat > vercel.json << EOF
{
  "version": 2,
  "name": "nba-team-wheel",
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/sw.js",
      "dest": "/public/sw.js"
    },
    {
      "src": "/manifest.json",
      "dest": "/public/manifest.json"
    },
    {
      "src": "/(.*)",
      "dest": "/\$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    },
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    }
  ]
}
EOF

echo "✅ vercel.json created"

# Check if Git is initialized
if [ ! -d .git ]; then
    echo "🐙 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: NBA Team Wheel ready for deployment"
    echo "✅ Git repository initialized"
    echo "📝 Next step: Push to GitHub and deploy to Vercel/Netlify"
else
    echo "✅ Git repository already exists"
    echo "📝 Ready to commit and push changes"
fi

echo ""
echo "🎉 DEPLOYMENT SETUP COMPLETE!"
echo "=============================="
echo ""
echo "📱 Your NBA Team Wheel is now ready for deployment!"
echo ""
echo "🚀 NEXT STEPS:"
echo "1. Commit changes: git add . && git commit -m 'Ready for deployment'"
echo "2. Push to GitHub: git push origin main"
echo "3. Deploy to Vercel: Go to vercel.com, import your repo"
echo "4. Share the URL with George & Frankie!"
echo ""
echo "📱 OFFLINE APP:"
echo "Once deployed, kids can install it on their iPads:"
echo "1. Open the website in Safari"
echo "2. Tap Share button"
echo "3. Tap 'Add to Home Screen'"
echo "4. Enjoy offline gaming!"
echo ""
echo "🏀 The NBA battle system with real player ratings is ready to go!"
EOF 