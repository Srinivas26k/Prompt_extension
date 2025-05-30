// AI Prompt Enhancer - Main JavaScript
// Connects GitHub Pages to Streamlit API backend

// Configuration
const CONFIG = {
    STREAMLIT_API_URL: 'https://ai-prompt-enhancer.streamlit.app',
    ENDPOINTS: {
        REGISTER: 'register',
        VERIFY: 'verify',
        CHECK_CREDITS: 'check_credits',
        ENHANCE: 'enhance',
        HEALTH: 'health'
    }
};

// Utility Functions
const utils = {
    // Make API calls to Streamlit backend
    async callAPI(endpoint, params = {}) {
        try {
            const url = new URL(CONFIG.STREAMLIT_API_URL);
            url.searchParams.set('endpoint', endpoint);
            
            // Add all parameters to URL
            Object.entries(params).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    url.searchParams.set(key, value);
                }
            });

            console.log('API Call:', url.toString());

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Try to parse as JSON
            const text = await response.text();
            try {
                return JSON.parse(text);
            } catch (e) {
                // If not JSON, likely Streamlit HTML response
                console.warn('Non-JSON response received:', text.substring(0, 200) + '...');
                throw new Error('Invalid JSON response from API');
            }
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    },

    // Show status messages
    showStatus(elementId, message, type = 'success') {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.textContent = message;
        element.className = `status-message ${type}`;
        element.style.display = 'block';

        // Auto-hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                element.style.display = 'none';
            }, 5000);
        }
    },

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Animate numbers
    animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + (target >= 1000 ? '+' : '');
        }, 16);
    }
};

// Application Form Handler
class ApplicationForm {
    constructor() {
        this.form = document.getElementById('application-form');
        this.statusElement = document.getElementById('application-status');
        this.submitButton = this.form?.querySelector('.submit-button');
        
        this.init();
    }

    init() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        const emailInput = this.form.querySelector('#email');
        if (emailInput) {
            emailInput.addEventListener('blur', () => this.validateEmail());
        }
    }

    validateEmail() {
        const emailInput = this.form.querySelector('#email');
        const email = emailInput.value.trim();

        if (email && !utils.isValidEmail(email)) {
            emailInput.style.borderColor = 'var(--error-color)';
            utils.showStatus('application-status', 'Please enter a valid email address', 'error');
            return false;
        }

        emailInput.style.borderColor = 'var(--border-color)';
        return true;
    }

    async handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(this.form);
        const name = formData.get('name')?.trim();
        const email = formData.get('email')?.trim();
        const reason = formData.get('reason')?.trim();

        // Validation
        if (!name || !email || !reason) {
            utils.showStatus('application-status', 'Please fill in all required fields', 'error');
            return;
        }

        if (!utils.isValidEmail(email)) {
            utils.showStatus('application-status', 'Please enter a valid email address', 'error');
            return;
        }

        // Show loading state
        this.setLoading(true);

        try {
            const result = await utils.callAPI(CONFIG.ENDPOINTS.REGISTER, {
                name,
                email,
                reason
            });

            if (result.success) {
                utils.showStatus('application-status', 
                    'Application submitted successfully! You will be notified when approved.', 
                    'success'
                );
                this.form.reset();
                
                // Track successful application
                this.trackEvent('application_submitted', { email });
            } else {
                utils.showStatus('application-status', 
                    result.message || 'Application failed. Please try again.', 
                    'error'
                );
            }
        } catch (error) {
            console.error('Application submission failed:', error);
            utils.showStatus('application-status', 
                'Network error. Please check your connection and try again.', 
                'error'
            );
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        if (!this.submitButton) return;

        if (loading) {
            this.submitButton.disabled = true;
            this.submitButton.innerHTML = '<span class="spinner"></span> Submitting...';
        } else {
            this.submitButton.disabled = false;
            this.submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Application';
        }
    }

    trackEvent(eventName, properties = {}) {
        // Add analytics tracking here if needed
        console.log('Event tracked:', eventName, properties);
    }
}

