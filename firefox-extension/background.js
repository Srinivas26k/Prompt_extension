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
  EMAIL: 'userEmail',
  REDEMPTION_CODE: 'redemptionCode',
  SETTINGS: 'enhancerSettings',
  STATS: 'enhancementStats',
  CREDITS: 'creditsRemaining',
  VERIFIED: 'isVerified'
};

// Backend configuration
const CONFIG = {
    API_BASE_URL: 'http://localhost:3000',  // Next.js development server
    ENDPOINTS: {
        REGISTER: '/api/register',
        VERIFY: '/api/verify', 
        ENHANCE: '/api/enhance',
        HEALTH: '/api/health'
    },
    getApiUrl: function(endpoint) {
        return this.API_BASE_URL + this.ENDPOINTS[endpoint];
    }
};

// Backward compatibility
const API_BASE_URL = CONFIG.API_BASE_URL;

// Default settings
const DEFAULT_SETTINGS = {
  role: '',
  description: 'detailed',
  length: 'medium',
  format: 'structured',
  tone: 'helpful'
};

// Storage operations
function saveUserCredentials(email, code) {
  return new Promise((resolve, reject) => {
    debugLog("Attempting to save user credentials", { email, codeLength: code?.length });
    
    browserAPI.storage.local.set({ 
      [STORAGE_KEYS.EMAIL]: email,
      [STORAGE_KEYS.REDEMPTION_CODE]: code,
      [STORAGE_KEYS.VERIFIED]: true
    }, () => {
      if (browserAPI.runtime.lastError) {
        debugLog("Credentials save failed", browserAPI.runtime.lastError);
        reject(new Error(`Failed to save credentials: ${browserAPI.runtime.lastError.message}`));
      } else {
        debugLog('User credentials saved successfully to local storage');
        resolve(true);
      }
    });
  });
}

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
    
    browserAPI.storage.local.get([
      STORAGE_KEYS.EMAIL, 
      STORAGE_KEYS.REDEMPTION_CODE, 
      STORAGE_KEYS.SETTINGS, 
      STORAGE_KEYS.CREDITS,
      STORAGE_KEYS.VERIFIED
    ], (result) => {
      if (browserAPI.runtime.lastError) {
        debugLog("Data retrieval failed", browserAPI.runtime.lastError);
        reject(new Error(`Failed to get stored data: ${browserAPI.runtime.lastError.message}`));
      } else {
        debugLog('Retrieved stored data:', { 
          hasEmail: !!result[STORAGE_KEYS.EMAIL],
          hasCode: !!result[STORAGE_KEYS.REDEMPTION_CODE], 
          hasSettings: !!result[STORAGE_KEYS.SETTINGS],
          credits: result[STORAGE_KEYS.CREDITS] || 0,
          verified: result[STORAGE_KEYS.VERIFIED] || false
        });
        resolve({
          email: result[STORAGE_KEYS.EMAIL] || '',
          redemptionCode: result[STORAGE_KEYS.REDEMPTION_CODE] || '',
          settings: result[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS,
          credits: result[STORAGE_KEYS.CREDITS] || 0,
          verified: result[STORAGE_KEYS.VERIFIED] || false
        });
      }
    });
  });
}

// Check for credentials from web verification (localStorage)
function checkWebCredentials() {
  return new Promise((resolve) => {
    try {
      // Try to access localStorage if available (content script context)
      browserAPI.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
          browserAPI.tabs.executeScript(tabs[0].id, {
            code: `
              try {
                const email = localStorage.getItem('ai_enhancer_email');
                const code = localStorage.getItem('ai_enhancer_code');
                const verified = localStorage.getItem('ai_enhancer_verified');
                const credits = localStorage.getItem('ai_enhancer_credits');
                
                if (email && code && verified === 'true') {
                  ({email, code, credits: parseInt(credits) || 100});
                } else {
                  null;
                }
              } catch(e) {
                null;
              }
            `
          }, (result) => {
            if (result && result[0]) {
              resolve(result[0]);
            } else {
              resolve(null);
            }
          });
        } else {
          resolve(null);
        }
      });
    } catch (error) {
      resolve(null);
    }
  });
}

