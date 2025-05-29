#!/usr/bin/env python3
"""
Test script to verify the AI Prompt Enhancer deployment is working
"""

import requests
import json
import sys

BASE_URL = "https://ai-prompt-enhancer.streamlit.app"

def test_endpoint(endpoint, params=None):
    """Test a specific API endpoint"""
    url = f"{BASE_URL}/?endpoint={endpoint}"
    if params:
        for key, value in params.items():
            url += f"&{key}={value}"
    
    print(f"Testing: {url}")
    try:
        response = requests.get(url, timeout=10)
        print(f"Status: {response.status_code}")
        
        # Try to parse as JSON
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            return data
        except:
            # If not JSON, show first 200 chars
            text = response.text[:200]
            print(f"Response (text): {text}...")
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    print("🚀 Testing AI Prompt Enhancer Deployment")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1. Testing health endpoint...")
    health = test_endpoint("health")
    
    # Test 2: Register user
    print("\n2. Testing user registration...")
    register = test_endpoint("register", {
        "name": "Test User",
        "email": "test@example.com",
        "reason": "API Testing"
    })
    
    # Test 3: Check main page
    print("\n3. Testing main page...")
    try:
        response = requests.get(BASE_URL, timeout=10)
        print(f"Main page status: {response.status_code}")
        if "AI Prompt Enhancer" in response.text:
            print("✅ Main page loads correctly")
        else:
            print("❌ Main page content not found")
    except Exception as e:
        print(f"❌ Main page error: {e}")
    
    print("\n" + "=" * 50)
    print("Test completed!")

if __name__ == "__main__":
    main()
