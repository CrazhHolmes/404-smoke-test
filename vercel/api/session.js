import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const { session_id, score, tip_clicked, theme } = req.body
    const { site } = req.query
    
    // Log session data (optional - for analytics)
    console.log('Game session:', { site, session_id, score, tip_clicked, theme })
    
    return res.status(200).json({ success: true })
    
  } catch (err) {
    console.error('Session error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
