// AI Prompt Enhancer Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile navigation
    initializeMobileNav();
    
    // Initialize demo functionality
    initializeDemo();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Initialize intersection observer for animations
    initializeAnimations();
});

// Mobile Navigation
function initializeMobileNav() {
    const mobileToggle = document.querySelector('.nav-mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
        });
        
        // Close menu on link click
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }
}

// Demo Functionality
function initializeDemo() {
    const demoPrompt = document.getElementById('demoPrompt');
    const demoEnhance = document.getElementById('demoEnhance');
    const demoResult = document.getElementById('demoResult');
    
    if (demoPrompt && demoEnhance && demoResult) {
        demoEnhance.addEventListener('click', async () => {
            const prompt = demoPrompt.value.trim();
            
            if (!prompt) {
                showDemoError('Please enter a prompt to enhance');
                return;
            }
            
            // Show loading state
            demoEnhance.disabled = true;
            demoEnhance.innerHTML = '<span class="loading-spinner"></span>Enhancing...';
            demoResult.innerHTML = '<div class="demo-placeholder">Generating enhanced prompt...</div>';
            
            try {
                // Simulate API call with demo enhancement
                const enhancedPrompt = await enhancePromptDemo(prompt);
                
                // Display result
                demoResult.innerHTML = `
                    <div class="enhanced-prompt">
                        ${enhancedPrompt}
                    </div>
                `;
                
            } catch (error) {
                showDemoError('Error enhancing prompt. Please try again.');
            } finally {
                // Reset button
                demoEnhance.disabled = false;
                demoEnhance.innerHTML = 'Enhance Prompt';
            }
        });
        
        // Allow Enter key to trigger enhancement
        demoPrompt.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                demoEnhance.click();
            }
        });
    }
}

// Demo prompt enhancement function
async function enhancePromptDemo(originalPrompt) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate enhanced prompt based on common patterns
    const enhancements = {
        role: getAppropriateRole(originalPrompt),
        context: generateContext(originalPrompt),
        requirements: generateRequirements(originalPrompt),
        format: generateFormat(originalPrompt)
    };
    
    return `
        <div class="enhancement-section">
            <strong>ROLE:</strong> ${enhancements.role}
        </div>
        <div class="enhancement-section">
            <strong>GOAL:</strong> ${originalPrompt}
        </div>
        <div class="enhancement-section">
            <strong>CONTEXT:</strong> ${enhancements.context}
        </div>
        <div class="enhancement-section">
            <strong>REQUIREMENTS:</strong>
            <ul>
                ${enhancements.requirements.map(req => `<li>${req}</li>`).join('')}
            </ul>
        </div>
        <div class="enhancement-section">
            <strong>FORMAT:</strong> ${enhancements.format}
        </div>
    `;
}

// Helper functions for demo enhancement
function getAppropriateRole(prompt) {
    const prompt_lower = prompt.toLowerCase();
    
    if (prompt_lower.includes('code') || prompt_lower.includes('program') || prompt_lower.includes('develop')) {
        return 'You are an expert software developer and programming instructor with years of experience.';
    } else if (prompt_lower.includes('write') || prompt_lower.includes('essay') || prompt_lower.includes('content')) {
        return 'You are a professional writer and content strategist with expertise in clear communication.';
    } else if (prompt_lower.includes('learn') || prompt_lower.includes('study') || prompt_lower.includes('understand')) {
        return 'You are an experienced educator and learning specialist.';
    } else if (prompt_lower.includes('business') || prompt_lower.includes('market') || prompt_lower.includes('strategy')) {
        return 'You are a seasoned business consultant and strategy expert.';
    } else {
        return 'You are a knowledgeable expert in the relevant field with practical experience.';
    }
}

function generateContext(prompt) {
    const contexts = [
        'Provide comprehensive guidance that addresses both theoretical understanding and practical application.',
        'Consider the user\'s current level and provide step-by-step progression.',
        'Focus on actionable insights that can be immediately implemented.',
        'Ensure the response is well-structured and easy to follow.',
        'Include relevant examples and real-world applications where appropriate.'
    ];
    
    return contexts[Math.floor(Math.random() * contexts.length)];
}

function generateRequirements(prompt) {
    const baseRequirements = [
        'Use clear, concise language that is easy to understand',
        'Provide specific, actionable steps',
        'Include relevant examples or case studies',
        'Structure the response with clear headings and bullet points'
    ];
    
    const prompt_lower = prompt.toLowerCase();
    
    if (prompt_lower.includes('learn') || prompt_lower.includes('beginner')) {
        baseRequirements.push('Start with fundamental concepts before advancing');
        baseRequirements.push('Provide recommended learning resources');
    }
    
    if (prompt_lower.includes('code') || prompt_lower.includes('technical')) {
        baseRequirements.push('Include code examples where relevant');
        baseRequirements.push('Explain technical concepts clearly');
    }
    
    return baseRequirements.slice(0, 4); // Return first 4 requirements
}

function generateFormat(prompt) {
    const formats = [
        'Use headings, bullet points, and numbered lists for clarity',
        'Organize information in logical sections with clear progression',
        'Present information in a scannable format with proper hierarchy',
        'Structure as a comprehensive guide with actionable takeaways'
    ];
    
    return formats[Math.floor(Math.random() * formats.length)];
}

function showDemoError(message) {
    const demoResult = document.getElementById('demoResult');
    if (demoResult) {
        demoResult.innerHTML = `<div class="demo-error" style="color: var(--error-color); font-style: italic;">${message}</div>`;
    }
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Animation on Scroll
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .step, .stat');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Track scroll for navbar background
window.addEventListener('scroll', debounce(() => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}, 10));

// Add CSS for animations
const animationStyles = `
    .feature-card, .step, .stat {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .feature-card.animate-in, .step.animate-in, .stat.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .navbar.scrolled {
        background: rgba(255, 255, 255, 0.98);
        box-shadow: var(--shadow-sm);
    }
    
    .enhanced-prompt {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid var(--primary-color);
        line-height: 1.6;
    }
    
    .enhancement-section {
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
    }
    
    .enhancement-section:last-child {
        margin-bottom: 0;
    }
    
    .enhancement-section strong {
        color: var(--primary-color);
        display: block;
        margin-bottom: 0.25rem;
    }
    
    .enhancement-section ul {
        margin: 0.5rem 0;
        padding-left: 1.5rem;
    }
    
    .enhancement-section li {
        margin-bottom: 0.25rem;
        color: var(--text-secondary);
    }
    
    .demo-error {
        padding: 1rem;
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 0.5rem;
    }
    
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            top: 100%;
            left: 0;
            width: 100%;
            background: white;
            flex-direction: column;
            padding: 1rem;
            box-shadow: var(--shadow-lg);
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .nav-menu.active {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
        }
        
        .nav-mobile-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .nav-mobile-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .nav-mobile-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    }
`;

// Inject animation styles
const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);

// Export functions for potential external use
window.PromptEnhancerWebsite = {
    enhancePromptDemo,
    showDemoError
};
