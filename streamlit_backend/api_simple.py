"""
API Endpoints for AI Prompt Enhancer
Handles requests from registration form, verification page, and Firefox extension
"""

import streamlit as st
from app import register_user, verify_code, use_credit_and_enhance
import json

# Enable CORS for cross-origin requests
def enable_cors():
    st.markdown("""
    <script>
    // Enable CORS for API requests
    if (window.location.pathname.includes('/api/')) {
        const script = document.createElement('script');
        script.innerHTML = `
            // CORS headers for API endpoints
            if (typeof fetch !== 'undefined') {
                const originalFetch = fetch;
                fetch = function(...args) {
                    return originalFetch(...args).then(response => {
                        response.headers.set('Access-Control-Allow-Origin', '*');
                        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
                        return response;
                    });
                };
            }
        `;
        document.head.appendChild(script);
    }
    </script>
    """, unsafe_allow_html=True)

# Registration API endpoint
def api_register():
    """Handle registration from welcome.html form"""
    st.title("📝 Registration API")
    
    # Handle POST request (simulated with form)
    if st.button("Test Registration API"):
        # This would normally be handled by POST request
        test_data = {
            "name": "Test User",
            "email": "test@example.com",
            "reason": "Testing the system"
        }
        
        result = register_user(test_data["name"], test_data["email"], test_data["reason"])
        
        if result["success"]:
            st.success("✅ Registration successful")
            st.json(result)
        else:
            st.error("❌ Registration failed")
            st.json(result)

# Verification API endpoint
def api_verify():
    """Handle code verification from verify.html"""
    st.title("🔍 Verification API")
    
    with st.form("verify_form"):
        email = st.text_input("Email")
        code = st.text_input("Redemption Code")
        
        if st.form_submit_button("Verify Code"):
            if email and code:
                result = verify_code(email, code)
                
                if result["success"]:
                    st.success("✅ Code verified successfully")
                    st.json(result)
                else:
                    st.error("❌ Verification failed")
                    st.json(result)

# Enhancement API endpoint
def api_enhance():
    """Handle prompt enhancement from Firefox extension"""
    st.title("✨ Enhancement API")
    
    with st.form("enhance_form"):
        email = st.text_input("Email")
        code = st.text_input("Redemption Code")
        prompt = st.text_area("Original Prompt", height=100)
        
        # Settings
        col1, col2 = st.columns(2)
        with col1:
            role = st.text_input("Role", value="AI Assistant")
            description = st.selectbox("Description", ["minimal", "detailed", "comprehensive"], index=1)
        with col2:
            length = st.selectbox("Length", ["short", "medium", "long"], index=1)
            tone = st.selectbox("Tone", ["helpful", "professional", "friendly", "concise"])
        
        if st.form_submit_button("Enhance Prompt"):
            if email and code and prompt:
                settings = {
                    "role": role,
                    "description": description,
                    "length": length,
                    "tone": tone
                }
                
                result = use_credit_and_enhance(email, code, prompt, settings)
                
                if result["success"]:
                    st.success("✅ Prompt enhanced successfully")
                    st.write(f"**Credits remaining:** {result['credits_remaining']}")
                    st.text_area("Enhanced Prompt", result["enhanced_prompt"], height=300)
                else:
                    st.error("❌ Enhancement failed")
                    st.write(result["message"])

# API Router
def api_main():
    """Main API routing function"""
    enable_cors()
    
    # Simple API routing based on query parameters
    query_params = st.experimental_get_query_params()
    endpoint = query_params.get("endpoint", [""])[0]
    
    if endpoint == "register":
        api_register()
    elif endpoint == "verify":
        api_verify()
    elif endpoint == "enhance":
        api_enhance()
    else:
        st.title("🔌 AI Prompt Enhancer API")
        st.write("Available endpoints:")
        st.code("""
        POST /api?endpoint=register
        POST /api?endpoint=verify  
        POST /api?endpoint=enhance
        """)
        
        st.subheader("Test the APIs:")
        col1, col2, col3 = st.columns(3)
        
        with col1:
            if st.button("Test Registration"):
                st.experimental_set_query_params(endpoint="register")
                st.experimental_rerun()
        
        with col2:
            if st.button("Test Verification"):
                st.experimental_set_query_params(endpoint="verify")
                st.experimental_rerun()
        
        with col3:
            if st.button("Test Enhancement"):
                st.experimental_set_query_params(endpoint="enhance")
                st.experimental_rerun()

if __name__ == "__main__":
    api_main()
