// Popup script for AI Prompt Enhancer
console.log("AI Prompt Enhancer popup script loaded");

// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

class PopupManager {
  constructor() {
    this.elements = {};
    this.init();
  }

  init() {
    this.initElements();
    this.setupEventListeners();
    this.loadStatus();
  }

  initElements() {
    this.elements = {
      apiStatus: document.getElementById('apiStatus'),
      todayCount: document.getElementById('todayCount'),
      totalCount: document.getElementById('totalCount'),
      openSidebar: document.getElementById('openSidebar'),
      openSettings: document.getElementById('openSettings'),
      helpLink: document.getElementById('helpLink')
    };
  }

  setupEventListeners() {
    this.elements.openSidebar.addEventListener('click', () => {
      this.openSidebar();
    });

    this.elements.openSettings.addEventListener('click', () => {
      this.openSidebar();
    });

    this.elements.helpLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.openHelp();
    });
  }

  async loadStatus() {
    try {
      // Check redemption code and credits status
      const codeResult = await this.sendMessage({ action: 'getRedemptionCode' });
      const creditsResult = await this.sendMessage({ action: 'getCredits' });
      
      if (codeResult.success && codeResult.redemptionCode && codeResult.redemptionCode.length > 0) {
        const credits = creditsResult.success ? creditsResult.credits : 0;
        this.elements.apiStatus.textContent = `${credits} credits`;
        this.elements.apiStatus.className = credits > 0 ? 'status-value connected' : 'status-value disconnected';
      } else {
        this.elements.apiStatus.textContent = 'No code redeemed';
        this.elements.apiStatus.className = 'status-value disconnected';
      }

      // Load stats
      const statsResult = await this.sendMessage({ action: 'getStats' });
      if (statsResult.success && statsResult.stats) {
        this.elements.totalCount.textContent = statsResult.stats.total || 0;
        this.elements.todayCount.textContent = statsResult.stats.today || 0;
      } else {
        this.elements.totalCount.textContent = '0';
        this.elements.todayCount.textContent = '0';
      }

    } catch (error) {
      console.error('Error loading status:', error);
      this.elements.apiStatus.textContent = 'Error';
      this.elements.apiStatus.className = 'status-value disconnected';
    }
  }

  async openSidebar() {
    try {
      // For Firefox, we need to open the sidebar HTML in a new tab since sidebar action isn't well supported
      await browserAPI.tabs.create({
        url: browserAPI.runtime.getURL('sidebar.html')
      });
      window.close();
    } catch (error) {
      console.error('Error opening sidebar:', error);
      // Fallback: try to inject sidebar into current tab
      try {
        const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
          await browserAPI.tabs.sendMessage(tabs[0].id, {
            action: 'openSidebar'
          });
          window.close();
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    }
  }

  openHelp() {
    browserAPI.tabs.create({
      url: browserAPI.runtime.getURL('welcome.html')
    });
    window.close();
  }

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      browserAPI.runtime.sendMessage(message, (response) => {
        if (browserAPI.runtime.lastError) {
          reject(new Error(browserAPI.runtime.lastError.message));
        } else {
          resolve(response || {});
        }
      });
    });
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});