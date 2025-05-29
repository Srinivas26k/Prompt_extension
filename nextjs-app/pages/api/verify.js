import { findUserByCode } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code } = req.body

  if (!code) {
    return res.status(400).json({ error: 'Redemption code required' })
  }

  try {
    const { user, error } = await findUserByCode(code)
    
    if (error || !user) {
      return res.status(404).json({ error: 'Invalid redemption code' })
    }

    res.status(200).json({
      success: true,
      message: 'Code verified successfully',
      user: {
        email: user.email,
        credits: user.credits,
        is_verified: user.is_verified
      }
    })
  } catch (err) {
    console.error('Verification error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
