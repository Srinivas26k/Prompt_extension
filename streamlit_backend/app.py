import streamlit as st
import sqlite3
import secrets
import string
import os
from datetime import datetime
import requests
import json
import hashlib
from flask import Flask, request, jsonify, session
from flask_cors import CORS
import threading
import time

# Simple secure password - change this!
ADMIN_PASSWORD = "admin123"

# Helper function to get absolute database path
def get_db_path():
    """Get the absolute path to the users.db file."""
    return os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'users.db')

# Flask app for API endpoints
flask_app = Flask(__name__)
flask_app.secret_key = "your-secret-key-change-this"
CORS(flask_app, origins=['*'])  # Allow all origins for GitHub Pages

# Initialize database with clean schema
def init_db():
    conn = sqlite3.connect(get_db_path())
    c = conn.cursor()
    
    # Waiting list table (for initial registration)
    c.execute('''CREATE TABLE IF NOT EXISTS waiting_list
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL,
                  email TEXT UNIQUE NOT NULL,
                  reason TEXT,
                  status TEXT DEFAULT 'pending',
                  applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  approved_date TIMESTAMP,
                  admin_notes TEXT)''')
    
    # Active users table (approved users)
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

# Generate unique code
def generate_code():
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))

# Registration function (for API)
def register_user(name, email, reason):
    """Add user to waiting list"""
    try:
        conn = sqlite3.connect(get_db_path())
        c = conn.cursor()
        
        # Check if email already exists
        c.execute("SELECT email FROM waiting_list WHERE email = ?", (email,))
        if c.fetchone():
            return {"success": False, "message": "Email already registered"}
        
        # Add to waiting list
        c.execute("""INSERT INTO waiting_list (name, email, reason) 
                     VALUES (?, ?, ?)""", (name, email, reason))
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "Successfully added to waiting list"}
    except Exception as e:
        return {"success": False, "message": f"Registration failed: {str(e)}"}

# Approve user and generate code
def approve_user(email, admin_notes=""):
    """Approve waiting list user and create active account"""
    try:
        conn = sqlite3.connect(get_db_path())
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

# Verify redemption code
def verify_code(email, code):
    """Verify redemption code and email combination"""
    try:
        conn = sqlite3.connect(get_db_path())
        c = conn.cursor()
        
        c.execute("""SELECT name, credits, used_credits, status FROM users 
                     WHERE email = ? AND redemption_code = ?""", (email, code))
        user = c.fetchone()
        
        if not user:
            return {"success": False, "message": "Invalid code or email"}
        
        name, credits, used_credits, status = user
        
        if status != 'active':
            return {"success": False, "message": "Account is not active"}
        
        remaining_credits = credits - used_credits
        
        return {
            "success": True, 
            "name": name,
            "credits": remaining_credits,
            "message": "Code verified successfully"
        }
    except Exception as e:
        return {"success": False, "message": f"Verification failed: {str(e)}"}

# Enhanced prompt template with Ben's methodology
def create_enhanced_prompt(original_prompt, settings):
    role = settings.get('role', 'AI Assistant')
    description = settings.get('description', 'detailed')
    length = settings.get('length', 'medium')
    format_style = settings.get('format', 'structured')
    tone = settings.get('tone', 'helpful')
    
    enhanced_template = f"""# AI BRIEFING DOCUMENT

## ROLE ASSIGNMENT
You are a {role} with comprehensive expertise in your domain.

## PRIMARY GOAL
{original_prompt}

## CONTEXT DUMP
- Target audience: Professional users seeking high-quality responses
- Environment: Structured AI interaction for optimal results
- Quality requirements: {description} response with {tone} tone
- Output specifications: {format_style} format, {length} length

## TASK REQUIREMENTS

### 1. RESPONSE STRUCTURE
- Provide a {description} analysis of the request
- Ensure {format_style} formatting throughout
- Maintain {tone} tone consistently
- Target {length} response length

### 2. QUALITY STANDARDS
- Include relevant examples where applicable
- Provide actionable insights
- Consider edge cases and limitations
- Offer practical implementation guidance

### 3. DELIVERABLES
- Complete response to the original query
- Clear, logical structure
- Professional presentation
- Actionable conclusions

## RETURN FORMAT
Structure your response using:
- Clear headings and subheadings
- Bullet points for key information
- Examples to illustrate concepts
- Summary or conclusion section

## WARNINGS & CONSTRAINTS
- Maintain accuracy and factual correctness
- Acknowledge any limitations or uncertainties
- Avoid overgeneralization
- Stay within your knowledge boundaries

---

**Original User Request:** {original_prompt}

Please provide your response following this comprehensive briefing."""

    return enhanced_template

