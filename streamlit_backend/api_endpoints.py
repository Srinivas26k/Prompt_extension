# API endpoints for AI Prompt Enhancer
# This can be deployed separately or integrated with the Streamlit app

import sqlite3
import secrets
import string
from datetime import datetime
import json
import requests
import os

# Backend URL configuration
BACKEND_URL = os.environ.get('BACKEND_URL', 'http://localhost:8501')

def init_db():
    conn = sqlite3.connect('users.db')
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

# User registration
def register_user(name, email, reason):
    try:
        conn = sqlite3.connect('users.db')
        c = conn.cursor()
        
        # Check if email already exists in waiting list or users
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

# Code verification
def verify_code(email, code):
    try:
        conn = sqlite3.connect('users.db')
        c = conn.cursor()
        
        # Check if user exists with this email and code
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

# Check user credits
def check_credits(redemption_code):
    try:
        conn = sqlite3.connect('users.db')
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

# Use credit for prompt enhancement
def use_credit(redemption_code):
    try:
        conn = sqlite3.connect('users.db')
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
                  (email, redemption_code, 0, 0))  # Will be updated with actual lengths
        
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
def generate_enhanced_prompt(original_prompt, settings):
    """
    Generate enhanced prompt using Ben's methodology
    """
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

# Simple API server simulation (for testing)
def handle_api_request(endpoint, data):
    """
    Simulate API request handling
    """
    if endpoint == '/register':
        return register_user(data.get('name'), data.get('email'), data.get('reason'))
    elif endpoint == '/verify':
        return verify_code(data.get('email'), data.get('code'))
    elif endpoint == '/check-credits':
        return check_credits(data.get('redemption_code'))
    elif endpoint == '/use-credit':
        return use_credit(data.get('redemption_code'))
    elif endpoint == '/enhance-prompt':
        result = use_credit(data.get('redemption_code'))
        if result['success']:
            enhanced = generate_enhanced_prompt(data.get('prompt'), data.get('settings', {}))
            return {
                "success": True,
                "enhanced_prompt": enhanced,
                "remaining_credits": result['remaining_credits']
            }
        return result
    else:
        return {"success": False, "message": "Unknown endpoint"}

if __name__ == "__main__":
    init_db()
    print("API functions initialized")
