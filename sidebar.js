// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Debug logging
function debugLog(message, data = null) {
    console.log(`[Sidebar Debug] ${message}`, data || '');
}

debugLog("Sidebar script loaded", { browserAPI: !!browserAPI });

class PromptEnhancer {
    constructor() {
        this.redemptionCode = '';
        this.credits = 0;
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
            const codeResult = await this.sendMessage({ action: 'getRedemptionCode' });
            if (codeResult.success && codeResult.redemptionCode) {
                this.redemptionCode = codeResult.redemptionCode;
                const codeInput = document.getElementById('redemptionCode');
                if (codeInput) {
                    codeInput.value = this.redemptionCode;
                }
            }

            const settingsResult = await this.sendMessage({ action: 'getSettings' });
            if (settingsResult.success && settingsResult.settings) {
                this.settings = { ...this.settings, ...settingsResult.settings };
                this.populateSettingsForm();
            }

            // Load credits
            const statsResult = await this.sendMessage({ action: 'getStats' });
            if (statsResult.success && statsResult.stats) {
                this.credits = statsResult.stats.credits || 0;
                this.updateCreditsDisplay();
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
        // Redemption Code management
        const saveCodeBtn = document.getElementById('saveCode');
        const redemptionCodeInput = document.getElementById('redemptionCode');
        
        if (saveCodeBtn) {
            saveCodeBtn.addEventListener('click', () => this.saveRedemptionCode());
        }
        if (redemptionCodeInput) {
            redemptionCodeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.saveRedemptionCode();
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

    async saveRedemptionCode() {
        const codeInput = document.getElementById('redemptionCode');
        const statusEl = document.getElementById('codeStatus');

        if (!codeInput) {
            console.error('Redemption code input not found');
            return;
        }

        const code = codeInput.value.trim();

        if (!code) {
            this.showStatus('Please enter a redemption code', 'error');
            return;
        }

        try {
            // Validate and save the redemption code
            this.showStatus('Validating redemption code...', 'loading');
            
            const result = await this.sendMessage({
                action: 'saveRedemptionCode',
                code: code
            });
            
            if (result.success) {
                this.redemptionCode = code;
                this.credits = result.credits || 0;
                this.showStatus('Redemption code saved successfully!', 'success');
                this.updateCreditsDisplay();
            } else {
                this.showStatus('Invalid redemption code: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error saving redemption code:', error);
            this.showStatus('Error validating redemption code', 'error');
        }
    }

    updateCreditsDisplay() {
        const creditsEl = document.getElementById('creditsDisplay');
        if (creditsEl) {
            creditsEl.textContent = `Credits: ${this.credits}`;
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

        if (!this.redemptionCode) {
            this.showStatus('Please set your redemption code first', 'error');
            return;
        }

        if (this.credits <= 0) {
            this.showStatus('Insufficient credits. Please contact support for more credits.', 'error');
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
                
                // Update credits if returned
                if (result.credits_remaining !== undefined) {
                    this.credits = result.credits_remaining;
                    this.updateCreditsDisplay();
                }
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

    updateUI() {
        // Update role display if available
        const roleDisplay = document.getElementById('currentRole');
        if (roleDisplay) {
            roleDisplay.textContent = this.settings.role || 'No specific role';
        }

        // Update redemption code status
        const codeStatusEl = document.getElementById('codeStatus');
        if (codeStatusEl) {
            codeStatusEl.textContent = this.redemptionCode ? 'Code configured' : 'Not configured';
            codeStatusEl.className = this.redemptionCode ? 'status connected' : 'status disconnected';
        }

        // Update credits display
        this.updateCreditsDisplay();
    }
}

// Initialize the extension when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PromptEnhancer();
});