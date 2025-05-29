#!/usr/bin/env python3
"""
Main entry point for Streamlit Cloud deployment
This file ensures Streamlit Cloud runs the correct application
"""

import sys
import os

# Add the streamlit_backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'streamlit_backend'))

# Import and run the Streamlit app
if __name__ == "__main__":
    # This ensures the streamlit_app.py is executed
    import subprocess
    import sys
    
    # Run the streamlit app from the streamlit_backend directory
    app_path = os.path.join(os.path.dirname(__file__), 'streamlit_backend', 'streamlit_app.py')
    subprocess.run([sys.executable, '-m', 'streamlit', 'run', app_path] + sys.argv[1:])
