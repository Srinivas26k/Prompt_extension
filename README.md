# AI Prompt Enhancer Firefox Extension

Transform your basic prompts into perfect, role-based prompts that maximize AI response quality and accuracy.

## ✨ Features

### 🔄 Multi-Provider Support
- **OpenRouter** - Access to multiple AI models through one API
- **OpenAI** - GPT-4o, GPT-4o Mini, GPT-3.5 Turbo
- **Anthropic** - Claude 3 Haiku, Sonnet, and Opus
- **Groq** - Lightning-fast Llama models
- **Perplexity** - AI with real-time web access

### 🎯 Smart Enhancement
- **Role-based prompting** with customizable personas
- **Structured formatting** with professional templates
- **Context enrichment** for better AI understanding
- **Quality optimization** for superior results

### ⚙️ Flexible Configuration
- **Multiple description levels**: Minimal, Detailed, Comprehensive
- **Output length control**: Short, Medium, Long
- **Format styles**: Conversational, Structured, Bullet Points
- **Response tones**: Helpful, Professional, Friendly, Concise

### 📊 Usage Analytics
- **Real-time statistics** tracking
- **Daily and total counts**
- **Performance insights**

### 🛠️ User Experience
- **Manual prompt enhancement** in sidebar
- **Context menu integration** for selected text
- **One-click copy to clipboard**
- **Auto-save settings**
- **Real-time API key validation**

## 🚀 Installation

### Option 1: Load Unpacked Extension (Development)
1. Download and extract the extension files
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on..."
5. Select the `manifest.json` file from the extracted folder
6. The extension will be loaded temporarily

### Option 2: Install from ZIP
1. Download the `ai-prompt-enhancer-v1.0.0.zip` file
2. Open Firefox and navigate to `about:addons`
3. Click the gear icon and select "Install Add-on From File..."
4. Select the downloaded ZIP file
5. Click "Add" when prompted

## 🔧 Setup

### 1. Choose Your AI Provider
1. Click the extension icon in the toolbar
2. Select your preferred AI provider from the dropdown
3. Choose the appropriate model for your needs

### 2. Configure API Key
Get your API key from one of these providers:

- **OpenRouter**: [https://openrouter.ai/keys](https://openrouter.ai/keys)
- **OpenAI**: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Anthropic**: [https://console.anthropic.com/](https://console.anthropic.com/)
- **Groq**: [https://console.groq.com/keys](https://console.groq.com/keys)
- **Perplexity**: [https://www.perplexity.ai/settings/api](https://www.perplexity.ai/settings/api)

### 3. Customize Settings
Configure enhancement parameters:
- **Role**: Set a specific persona (optional)
- **Description Level**: Choose detail depth
- **Output Length**: Select response size
- **Format Style**: Pick structure type
- **Response Tone**: Set communication style

## 📖 Usage

### Manual Enhancement
1. Open the extension sidebar
2. Enter your basic prompt in the text area
3. Click "Enhance Prompt"
4. Copy the enhanced result

### Context Menu Enhancement
1. Select text on any webpage
2. Right-click and choose "Enhance with AI"
3. The enhanced prompt will be processed automatically

## 🛠️ Development

### Prerequisites
- [Bun](https://bun.sh/) runtime
- Firefox Developer Edition (recommended)

### Build from Source
```bash
# Clone the repository
git clone <repository-url>
cd Prompt_extension

# Install dependencies
bun install

# Build the extension
bun run build

# Run tests
bun run test

# Lint the code
bun run lint
```

### Project Structure
```
Prompt_extension/
├── manifest.json          # Extension manifest
├── background.js          # Background service worker
├── sidebar.js            # Sidebar functionality
├── sidebar.html          # Sidebar UI
├── sidebar.css           # Sidebar styles
├── content.js            # Content script
├── welcome.html          # Welcome page
├── icons/                # Extension icons
└── dist/                # Built extension
```

## 🐛 Troubleshooting

### Common Issues

#### "API key not working"
- **Solution**: Verify the API key is correct and has sufficient credits
- **Check**: Ensure you're using the right key for the selected provider
- **Debug**: Use the debug helper: `./debug-helper.sh`

#### "Extension not loading"
- **Solution**: Check browser console for errors
- **Fix**: Reload the extension in `about:debugging`
- **Verify**: Ensure manifest.json is valid

#### "Prompt enhancement fails"
- **Check**: API key is valid and has credits
- **Verify**: Internet connection is stable
- **Try**: Switch to a different AI provider
- **Debug**: Check background script logs

#### "Stats not updating"
- **Solution**: Stats refresh automatically after successful enhancements
- **Check**: Browser storage permissions
- **Reset**: Clear extension data and reconfigure

### Debug Tools

#### Manual Testing
```bash
./test-manual.sh
```

#### Debug Helper
```bash
./debug-helper.sh
```

#### Browser Console
1. Open Firefox Developer Tools (F12)
2. Go to Console tab
3. Look for extension messages prefixed with `[AI Prompt Enhancer Debug]`

### Advanced Debugging

#### Background Script Logs
```javascript
// In browser console
browser.runtime.getBackgroundPage().then(bg => {
    console.log(bg.console);
});
```

#### Storage Inspection
```javascript
// Check stored data
browser.storage.local.get().then(console.log);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔄 Changelog

### Version 1.0.0
- ✅ **Multi-provider support** (OpenRouter, OpenAI, Anthropic, Groq, Perplexity)
- ✅ **Dynamic model selection** based on provider
- ✅ **Real-time usage statistics**
- ✅ **Fixed manual enhancement** button functionality
- ✅ **Improved prompt templates** with structured formatting
- ✅ **Enhanced error handling** and debugging
- ✅ **Cross-browser compatibility**
- ✅ **Professional UI/UX** improvements

## 💡 Tips

### Best Practices
- **Start simple**: Begin with basic prompts and let the AI enhance them
- **Use roles**: Specify expertise areas for better context
- **Experiment**: Try different providers and models for various tasks
- **Save settings**: Configure once and reuse your preferences

### Performance
- **OpenRouter**: Best for model variety and cost-effectiveness
- **OpenAI**: Excellent for general tasks and coding
- **Anthropic**: Superior for analysis and reasoning
- **Groq**: Fastest inference for quick tasks
- **Perplexity**: Best for research and current information

---

**Made with ❤️ for better AI interactions**
