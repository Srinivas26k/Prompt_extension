// Background script for AI Prompt Enhancer
console.log("AI Prompt Enhancer background script loaded");

// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Storage keys
const STORAGE_KEYS = {
  API_KEY: 'openRouterApiKey',
  SETTINGS: 'enhancerSettings',
  STATS: 'enhancementStats'
};

// Default settings
const DEFAULT_SETTINGS = {
  role: '',
  description: 'detailed',
  length: 'medium',
  format: 'structured',
  tone: 'helpful'
};

// Enhanced prompt template
const PROMPT_TEMPLATE = `You are an expert prompt engineer. Transform the following basic prompt into a perfect, role-based prompt that will generate better AI responses.
ENHANCEMENT REQUIREMENTS:
- Role: {{ROLE}}
- Description Level: {{DESCRIPTION}}
- Output Length: {{LENGTH}}
- Format Style: {{FORMAT}}
- Response Tone: {{TONE}}
ORIGINAL PROMPT:
{{ORIGINAL_PROMPT}}
ENHANCED PROMPT:
Create a comprehensive, role-based prompt that:
1. Establishes clear context and role
2. Provides specific instructions
3. Defines the desired output format
4. Sets appropriate tone and style
5. Includes relevant constraints or requirements
Return only the enhanced prompt, nothing else.`;

// Storage operations
function saveApiKey(apiKey) {
  return new Promise((resolve, reject) => {
    browserAPI.storage.local.set({ [STORAGE_KEYS.API_KEY]: apiKey }, () => {
      if (browserAPI.runtime.lastError) {
        reject(new Error(`Failed to save API key: ${browserAPI.runtime.lastError.message}`));
      } else {
        console.log('API key saved successfully to local storage');
        resolve(true);
      }
    });
  });
}

function saveSettings(settings) {
  return new Promise((resolve, reject) => {
    browserAPI.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings }, () => {
      if (browserAPI.runtime.lastError) {
        reject(new Error(`Failed to save settings: ${browserAPI.runtime.lastError.message}`));
      } else {
        console.log('Settings saved successfully to local storage');
        resolve(true);
      }
    });
  });
}

function getStoredData() {
  return new Promise((resolve, reject) => {
    browserAPI.storage.local.get([STORAGE_KEYS.API_KEY, STORAGE_KEYS.SETTINGS], (result) => {
      if (browserAPI.runtime.lastError) {
        reject(new Error(`Failed to get stored data: ${browserAPI.runtime.lastError.message}`));
      } else {
        console.log('Retrieved stored data:', { 
          hasApiKey: !!result[STORAGE_KEYS.API_KEY], 
          hasSettings: !!result[STORAGE_KEYS.SETTINGS] 
        });
        resolve({
          apiKey: result[STORAGE_KEYS.API_KEY] || '',
          settings: result[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS
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

// Message handlers
async function handleSaveApiKey(request, sendResponse) {
  try {
    if (!request.apiKey) {
      throw new Error('API key cannot be empty');
    }
    await saveApiKey(request.apiKey);
    sendResponse({ success: true, message: 'API key saved successfully' });
  } catch (error) {
    console.error('Save API key error:', error);
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

async function enhancePrompt(originalPrompt) {
  try {
    console.log('Enhancement request received:', { prompt: originalPrompt?.substring(0, 100) + '...' });
    
    if (!originalPrompt || !originalPrompt.trim()) {
      throw new Error('Please enter a prompt to enhance');
    }
    
    const { apiKey, settings } = await getStoredData();
    console.log('Retrieved data:', { hasApiKey: !!apiKey, settings });
    
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured. Please set your API key in the extension settings.');
    }
    
    const currentSettings = { ...DEFAULT_SETTINGS, ...settings };
    console.log('Using settings:', currentSettings);
    
    // Replace template variables
    const enhancedPromptText = PROMPT_TEMPLATE
      .replace('{{ROLE}}', currentSettings.role || 'AI Assistant')
      .replace('{{DESCRIPTION}}', currentSettings.description)
      .replace('{{LENGTH}}', currentSettings.length)
      .replace('{{FORMAT}}', currentSettings.format)
      .replace('{{TONE}}', currentSettings.tone)
      .replace('{{ORIGINAL_PROMPT}}', originalPrompt);
    
    console.log('Making API call to OpenRouter...');
    
    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'AI Prompt Enhancer',
        'HTTP-Referer': 'https://ai-prompt-enhancer.local'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [{ role: 'user', content: enhancedPromptText }],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenRouter API key.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (response.status === 402) {
        throw new Error('Insufficient credits. Please add credits to your OpenRouter account.');
      } else {
        throw new Error(`API Error: ${response.status} - ${errorText || 'Unknown error'}`);
      }
    }

    const data = await response.json();
    console.log('API response received:', { hasChoices: !!data.choices });
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid API response:', data);
      throw new Error('Invalid API response format');
    }

    const enhancedPrompt = data.choices[0].message.content.trim();
    if (!enhancedPrompt) {
      throw new Error('Empty response from API');
    }

    // Update stats
    await updateStats();
    console.log('Prompt enhanced successfully');

    return enhancedPrompt;
  } catch (error) {
    console.error('Enhancement error:', error);
    throw error;
  }
}

// Message listener
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    switch (request.action) {
      case 'saveApiKey':
        handleSaveApiKey(request, sendResponse);
        break;
        
      case 'saveSettings':
        handleSaveSettings(request, sendResponse);
        break;
        
      case 'enhancePrompt':
        enhancePrompt(request.prompt)
          .then(enhancedPrompt => {
            sendResponse({ success: true, enhancedPrompt });
          })
          .catch(error => {
            console.error('Enhancement error:', error);
            sendResponse({ success: false, error: error.message });
          });
        break;
        
      case 'getSettings':
        getStoredData()
          .then(data => {
            sendResponse({ success: true, settings: data.settings });
          })
          .catch(error => {
            console.error('Get settings error:', error);
            sendResponse({ success: false, error: error.message });
          });
        break;

      case 'getApiKey':
        getStoredData()
          .then(data => {
            sendResponse({ success: true, apiKey: data.apiKey });
          })
          .catch(error => {
            console.error('Get API key error:', error);
            sendResponse({ success: false, error: error.message });
          });
        break;

      case 'getStats':
        browserAPI.storage.local.get([STORAGE_KEYS.STATS], (result) => {
          const stats = result[STORAGE_KEYS.STATS] || { total: 0, today: 0 };
          sendResponse({ success: true, stats });
        });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Message handler error:', error);
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

console.log('AI Prompt Enhancer initialized successfully');