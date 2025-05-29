#!/usr/bin/env python3
"""
Streamlit app with embedded Flask API server
This runs both the Streamlit admin interface and Flask API endpoints
in a single deployment on Streamlit Cloud
"""

import streamlit as st
import sqlite3
import secrets
import string
from datetime import datetime
import threading
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

# Flask app for API endpoints (runs in background)
flask_app = Flask(__name__)
flask_app.secret_key = "your-secret-key-change-this"
CORS(flask_app, origins=['*'])

# Database initialization
def init_db():
    conn = sqlite3.connect('users.db')
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
                  email TEXT NOT NULL,
                  action TEXT NOT NULL,
                  credits_used INTEGER DEFAULT 1,
                  prompt_length INTEGER,
                  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    conn.commit()
    conn.close()

# Generate redemption code
def generate_code():
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))

# ==================== FLASK API ENDPOINTS ====================

@flask_app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        reason = data.get('reason', '').strip()
        
        if not name or not email:
            return jsonify({'success': False, 'message': 'Name and email are required'}), 400
        
        conn = sqlite3.connect('users.db')
        c = conn.cursor()
        
        # Check if already registered
        c.execute("SELECT * FROM waiting_list WHERE email = ?", (email,))
        if c.fetchone():
            return jsonify({'success': False, 'message': 'Email already registered'}), 400
        
        # Insert into waiting list
        c.execute("""INSERT INTO waiting_list (name, email, reason) 
                     VALUES (?, ?, ?)""", (name, email, reason))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True, 
            'message': 'Successfully registered! You\'ll receive your redemption code within 24 hours.'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Registration failed: {str(e)}'}), 500

@flask_app.route('/api/verify', methods=['POST'])
def verify_code():
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        code = data.get('code', '').strip().upper()
        
        if not email or not code:
            return jsonify({'success': False, 'message': 'Email and code are required'}), 400
        
        conn = sqlite3.connect('users.db')
        c = conn.cursor()
        
        # Check if user exists and code matches
        c.execute("SELECT * FROM users WHERE email = ? AND redemption_code = ?", (email, code))
        user = c.fetchone()
        
        if not user:
            return jsonify({'success': False, 'message': 'Invalid email or redemption code'}), 400
        
        credits = user[4]  # credits column
        used_credits = user[5]  # used_credits column
        
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Verification successful!',
            'credits': credits,
            'used_credits': used_credits
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Verification failed: {str(e)}'}), 500

