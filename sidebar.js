// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Debug logging
function debugLog(message, data = null) {
    console.log(`[Sidebar Debug] ${message}`, data || '');
}

debugLog("Sidebar script loaded", { browserAPI: !!browserAPI });

class PromptEnhancer {
    constructor() {
        this.apiKey = '';
        this.currentProvider = 'openrouter';
        this.currentModel = '';
        this.settings = {
            role: '',
            description: 'detailed',
            length: 'medium',
            format: 'structured',
            tone: 'helpful'
        };
        this.providerModels = {
            openrouter: [
                { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku' },
                { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet' },
                { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' },
                { id: 'openai/gpt-4o', name: 'GPT-4o' },
                { id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5' }
            ],
            openai: [
                { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
                { id: 'gpt-4o', name: 'GPT-4o' },
                { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
            ],
            anthropic: [
                { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
                { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
                { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' }
            ],
            groq: [
                { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' },
                { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B' },
                { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' }
            ],
            perplexity: [
                { id: 'llama-3.1-sonar-large-128k-online', name: 'Sonar Large (Online)' },
                { id: 'llama-3.1-sonar-small-128k-online', name: 'Sonar Small (Online)' },
                { id: 'llama-3.1-8b-instruct', name: 'Llama 3.1 8B Instruct' }
            ]
        };
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.updateUI();
        this.loadStats();
        this.initializeProviders();
        this.detectPromptFromPage();
    }

    async loadSettings() {
        try {
            const apiKeyResult = await this.sendMessage({ action: 'getApiKey' });
            if (apiKeyResult.success && apiKeyResult.apiKey) {
                this.apiKey = apiKeyResult.apiKey;
                const apiKeyInput = document.getElementById('apiKey');
                if (apiKeyInput) {
                    apiKeyInput.value = this.apiKey;
                }
            }

            const settingsResult = await this.sendMessage({ action: 'getSettings' });
            if (settingsResult.success && settingsResult.settings) {
                this.settings = { ...this.settings, ...settingsResult.settings };
                this.populateSettingsForm();
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            this.showStatus('Error loading settings', 'error');
        }
    }

    populateSettingsForm() {
        const fields = ['role', 'description', 'length', 'format', 'tone'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element && this.settings[field] !== undefined) {
                element.value = this.settings[field];
            }
        });
    }

    initializeProviders() {
        this.onProviderChange(); // Initialize with default provider
    }

    onProviderChange() {
        const providerSelect = document.getElementById('provider');
        const modelSelect = document.getElementById('model');
        
        if (!providerSelect || !modelSelect) return;
        
        this.currentProvider = providerSelect.value;
        const models = this.providerModels[this.currentProvider] || [];
        
        // Clear and populate model dropdown
        modelSelect.innerHTML = '';
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            modelSelect.appendChild(option);
        });
        
        // Set first model as default
        if (models.length > 0) {
            this.currentModel = models[0].id;
            modelSelect.value = this.currentModel;
        }
        
        // Update provider-specific help links visibility
        this.updateProviderLinks();
    }

    updateProviderLinks() {
        const allLinks = document.querySelectorAll('.link-group a');
        allLinks.forEach(link => link.style.display = 'none');
        
        const currentLink = document.getElementById(`link-${this.currentProvider}`);
        if (currentLink) {
            currentLink.style.display = 'inline-block';
        }
    }

    async loadStats() {
        try {
            const result = await this.sendMessage({ action: 'getStats' });
            if (result.success && result.stats) {
                this.updateStatsDisplay(result.stats);
            }
        } catch (error) {
            debugLog('Error loading stats:', error);
        }
    }

    updateStatsDisplay(stats) {
        const totalEl = document.getElementById('totalEnhancements');
        const todayEl = document.getElementById('todayEnhancements');
        
        if (totalEl) totalEl.textContent = stats.total || 0;
        if (todayEl) todayEl.textContent = stats.today || 0;
    }

    clearPrompts() {
        const originalPromptEl = document.getElementById('originalPrompt');
        const enhancedPromptEl = document.getElementById('enhancedPrompt');
        const copyBtn = document.getElementById('copyBtn');
        
        if (originalPromptEl) originalPromptEl.value = '';
        if (enhancedPromptEl) enhancedPromptEl.value = '';
        if (copyBtn) copyBtn.style.display = 'none';
        
        this.showStatus('Prompts cleared', 'success');
    }

    setupEventListeners() {
        // API Key management
        const saveKeyBtn = document.getElementById('saveKey');
        const apiKeyInput = document.getElementById('apiKey');
        
        if (saveKeyBtn) {
            saveKeyBtn.addEventListener('click', () => this.saveApiKey());
        }
        if (apiKeyInput) {
            apiKeyInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.saveApiKey();
            });
        }

        // Settings management
        const saveSettingsBtn = document.getElementById('saveSettings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        }

        // Prompt enhancement - Fix ID mismatch
        const enhancePromptBtn = document.getElementById('enhanceBtn');
        const copyPromptBtn = document.getElementById('copyBtn');
        const clearBtn = document.getElementById('clearBtn');
        
        if (enhancePromptBtn) {
            enhancePromptBtn.addEventListener('click', () => this.enhancePrompt());
        }
        if (copyPromptBtn) {
            copyPromptBtn.addEventListener('click', () => this.copyPrompt());
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearPrompts());
        }

        // Provider selection
        const providerSelect = document.getElementById('provider');
        const modelSelect = document.getElementById('model');
        
        if (providerSelect) {
            providerSelect.addEventListener('change', () => this.onProviderChange());
        }
        if (modelSelect) {
            modelSelect.addEventListener('change', () => {
                this.currentModel = modelSelect.value;
            });
        }

        // Auto-save settings on change
        ['role', 'description', 'length', 'format', 'tone'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.autoSaveSettings());
            }
        });
    }

    async sendMessage(message) {
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

    async saveApiKey() {
        const apiKeyInput = document.getElementById('apiKey');
        const statusEl = document.getElementById('keyStatus');

        if (!apiKeyInput) {
            console.error('API key input not found');
            return;
        }

        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            this.showStatus('Please enter an API key', 'error');
            return;
        }

        try {
            // Test the API key
            this.showStatus('Validating API key...', 'loading');
            
            const isValid = await this.testApiKey(apiKey);
            if (isValid) {
                const result = await this.sendMessage({
                    action: 'saveApiKey',
                    apiKey: apiKey
                });
                
                if (result.success) {
                    this.apiKey = apiKey;
                    this.showStatus('API key saved successfully!', 'success');
                } else {
                    this.showStatus('Failed to save API key: ' + result.error, 'error');
                }
            } else {
                this.showStatus('Invalid API key. Please check and try again.', 'error');
            }
        } catch (error) {
            console.error('Error saving API key:', error);
            this.showStatus('Error validating API key', 'error');
        }
    }

    async testApiKey(apiKey) {
        try {
            const provider = this.currentProvider;
            const model = this.currentModel || this.getDefaultModel(provider);
            
            const config = this.getProviderConfig(provider, apiKey, model);
            
            const response = await fetch(config.url, {
                method: 'POST',
                headers: config.headers,
                body: JSON.stringify({
                    ...config.body,
                    messages: [{ role: 'user', content: 'Test' }],
                    max_tokens: 1
                })
            });

            return response.status !== 401;
        } catch (error) {
            console.error('API key test error:', error);
            return false;
        }
    }

    getDefaultModel(provider) {
        const models = this.providerModels[provider];
        return models && models.length > 0 ? models[0].id : '';
    }

    getProviderConfig(provider, apiKey, model) {
        const configs = {
            openrouter: {
                url: 'https://openrouter.ai/api/v1/chat/completions',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'X-Title': 'AI Prompt Enhancer',
                    'HTTP-Referer': 'https://ai-prompt-enhancer.local'
                },
                body: { model: model }
            },
            openai: {
                url: 'https://api.openai.com/v1/chat/completions',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: { model: model }
            },
            anthropic: {
                url: 'https://api.anthropic.com/v1/messages',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: { model: model }
            },
            groq: {
                url: 'https://api.groq.com/openai/v1/chat/completions',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: { model: model }
            },
            perplexity: {
                url: 'https://api.perplexity.ai/chat/completions',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: { model: model }
            }
        };
        
        return configs[provider] || configs.openrouter;
    }

    async saveSettings() {
        const roleInput = document.getElementById('role');
        const descInput = document.getElementById('description');
        const lengthInput = document.getElementById('length');
        const formatInput = document.getElementById('format');
        const toneInput = document.getElementById('tone');

        if (roleInput) this.settings.role = roleInput.value.trim();
        if (descInput) this.settings.description = descInput.value;
        if (lengthInput) this.settings.length = lengthInput.value;
        if (formatInput) this.settings.format = formatInput.value;
        if (toneInput) this.settings.tone = toneInput.value;

        try {
            const result = await this.sendMessage({
                action: 'saveSettings',
                settings: this.settings
            });
            
            if (result.success) {
                this.showStatus('Settings saved!', 'success');
            } else {
                this.showStatus('Failed to save settings: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showStatus('Error saving settings', 'error');
        }
    }

    async autoSaveSettings() {
        setTimeout(() => this.saveSettings(), 500);
    }

    async detectPromptFromPage() {
        try {
            const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
            if (tabs[0]) {
                const response = await browserAPI.tabs.sendMessage(tabs[0].id, { action: 'getPrompt' });
                if (response && response.prompt) {
                    const originalPromptEl = document.getElementById('originalPrompt');
                    if (originalPromptEl) {
                        originalPromptEl.value = response.prompt;
                    }
                }
            }
        } catch (error) {
            console.error('Error detecting prompt:', error);
        }
    }

    async enhancePrompt() {
        const originalPromptEl = document.getElementById('originalPrompt');
        const enhanceBtn = document.getElementById('enhanceBtn');
        
        if (!originalPromptEl) {
            this.showStatus('Original prompt input not found', 'error');
            return;
        }

        const originalPrompt = originalPromptEl.value.trim();

        if (!originalPrompt) {
            this.showStatus('Please enter a prompt to enhance', 'error');
            return;
        }

        if (!this.apiKey) {
            this.showStatus('Please set your API key first', 'error');
            return;
        }

        try {
            if (enhanceBtn) {
                enhanceBtn.disabled = true;
                enhanceBtn.innerHTML = '<span class="loading-spinner"></span>Enhancing...';
            }
            this.showStatus('Enhancing your prompt...', 'loading');

            const result = await this.sendMessage({
                action: 'enhancePrompt',
                prompt: originalPrompt,
                provider: this.currentProvider,
                model: this.currentModel
            });

            if (result.success) {
                const enhancedPromptEl = document.getElementById('enhancedPrompt');
                const copyBtn = document.getElementById('copyBtn');
                
                if (enhancedPromptEl) {
                    enhancedPromptEl.value = result.enhancedPrompt;
                }
                if (copyBtn) {
                    copyBtn.style.display = 'inline-block';
                }
                
                this.showStatus('Prompt enhanced successfully!', 'success');
                
                // Refresh stats after successful enhancement
                setTimeout(() => this.loadStats(), 500);
            } else {
                this.showStatus('Error: ' + result.error, 'error');
            }

        } catch (error) {
            console.error('Enhancement error:', error);
            this.showStatus('Error enhancing prompt. Please try again.', 'error');
        } finally {
            if (enhanceBtn) {
                enhanceBtn.disabled = false;
                enhanceBtn.innerHTML = 'Enhance Prompt';
            }
        }
    }

    async copyPrompt() {
        const enhancedPromptEl = document.getElementById('enhancedPrompt');
        if (!enhancedPromptEl || !enhancedPromptEl.value) {
            this.showStatus('No enhanced prompt to copy', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(enhancedPromptEl.value);
            this.showStatus('Prompt copied to clipboard!', 'success');
        } catch (error) {
            console.error('Copy error:', error);
            // Fallback for older browsers
            enhancedPromptEl.select();
            document.execCommand('copy');
            this.showStatus('Prompt copied to clipboard!', 'success');
        }
    }

    updateUI() {
        // Update API status
        const apiStatusEl = document.getElementById('apiStatus');
        if (apiStatusEl) {
            apiStatusEl.textContent = this.apiKey ? 'Connected' : 'Not configured';
            apiStatusEl.className = this.apiKey ? 'status connected' : 'status disconnected';
        }

        // Update provider display
        const providerSelect = document.getElementById('provider');
        if (providerSelect && this.currentProvider) {
            providerSelect.value = this.currentProvider;
            this.onProviderChange();
        }
    }
}

// Initialize the extension when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PromptEnhancer();
});