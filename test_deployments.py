#!/usr/bin/env python3
"""
Simple test to verify deployment is working
"""

import requests
import time
import json

def test_streamlit_deployment():
    """Test the Streamlit deployment"""
    print("🚀 Testing Streamlit Cloud Deployment")
    print("=" * 50)
    
    base_url = "https://ai-prompt-enhancer.streamlit.app"
    
    # Test 1: Basic connectivity
    print("1. Testing basic connectivity...")
    try:
        response = requests.get(base_url, timeout=15, allow_redirects=True)
        print(f"   Status Code: {response.status_code}")
        print(f"   Final URL: {response.url}")
        
        if response.status_code == 200:
            print("   ✅ App is accessible")
            if "AI Prompt Enhancer" in response.text:
                print("   ✅ App content loads correctly")
            else:
                print("   ⚠️  App accessible but content unclear")
        else:
            print(f"   ❌ App returned status {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Connection failed: {e}")
        return False
    
    # Test 2: Health endpoint
    print("\n2. Testing health endpoint...")
    try:
        health_url = f"{base_url}/?endpoint=health"
        response = requests.get(health_url, timeout=15)
        print(f"   Health endpoint status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"   Health response: {data}")
                return True
            except:
                print("   ⚠️  Health endpoint accessible but not JSON")
        
    except Exception as e:
        print(f"   ❌ Health check failed: {e}")
    
    return False

def test_github_pages():
    """Test GitHub Pages deployment"""
    print("\n🌐 Testing GitHub Pages Deployment")
    print("=" * 50)
    
    pages_url = "https://nampallisrinivas26.github.io/Prompt_extension/"
    
    try:
        response = requests.get(pages_url, timeout=10)
        print(f"Pages Status: {response.status_code}")
        
        if response.status_code == 200:
            if "AI Prompt Enhancer" in response.text:
                print("✅ GitHub Pages deployed successfully")
                return True
            else:
                print("⚠️  GitHub Pages accessible but content unclear")
        else:
            print(f"❌ GitHub Pages returned status {response.status_code}")
            
    except Exception as e:
        print(f"❌ GitHub Pages test failed: {e}")
    
    return False

def main():
    print("🧪 AI Prompt Enhancer - Deployment Test")
    print(f"⏰ Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    streamlit_ok = test_streamlit_deployment()
    pages_ok = test_github_pages()
    
    print("\n" + "=" * 50)
    print("📊 Final Results:")
    print(f"   Streamlit Cloud: {'✅ WORKING' if streamlit_ok else '❌ ISSUES'}")
    print(f"   GitHub Pages:    {'✅ WORKING' if pages_ok else '❌ ISSUES'}")
    
    if streamlit_ok and pages_ok:
        print("\n🎉 Both deployments are working!")
        print("🔗 Streamlit App: https://ai-prompt-enhancer.streamlit.app")
        print("🔗 GitHub Pages:  https://nampallisrinivas26.github.io/Prompt_extension/")
    else:
        print("\n⚠️  Some deployments have issues. Check the logs above.")
    
    return streamlit_ok and pages_ok

if __name__ == "__main__":
    main()
