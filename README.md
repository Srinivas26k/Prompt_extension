# AI Prompt Enhancer Firefox Extension

Transform your basic prompts into perfect, role-based prompts that maximize AI response quality and accuracy. **Free and open-source** - powered by community contributions.

**Created by Srinivas | Ideavaults Community**

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

## ⚙️ Setup

### 1. Get an API Key
Choose your preferred AI provider and get an API key:

- **OpenRouter** (Recommended): [openrouter.ai/keys](https://openrouter.ai/keys)
- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com/)
- **Groq**: [console.groq.com/keys](https://console.groq.com/keys)
- **Perplexity**: [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api)

### 2. Configure the Extension
1. Click the extension icon in the Firefox toolbar
2. Click "Open Settings" to access the sidebar
3. Select your AI provider from the dropdown
4. Choose your preferred model
5. Enter your API key and click "Save"
6. Customize your enhancement settings (optional)

### 3. Start Enhancing
- **Manual Enhancement**: Use the sidebar to enhance prompts directly
- **Context Menu**: Right-click selected text and choose "Enhance with AI"
- **Copy Results**: Click the copy button to copy enhanced prompts to clipboard

## 🎯 Usage Examples

### Basic Prompt Enhancement
**Original**: `Write a blog post about AI`

**Enhanced**: 
```
# ROLE
You are an expert technology blogger and AI researcher with deep knowledge of artificial intelligence trends, applications, and implications.

# GOAL
Write a comprehensive and engaging blog post about AI that educates readers about current developments, practical applications, and future possibilities.

# CONTEXT
Create content suitable for a general audience interested in technology, including both technical and non-technical readers.

# REQUIREMENTS
- Use clear, accessible language while maintaining technical accuracy
- Include real-world examples and current AI applications
- Structure the post with engaging headlines and logical flow
- Provide actionable insights for readers
- Maintain an informative yet engaging tone

# FORMAT
Use a structured blog post format with:
- Compelling headline and introduction
- Well-organized sections with subheadings
- Bullet points for key concepts
- Conclusion with key takeaways
```

### Role-Specific Enhancement
Set a role like "Software Engineer" and enhance:

**Original**: `Explain databases`

**Enhanced**: 
```
# ROLE
You are a senior software engineer with extensive experience in database design, optimization, and management across various database systems.

# GOAL
Explain databases in a comprehensive manner that helps developers understand both fundamental concepts and practical implementation considerations.

# CONTEXT
Provide information suitable for software developers who need to understand database concepts for application development.

# REQUIREMENTS
- Cover both relational and NoSQL databases
- Include practical examples and use cases
- Explain performance considerations
- Discuss best practices for database design
- Use technical terminology appropriately

# FORMAT
Structure the explanation with:
- Clear definitions and core concepts
- Comparison of different database types
- Code examples where relevant
- Performance optimization tips
```

## 🌐 Website & Documentation

Visit our comprehensive website for detailed guides and documentation:
- **Main Website**: [Website included in extension](./website/index.html)
- **API Setup Guide**: Complete setup instructions for all providers
- **Best Practices**: Tips for optimal prompt enhancement
- **Examples**: Real-world usage examples and templates

## ☕ Support Development

This extension is **completely free** and open-source! If you find it helpful, consider supporting its development:

- ☕ **[Buy me a coffee](https://buymeacoffee.com/srinivaskiv)** - Support development
- ⭐ **Star on GitHub** - Help others discover this project
- 🐛 **Report issues** - Help improve the extension
- 💡 **Suggest features** - Share your ideas
- 🔄 **Contribute code** - Join the development

## 🔒 Privacy & Security

- **Local Storage**: API keys are stored locally in your browser
- **No Data Collection**: We don't collect or store your prompts
- **Direct API Calls**: Communications go directly to your chosen AI provider
- **Open Source**: Full transparency with open source code
- **No Tracking**: No analytics or user tracking

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
├── popup.js              # Popup functionality
├── icons/                # Extension icons
└── website/              # Documentation website
    ├── index.html        # Main landing page
    ├── docs/             # Documentation pages
    ├── css/              # Stylesheets
    └── js/               # JavaScript files
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

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Report Issues**: Found a bug? Let us know!
2. **Suggest Features**: Have an idea? Share it with us!
3. **Submit Pull Requests**: Code improvements are always welcome
4. **Improve Documentation**: Help make our docs better
5. **Test & Feedback**: Try the extension and share your experience

### Development Guidelines
- Follow the existing code style
- Test your changes thoroughly
- Update documentation as needed
- Keep commits focused and descriptive

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔄 Changelog

### Version 1.0.0
- ✨ **Initial release** with multi-provider support
- 🎯 **Role-based prompt enhancement**
- ⚙️ **Customizable enhancement settings**
- 📊 **Usage statistics tracking**
- 🛠️ **Context menu integration**
- ☕ **Community support integration**
- 🌐 **Comprehensive documentation website**
- 🔒 **Privacy-focused design**

## 💡 Tips & Best Practices

### Getting Started
- **Start simple**: Begin with basic prompts and let the AI enhance them
- **Use roles**: Specify expertise areas for better context
- **Experiment**: Try different providers and models for various tasks
- **Save settings**: Configure once and reuse your preferences

### Provider Recommendations
- **OpenRouter**: Best for model variety and cost-effectiveness
- **OpenAI**: Excellent for general tasks and coding
- **Anthropic**: Superior for analysis and reasoning
- **Groq**: Fastest inference for quick tasks
- **Perplexity**: Best for research and current information

### Cost Optimization
- **Start with free tiers**: Most providers offer free credits
- **Use smaller models**: For simple tasks, smaller models are sufficient
- **Batch requests**: Process multiple prompts efficiently
- **Monitor usage**: Keep track of your API usage and costs

## 🙏 Acknowledgments

- Thanks to all AI providers for their excellent APIs
- Inspired by the prompt engineering community
- Built with love for better AI interactions
- Special thanks to all contributors and supporters

## 📞 Support

- **GitHub Issues**: Report bugs and request features
- **Community**: Join our community discussions
- **Documentation**: Visit our comprehensive website
- **Email**: Contact us for support

---

**Transform your prompts, transform your AI interactions!** 🚀

*Made with ❤️ by the community, for the community*
