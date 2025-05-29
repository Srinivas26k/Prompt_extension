"""
Streamlit Cloud deployment for AI Prompt Enhancer API & Admin Dashboard

This file serves as the main entry point for Streamlit Cloud deployment.
It creates API endpoints using Streamlit's query parameters for compatibility
and includes an admin dashboard for managing users and applications.
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
    page_title="AI Prompt Enhancer",
    page_icon="🚀",
    layout="wide"
)

# Admin password - CHANGE THIS IN PRODUCTION!
ADMIN_PASSWORD = "admin123"

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

# Generate unique redemption codes
def generate_code():
    """Generate a unique redemption code"""
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))

# Approve user function
def approve_user(email, admin_notes=""):
    """Approve waiting list user and create active account"""
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        # Get user from waiting list
        c.execute("SELECT name, email FROM waiting_list WHERE email = ? AND status = 'pending'", (email,))
        user = c.fetchone()
        
        if not user:
            return {"success": False, "message": "User not found or already processed"}
        
        name, email = user
        
        # Generate unique code
        code = generate_code()
        while True:
            c.execute("SELECT redemption_code FROM users WHERE redemption_code = ?", (code,))
            if not c.fetchone():
                break
            code = generate_code()
        
        # Create active user account
        c.execute("""INSERT INTO users (name, email, redemption_code, credits, status) 
                     VALUES (?, ?, ?, 100, 'active')""", (name, email, code))
        
        # Update waiting list status
        c.execute("""UPDATE waiting_list SET status = 'approved', approved_date = CURRENT_TIMESTAMP, 
                     admin_notes = ? WHERE email = ?""", (admin_notes, email))
        
        conn.commit()
        conn.close()
        
        return {"success": True, "code": code, "message": "User approved successfully"}
    except Exception as e:
        return {"success": False, "message": f"Approval failed: {str(e)}"}

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
    # Check if accessing admin dashboard
    query_params = st.query_params
    if 'admin' in query_params:
        admin_dashboard()
    else:
        # Default landing page
        st.title("🚀 AI Prompt Enhancer API")
        st.markdown("### API Server Status: ✅ Running")
        
        # Add admin access button
        st.markdown("---")
        col1, col2 = st.columns([1, 1])
        with col1:
            if st.button("🔐 Admin Dashboard", help="Access admin features"):
                st.query_params['admin'] = 'true'
                st.rerun()
        
        st.markdown("### Available API Endpoints:")
        endpoints = [
            ("GET", "?endpoint=register&name=John&email=john@example.com&reason=Development", "Register for access"),
            ("GET", "?endpoint=verify&email=john@example.com&code=ABC12345", "Verify redemption code"),
            ("GET", "?endpoint=check_credits&redemption_code=ABC12345", "Check remaining credits"),
            ("GET", "?endpoint=enhance&prompt=Your prompt&redemption_code=ABC12345", "Enhance a prompt"),
            ("GET", "?endpoint=health", "API health check")
        ]
        
        for method, endpoint, description in endpoints:
            st.markdown(f"- **{method}** `{endpoint}` - {description}")
        
        st.markdown("### Configuration")
        st.markdown("""
        - **Environment**: Streamlit Cloud
        - **Database**: SQLite with automatic initialization
    - **API Format**: Query parameter based for Streamlit compatibility
    """)

    # Admin Dashboard Interface
    def admin_dashboard():
        """Protected admin interface for managing users and applications"""

        # Simple password protection
        if 'admin_logged_in' not in st.session_state:
            st.session_state.admin_logged_in = False

        if not st.session_state.admin_logged_in:
            st.title("🔐 Admin Login")
            st.warning("⚠️ Default password is 'admin123' - Change this in production!")
            password = st.text_input("Admin Password", type="password")

            if st.button("Login"):
                if password == ADMIN_PASSWORD:
                    st.session_state.admin_logged_in = True
                    st.rerun()
                else:
                    st.error("Invalid password")
            return

        # Admin Dashboard
        st.title("🎯 AI Prompt Enhancer - Admin Dashboard")

        # Logout button in sidebar
        with st.sidebar:
            st.write("👋 Welcome, Admin")
            if st.button("🚪 Logout"):
                st.session_state.admin_logged_in = False
                st.rerun()

        # Main dashboard tabs
        tab1, tab2, tab3, tab4 = st.tabs(["📝 Applications", "👥 Active Users", "📊 Analytics", "⚙️ Manual Tools"])

        with tab1:
            st.subheader("📋 Pending Applications")

            # Get pending applications
            conn = get_db_connection()
            pending = conn.execute("""
                SELECT id, name, email, reason, applied_date 
                FROM waiting_list 
                WHERE status = 'pending' 
                ORDER BY applied_date DESC
            """).fetchall()
            conn.close()

            if pending:
                for app_id, name, email, reason, applied_date in pending:
                    with st.container():
                        col1, col2, col3 = st.columns([3, 1, 1])

                        with col1:
                            st.write(f"**{name}** ({email})")
                            st.write(f"Reason: {reason or 'Not provided'}")
                            st.caption(f"Applied: {applied_date}")

                        with col2:
                            if st.button("✅ Approve", key=f"approve_{app_id}"):
                                result = approve_user(email, "Approved by admin")
                                if result["success"]:
                                    st.success(f"✅ Approved!")
                                    st.code(f"Redemption Code: {result['code']}")
                                    st.info("📧 Send this code to the user via email")
                                    st.rerun()
                                else:
                                    st.error(result["message"])

                        with col3:
                            if st.button("❌ Reject", key=f"reject_{app_id}"):
                                conn = get_db_connection()
                                conn.execute("""UPDATE waiting_list SET status = 'rejected' 
                                                  WHERE id = ?""", (app_id,))
                                conn.commit()
                                conn.close()
                                st.success("Application rejected")
                                st.rerun()

                        st.divider()
            else:
                st.info("✨ No pending applications")

        with tab2:
            st.subheader("👥 Active Users")

            # Get active users
            conn = get_db_connection()
            users = conn.execute("""
                SELECT name, email, redemption_code, credits, used_credits, created_date, last_used, status
                FROM users 
                ORDER BY created_date DESC
            """).fetchall()
            conn.close()

            if users:
                for name, email, code, credits, used, created, last_used, status in users:
                    with st.container():
                        col1, col2, col3 = st.columns([2, 2, 1])

                        with col1:
                            st.write(f"**{name}** ({email})")
                            st.caption(f"Code: `{code}`")
                            st.caption(f"Created: {created}")

                        with col2:
                            remaining = credits - used
                            progress = used / credits if credits > 0 else 0
                            st.metric("Credits", f"{remaining}/{credits}")
                            st.progress(progress)
                            if last_used:
                                st.caption(f"Last used: {last_used}")
                            else:
                                st.caption("Never used")

                        with col3:
                            status_color = "🟢" if status == "active" else "🔴"
                            st.write(f"{status_color} {status}")
                            
                            if status == "active":
                                if st.button("🚫 Revoke", key=f"revoke_{code}"):
                                    conn = get_db_connection()
                                    conn.execute("UPDATE users SET status = 'revoked' WHERE redemption_code = ?", (code,))
                                    conn.commit()
                                    conn.close()
                                    st.success("Access revoked")
                                    st.rerun()

                        st.divider()
            else:
                st.info("👤 No active users yet")

        with tab3:
            st.subheader("📊 System Analytics")

            conn = get_db_connection()

            # Overall stats
            col1, col2, col3, col4 = st.columns(4)

            with col1:
                total_apps = conn.execute("SELECT COUNT(*) FROM waiting_list").fetchone()[0]
                st.metric("Total Applications", total_apps)

            with col2:
                pending_apps = conn.execute("SELECT COUNT(*) FROM waiting_list WHERE status = 'pending'").fetchone()[0]
                st.metric("Pending", pending_apps)

            with col3:
                active_users = conn.execute("SELECT COUNT(*) FROM users WHERE status = 'active'").fetchone()[0]
                st.metric("Active Users", active_users)

            with col4:
                total_usage = conn.execute("SELECT COUNT(*) FROM usage_logs").fetchone()[0]
                st.metric("Total API Calls", total_usage)

            # Recent usage
            st.subheader("🕐 Recent Usage")
            recent_usage = conn.execute("""
                SELECT ul.user_email, ul.timestamp, ul.prompt_length, ul.response_length
                FROM usage_logs ul
                ORDER BY ul.timestamp DESC
                LIMIT 10
            """).fetchall()

            if recent_usage:
                for email, timestamp, prompt_len, response_len in recent_usage:
                    st.write(f"📧 {email} - {timestamp}")
                    st.caption(f"Prompt: {prompt_len} chars, Response: {response_len} chars")
                    st.divider()
            else:
                st.info("📊 No usage data yet")

            conn.close()

        with tab4:
            st.subheader("🔧 Manual Tools")

            # Manual code generation
            st.write("**🎫 Generate Manual Code**")
            with st.form("manual_code"):
                manual_name = st.text_input("Name")
                manual_email = st.text_input("Email")
                manual_credits = st.number_input("Credits", min_value=1, value=100)
                
                if st.form_submit_button("Generate Code"):
                    if manual_name and manual_email:
                        # Generate code directly
                        code = generate_code()
                        conn = get_db_connection()
                        
                        try:
                            # Ensure unique code
                            while True:
                                c = conn.execute("SELECT redemption_code FROM users WHERE redemption_code = ?", (code,))
                                if not c.fetchone():
                                    break
                                code = generate_code()
                            
                            conn.execute("""INSERT INTO users (name, email, redemption_code, credits) 
                                           VALUES (?, ?, ?, ?)""", (manual_name, manual_email, code, manual_credits))
                            conn.commit()
                            st.success(f"✅ Code generated successfully!")
                            st.code(f"Redemption Code: {code}")
                            st.info("📧 Send this code to the user")
                        except sqlite3.IntegrityError:
                            st.error("❌ Email already exists")
                        finally:
                            conn.close()
