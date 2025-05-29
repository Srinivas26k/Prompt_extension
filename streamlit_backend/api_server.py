"""
Streamlit-based API server for AI Prompt Enhancer
This creates API endpoints using Streamlit's query parameters and session state
"""

import streamlit as st
import sqlite3
import secrets
import string
from datetime import datetime
import json
import os

# Set page config
st.set_page_config(
    page_title="AI Prompt Enhancer API",
    page_icon="🚀",
    layout="wide"
)

# Database helper function
def get_db_connection():
    """Get database connection with correct path"""
    db_path = os.path.join(os.path.dirname(__file__), 'users.db')
    return sqlite3.connect(db_path)

# Database initialization
def init_db():
    """Initialize the database with required tables"""
    conn = get_db_connection()
    c = conn.cursor()
    
    # Waiting list table
    c.execute('''CREATE TABLE IF NOT EXISTS waiting_list
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL,
                  email TEXT UNIQUE NOT NULL,
                  reason TEXT,
                  status TEXT DEFAULT 'pending',
                  applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  approved_date TIMESTAMP,
                  admin_notes TEXT)''')
    
    # Active users table
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
    
    # Usage logs
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

def generate_code():
    """Generate a secure 8-character redemption code"""
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))

def generate_enhanced_prompt(original_prompt, settings):
    """Generate enhanced prompt using Ben's methodology"""
    
    # Extract settings
    role = settings.get('role', '').strip()
    description = settings.get('description', 'detailed')
    length = settings.get('length', 'medium')
    format_type = settings.get('format', 'structured')
    tone = settings.get('tone', 'helpful')
    
    # Ben's methodology structure
    enhanced_parts = []
    
    # 1. ROLE (if specified)
    if role:
        enhanced_parts.append(f"ROLE: You are {role}.")
    
    # 2. GOAL
    enhanced_parts.append(f"GOAL: {original_prompt}")
    
    # 3. CONTEXT
    context_map = {
        'brief': "Provide a concise response.",
        'detailed': "Provide a comprehensive and thorough response with examples where appropriate.",
        'technical': "Focus on technical accuracy and implementation details.",
        'beginner': "Explain concepts clearly for someone new to this topic."
    }
    enhanced_parts.append(f"CONTEXT: {context_map.get(description, context_map['detailed'])}")
    
    # 4. REQUIREMENTS
    requirements = []
    
    # Length requirements
    length_map = {
        'short': "Keep response under 200 words",
        'medium': "Aim for 200-500 words",
        'long': "Provide a detailed response of 500+ words"
    }
    requirements.append(length_map.get(length, length_map['medium']))
    
    # Format requirements
    format_map = {
        'bullet': "Format as bullet points",
        'numbered': "Use numbered steps",
        'structured': "Use clear headings and sections",
        'paragraph': "Write in paragraph form"
    }
    requirements.append(format_map.get(format_type, format_map['structured']))
    
    # Tone requirements
    tone_map = {
        'helpful': "Use a helpful and supportive tone",
        'professional': "Maintain a professional tone",
        'casual': "Use a conversational, casual tone",
        'technical': "Use precise, technical language"
    }
    requirements.append(tone_map.get(tone, tone_map['helpful']))
    
    enhanced_parts.append("REQUIREMENTS:\n" + "\n".join(f"- {req}" for req in requirements))
    
    # 5. FORMAT
    enhanced_parts.append("FORMAT: Structure your response clearly with appropriate headings or organization.")
    
    # 6. WARNINGS
    enhanced_parts.append("WARNINGS: Ensure accuracy and provide sources when making factual claims.")
    
    return "\n\n".join(enhanced_parts)

# Initialize database
init_db()

# Handle API requests based on query parameters
query_params = st.query_params

