(function() {
    'use strict';
    
    if (window.netherContentScript) {
        return;
    }

    class NetherContentScript {
        constructor() {
            this.styleId = 'nether-styles';
            this.currentMode = 'dark';
            this.init();
        }

        async init() {
            await this.loadSettings();
            this.setupMessageListener();
            this.applyMode(this.currentMode);
        }

        async loadSettings() {
            try {
                const result = await chrome.storage.sync.get(['netherMode']);
                this.currentMode = result.netherMode || 'dark';
            } catch (error) {
                this.currentMode = 'dark';
            }
        }

        setupMessageListener() {
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                if (message.action === 'applyMode') {
                    this.applyMode(message.mode);
                    sendResponse({ success: true });
                    return true;
                }
            });
        }

        applyMode(mode) {
            this.currentMode = mode;
            this.injectCSS(mode);
        }

        injectCSS(mode) {
            const existingStyle = document.getElementById(this.styleId);
            if (existingStyle) {
                existingStyle.remove();
            }

            if (mode === 'light') return;

            const style = document.createElement('style');
            style.id = this.styleId;
            
            style.textContent = `
                body {
                    background-color: #1a1a1a !important;
                }

                [style*="background-color: rgb(255, 255, 255)"],
                [style*="background-color: white"],
                [style*="background-color: #ffffff"],
                [style*="background-color: #fff"] {
                    background-color: #2d2d2d !important;
                }

                [style*="color: rgb(0, 0, 0)"],
                [style*="color: black"],
                [style*="color: #000000"],
                [style*="color: #000"] {
                    color: #e0e0e0 !important;
                }
            `;

            document.head?.appendChild(style) || document.documentElement?.appendChild(style);
        }
    }

    window.netherContentScript = new NetherContentScript();

})();class NetherContentScript {
    constructor() {
        this.overlayId = 'nether-mode-overlay';
        this.currentMode = 'light';
        this.intensity = 0.8;
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.createOverlay();
        this.applyCurrentMode();
        this.setupMessageListener();
        
        // Apply saved mode on page load
        if (this.currentMode !== 'light') {
            this.applyMode(this.currentMode, this.intensity);
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['netherMode', 'netherIntensity']);
            this.currentMode = result.netherMode || 'light';
            this.intensity = result.netherIntensity || 0.8;
        } catch (error) {
            console.log('Using default settings');
        }
    }

    createOverlay() {
        // Remove existing overlay if it exists
        const existingOverlay = document.getElementById(this.overlayId);
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Create new overlay
        const overlay = document.createElement('div');
        overlay.id = this.overlayId;
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            pointer-events: none !important;
            z-index: 2147483647 !important;
            transition: all 0.3s ease !important;
            mix-blend-mode: multiply !important;
            opacity: 0 !important;
        `;

        document.documentElement.appendChild(overlay);
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'applyMode') {
                this.applyMode(message.mode, message.intensity);
                sendResponse({ success: true });
            }
        });
    }

    applyCurrentMode() {
        this.applyMode(this.currentMode, this.intensity);
    }

    applyMode(mode, intensity = 0.8) {
        this.currentMode = mode;
        this.intensity = intensity;

        const overlay = document.getElementById(this.overlayId);
        if (!overlay) return;

        const body = document.body;
        const html = document.documentElement;

        // Remove any existing Nether classes
        body.classList.remove('nether-dark', 'nether-light', 'nether-auto');
        html.classList.remove('nether-dark', 'nether-light', 'nether-auto');

        switch (mode) {
            case 'dark':
                this.applyDarkMode(overlay, intensity);
                body.classList.add('nether-dark');
                html.classList.add('nether-dark');
                break;

            case 'light':
                this.applyLightMode(overlay);
                body.classList.add('nether-light');
                html.classList.add('nether-light');
                break;

            case 'auto':
                this.applyAutoMode(overlay, intensity);
                body.classList.add('nether-auto');
                html.classList.add('nether-auto');
                break;
        }

        // Inject custom CSS for better dark mode support
        this.injectCustomCSS(mode, intensity);
    }

    applyDarkMode(overlay, intensity) {
        const opacity = Math.min(intensity, 0.9);
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            pointer-events: none !important;
            z-index: 2147483647 !important;
            transition: all 0.3s ease !important;
            background: rgba(0, 0, 0, ${opacity}) !important;
            mix-blend-mode: multiply !important;
            opacity: 1 !important;
        `;
    }

    applyLightMode(overlay) {
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            pointer-events: none !important;
            z-index: 2147483647 !important;
            transition: all 0.3s ease !important;
            opacity: 0 !important;
        `;
    }

    applyAutoMode(overlay, intensity) {
        const hour = new Date().getHours();
        const isDarkTime = hour < 7 || hour > 19; // Dark mode between 7 PM and 7 AM
        
        if (isDarkTime) {
            this.applyDarkMode(overlay, intensity);
        } else {
            this.applyLightMode(overlay);
        }
    }

    injectCustomCSS(mode, intensity) {
        // Remove existing Nether styles
        const existingStyle = document.getElementById('nether-custom-styles');
        if (existingStyle) {
            existingStyle.remove();
        }

        if (mode === 'light') return;

        const style = document.createElement('style');
        style.id = 'nether-custom-styles';
        
        const invertIntensity = mode === 'dark' ? Math.min(intensity * 0.8, 0.7) : 0;
        const brightnessValue = mode === 'dark' ? Math.max(1 - intensity * 0.3, 0.8) : 1;
        
        style.textContent = `
            .nether-dark img:not([src*=".svg"]),
            .nether-dark video,
            .nether-dark iframe,
            .nether-dark embed,
            .nether-dark object {
                filter: brightness(${brightnessValue}) !important;
                transition: filter 0.3s ease !important;
            }
            
            .nether-dark input,
            .nether-dark textarea,
            .nether-dark select {
                background-color: rgba(40, 40, 40, 0.9) !important;
                color: rgba(255, 255, 255, 0.9) !important;
                border-color: rgba(255, 255, 255, 0.2) !important;
            }
            
            .nether-dark input::placeholder,
            .nether-dark textarea::placeholder {
                color: rgba(255, 255, 255, 0.5) !important;
            }
            
            .nether-auto img:not([src*=".svg"]),
            .nether-auto video,
            .nether-auto iframe,
            .nether-auto embed,
            .nether-auto object {
                filter: brightness(${brightnessValue}) !important;
                transition: filter 0.3s ease !important;
            }
        `;

        document.head.appendChild(style);
    }
}

// Initialize content script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new NetherContentScript();
    });
} else {
    new NetherContentScript();
}
