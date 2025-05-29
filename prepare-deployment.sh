#!/bin/bash

# 🚀 Production Deployment Script for AI Prompt Enhancer
# This script helps you prepare files for deployment by updating API URLs

echo "🚀 AI Prompt Enhancer - Production Deployment Helper"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to update API URLs in files
update_api_urls() {
    local new_api_url=$1
    
    echo -e "${BLUE}📝 Updating API URLs to: ${new_api_url}${NC}"
    
    # Files to update
    files=(
        "background.js"
        "welcome.js" 
        "verify.html"
        "config.js"
    )
    
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            echo -e "   📄 Updating $file..."
            
            # Update localhost URLs to production URL
            sed -i.bak "s|http://localhost:5000|${new_api_url}|g" "$file"
            
            # Verify the change
            if grep -q "$new_api_url" "$file"; then
                echo -e "   ✅ ${GREEN}Updated successfully${NC}"
            else
                echo -e "   ❌ ${RED}Update failed${NC}"
            fi
        else
            echo -e "   ⚠️  ${YELLOW}File $file not found${NC}"
        fi
    done
}

# Function to create GitHub Pages deployment
create_github_pages_deployment() {
    echo -e "${BLUE}📦 Creating GitHub Pages deployment files...${NC}"
    
    # Create deployment directory
    mkdir -p deployment/github-pages
    
    # Copy frontend files
    cp welcome.html deployment/github-pages/index.html
    cp verify.html deployment/github-pages/
    cp welcome.js deployment/github-pages/
    cp sidebar.html deployment/github-pages/
    cp sidebar.js deployment/github-pages/
    cp sidebar.css deployment/github-pages/
    cp popup.html deployment/github-pages/
    cp popup.js deployment/github-pages/
    cp content.css deployment/github-pages/
    cp config.js deployment/github-pages/
    cp -r icons/ deployment/github-pages/
    
    echo -e "✅ ${GREEN}GitHub Pages files ready in deployment/github-pages/${NC}"
}

# Function to create Chrome Extension package
create_extension_package() {
    echo -e "${BLUE}📦 Creating Chrome Extension package...${NC}"
    
    # Create deployment directory
    mkdir -p deployment/chrome-extension
    
    # Copy extension files
    cp manifest.json deployment/chrome-extension/
    cp background.js deployment/chrome-extension/
    cp content.js deployment/chrome-extension/
    cp content.css deployment/chrome-extension/
    cp popup.html deployment/chrome-extension/
    cp popup.js deployment/chrome-extension/
    cp sidebar.html deployment/chrome-extension/
    cp sidebar.js deployment/chrome-extension/
    cp sidebar.css deployment/chrome-extension/
    cp -r icons/ deployment/chrome-extension/
    
    # Create zip package
    cd deployment/chrome-extension
    zip -r "../ai-prompt-enhancer-extension.zip" *
    cd ../..
    
    echo -e "✅ ${GREEN}Chrome Extension package ready: deployment/ai-prompt-enhancer-extension.zip${NC}"
}

# Function to create Flask API deployment
create_flask_deployment() {
    echo -e "${BLUE}📦 Creating Flask API deployment files...${NC}"
    
    # Create deployment directory
    mkdir -p deployment/flask-api
    
    # Copy Flask files
    cp streamlit_backend/flask_api.py deployment/flask-api/app.py
    cp streamlit_backend/requirements.txt deployment/flask-api/
    
    # Create Procfile for Heroku
    echo "web: python app.py" > deployment/flask-api/Procfile
    
    # Create deployment README
    cat > deployment/flask-api/README.md << 'EOF'
# Flask API Deployment

## Quick Deploy to Heroku:
```bash
heroku create your-app-name
git init
git add .
git commit -m "Initial deployment"
git push heroku main
```

## Quick Deploy to Railway:
```bash
railway login
railway new
railway add
git add .
git commit -m "Deploy to Railway"
railway up
```

## Environment Variables:
- Set any required environment variables in your platform's dashboard
EOF

    echo -e "✅ ${GREEN}Flask API deployment ready in deployment/flask-api/${NC}"
}

# Main menu
show_menu() {
    echo -e "\n${YELLOW}Choose deployment option:${NC}"
    echo "1. 🌐 Update API URLs for production"
    echo "2. 📄 Create GitHub Pages deployment"
    echo "3. 🔧 Create Chrome Extension package" 
    echo "4. 🐍 Create Flask API deployment"
    echo "5. 📦 Create complete deployment package (All)"
    echo "6. 🚫 Exit"
    echo
}

# Main script
main() {
    # Create deployment directory
    mkdir -p deployment
    
    while true; do
        show_menu
        read -p "Enter your choice (1-6): " choice
        
        case $choice in
            1)
                echo
                read -p "🌐 Enter your production API URL (e.g., https://your-api.herokuapp.com): " api_url
                if [ ! -z "$api_url" ]; then
                    update_api_urls "$api_url"
                else
                    echo -e "${RED}❌ No URL provided${NC}"
                fi
                ;;
            2)
                create_github_pages_deployment
                ;;
            3)
                create_extension_package
                ;;
            4)
                create_flask_deployment
                ;;
            5)
                echo -e "${BLUE}📦 Creating complete deployment package...${NC}"
                read -p "🌐 Enter your production API URL: " api_url
                if [ ! -z "$api_url" ]; then
                    update_api_urls "$api_url"
                fi
                create_github_pages_deployment
                create_extension_package
                create_flask_deployment
                echo -e "\n🎉 ${GREEN}Complete deployment package ready in deployment/ folder!${NC}"
                ;;
            6)
                echo -e "${GREEN}👋 Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Invalid option. Please choose 1-6.${NC}"
                ;;
        esac
        
        echo
        read -p "Press Enter to continue..."
    done
}

# Check if we're in the right directory
if [ ! -f "manifest.json" ] || [ ! -f "streamlit_backend/flask_api.py" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

# Run main function
main
