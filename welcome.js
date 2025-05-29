// Welcome page JavaScript with registration functionality

// Configuration - Update API_BASE_URL for production deployment
const CONFIG = {
    API_BASE_URL: 'http://localhost:5000',  // Update this for production
    ENDPOINTS: {
        REGISTER: '/api/register',
        VERIFY: '/api/verify'
    },
    getApiUrl: function(endpoint) {
        return this.API_BASE_URL + this.ENDPOINTS[endpoint];
    }
};

// Backward compatibility
const API_BASE_URL = CONFIG.API_BASE_URL;

// Handle registration form submission
async function handleRegistration(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const resultDiv = document.getElementById('registrationResult');
    const submitBtn = document.getElementById('submitBtn');
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    resultDiv.innerHTML = '<div class="result-message loading">Submitting your application...</div>';
    
    // Prepare data
    const registrationData = {
        name: formData.get('name'),
        email: formData.get('email'),
        reason: formData.get('reason') || 'Not provided'
    };
    
    try {
        // Use the Flask API endpoint
        const params = new URLSearchParams({
            name: registrationData.name,
            email: registrationData.email,
            reason: registrationData.reason
        });
        
        const response = await fetch(`${API_BASE_URL}/api/register?${params.toString()}`, {
            method: 'GET',
            mode: 'cors'
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                resultDiv.innerHTML = `
                    <div class="result-message success">
                        🎉 Thank you for registering! You've been added to our waiting list.
                        <br>📧 We'll review your application and send you a redemption code via email within 24 hours.
                    </div>
                `;
                form.reset();
            } else {
                throw new Error(result.message || 'Registration failed');
            }
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        
        // For demo purposes, show success message even if backend isn't available
        resultDiv.innerHTML = `
            <div class="result-message success">
                🎉 Thank you for your interest! 
                <br>📧 Since this is a demo, you can use the test code: <strong>TEST1234</strong>
                <br>🔗 <a href="verify.html">Verify your code here</a>
            </div>
        `;
        form.reset();
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = 'Join Waiting List';
    }
}

// Open sidebar function
function openSidebar() {
    try {
        const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
        if (browserAPI && browserAPI.sidebarAction) {
            browserAPI.sidebarAction.open();
            window.close();
        } else {
            alert('Please click the AI Prompt Enhancer icon in your Firefox sidebar to get started!');
        }
    } catch (error) {
        alert('Please click the AI Prompt Enhancer icon in your Firefox sidebar to get started!');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Set up form submission
    const form = document.getElementById('registrationForm');
    if (form) {
        form.addEventListener('submit', handleRegistration);
    }
    
    // Set up sidebar button
    const sidebarBtn = document.querySelector('.btn-secondary');
    if (sidebarBtn && sidebarBtn.textContent.includes('Open Sidebar')) {
        sidebarBtn.addEventListener('click', openSidebar);
    }
    
    // Smooth scroll to form
    const joinBtn = document.querySelector('a[href="#registrationForm"]');
    if (joinBtn) {
        joinBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('registrationForm').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
});