# API endpoint routing
if 'endpoint' in query_params:
    endpoint = query_params['endpoint']
    
    if endpoint == 'health':
        st.json({"status": "healthy", "message": "API server is running"})
    
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
                
                # Check if email already exists
                c.execute("SELECT email FROM waiting_list WHERE email = ?", (email,))
                if c.fetchone():
                    st.json({"success": False, "message": "Email already registered"})
                else:
                    # Add to waiting list
                    c.execute("INSERT INTO waiting_list (name, email, reason) VALUES (?, ?, ?)", 
                             (name, email, reason))
                    conn.commit()
                    st.json({"success": True, "message": "Successfully added to waiting list"})
                
                conn.close()
                
            except Exception as e:
                st.json({"success": False, "message": f"Registration failed: {str(e)}"})
    
    elif endpoint == 'verify':
        email = query_params.get('email', '')
        code = query_params.get('code', '')
        
        if not email or not code:
            st.json({"success": False, "message": "Email and code are required"})
        else:
            try:
                conn = get_db_connection()
                c = conn.cursor()
                
                c.execute("""SELECT name, credits, used_credits, status FROM users 
                             WHERE email = ? AND redemption_code = ?""", (email, code))
                user = c.fetchone()
                
                if not user:
                    st.json({"success": False, "message": "Invalid code or email"})
                else:
                    name, credits, used_credits, status = user
                    
                    if status != 'active':
                        st.json({"success": False, "message": "Account is not active"})
                    else:
                        remaining_credits = credits - used_credits
                        st.json({
                            "success": True,
                            "name": name,
                            "credits": remaining_credits,
                            "message": "Verification successful"
                        })
                
                conn.close()
                
            except Exception as e:
                st.json({"success": False, "message": f"Verification failed: {str(e)}"})
    
    elif endpoint == 'check_credits':
        code = query_params.get('redemption_code', '')
        
        if not code:
            st.json({"success": False, "message": "Redemption code required"})
        else:
            try:
                conn = get_db_connection()
                c = conn.cursor()
                
                c.execute("SELECT credits, used_credits FROM users WHERE redemption_code = ?", (code,))
                user = c.fetchone()
                
                if not user:
                    st.json({"success": False, "message": "Invalid redemption code"})
                else:
                    credits, used_credits = user
                    remaining = credits - used_credits
                    
                    st.json({
                        "success": True,
                        "remaining_credits": remaining,
                        "total_credits": credits,
                        "used_credits": used_credits
                    })
                
                conn.close()
                
            except Exception as e:
                st.json({"success": False, "message": f"Credit check failed: {str(e)}"})
    
    elif endpoint == 'enhance':
        # For POST-like functionality, we'll use query parameters
        prompt = query_params.get('prompt', '')
        code = query_params.get('redemption_code', '')
        
        # Settings
        role = query_params.get('role', '')
        description = query_params.get('description', 'detailed')
        length = query_params.get('length', 'medium')
        format_type = query_params.get('format', 'structured')
        tone = query_params.get('tone', 'helpful')
        
        settings = {
            'role': role,
            'description': description,
            'length': length,
            'format': format_type,
            'tone': tone
        }
        
        if not prompt or not code:
            st.json({"success": False, "message": "Prompt and redemption code required"})
        else:
            try:
                # Check and use credit
                conn = get_db_connection()
                c = conn.cursor()
                
                # Check current credits
                c.execute("SELECT email, credits, used_credits FROM users WHERE redemption_code = ?", (code,))
                user = c.fetchone()
                
                if not user:
                    st.json({"success": False, "message": "Invalid redemption code"})
                else:
                    email, credits, used_credits = user
                    remaining = credits - used_credits
                    
                    if remaining <= 0:
                        st.json({"success": False, "message": "No credits remaining"})
                    else:
                        # Use one credit
                        new_used_credits = used_credits + 1
                        c.execute("UPDATE users SET used_credits = ?, last_used = CURRENT_TIMESTAMP WHERE redemption_code = ?", 
                                 (new_used_credits, code))
                        
                        # Log usage
                        c.execute("INSERT INTO usage_logs (user_email, redemption_code, prompt_length, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)", 
                                 (email, code, len(prompt)))
                        
                        conn.commit()
                        
                        # Generate enhanced prompt
                        enhanced = generate_enhanced_prompt(prompt, settings)
                        
                        st.json({
                            "success": True,
                            "enhanced_prompt": enhanced,
                            "remaining_credits": remaining - 1
                        })
                
                conn.close()
                
            except Exception as e:
                st.json({"success": False, "message": f"Enhancement failed: {str(e)}"})
    
    else:
        st.json({"success": False, "message": "Unknown endpoint"})

else:
    # Default landing page
    st.title("🚀 AI Prompt Enhancer API")
    st.markdown("### API Server Status: ✅ Running")
    
    # Get the current URL
    try:
        current_url = st.context.get_option("server.baseUrlPath") or ""
        if not current_url:
            # Fallback for Streamlit Cloud
            current_url = "https://your-app-name.streamlit.app"
    except:
        current_url = "https://your-app-name.streamlit.app"
    
    st.markdown("### Available API Endpoints:")
    endpoints = [
        ("GET", "?endpoint=register&name=John&email=john@example.com&reason=Development", "Register for access"),
        ("GET", "?endpoint=verify&email=john@example.com&code=ABC12345", "Verify redemption code"),
        ("GET", "?endpoint=check_credits&redemption_code=ABC12345", "Check remaining credits"),
        ("GET", "?endpoint=enhance&prompt=Your prompt&redemption_code=ABC12345", "Enhance a prompt"),
        ("GET", "?endpoint=health", "API health check")
    ]
    
    for method, endpoint, description in endpoints:
        st.markdown(f"- **{method}** `{current_url}{endpoint}` - {description}")
    
    st.markdown("### Configuration")
    st.markdown(f"""
    - **Environment**: Streamlit Cloud
    - **Database**: SQLite with automatic initialization
    - **API Format**: Query parameter based for Streamlit compatibility
    """)
    
    st.markdown("### Usage Example")
    st.code(f"""
# Health check
{current_url}?endpoint=health

# Register new user
{current_url}?endpoint=register&name=John Doe&email=john@example.com&reason=For development

# Check credits
{current_url}?endpoint=check_credits&redemption_code=ABC12345

# Enhance prompt
{current_url}?endpoint=enhance&prompt=Write a blog post&redemption_code=ABC12345&role=content writer&tone=professional
    """)
