#!/usr/bin/env python3
"""
Quick deployment test for the fixed AI Prompt Enhancer API

This script tests the key functionality to ensure the database path fix
and Streamlit Cloud compatibility are working correctly.
"""

import requests
import json
import sys

def test_api(base_url):
    """Test the API endpoints"""
    print(f"🧪 Testing API at: {base_url}")
    
    # Test 1: Health check
    print("\n1️⃣ Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        if response.status_code == 200:
            print("✅ Health check passed")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False
    
    # Test 2: Registration
    print("\n2️⃣ Testing registration endpoint...")
    test_data = {
        "name": "Test User",
        "email": f"test+{int(time.time())}@example.com",
        "reason": "Testing deployment"
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/register",
            json=test_data,
            timeout=10
        )
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                print("✅ Registration test passed")
            else:
                print(f"❌ Registration failed: {result.get('message')}")
                return False
        else:
            print(f"❌ Registration failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Registration test failed: {e}")
        return False
    
    # Test 3: Database functionality (check credits with invalid code)
    print("\n3️⃣ Testing database functionality...")
    try:
        response = requests.post(
            f"{base_url}/api/check_credits",
            json={"email": "test@example.com", "redemption_code": "INVALID"},
            timeout=10
        )
        if response.status_code == 200:
            result = response.json()
            if not result.get("success") and "not found" in result.get("message", "").lower():
                print("✅ Database query test passed")
            else:
                print(f"❌ Unexpected database response: {result}")
                return False
        else:
            print(f"❌ Database test failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False
    
    print("\n🎉 All tests passed! API is working correctly.")
    return True

if __name__ == "__main__":
    import time
    
    # Test with provided URL or default
    if len(sys.argv) > 1:
        api_url = sys.argv[1].rstrip('/')
    else:
        api_url = "http://localhost:8501"  # Default Streamlit local URL
    
    print("🚀 AI Prompt Enhancer API Deployment Test")
    print(f"📍 Target URL: {api_url}")
    
    success = test_api(api_url)
    
    if success:
        print("\n✅ Deployment test completed successfully!")
        print("The API is ready for production use.")
        sys.exit(0)
    else:
        print("\n❌ Deployment test failed!")
        print("Please check the logs and fix any issues before proceeding.")
        sys.exit(1)
