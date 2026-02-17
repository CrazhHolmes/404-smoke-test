-- 404 Smoke Test - Supabase Schema
-- Free tier compatible

-- Sites table
CREATE TABLE IF NOT EXISTS sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id),
  name text NOT NULL,
  domain text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  api_key text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  plan text DEFAULT 'free', -- free, pro, business
  bmc_link text DEFAULT 'https://buymeacoffee.com',
  bmc_username text,
  game_title text DEFAULT 'Lost? Catch Some Ghosts!',
  game_enabled boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on sites
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

-- Sites policies
CREATE POLICY "Public can read sites by slug" ON sites
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create sites" ON sites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sites" ON sites
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sites" ON sites
  FOR DELETE USING (auth.uid() = user_id);

-- Error logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites (id) NOT NULL,
  broken_url text NOT NULL,
  broken_path text GENERATED ALWAYS AS (split_part(broken_url, '/', 4)) STORED,
  referrer text,
  referrer_domain text GENERATED ALWAYS AS (
    CASE 
      WHEN referrer IS NULL THEN NULL
      ELSE split_part(replace(replace(referrer, 'https://', ''), 'http://', ''), '/', 1)
    END
  ) STORED,
  ip_address inet,
  user_agent text,
  country text DEFAULT 'US',
  device_type text DEFAULT 'desktop',
  browser text,
  os text,
  was_redirected boolean DEFAULT true,
  redirect_url text,
  tip_received boolean DEFAULT false,
  tip_amount_cents integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_error_logs_site_id ON error_logs(site_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_broken_path ON error_logs(broken_path);

-- Enable RLS on error_logs
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site owners can view their error logs" ON error_logs
  FOR SELECT USING (
    site_id IN (SELECT id FROM sites WHERE user_id = auth.uid())
  );

CREATE POLICY "API can insert error logs" ON error_logs
  FOR INSERT WITH CHECK (true);

-- Tips table
CREATE TABLE IF NOT EXISTS tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites (id) NOT NULL,
  error_log_id uuid REFERENCES error_logs (id),
  amount_cents integer NOT NULL,
  currency text DEFAULT 'usd',
  stripe_payment_intent_id text,
  stripe_connect_transfer_id text,
  payout_status text DEFAULT 'pending',
  payout_processed_at timestamp with time zone,
  platform_fee_cents integer GENERATED ALWAYS AS (amount_cents * 5 / 100) STORED,
  net_payout_cents integer GENERATED ALWAYS AS (amount_cents * 95 / 100) STORED,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site owners can view their tips" ON tips
  FOR SELECT USING (
    site_id IN (SELECT id FROM sites WHERE user_id = auth.uid())
  );

-- Monthly hit counter (replaces Redis)
CREATE TABLE IF NOT EXISTS hit_counters (
  site_id uuid REFERENCES sites (id),
  month text NOT NULL,
  count integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (site_id, month)
);

-- Function to increment counter
CREATE OR REPLACE FUNCTION increment_hit_counter(p_site_id uuid, p_month text)
RETURNS integer AS $$
DECLARE
  new_count integer;
BEGIN
  INSERT INTO hit_counters (site_id, month, count)
  VALUES (p_site_id, p_month, 1)
  ON CONFLICT (site_id, month)
  DO UPDATE SET 
    count = hit_counters.count + 1,
    updated_at = now()
  RETURNING count INTO new_count;
  
  RETURN COALESCE(new_count, 1);
END;
$$ LANGUAGE plpgsql;

-- Insert a demo site for testing
INSERT INTO sites (name, domain, slug, api_key, plan, bmc_link, bmc_username, game_title)
VALUES (
  'Demo Site',
  'demo.example.com',
  'demo-site',
  'demo-api-key-123456',
  'free',
  'https://buymeacoffee.com/warlockholmes',
  'warlockholmes',
  'Lost? Catch Some Ghosts!'
)
ON CONFLICT (slug) DO NOTHING;
