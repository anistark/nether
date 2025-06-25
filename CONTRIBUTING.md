# Contributing to Nether

Thank you for your interest in contributing to Nether! This guide will help you get started with development.

## Project Structure

```sh
nether/
├── manifest.json            # Extension configuration
├── README.md                # Main documentation
├── CONTRIBUTING.md          # This file
├── src/                     # Source code
│   ├── popup/               # Extension popup
│   │   ├── popup.html       # UI structure
│   │   ├── popup.css        # Liquid glass styling
│   │   └── popup.js         # Toggle functionality
│   └── content/             # Content scripts
│       └── content.js       # Page manipulation logic
└── assets/                  # Static resources
    ├── icons/               # Extension icons (PNG)
    │   ├── icon-16.png      # 16x16 toolbar
    │   ├── icon-48.png      # 48x48 management
    │   └── icon-128.png     # 128x128 store
    └── images/              # SVG icons
        ├── nether.svg       # Nether Logo
        ├── sun.svg          # Orange sun icon
        └── moon.svg         # Purple moon icon
```

## Development Setup

### Prerequisites
- Chrome 88+ or Edge 88+
- Basic knowledge of HTML, CSS, and JavaScript

### Setup Steps

1. **Clone the repository**
   ```sh
   git clone https://github.com/anistark/nether.git
   cd nether
   ```

2. **Load extension in Chrome**
   ```sh
   # Open Chrome and navigate to:
   chrome://extensions/
   
   # Enable "Developer mode" (top right toggle)
   # Click "Load unpacked"
   # Select the nether folder
   ```

## Development Workflow

### Key Files to Modify

- **`src/popup/popup.js`** - Toggle logic and UI updates
- **`src/content/content.js`** - Theme implementation
- **`src/popup/popup.css`** - Styling
- **`manifest.json`** - Extension configuration

### Testing Guidelines

1. **Test on multiple websites**
   - Google Docs (canvas rendering)
   - Wikipedia (standard HTML)
   - GitHub (complex styling)
   - YouTube (video content)
   - WhatsApp/Telegram (chat webapps)

2. **Verify functionality**
   - Toggle switches between light/dark
   - Settings persist after browser restart
   - No console errors
   - Smooth animations

3. **Test edge cases**
   - Sites with existing dark modes
   - Pages with complex CSS
   - Single-page applications

## Submitting Changes

1. **Fork the repository**
2. **Create a feature branch**
   ```sh
   git checkout -b feat/your-feature-name
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages**
   ```sh
   git commit -m "Add: feature description"
   ```
6. **Push and create pull request**

## Issues and Bugs

When reporting issues:
- Include browser version
- Describe steps to reproduce
- Provide screenshots if relevant
- Test on multiple websites

## Questions?

Feel free to open an issue for any questions about contributing!
