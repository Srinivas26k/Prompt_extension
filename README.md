# AI Prompt Enhancer Firefox Extension

Transform basic prompts into perfect, role-based prompts using OpenRouter AI.

## 🚀 Features

- **Smart Prompt Enhancement**: Transform basic prompts into sophisticated, role-based prompts
- **OpenRouter Integration**: Uses OpenRouter AI API for intelligent prompt transformation
- **Multiple AI Chat Platform Support**: Works on Claude.ai, ChatGPT, and other AI platforms
- **Real-time Enhancement**: Enhance prompts directly in text areas with a floating button
- **Customizable Settings**: Configure role, tone, length, format, and description level
- **Context Menu Integration**: Right-click selected text to enhance it
- **Statistics Tracking**: Track daily and total prompt enhancements

## 📦 Installation

### Manual Installation (Recommended)

1. **Download the Extension**
   - Use the `ai-prompt-enhancer-v1.0.0.zip` file in this directory

2. **Install in Firefox**
   - Open Firefox and go to `about:debugging`
   - Click "This Firefox" on the left sidebar
   - Click "Load Temporary Add-on..."
   - Select the `ai-prompt-enhancer-v1.0.0.zip` file

3. **Configure OpenRouter API Key**
   - Get your API key from [OpenRouter.ai](https://openrouter.ai)
   - Click the extension icon in the toolbar
   - Click "Open Sidebar Panel"
   - Enter your API key and click "Save API Key"

## 🔧 Usage

### Method 1: Floating Button
1. Visit any AI chat platform (Claude.ai, ChatGPT, etc.)
2. Start typing in a text area
3. When you have 10+ characters, a floating ✨ button will appear
4. Click the button to enhance your prompt automatically

### Method 2: Sidebar Panel
1. Click the extension icon in the toolbar
2. Click "Open Sidebar Panel"
3. Paste your prompt in the "Original Prompt" field
4. Configure settings (role, tone, length, etc.)
5. Click "Enhance Prompt"
6. Copy or insert the enhanced prompt

### Method 3: Context Menu
1. Select any text on a webpage
2. Right-click and choose "Enhance with AI"
3. The enhanced text will replace the selection

## ⚙️ Settings

Configure these options in the sidebar panel:

- **Role**: Specify what role the AI should take (e.g., "expert copywriter", "technical consultant")
- **Description Level**: Choose how detailed the response should be
- **Length**: Control response length (short, medium, long, comprehensive)
- **Format**: Choose output format (structured, bullets, numbered, paragraph)
- **Tone**: Set the response tone (helpful, analytical, creative, persuasive, educational)

## 🛠️ Development

### Prerequisites
- Node.js or Bun
- Firefox Developer Edition (optional but recommended)

### Build Commands
```bash
# Install dependencies
bun install

# Build the extension
bun run build

# Create distribution zip
bun run zip

# Lint the extension
bun run lint

# Development with auto-reload
bun run dev
```

### Project Structure
```
├── manifest.json       # Extension manifest
├── background.js       # Background script (API calls, storage)
├── popup.js/html       # Extension popup
├── sidebar.js/html     # Main enhancement interface
├── content.js          # Content script (page interaction)
├── welcome.html        # Welcome/setup page
├── icons/              # Extension icons
└── dist/               # Built extension files
```

## 🔑 API Configuration

1. **Get OpenRouter API Key**
   - Visit [OpenRouter.ai](https://openrouter.ai)
   - Sign up and get your API key
   - The extension uses the `anthropic/claude-3-haiku` model by default

2. **Configure in Extension**
   - Open the sidebar panel
   - Enter your API key
   - Click "Save API Key"
   - The extension will validate the key automatically

## 📊 Usage Statistics

The extension tracks:
- Total prompts enhanced
- Daily enhancement count
- API connection status

View statistics in the popup or sidebar panel.

## 🐛 Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Ensure you have credits in your OpenRouter account
   - Check that the API key is correctly entered
   - Try refreshing the page

2. **Enhancement Button Not Appearing**
   - Make sure you have at least 10 characters in the text area
   - Try clicking in the text area to focus it
   - Refresh the page and try again

3. **Extension Not Loading**
   - Check browser console for errors
   - Ensure you're using Firefox (Chrome API compatibility limited)
   - Try reinstalling the extension

### Debug Mode
- Open Firefox Developer Tools (F12)
- Check Console for error messages
- Check Extension debugging in `about:debugging`
- Look for debug messages starting with `[AI Prompt Enhancer Debug]`

### New in v1.0.0 - Recent Fixes
- ✅ **Fixed storage issues**: Now uses `browser.storage.local` for temporary addon compatibility
- ✅ **Enhanced debugging**: Comprehensive logging for troubleshooting
- ✅ **Improved manifest**: Updated to use `browser_specific_settings` and Firefox 79+
- ✅ **Consistent API models**: Uses `anthropic/claude-3-haiku` for reliable responses
- ✅ **Better error handling**: Detailed error messages for API and storage issues
- ✅ **CSP compliance**: Removed inline scripts from welcome page
- ✅ **Additional testing tools**: Run `./test-manual.sh` and `./debug-helper.sh`

### Debug Scripts
```bash
# Run comprehensive tests
./test-manual.sh

# Debug API key and common issues
./debug-helper.sh
```

## 📝 License

This project is open source. Feel free to modify and distribute.

## 🤝 Contributing

1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for errors
3. Ensure OpenRouter API key is valid and has credits

---

**Happy prompting! 🚀**
