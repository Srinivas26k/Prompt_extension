import { createUser, sendWelcomeEmail, sendWaitlistEmail } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' })
  }

  try {
    const { user, error } = await createUser(email)
    
    if (error) {
      console.error('Registration error:', error)
      return res.status(500).json({ error: 'Registration failed' })
    }

    if (user.status === 'approved') {
      // User gets immediate access
      console.log(`✅ User approved: ${email} with code: ${user.redemption_code}`)
      
      // Send welcome email with redemption code
      const emailResult = await sendWelcomeEmail(email, user.redemption_code)
      if (!emailResult.success) {
        console.warn('Email sending failed, but user was created:', emailResult.error)
      }

      res.status(200).json({
        success: true,
        status: 'approved',
        message: 'Congratulations! You have been approved for immediate access.',
        redemption_code: user.redemption_code,
        credits: user.credits,
        email: email,
        registration_number: user.total_registrations,
        note: 'Check your email for the redemption code and setup instructions.'
      })
    } else {
      // User is on waitlist
      console.log(`📋 User waitlisted: ${email}, position: ${user.waitlist_position}`)
      
      // Send waitlist email
      const emailResult = await sendWaitlistEmail(email, user.waitlist_position, user.total_registrations)
      if (!emailResult.success) {
        console.warn('Waitlist email sending failed:', emailResult.error)
      }

      res.status(200).json({
        success: true,
        status: 'waitlist',
        message: 'You have been added to our waitlist.',
        waitlist_position: user.waitlist_position,
        registration_number: user.total_registrations,
        email: email,
        estimated_wait: calculateEstimatedWait(user.waitlist_position),
        note: 'You will receive an email when your access is approved. We approve 1 out of every 10 new registrations.'
      })
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

function calculateEstimatedWait(position) {
  // Rough estimation: if we approve 1 out of 10, and get ~10 registrations per day
  // Position 5 on waitlist might take ~5-10 days
  const daysEstimate = Math.ceil(position * 1.5) // Conservative estimate
  
  if (daysEstimate <= 1) return 'within 24 hours'
  if (daysEstimate <= 3) return '1-3 days'
  if (daysEstimate <= 7) return '3-7 days'
  if (daysEstimate <= 14) return '1-2 weeks'
  return 'several weeks'
}
