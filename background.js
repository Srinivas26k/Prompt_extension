// Background script for AI Prompt Enhancer
console.log("AI Prompt Enhancer background script loaded");

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

// Enhanced prompt template - structured and well-formatted
const PROMPT_TEMPLATE = `# ROLE
You are an expert prompt engineer specializing in creating highly effective, role-based prompts that maximize AI response quality and accuracy.

# GOAL
Transform the provided basic prompt into a comprehensive, structured prompt that follows best practices for AI interaction. The enhanced prompt should be clear, detailed, and designed to produce superior results compared to the original.

# ENHANCEMENT PARAMETERS
- **Target Role**: {{ROLE}}
- **Description Level**: {{DESCRIPTION}}
- **Output Length**: {{LENGTH}}
- **Format Style**: {{FORMAT}}
- **Response Tone**: {{TONE}}

# ORIGINAL PROMPT TO ENHANCE
{{ORIGINAL_PROMPT}}

# TASK REQUIREMENTS
Create an enhanced prompt that incorporates the following elements:

## 1. Clear Role Definition
Establish a specific role or persona for the AI that aligns with the task requirements. This should be detailed enough to provide proper context and expertise framing.

## 2. Comprehensive Context
Provide all necessary background information, constraints, and relevant details that would help the AI understand the full scope of the request.

## 3. Specific Instructions
Break down the task into clear, actionable steps or requirements. Be explicit about what should be included and what should be avoided.

## 4. Output Format Specification
Define exactly how the response should be structured, formatted, and presented. Include any specific formatting requirements, sections, or organizational patterns.

## 5. Quality Guidelines
Specify the desired tone, style, complexity level, and any other qualitative aspects that will ensure the output meets expectations.

# RETURN FORMAT
Provide only the enhanced prompt as your response. Do not include explanations, meta-commentary, or additional text. The enhanced prompt should be ready to use immediately and follow the formatting style specified in the parameters above.

# IMPORTANT GUIDELINES
- Make the enhanced prompt significantly more detailed and specific than the original
- Ensure the prompt is self-contained and doesn't require additional context
- Structure the enhanced prompt with clear sections and formatting for readability
- Include specific examples or constraints when they would improve clarity
- Optimize for the specified tone, length, and format requirements`;

