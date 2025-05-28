// Background script for AI Prompt Enhancer
console.log("AI Prompt Enhancer background script loaded");

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

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'enhancePrompt') {
    enhancePrompt(request.prompt)
      .then(enhancedPrompt => {
        sendResponse({ success: true, enhancedPrompt });
      })
      .catch(error => {
        console.error('Enhancement error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.sync.set({ settings: request.settings }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['settings'], (result) => {
      sendResponse({ settings: result.settings || DEFAULT_SETTINGS });
    });
    return true;
  }
  
  if (request.action === 'saveApiKey') {
    chrome.storage.sync.set({ apiKey: request.apiKey }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'getApiKey') {
    chrome.storage.sync.get(['apiKey'], (result) => {
      sendResponse({ apiKey: result.apiKey || '' });
    });
    return true;
  }
});

async function enhancePrompt(originalPrompt) {
  try {
    // Get API key and settings
    const { apiKey, settings } = await getStoredData();
    
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured');
    }
    
    const currentSettings = { ...DEFAULT_SETTINGS, ...settings };
    
    // Build the enhancement prompt
    const enhancePrompt = PROMPT_TEMPLATE
      .replace('{{ROLE}}', currentSettings.role || 'AI Assistant')
      .replace('{{DESCRIPTION}}', currentSettings.description)
      .replace('{{LENGTH}}', currentSettings.length)
      .replace('{{FORMAT}}', currentSettings.format)
      .replace('{{TONE}}', currentSettings.tone)
      .replace('{{ORIGINAL_PROMPT}}', originalPrompt);
    
    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'AI Prompt Enhancer'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'user',
            content: enhancePrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid API response format');
    }
    
    const enhancedPrompt = data.choices[0].message.content.trim();
    
    if (!enhancedPrompt) {
      throw new Error('Empty response from API');
    }
    
    return enhancedPrompt;
    
  } catch (error) {
    console.error('Enhancement error:', error);
    throw error;
  }
}

function getStoredData() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['apiKey', 'settings'], (result) => {
      resolve({
        apiKey: result.apiKey || '',
        settings: result.settings || DEFAULT_SETTINGS
      });
    });
  });
}

// Context menu setup
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'enhancePrompt',
    title: 'Enhance with AI',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'enhancePrompt' && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'enhanceSelection',
      text: info.selectionText
    });
  }
});

// Welcome page
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html')
    });
  }
});