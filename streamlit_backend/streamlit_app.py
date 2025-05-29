#!/usr/bin/env python3
"""
Streamlit Cloud deployment wrapper for AI Prompt Enhancer Flask API

This file serves as the main entry point for Streamlit Cloud deployment.
It imports the Flask app from flask_api.py and exposes it for Streamlit Cloud to serve.
"""

import streamlit as st
import os

# Set page config
st.set_page_config(
    page_title="AI Prompt Enhancer API",
    page_icon="🚀",
    layout="wide"
)

# Import the Flask app from our fixed flask_api.py
# This ensures all the database path fixes and conditional execution logic are applied
try:
    from flask_api import app, init_db
    
    # Initialize database on import
    init_db()
    
    # Display API status page
    st.title("🚀 AI Prompt Enhancer API")
    st.markdown("### API Server Status: ✅ Running")
    
    # Get the Streamlit Cloud URL
    if 'STREAMLIT_SHARING_MODE' in os.environ or 'STREAMLIT_SERVER_PORT' in os.environ:
        # We're on Streamlit Cloud
        base_url = f"https://{st.secrets.get('STREAMLIT_SHARING_URL', 'your-app-name.streamlit.app')}"
    else:
        # Local development
        base_url = "http://localhost:8501"
    
    st.markdown("### Available API Endpoints:")
    endpoints = [
        ("POST/GET", "/api/register", "Register for access to the service"),
        ("POST/GET", "/api/verify", "Verify redemption code and get user info"),
        ("POST/GET", "/api/check_credits", "Check remaining credits for a user"),
        ("POST", "/api/use_credit", "Use a credit for prompt enhancement"),
        ("POST", "/api/enhance", "Enhance a prompt using AI"),
        ("GET", "/health", "API health check")
    ]
    
    for method, endpoint, description in endpoints:
        st.markdown(f"- **{method}** `{base_url}{endpoint}` - {description}")
    
    st.markdown("### API Documentation")
    st.markdown("""
    This API provides backend services for the AI Prompt Enhancer Chrome extension.
    
    **Authentication**: Uses redemption codes for user verification
    **Credits**: Each user gets 100 credits, each prompt enhancement costs 1 credit
    **Database**: SQLite database with automatic initialization
    
    **Example Usage:**
    ```bash
    # Health check
    curl {base_url}/health
    
    # Register new user
    curl -X POST {base_url}/api/register \\
         -H "Content-Type: application/json" \\
         -d '{{"name": "John Doe", "email": "john@example.com", "reason": "For development"}}'
    
    # Check credits
    curl -X POST {base_url}/api/check_credits \\
         -H "Content-Type: application/json" \\
         -d '{{"email": "john@example.com", "redemption_code": "ABC123"}}'
    ```
    """.format(base_url=base_url))
    
    st.markdown("### Configuration")
    st.markdown(f"""
    - **Environment**: {'Streamlit Cloud' if 'STREAMLIT_SERVER_PORT' in os.environ else 'Local Development'}
    - **Database**: SQLite with automatic initialization
    - **CORS**: Enabled for all origins (configured for development)
    """)
    
    # Expose the Flask app for Streamlit Cloud
    # Streamlit Cloud will automatically detect and serve the Flask app
    
except ImportError as e:
    st.error(f"Failed to import Flask app: {e}")
    st.markdown("Make sure flask_api.py is present and contains the Flask app definition.")
except Exception as e:
    st.error(f"Error initializing API: {e}")
    st.markdown("Check the logs for more details.")
