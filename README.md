# AI Prompt Enhancer - Production Ready

A complete Firefox extension and Next.js web application with waitlist system that transforms basic prompts into perfect role-based prompts using AI, featuring secure redemption codes and donation notifications.

## 🏗️ Project Structure

```
/ai-prompt-enhancer/
├── nextjs-app/                 # 🚀 Next.js Application (Main)
│   ├── pages/api/             # API Routes
│   │   ├── register.js        # User registration with waitlist
│   │   ├── enhance.js         # Prompt enhancement using OpenRouter
│   │   ├── send-email.js      # Email sending system
│   │   ├── health.js          # API health check
│   │   ├── verify.js          # Code verification
│   │   └── waitlist.js        # Waitlist management
│   ├── components/            # React Components
│   │   ├── EmailVerification.js # Email verification UI
│   │   ├── Hero.js            # Landing page hero
│   │   ├── Layout.js          # App layout with donation notifications
│   │   └── ui/                # UI components (button, card, input)
│   ├── lib/                   # Utilities
│   │   ├── supabase.js        # Supabase client & waitlist functions
│   │   └── utils.js           # Utility functions
│   ├── public/                # Static assets
│   ├── styles/                # CSS files
│   ├── package.json           # Dependencies (uses bun)
│   └── vercel.json            # Vercel deployment config
│
├── firefox-extension/          # 🦊 Firefox Extension
│   ├── manifest.json          # Extension configuration with notifications
│   ├── background.js          # Background service with donation notifications
│   ├── popup.html/js          # Extension popup interface
│   ├── sidebar.html/js/css    # Main extension interface
│   ├── content.js/css         # Content injection scripts
│   └── icons/                 # Extension icons (16-96px)
│
├── complete-waitlist-setup.sql # 🗄️ Complete Database Schema
├── O1_PROMPT_TEMPLATE.md      # 🧠 Expert O1 Prompt Template
└── README.md                  # 📖 Main Documentation
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

## 🛠️ Development

### Prerequisites
- Bun (JavaScript runtime and package manager)
- Supabase account with PostgreSQL database
- OpenRouter API key
- Vercel account for deployment

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENROUTER_API_KEY=your_openrouter_key
```

### Local Development
```bash
cd nextjs-app
bun install
bun dev
```

## 📋 Architecture

- **Frontend**: Next.js with React components and Tailwind CSS
- **Backend**: Next.js API routes (serverless functions on Vercel)
- **Database**: Supabase PostgreSQL with waitlist logic and triggers
- **Extension**: Firefox extension with secure API communication
- **AI**: OpenRouter integration for prompt enhancement
- **Email**: Development logging (ready for production email service)

## 🔐 Security Features

- ✅ Secure redemption code system with database validation
- ✅ Waitlist position tracking and approval logic
- ✅ Rate limiting on API endpoints
- ✅ HTTPS everywhere with Vercel SSL
- ✅ Row Level Security on Supabase database
- ✅ No hardcoded credentials in extension or frontend

## 📄 License

MIT License - See LICENSE file for details.

---
**Status**: Production Ready ✅ | **Deployment**: Ready for Vercel | **Extension**: Ready for Firefox Store
