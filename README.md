# AI Prompt Enhancer - Production Ready

A complete Firefox extension and web application that transforms basic prompts into perfect role-based prompts using AI, with secure redemption code system.

## 🏗️ Project Structure

```
/ai-prompt-enhancer/
├── firefox-extension/          # 🦊 Firefox Extension Files
│   ├── manifest.json          # Extension configuration
│   ├── background.js          # Background service worker
│   ├── popup.html/js          # Extension popup interface
│   ├── sidebar.html/js/css    # Main extension interface
│   ├── content.js/css         # Content injection scripts
│   └── icons/                 # Extension icons (16-96px)
│
├── vercel-backend/            # ⚡ Serverless API Backend
│   ├── api/                   # Vercel serverless functions
│   │   ├── health.js          # API health check
│   │   ├── register.js        # User registration
│   │   ├── verify.js          # Code verification
│   │   ├── check-credits.js   # Credit checking
│   │   └── enhance.js         # Prompt enhancement
│   ├── lib/supabase.js        # Supabase client & utilities
│   ├── package.json           # Node.js dependencies
│   └── vercel.json            # Vercel configuration
│
├── supabase-db/               # 🗄️ Database Schema & Setup
│   ├── supabase-schema.sql    # Complete database schema
│   └── supabase-setup.md      # Database setup instructions
│
├── github-pages-frontend/     # 🌐 Static Frontend
│   ├── welcome.html           # Landing page (index.html)
│   ├── verify.html            # Code verification page
│   ├── main.js                # Frontend JavaScript
│   ├── css/styles.css         # Styling
│   └── assets/                # Static assets
│
├── scripts/                   # 🔧 Build & Deployment Scripts
│   ├── deploy-complete.sh     # Full deployment automation
│   ├── deploy-vercel.sh       # Vercel deployment
│   ├── deploy-production.sh   # Multi-platform deployment
│   └── test-deployment.sh     # Testing scripts
│
├── docs/                      # 📚 Documentation
│   ├── COMPLETE_DEPLOYMENT_GUIDE.md
│   ├── PRODUCTION_READY.md
│   └── [Other documentation files]
│
└── archive/                   # 📦 Old/Backup Files
    ├── streamlit_backend/     # Legacy Streamlit implementation
    ├── github-pages/          # Old frontend structure
    └── [Backup files]
```

## 🚀 Quick Start

### 1. Deploy Backend (Vercel + Supabase)
```bash
cd vercel-backend
npm install
vercel --prod
```

### 2. Setup Database (Supabase)
```bash
cd supabase-db
# Follow setup instructions in supabase-setup.md
```

### 3. Deploy Frontend (GitHub Pages)
```bash
cd github-pages-frontend
# Push to gh-pages branch
```

### 4. Package Extension (Firefox)
```bash
cd firefox-extension
# Update manifest.json with production URLs
# Package for Firefox Add-ons store
```

## 🔗 Live Deployment

- **Frontend**: https://srinivas26k.github.io/Prompt_extension/
- **API**: https://ai-prompt-enhancer-api.vercel.app/
- **Admin**: https://ai-prompt-enhancer.streamlit.app/ (Legacy)

## 🛠️ Development

Each folder contains its own README.md with specific development instructions.

## 📋 Architecture

- **Frontend**: Static HTML/CSS/JS hosted on GitHub Pages
- **Backend**: Serverless Vercel functions with Supabase PostgreSQL
- **Extension**: Firefox extension with secure API communication
- **Database**: Supabase with Row Level Security (RLS)

## 🔐 Security Features

- ✅ Secure redemption code system
- ✅ Rate limiting on API endpoints
- ✅ HTTPS everywhere
- ✅ Row Level Security on database
- ✅ No hardcoded credentials

## 📄 License

MIT License - See LICENSE file for details.

---
**Status**: Production Ready ✅
