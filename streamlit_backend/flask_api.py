#!/usr/bin/env python3
"""
Standalone Flask API server for AI Prompt Enhancer
This handles all API endpoints that the extension and web pages need
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import secrets
import string
from datetime import datetime
import json
import os

app = Flask(__name__)
app.secret_key = "your-secret-key-change-this"
CORS(app, origins=['*'])  # Allow all origins for development

# Database helper function
def get_db_connection():
    """Get database connection with correct path"""
    db_path = os.path.join(os.path.dirname(__file__), 'users.db')
    return sqlite3.connect(db_path)

# Database initialization
def init_db():
    # Use absolute path for database
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
    """Generate a secure 6-character redemption code"""
    characters = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(characters) for _ in range(6))
    db_path = os.path.join(os.path.dirname(__file__), 'users.db')
    return sqlite3.connect(db_path)

# Database initialization
def init_db():
    # Use absolute path for database
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
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))

# API Routes
@app.route('/api/register', methods=['GET', 'POST'])
def register():
    try:
        if request.method == 'GET':
            name = request.args.get('name')
            email = request.args.get('email')
            reason = request.args.get('reason', '')
        else:
            data = request.get_json()
            name = data.get('name')
            email = data.get('email')
            reason = data.get('reason', '')
        
        if not name or not email:
            return jsonify({"success": False, "message": "Name and email are required"})
        
        conn = get_db_connection()
        c = conn.cursor()
        
        # Check if email already exists
        c.execute("SELECT email FROM waiting_list WHERE email = ?", (email,))
        if c.fetchone():
            return jsonify({"success": False, "message": "Email already registered"})
        
        # Add to waiting list
        c.execute("INSERT INTO waiting_list (name, email, reason) VALUES (?, ?, ?)", 
                 (name, email, reason))
        conn.commit()
        conn.close()
        
        return jsonify({"success": True, "message": "Successfully added to waiting list"})
    
    except Exception as e:
        return jsonify({"success": False, "message": f"Registration failed: {str(e)}"})

@app.route('/api/verify', methods=['GET', 'POST'])
def verify():
    try:
        if request.method == 'GET':
            email = request.args.get('email')
            code = request.args.get('code')
        else:
            data = request.get_json()
            email = data.get('email')
            code = data.get('code')
        
        if not email or not code:
            return jsonify({"success": False, "message": "Email and code are required"})
        
        conn = get_db_connection()
        c = conn.cursor()
        
        c.execute("""SELECT name, credits, used_credits, status FROM users 
                     WHERE email = ? AND redemption_code = ?""", (email, code))
        user = c.fetchone()
        
        if not user:
            return jsonify({"success": False, "message": "Invalid code or email"})
        
        name, credits, used_credits, status = user
        
        if status != 'active':
            return jsonify({"success": False, "message": "Account is not active"})
        
        remaining_credits = credits - used_credits
        
        return jsonify({
            "success": True,
            "name": name,
            "credits": remaining_credits,
            "message": "Verification successful"
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Verification failed: {str(e)}"})

@app.route('/api/check_credits', methods=['GET', 'POST'])
def check_credits():
    try:
        if request.method == 'GET':
            code = request.args.get('redemption_code')
        else:
            data = request.get_json()
            code = data.get('redemption_code')
        
        if not code:
            return jsonify({"success": False, "message": "Redemption code required"})
        
        conn = get_db_connection()
        c = conn.cursor()
        
        c.execute("SELECT credits, used_credits FROM users WHERE redemption_code = ?", (code,))
        user = c.fetchone()
        
        if not user:
            return jsonify({"success": False, "message": "Invalid redemption code"})
        
        credits, used_credits = user
        remaining = credits - used_credits
        
        return jsonify({
            "success": True,
            "remaining_credits": remaining,
            "total_credits": credits,
            "used_credits": used_credits
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Credit check failed: {str(e)}"})

@app.route('/api/use_credit', methods=['POST'])
def use_credit():
    try:
        data = request.get_json()
        code = data.get('redemption_code')
        prompt_length = data.get('prompt_length', 0)
        
        if not code:
            return jsonify({"success": False, "message": "Redemption code required"})
        
        conn = get_db_connection()
        c = conn.cursor()
        
        # Check current credits
        c.execute("SELECT email, credits, used_credits FROM users WHERE redemption_code = ?", (code,))
        user = c.fetchone()
        
        if not user:
            return jsonify({"success": False, "message": "Invalid redemption code"})
        
        email, credits, used_credits = user
        remaining = credits - used_credits
        
        if remaining <= 0:
            return jsonify({"success": False, "message": "No credits remaining"})
        
        # Use one credit
        new_used_credits = used_credits + 1
        c.execute("UPDATE users SET used_credits = ?, last_used = CURRENT_TIMESTAMP WHERE redemption_code = ?", 
                 (new_used_credits, code))
        
        # Log usage
        c.execute("INSERT INTO usage_logs (user_email, redemption_code, prompt_length, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)", 
                 (email, code, prompt_length))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "remaining_credits": remaining - 1,
            "message": "Credit used successfully"
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Credit usage failed: {str(e)}"})

@app.route('/api/enhance', methods=['POST'])
def enhance_prompt():
    try:
        data = request.get_json()
        prompt = data.get('prompt')
        settings = data.get('settings', {})
        code = data.get('redemption_code')
        
        if not prompt or not code:
            return jsonify({"success": False, "message": "Prompt and redemption code required"})
        
        # Check and use credit
        credit_check = use_credit()
        if not credit_check.get_json().get('success'):
            return credit_check
        
        # Generate enhanced prompt using Ben's methodology
        enhanced = generate_enhanced_prompt(prompt, settings)
        
        return jsonify({
            "success": True,
            "enhanced_prompt": enhanced,
            "remaining_credits": credit_check.get_json().get('remaining_credits')
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Enhancement failed: {str(e)}"})

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

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "API server is running"})

if __name__ == '__main__':
    # Initialize database
    init_db()
    
    print("\nFlask API Server for AI Prompt Enhancer")
    print("Available endpoints:")
    print("- POST /api/register")
    print("- POST /api/verify")
    print("- POST /api/check_credits")
    print("- POST /api/use_credit")
    print("- POST /api/enhance")
    print("- GET /health")
    
    print("Starting Flask server locally...")
    app.run(host='0.0.0.0', port=5000, debug=True)
