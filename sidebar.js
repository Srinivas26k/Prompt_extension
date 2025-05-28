// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

class PromptEnhancer {
    constructor() {
        this.apiKey = '';
        this.settings = {
            role: '',
            description: 'detailed',
            length: 'medium',
            format: 'structured',
            tone: 'helpful'
        };
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.updateUI();
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

        // Prompt enhancement
        const enhancePromptBtn = document.getElementById('enhancePrompt');
        const copyPromptBtn = document.getElementById('copyPrompt');
        const insertPromptBtn = document.getElementById('insertPrompt');
        
        if (enhancePromptBtn) {
            enhancePromptBtn.addEventListener('click', () => this.enhancePrompt());
        }
        if (copyPromptBtn) {
            copyPromptBtn.addEventListener('click', () => this.copyPrompt());
        }
        if (insertPromptBtn) {
            insertPromptBtn.addEventListener('click', () => this.insertPrompt());
        }

        // Auto-save settings on change
        ['role', 'description', 'length', 'format', 'tone'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.autoSaveSettings());
            }
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
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'microsoft/phi-4-reasoning-plus:free',
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
        const enhanceBtn = document.getElementById('enhancePrompt');
        
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
            this.showStatus('Please set your OpenRouter API key first', 'error');
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
                prompt: originalPrompt
            });

            if (result.success) {
                const enhancedPromptEl = document.getElementById('enhancedPrompt');
                if (enhancedPromptEl) {
                    enhancedPromptEl.value = result.enhancedPrompt;
                }
                this.showStatus('Prompt enhanced successfully!', 'success');
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

    async callOpenRouter(originalPrompt) {
        const systemPrompt = this.buildSystemPrompt();
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': 'https://promptenhancer.ai',
                'X-Title': 'AI Prompt Enhancer'
            },
            body: JSON.stringify({
                model: 'microsoft/phi-4-reasoning-plus:free',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Please enhance this prompt: "${originalPrompt}"` }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    buildSystemPrompt() {
        const roleInstruction = this.settings.role ? `Act as a ${this.settings.role}.` : '';
        
        const descriptionStyles = {
            detailed: 'detailed and comprehensive',
            creative: 'creative and engaging',
            professional: 'professional and formal',
            casual: 'casual and conversational',
            technical: 'technical and precise'
        };

        const lengthStyles = {
            short: 'Keep responses concise (1-2 paragraphs)',
            medium: 'Provide medium-length responses (3-5 paragraphs)',
            long: 'Give detailed responses (6+ paragraphs)',
            comprehensive: 'Provide comprehensive analysis with extensive detail'
        };

        const formatStyles = {
            structured: 'Structure the response with clear headings and sections',
            bullets: 'Format the response using bullet points',
            numbered: 'Use numbered lists to organize information',
            paragraph: 'Write in paragraph form with smooth flow'
        };

        const toneStyles = {
            helpful: 'helpful and informative',
            analytical: 'analytical and critical',
            creative: 'creative and innovative',
            persuasive: 'persuasive and convincing',
            educational: 'educational and explanatory'
        };

        return `You are an expert prompt engineer. Your task is to transform user prompts into perfect, role-based prompts that will get the best results from AI systems.

${roleInstruction}

Enhancement Guidelines:
- Make the prompt ${descriptionStyles[this.settings.description]}
- ${lengthStyles[this.settings.length]}
- ${formatStyles[this.settings.format]}
- Use a ${toneStyles[this.settings.tone]} tone
- Add context and specificity to make the prompt more effective
- Include relevant examples or frameworks when appropriate
- Make the instructions clear and actionable
- Ensure the enhanced prompt will produce high-quality, relevant responses

Transform the user's basic prompt into a sophisticated, role-based prompt that an AI system can follow effectively. Return only the enhanced prompt, nothing else.`;
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

    async insertPrompt() {
        const enhancedPromptEl = document.getElementById('enhancedPrompt');
        if (!enhancedPromptEl || !enhancedPromptEl.value) {
            this.showStatus('No enhanced prompt to insert', 'error');
            return;
        }

        try {
            const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
            if (tabs[0]) {
                await browserAPI.tabs.sendMessage(tabs[0].id, {
                    action: 'insertPrompt',
                    prompt: enhancedPromptEl.value
                });
                this.showStatus('Prompt inserted successfully!', 'success');
            }
        } catch (error) {
            console.error('Insert error:', error);
            this.showStatus('Error inserting prompt', 'error');
        }
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

    showStatus(message, type = 'info') {
        // Create or update status element
        let statusEl = document.getElementById('globalStatus');
        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.id = 'globalStatus';
            statusEl.className = 'status-message';
            const container = document.querySelector('.enhancer-container') || document.body;
            container.appendChild(statusEl);
        }

        statusEl.textContent = message;
        statusEl.className = `status-message ${type}`;
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                if (statusEl.textContent === message) {
                    statusEl.textContent = '';
                    statusEl.className = 'status-message';
                }
            }, 3000);
        }
    }

    updateUI() {
        // Update role display if available
        const roleDisplay = document.getElementById('currentRole');
        if (roleDisplay) {
            roleDisplay.textContent = this.settings.role || 'No specific role';
        }

        // Update API status
        const apiStatusEl = document.getElementById('apiStatus');
        if (apiStatusEl) {
            apiStatusEl.textContent = this.apiKey ? 'Connected' : 'Not configured';
            apiStatusEl.className = this.apiKey ? 'status connected' : 'status disconnected';
        }
    }
}

// Initialize the extension when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PromptEnhancer();
});