# Use credits and log usage
def use_credit_and_enhance(email, redemption_code, prompt, settings):
    """Use one credit and enhance prompt"""
    try:
        conn = sqlite3.connect(get_db_path())
        c = conn.cursor()
        
        # Verify user and credits
        c.execute("""SELECT credits, used_credits, status FROM users 
                     WHERE email = ? AND redemption_code = ?""", (email, redemption_code))
        user = c.fetchone()
        
        if not user:
            return {"success": False, "message": "Invalid credentials"}
        
        credits, used_credits, status = user
        remaining_credits = credits - used_credits
        
        if status != 'active':
            return {"success": False, "message": "Account not active"}
        
        if remaining_credits <= 0:
            return {"success": False, "message": "No credits remaining"}
        
        # Enhance the prompt
        enhanced_prompt = create_enhanced_prompt(prompt, settings)
        
        # Use one credit
        c.execute("""UPDATE users SET used_credits = used_credits + 1, last_used = CURRENT_TIMESTAMP 
                     WHERE email = ? AND redemption_code = ?""", (email, redemption_code))
        
        # Log usage
        c.execute("""INSERT INTO usage_logs (user_email, redemption_code, prompt_length, response_length) 
                     VALUES (?, ?, ?, ?)""", (email, redemption_code, len(prompt), len(enhanced_prompt)))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "enhanced_prompt": enhanced_prompt,
            "credits_remaining": remaining_credits - 1,
            "message": "Prompt enhanced successfully"
        }
    except Exception as e:
        return {"success": False, "message": f"Enhancement failed: {str(e)}"}

# Admin Dashboard Interface
def admin_dashboard():
    """Protected admin interface"""
    
    # Simple password protection
    if 'admin_logged_in' not in st.session_state:
        st.session_state.admin_logged_in = False
    
    if not st.session_state.admin_logged_in:
        st.title("🔐 Admin Login")
        password = st.text_input("Admin Password", type="password")
        
        if st.button("Login"):
            if password == ADMIN_PASSWORD:
                st.session_state.admin_logged_in = True
                st.rerun()
            else:
                st.error("Invalid password")
        
        st.warning("⚠️ Change the admin password in the code before deployment!")
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
        conn = sqlite3.connect(get_db_path())
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
                            conn = sqlite3.connect(get_db_path())
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
        conn = sqlite3.connect(get_db_path())
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
                                conn = sqlite3.connect(get_db_path())
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
        
        conn = sqlite3.connect(get_db_path())
        
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
                    conn = sqlite3.connect(get_db_path())
                    
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

# API Functions for frontend integration
def api_register_user(name, email, reason):
    """Handle user registration from frontend form"""
    try:
        conn = sqlite3.connect(get_db_path())
        c = conn.cursor()
        
        # Check if email already exists
        c.execute("SELECT email FROM waiting_list WHERE email = ?", (email,))
        if c.fetchone():
            return {"success": False, "message": "Email already registered in waiting list"}
        
        c.execute("SELECT email FROM users WHERE email = ?", (email,))
        if c.fetchone():
            return {"success": False, "message": "Email already has an active account"}
        
        # Add to waiting list
        c.execute('''INSERT INTO waiting_list (name, email, reason) 
                     VALUES (?, ?, ?)''', (name, email, reason))
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "Registration submitted successfully! You'll receive an email when approved."}
        
    except Exception as e:
        return {"success": False, "message": f"Registration failed: {str(e)}"}

def api_verify_code(email, code):
    """Verify redemption code and return user info"""
    try:
        conn = sqlite3.connect(get_db_path())
        c = conn.cursor()
        
        c.execute('''SELECT name, credits, used_credits, status 
                     FROM users 
                     WHERE email = ? AND redemption_code = ? AND status = 'active' ''', 
                  (email, code))
        
        user = c.fetchone()
        if not user:
            return {"success": False, "message": "Invalid email or redemption code"}
        
        name, credits, used_credits, status = user
        remaining_credits = credits - used_credits
        
        # Update last used timestamp
        c.execute('''UPDATE users 
                     SET last_used = CURRENT_TIMESTAMP 
                     WHERE email = ? AND redemption_code = ?''', 
                  (email, code))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True, 
            "message": "Verification successful!",
            "user": {
                "name": name,
                "email": email,
                "credits": remaining_credits,
                "redemption_code": code
            }
        }
        
    except Exception as e:
        return {"success": False, "message": f"Verification failed: {str(e)}"}

def api_check_credits(redemption_code):
    """Check remaining credits for a user"""
    try:
        conn = sqlite3.connect(get_db_path())
        c = conn.cursor()
        
        c.execute('''SELECT name, email, credits, used_credits, status 
                     FROM users 
                     WHERE redemption_code = ? AND status = 'active' ''', 
                  (redemption_code,))
        
        user = c.fetchone()
        if not user:
            return {"success": False, "message": "Invalid redemption code"}
        
        name, email, credits, used_credits, status = user
        remaining_credits = credits - used_credits
        
        return {
            "success": True,
            "user": {
                "name": name,
                "email": email,
                "credits": remaining_credits,
                "used_credits": used_credits,
                "total_credits": credits
            }
        }
        
    except Exception as e:
        return {"success": False, "message": f"Credit check failed: {str(e)}"}

