class NetherPopup {
    constructor() {
        this.currentMode = 'dark';
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.bindEvents();
        this.updateUI();
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['netherMode']);
            this.currentMode = result.netherMode || 'dark';
        } catch (error) {
            this.currentMode = 'dark';
        }
    }

    async saveSettings() {
        try {
            await chrome.storage.sync.set({
                netherMode: this.currentMode
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
    }

    toggleMode() {
        const toggleBtn = document.getElementById('modeToggle');
        toggleBtn.classList.add('switching');
        
        setTimeout(() => {
            toggleBtn.classList.remove('switching');
        }, 600);

        this.currentMode = this.currentMode === 'dark' ? 'light' : 'dark';
        
        this.updateUI();
        this.applyMode();
        this.saveSettings();
    }

    updateUI() {
        const toggleBtn = document.getElementById('modeToggle');
        const modeIcon = toggleBtn.querySelector('.mode-icon');
        const modeLabel = document.getElementById('modeLabel');

        toggleBtn.dataset.mode = this.currentMode;

        if (this.currentMode === 'dark') {
            modeIcon.src = '../../assets/images/moon.svg';
            modeIcon.alt = 'Dark Mode';
            modeLabel.textContent = 'Dark Mode';
        } else {
            modeIcon.src = '../../assets/images/sun.svg';
            modeIcon.alt = 'Light Mode';
            modeLabel.textContent = 'Light Mode';
        }
    }

    async applyMode() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab || !tab.id) return;

            await chrome.tabs.sendMessage(tab.id, {
                action: 'applyMode',
                mode: this.currentMode
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
                        await chrome.tabs.sendMessage(tab.id, {
                            action: 'applyMode',
                            mode: this.currentMode
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
