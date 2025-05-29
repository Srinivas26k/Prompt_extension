"""
Streamlit Cloud deployment for AI Prompt Enhancer API & Admin Dashboard
Clean, simple version that prioritizes API functionality
"""

import streamlit as st
import sqlite3
import secrets
import string
from datetime import datetime
import json
import os

# Set page config first
st.set_page_config(
    page_title="AI Prompt Enhancer API",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Hide Streamlit UI elements for API responses
hide_streamlit_style = """
<style>
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header {visibility: hidden;}
.stApp > header {visibility: hidden;}
.stApp > div:first-child {margin-top: -80px;}
</style>
"""

# Handle API requests FIRST - before any UI elements
query_params = st.query_params

# Database helper function for API
def get_db_connection():
    db_path = os.path.join(os.path.dirname(__file__), 'users.db')
    return sqlite3.connect(db_path)

# Initialize database for API
def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''CREATE TABLE IF NOT EXISTS waiting_list
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL,
                  email TEXT UNIQUE NOT NULL,
                  reason TEXT,
                  status TEXT DEFAULT 'pending',
                  applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  approved_date TIMESTAMP,
                  admin_notes TEXT)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL,
                  email TEXT UNIQUE NOT NULL,
                  redemption_code TEXT UNIQUE NOT NULL,
                  credits INTEGER DEFAULT 100,
                  used_credits INTEGER DEFAULT 0,
                  status TEXT DEFAULT 'active',
                  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  last_used TIMESTAMP)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS usage_logs
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  user_email TEXT,
                  redemption_code TEXT,
                  prompt_length INTEGER,
                  response_length INTEGER,
                  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  ip_address TEXT)''')
    
    conn.commit()
    conn.close()

# Initialize database
init_db()

# Check if this is an API request (has 'endpoint' parameter)
if 'endpoint' in query_params:
    # Hide Streamlit UI for API responses
    st.markdown(hide_streamlit_style, unsafe_allow_html=True)
    
    endpoint = query_params['endpoint']
    
    # API endpoint routing
    if endpoint == 'health':
        st.json({"status": "healthy", "message": "API server is running"})
        st.stop()
    
    elif endpoint == 'register':
        name = query_params.get('name', '')
        email = query_params.get('email', '')
        reason = query_params.get('reason', '')
        
        if not name or not email:
            st.json({"success": False, "message": "Name and email are required"})
        else:
            try:
                conn = get_db_connection()
                c = conn.cursor()
                
                c.execute("SELECT email FROM waiting_list WHERE email = ?", (email,))
                if c.fetchone():
                    st.json({"success": False, "message": "Email already registered"})
                else:
                    c.execute("INSERT INTO waiting_list (name, email, reason) VALUES (?, ?, ?)", 
                             (name, email, reason))
                    conn.commit()
                    st.json({"success": True, "message": "Successfully added to waiting list"})
                conn.close()
            except Exception as e:
                st.json({"success": False, "message": f"Database error: {str(e)}"})
        st.stop()
    
    elif endpoint == 'verify':
        email = query_params.get('email', '')
        code = query_params.get('code', '')
        
        if not email or not code:
            st.json({"success": False, "message": "Email and code are required"})
        else:
            try:
                conn = get_db_connection()
                c = conn.cursor()
                c.execute("SELECT redemption_code, credits, used_credits FROM users WHERE email = ? AND redemption_code = ?", 
                         (email, code))
                user = c.fetchone()
                conn.close()
                
                if user:
                    st.json({
                        "success": True, 
                        "message": "Valid redemption code",
                        "credits": user[1],
                        "used_credits": user[2]
                    })
                else:
                    st.json({"success": False, "message": "Invalid email or redemption code"})
            except Exception as e:
                st.json({"success": False, "message": f"Database error: {str(e)}"})
        st.stop()
    
    elif endpoint == 'check_credits':
        redemption_code = query_params.get('redemption_code', '')
        
        if not redemption_code:
            st.json({"success": False, "message": "Redemption code is required"})
        else:
            try:
                conn = get_db_connection()
                c = conn.cursor()
                c.execute("SELECT credits, used_credits FROM users WHERE redemption_code = ?", (redemption_code,))
                user = c.fetchone()
                conn.close()
                
                if user:
                    st.json({
                        "success": True,
                        "credits": user[0],
                        "used_credits": user[1],
                        "remaining_credits": user[0] - user[1]
                    })
                else:
                    st.json({"success": False, "message": "Invalid redemption code"})
            except Exception as e:
                st.json({"success": False, "message": f"Database error: {str(e)}"})
        st.stop()
    
    elif endpoint == 'enhance':
        prompt = query_params.get('prompt', '')
        redemption_code = query_params.get('redemption_code', '')
        
        if not prompt or not redemption_code:
            st.json({"success": False, "message": "Prompt and redemption code are required"})
        else:
            try:
                conn = get_db_connection()
                c = conn.cursor()
                
                # Check user and credits
                c.execute("SELECT id, credits, used_credits FROM users WHERE redemption_code = ? AND status = 'active'", 
                         (redemption_code,))
                user = c.fetchone()
                
                if not user:
                    st.json({"success": False, "message": "Invalid or inactive redemption code"})
                    conn.close()
                    st.stop()
                
                user_id, credits, used_credits = user
                remaining = credits - used_credits
                
                if remaining <= 0:
                    st.json({"success": False, "message": "No credits remaining"})
                    conn.close()
                    st.stop()
                
                # Simple prompt enhancement
                enhanced_prompt = f"""ROLE: You are an expert assistant specialized in the topic at hand.

TASK: {prompt}

CONTEXT: Provide a comprehensive and well-structured response that addresses the request thoroughly.

REQUIREMENTS:
- Use clear, professional language
- Provide specific, actionable information
- Structure the response logically
- Include relevant examples where helpful

FORMAT: Use proper formatting with headings and bullet points for readability.

QUALITY STANDARDS: Ensure accuracy, completeness, and practical value in your response."""

                # Update usage
                c.execute("UPDATE users SET used_credits = used_credits + 1, last_used = CURRENT_TIMESTAMP WHERE id = ?", 
                         (user_id,))
                c.execute("INSERT INTO usage_logs (user_email, redemption_code, prompt_length, response_length) VALUES (?, ?, ?, ?)",
                         (query_params.get('email', ''), redemption_code, len(prompt), len(enhanced_prompt)))
                conn.commit()
                conn.close()
                
                st.json({
                    "success": True,
                    "enhanced_prompt": enhanced_prompt,
                    "credits_used": 1,
                    "remaining_credits": remaining - 1
                })
            except Exception as e:
                st.json({"success": False, "message": f"Error: {str(e)}"})
        st.stop()
    
    else:
        st.json({"success": False, "message": "Unknown endpoint"})
        st.stop()

# If we reach here, it's NOT an API request - show the regular UI
st.title("🚀 AI Prompt Enhancer API")
st.markdown("### API Server Status: ✅ Running")

st.markdown("### Available API Endpoints:")
st.markdown("""
- **GET** `?endpoint=health` - API health check
- **GET** `?endpoint=register&name=John&email=john@example.com&reason=Development` - Register for access
- **GET** `?endpoint=verify&email=john@example.com&code=ABC12345` - Verify redemption code
- **GET** `?endpoint=check_credits&redemption_code=ABC12345` - Check remaining credits
- **GET** `?endpoint=enhance&prompt=Your prompt&redemption_code=ABC12345` - Enhance a prompt
""")

st.markdown("### Test the API:")
if st.button("🔍 Test Health Endpoint"):
    st.json({"status": "healthy", "message": "API server is running"})

st.markdown("---")
st.markdown("**Admin Note**: This is a simplified API-first version focused on functionality.")
