import streamlit as st
import sqlite3
import requests
import json

# API endpoint for Firefox extension
def api_validate_code(code):
    """Validate redemption code and return credit status"""
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
            "email": result[3]
        }
    return {"valid": False}

def api_enhance_prompt(code, prompt, settings):
    """Enhance prompt and deduct credits"""
    # First validate code
    validation = api_validate_code(code)
    if not validation["valid"] or validation["credits"] <= 0:
        return {"error": "Invalid code or insufficient credits"}
    
    # Call OpenRouter API
    OPENROUTER_API_KEY = st.secrets.get("OPENROUTER_API_KEY", "")
    
    if not OPENROUTER_API_KEY:
        return {"error": "Service temporarily unavailable"}
    
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
                "credits_remaining": validation["credits"] - 1
            }
        else:
            return {"error": f"API Error: {response.status_code}"}
            
    except Exception as e:
        return {"error": str(e)}

# Streamlit page for API endpoints
def api_page():
    st.title("🔌 API Endpoints")
    
    st.markdown("""
    ### Available Endpoints:
    
    **POST /validate-code**
    ```json
    {
        "code": "ABC12345"
    }
    ```
    
    **POST /enhance-prompt** 
    ```json
    {
        "code": "ABC12345",
        "prompt": "Your prompt here",
        "settings": {
            "role": "Software Engineer",
            "description": "detailed",
            "length": "medium", 
            "format": "structured",
            "tone": "helpful"
        }
    }
    ```
    """)
    
    # Test endpoints
    st.subheader("Test Validate Code")
    test_code = st.text_input("Test Code")
    if st.button("Validate"):
        result = api_validate_code(test_code)
        st.json(result)
    
    st.subheader("Test Enhance Prompt")
    test_prompt = st.text_area("Test Prompt")
    if st.button("Enhance"):
        if test_code and test_prompt:
            result = api_enhance_prompt(test_code, test_prompt, {
                "role": "AI Assistant",
                "description": "detailed",
                "length": "medium",
                "format": "structured", 
                "tone": "helpful"
            })
            st.json(result)

if __name__ == "__main__":
    api_page()
