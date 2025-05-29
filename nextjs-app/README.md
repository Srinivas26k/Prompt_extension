# AI Prompt Enhancer - Next.js Application

A modern, serverless AI prompt enhancement application built with Next.js, Tailwind CSS, shadcn/ui, and Supabase.

## 🚀 Features

- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Responsive Design**: Works perfectly on desktop and mobile
- **Email Verification**: Secure user registration with verification codes
- **Real-time**: Live updates and smooth animations with Framer Motion
- **Dark Theme**: Beautiful dark theme optimized for developers
- **API Integration**: RESTful API endpoints for Firefox extension
- **Database**: Supabase for user management and usage tracking

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Animations**: Framer Motion
- **Database**: Supabase
- **Package Manager**: Bun
- **Deployment**: Vercel

## 📦 Installation

1. **Install dependencies**:
   ```bash
   cd nextjs-app
   bun install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

3. **Set up Supabase**:
   - Create a new Supabase project
   - Run the SQL from `database.sql` in your Supabase SQL editor
   - Copy your project URL and anon key to `.env.local`

4. **Start development server**:
   ```bash
   bun run dev
   ```

5. **Open browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

The application uses a minimal database schema:

```sql
-- Users table for email verification
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  verification_code VARCHAR(6),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP
);

-- Usage tracking
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);
```

## 🔧 API Endpoints

- `GET /api/health` - Health check
- `POST /api/register` - Register user email
- `POST /api/verify` - Verify email with code
- `POST /api/enhance` - Enhance AI prompts

## 🌐 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**:
   ```bash
   bun add -D vercel
   bunx vercel
   ```

2. **Set environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_APP_URL`

3. **Deploy**:
   ```bash
   bunx vercel --prod
   ```

### Manual Deployment

1. **Build the application**:
   ```bash
   bun run build
   ```

2. **Start production server**:
   ```bash
   bun run start
   ```

## 🔌 Firefox Extension Integration

The application is designed to work with the Firefox extension in `../firefox-extension/`. 

To connect the extension:

1. Update the API base URL in `firefox-extension/background.js`:
   ```javascript
   const CONFIG = {
     API_BASE_URL: 'https://your-app.vercel.app', // Your deployed URL
     // ... rest of config
   };
   ```

2. Load the extension in Firefox for testing

## 📱 Browser Compatibility

- ✅ Firefox (Primary target)
- ✅ Chrome/Edge
- ✅ Safari
- ✅ Mobile browsers

## 🔒 Security Features

- CORS configuration for browser extension
- Input validation and sanitization
- Rate limiting (configurable)
- Secure environment variable handling
- Database Row Level Security (RLS)

## 🎨 Customization

### Theming
The app uses CSS variables for theming. You can customize colors in `styles/globals.css`.

### Components
All UI components are in `components/ui/` and can be customized or replaced.

### API Routes
Add new API endpoints in `pages/api/` following the existing pattern.

## 📊 Monitoring

- Built-in health check endpoint
- Usage logging to database
- Error boundaries for React components
- Console logging for debugging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section below
2. Open an issue on GitHub
3. Contact support

## 🔧 Troubleshooting

### Common Issues

1. **Tailwind CSS not working**:
   - Ensure you're using Tailwind CSS v3.x (not v4)
   - Check `tailwind.config.js` configuration

2. **API calls failing**:
   - Check environment variables
   - Verify Supabase connection
   - Check browser console for CORS errors

3. **Extension not connecting**:
   - Update API base URL in extension
   - Check network tab for failed requests
   - Verify Firefox extension permissions

### Development Tips

- Use `bun run dev` for hot reloading
- Check browser console for errors
- Use React Developer Tools for debugging
- Monitor Supabase logs for database issues
