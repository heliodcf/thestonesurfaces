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
-- NOTE: service_role bypasses RLS automatically in Supabase — no explicit policy needed.
-- auth.role() = 'service_role' causes errors in SQL editor (no JWT context).

-- Blog Posts: public (anon) can read published only
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published posts"
  ON blog_posts FOR SELECT
  USING (status = 'published');

-- Leads: no public access (service_role bypasses RLS automatically)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Settings: no public access (service_role bypasses RLS automatically)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 5. Storage bucket (create via Supabase Dashboard > Storage)
-- Bucket name: blog-images
-- Public: Yes (for serving images on the site)
-- Max file size: 5MB
-- Allowed types: image/webp, image/jpeg, image/png
-- NOTE: Storage buckets cannot be created via SQL, use the Dashboard UI

-- 6. Products (synced from StoneProfits + TSS enrichments)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- StoneProfits sync fields
  sps_item_id INT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  sku TEXT DEFAULT '',
  category TEXT NOT NULL,
  category_id INT,
  type TEXT DEFAULT 'SLAB',
  thickness TEXT DEFAULT '',
  finish_id INT,
  finish_name TEXT DEFAULT 'Polished',
  image_filename TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  location_id INT,
  location_name TEXT DEFAULT '',
  block_number TEXT DEFAULT '',
  bundle_number TEXT DEFAULT '',
  avg_length NUMERIC DEFAULT 0,
  avg_width NUMERIC DEFAULT 0,
  available_qty_sf NUMERIC DEFAULT 0,
  available_slabs INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  slab_options TEXT DEFAULT 'Full Slab',
  kind TEXT DEFAULT 'Stock',
  alternate_name TEXT DEFAULT '',

  -- TSS enrichment fields (managed via admin)
  description TEXT DEFAULT '',
  application_images TEXT[] DEFAULT '{}',

  -- Metadata
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_sps_item_id ON products(sps_item_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_location ON products(location_name);
CREATE INDEX IF NOT EXISTS idx_products_finish ON products(finish_name);
CREATE INDEX IF NOT EXISTS idx_products_thickness ON products(thickness);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('english', name));

-- Products: public can read all
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read products"
  ON products FOR SELECT
  USING (true);

-- 7. Storage bucket: product-images
-- Create via Supabase Dashboard > Storage
-- Bucket name: product-images
-- Public: Yes
-- Max file size: 5MB
-- Allowed types: image/webp, image/jpeg, image/png
