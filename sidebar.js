// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Debug logging
function debugLog(message, data = null) {
    console.log(`[Sidebar Debug] ${message}`, data || '');
}

debugLog("Sidebar script loaded", { browserAPI: !!browserAPI });

class PromptEnhancer {
    constructor() {
        this.email = '';
        this.redemptionCode = '';
        this.credits = 0;
        this.verified = false;
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
            // First try to import from web verification
            const importResult = await this.sendMessage({ action: 'importWebCredentials' });
            if (importResult.success) {
                this.showStatus('Credentials imported from web verification', 'success');
            }
            
            const codeResult = await this.sendMessage({ action: 'getRedemptionCode' });
            if (codeResult.success && codeResult.redemptionCode) {
                this.redemptionCode = codeResult.redemptionCode;
                this.verified = true;
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

            // Load credits from backend
            const creditsResult = await this.sendMessage({ action: 'checkCredits' });
            if (creditsResult.success) {
                this.credits = creditsResult.credits || 0;
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

        // Verification page link
        const verifyBtn = document.getElementById('openVerification');
        if (verifyBtn) {
            verifyBtn.addEventListener('click', () => this.openVerificationPage());
        }
    }

    updateCreditsDisplay() {
        const creditsEl = document.getElementById('creditsCount');
        const statusEl = document.getElementById('connectionStatus');
        
        if (creditsEl) {
            creditsEl.textContent = this.credits;
        }
        
        if (statusEl) {
            if (this.verified && this.redemptionCode) {
                statusEl.textContent = 'Verified';
                statusEl.className = 'status connected';
            } else {
                statusEl.textContent = 'Not Verified';
                statusEl.className = 'status disconnected';
            }
        }
    }

    openVerificationPage() {
        // Open the verification page
        const verifyUrl = browserAPI.runtime.getURL('verify.html');
        browserAPI.tabs.create({ url: verifyUrl });
    }

    async saveRedemptionCode() {
        const codeInput = document.getElementById('redemptionCode');

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
                this.verified = true;
                this.updateCreditsDisplay();
                this.showStatus('Redemption code saved successfully!', 'success');
            } else {
                this.showStatus('Invalid redemption code: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error saving redemption code:', error);
            this.showStatus('Error saving redemption code', 'error');
        }
    }

    async saveSettings() {
        // Get current form values
        this.settings.role = document.getElementById('role')?.value || '';
        this.settings.description = document.getElementById('description')?.value || 'detailed';
        this.settings.length = document.getElementById('length')?.value || 'medium';
        this.settings.format = document.getElementById('format')?.value || 'structured';
        this.settings.tone = document.getElementById('tone')?.value || 'helpful';

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

        // Check if user is verified
        if (!this.verified || !this.redemptionCode) {
            this.showStatus('Please verify your redemption code first', 'error');
            this.openVerificationPage();
            return;
        }

        // Check credits
        if (this.credits <= 0) {
            this.showStatus('No credits remaining. Contact support for more credits.', 'error');
            return;
        }

        try {
            if (enhanceBtn) {
                enhanceBtn.disabled = true;
                enhanceBtn.textContent = 'Enhancing...';
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
                
                // Update credits after successful enhancement
                this.credits = Math.max(0, this.credits - 1);
                this.updateCreditsDisplay();
                
                this.showStatus('Prompt enhanced successfully!', 'success');
            } else {
                this.showStatus('Enhancement failed: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error enhancing prompt:', error);
            this.showStatus('Error enhancing prompt', 'error');
        } finally {
            if (enhanceBtn) {
                enhanceBtn.disabled = false;
                enhanceBtn.textContent = 'Enhance Prompt';
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
            this.showStatus('Enhanced prompt copied to clipboard!', 'success');
        } catch (error) {
            // Fallback for older browsers
            enhancedPromptEl.select();
            document.execCommand('copy');
            this.showStatus('Enhanced prompt copied to clipboard!', 'success');
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
                this.showStatus('Enhanced prompt inserted into page!', 'success');
            }
        } catch (error) {
            console.error('Error inserting prompt:', error);
            this.showStatus('Error inserting prompt', 'error');
        }
    }

    updateUI() {
        this.updateCreditsDisplay();
    }

    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `status ${type}`;
            
            // Clear status after a few seconds for non-error messages
            if (type !== 'error') {
                setTimeout(() => {
                    statusEl.textContent = '';
                    statusEl.className = 'status';
                }, 3000);
            }
        }
        console.log(`Status (${type}): ${message}`);
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
}

// Initialize the enhancer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PromptEnhancer();
});
