import streamlit as st
import sqlite3
import requests
import json
from datetime import datetime

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

# API endpoint for code validation
def validate_code_endpoint():
    st.title("🔐 Code Validation API")
    
    if st.button("Initialize Database"):
        init_db()
        st.success("Database initialized!")
    
    # Handle API calls
    query_params = st.query_params
    
    if "action" in query_params:
        action = query_params["action"]
        
        if action == "validate":
            code = query_params.get("code", "")
            if code:
                result = validate_code(code)
                st.json(result)
            else:
                st.error("No code provided")
                
        elif action == "enhance":
            code = st.text_input("Redemption Code")
            prompt = st.text_area("Prompt to Enhance")
            
            if st.button("Enhance Prompt") and code and prompt:
                settings = {
                    "role": "AI Assistant",
                    "description": "detailed", 
                    "length": "medium",
                    "format": "structured",
                    "tone": "helpful"
                }
                result = enhance_prompt_endpoint(code, prompt, settings)
                st.json(result)
    
    else:
        st.markdown("""
        ## API Endpoints
        
        ### Validate Code
        `?action=validate&code=YOUR_CODE`
        
        ### Enhance Prompt
        `?action=enhance` (use the form below)
        """)

def validate_code(code):
    """Validate redemption code and return credit status"""
    try:
        conn = sqlite3.connect('users.db')
        result = conn.execute(
            "SELECT credits, used_credits, is_active, user_email FROM codes WHERE code = ?", 
            (code,)
        ).fetchone()
        conn.close()
        
        if result and result[2]:  # is_active
            remaining_credits = result[0] - result[1]
            return {
                "valid": True, 
                "credits": remaining_credits,
                "email": result[3],
                "status": "success"
            }
        return {"valid": False, "status": "invalid_code"}
    except Exception as e:
        return {"valid": False, "status": "error", "message": str(e)}

def enhance_prompt_endpoint(code, prompt, settings):
    """Enhance prompt and deduct credits"""
    # First validate code
    validation = validate_code(code)
    if not validation["valid"] or validation["credits"] <= 0:
        return {"error": "Invalid code or insufficient credits", "status": "failed"}
    
    # Call OpenRouter API
    OPENROUTER_API_KEY = st.secrets.get("OPENROUTER_API_KEY", "")
    
    if not OPENROUTER_API_KEY:
        return {"error": "Service temporarily unavailable", "status": "failed"}
    
    # Enhanced prompt template using Ben's methodology
    enhanced_template = f"""# ROLE
You are an expert AI prompt engineer and strategic consultant with deep expertise in prompt optimization, specifically trained in advanced prompting methodology for reasoning models.

# GOAL
Transform the provided basic prompt into a comprehensive, detailed brief that maximizes AI reasoning capabilities and produces superior results. The enhanced prompt should be a complete briefing document that provides all necessary context upfront, clearly defines goals without prescribing methods, and leverages the target AI model's strengths.

# CONTEXT DUMP
## Current User Settings:
- Target Role: {settings.get('role', 'AI Assistant')}
- Description Level: {settings.get('description', 'detailed')}
- Output Length: {settings.get('length', 'medium')}
- Format Style: {settings.get('format', 'structured')}
- Response Tone: {settings.get('tone', 'helpful')}

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
            enhanced_prompt = data["choices"][0]["message"]["content"]
            
            # Deduct credits
            conn = sqlite3.connect('users.db')
            conn.execute(
                "UPDATE codes SET used_credits = used_credits + 1 WHERE code = ?", 
                (code,)
            )
            
            # Log usage
            conn.execute(
                "INSERT INTO usage_logs (code, prompt_length, response_length) VALUES (?, ?, ?)",
                (code, len(prompt), len(enhanced_prompt))
            )
            conn.commit()
            conn.close()
            
            return {
                "success": True,
                "enhanced_prompt": enhanced_prompt,
                "credits_remaining": validation["credits"] - 1,
                "status": "success"
            }
        else:
            return {"error": f"API Error: {response.status_code}", "status": "failed"}
            
    except Exception as e:
        return {"error": str(e), "status": "failed"}

if __name__ == "__main__":
    validate_code_endpoint()
