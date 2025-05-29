# Expert O1 Prompt Template for AI Prompt Enhancer

## Role
You are a senior full-stack developer and DevOps engineer specializing in production-ready web applications, browser extensions, and database management systems. You have expertise in Next.js, Supabase, Firefox extension development, Vercel deployment, and implementing robust waitlist systems with email automation.

## Goal
Analyze the provided AI Prompt Enhancer codebase and create a production-ready deployment plan that ensures:
1. Clean, optimized codebase with zero unnecessary files
2. Seamless Vercel deployment with proper environment configuration
3. Firefox extension production build with correct API endpoints
4. Functional waitlist system with email notifications
5. Donation integration with periodic notifications
6. Comprehensive error handling and monitoring

## Return Format
Provide a structured response with:
1. **File Cleanup Analysis** - List of files to remove with justification
2. **Production Deployment Steps** - Exact terminal commands and configurations
3. **Environment Setup** - All required environment variables and secrets
4. **Testing Strategy** - Commands to verify each component works
5. **Monitoring Setup** - Error tracking and performance monitoring
6. **Post-deployment Checklist** - Verification steps for live system

## Warnings
- Never remove files that are imported/referenced by other components
- Ensure all API endpoints match between frontend and backend
- Verify database schema changes don't break existing data
- Test extension permissions and manifest compatibility
- Validate email service integration before production
- Confirm donation notification timing doesn't spam users

## Context Dump

### Current Project Structure
```
nextjs-app/                     # Main Next.js application
├── pages/api/                  # API routes (register, enhance, send-email)
├── components/                 # React components (EmailVerification, Hero, Layout)
├── lib/                       # Utilities (supabase client, utils)
├── public/                    # Static assets
├── styles/                    # CSS files
├── package.json               # Dependencies and scripts
├── vercel.json                # Vercel deployment config
└── .env.production            # Production environment variables

firefox-extension/              # Browser extension
├── background.js              # Main extension logic with API calls
├── content.js                 # Content script for page interaction
├── popup.html/js              # Extension popup interface
├── sidebar.html/js/css        # Sidebar for prompt enhancement
├── manifest.json              # Extension manifest and permissions
└── icons/                     # Extension icons (16, 32, 48, 96px)

Database Files:
├── complete-waitlist-setup.sql # Complete database schema with waitlist logic
└── supabase-setup.md          # Database setup instructions

Unnecessary Folders to Remove:
├── archive/                   # Old files and backups
├── docs/                      # Multiple redundant documentation files
├── scripts/                   # Various deployment scripts (can be simplified)
├── streamlit_backend/         # No longer needed (replaced by Next.js)
├── vercel-api/               # Duplicate API endpoints
├── github-pages/             # Old frontend
├── github-pages-frontend/    # Another old frontend
├── vercel-backend/           # Redundant backend
├── supabase-db/              # Duplicate database files
└── .backup_files/            # Backup files
```

### Current Implementation Status
- ✅ Waitlist system with PostgreSQL functions implemented
- ✅ Next.js API routes for registration, enhancement, email sending
- ✅ Firefox extension with localhost API integration
- ✅ Database schema with users table, waitlist_settings table
- ✅ Email verification and waitlist position tracking
- 🔄 Production deployment pending
- 🔄 Firefox extension production URL update pending
- 🔄 Donation notification system pending

### Key Technical Requirements
1. **Waitlist Logic**: First 25 users get immediate access, then 1:10 approval ratio
2. **Email Integration**: Automatic emails for approved/waitlist status
3. **API Security**: Proper error handling and rate limiting
4. **Extension Permissions**: Content script access to enhance prompts
5. **Database Triggers**: Automatic waitlist position calculation
6. **Production URLs**: All localhost references must be updated

### Current API Endpoints
- POST /api/register - User registration with waitlist logic
- POST /api/enhance - Prompt enhancement using OpenRouter
- GET /api/check_credits - Credit verification for users
- POST /api/use_credit - Credit consumption tracking
- POST /api/send-email - Email sending (currently development logging)

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENROUTER_API_KEY=your_openrouter_key
```

### Firefox Extension Configuration
Currently uses: `API_BASE_URL: 'http://localhost:3000'`
Needs update to: Production Vercel URL

### Database Schema
```sql
-- Users table with waitlist functionality
users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  redemption_code VARCHAR(50),
  credits INTEGER DEFAULT 50,
  waitlist_position INTEGER,
  status VARCHAR(20) DEFAULT 'pending', -- approved, waitlist, pending
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Waitlist settings
waitlist_settings (
  id SERIAL PRIMARY KEY,
  free_access_limit INTEGER DEFAULT 25,
  approval_ratio INTEGER DEFAULT 10,
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Donation Integration Requirements
- Add Buy Me a Coffee notification every 5 minutes
- Non-intrusive notification system
- Link: https://buymeacoffee.com/srinivaskiv
- Should appear in both website and extension

### Known Issues to Address
1. Email service currently logs to development endpoint (needs real email service)
2. Firefox extension has localhost URLs (needs production update)
3. Multiple redundant files and folders cluttering the project
4. No error monitoring or analytics in production
5. Missing donation notification system

### Success Criteria
1. Clean project structure with only necessary files
2. Successful Vercel deployment with working APIs
3. Firefox extension working with production URLs
4. Waitlist system functioning correctly
5. Email notifications working
6. Donation notifications appearing every 5 minutes
7. All tests passing in production environment

Generate a comprehensive action plan that addresses all these requirements while ensuring the codebase is production-ready and maintainable.