// Storage operations
function saveApiKey(apiKey) {
  return new Promise((resolve, reject) => {
    debugLog("Attempting to save API key", { keyLength: apiKey?.length });
    
    browserAPI.storage.local.set({ [STORAGE_KEYS.API_KEY]: apiKey }, () => {
      if (browserAPI.runtime.lastError) {
        debugLog("API key save failed", browserAPI.runtime.lastError);
        reject(new Error(`Failed to save API key: ${browserAPI.runtime.lastError.message}`));
      } else {
        debugLog('API key saved successfully to local storage');
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
    
    browserAPI.storage.local.get([STORAGE_KEYS.API_KEY, STORAGE_KEYS.SETTINGS], (result) => {
      if (browserAPI.runtime.lastError) {
        debugLog("Data retrieval failed", browserAPI.runtime.lastError);
        reject(new Error(`Failed to get stored data: ${browserAPI.runtime.lastError.message}`));
      } else {
        debugLog('Retrieved stored data:', { 
          hasApiKey: !!result[STORAGE_KEYS.API_KEY], 
          hasSettings: !!result[STORAGE_KEYS.SETTINGS],
          apiKeyPreview: result[STORAGE_KEYS.API_KEY] ? result[STORAGE_KEYS.API_KEY].substring(0, 8) + '...' : 'none'
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
    debugLog("Save API key handler called", { hasApiKey: !!request.apiKey });
    
    if (!request.apiKey) {
      throw new Error('API key cannot be empty');
    }
    
    await saveApiKey(request.apiKey);
    debugLog("API key save successful");
    sendResponse({ success: true, message: 'API key saved successfully' });
  } catch (error) {
    debugLog('Save API key error:', error);
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

async function enhancePrompt(originalPrompt, provider = 'openrouter', model = '') {
  try {
    debugLog('Enhancement request received:', { 
      promptLength: originalPrompt?.length, 
      promptPreview: originalPrompt?.substring(0, 50) + '...',
      provider: provider,
      model: model
    });
    
    if (!originalPrompt || !originalPrompt.trim()) {
      throw new Error('Please enter a prompt to enhance');
    }
    
    const { apiKey, settings } = await getStoredData();
    debugLog('Retrieved data for enhancement:', { 
      hasApiKey: !!apiKey,
      apiKeyPreview: apiKey ? apiKey.substring(0, 8) + '...' : 'none',
      settings,
      provider,
      model
    });
    
    if (!apiKey) {
      throw new Error(`${getProviderName(provider)} API key not configured. Please set your API key in the extension settings.`);
    }
    
    const currentSettings = { ...DEFAULT_SETTINGS, ...settings };
    debugLog('Using settings for enhancement:', currentSettings);
    
    // Use the appropriate model for the provider
    const selectedModel = model || getDefaultModelForProvider(provider);
    
    // Call the appropriate API based on provider
    const enhancedPrompt = await callProviderAPI(provider, selectedModel, originalPrompt, currentSettings, apiKey);
    
    // Update stats
    await updateStats();
    debugLog('Prompt enhanced successfully', { 
      enhancedLength: enhancedPrompt.length,
      enhancedPreview: enhancedPrompt.substring(0, 100) + '...',
      provider,
      model: selectedModel
    });

    return enhancedPrompt;
  } catch (error) {
    debugLog('Enhancement error:', error);
    throw error;
  }
}

// Provider configurations and helper functions
function getProviderName(provider) {
  const names = {
    openrouter: 'OpenRouter',
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    groq: 'Groq',
    perplexity: 'Perplexity'
  };
  return names[provider] || 'OpenRouter';
}

function getDefaultModelForProvider(provider) {
  const defaults = {
    openrouter: 'microsoft/phi-4-reasoning-plus:free',
    openai: 'gpt-4o-mini',
    anthropic: 'claude-3-haiku-20240307',
    groq: 'llama-3.1-8b-instant',
    perplexity: 'llama-3.1-sonar-small-128k-online'
  };
  return defaults[provider] || defaults.openrouter;
}

async function callProviderAPI(provider, model, originalPrompt, settings, apiKey) {
  const systemPrompt = buildSystemPrompt(settings, originalPrompt);
  
  switch (provider) {
    case 'openrouter':
      return await callOpenRouterAPI(model, systemPrompt, apiKey);
    case 'openai':
      return await callOpenAIAPI(model, systemPrompt, apiKey);
    case 'anthropic':
      return await callAnthropicAPI(model, systemPrompt, apiKey);
    case 'groq':
      return await callGroqAPI(model, systemPrompt, apiKey);
    case 'perplexity':
      return await callPerplexityAPI(model, systemPrompt, apiKey);
    default:
      return await callOpenRouterAPI(model, systemPrompt, apiKey);
  }
}

function buildSystemPrompt(settings, originalPrompt) {
  return PROMPT_TEMPLATE
    .replace('{{ROLE}}', settings.role || 'AI Assistant')
    .replace('{{DESCRIPTION}}', settings.description)
    .replace('{{LENGTH}}', settings.length)
    .replace('{{FORMAT}}', settings.format)
    .replace('{{TONE}}', settings.tone)
    .replace('{{ORIGINAL_PROMPT}}', originalPrompt);
}

async function callOpenRouterAPI(model, systemPrompt, apiKey) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-Title': 'AI Prompt Enhancer',
      'HTTP-Referer': 'https://ai-prompt-enhancer.local'
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: systemPrompt }],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  return await handleAPIResponse(response, 'OpenRouter');
}

async function callOpenAIAPI(model, systemPrompt, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: systemPrompt }],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  return await handleAPIResponse(response, 'OpenAI');
}

async function callAnthropicAPI(model, systemPrompt, apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 1000,
      messages: [{ role: 'user', content: systemPrompt }]
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Anthropic API Error: ${response.status} - ${data.error?.message || 'Unknown error'}`);
  }

  if (!data.content?.[0]?.text) {
    throw new Error('Invalid response format from Anthropic API');
  }

  return data.content[0].text.trim();
}

async function callGroqAPI(model, systemPrompt, apiKey) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: systemPrompt }],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  return await handleAPIResponse(response, 'Groq');
}

async function callPerplexityAPI(model, systemPrompt, apiKey) {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: systemPrompt }],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  return await handleAPIResponse(response, 'Perplexity');
}

async function handleAPIResponse(response, providerName) {
  debugLog(`${providerName} API response status:`, response.status);

  if (!response.ok) {
    const errorText = await response.text();
    debugLog(`${providerName} API Error:`, { status: response.status, error: errorText });
    
    if (response.status === 401) {
      throw new Error(`Invalid API key. Please check your ${providerName} API key.`);
    } else if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (response.status === 402) {
      throw new Error(`Insufficient credits. Please add credits to your ${providerName} account.`);
    } else {
      throw new Error(`${providerName} API Error: ${response.status} - ${errorText || 'Unknown error'}`);
    }
  }

  const data = await response.json();
  debugLog(`${providerName} API response received:`, { 
    hasChoices: !!data.choices,
    choicesLength: data.choices?.length,
    hasContent: !!data.choices?.[0]?.message?.content
  });
  
  if (!data.choices?.[0]?.message?.content) {
    debugLog(`Invalid ${providerName} API response:`, data);
    throw new Error(`Invalid response format from ${providerName} API`);
  }

  const enhancedPrompt = data.choices[0].message.content.trim();
  if (!enhancedPrompt) {
    throw new Error(`Empty response from ${providerName} API`);
  }

  return enhancedPrompt;
}

// Message listener
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    debugLog('Message received:', { action: request.action, sender: sender.tab?.url });
    
    switch (request.action) {
      case 'saveApiKey':
        handleSaveApiKey(request, sendResponse);
        break;
        
      case 'saveSettings':
        handleSaveSettings(request, sendResponse);
        break;
        
      case 'enhancePrompt':
        enhancePrompt(request.prompt, request.provider, request.model)
          .then(enhancedPrompt => {
            debugLog('Enhancement successful, sending response');
            sendResponse({ success: true, enhancedPrompt });
          })
          .catch(error => {
            debugLog('Enhancement failed:', error);
            sendResponse({ success: false, error: error.message });
          });
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

      case 'getApiKey':
        getStoredData()
          .then(data => {
            debugLog('API key retrieved successfully', { hasKey: !!data.apiKey });
            sendResponse({ success: true, apiKey: data.apiKey });
          })
          .catch(error => {
            debugLog('Get API key error:', error);
            sendResponse({ success: false, error: error.message });
          });
        break;

      case 'getStats':
        browserAPI.storage.local.get([STORAGE_KEYS.STATS], (result) => {
          const stats = result[STORAGE_KEYS.STATS] || { total: 0, today: 0 };
          debugLog('Stats retrieved:', stats);
          sendResponse({ success: true, stats });
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

console.log('AI Prompt Enhancer initialized successfully');
debugLog("Background script fully loaded and ready");