// Import credentials from web verification
function importWebCredentials() {
  return new Promise(async (resolve) => {
    try {
      const webCreds = await checkWebCredentials();
      if (webCreds && webCreds.email && webCreds.code) {
        await saveUserCredentials(webCreds.email, webCreds.code);
        await updateCredits(webCreds.credits);
        debugLog('Imported credentials from web verification', webCreds);
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      debugLog('Failed to import web credentials', error);
      resolve(false);
    }
  });
}

// Update credits in storage
function updateCredits(credits) {
  return new Promise((resolve, reject) => {
    debugLog("Updating credits", { credits });
    
    browserAPI.storage.local.set({ [STORAGE_KEYS.CREDITS]: credits }, () => {
      if (browserAPI.runtime.lastError) {
        debugLog("Credits update failed", browserAPI.runtime.lastError);
        reject(new Error(`Failed to update credits: ${browserAPI.runtime.lastError.message}`));
      } else {
        debugLog('Credits updated successfully');
        resolve(true);
      }
    });
  });
}

// Check credits from backend
async function checkCreditsFromBackend(redemptionCode) {
  try {
    const params = new URLSearchParams({
      redemption_code: redemptionCode
    });
    
    const response = await fetch(`${API_BASE_URL}/api/check_credits?${params.toString()}`);
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        await updateCredits(result.remaining_credits);
        return result.remaining_credits;
      }
    }
    return null;
  } catch (error) {
    debugLog('Backend credit check failed', error);
    return null;
  }
}

// Use credit for enhancement
async function useCredit(redemptionCode) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/use_credit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        redemption_code: redemptionCode
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        await updateCredits(result.remaining_credits);
        return { success: true, remaining: result.remaining_credits };
      } else {
        return { success: false, message: result.message };
      }
    }
    return { success: false, message: 'Server error' };
  } catch (error) {
    debugLog('Credit usage failed', error);
    return { success: false, message: 'Network error' };
  }
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
    const params = new URLSearchParams({
      redemption_code: code
    });
    
    const response = await fetch(`${API_BASE_URL}/api/check_credits?${params.toString()}`);
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        return {
          valid: true,
          credits: result.remaining_credits,
          user: result.user
        };
      }
    }
    return { valid: false };
  } catch (error) {
    debugLog('Code validation failed', error);
    return { valid: false };
  }
}

// Enhanced prompt generation using Ben's methodology (local implementation)
function generateEnhancedPrompt(originalPrompt, settings) {
  const role = settings.role || '';
  const description = settings.description || 'detailed';
  const length = settings.length || 'medium';
  const format = settings.format || 'structured';
  const tone = settings.tone || 'helpful';
  
  // Length mapping
  const lengthInstructions = {
    'short': 'Keep the response concise and to the point',
    'medium': 'Provide a comprehensive but focused response',
    'long': 'Give a detailed, thorough explanation with examples'
  };
  
  // Format mapping  
  const formatInstructions = {
    'structured': 'Use clear headings, bullet points, and logical organization',
    'paragraph': 'Write in flowing paragraphs with smooth transitions',
    'stepbystep': 'Break down into numbered steps or sequential instructions',
    'creative': 'Use engaging, creative formatting with varied presentation styles'
  };
  
  // Tone mapping
  const toneInstructions = {
    'helpful': 'Be supportive, encouraging, and solution-focused',
    'professional': 'Maintain formal, business-appropriate language',
    'casual': 'Use conversational, friendly, and approachable language',
    'technical': 'Focus on precision, accuracy, and technical detail'
  };
  
  // Build enhanced prompt using Ben's structure
  const enhancedSections = [];
  
  // ROLE section
  if (role) {
    enhancedSections.push(`**ROLE**: You are ${role}`);
  }
  
  // GOAL section  
  enhancedSections.push(`**GOAL**: ${originalPrompt}`);
  
  // CONTEXT section
  const contextParts = [];
  if (description === 'detailed') {
    contextParts.push("Provide comprehensive information with relevant details");
  } else if (description === 'summary') {
    contextParts.push("Focus on key points and essential information");
  } else if (description === 'creative') {
    contextParts.push("Approach this with creativity and innovative thinking");
  }
  
  if (contextParts.length > 0) {
    enhancedSections.push(`**CONTEXT**: ${contextParts.join(' and ')}`);
  }
  
  // REQUIREMENTS section
  const requirements = [];
  requirements.push(lengthInstructions[length]);
  requirements.push(toneInstructions[tone]);
  
  enhancedSections.push(`**REQUIREMENTS**: ${requirements.join(' | ')}`);
  
  // FORMAT section
  enhancedSections.push(`**FORMAT**: ${formatInstructions[format]}`);
  
  // WARNINGS section
  enhancedSections.push("**WARNINGS**: Ensure accuracy, avoid assumptions, and provide actionable insights");
  
  return enhancedSections.join('\n\n');
}

