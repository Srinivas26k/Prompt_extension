// Background script for AI Prompt Enhancer Pro
console.log("AI Prompt Enhancer Pro background script loaded");

// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Debug logging
function debugLog(message, data = null) {
  console.log(`[AI Prompt Enhancer Debug] ${message}`, data || '');
}

debugLog("Extension background initialized", { 
  browserAPI: !!browserAPI, 
  storageAPI: !!browserAPI?.storage?.local 
});

// Storage keys
const STORAGE_KEYS = {
  REDEMPTION_CODE: 'redemptionCode',
  SETTINGS: 'enhancerSettings',
  STATS: 'enhancementStats',
  CREDITS: 'creditsRemaining'
};

// Backend configuration
const BACKEND_URL = 'https://ai-prompt-enhancer.streamlit.app';

// Default settings
const DEFAULT_SETTINGS = {
  role: '',
  description: 'detailed',
  length: 'medium',
  format: 'structured',
  tone: 'helpful'
};

// Storage operations
function saveRedemptionCode(code) {
  return new Promise((resolve, reject) => {
    debugLog("Attempting to save redemption code", { codeLength: code?.length });
    
    browserAPI.storage.local.set({ [STORAGE_KEYS.REDEMPTION_CODE]: code }, () => {
      if (browserAPI.runtime.lastError) {
        debugLog("Redemption code save failed", browserAPI.runtime.lastError);
        reject(new Error(`Failed to save redemption code: ${browserAPI.runtime.lastError.message}`));
      } else {
        debugLog('Redemption code saved successfully to local storage');
        resolve(true);
      }
    });
  });
}

function saveSettings(settings) {
  return new Promise((resolve, reject) => {
    debugLog("Attempting to save settings", settings);
    
    browserAPI.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings }, () => {
      if (browserAPI.runtime.lastError) {
        debugLog("Settings save failed", browserAPI.runtime.lastError);
        reject(new Error(`Failed to save settings: ${browserAPI.runtime.lastError.message}`));
      } else {
        debugLog('Settings saved successfully to local storage');
        resolve(true);
      }
    });
  });
}

