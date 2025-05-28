// Popup script for AI Prompt Enhancer
console.log("AI Prompt Enhancer popup script loaded");

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
      // Check API key status
      const apiKeyResult = await this.sendMessage({ action: 'getApiKey' });
      if (apiKeyResult.apiKey && apiKeyResult.apiKey.length > 0) {
        this.elements.apiStatus.textContent = 'Connected';
        this.elements.apiStatus.className = 'status-value connected';
      } else {
        this.elements.apiStatus.textContent = 'Not configured';
        this.elements.apiStatus.className = 'status-value disconnected';
      }

      // Load stats
      const stats = await this.getStats();
      this.elements.totalCount.textContent = stats.total || 0;
      this.elements.todayCount.textContent = stats.today || 0;

    } catch (error) {
      console.error('Error loading status:', error);
      this.elements.apiStatus.textContent = 'Error';
      this.elements.apiStatus.className = 'status-value disconnected';
    }
  }

  openSidebar() {
    chrome.sidebarAction.toggle();
    window.close();
  }

  openHelp() {
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html')
    });
    window.close();
  }

  async getStats() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['stats'], (result) => {
        resolve(result.stats || {});
      });
    });
  }

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});