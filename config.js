// Configuration for AI Prompt Enhancer
// Update these URLs when deploying to production

const CONFIG = {
    // API Configuration
    API_BASE_URL: 'http://localhost:5000',  // Change to your deployed Flask API URL
    
    // API Endpoints
    ENDPOINTS: {
        REGISTER: '/api/register',
        VERIFY: '/api/verify',
        CHECK_CREDITS: '/api/check_credits',
        USE_CREDIT: '/api/use_credit',
        ENHANCE: '/api/enhance',
        HEALTH: '/health'
    },
    
    // Frontend Configuration
    GITHUB_PAGES_URL: 'https://yourusername.github.io/your-repo-name',  // Update with your GitHub Pages URL
    
    // Development vs Production
    IS_DEVELOPMENT: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    
    // Get full API URL
    getApiUrl: function(endpoint) {
        return this.API_BASE_URL + this.ENDPOINTS[endpoint];
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