def api_use_credit(redemption_code):
    """Use one credit for prompt enhancement"""
    try:
        conn = sqlite3.connect(get_db_path())
        c = conn.cursor()
        
        # Check current credits
        c.execute('''SELECT email, credits, used_credits 
                     FROM users 
                     WHERE redemption_code = ? AND status = 'active' ''', 
                  (redemption_code,))
        
        user = c.fetchone()
        if not user:
            return {"success": False, "message": "Invalid redemption code"}
        
        email, credits, used_credits = user
        remaining_credits = credits - used_credits
        
        if remaining_credits <= 0:
            return {"success": False, "message": "No credits remaining"}
        
        # Deduct one credit
        c.execute('''UPDATE users 
                     SET used_credits = used_credits + 1, last_used = CURRENT_TIMESTAMP 
                     WHERE redemption_code = ?''', 
                  (redemption_code,))
        
        # Log usage
        c.execute('''INSERT INTO usage_logs (user_email, redemption_code, prompt_length, response_length) 
                     VALUES (?, ?, ?, ?)''', 
                  (email, redemption_code, 0, 0))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True, 
            "message": "Credit used successfully",
            "remaining_credits": remaining_credits - 1
        }
        
    except Exception as e:
        return {"success": False, "message": f"Credit usage failed: {str(e)}"}

# Enhanced prompt generation using Ben's methodology
def api_generate_enhanced_prompt(original_prompt, settings):
    """Generate enhanced prompt using Ben's methodology"""
    role = settings.get('role', '')
    description = settings.get('description', 'detailed')
    length = settings.get('length', 'medium')
    format_style = settings.get('format', 'structured')
    tone = settings.get('tone', 'helpful')
    
    # Length mapping
    length_instructions = {
        'short': 'Keep the response concise and to the point',
        'medium': 'Provide a comprehensive but focused response',
        'long': 'Give a detailed, thorough explanation with examples'
    }
    
    # Format mapping  
    format_instructions = {
        'structured': 'Use clear headings, bullet points, and logical organization',
        'paragraph': 'Write in flowing paragraphs with smooth transitions',
        'stepbystep': 'Break down into numbered steps or sequential instructions',
        'creative': 'Use engaging, creative formatting with varied presentation styles'
    }
    
    # Tone mapping
    tone_instructions = {
        'helpful': 'Be supportive, encouraging, and solution-focused',
        'professional': 'Maintain formal, business-appropriate language',
        'casual': 'Use conversational, friendly, and approachable language',
        'technical': 'Focus on precision, accuracy, and technical detail'
    }
    
    # Build enhanced prompt using Ben's structure
    enhanced_sections = []
    
    # ROLE section
    if role:
        enhanced_sections.append(f"**ROLE**: You are {role}")
    
    # GOAL section  
    enhanced_sections.append(f"**GOAL**: {original_prompt}")
    
    # CONTEXT section
    context_parts = []
    if description == 'detailed':
        context_parts.append("Provide comprehensive information with relevant details")
    elif description == 'summary':
        context_parts.append("Focus on key points and essential information")
    elif description == 'creative':
        context_parts.append("Approach this with creativity and innovative thinking")
    
    if context_parts:
        enhanced_sections.append(f"**CONTEXT**: {' and '.join(context_parts)}")
    
    # REQUIREMENTS section
    requirements = []
    requirements.append(length_instructions[length])
    requirements.append(tone_instructions[tone])
    
    enhanced_sections.append(f"**REQUIREMENTS**: {' | '.join(requirements)}")
    
    # FORMAT section
    enhanced_sections.append(f"**FORMAT**: {format_instructions[format_style]}")
    
    # WARNINGS section
    enhanced_sections.append("**WARNINGS**: Ensure accuracy, avoid assumptions, and provide actionable insights")
    
    return "\n\n".join(enhanced_sections)

# Simple API handler for query parameters
def handle_api_request(action, **kwargs):
    """Handle API requests from the frontend"""
    if action == 'register':
        return api_register_user(kwargs.get('name'), kwargs.get('email'), kwargs.get('reason'))
    elif action == 'verify':
        return api_verify_code(kwargs.get('email'), kwargs.get('code'))
    elif action == 'check_credits':
        return api_check_credits(kwargs.get('redemption_code'))
    elif action == 'use_credit':
        return api_use_credit(kwargs.get('redemption_code'))
    elif action == 'enhance_prompt':
        credit_result = api_use_credit(kwargs.get('redemption_code'))
        if credit_result['success']:
            enhanced = api_generate_enhanced_prompt(kwargs.get('prompt'), kwargs.get('settings', {}))
            return {
                "success": True,
                "enhanced_prompt": enhanced,
                "remaining_credits": credit_result['remaining_credits']
            }
        return credit_result
    else:
        return {"success": False, "message": "Unknown action"}

# API endpoint for query parameters (can be called via GET)
if st.query_params:
    query = dict(st.query_params)
    if 'api_action' in query:
        st.set_page_config(page_title="API Response")
        result = handle_api_request(
            query.get('api_action'),
            name=query.get('name'),
            email=query.get('email'),
            reason=query.get('reason'),
            code=query.get('code'),
            redemption_code=query.get('redemption_code'),
            prompt=query.get('prompt'),
            settings=json.loads(query.get('settings', '{}'))
        )
        st.json(result)
        st.stop()

# Main application continues...
