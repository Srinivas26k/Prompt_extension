import streamlit as st
import sqlite3
import secrets
import string
import hashlib
from datetime import datetime, timedelta
import requests
import json
import os

# Initialize database
def init_db():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    
    # Users table
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL,
                  email TEXT UNIQUE NOT NULL,
                  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  status TEXT DEFAULT 'waiting')''')
    
    # Codes table
    c.execute('''CREATE TABLE IF NOT EXISTS codes
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  code TEXT UNIQUE NOT NULL,
                  user_email TEXT,
                  credits INTEGER DEFAULT 100,
                  used_credits INTEGER DEFAULT 0,
                  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  redeemed_date TIMESTAMP,
                  is_active BOOLEAN DEFAULT 1,
                  FOREIGN KEY (user_email) REFERENCES users (email))''')
    
    # Usage logs
    c.execute('''CREATE TABLE IF NOT EXISTS usage_logs
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  code TEXT,
                  prompt_length INTEGER,
                  response_length INTEGER,
                  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (code) REFERENCES codes (code))''')
    
    conn.commit()
    conn.close()

# Generate unique code
def generate_code():
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))

# OpenRouter API call
def enhance_prompt_api(prompt, user_settings):
    OPENROUTER_API_KEY = st.secrets.get("OPENROUTER_API_KEY", "")
    
    if not OPENROUTER_API_KEY:
        return {"error": "API key not configured"}
    
    # Enhanced prompt template using Ben's methodology
    enhanced_template = f"""# ROLE
You are an expert AI prompt engineer and strategic consultant with deep expertise in prompt optimization, specifically trained in Ben's advanced prompting methodology for reasoning models.

# GOAL
Transform the provided basic prompt into a comprehensive, detailed brief that maximizes AI reasoning capabilities and produces superior results. The enhanced prompt should be a complete briefing document that provides all necessary context upfront, clearly defines goals without prescribing methods, and leverages the target AI model's strengths.

# CONTEXT DUMP
## Current User Settings:
- Target Role: {user_settings.get('role', 'AI Assistant')}
- Description Level: {user_settings.get('description', 'detailed')}
- Output Length: {user_settings.get('length', 'medium')}
- Format Style: {user_settings.get('format', 'structured')}
- Response Tone: {user_settings.get('tone', 'helpful')}

## Platform Context:
- User is working in a web-based AI chat interface
- The enhanced prompt will be used immediately after generation
- Target audience: The specific AI model receiving this prompt
- Environment: Professional AI interaction context

## Original User Input:
{prompt}

# TASK REQUIREMENTS

## 1. BRIEFING STRUCTURE (Write Briefs, Not Prompts)
Create a comprehensive briefing document that includes:
- Complete context and background information
- All relevant constraints and parameters
- Success criteria and expected deliverables
- Any domain-specific knowledge required

## 2. GOAL-FOCUSED APPROACH
- Define clear, measurable objectives
- Specify desired outcomes without prescribing methods
- Allow the AI to autonomously reason through solutions
- Focus on "what" rather than "how"

## 3. LEVERAGE AI STRENGTHS
Optimize for reasoning model capabilities:
- Complex problem-solving and analysis
- Code generation and technical tasks
- Detailed explanations and breakdowns
- Logical reasoning and step-by-step thinking

# RETURN FORMAT
Provide a complete, self-contained enhanced prompt that:
- Requires no additional context or clarification
- Is immediately usable in any AI chat interface
- Follows professional briefing document structure
- Includes clear sections with headers and formatting

# WARNINGS & CONSTRAINTS
- DO NOT include meta-commentary or explanations about the enhancement
- DO NOT reference this enhancement process in the output
- ENSURE the enhanced prompt is completely standalone
- OPTIMIZE for reasoning and analytical capabilities
- AVOID overly prescriptive instructions that limit AI autonomy
- MAINTAIN the user's original intent while expanding scope and detail

# OUTPUT SPECIFICATIONS
Return only the enhanced prompt with proper markdown formatting, clear section headers, and comprehensive detail that transforms the basic request into a professional AI briefing document."""

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "X-Title": "AI Prompt Enhancer Pro"
            },
            json={
                "model": "microsoft/phi-4-reasoning-plus:free",
                "messages": [{"role": "user", "content": enhanced_template}],
                "temperature": 0.7,
                "max_tokens": 2000
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            return {"enhanced_prompt": data["choices"][0]["message"]["content"]}
        else:
            return {"error": f"API Error: {response.status_code}"}
            
    except Exception as e:
        return {"error": str(e)}

# Streamlit App
def main():
    st.set_page_config(
        page_title="AI Prompt Enhancer Pro - Dashboard",
        page_icon="✨",
        layout="wide"
    )
    
    init_db()
    
    st.title("✨ AI Prompt Enhancer Pro - Admin Dashboard")
    
    # Sidebar for navigation
    st.sidebar.title("Navigation")
    page = st.sidebar.radio("Select Page", ["User Registration", "Generate Codes", "Analytics", "API Test"])
    
    if page == "User Registration":
        st.header("📝 User Registration & Waiting List")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Register New User")
            name = st.text_input("Full Name")
            email = st.text_input("Email Address")
            
            if st.button("Add to Waiting List"):
                if name and email:
                    conn = sqlite3.connect('users.db')
                    c = conn.cursor()
                    try:
                        c.execute("INSERT INTO users (name, email) VALUES (?, ?)", (name, email))
                        conn.commit()
                        st.success(f"✅ {name} added to waiting list!")
                        
                        # Generate code automatically
                        code = generate_code()
                        c.execute("INSERT INTO codes (code, user_email) VALUES (?, ?)", (code, email))
                        conn.commit()
                        
                        st.info(f"🎟️ Generated Code: **{code}**")
                        st.info("📧 Send this code to the user via email")
                        
                    except sqlite3.IntegrityError:
                        st.error("❌ Email already registered!")
                    finally:
                        conn.close()
        
        with col2:
            st.subheader("Current Users")
            conn = sqlite3.connect('users.db')
            users_df = st.experimental_data_editor(
                conn.execute("SELECT name, email, registration_date, status FROM users ORDER BY registration_date DESC").fetchall(),
                column_config={
                    0: "Name",
                    1: "Email", 
                    2: "Registration Date",
                    3: "Status"
                }
            )
            conn.close()
    
    elif page == "Generate Codes":
        st.header("🎟️ Code Management")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Generate New Code")
            email = st.selectbox("Select User", 
                                get_user_emails())
            credits = st.number_input("Credits", min_value=10, max_value=1000, value=100)
            
            if st.button("Generate Code"):
                if email:
                    code = generate_code()
                    conn = sqlite3.connect('users.db')
                    c = conn.cursor()
                    c.execute("INSERT INTO codes (code, user_email, credits) VALUES (?, ?, ?)", 
                             (code, email, credits))
                    conn.commit()
                    conn.close()
                    
                    st.success(f"✅ Code generated: **{code}**")
                    st.info(f"📧 Send to {email}")
        
        with col2:
            st.subheader("Active Codes")
            conn = sqlite3.connect('users.db')
            codes_df = conn.execute("""
                SELECT c.code, c.user_email, c.credits, c.used_credits, c.is_active
                FROM codes c 
                ORDER BY c.created_date DESC
            """).fetchall()
            
            if codes_df:
                st.dataframe(codes_df, column_config={
                    0: "Code",
                    1: "Email",
                    2: "Total Credits", 
                    3: "Used Credits",
                    4: "Active"
                })
            conn.close()
    
    elif page == "Analytics":
        st.header("📊 Usage Analytics")
        
        conn = sqlite3.connect('users.db')
        
        # Stats
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            total_users = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
            st.metric("Total Users", total_users)
        
        with col2:
            active_codes = conn.execute("SELECT COUNT(*) FROM codes WHERE is_active = 1").fetchone()[0]
            st.metric("Active Codes", active_codes)
        
        with col3:
            total_usage = conn.execute("SELECT COUNT(*) FROM usage_logs").fetchone()[0]
            st.metric("Total Enhancements", total_usage)
        
        with col4:
            total_credits_used = conn.execute("SELECT SUM(used_credits) FROM codes").fetchone()[0] or 0
            st.metric("Credits Used", total_credits_used)
        
        # Recent activity
        st.subheader("Recent Activity")
        recent_usage = conn.execute("""
            SELECT ul.code, ul.prompt_length, ul.response_length, ul.timestamp
            FROM usage_logs ul
            ORDER BY ul.timestamp DESC
            LIMIT 10
        """).fetchall()
        
        if recent_usage:
            st.dataframe(recent_usage, column_config={
                0: "Code",
                1: "Prompt Length",
                2: "Response Length", 
                3: "Timestamp"
            })
        
        conn.close()
    
    elif page == "API Test":
        st.header("🧪 API Test")
        
        test_prompt = st.text_area("Test Prompt", "Write a Python function to calculate fibonacci numbers")
        
        if st.button("Test Enhancement"):
            with st.spinner("Enhancing prompt..."):
                result = enhance_prompt_api(test_prompt, {
                    'role': 'Software Engineer',
                    'description': 'detailed',
                    'length': 'medium',
                    'format': 'structured',
                    'tone': 'helpful'
                })
                
                if "enhanced_prompt" in result:
                    st.success("✅ Enhancement successful!")
                    st.text_area("Enhanced Prompt", result["enhanced_prompt"], height=400)
                else:
                    st.error(f"❌ Error: {result.get('error', 'Unknown error')}")

def get_user_emails():
    conn = sqlite3.connect('users.db')
    emails = [row[0] for row in conn.execute("SELECT email FROM users").fetchall()]
    conn.close()
    return emails

# API Endpoints for Firefox Extension
@st.cache_data
def validate_code(code):
    conn = sqlite3.connect('users.db')
    result = conn.execute("SELECT credits, used_credits, is_active FROM codes WHERE code = ?", (code,)).fetchone()
    conn.close()
    
    if result and result[2]:  # is_active
        remaining_credits = result[0] - result[1]
        return {"valid": True, "credits": remaining_credits}
    return {"valid": False}

if __name__ == "__main__":
    main()
