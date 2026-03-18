/**
 * The Stone Surfaces — Admin Configuration
 * Central config for admin area: auth, endpoints, Supabase, constants
 */
const ADMIN_CONFIG = {
  // Authentication
  AUTH_HASH: '02ee04a3f06e95d795e9e0e22ab87d313c06c07077f54f1a7e96a983485011f1',
  SESSION_KEY: 'tss-admin-session',
  SESSION_DURATION_MS: 8 * 60 * 60 * 1000, // 8 hours

  // API Mode: 'api' (n8n webhooks + Supabase) | 'local' (localStorage fallback)
  API_MODE: 'api',

  // Supabase Cloudfy — reads proxied via n8n webhooks (key server-side only)
  SUPABASE: {
    URL: 'https://grouplivingcentipede-supabase.cloudfy.live',
    ANON_KEY: '',
    STORAGE_BUCKET: 'blog-images',
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

  // Pagination
  LEADS_PER_PAGE: 20,
  POSTS_PER_PAGE: 15,

  // localStorage keys (used as offline cache)
  STORAGE_KEYS: {
    LEADS: 'tss-leads',
    POSTS: 'tss-blog-posts',
  },
};
