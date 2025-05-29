#!/usr/bin/env python3
"""
Quick test script to verify admin dashboard functionality
"""

import requests
import sys

def test_api_endpoints(base_url):
    """Test the basic API endpoints"""
    print(f"Testing API at: {base_url}")
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}?endpoint=health", timeout=10)
        if response.status_code == 200:
            print("✅ Health endpoint working")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")
    
    # Test registration endpoint
    try:
        response = requests.get(
            f"{base_url}?endpoint=register&name=Test User&email=test@example.com&reason=Testing",
            timeout=10
        )
        if response.status_code == 200:
            print("✅ Register endpoint working")
        else:
            print(f"❌ Register endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Register endpoint error: {e}")

def test_admin_access(base_url):
    """Test admin dashboard access"""
    try:
        response = requests.get(f"{base_url}?admin=true", timeout=10)
        if response.status_code == 200 and "Admin Login" in response.text:
            print("✅ Admin dashboard accessible")
        else:
            print(f"❌ Admin dashboard failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Admin dashboard error: {e}")

if __name__ == "__main__":
    # Replace with your actual Streamlit Cloud URL
    streamlit_url = "https://your-app-name.streamlit.app"
    
    if len(sys.argv) > 1:
        streamlit_url = sys.argv[1]
    
    print("🚀 AI Prompt Enhancer - Deployment Test")
    print("=" * 50)
    
    test_api_endpoints(streamlit_url)
    print()
    test_admin_access(streamlit_url)
    
    print("\n📝 Next Steps:")
    print(f"1. Access your app: {streamlit_url}")
    print("2. Click 'Admin Dashboard' button on main page")
    print(f"3. Login with password: srinivas@13579#")
    print("4. Test user approval workflow")
    print("5. Update Chrome extension with API URL")
