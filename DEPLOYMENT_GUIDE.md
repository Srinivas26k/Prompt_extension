# 🚀 DEPLOYMENT GUIDE - AI PROMPT ENHANCER

## 📁 Project Structure & File Selection

### 🎯 **Core Extension Files (Chrome Web Store)**
```
📦 Chrome Extension
├── manifest.json          ✅ REQUIRED - Extension configuration
├── background.js          ✅ REQUIRED - Extension background script  
├── popup.html             ✅ REQUIRED - Extension popup interface
├── popup.js               ✅ REQUIRED - Popup functionality
├── content.js             ✅ REQUIRED - Content script for web pages
├── content.css            ✅ REQUIRED - Content script styles
├── sidebar.html           ✅ REQUIRED - Extension sidebar
├── sidebar.js             ✅ REQUIRED - Sidebar functionality  
├── sidebar.css            ✅ REQUIRED - Sidebar styles
└── icons/                 ✅ REQUIRED - Extension icons
    ├── icon-16.png
    ├── icon-32.png  
    ├── icon-48.png
    └── icon-96.png
```

### 🖥️ **Frontend Web App (GitHub Pages)**
```
📦 GitHub Pages Deployment
├── welcome.html           ✅ MAIN - Landing page
├── welcome.js             ✅ REQUIRED - Landing page functionality
├── verify.html            ✅ REQUIRED - Code verification page
├── popup.html             ✅ REQUIRED - Can serve as demo interface
├── popup.js               ✅ REQUIRED - Interface functionality
├── sidebar.html           ✅ REQUIRED - Main app interface
├── sidebar.js             ✅ REQUIRED - App functionality
├── sidebar.css            ✅ REQUIRED - App styles
├── content.css            ✅ REQUIRED - Additional styles
└── icons/                 ✅ REQUIRED - App icons
```

### 🐍 **Backend API Server (Flask/Streamlit)**

#### Option 1: **Flask API (Recommended for Production)**
```
📦 Flask Deployment
├── flask_api.py           ✅ MAIN APP - Standalone Flask server
├── requirements.txt       ✅ REQUIRED - Python dependencies
└── Database will be created automatically
```

#### Option 2: **Streamlit with Embedded Flask**
```
📦 Streamlit Deployment  
├── app.py                 ❌ NOT RECOMMENDED - Has UI conflicts
├── streamlit_with_api.py  ✅ ALTERNATIVE - Streamlit + Flask combo
├── requirements.txt       ✅ REQUIRED - Python dependencies
└── Database will be created automatically
```

---

## 🎯 **Deployment Recommendations**

### 🥇 **Primary Choice: Flask API (`flask_api.py`)**
**Why this is the best option:**
- ✅ Standalone Flask server
- ✅ Clean API endpoints
- ✅ No UI conflicts  
- ✅ Better performance
- ✅ Easier to deploy on cloud platforms
- ✅ Already has database path fixes implemented

**Deploy this for:**
- Production API server
- Cloud hosting (Heroku, Railway, Render)
- VPS deployment

### 🥈 **Alternative: Streamlit with API (`streamlit_with_api.py`)**
**Use this if you need:**
- Admin dashboard UI
- Quick prototyping
- Local development with UI

### ❌ **Avoid: `app.py`**
- Has Streamlit UI mixed with Flask
- Potential conflicts
- More complex deployment

---

## 📋 **Deployment Checklist**

### ✅ **For Chrome Extension**
- [ ] All core extension files present
- [ ] Icons in correct sizes
- [ ] manifest.json properly configured
- [ ] Background and content scripts working

### ✅ **For GitHub Pages Frontend**  
- [ ] `welcome.html` as index page
- [ ] All HTML/CSS/JS files included
- [ ] API endpoints configured to point to your Flask server
- [ ] Icons and assets included

### ✅ **For Flask API Backend**
- [ ] Use `flask_api.py` as main application
- [ ] `requirements.txt` with all dependencies
- [ ] Environment variables configured
- [ ] Database path fixes verified
- [ ] CORS configured for frontend domain

---

## 🚀 **Quick Deploy Commands**

### GitHub Pages Frontend:
```bash
# Push these files to gh-pages branch:
git checkout -b gh-pages
git add welcome.html welcome.js verify.html sidebar.html sidebar.js sidebar.css popup.html popup.js content.css icons/
git commit -m "Deploy frontend to GitHub Pages"
git push origin gh-pages
```

### Flask API Backend:
```bash
# Deploy flask_api.py to your cloud provider
# Example for Railway:
railway login
railway new
railway add
git add flask_api.py requirements.txt
git commit -m "Deploy Flask API"
railway up
```

---

## 🔧 **Configuration Updates Needed**

1. **Update API endpoints in frontend files** to point to your deployed Flask server
2. **Configure CORS** in `flask_api.py` to allow your GitHub Pages domain
3. **Set environment variables** for production database and API keys

---

## 📁 **Files to Include in Git Repository**

### ✅ **Essential Files:**
- All extension files (manifest.json, popup.*, sidebar.*, content.*, background.js)
- All frontend files (welcome.*, verify.html)  
- **flask_api.py** (main backend)
- requirements.txt
- README.md
- Icons folder

### ❌ **Files to Exclude (via .gitignore):**
- node_modules/
- venv/
- *.db files
- __pycache__/
- *.log files  
- Backup files (*_old.*, *_backup.*)
- Deployment scripts
- .zip packages