// Navigation Handler
class Navigation {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        
        this.init();
    }

    init() {
        // Smooth scrolling for nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // Navbar background on scroll
        window.addEventListener('scroll', () => this.handleScroll());

        // Mobile menu toggle (if needed)
        this.setupMobileMenu();
    }

    handleNavClick(e) {
        e.preventDefault();
        const target = e.target.getAttribute('href');
        const element = document.querySelector(target);
        
        if (element) {
            const offset = 80; // Account for fixed navbar
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    handleScroll() {
        const scrolled = window.pageYOffset > 100;
        
        if (scrolled) {
            this.navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            this.navbar.style.boxShadow = 'var(--shadow-md)';
        } else {
            this.navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            this.navbar.style.boxShadow = 'none';
        }
    }

    setupMobileMenu() {
        // Add mobile menu functionality if needed
        // This would involve creating a hamburger menu for mobile
    }
}

// Statistics Counter
class StatsCounter {
    constructor() {
        this.counters = document.querySelectorAll('.stat-number');
        this.animated = false;
        
        this.init();
    }

    init() {
        // Intersection Observer for animation trigger
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated) {
                    this.animateCounters();
                    this.animated = true;
                }
            });
        });

        const statsSection = document.querySelector('.hero-stats');
        if (statsSection) {
            observer.observe(statsSection);
        }
    }

    animateCounters() {
        this.counters.forEach(counter => {
            const text = counter.textContent;
            const target = parseInt(text.replace(/\D/g, ''));
            
            if (target > 0) {
                utils.animateCounter(counter, target);
            }
        });
    }
}

// Button Handlers
class ButtonHandlers {
    constructor() {
        this.init();
    }

    init() {
        // Apply Now buttons
        document.querySelectorAll('#apply-now, #get-beta-access').forEach(button => {
            button.addEventListener('click', () => this.scrollToApplication());
        });

        // Demo button
        const demoButton = document.getElementById('try-demo');
        if (demoButton) {
            demoButton.addEventListener('click', () => this.showDemo());
        }

        // Pricing button
        const pricingButton = document.getElementById('get-beta-access');
        if (pricingButton) {
            pricingButton.addEventListener('click', () => this.scrollToApplication());
        }
    }

    scrollToApplication() {
        const applySection = document.getElementById('apply');
        if (applySection) {
            const offset = 80;
            const elementPosition = applySection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    showDemo() {
        // For now, scroll to the demo box in hero section
        const demoBox = document.querySelector('.demo-box');
        if (demoBox) {
            demoBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add a highlight effect
            demoBox.style.transform = 'scale(1.02)';
            demoBox.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
            
            setTimeout(() => {
                demoBox.style.transform = 'scale(1)';
                demoBox.style.boxShadow = 'var(--shadow-xl)';
            }, 1000);
        }
    }
}

// API Health Check
class HealthMonitor {
    constructor() {
        this.checkInterval = 5 * 60 * 1000; // 5 minutes
        this.init();
    }

    init() {
        this.checkHealth();
        setInterval(() => this.checkHealth(), this.checkInterval);
    }

    async checkHealth() {
        try {
            const result = await utils.callAPI(CONFIG.ENDPOINTS.HEALTH);
            console.log('API Health:', result);
            
            if (result.status === 'healthy') {
                this.updateHealthStatus('online');
            } else {
                this.updateHealthStatus('degraded');
            }
        } catch (error) {
            console.warn('Health check failed:', error);
            this.updateHealthStatus('offline');
        }
    }

    updateHealthStatus(status) {
        // Update any health indicators on the page
        const indicators = document.querySelectorAll('.health-indicator');
        indicators.forEach(indicator => {
            indicator.className = `health-indicator ${status}`;
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('AI Prompt Enhancer - Initializing...');
    
    // Initialize all components
    new ApplicationForm();
    new Navigation();
    new StatsCounter();
    new ButtonHandlers();
    new HealthMonitor();
    
    console.log('AI Prompt Enhancer - Ready!');
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Export for potential Chrome extension integration
if (typeof window !== 'undefined') {
    window.AIPromptEnhancer = {
        utils,
        CONFIG,
        callAPI: utils.callAPI
    };
}
