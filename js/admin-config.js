/**
 * The Stone Surfaces — Admin Configuration
 * Central config for admin area: auth, endpoints, Supabase, constants
 */
const ADMIN_CONFIG = {
  // Authentication
  AUTH_HASH: '2974e7d92b74a61e1ba74c57bdf4ee4bd9455ff8b0a1a31ecec5bd5fd2dac840',
  SESSION_KEY: 'tss-admin-session',
  SESSION_DURATION_MS: 8 * 60 * 60 * 1000, // 8 hours

  // API Mode: 'api' (n8n webhooks + Supabase) | 'local' (localStorage fallback)
  API_MODE: 'api',

  // Unsplash API (free tier — 50 req/hr)
  UNSPLASH_ACCESS_KEY: 'crJxgF336crUHzvqBHh1OHzm-7vjJe2mgbUJ39lrLBE',

  // Supabase Cloudfy — reads proxied via n8n webhooks (key server-side only)
  SUPABASE: {
    URL: 'https://grouplivingcentipede-supabase.cloudfy.live',
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzczNzgxMDQ1LCJleHAiOjE4MDUzMTcwNDV9.nNxpimWk059MIcP49TuqKHEoSaaiD0yWDT36Ej05zJg',
    STORAGE_BUCKET: 'blog-images',
    PRODUCT_STORAGE_BUCKET: 'product-images',
  },

  // n8n Webhook Endpoints — Cloudfy instance
  ENDPOINTS: {
    // Blog AI (n8n webhooks)
    BLOG_IDEAS: 'https://grouplivingcentipede-n8n.cloudfy.live/webhook/tss-blog-ideas',
    BLOG_GENERATE: 'https://grouplivingcentipede-n8n.cloudfy.live/webhook/tss-blog-generate',

    // Blog CRUD (n8n webhook — single endpoint, action-based)
    BLOG_CRUD: 'https://grouplivingcentipede-n8n.cloudfy.live/webhook/tss-blog-posts',

    // Settings CRUD (n8n webhook)
    SETTINGS_CRUD: 'https://grouplivingcentipede-n8n.cloudfy.live/webhook/tss-settings',

    // Leads CRUD (n8n webhook — proxies Supabase reads)
    LEADS_CRUD: 'https://grouplivingcentipede-n8n.cloudfy.live/webhook/tss-leads',

    // Product Sync (n8n webhook — triggers StoneProfits → Supabase sync)
    PRODUCT_SYNC: 'https://grouplivingcentipede-n8n.cloudfy.live/webhook/tss-product-sync',
  },

  // Lead statuses
  LEAD_STATUSES: [
    { value: 'new', label: 'New', color: '#3B82F6' },
    { value: 'contacted', label: 'Contacted', color: '#F59E0B' },
    { value: 'qualified', label: 'Qualified', color: '#8B5CF6' },
    { value: 'converted', label: 'Converted', color: '#059669' },
    { value: 'abandoned_cart', label: 'Abandoned', color: '#EF4444' },
  ],

  // Lead sources
  LEAD_SOURCES: [
    { value: 'chat', label: 'AI Chatbot' },
    { value: 'quote-form', label: 'Quote Form' },
    { value: 'trade-form', label: 'Trade Form' },
    { value: 'manual', label: 'Manual Entry' },
  ],

  // Blog categories
  BLOG_CATEGORIES: [
    { value: 'design-trends', label: 'Design Trends' },
    { value: 'stone-care', label: 'Stone Care' },
    { value: 'industry-news', label: 'Industry News' },
    { value: 'project-spotlights', label: 'Project Spotlights' },
    { value: 'hanstone-updates', label: 'Hanstone Updates' },
  ],

  // Blog post statuses
  BLOG_STATUSES: [
    { value: 'draft', label: 'Draft', color: '#A8A29E' },
    { value: 'published', label: 'Published', color: '#059669' },
    { value: 'scheduled', label: 'Scheduled', color: '#3B82F6' },
  ],

  // Product catalog
  PRODUCT_CATEGORIES: [
    { value: 'Quartzite', label: 'Quartzite' },
    { value: 'Quartz', label: 'Quartz' },
    { value: 'Granite', label: 'Granite' },
    { value: 'Marble', label: 'Marble' },
    { value: 'Hard Marble', label: 'Hard Marble' },
    { value: 'Dolomite', label: 'Dolomite' },
    { value: 'Onyx', label: 'Onyx' },
    { value: 'Travertine', label: 'Travertine' },
    { value: 'Soapstone', label: 'Soapstone' },
    { value: 'Semi Precious', label: 'Semi Precious' },
    { value: 'Limestone', label: 'Limestone' },
  ],

  PRODUCT_FINISHES: [
    { value: 'Polished', label: 'Polished' },
    { value: 'Leather', label: 'Leather' },
    { value: 'Honed', label: 'Honed' },
    { value: 'Satin', label: 'Satin' },
    { value: 'Brushed', label: 'Brushed' },
    { value: 'Honed and Filled', label: 'Honed and Filled' },
    { value: 'Dual Polished/Leather', label: 'Dual Polished/Leather' },
    { value: 'Dual Polished/Honed', label: 'Dual Polished/Honed' },
    { value: 'Dual Honed/Leather', label: 'Dual Honed/Leather' },
  ],

  PRODUCT_LOCATIONS: [
    { value: 'Miami', label: 'Miami', color: '#3B82F6' },
    { value: 'Orlando', label: 'Orlando', color: '#8B5CF6' },
    { value: 'Sarasota', label: 'Sarasota', color: '#059669' },
  ],

  // Pagination
  LEADS_PER_PAGE: 20,
  POSTS_PER_PAGE: 15,
  PRODUCTS_PER_PAGE: 24,

  // localStorage keys (used as offline cache)
  STORAGE_KEYS: {
    LEADS: 'tss-leads',
    POSTS: 'tss-blog-posts',
  },
};