@flask_app.route('/api/check_credits', methods=['POST'])
def check_credits():
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        code = data.get('code', '').strip().upper()
        
        conn = sqlite3.connect('users.db')
        c = conn.cursor()
        
        c.execute("SELECT credits, used_credits FROM users WHERE email = ? AND redemption_code = ?", 
                  (email, code))
        result = c.fetchone()
        conn.close()
        
        if not result:
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 400
        
        credits, used_credits = result
        return jsonify({
            'success': True,
            'credits': credits,
            'used_credits': used_credits
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500

@flask_app.route('/api/use_credit', methods=['POST'])
def use_credit():
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        code = data.get('code', '').strip().upper()
        prompt_length = data.get('prompt_length', 0)
        
        conn = sqlite3.connect('users.db')
        c = conn.cursor()
        
        # Check current credits
        c.execute("SELECT credits FROM users WHERE email = ? AND redemption_code = ?", 
                  (email, code))
        result = c.fetchone()
        
        if not result:
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 400
        
        credits = result[0]
        if credits <= 0:
            return jsonify({'success': False, 'message': 'No credits remaining'}), 400
        
        # Use credit
        c.execute("""UPDATE users 
                     SET credits = credits - 1, 
                         used_credits = used_credits + 1,
                         last_used = CURRENT_TIMESTAMP
                     WHERE email = ? AND redemption_code = ?""", (email, code))
        
        # Log usage
        c.execute("""INSERT INTO usage_logs (email, action, credits_used, prompt_length) 
                     VALUES (?, ?, ?, ?)""", (email, 'enhance_prompt', 1, prompt_length))
        
        conn.commit()
        
        # Get updated credits
        c.execute("SELECT credits, used_credits FROM users WHERE email = ? AND redemption_code = ?", 
                  (email, code))
        updated = c.fetchone()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Credit used successfully',
            'credits': updated[0],
            'used_credits': updated[1]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500

@flask_app.route('/api/enhance-prompt', methods=['POST'])
def enhance_prompt():
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        code = data.get('code', '').strip().upper()
        original_prompt = data.get('prompt', '').strip()
        
        if not original_prompt:
            return jsonify({'success': False, 'message': 'Prompt is required'}), 400
        
        # First use a credit
        credit_response = use_credit()
        if not credit_response[1] == 200:  # If credit usage failed
            return credit_response
        
        # Enhanced prompt template
        enhanced = f"""Please act as an expert AI prompt engineer. Your task is to enhance the following prompt to be more specific, detailed, and effective for getting high-quality AI responses.

Original prompt: "{original_prompt}"

Please rewrite this prompt with:
1. Clear role definition for the AI
2. Specific context and background information
3. Detailed requirements and expectations
4. Output format specifications
5. Any relevant constraints or guidelines

Enhanced prompt:"""
        
        return jsonify({
            'success': True,
            'enhanced_prompt': enhanced,
            'original_prompt': original_prompt
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Enhancement failed: {str(e)}'}), 500

# Health check endpoint
@flask_app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

# ==================== STREAMLIT ADMIN INTERFACE ====================

def run_flask():
    """Run Flask server in a separate thread"""
    flask_app.run(host='0.0.0.0', port=8000, debug=False, use_reloader=False)

def main():
    # Initialize database
    init_db()
    
    # Start Flask server in background thread
    if 'flask_started' not in st.session_state:
        flask_thread = threading.Thread(target=run_flask, daemon=True)
        flask_thread.start()
        st.session_state.flask_started = True
        time.sleep(2)  # Give Flask time to start
    
    # Streamlit Admin Interface
    st.set_page_config(
        page_title="AI Prompt Enhancer Admin",
        page_icon="⚙️",
        layout="wide"
    )
    
    st.title("⚙️ AI Prompt Enhancer Admin Panel")
    st.markdown("---")
    
    # API Status
    col1, col2 = st.columns(2)
    with col1:
        st.metric("🌐 API Status", "Running on Port 8000")
    with col2:
        try:
            response = requests.get("http://localhost:8000/api/health", timeout=2)
            if response.status_code == 200:
                st.metric("✅ API Health", "Healthy")
            else:
                st.metric("❌ API Health", "Unhealthy")
        except:
            st.metric("❌ API Health", "Not Responding")
    
    # Password protection
    if 'authenticated' not in st.session_state:
        st.session_state.authenticated = False
    
    if not st.session_state.authenticated:
        password = st.text_input("Enter admin password:", type="password")
        if st.button("Login"):
            if password == "admin123":  # Change this password!
                st.session_state.authenticated = True
                st.rerun()
            else:
                st.error("Invalid password")
        return
    
    # Admin tabs
    tab1, tab2, tab3, tab4 = st.tabs(["📋 Waiting List", "👥 Users", "📊 Usage Stats", "⚙️ Admin Tools"])
    
    with tab1:
        st.header("Waiting List Management")
        
        conn = sqlite3.connect('users.db')
        c = conn.cursor()
        c.execute("SELECT * FROM waiting_list ORDER BY applied_date DESC")
        waiting_list = c.fetchall()
        conn.close()
        
        if waiting_list:
            for user in waiting_list:
                with st.expander(f"{user[1]} ({user[2]}) - {user[4]}"):
                    st.write(f"**Name:** {user[1]}")
                    st.write(f"**Email:** {user[2]}")
                    st.write(f"**Reason:** {user[3] or 'Not provided'}")
                    st.write(f"**Applied:** {user[5]}")
                    st.write(f"**Status:** {user[4]}")
                    
                    if user[4] == 'pending':
                        if st.button(f"Approve {user[1]}", key=f"approve_{user[0]}"):
                            # Generate redemption code and move to users table
                            code = generate_code()
                            conn = sqlite3.connect('users.db')
                            c = conn.cursor()
                            
                            # Add to users table
                            c.execute("""INSERT INTO users (name, email, redemption_code) 
                                         VALUES (?, ?, ?)""", (user[1], user[2], code))
                            
                            # Update waiting list status
                            c.execute("""UPDATE waiting_list 
                                         SET status = 'approved', approved_date = CURRENT_TIMESTAMP
                                         WHERE id = ?""", (user[0],))
                            
                            conn.commit()
                            conn.close()
                            st.success(f"Approved! Redemption code: {code}")
                            st.rerun()
        else:
            st.info("No pending applications")
    
    with tab2:
        st.header("Active Users")
        
        conn = sqlite3.connect('users.db')
        c = conn.cursor()
        c.execute("SELECT * FROM users ORDER BY created_date DESC")
        users = c.fetchall()
        conn.close()
        
        if users:
            for user in users:
                with st.expander(f"{user[1]} ({user[2]}) - {user[4]} credits"):
                    col1, col2 = st.columns(2)
                    with col1:
                        st.write(f"**Name:** {user[1]}")
                        st.write(f"**Email:** {user[2]}")
                        st.write(f"**Code:** {user[3]}")
                        st.write(f"**Status:** {user[6]}")
                    with col2:
                        st.metric("Credits", user[4])
                        st.metric("Used", user[5])
                        st.write(f"**Created:** {user[7]}")
                        st.write(f"**Last Used:** {user[8] or 'Never'}")
        else:
            st.info("No active users")
    
    with tab3:
        st.header("Usage Statistics")
        
        conn = sqlite3.connect('users.db')
        c = conn.cursor()
        
        # Total stats
        c.execute("SELECT COUNT(*) FROM users")
        total_users = c.fetchone()[0]
        
        c.execute("SELECT SUM(used_credits) FROM users")
        total_usage = c.fetchone()[0] or 0
        
        c.execute("SELECT SUM(credits) FROM users")
        remaining_credits = c.fetchone()[0] or 0
        
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("👥 Total Users", total_users)
        with col2:
            st.metric("🎯 Credits Used", total_usage)
        with col3:
            st.metric("💳 Credits Remaining", remaining_credits)
        
        # Recent activity
        st.subheader("Recent Activity")
        c.execute("SELECT * FROM usage_logs ORDER BY timestamp DESC LIMIT 10")
        logs = c.fetchall()
        
        if logs:
            for log in logs:
                st.write(f"**{log[1]}** - {log[2]} ({log[3]} credits) - {log[5]}")
        else:
            st.info("No usage logs yet")
        
        conn.close()
    
    with tab4:
        st.header("Admin Tools")
        
        # Add user manually
        st.subheader("Add User Manually")
        with st.form("add_user"):
            name = st.text_input("Name")
            email = st.text_input("Email")
            credits = st.number_input("Credits", value=100, min_value=0)
            
            if st.form_submit_button("Add User"):
                if name and email:
                    code = generate_code()
                    conn = sqlite3.connect('users.db')
                    c = conn.cursor()
                    try:
                        c.execute("""INSERT INTO users (name, email, redemption_code, credits) 
                                     VALUES (?, ?, ?, ?)""", (name, email.lower(), code, credits))
                        conn.commit()
                        st.success(f"User added! Redemption code: {code}")
                    except sqlite3.IntegrityError:
                        st.error("Email already exists")
                    conn.close()
        
        # Database reset
        st.subheader("⚠️ Danger Zone")
        if st.button("Reset Database", type="secondary"):
            if st.checkbox("I understand this will delete all data"):
                conn = sqlite3.connect('users.db')
                c = conn.cursor()
                c.execute("DROP TABLE IF EXISTS waiting_list")
                c.execute("DROP TABLE IF EXISTS users")
                c.execute("DROP TABLE IF EXISTS usage_logs")
                conn.commit()
                conn.close()
                init_db()
                st.success("Database reset complete")
                st.rerun()

if __name__ == "__main__":
    main()
