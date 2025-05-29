import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper functions
export async function findUserByCode(code) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('redemption_code', code)
    .single()
  
  return { user: data, error }
}

export async function createUser(email) {
  try {
    // Start a transaction-like process
    // First, get current waitlist settings and increment registration count
    const { data: settings, error: settingsError } = await supabase
      .from('waitlist_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (settingsError) {
      return { user: null, error: settingsError }
    }

    // Increment total registrations
    const newTotalRegistrations = settings.total_registrations + 1
    
    // Determine if user should be approved
    let shouldApprove = false
    let newApprovedCount = settings.approved_count

    if (settings.approved_count < settings.free_approval_limit) {
      // First 25 users get instant approval
      shouldApprove = true
      newApprovedCount = settings.approved_count + 1
    } else {
      // After 25, check if this is the lucky registration (1 out of 10)
      const registrationsAfterLimit = newTotalRegistrations - settings.free_approval_limit
      if (registrationsAfterLimit % settings.waitlist_ratio === 0) {
        shouldApprove = true
        newApprovedCount = settings.approved_count + 1
      }
    }

    // Update settings
    await supabase
      .from('waitlist_settings')
      .update({
        total_registrations: newTotalRegistrations,
        approved_count: newApprovedCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)

    // Create user record
    const userData = {
      email,
      credits: 10,
      is_verified: true
    }

    if (shouldApprove) {
      userData.redemption_code = generateCode()
      userData.status = 'approved'
      userData.approved_at = new Date().toISOString()
    } else {
      // Get waitlist position
      const { data: waitlistPosition } = await supabase
        .rpc('get_next_waitlist_position')
      
      userData.status = 'waitlist'
      userData.waitlist_position = waitlistPosition || 1
    }

    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()

    // Add additional info for response
    if (data) {
      data.total_registrations = newTotalRegistrations
    }

    return { user: data, error }
  } catch (err) {
    console.error('Error in createUser:', err)
    return { user: null, error: err }
  }
}

export async function logUsage(userId, action, prompt = null, response = null) {
  const { error } = await supabase
    .from('usage_logs')
    .insert([
      {
        user_id: userId,
        action,
        prompt,
        response
      }
    ])
  
  return { error }
}

export async function updateUserCredits(userId, newCredits) {
  const { data, error } = await supabase
    .from('users')
    .update({ credits: newCredits })
    .eq('id', userId)
    .select()
    .single()
  
  return { user: data, error }
}

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function getWaitlistStats() {
  const { data, error } = await supabase
    .from('waitlist_settings')
    .select('*')
    .eq('id', 1)
    .single()
  
  return { stats: data, error }
}

export async function getUserWaitlistInfo(email) {
  const { data, error } = await supabase
    .from('users')
    .select('email, status, waitlist_position, redemption_code, created_at')
    .eq('email', email)
    .single()
  
  return { user: data, error }
}

export async function sendWelcomeEmail(email, redemptionCode) {
  try {
    // In development, use our local email logging endpoint
    // In production, you would use SendGrid, Resend, or Mailgun
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        type: 'welcome',
        data: {
          redemption_code: redemptionCode,
          credits: 10
        }
      })
    })

    const result = await response.json()
    return { success: result.success, data: result }

  } catch (err) {
    console.error('Error sending welcome email:', err)
    return { success: false, error: err }
  }
}

export async function sendWaitlistEmail(email, position, totalRegistrations) {
  try {
    // In development, use our local email logging endpoint
    // In production, you would use SendGrid, Resend, or Mailgun
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        type: 'waitlist',
        data: {
          waitlist_position: position,
          total_registrations: totalRegistrations
        }
      })
    })

    const result = await response.json()
    return { success: result.success, data: result }

  } catch (err) {
    console.error('Error sending waitlist email:', err)
    return { success: false, error: err }
  }
}
