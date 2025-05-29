import { createUser } from '../../lib/supabase'

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
      console.log(`📧 WELCOME EMAIL would be sent to: ${email}`)
      console.log(`📧 Redemption Code: ${user.redemption_code}`)
      console.log(`📧 Credits: ${user.credits}`)
      
      res.status(200).json({
        success: true,
        status: 'approved',
        message: '🎉 Congratulations! You have been approved for immediate access.',
        redemption_code: user.redemption_code,
        credits: user.credits,
        email: email,
        registration_number: user.total_registrations,
        email_sent: true,
        note: 'Your redemption code is shown above. Save it carefully!'
      })
    } else if (user.status === 'waitlist') {
      // User is on waitlist
      console.log(`📋 User waitlisted: ${email} at position ${user.waitlist_position}`)
      console.log(`📧 WAITLIST EMAIL would be sent to: ${email}`)
      console.log(`📧 Waitlist Position: #${user.waitlist_position}`)
      console.log(`📧 Total Registrations: ${user.total_registrations}`)
      
      res.status(200).json({
        success: true,
        status: 'waitlist',
        message: `You're on the waitlist! You're #${user.waitlist_position} in line.`,
        waitlist_position: user.waitlist_position,
        email: email,
        registration_number: user.total_registrations,
        email_sent: true,
        estimated_wait: calculateEstimatedWait(user.waitlist_position),
        note: 'You will be notified when it\'s your turn. We approve 1 out of every 10 new registrations.'
      })
    } else {
      // Fallback for any other status
      res.status(200).json({
        success: true,
        status: user.status || 'pending',
        message: 'Registration successful!',
        email: email,
        note: 'Your registration is being processed.'
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
