// Welcome page JavaScript
function openSidebar() {
    try {
        const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
        if (browserAPI.sidebarAction) {
            browserAPI.sidebarAction.open();
            window.close();
        } else {
            alert('Please click the AI Prompt Enhancer icon in your Firefox sidebar to get started!');
        }
    } catch (error) {
        alert('Please click the AI Prompt Enhancer icon in your Firefox sidebar to get started!');
    }
}

// Auto-redirect to a supported site after a few seconds
document.addEventListener('DOMContentLoaded', () => {
    // Set up button event listener
    const sidebarBtn = document.querySelector('.btn-secondary');
    if (sidebarBtn) {
        sidebarBtn.addEventListener('click', openSidebar);
    }

    // Auto-redirect after 10 seconds
    setTimeout(() => {
        if (confirm('Would you like to visit Claude.ai to test the extension?')) {
            window.location.href = 'https://claude.ai';
        }
    }, 10000);
});
