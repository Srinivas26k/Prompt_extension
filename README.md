# AI Prompt Enhancer Pro 🚀

> Transform your basic prompts into perfect role-based prompts using AI with secure waitlist system and Firefox browser extension.

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ai-prompt-enhancer)
[![Firefox Extension](https://img.shields.io/badge/Firefox-Extension-orange?logo=firefox)](https://addons.mozilla.org/)
[![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js-black?logo=next.js)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/Database-Supabase-green?logo=supabase)](https://supabase.com/)

## 🌟 Features

### 🎯 Smart Waitlist System
- **First 25 users** get immediate access with redemption codes
- **1 in 10 approval ratio** for subsequent registrations
- Automatic waitlist position tracking
- Email notifications for status updates

### 🔥 AI-Powered Enhancement
- Transform basic prompts into expert-level prompts
- Role-based prompt engineering using O1 methodology
- Integration with OpenRouter for multiple AI models
- Real-time credit tracking and management

### 🦊 Firefox Extension
- Seamless integration with popular AI platforms (ChatGPT, Claude, Perplexity, etc.)
- Context menu enhancement for selected text
- Sidebar interface for prompt customization
- Secure API communication with redemption codes

### ☕ Community Support
- Non-intrusive donation notifications every 5 minutes
- Buy Me a Coffee integration
- Support for open-source development

## 🚀 Quick Deploy

### Option 1: Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ai-prompt-enhancer&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,OPENROUTER_API_KEY)

### Option 2: Manual Deployment

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-prompt-enhancer.git
   cd ai-prompt-enhancer
   ```

2. **Setup Supabase Database**
   ```bash
   # Import the complete schema
   psql -h your-supabase-host -U postgres -d your-database -f complete-waitlist-setup.sql
   ```

3. **Deploy Next.js App**
   ```bash
   cd nextjs-app
   bun install
   bunx vercel --prod
   ```

4. **Configure Environment Variables**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENROUTER_API_KEY=your_openrouter_key
   ```

## 🏗️ Project Structure

```
ai-prompt-enhancer/
├── nextjs-app/                 # 🚀 Main Next.js Application
│   ├── pages/api/             # API Routes (register, enhance, email)
│   ├── components/            # React Components
│   ├── lib/                   # Utilities & Supabase client
│   └── vercel.json            # Vercel deployment config
├── firefox-extension/          # 🦊 Browser Extension
│   ├── manifest.json          # Extension configuration
│   ├── background.js          # Background service with notifications
│   └── icons/                 # Extension icons
├── complete-waitlist-setup.sql # 🗄️ Database Schema
└── O1_PROMPT_TEMPLATE.md      # 🧠 Expert Prompt Template
```

## 🚀 Quick Start

### 1. Deploy Next.js App (Vercel + Supabase)
```bash
cd nextjs-app
bun install
bunx vercel --prod
```

### 2. Setup Database (Supabase)
```bash
# Import complete-waitlist-setup.sql into your Supabase project
# Configure environment variables in Vercel dashboard
```

### 3. Update Firefox Extension for Production
```bash
cd firefox-extension
# Update API_BASE_URL in background.js to production Vercel URL
# Package for Firefox Add-ons store
```

## 🔗 Live Deployment

- **Next.js App**: TBD (Vercel deployment URL)
- **Database**: Supabase PostgreSQL with waitlist system
- **Extension**: Firefox Add-ons Store (pending)

## ✨ Key Features

### Waitlist System
- ✅ First 25 users get immediate access
- ✅ Then 1 out of every 10 registrations approved
- ✅ Automatic waitlist position tracking
- ✅ Email notifications for status updates

### Donation Integration
- ✅ Non-intrusive notifications every 5 minutes
- ✅ Buy Me a Coffee integration
- ✅ Both website and extension support

### Security & Performance
- ✅ Secure redemption code system
- ✅ Rate limiting on API endpoints
- ✅ HTTPS everywhere
- ✅ Row Level Security on database
- ✅ OpenRouter AI integration

## 🔧 Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGciOiJ...` |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI | `sk-or-v1-...` |

### Vercel Deployment Secrets

Add these secrets in your Vercel project dashboard:
- `VERCEL_TOKEN` - Your Vercel API token
- `ORG_ID` - Your Vercel organization ID
- `PROJECT_ID` - Your Vercel project ID

## 🧪 Testing

```bash
# Test the Next.js application
cd nextjs-app
bun run dev

# Test database connection
bun run test-supabase
```

## 📊 Database Schema

The system uses PostgreSQL with the following key tables:

- **users**: User accounts with waitlist status and credits
- **waitlist_settings**: Configuration for approval limits and ratios
- **PostgreSQL Functions**: Automated waitlist position calculation

## 🎨 UI Components

Built with modern React components:
- Responsive design with Tailwind CSS
- Radix UI components for accessibility
- Framer Motion for animations
- React Hot Toast for notifications

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/register` | POST | User registration with waitlist logic |
| `/api/enhance` | POST | Prompt enhancement using AI |
| `/api/verify` | POST | Email verification |
| `/api/health` | GET | API health check |
| `/api/send-email` | POST | Email notification system |

## 🦊 Firefox Extension Installation

1. **Download** the latest release from GitHub
2. **Extract** the firefox-extension folder
3. **Update** `API_BASE_URL` in `background.js` to your production URL
4. **Load** the extension in Firefox developer mode
5. **Package** for Firefox Add-ons store submission

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## ☕ Support Development

If you find this project helpful, consider supporting its development:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-donate-orange?logo=buy-me-a-coffee)](https://buymeacoffee.com/srinivaskiv)

## 🚀 Live Demo

- **Web App**: [Coming Soon]
- **Firefox Extension**: [Pending Store Approval]
- **GitHub**: https://github.com/yourusername/ai-prompt-enhancer

## 📄 License

MIT License - See LICENSE file for details.

---
**Status**: Production Ready ✅ | **Deployment**: Ready for Vercel | **Extension**: Ready for Firefox Store
