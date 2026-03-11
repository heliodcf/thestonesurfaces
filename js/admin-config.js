/**
 * The Stone Surfaces — Admin Configuration
 * Central config for admin area: auth, endpoints, constants
 */
const ADMIN_CONFIG = {
  // Authentication
  AUTH_HASH: '2974e7d92b74a61e1ba74c57bdf4ee4bd9455ff8b0a1a31ecec5bd5fd2dac840',
  SESSION_KEY: 'tss-admin-session',
  SESSION_DURATION_MS: 8 * 60 * 60 * 1000, // 8 hours

  // API Mode: 'api' (n8n webhooks) | 'local' (localStorage fallback)
  API_MODE: 'api',

  // n8n Webhook Endpoints — update these when workflows are deployed
  ENDPOINTS: {
    // Leads
    LEADS_LIST: null,       // GET  /webhook/leads?status=&source=&from=&to=
    LEADS_CREATE: null,     // POST /webhook/leads
    LEADS_UPDATE: null,     // PATCH /webhook/leads/{id}

    // Blog AI
    BLOG_IDEAS: null,       // POST /webhook/blog-ideas
    BLOG_GENERATE: null,    // POST /webhook/blog-generate
    BLOG_SEO: null,         // POST /webhook/blog-seo

    // Blog CRUD
    BLOG_POSTS_LIST: null,  // GET  /webhook/blog-posts?status=
    BLOG_POSTS_SAVE: null,  // PUT  /webhook/blog-posts/{id}
  },

  // Lead statuses
  LEAD_STATUSES: [
    { value: 'new', label: 'New', color: '#3B82F6' },
    { value: 'contacted', label: 'Contacted', color: '#F59E0B' },
    { value: 'qualified', label: 'Qualified', color: '#8B5CF6' },
    { value: 'converted', label: 'Converted', color: '#059669' },
  ],

  // Lead sources
  LEAD_SOURCES: [
    { value: 'chatbot', label: 'AI Chatbot' },
    { value: 'contact_form', label: 'Contact Form' },
    { value: 'trade_form', label: 'Trade Form' },
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

  // localStorage keys (used as fallback or for local data)
  STORAGE_KEYS: {
    LEADS: 'tss-leads',
    POSTS: 'tss-blog-posts',
  },
};
