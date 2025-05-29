#!/usr/bin/env python3
"""
Update Chrome Extension with Production URLs
"""

import json
import os

def update_config_js():
    """Update config.js with production URLs"""
    config_content = '''// AI Prompt Enhancer Configuration
const CONFIG = {
    // Production API URL
    API_BASE_URL: "https://ai-prompt-enhancer.streamlit.app",
    
    // GitHub Pages Frontend URL
    FRONTEND_URL: "https://nampallisrinivas26.github.io/Prompt_extension/",
    
    // API Endpoints
    ENDPOINTS: {
        HEALTH: "?endpoint=health",
        REGISTER: "?endpoint=register",
        VERIFY: "?endpoint=verify", 
        CHECK_CREDITS: "?endpoint=check_credits",
        ENHANCE: "?endpoint=enhance"
    },
    
    // Enhancement Settings
    DEFAULT_SETTINGS: {
        role: "",
        description: "detailed",
        length: "medium", 
        format: "structured",
        tone: "helpful"
    },
    
    // UI Settings
    MAX_PROMPT_LENGTH: 2000,
    CREDITS_WARNING_THRESHOLD: 10,
    
    // Development mode (set to false for production)
    DEBUG: false
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}'''
    
    with open('config.js', 'w') as f:
        f.write(config_content)
    
    print("✅ Updated config.js with production URLs")

def update_manifest():
    """Update manifest.json with production permissions"""
    try:
        with open('manifest.json', 'r') as f:
            manifest = json.load(f)
        
        # Update permissions to include production URLs
        production_permissions = [
            "storage",
            "activeTab",
            "https://ai-prompt-enhancer.streamlit.app/*",
            "https://nampallisrinivas26.github.io/*"
        ]
        
        manifest["permissions"] = production_permissions
        manifest["version"] = "1.0.0"
        manifest["name"] = "AI Prompt Enhancer"
        manifest["description"] = "Enhance your prompts using Ben's methodology with admin-approved access"
        
        with open('manifest.json', 'w') as f:
            json.dump(manifest, f, indent=2)
        
        print("✅ Updated manifest.json with production permissions")
        
    except Exception as e:
        print(f"❌ Failed to update manifest.json: {e}")

def create_production_readme():
    """Create production setup instructions"""
    readme_content = '''# 🚀 AI Prompt Enhancer - Production Setup

## Quick Start

1. **User Registration:**
   - Visit: https://nampallisrinivas26.github.io/Prompt_extension/
   - Fill out the registration form
   - Wait for admin approval

2. **Admin Approval:**
   - Admin visits: https://ai-prompt-enhancer.streamlit.app/?admin=true
   - Reviews pending applications
   - Approves users and generates redemption codes

3. **Chrome Extension:**
   - Load the extension in Chrome
   - Enter your redemption code when prompted
   - Start enhancing prompts!

## Admin Access

- **URL:** https://ai-prompt-enhancer.streamlit.app/?admin=true
- **Features:** User management, analytics, manual tools

## API Endpoints

- **Base URL:** https://ai-prompt-enhancer.streamlit.app
- **Health:** `?endpoint=health`
- **Register:** `?endpoint=register&name=X&email=Y&reason=Z`
- **Enhance:** `?endpoint=enhance&prompt=X&redemption_code=Y`

## Support

For issues or questions, contact the administrator.
'''
    
    with open('PRODUCTION_README.md', 'w') as f:
        f.write(readme_content)
    
    print("✅ Created PRODUCTION_README.md")

def main():
    print("🔧 Updating Chrome Extension for Production")
    print("=" * 50)
    
    update_config_js()
    update_manifest()
    create_production_readme()
    
    print("\n✅ Chrome Extension Updated for Production!")
    print("\n📋 Next Steps:")
    print("1. Test the extension with production URLs")
    print("2. Verify user registration flow")
    print("3. Test prompt enhancement functionality")
    print("4. Package extension for distribution")

if __name__ == "__main__":
    main()
