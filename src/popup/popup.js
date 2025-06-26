class NetherPopup {
    constructor() {
        this.currentMode = 'system';
        this.currentDomain = '';
        this.systemPrefersDark = false;
        this.init();
    }

    async init() {
        this.detectSystemPreference();
        await this.getCurrentDomain();
        await this.loadSettings();
        this.bindEvents();
        this.updateUI();
        this.displayDomain();
    }

    detectSystemPreference() {
        this.systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    async getCurrentDomain() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url) {
                const url = new URL(tab.url);
                this.currentDomain = url.hostname;
            }
        } catch (error) {
            this.currentDomain = 'unknown';
        }
    }

    displayDomain() {
        const domainElement = document.getElementById('currentDomain');
        domainElement.textContent = this.currentDomain;
    }

    async loadSettings() {
        try {
            // Load global settings
            const globalResult = await chrome.storage.sync.get(['netherGlobalMode']);
            const globalMode = globalResult.netherGlobalMode;

            // Load per-site settings
            const siteKey = `nether_site_${this.currentDomain}`;
            const siteResult = await chrome.storage.sync.get([siteKey]);
            const siteMode = siteResult[siteKey];

            if (siteMode) {
                // Use site-specific setting
                this.currentMode = siteMode;
            } else if (globalMode) {
                // Use global setting
                this.currentMode = globalMode;
            } else {
                // Use system preference as default
                this.currentMode = this.systemPrefersDark ? 'dark' : 'light';
            }
        } catch (error) {
            this.currentMode = this.systemPrefersDark ? 'dark' : 'light';
        }
    }

    async saveSettings() {
        try {
            // Save per-site preference
            const siteKey = `nether_site_${this.currentDomain}`;
            await chrome.storage.sync.set({
                [siteKey]: this.currentMode,
                netherGlobalMode: this.currentMode // Also update global preference
            });
        } catch (error) {
            console.log('Could not save settings');
        }
    }

    bindEvents() {
        const toggleBtn = document.getElementById('modeToggle');
        
        toggleBtn.addEventListener('click', () => {
            this.toggleMode();
        });

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            this.systemPrefersDark = e.matches;
            // Only update if current mode is system default
            if (this.currentMode === 'system') {
                this.updateUI();
                this.applyMode();
            }
        });
    }

    toggleMode() {
        const toggleBtn = document.getElementById('modeToggle');
        toggleBtn.classList.add('switching');
        
        setTimeout(() => {
            toggleBtn.classList.remove('switching');
        }, 600);

        // Cycle through: light -> dark -> system -> light
        switch (this.currentMode) {
            case 'light':
                this.currentMode = 'dark';
                break;
            case 'dark':
                this.currentMode = 'system';
                break;
            case 'system':
                this.currentMode = 'light';
                break;
            default:
                this.currentMode = this.systemPrefersDark ? 'dark' : 'light';
        }
        
        this.updateUI();
        this.applyMode();
        this.saveSettings();
    }

    getEffectiveMode() {
        if (this.currentMode === 'system') {
            return this.systemPrefersDark ? 'dark' : 'light';
        }
        return this.currentMode;
    }

    updateUI() {
        const toggleBtn = document.getElementById('modeToggle');
        const modeIcon = toggleBtn.querySelector('.mode-icon');
        const modeLabel = document.getElementById('modeLabel');
        const modeStatus = document.getElementById('modeStatus');

        const effectiveMode = this.getEffectiveMode();
        toggleBtn.dataset.mode = effectiveMode;

        // Update icon and label based on effective mode
        if (effectiveMode === 'dark') {
            modeIcon.src = '../../assets/images/moon.svg';
            modeIcon.alt = 'Dark Mode';
            modeLabel.textContent = 'Dark Mode';
        } else {
            modeIcon.src = '../../assets/images/sun.svg';
            modeIcon.alt = 'Light Mode';
            modeLabel.textContent = 'Light Mode';
        }

        // Update status based on current mode setting
        switch (this.currentMode) {
            case 'system':
                modeStatus.textContent = 'System Default';
                break;
            case 'light':
                modeStatus.textContent = 'Always Light';
                break;
            case 'dark':
                modeStatus.textContent = 'Always Dark';
                break;
        }
    }

    async applyMode() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab || !tab.id) return;

            const effectiveMode = this.getEffectiveMode();

            await chrome.tabs.sendMessage(tab.id, {
                action: 'applyMode',
                mode: effectiveMode,
                domain: this.currentDomain
            });

        } catch (error) {
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['src/content/content.js']
                });
                
                setTimeout(async () => {
                    try {
                        const effectiveMode = this.getEffectiveMode();
                        await chrome.tabs.sendMessage(tab.id, {
                            action: 'applyMode',
                            mode: effectiveMode,
                            domain: this.currentDomain
                        });
                    } catch (retryError) {
                        console.log('Failed after injection');
                    }
                }, 100);
                
            } catch (injectionError) {
                console.log('Could not inject script');
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NetherPopup();
});
