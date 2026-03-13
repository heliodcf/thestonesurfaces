-- ============================================================
-- The Stone Surfaces — Supabase Migration
-- Run this in the Supabase SQL Editor to set up the database
-- ============================================================

-- 1. Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT DEFAULT '',
  featured_image TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'design-trends',
  tags TEXT[] DEFAULT '{}',
  author_name TEXT DEFAULT 'The Stone Surfaces',
  author_avatar TEXT DEFAULT 'TS',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'scheduled')),
  read_time TEXT DEFAULT '3 min read',
  seo_title_tag TEXT DEFAULT '',
  seo_meta_description TEXT DEFAULT '',
  seo_canonical_url TEXT DEFAULT '',
  seo_og_title TEXT DEFAULT '',
  seo_og_description TEXT DEFAULT '',
  seo_alt_text TEXT DEFAULT '',
  seo_schema_article JSONB DEFAULT '{}',
  primary_keyword TEXT DEFAULT '',
  secondary_keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

-- 2. Leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  project_type TEXT,
  materials_interest TEXT[],
  message TEXT,
  source TEXT DEFAULT 'chat'
    CHECK (source IN ('chat', 'quote-form', 'trade-form', 'manual')),
  status TEXT DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost', 'abandoned_cart')),
  chat_transcript JSONB DEFAULT '[]',
  data_collected JSONB DEFAULT '{}',
  is_complete BOOLEAN DEFAULT false,
  abandoned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_is_complete ON leads(is_complete);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- 3. Settings (key-value store for admin config)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed notification settings
INSERT INTO settings (key, value) VALUES
  ('notification_emails', '[]'::jsonb),
  ('notification_new_lead', 'true'::jsonb),
  ('notification_abandoned_cart', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 4. RLS Policies

-- Blog Posts: public can read published, service_role has full access
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published posts"
  ON blog_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Service role full access on blog_posts"
  ON blog_posts FOR ALL
  USING (auth.role() = 'service_role');

-- Leads: no public access, service_role only
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on leads"
  ON leads FOR ALL
  USING (auth.role() = 'service_role');

-- Settings: no public access, service_role only
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on settings"
  ON settings FOR ALL
  USING (auth.role() = 'service_role');

-- 5. Storage bucket (create via Supabase Dashboard > Storage)
-- Bucket name: blog-images
-- Public: Yes (for serving images on the site)
-- Max file size: 5MB
-- Allowed types: image/webp, image/jpeg, image/png
-- NOTE: Storage buckets cannot be created via SQL, use the Dashboard UI
