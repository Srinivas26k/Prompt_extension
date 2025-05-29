-- Complete Waitlist System Setup for Existing Database
-- Copy and paste this entire code into Supabase SQL Editor

-- Step 1: Add missing columns to existing users table (only if they don't exist)
DO $$ 
BEGIN 
    -- Add waitlist_position column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'waitlist_position') THEN
        ALTER TABLE users ADD COLUMN waitlist_position INTEGER;
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'status') THEN
        ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
    
    -- Add approved_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'approved_at') THEN
        ALTER TABLE users ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Step 2: Create waitlist_settings table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS waitlist_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_registrations INTEGER DEFAULT 0,
  approved_count INTEGER DEFAULT 0,
  free_approval_limit INTEGER DEFAULT 25,
  waitlist_ratio INTEGER DEFAULT 10,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Insert default settings
INSERT INTO waitlist_settings (id, total_registrations, approved_count, free_approval_limit, waitlist_ratio)
VALUES (1, 0, 0, 25, 10)
ON CONFLICT (id) DO NOTHING;

-- Step 4: Create helper functions
CREATE OR REPLACE FUNCTION get_next_waitlist_position()
RETURNS INTEGER AS $$
DECLARE
  next_position INTEGER;
BEGIN
  SELECT COALESCE(MAX(waitlist_position), 0) + 1 
  INTO next_position 
  FROM users 
  WHERE status = 'waitlist';
  
  RETURN next_position;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION should_approve_user()
RETURNS BOOLEAN AS $$
DECLARE
  settings RECORD;
  should_approve BOOLEAN := false;
BEGIN
  SELECT * INTO settings FROM waitlist_settings WHERE id = 1;
  
  -- If under free approval limit (first 25), approve immediately
  IF settings.approved_count < settings.free_approval_limit THEN
    should_approve := true;
  ELSE
    -- After 25, check if this is the lucky registration (1 out of 10)
    -- We add 1 because we're checking BEFORE incrementing total_registrations
    IF (settings.total_registrations - settings.free_approval_limit + 1) % settings.waitlist_ratio = 0 THEN
      should_approve := true;
    END IF;
  END IF;
  
  RETURN should_approve;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Update existing users to approved status if they have redemption codes
UPDATE users 
SET status = 'approved', 
    approved_at = COALESCE(approved_at, created_at)
WHERE redemption_code IS NOT NULL 
  AND (status IS NULL OR status = 'pending');

-- Step 6: Update waitlist settings with current counts
UPDATE waitlist_settings 
SET approved_count = (SELECT COUNT(*) FROM users WHERE status = 'approved'),
    total_registrations = (SELECT COUNT(*) FROM users)
WHERE id = 1;

-- Step 7: Add database indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_waitlist_position ON users(waitlist_position);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Step 8: Set up Row Level Security
ALTER TABLE waitlist_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access to waitlist settings" ON waitlist_settings;
DROP POLICY IF EXISTS "Allow service role to update waitlist settings" ON waitlist_settings;

-- Create new policies
CREATE POLICY "Allow read access to waitlist settings" ON waitlist_settings
FOR SELECT USING (true);

CREATE POLICY "Allow service role to update waitlist settings" ON waitlist_settings
FOR ALL USING (auth.role() = 'service_role');

-- Step 9: Create email template function for Supabase Edge Functions
CREATE OR REPLACE FUNCTION get_approval_email_template(user_email TEXT, redemption_code TEXT)
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'to', user_email,
    'subject', '🎉 Welcome to AI Prompt Enhancer - Your Access Code Inside!',
    'html', format('
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 40px 20px;">
      <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        <h1 style="color: #333; text-align: center; margin-bottom: 20px;">🚀 Welcome to AI Prompt Enhancer!</h1>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Congratulations! You now have access to our AI Prompt Enhancement system.</p>
        
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="color: #333; font-size: 14px; margin-bottom: 10px;">Your Redemption Code:</p>
          <h2 style="color: #667eea; font-size: 24px; letter-spacing: 3px; margin: 0;">%s</h2>
        </div>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          <strong>Next Steps:</strong><br>
          1. Install our Firefox extension<br>
          2. Use this code to activate your account<br>
          3. Start enhancing your AI prompts!
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://your-domain.com" style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Get Firefox Extension</a>
        </div>
        
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
          This code expires in 30 days. Keep it safe!
        </p>
      </div>
    </div>', redemption_code)
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_waitlist_email_template(user_email TEXT, waitlist_position INTEGER)
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'to', user_email,
    'subject', '📋 You''re on the AI Prompt Enhancer Waitlist!',
    'html', format('
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 40px 20px;">
      <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        <h1 style="color: #333; text-align: center; margin-bottom: 20px;">📋 You''re on the Waitlist!</h1>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Thank you for your interest in AI Prompt Enhancer!</p>
        
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="color: #333; font-size: 14px; margin-bottom: 10px;">Your Position:</p>
          <h2 style="color: #667eea; font-size: 24px; margin: 0;">#%s</h2>
        </div>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          We''re gradually rolling out access to ensure the best experience for everyone. 
          You''ll receive your access code as soon as a spot becomes available!
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          <strong>What to expect:</strong><br>
          • We''ll email you when it''s your turn<br>
          • No need to re-register<br>
          • Your spot is guaranteed
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://your-domain.com" style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Learn More</a>
        </div>
        
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
          Thank you for your patience!
        </p>
      </div>
    </div>', waitlist_position)
  );
END;
$$ LANGUAGE plpgsql;

-- Step 10: Show final status
SELECT 
  '✅ Waitlist system setup complete!' as status,
  'Current Settings:' as info,
  total_registrations,
  approved_count,
  free_approval_limit,
  waitlist_ratio,
  'Next ' || (free_approval_limit - approved_count) || ' registrations will be auto-approved' as note
FROM waitlist_settings WHERE id = 1;
