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
    const { site, url, referrer, country = 'US' } = req.body
    
    if (!site || !url) {
      return res.status(400).json({ error: 'Missing required fields: site, url' })
    }
    
    // Find site by slug
    const { data: siteData, error: siteError } = await supabase
      .from('sites')
      .select('id, slug, plan, bmc_link, game_enabled, is_active')
      .eq('slug', site)
      .eq('is_active', true)
      .single()
    
    if (siteError || !siteData) {
      console.error('Site lookup error:', siteError)
      return res.status(404).json({ error: 'Site not found' })
    }
    
    // Check monthly limit (free tier = 5000)
    const month = new Date().toISOString().slice(0, 7)
    const { data: counterData } = await supabase
      .from('hit_counters')
      .select('count')
      .eq('site_id', siteData.id)
      .eq('month', month)
      .single()
    
    const currentHits = counterData?.count || 0
    const limit = siteData.plan === 'free' ? 5000 : 
                  siteData.plan === 'pro' ? 50000 : 999999
    
    if (currentHits >= limit) {
      return res.status(429).json({ 
        error: 'Monthly limit exceeded',
        limit,
        current: currentHits
      })
    }
    
    // Increment counter
    await supabase.rpc('increment_hit_counter', {
      p_site_id: siteData.id,
      p_month: month
    })
    
    // Log the error
    const { data: errorLog, error: logError } = await supabase
      .from('error_logs')
      .insert({
        site_id: siteData.id,
        broken_url: url,
        referrer: referrer,
        ip_address: req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress,
        user_agent: req.headers['user-agent'],
        country: country
      })
      .select()
      .single()
    
    if (logError) {
      console.error('Error logging:', logError)
    }
    
    // Return redirect URL with BMC link
    const redirectUrl = `/game/play.html?site=${siteData.slug}&from=${encodeURIComponent(url)}&bmc=${encodeURIComponent(siteData.bmc_link)}`
    
    return res.status(200).json({
      redirect_url: redirectUrl,
      hit_count: currentHits + 1,
      limit,
      bmc_link: siteData.bmc_link
    })
    
  } catch (err) {
    console.error('Track error:', err)
    return res.status(500).json({ error: 'Internal server error', details: err.message })
  }
}
