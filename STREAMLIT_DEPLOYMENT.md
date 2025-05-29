# Streamlit Cloud Deployment Configuration

## Overview
This project can be deployed entirely on Streamlit Cloud using the hybrid approach:
- Streamlit frontend for admin interface
- Flask API backend running in the same process
- SQLite database for data storage

## Deployment Steps for Streamlit Cloud

### 1. Repository Setup
1. Push your code to a public GitHub repository
2. Include these files in the root or streamlit_backend folder:
   - `streamlit_with_api.py` (main application)
   - `requirements.txt` (dependencies)
   - `.streamlit/config.toml` (optional config)

### 2. Streamlit Cloud Deployment
1. Go to https://share.streamlit.io/
2. Connect your GitHub account
3. Select your repository
4. Set the main file path: `streamlit_backend/streamlit_with_api.py`
5. Deploy!

### 3. URL Configuration
Once deployed, you'll get a URL like: `https://your-app-name.streamlit.app`

The API endpoints will be available at:
- `https://your-app-name.streamlit.app/api/register`
- `https://your-app-name.streamlit.app/api/verify`
- `https://your-app-name.streamlit.app/api/credits`
- `https://your-app-name.streamlit.app/api/use-credit`
- `https://your-app-name.streamlit.app/api/enhance-prompt`

### 4. Update Extension URLs
Update your extension files to use the Streamlit Cloud URL:

#### In welcome.js:
```javascript
const API_BASE_URL = 'https://your-app-name.streamlit.app';
```

#### In background.js:
```javascript
const API_BASE_URL = 'https://your-app-name.streamlit.app';
```

## Advantages of Streamlit Cloud Deployment

✅ **Free hosting** for personal/educational projects
✅ **Easy deployment** - just connect GitHub repo
✅ **Automatic updates** when you push to GitHub
✅ **Built-in HTTPS** - secure by default
✅ **No server management** required
✅ **SQLite works** for small to medium scale
✅ **Both admin interface and API** in one deployment

## Limitations to Consider

⚠️ **SQLite limitations** - not ideal for high concurrent usage
⚠️ **Memory limits** - Streamlit Cloud has resource constraints
⚠️ **Session management** - may need Redis for production scale
⚠️ **File storage** - temporary file system (database resets on restart)

## Alternative: FastAPI + Streamlit Cloud

You can also use FastAPI instead of Flask:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import threading

# FastAPI app
api = FastAPI()
api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@api.get("/api/health")
async def health_check():
    return {"status": "healthy"}

# Run FastAPI in background thread
def run_fastapi():
    uvicorn.run(api, host="0.0.0.0", port=8000)

# In your main Streamlit app:
if 'api_started' not in st.session_state:
    api_thread = threading.Thread(target=run_fastapi, daemon=True)
    api_thread.start()
    st.session_state.api_started = True
```

## Recommended Approach

For your AI Prompt Enhancer project, I recommend:

1. **Use the hybrid Streamlit + Flask approach** (already created)
2. **Deploy to Streamlit Cloud** (free and easy)
3. **For production scale**, consider upgrading to:
   - PostgreSQL database (using Supabase or similar)
   - Separate API deployment (Railway, Heroku, etc.)
   - Redis for session management

Would you like me to update the extension files to use Streamlit Cloud URLs and create the deployment script?
