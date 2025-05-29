# Firefox Extension - AI Prompt Enhancer

Firefox extension that enhances prompts using AI with secure redemption code system.

## 📁 Files Structure

```
firefox-extension/
├── manifest.json          # Extension configuration & permissions
├── background.js          # Background service worker
├── popup.html             # Extension popup interface
├── popup.js               # Popup functionality
├── sidebar.html           # Main extension sidebar interface
├── sidebar.js             # Sidebar functionality & API calls
├── sidebar.css            # Sidebar styling
├── sidebar_new.js         # Updated sidebar script
├── content.js             # Content script for web pages
├── content.css            # Content script styling
└── icons/                 # Extension icons
    ├── icon-16.png        # 16x16 icon
    ├── icon-32.png        # 32x32 icon
    ├── icon-48.png        # 48x48 icon
    └── icon-96.png        # 96x96 icon
```

## 🔧 Configuration

### Update API URLs
Before packaging, update the API endpoints in:
- `manifest.json` - permissions for production URLs
- `background.js` - API base URL configuration
- `sidebar.js` - API endpoint configuration

### Production URLs
```javascript
const API_BASE_URL = 'https://ai-prompt-enhancer-api.vercel.app/api';
const FRONTEND_URL = 'https://srinivas26k.github.io/Prompt_extension/';
```

## 📦 Building & Packaging

### 1. Update Manifest
```json
{
  "permissions": [
    "storage",
    "activeTab",
    "https://ai-prompt-enhancer-api.vercel.app/*",
    "https://srinivas26k.github.io/*"
  ]
}
```

### 2. Package Extension
```bash
# Create distribution package
zip -r ai-prompt-enhancer-v1.0.0.zip ./ -x "*.git*" "*.md" "node_modules/*"
```

### 3. Test Locally
```bash
# Load unpacked extension in Firefox
# Go to about:debugging#/runtime/this-firefox
# Click "Load Temporary Add-on"
# Select manifest.json
```

## 🎯 Features

- ✅ **Prompt Enhancement**: Transform basic prompts using AI
- ✅ **Secure Authentication**: Redemption code system
- ✅ **Cross-Site Support**: Works on ChatGPT, Claude, Perplexity, etc.
- ✅ **Real-time Interface**: Sidebar integration
- ✅ **Credit System**: Track usage with credit limits
- ✅ **Firefox Optimized**: Native Firefox extension APIs

## 🔗 Supported Sites

- ChatGPT (chat.openai.com, chatgpt.com)
- Claude (claude.ai)
- Perplexity (perplexity.ai)
- Grok (grok.x.com)
- Gemini (gemini.google.com)
- And more...

## 🚀 Publishing

### Firefox Add-ons Store
1. Create account at https://addons.mozilla.org/developers/
2. Upload the packaged .zip file
3. Fill out extension metadata
4. Submit for review

## 🛠️ Development

### Local Development
1. Load extension in Firefox Developer Edition
2. Use browser console for debugging
3. Test API connections with backend
4. Verify content script injection

### API Integration
The extension communicates with:
- **Vercel API**: User authentication & prompt enhancement
- **Supabase**: User data & credit tracking
- **GitHub Pages**: Registration flow

---
**Status**: Production Ready ✅
