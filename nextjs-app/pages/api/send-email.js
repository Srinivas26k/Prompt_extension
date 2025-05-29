// Simple email tracking endpoint for development
import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, type, data } = req.body

  try {
    console.log(`📧 Email would be sent to: ${email}`)
    console.log(`📧 Email type: ${type}`)
    console.log(`📧 Email data:`, data)

    // In development, we'll just log the email instead of sending it
    // In production, you would integrate with SendGrid, Resend, or Mailgun

    if (type === 'welcome') {
      console.log(`\n🎉 WELCOME EMAIL for ${email}:`)
      console.log(`Subject: Welcome to AI Prompt Enhancer - Your Access Code Inside!`)
      console.log(`Redemption Code: ${data.redemption_code}`)
      console.log(`Credits: ${data.credits}`)
    } else if (type === 'waitlist') {
      console.log(`\n📋 WAITLIST EMAIL for ${email}:`)
      console.log(`Subject: You're on the AI Prompt Enhancer Waitlist!`)
      console.log(`Waitlist Position: #${data.waitlist_position}`)
      console.log(`Total Registrations: ${data.total_registrations}`)
    }

    // For now, return success (in production, this would actually send the email)
    res.status(200).json({
      success: true,
      message: `Email logged for ${email}`,
      type,
      email_sent: true // Set to true for testing
    })

  } catch (error) {
    console.error('Email logging error:', error)
    res.status(500).json({
      success: false,
      error: 'Email logging failed',
      email_sent: false
    })
  }
}