// Enhance prompt using backend API
async function enhancePrompt(originalPrompt) {
  try {
    debugLog('Enhancement request received:', { 
      promptLength: originalPrompt?.length, 
      promptPreview: originalPrompt?.substring(0, 50) + '...' 
    });
    
    if (!originalPrompt || !originalPrompt.trim()) {
      throw new Error('Please enter a prompt to enhance');
    }
    
    const storedData = await getStoredData();
    const { redemptionCode } = storedData;
    
    debugLog('Retrieved data for enhancement:', { 
      hasCode: !!redemptionCode, 
      codePreview: redemptionCode ? redemptionCode.substring(0, 4) + '...' : 'none'
    });
    
    if (!redemptionCode) {
      // Try to import from web verification
      const imported = await importWebCredentials();
      if (!imported) {
        throw new Error('Redemption code not configured. Please verify your code at the verification page.');
      }
      const newData = await getStoredData();
      storedData.redemptionCode = newData.redemptionCode;
    }
    
    // Call the Next.js API to enhance the prompt
    const response = await fetch(`${API_BASE_URL}/api/enhance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: redemptionCode,
        prompt: originalPrompt
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Enhancement failed');
    }

    const data = await response.json();
    
    debugLog('Enhancement completed:', { 
      originalLength: originalPrompt.length,
      enhancedLength: data.enhanced_prompt.length,
      creditsRemaining: data.credits_remaining
    });

    // Update local credits count
    await browserAPI.storage.local.set({
      [STORAGE_KEYS.CREDITS]: data.credits_remaining
    });

    // Update stats
    await updateStats();
    
    debugLog('Prompt enhanced successfully via API', { 
      enhancedLength: data.enhanced_prompt.length,
      enhancedPreview: data.enhanced_prompt.substring(0, 100) + '...',
      creditsRemaining: data.credits_remaining
    });

    return data.enhanced_prompt;
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
        
      case 'importWebCredentials':
        importWebCredentials()
          .then(success => {
            sendResponse({ success, message: success ? 'Credentials imported successfully' : 'No web credentials found' });
          })
          .catch(error => {
            sendResponse({ success: false, error: error.message });
          });
        break;
        
      case 'checkCredits':
        (async () => {
          try {
            const data = await getStoredData();
            let credits = data.credits;
            
            // Try to refresh from backend if we have a redemption code
            if (data.redemptionCode) {
              const backendCredits = await checkCreditsFromBackend(data.redemptionCode);
              if (backendCredits !== null) {
                credits = backendCredits;
              }
            }
            
            sendResponse({ success: true, credits });
          } catch (error) {
            sendResponse({ success: false, error: error.message });
          }
        })();
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

// Donation notification system
let donationNotificationShown = false;

function showDonationNotification() {
  if (donationNotificationShown) return;
  
  browserAPI.notifications.create('donation-support', {
    type: 'basic',
    iconUrl: 'icons/icon-48.png',
    title: 'AI Prompt Enhancer ☕',
    message: 'Enjoying the extension? Support development with a coffee!',
    buttons: [
      { title: 'Buy me a coffee' },
      { title: 'Maybe later' }
    ]
  });
  
  donationNotificationShown = true;
  
  // Reset after 5 minutes so it can show again
  setTimeout(() => {
    donationNotificationShown = false;
  }, 5 * 60 * 1000);
}

// Show donation notification every 5 minutes
setInterval(() => {
  showDonationNotification();
}, 5 * 60 * 1000);

// Handle notification clicks
if (browserAPI.notifications) {
  browserAPI.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    if (notificationId === 'donation-support' && buttonIndex === 0) {
      browserAPI.tabs.create({
        url: 'https://buymeacoffee.com/srinivaskiv'
      });
    }
    browserAPI.notifications.clear(notificationId);
  });

  browserAPI.notifications.onClicked.addListener((notificationId) => {
    if (notificationId === 'donation-support') {
      browserAPI.tabs.create({
        url: 'https://buymeacoffee.com/srinivaskiv'
      });
      browserAPI.notifications.clear(notificationId);
    }
  });
}

console.log('AI Prompt Enhancer Pro initialized successfully');
debugLog("Background script fully loaded and ready");
