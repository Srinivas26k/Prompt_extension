import { getWaitlistStats, getUserWaitlistInfo } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get overall waitlist statistics
    try {
      const { stats, error } = await getWaitlistStats()
      
      if (error) {
        return res.status(500).json({ error: 'Failed to fetch waitlist stats' })
      }

      res.status(200).json({
        success: true,
        stats: {
          total_registrations: stats.total_registrations,
          approved_count: stats.approved_count,
          waitlist_count: stats.total_registrations - stats.approved_count,
          free_approval_limit: stats.free_approval_limit,
          current_approval_rate: stats.approved_count >= stats.free_approval_limit ? `1 in ${stats.waitlist_ratio}` : 'Immediate',
          slots_remaining: Math.max(0, stats.free_approval_limit - stats.approved_count)
        }
      })
    } catch (err) {
      console.error('Error fetching waitlist stats:', err)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    // Check specific user status
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' })
    }

    try {
      const { user, error } = await getUserWaitlistInfo(email)
      
      if (error && error.code !== 'PGRST116') { // Not found error
        return res.status(500).json({ error: 'Failed to fetch user info' })
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      res.status(200).json({
        success: true,
        user: {
          email: user.email,
          status: user.status,
          waitlist_position: user.waitlist_position,
          redemption_code: user.redemption_code,
          created_at: user.created_at
        }
      })
    } catch (err) {
      console.error('Error fetching user info:', err)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
