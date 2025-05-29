#!/usr/bin/env python3
"""
Root level Streamlit app for Streamlit Cloud deployment
This imports and runs the actual app from the streamlit_backend directory
"""

import sys
import os

# Add the streamlit_backend directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
streamlit_backend_dir = os.path.join(current_dir, 'streamlit_backend')
sys.path.insert(0, streamlit_backend_dir)

# Import everything from the actual streamlit app
try:
    # Import all the functions and run the app
    from streamlit_backend.streamlit_app import *
    
    # The imported file will handle all the Streamlit logic
    print("✅ Successfully imported Streamlit app from streamlit_backend/")
    
except ImportError as e:
    import streamlit as st
    st.error(f"❌ Failed to import streamlit_backend/streamlit_app.py: {e}")
    st.info("Please check that the streamlit_backend directory exists and contains streamlit_app.py")
except Exception as e:
    import streamlit as st
    st.error(f"❌ Error running the application: {e}")
    st.info("Check the logs for more details")