function getStoredData() {
  return new Promise((resolve, reject) => {
    debugLog("Attempting to retrieve stored data");
    
    browserAPI.storage.local.get([STORAGE_KEYS.REDEMPTION_CODE, STORAGE_KEYS.SETTINGS, STORAGE_KEYS.CREDITS], (result) => {
      if (browserAPI.runtime.lastError) {
        debugLog("Data retrieval failed", browserAPI.runtime.lastError);
        reject(new Error(`Failed to get stored data: ${browserAPI.runtime.lastError.message}`));
      } else {
        debugLog('Retrieved stored data:', { 
          hasCode: !!result[STORAGE_KEYS.REDEMPTION_CODE], 
          hasSettings: !!result[STORAGE_KEYS.SETTINGS],
          credits: result[STORAGE_KEYS.CREDITS] || 0
        });
        resolve({
          redemptionCode: result[STORAGE_KEYS.REDEMPTION_CODE] || '',
          settings: result[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS,
          credits: result[STORAGE_KEYS.CREDITS] || 0
        });
      }
    });
  });
}

function updateStats() {
  return new Promise((resolve) => {
    const today = new Date().toDateString();
    browserAPI.storage.local.get([STORAGE_KEYS.STATS], (result) => {
      const stats = result[STORAGE_KEYS.STATS] || { total: 0, today: 0, lastDate: '' };
      
      // Reset daily count if it's a new day
      if (stats.lastDate !== today) {
        stats.today = 0;
        stats.lastDate = today;
      }
      
      stats.total += 1;
      stats.today += 1;
      
      browserAPI.storage.local.set({ [STORAGE_KEYS.STATS]: stats }, () => {
        resolve(stats);
      });
    });
  });
}

// Validate redemption code with backend
async function validateRedemptionCode(code) {
  try {
    debugLog('Validating redemption code with backend...', { code: code.substring(0, 4) + '...' });
    
    const response = await fetch(`${BACKEND_URL}/?action=validate&code=${encodeURIComponent(code)}`);
    
    if (!response.ok) {
      throw new Error(`Validation failed: ${response.status}`);
    }
    
    const result = await response.json();
    debugLog('Validation result:', result);
    
    if (result.valid) {
      // Update local credits
      browserAPI.storage.local.set({ [STORAGE_KEYS.CREDITS]: result.credits });
    }
    
    return result;
  } catch (error) {
    debugLog('Validation error:', error);
    return { valid: false, error: error.message };
  }
}

// Enhance prompt using backend
async function enhancePrompt(originalPrompt) {
  try {
    debugLog('Enhancement request received:', { 
      promptLength: originalPrompt?.length, 
      promptPreview: originalPrompt?.substring(0, 50) + '...' 
    });
    
    if (!originalPrompt || !originalPrompt.trim()) {
      throw new Error('Please enter a prompt to enhance');
    }
    
    const { redemptionCode, settings } = await getStoredData();
    debugLog('Retrieved data for enhancement:', { 
      hasCode: !!redemptionCode, 
      codePreview: redemptionCode ? redemptionCode.substring(0, 4) + '...' : 'none',
      settings 
    });
    
    if (!redemptionCode) {
      throw new Error('Redemption code not configured. Please enter your redemption code in the extension settings.');
    }
    
    const currentSettings = { ...DEFAULT_SETTINGS, ...settings };
    debugLog('Using settings for enhancement:', currentSettings);
    
    // Make API call to backend
    const response = await fetch(`${BACKEND_URL}/?action=enhance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: redemptionCode,
        prompt: originalPrompt,
        settings: currentSettings
      })
    });
    
    debugLog('API response status:', response.status);

    if (!response.ok) {
      throw new Error(`Backend API Error: ${response.status}`);
    }

    const data = await response.json();
    debugLog('API response received:', { 
      hasSuccess: !!data.success,
      hasError: !!data.error,
      creditsRemaining: data.credits_remaining
    });
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error from backend');
    }

    const enhancedPrompt = data.enhanced_prompt;
    if (!enhancedPrompt) {
      throw new Error('Empty response from backend');
    }

    // Update local credits
    if (data.credits_remaining !== undefined) {
      browserAPI.storage.local.set({ [STORAGE_KEYS.CREDITS]: data.credits_remaining });
    }

    // Update stats
    await updateStats();
    debugLog('Prompt enhanced successfully', { 
      enhancedLength: enhancedPrompt.length,
      enhancedPreview: enhancedPrompt.substring(0, 100) + '...',
      creditsRemaining: data.credits_remaining
    });

    return enhancedPrompt;
  } catch (error) {
    debugLog('Enhancement error:', error);
    throw error;
  }
}

// Message handlers
async function handleSaveRedemptionCode(request, sendResponse) {
  try {
    debugLog("Save redemption code handler called", { hasCode: !!request.code });
    
    if (!request.code) {
      throw new Error('Redemption code cannot be empty');
    }
    
    // Validate code with backend first
    const validation = await validateRedemptionCode(request.code);
    if (!validation.valid) {
      throw new Error('Invalid redemption code');
    }
    
    await saveRedemptionCode(request.code);
    debugLog("Redemption code save successful");
    sendResponse({ 
      success: true, 
      message: 'Redemption code saved successfully',
      credits: validation.credits
    });
  } catch (error) {
    debugLog('Save redemption code error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleSaveSettings(request, sendResponse) {
  try {
    if (!request.settings) {
      throw new Error('Invalid settings');
    }
    await saveSettings(request.settings);
    sendResponse({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Save settings error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Message listener
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    debugLog('Message received:', { action: request.action, sender: sender.tab?.url });
    
    switch (request.action) {
      case 'saveRedemptionCode':
        handleSaveRedemptionCode(request, sendResponse);
        break;
        
      case 'saveSettings':
        handleSaveSettings(request, sendResponse);
        break;
        
      case 'enhancePrompt':
        enhancePrompt(request.prompt)
          .then(enhancedPrompt => {
            debugLog('Enhancement successful, sending response');
            sendResponse({ success: true, enhancedPrompt });
          })
          .catch(error => {
            debugLog('Enhancement failed:', error);
            sendResponse({ success: false, error: error.message });
          });
        break;
        
      case 'validateCode':
        if (request.code) {
          validateRedemptionCode(request.code)
            .then(result => {
              sendResponse({ success: true, validation: result });
            })
            .catch(error => {
              sendResponse({ success: false, error: error.message });
            });
        } else {
          sendResponse({ success: false, error: 'No code provided' });
        }
        break;
        
      case 'getSettings':
        getStoredData()
          .then(data => {
            debugLog('Settings retrieved successfully');
            sendResponse({ success: true, settings: data.settings });
          })
          .catch(error => {
            debugLog('Get settings error:', error);
            sendResponse({ success: false, error: error.message });
          });
        break;

      case 'getRedemptionCode':
        getStoredData()
          .then(data => {
            debugLog('Redemption code retrieved successfully', { hasCode: !!data.redemptionCode });
            sendResponse({ success: true, redemptionCode: data.redemptionCode });
          })
          .catch(error => {
            debugLog('Get redemption code error:', error);
            sendResponse({ success: false, error: error.message });
          });
        break;

      case 'getStats':
        browserAPI.storage.local.get([STORAGE_KEYS.STATS, STORAGE_KEYS.CREDITS], (result) => {
          const stats = result[STORAGE_KEYS.STATS] || { total: 0, today: 0 };
          const credits = result[STORAGE_KEYS.CREDITS] || 0;
          debugLog('Stats retrieved:', { ...stats, credits });
          sendResponse({ success: true, stats: { ...stats, credits } });
        });
        break;
        
      default:
        debugLog('Unknown action received:', request.action);
        sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    debugLog('Message handler error:', error);
    sendResponse({ success: false, error: 'Internal error occurred' });
  }
  return true; // Keep message channel open for async response
});

// Context menu setup
browserAPI.runtime.onInstalled.addListener(() => {
  if (browserAPI.contextMenus) {
    browserAPI.contextMenus.create({
      id: 'enhancePrompt',
      title: 'Enhance with AI',
      contexts: ['selection']
    });
  }
});

if (browserAPI.contextMenus) {
  browserAPI.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'enhancePrompt' && info.selectionText) {
      browserAPI.tabs.sendMessage(tab.id, {
        action: 'enhanceSelection',
        text: info.selectionText
      });
    }
  });
}

// Welcome page
browserAPI.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    browserAPI.tabs.create({
      url: browserAPI.runtime.getURL('welcome.html')
    });
  }
});

console.log('AI Prompt Enhancer Pro initialized successfully');
debugLog("Background script fully loaded and ready");
