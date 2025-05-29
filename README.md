# AI Prompt Enhancer Firefox Extension

🚀 **Transform basic prompts into perfect, role-based prompts using OpenRouter AI with integrated credit system and admin dashboard.**

## 🌟 Overview

The AI Prompt Enhancer is a comprehensive Firefox extension that revolutionizes how you interact with AI platforms. It includes a credit-based backend system, admin dashboard, and seamless integration with multiple AI chat platforms.

## 🏗️ Architecture

### Frontend Components
- **Firefox Extension**: Main user interface with floating button, sidebar panel, and context menu
- **Background Service**: Handles API communication and credit management
- **Content Scripts**: Integrates with AI platforms (Claude.ai, ChatGPT, etc.)

### Backend Infrastructure
- **Flask API**: RESTful backend for user management and credit system
- **Streamlit Admin Dashboard**: Real-time monitoring and user management
- **SQLite Database**: User data, credits, and usage analytics
- **Credit System**: Token-based usage tracking with 100 free credits per user

## 🚀 Features

### Core Functionality
- **Smart Prompt Enhancement**: Transform basic prompts into sophisticated, role-based prompts
- **Multi-Platform Support**: Works on Claude.ai, ChatGPT, and other AI platforms
- **Real-time Enhancement**: Enhance prompts directly in text areas with floating button
- **Context Menu Integration**: Right-click selected text to enhance it
- **Customizable Settings**: Configure role, tone, length, format, and description level

### Credit System
- **User Registration**: Email-based account creation with verification codes
- **Credit Tracking**: 100 free credits per user with usage monitoring
- **Real-time Updates**: Live credit balance display and usage alerts
- **Admin Dashboard**: Comprehensive user and usage analytics

### Security Features
- **Secure API Integration**: CORS-enabled Flask backend with proper error handling
- **Data Protection**: User data encryption and secure storage
- **Rate Limiting**: Built-in protection against abuse

## 📦 Installation & Deployment

### Quick Setup (Development)

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd Prompt_extension
   ```

2. **Setup Backend**
   ```bash
   cd streamlit_backend
   pip install -r requirements.txt
   python flask_api.py &
   streamlit run app.py
   ```

3. **Install Extension**
   - Open Firefox: `about:debugging`
   - Click "Load Temporary Add-on"
   - Select `manifest.json`

### Production Deployment

For complete production deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

#### Quick Production Setup
```bash
chmod +x deploy-production.sh
./deploy-production.sh
```

This script automatically:
- Updates all URLs to production endpoints
- Creates optimized extension package
- Prepares files for deployment

## 🔧 Usage

### User Registration & Verification
1. **First Time Setup**
   - Click extension icon → "Register/Verify Account"
   - Enter your email address
   - Receive verification code (6-character alphanumeric)
   - Enter code to activate 100 free credits

2. **Account Management**
   - View current credit balance in real-time
   - Track usage history in admin dashboard
   - Monitor remaining credits before enhancement

### Enhancement Methods

#### Method 1: Floating Button (Recommended)
1. Visit any AI chat platform (Claude.ai, ChatGPT, etc.)
2. Start typing in a text area (10+ characters)
3. Click the floating ✨ button that appears
4. Enhanced prompt automatically replaces original text
5. Credit balance updates in real-time

#### Method 2: Sidebar Panel
1. Click extension icon → "Open Sidebar Panel"
2. Paste prompt in "Original Prompt" field
3. Configure enhancement settings:
   - **Role**: Academic, Professional, Creative, Technical
   - **Tone**: Formal, Casual, Persuasive, Analytical
   - **Length**: Concise, Detailed, Comprehensive
   - **Format**: Structured, Conversational, Technical
4. Click "Enhance Prompt"
5. Copy or auto-insert enhanced prompt

#### Method 3: Context Menu
1. Select any text on a webpage
2. Right-click → "Enhance with AI"
3. Enhanced text replaces selection
4. Works on any website with text content

### Admin Dashboard Access
- **URL**: Visit admin dashboard (see DEPLOYMENT.md for URL)
- **Features**: User management, credit monitoring, usage analytics
- **Real-time Updates**: Live user activity and system health

## ⚙️ Configuration

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
