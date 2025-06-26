(function() {
    'use strict';
    
    if (window.netherContentScript) {
        return;
    }

    class NetherContentScript {
        constructor() {
            this.overlayId = 'nether-mode-overlay';
            this.currentMode = 'light';
            this.currentDomain = window.location.hostname;
            this.systemPrefersDark = false;
            this.init();
        }

        async init() {
            this.detectSystemPreference();
            await this.loadSettings();
            this.createOverlay();
            this.setupMessageListener();
            this.applyCurrentMode();
            this.setupSystemThemeListener();
        }

        detectSystemPreference() {
            this.systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        setupSystemThemeListener() {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                this.systemPrefersDark = e.matches;
                // Re-apply mode if it's set to system default
                this.loadSettings().then(() => {
                    this.applyCurrentMode();
                });
            });
        }

        async loadSettings() {
            try {
                // Load per-site setting first
                const siteKey = `nether_site_${this.currentDomain}`;
                const siteResult = await chrome.storage.sync.get([siteKey]);
                const siteMode = siteResult[siteKey];

                if (siteMode) {
                    this.currentMode = this.getEffectiveMode(siteMode);
                } else {
                    // Load global setting
                    const globalResult = await chrome.storage.sync.get(['netherGlobalMode']);
                    const globalMode = globalResult.netherGlobalMode;
                    
                    if (globalMode) {
                        this.currentMode = this.getEffectiveMode(globalMode);
                    } else {
                        // Default to system preference
                        this.currentMode = this.systemPrefersDark ? 'dark' : 'light';
                    }
                }
            } catch (error) {
                this.currentMode = this.systemPrefersDark ? 'dark' : 'light';
            }
        }

        getEffectiveMode(mode) {
            if (mode === 'system') {
                return this.systemPrefersDark ? 'dark' : 'light';
            }
            return mode;
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
                    this.applyMode(message.mode);
                    sendResponse({ success: true });
                    return true;
                }
            });
        }

        applyCurrentMode() {
            this.applyMode(this.currentMode);
        }

        applyMode(mode) {
            this.currentMode = mode;

            const overlay = document.getElementById(this.overlayId);
            if (!overlay) return;

            const body = document.body;
            const html = document.documentElement;

            // Remove any existing Nether classes
            body.classList.remove('nether-dark', 'nether-light');
            html.classList.remove('nether-dark', 'nether-light');

            switch (mode) {
                case 'dark':
                    this.applyDarkMode(overlay);
                    body.classList.add('nether-dark');
                    html.classList.add('nether-dark');
                    break;

                case 'light':
                default:
                    this.applyLightMode(overlay);
                    body.classList.add('nether-light');
                    html.classList.add('nether-light');
                    break;
            }

            // Inject custom CSS for better dark mode support
            this.injectCustomCSS(mode);
        }

        applyDarkMode(overlay) {
            const opacity = 0.8;
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

        injectCustomCSS(mode) {
            // Remove existing Nether styles
            const existingStyle = document.getElementById('nether-custom-styles');
            if (existingStyle) {
                existingStyle.remove();
            }

            if (mode === 'light') return;

            const style = document.createElement('style');
            style.id = 'nether-custom-styles';
            
            const brightnessValue = 0.85;
            
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
                
                /* Improve readability for common elements */
                .nether-dark [style*="background-color: white"],
                .nether-dark [style*="background-color: #fff"],
                .nether-dark [style*="background-color: #ffffff"],
                .nether-dark [style*="background-color: rgb(255, 255, 255)"] {
                    background-color: rgba(40, 40, 40, 0.95) !important;
                }
                
                .nether-dark [style*="color: black"],
                .nether-dark [style*="color: #000"],
                .nether-dark [style*="color: #000000"],
                .nether-dark [style*="color: rgb(0, 0, 0)"] {
                    color: rgba(255, 255, 255, 0.9) !important;
                }
                
                /* Special handling for common website elements */
                .nether-dark .bg-white,
                .nether-dark .background-white {
                    background-color: rgba(40, 40, 40, 0.95) !important;
                }
                
                .nether-dark .text-black,
                .nether-dark .color-black {
                    color: rgba(255, 255, 255, 0.9) !important;
                }
            `;

            document.head.appendChild(style);
        }
    }

    window.netherContentScript = new NetherContentScript();

})();
