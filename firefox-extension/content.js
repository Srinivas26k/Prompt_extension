// Content script for AI Prompt Enhancer
console.log("AI Prompt Enhancer content script loaded");

// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

class PromptEnhancer {
  constructor() {
    this.isActive = false;
    this.enhanceButton = null;
    this.currentTextarea = null;
    this.init();
  }

  init() {
    this.createEnhanceButton();
    this.observeTextareas();
    this.setupEventListeners();
  }

  createEnhanceButton() {
    this.enhanceButton = document.createElement('div');
    this.enhanceButton.className = 'prompt-enhancer-btn';
    this.enhanceButton.innerHTML = `
      <div class="enhancer-icon">✨</div>
      <div class="enhancer-tooltip">Enhance with AI</div>
    `;
    this.enhanceButton.style.display = 'none';
    document.body.appendChild(this.enhanceButton);
  }

  observeTextareas() {
    // Common selectors for AI chat platforms
    const selectors = [
      'textarea',
      '[contenteditable="true"]',
      'input[type="text"]',
      '.ProseMirror',
      '[data-testid*="input"]',
      '[data-testid*="textarea"]'
    ];

    const observer = new MutationObserver(() => {
      this.attachToTextareas();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Initial attachment
    setTimeout(() => this.attachToTextareas(), 1000);
  }

  attachToTextareas() {
    const textareas = document.querySelectorAll('textarea, [contenteditable="true"]');
    
    textareas.forEach(textarea => {
      if (textarea.dataset.promptEnhancerAttached) return;
      
      textarea.dataset.promptEnhancerAttached = 'true';
      
      textarea.addEventListener('focus', (e) => this.showEnhanceButton(e.target));
      textarea.addEventListener('blur', (e) => this.hideEnhanceButton(e.target));
      textarea.addEventListener('input', (e) => this.handleInput(e.target));
    });
  }

  showEnhanceButton(textarea) {
    if (this.getTextContent(textarea).trim().length < 10) return;
    
    this.currentTextarea = textarea;
    const rect = textarea.getBoundingClientRect();
    
    this.enhanceButton.style.display = 'flex';
    this.enhanceButton.style.position = 'fixed';
    this.enhanceButton.style.top = `${rect.bottom - 40}px`;
    this.enhanceButton.style.right = `${window.innerWidth - rect.right + 10}px`;
    this.enhanceButton.style.zIndex = '10000';
  }

  hideEnhanceButton(textarea) {
    setTimeout(() => {
      if (!this.enhanceButton.matches(':hover')) {
        this.enhanceButton.style.display = 'none';
      }
    }, 200);
  }

  handleInput(textarea) {
    const text = this.getTextContent(textarea);
    if (text.trim().length >= 10 && textarea === document.activeElement) {
      this.showEnhanceButton(textarea);
    } else {
      this.enhanceButton.style.display = 'none';
    }
  }

  getTextContent(element) {
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
      return element.value;
    }
    return element.textContent || element.innerText || '';
  }

  setTextContent(element, text) {
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
      element.value = text;
    } else {
      element.textContent = text;
    }
    
    // Trigger input event to update any frameworks
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  setupEventListeners() {
    this.enhanceButton.addEventListener('click', () => {
      this.enhancePrompt();
    });

    this.enhanceButton.addEventListener('mouseenter', () => {
      this.enhanceButton.style.transform = 'scale(1.1)';
    });

    this.enhanceButton.addEventListener('mouseleave', () => {
      this.enhanceButton.style.transform = 'scale(1)';
    });
  }

  async enhancePrompt() {
    if (!this.currentTextarea) return;
    
    const originalText = this.getTextContent(this.currentTextarea);
    if (!originalText.trim()) return;

    this.showLoading();
    
    try {
      const enhancedText = await this.callEnhanceAPI(originalText);
      this.setTextContent(this.currentTextarea, enhancedText);
      this.showSuccess();
    } catch (error) {
      console.error('Enhancement error:', error);
      this.showError();
    }
  }

  async callEnhanceAPI(prompt) {
    return new Promise((resolve, reject) => {
      browserAPI.runtime.sendMessage({
        action: 'enhancePrompt',
        prompt: prompt
      }, (response) => {
        if (browserAPI.runtime.lastError) {
          reject(new Error(browserAPI.runtime.lastError.message));
        } else if (response && response.success) {
          resolve(response.enhancedPrompt);
        } else {
          reject(new Error(response ? response.error : 'Unknown error'));
        }
      });
    });
  }

  showLoading() {
    this.enhanceButton.innerHTML = `
      <div class="enhancer-icon loading">⏳</div>
      <div class="enhancer-tooltip">Enhancing...</div>
    `;
    this.enhanceButton.classList.add('loading');
  }

  showSuccess() {
    this.enhanceButton.innerHTML = `
      <div class="enhancer-icon success">✅</div>
      <div class="enhancer-tooltip">Enhanced!</div>
    `;
    this.enhanceButton.classList.remove('loading');
    this.enhanceButton.classList.add('success');
    
    setTimeout(() => {
      this.resetButton();
    }, 2000);
  }

  showError() {
    this.enhanceButton.innerHTML = `
      <div class="enhancer-icon error">❌</div>
      <div class="enhancer-tooltip">Error occurred</div>
    `;
    this.enhanceButton.classList.remove('loading');
    this.enhanceButton.classList.add('error');
    
    setTimeout(() => {
      this.resetButton();
    }, 3000);
  }

  resetButton() {
    this.enhanceButton.innerHTML = `
      <div class="enhancer-icon">✨</div>
      <div class="enhancer-tooltip">Enhance with AI</div>
    `;
    this.enhanceButton.classList.remove('loading', 'success', 'error');
  }

  // Message listener for communication with extension
  addMessageListener() {
    browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
      try {
        switch (request.action) {
          case 'getPrompt':
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT' || activeElement.contentEditable === 'true')) {
              const prompt = this.getTextContent(activeElement);
              sendResponse({ success: true, prompt: prompt });
            } else {
              sendResponse({ success: false, error: 'No active text input found' });
            }
            break;
            
          case 'insertPrompt':
            const currentTextarea = document.activeElement;
            if (currentTextarea && (currentTextarea.tagName === 'TEXTAREA' || currentTextarea.tagName === 'INPUT' || currentTextarea.contentEditable === 'true')) {
              this.setTextContent(currentTextarea, request.prompt);
              sendResponse({ success: true });
            } else {
              sendResponse({ success: false, error: 'No active text input found' });
            }
            break;
            
          case 'enhanceSelection':
            if (request.text) {
              this.enhanceSelectedText(request.text);
              sendResponse({ success: true });
            } else {
              sendResponse({ success: false, error: 'No text provided' });
            }
            break;
            
          case 'openSidebar':
            // This is handled by opening sidebar in a new tab from popup
            sendResponse({ success: true });
            break;
            
          default:
            sendResponse({ success: false, error: 'Unknown action' });
        }
      } catch (error) {
        console.error('Content script message error:', error);
        sendResponse({ success: false, error: error.message });
      }
      return true; // Keep message channel open for async response
    });
  }

  // Add method to handle selected text enhancement
  async enhanceSelectedText(selectedText) {
    try {
      const enhancedText = await this.callEnhanceAPI(selectedText);
      
      // Try to replace selected text if possible
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(enhancedText));
        selection.removeAllRanges();
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(enhancedText);
        console.log('Enhanced text copied to clipboard');
      }
    } catch (error) {
      console.error('Error enhancing selected text:', error);
    }
  };
}

// Initialize the enhancer
const promptEnhancer = new PromptEnhancer();
promptEnhancer.addMessageListener();