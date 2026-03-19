/**
 * The Stone Surfaces — Admin Data Layer
 * CRUD operations for Leads & Blog Posts
 * Primary: Supabase REST (reads) + n8n webhooks (writes/AI)
 * Fallback: localStorage for offline/unconfigured state
 */
const AdminData = (() => {

  // ─── Helpers ───────────────────────────────────────────────

  function generateId(prefix) {
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  }

  function slugify(text) {
    return text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  function calcReadTime(content) {
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    return Math.max(1, Math.ceil(words / 200)) + ' min read';
  }

  function getStorage(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  }

  function setStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // ─── Supabase REST Helper ─────────────────────────────────

  function supabaseConfigured() {
    return ADMIN_CONFIG.SUPABASE.URL && ADMIN_CONFIG.SUPABASE.ANON_KEY;
  }

  async function supabaseGet(table, params = '') {
    if (!supabaseConfigured()) return null;
    try {
      const res = await fetch(
        `${ADMIN_CONFIG.SUPABASE.URL}/rest/v1/${table}${params ? '?' + params : ''}`,
        {
          headers: {
            'apikey': ADMIN_CONFIG.SUPABASE.ANON_KEY,
            'Authorization': `Bearer ${ADMIN_CONFIG.SUPABASE.ANON_KEY}`,
          },
        }
      );
      if (!res.ok) throw new Error(`Supabase ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[AdminData] Supabase read failed:', err.message);
      return null;
    }
  }

  // ─── n8n Webhook Helper ────────────────────────────────────

  async function n8nPost(endpoint, body) {
    if (!endpoint) return null;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`n8n ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[AdminData] n8n call failed:', err.message);
      return null;
    }
  }

  // ─── Field Mapping: camelCase ↔ snake_case ────────────────

  function postToSnake(post) {
    return {
      id: post.id || undefined,
      title: post.title,
      slug: post.slug || slugify(post.title),
      content: post.content || '',
      excerpt: post.excerpt || '',
      featured_image: post.featuredImage || '',
      category: post.category || 'design-trends',
      tags: post.tags || [],
      author_name: post.author?.name || post.authorName || 'The Stone Surfaces',
      author_avatar: post.author?.avatar || post.authorAvatar || 'TS',
      status: post.status || 'draft',
      read_time: post.readTime || calcReadTime(post.content || ''),
      seo_title_tag: post.seo?.titleTag || '',
      seo_meta_description: post.seo?.metaDescription || '',
      seo_canonical_url: post.seo?.canonicalUrl || '',
      seo_og_title: post.seo?.ogTitle || '',
      seo_og_description: post.seo?.ogDescription || '',
      seo_alt_text: post.seo?.altText || '',
      seo_schema_article: post.seo?.schemaArticle || {},
      primary_keyword: post.primaryKeyword || '',
      secondary_keywords: post.secondaryKeywords || [],
      created_at: post.createdAt,
      updated_at: new Date().toISOString(),
      published_at: post.publishedAt,
    };
  }

  function postToCamel(row) {
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      content: row.content,
      excerpt: row.excerpt,
      featuredImage: row.featured_image,
      category: row.category,
      tags: row.tags || [],
      author: { name: row.author_name, avatar: row.author_avatar },
      status: row.status,
      readTime: row.read_time,
      seo: {
        titleTag: row.seo_title_tag,
        metaDescription: row.seo_meta_description,
        canonicalUrl: row.seo_canonical_url,
        ogTitle: row.seo_og_title,
        ogDescription: row.seo_og_description,
        altText: row.seo_alt_text,
        schemaArticle: row.seo_schema_article,
      },
      primaryKeyword: row.primary_keyword,
      secondaryKeywords: row.secondary_keywords,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      publishedAt: row.published_at,
    };
  }

  function leadToCamel(row) {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      projectType: row.project_type,
      materialsInterest: row.materials_interest,
      message: row.message,
      source: row.source,
      status: row.status,
      chatTranscript: row.chat_transcript,
      dataCollected: row.data_collected,
      isComplete: row.is_complete,
      abandonedAt: row.abandoned_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  // ─── BLOG POSTS ────────────────────────────────────────────

  async function getPosts(filters = {}) {
    // Try n8n CRUD endpoint first (admin context)
    const endpoint = ADMIN_CONFIG.ENDPOINTS.BLOG_CRUD;
    if (endpoint) {
      const result = await n8nPost(endpoint, {
        action: 'list',
        data: { status: filters.status || 'all' },
      });
      if (result && result.success && Array.isArray(result.data)) {
        const posts = result.data.map(postToCamel);
        setStorage(ADMIN_CONFIG.STORAGE_KEYS.POSTS, posts); // cache
        return posts;
      }
    }

    // localStorage fallback
    let posts = getStorage(ADMIN_CONFIG.STORAGE_KEYS.POSTS);
    if (posts.length === 0) {
      posts = getSeedPosts();
      setStorage(ADMIN_CONFIG.STORAGE_KEYS.POSTS, posts);
    }
    if (filters.status) posts = posts.filter(p => p.status === filters.status);
    return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async function savePost(post) {
    const isNew = !post.id;
    post.id = post.id || generateId('post');
    post.slug = post.slug || slugify(post.title);
    post.createdAt = post.createdAt || new Date().toISOString();
    post.updatedAt = new Date().toISOString();
    post.readTime = calcReadTime(post.content || '');
    post.author = post.author || { name: 'The Stone Surfaces', avatar: 'TS' };

    if (post.status === 'published' && !post.publishedAt) {
      post.publishedAt = new Date().toISOString();
    }

    // Auto-generate SEO if missing
    if (!post.seo || !post.seo.titleTag) {
      post.seo = generateLocalSEO(post);
    }

    // Try n8n CRUD endpoint
    const endpoint = ADMIN_CONFIG.ENDPOINTS.BLOG_CRUD;
    if (endpoint) {
      const result = await n8nPost(endpoint, {
        action: 'save',
        data: postToSnake(post),
      });
      if (result && result.success) {
        const saved = Array.isArray(result.data) ? result.data[0] : result.data;
        return saved ? postToCamel(saved) : post;
      }
    }

    // localStorage fallback
    const posts = getStorage(ADMIN_CONFIG.STORAGE_KEYS.POSTS);
    if (isNew) {
      posts.unshift(post);
    } else {
      const idx = posts.findIndex(p => p.id === post.id);
      if (idx !== -1) posts[idx] = post;
      else posts.unshift(post);
    }
    setStorage(ADMIN_CONFIG.STORAGE_KEYS.POSTS, posts);
    return post;
  }

  async function deletePost(id) {
    // Try n8n CRUD endpoint
    const endpoint = ADMIN_CONFIG.ENDPOINTS.BLOG_CRUD;
    if (endpoint) {
      const result = await n8nPost(endpoint, {
        action: 'delete',
        data: { id },
      });
      if (result && result.success) {
        // Also remove from cache
        const posts = getStorage(ADMIN_CONFIG.STORAGE_KEYS.POSTS);
        setStorage(ADMIN_CONFIG.STORAGE_KEYS.POSTS, posts.filter(p => p.id !== id));
        return true;
      }
    }

    // localStorage fallback
    const posts = getStorage(ADMIN_CONFIG.STORAGE_KEYS.POSTS);
    setStorage(ADMIN_CONFIG.STORAGE_KEYS.POSTS, posts.filter(p => p.id !== id));
    return true;
  }

  // ─── PUBLIC READS (via n8n CRUD — Supabase credentials server-side) ──

  async function getPublishedPosts(limit = 20) {
    const endpoint = ADMIN_CONFIG.ENDPOINTS.BLOG_CRUD;
    if (endpoint) {
      const result = await n8nPost(endpoint, {
        action: 'list',
        data: { status: 'published' },
      });
      if (result && result.success && Array.isArray(result.data)) {
        return result.data
          .map(postToCamel)
          .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt))
          .slice(0, limit);
      }
    }
    // Fallback to localStorage
    return getStorage(ADMIN_CONFIG.STORAGE_KEYS.POSTS)
      .filter(p => p.status === 'published')
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, limit);
  }

  async function getPostBySlug(slug) {
    const endpoint = ADMIN_CONFIG.ENDPOINTS.BLOG_CRUD;
    if (endpoint) {
      const result = await n8nPost(endpoint, {
        action: 'list',
        data: { status: 'published' },
      });
      if (result && result.success && Array.isArray(result.data)) {
        const match = result.data.find(p => p.slug === slug);
        if (match) return postToCamel(match);
      }
    }
    // Fallback to localStorage
    const posts = getStorage(ADMIN_CONFIG.STORAGE_KEYS.POSTS);
    return posts.find(p => p.slug === slug && p.status === 'published') || null;
  }

  async function getRelatedPosts(category, excludeId, limit = 3) {
    const endpoint = ADMIN_CONFIG.ENDPOINTS.BLOG_CRUD;
    if (endpoint) {
      const result = await n8nPost(endpoint, {
        action: 'list',
        data: { status: 'published' },
      });
      if (result && result.success && Array.isArray(result.data)) {
        return result.data
          .filter(p => p.category === category && p.id !== excludeId)
          .map(postToCamel)
          .slice(0, limit);
      }
    }
    return getStorage(ADMIN_CONFIG.STORAGE_KEYS.POSTS)
      .filter(p => p.status === 'published' && p.category === category && p.id !== excludeId)
      .slice(0, limit);
  }

  // ─── LEADS ─────────────────────────────────────────────────

  async function getLeads(filters = {}) {
    // Read via n8n webhook (Supabase key stays server-side)
    const endpoint = ADMIN_CONFIG.ENDPOINTS.LEADS_CRUD;
    if (endpoint) {
      const result = await n8nPost(endpoint, {
        action: 'list',
        data: { status: filters.status || 'all', source: filters.source || 'all' },
      });
      if (result && result.success && Array.isArray(result.data)) {
        let leads = result.data.map(leadToCamel);
        setStorage(ADMIN_CONFIG.STORAGE_KEYS.LEADS, leads);
        if (filters.search) {
          const q = filters.search.toLowerCase();
          leads = leads.filter(l =>
            (l.name || '').toLowerCase().includes(q) ||
            (l.email || '').toLowerCase().includes(q) ||
            (l.phone || '').includes(q)
          );
        }
        return leads;
      }
    }

    // localStorage fallback
    let leads = getStorage(ADMIN_CONFIG.STORAGE_KEYS.LEADS);
    if (leads.length === 0) {
      leads = getSeedLeads();
      setStorage(ADMIN_CONFIG.STORAGE_KEYS.LEADS, leads);
    }
    if (filters.status && filters.status !== 'all') leads = leads.filter(l => l.status === filters.status);
    if (filters.source && filters.source !== 'all') leads = leads.filter(l => l.source === filters.source);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      leads = leads.filter(l =>
        (l.name || '').toLowerCase().includes(q) ||
        (l.email || '').toLowerCase().includes(q) ||
        (l.phone || '').includes(q)
      );
    }
    return leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async function saveLead(lead) {
    lead.id = lead.id || generateId('lead');
    lead.createdAt = lead.createdAt || new Date().toISOString();
    lead.updatedAt = new Date().toISOString();

    // localStorage (always save locally as cache)
    const leads = getStorage(ADMIN_CONFIG.STORAGE_KEYS.LEADS);
    leads.unshift(lead);
    setStorage(ADMIN_CONFIG.STORAGE_KEYS.LEADS, leads);
    return lead;
  }

  async function updateLead(id, updates) {
    // Try n8n endpoint first (persists to Supabase)
    const endpoint = ADMIN_CONFIG.ENDPOINTS.LEADS_CRUD;
    if (endpoint) {
      const result = await n8nPost(endpoint, {
        action: 'update',
        data: { id, ...updates, updated_at: new Date().toISOString() },
      });
      if (result && result.success) {
        // Update local cache too
        const leads = getStorage(ADMIN_CONFIG.STORAGE_KEYS.LEADS);
        const idx = leads.findIndex(l => l.id === id);
        if (idx !== -1) {
          Object.assign(leads[idx], updates, { updatedAt: new Date().toISOString() });
          setStorage(ADMIN_CONFIG.STORAGE_KEYS.LEADS, leads);
        }
        return result.data || leads[idx];
      }
    }

    // localStorage fallback
    const leads = getStorage(ADMIN_CONFIG.STORAGE_KEYS.LEADS);
    const idx = leads.findIndex(l => l.id === id);
    if (idx === -1) return null;
    Object.assign(leads[idx], updates, { updatedAt: new Date().toISOString() });
    setStorage(ADMIN_CONFIG.STORAGE_KEYS.LEADS, leads);
    return leads[idx];
  }

  async function deleteLead(id) {
    // Try n8n endpoint first (deletes from Supabase)
    const endpoint = ADMIN_CONFIG.ENDPOINTS.LEADS_CRUD;
    if (endpoint) {
      const result = await n8nPost(endpoint, {
        action: 'delete',
        data: { id },
      });
      if (result && result.success) {
        const leads = getStorage(ADMIN_CONFIG.STORAGE_KEYS.LEADS);
        setStorage(ADMIN_CONFIG.STORAGE_KEYS.LEADS, leads.filter(l => l.id !== id));
        return true;
      }
    }

    // localStorage fallback
    const leads = getStorage(ADMIN_CONFIG.STORAGE_KEYS.LEADS);
    setStorage(ADMIN_CONFIG.STORAGE_KEYS.LEADS, leads.filter(l => l.id !== id));
    return true;
  }

  // ─── SETTINGS ──────────────────────────────────────────────

  async function getSettings() {
    const endpoint = ADMIN_CONFIG.ENDPOINTS.SETTINGS_CRUD;
    if (endpoint) {
      const result = await n8nPost(endpoint, { action: 'list' });
      if (result && result.success) return result.data;
    }
    // Fallback
    try {
      return JSON.parse(localStorage.getItem('tss-settings')) || {};
    } catch {
      return {};
    }
  }

  async function saveSetting(key, value) {
    const endpoint = ADMIN_CONFIG.ENDPOINTS.SETTINGS_CRUD;
    if (endpoint) {
      const result = await n8nPost(endpoint, {
        action: 'save',
        data: { key, value },
      });
      if (result && result.success) return true;
    }
    // Fallback
    try {
      const settings = JSON.parse(localStorage.getItem('tss-settings')) || {};
      settings[key] = value;
      localStorage.setItem('tss-settings', JSON.stringify(settings));
    } catch {}
    return true;
  }

  // ─── AI GENERATION (n8n webhooks) ──────────────────────────

  async function generateBlogIdeas() {
    const endpoint = ADMIN_CONFIG.ENDPOINTS.BLOG_IDEAS;
    if (endpoint) {
      const result = await n8nPost(endpoint, {
        niche: 'natural stone, quartz, interior design, countertops, South Florida',
        count: 3,
      });
      if (result && result.ideas) return result.ideas;
    }

    // Fallback: curated local ideas
    return getLocalIdeas();
  }

  async function generateBlogContent(title, angle, category) {
    const endpoint = ADMIN_CONFIG.ENDPOINTS.BLOG_GENERATE;
    if (endpoint) {
      const result = await n8nPost(endpoint, {
        title,
        angle: angle || '',
        category: category || 'design-trends',
        tone: 'professional yet warm, luxury stone distributor',
        brand: 'The Stone Surfaces',
      });
      if (result) return result;
    }

    // Fallback: template content
    return {
      content: getTemplateContent(title),
      excerpt: 'Discover expert insights about ' + title.toLowerCase() + ' from The Stone Surfaces.',
      tags: ['stone surfaces', 'countertops', 'design'],
      category: 'design-trends',
    };
  }

  // ─── LOCAL SEO GENERATION ─────────────────────────────────

  function generateLocalSEO(post) {
    const plainText = (post.content || '').replace(/<[^>]*>/g, '');
    const excerpt = plainText.slice(0, 155).trim();
    const slug = post.slug || slugify(post.title || '');

    return {
      titleTag: (post.title || 'Blog Post') + ' | The Stone Surfaces Blog',
      metaDescription: excerpt || 'Read the latest insights from The Stone Surfaces, South Florida\'s premier stone distributor.',
      canonicalUrl: '/pages/blog-post.html?post=' + slug,
      ogTitle: post.title || 'Blog Post',
      ogDescription: excerpt || 'Expert insights from The Stone Surfaces.',
      altText: (post.title || 'Blog post') + ' — The Stone Surfaces',
      schemaArticle: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title || '',
        description: excerpt,
        author: { '@type': 'Organization', name: 'The Stone Surfaces' },
        publisher: {
          '@type': 'Organization',
          name: 'The Stone Surfaces',
          url: 'https://thestonesurfaces.com',
        },
        datePublished: post.publishedAt || post.createdAt || new Date().toISOString(),
        dateModified: post.updatedAt || new Date().toISOString(),
      },
    };
  }

  // ─── FALLBACK: LOCAL IDEAS ─────────────────────────────────

  function getLocalIdeas() {
    const pool = [
      { title: '5 Quartzite Trends Dominating South Florida Kitchens in 2026', angle: 'Trend report with specific quartzite varieties gaining popularity' },
      { title: 'Hanstone Quartz vs Natural Granite: The Complete Comparison Guide', angle: 'Side-by-side comparison of durability, maintenance, and aesthetics' },
      { title: 'How to Choose the Perfect Countertop for Your Miami Condo', angle: 'Space-specific guide for Florida condo living' },
      { title: 'The Rise of Leathered Finishes: Why Designers Are Obsessed', angle: 'Finish trend deep-dive with designer quotes' },
      { title: 'Before & After: 8 Stunning Kitchen Transformations with Natural Stone', angle: 'Visual showcase with material specs for each project' },
      { title: 'Marble Maintenance 101: Keeping Your Investment Beautiful', angle: 'Practical care guide with product recommendations' },
      { title: 'Why Porcelain Slabs Are the Future of Commercial Design', angle: 'Commercial applications and benefits over traditional materials' },
      { title: 'Outdoor Kitchens in Florida: Best Stone Materials for Heat & Humidity', angle: 'Climate-specific material guide for outdoor installations' },
      { title: 'The Architect\'s Guide to Specifying Hanstone Quartz', angle: 'Technical resource for design professionals' },
      { title: 'Color Psychology: How Stone Countertops Affect Your Kitchen Mood', angle: 'Design psychology meets material science' },
      { title: 'Sustainable Stone: How The Industry Is Going Green', angle: 'Sustainability practices in stone quarrying and manufacturing' },
      { title: 'Dolomite: The Hidden Gem Between Marble and Quartzite', angle: 'Educate about this lesser-known but excellent material' },
      { title: 'Top 10 Mistakes Homeowners Make When Choosing Countertops', angle: 'Common pitfalls with expert solutions' },
      { title: 'Behind the Scenes: How a Stone Slab Goes from Quarry to Kitchen', angle: 'Process story with photography opportunities' },
      { title: 'Waterfall Edges & Book-Matched Slabs: Premium Design Details Explained', angle: 'Luxury design techniques for high-end installations' },
    ];

    // Shuffle and pick 3
    const shuffled = pool.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }

  // ─── FALLBACK: TEMPLATE CONTENT ───────────────────────────

  function getTemplateContent(title) {
    return `<h2>Introduction</h2>
<p>When it comes to selecting the perfect surface material, understanding your options is key. In this article, we explore everything you need to know about ${title.toLowerCase()}.</p>

<h2>What You Need to Know</h2>
<p>At The Stone Surfaces, we've helped hundreds of homeowners, designers, and fabricators find the ideal material for their projects. Our expertise spans over a decade in the South Florida market, giving us unique insights into what works best in our climate and lifestyle.</p>

<h2>Key Considerations</h2>
<p>Whether you're renovating a luxury condo in Miami or designing a commercial space in Orlando, the right stone selection can make all the difference. Consider factors like durability, maintenance requirements, and aesthetic impact when making your decision.</p>

<h2>Expert Recommendations</h2>
<p>Our team recommends visiting our Doral showroom to see and feel the materials in person. Nothing compares to experiencing the texture, veining, and color of natural stone firsthand. We also offer complimentary consultations with our material specialists.</p>

<h2>Conclusion</h2>
<p>Ready to transform your space? Contact The Stone Surfaces today to schedule a showroom visit or request samples. Our team is here to guide you from selection to installation.</p>`;
  }

  // ─── SEED DATA ─────────────────────────────────────────────

  function getSeedLeads() {
    return [
      {
        id: 'lead_demo_001',
        name: 'Maria Rodriguez',
        email: 'maria@designstudio.com',
        phone: '+1 305-555-0101',
        interest: 'Hanstone Quartz',
        source: 'chat',
        status: 'new',
        notes: [{ text: 'Interested in Hanstone for a luxury condo project in Brickell.', date: '2026-03-10T14:00:00.000Z' }],
        projectType: 'Residential Kitchen',
        createdAt: '2026-03-10T14:00:00.000Z',
        updatedAt: '2026-03-10T14:00:00.000Z',
      },
      {
        id: 'lead_demo_002',
        name: 'James Chen',
        email: 'jchen@buildersinc.com',
        phone: '+1 407-555-0202',
        interest: 'Quartzite',
        source: 'trade-form',
        status: 'contacted',
        notes: [
          { text: 'Trade account application received.', date: '2026-03-08T10:00:00.000Z' },
          { text: 'Called and discussed volume pricing. Interested in 50+ slabs/month.', date: '2026-03-09T16:30:00.000Z' },
        ],
        projectType: 'Commercial',
        createdAt: '2026-03-08T10:00:00.000Z',
        updatedAt: '2026-03-09T16:30:00.000Z',
      },
    ];
  }

  function getSeedPosts() {
    return [
      {
        id: 'post_demo_001',
        title: '5 Quartzite Trends Dominating South Florida Kitchens',
        slug: '5-quartzite-trends-south-florida-kitchens',
        content: '<h2>The Quartzite Revolution</h2><p>South Florida homeowners are increasingly choosing quartzite for their kitchen countertops, and for good reason. This natural stone combines the beauty of marble with the durability of granite.</p><h2>1. Taj Mahal Quartzite</h2><p>This golden-toned quartzite has become the most requested material in our Doral showroom. Its warm veining pattern complements both modern and traditional kitchen designs.</p><h2>2. Super White Quartzite</h2><p>For those who love the look of Carrara marble but want something more durable, Super White quartzite offers the perfect alternative.</p>',
        excerpt: 'Discover the top quartzite varieties transforming South Florida kitchens in 2026.',
        featuredImage: '',
        category: 'design-trends',
        tags: ['quartzite', 'kitchen', 'trends', 'south florida'],
        author: { name: 'The Stone Surfaces', avatar: 'TS' },
        seo: {
          titleTag: '5 Quartzite Trends Dominating South Florida Kitchens | The Stone Surfaces Blog',
          metaDescription: 'Discover the top quartzite varieties transforming South Florida kitchens in 2026. Expert insights from The Stone Surfaces.',
          canonicalUrl: '/pages/blog-post.html?post=5-quartzite-trends-south-florida-kitchens',
          ogTitle: '5 Quartzite Trends Dominating South Florida Kitchens',
          ogDescription: 'Discover the top quartzite varieties transforming South Florida kitchens in 2026.',
          altText: 'Quartzite kitchen countertop trends in South Florida',
          schemaArticle: {},
        },
        status: 'published',
        readTime: '3 min read',
        createdAt: '2026-03-01T10:00:00.000Z',
        updatedAt: '2026-03-01T10:00:00.000Z',
        publishedAt: '2026-03-01T10:00:00.000Z',
      },
      {
        id: 'post_demo_002',
        title: 'Hanstone Quartz: Why We Became Official Distributors',
        slug: 'hanstone-quartz-official-distributors',
        content: '<h2>A Partnership Built on Quality</h2><p>We are thrilled to announce our official partnership with Hanstone Quartz by Hyundai L&C. This collaboration brings over 60 stunning quartz colors to South Florida.</p>',
        excerpt: 'Learn why The Stone Surfaces chose Hanstone Quartz as our flagship quartz brand.',
        featuredImage: '',
        category: 'hanstone-updates',
        tags: ['hanstone', 'quartz', 'partnership'],
        author: { name: 'The Stone Surfaces', avatar: 'TS' },
        seo: {
          titleTag: 'Hanstone Quartz: Why We Became Official Distributors | The Stone Surfaces Blog',
          metaDescription: 'Learn why The Stone Surfaces chose Hanstone Quartz as our flagship quartz brand.',
          canonicalUrl: '/pages/blog-post.html?post=hanstone-quartz-official-distributors',
          ogTitle: 'Hanstone Quartz: Why We Became Official Distributors',
          ogDescription: 'Learn why The Stone Surfaces chose Hanstone Quartz as our flagship quartz brand.',
          altText: 'Hanstone Quartz official distributor announcement',
          schemaArticle: {},
        },
        status: 'published',
        readTime: '2 min read',
        createdAt: '2026-02-20T12:00:00.000Z',
        updatedAt: '2026-02-20T12:00:00.000Z',
        publishedAt: '2026-02-20T12:00:00.000Z',
      },
      {
        id: 'post_demo_003',
        title: 'Marble Care Guide: Protecting Your Investment',
        slug: 'marble-care-guide',
        content: '<h2>Essential Marble Maintenance</h2><p>Marble is one of the most beautiful natural stones, but it requires proper care to maintain its elegance over the years.</p>',
        excerpt: 'Expert tips on maintaining and protecting your marble surfaces.',
        featuredImage: '',
        category: 'stone-care',
        tags: ['marble', 'maintenance', 'care guide'],
        author: { name: 'The Stone Surfaces', avatar: 'TS' },
        seo: {
          titleTag: 'Marble Care Guide: Protecting Your Investment | The Stone Surfaces Blog',
          metaDescription: 'Expert tips on maintaining and protecting your marble surfaces from The Stone Surfaces.',
          canonicalUrl: '/pages/blog-post.html?post=marble-care-guide',
          ogTitle: 'Marble Care Guide: Protecting Your Investment',
          ogDescription: 'Expert tips on maintaining and protecting your marble surfaces.',
          altText: 'Marble surface care and maintenance guide',
          schemaArticle: {},
        },
        status: 'draft',
        readTime: '2 min read',
        createdAt: '2026-03-09T09:00:00.000Z',
        updatedAt: '2026-03-09T09:00:00.000Z',
        publishedAt: null,
      },
    ];
  }

  // ─── UNSPLASH IMAGE SEARCH ───────────────────────────────

  async function searchUnsplashImage(query, count = 4) {
    const key = ADMIN_CONFIG.UNSPLASH_ACCESS_KEY;
    if (!key) {
      console.warn('[AdminData] Unsplash API key not configured');
      return [];
    }
    try {
      const q = encodeURIComponent(query + ' luxury interior');
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${q}&per_page=${count}&orientation=landscape`,
        { headers: { 'Authorization': `Client-ID ${key}` } }
      );
      if (!res.ok) throw new Error(`Unsplash ${res.status}`);
      const data = await res.json();
      return (data.results || []).map(img => ({
        id: img.id,
        url: img.urls.regular,
        thumb: img.urls.small,
        alt: img.alt_description || query,
        credit: img.user.name,
        creditUrl: img.user.links.html,
      }));
    } catch (err) {
      console.warn('[AdminData] Unsplash search failed:', err.message);
      return [];
    }
  }

  // ─── IMAGE UPLOAD (Supabase Storage) ─────────────────────

  async function uploadBlogImage(file) {
    const supabaseUrl = ADMIN_CONFIG.SUPABASE.URL;
    const anonKey = ADMIN_CONFIG.SUPABASE.ANON_KEY;
    const bucket = ADMIN_CONFIG.SUPABASE.STORAGE_BUCKET || 'blog-images';
    if (!supabaseUrl || !anonKey) {
      console.warn('[AdminData] Supabase not configured for image upload');
      return null;
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const filename = `blog_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    try {
      const res = await fetch(
        `${supabaseUrl}/storage/v1/object/${bucket}/${filename}`,
        {
          method: 'POST',
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': file.type,
          },
          body: file,
        }
      );
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Upload ${res.status}: ${err}`);
      }
      return `${supabaseUrl}/storage/v1/object/public/${bucket}/${filename}`;
    } catch (err) {
      console.warn('[AdminData] Blog image upload failed:', err.message);
      return null;
    }
  }

  // ─── PRODUCTS ─────────────────────────────────────────────

  async function getProducts(filters = {}) {
    const supabaseUrl = ADMIN_CONFIG.SUPABASE.URL;
    const anonKey = ADMIN_CONFIG.SUPABASE.ANON_KEY;
    if (!supabaseUrl || !anonKey) return [];

    try {
      let params = 'order=is_featured.desc,name.asc';
      if (filters.category) params += `&category=eq.${encodeURIComponent(filters.category)}`;
      if (filters.location) params += `&location_name=eq.${encodeURIComponent(filters.location)}`;
      if (filters.finish) params += `&finish_name=eq.${encodeURIComponent(filters.finish)}`;
      if (filters.thickness) params += `&thickness=eq.${encodeURIComponent(filters.thickness)}`;
      if (filters.search) params += `&name=ilike.*${encodeURIComponent(filters.search)}*`;

      const res = await fetch(`${supabaseUrl}/rest/v1/products?${params}`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
      });
      if (!res.ok) throw new Error(`Supabase ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[AdminData] Products fetch failed:', err.message);
      return [];
    }
  }

  async function getProductById(spsItemId) {
    const supabaseUrl = ADMIN_CONFIG.SUPABASE.URL;
    const anonKey = ADMIN_CONFIG.SUPABASE.ANON_KEY;
    if (!supabaseUrl || !anonKey) return null;

    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/products?sps_item_id=eq.${spsItemId}&limit=1`,
        {
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
          },
        }
      );
      if (!res.ok) throw new Error(`Supabase ${res.status}`);
      const data = await res.json();
      return data[0] || null;
    } catch (err) {
      console.warn('[AdminData] Product fetch failed:', err.message);
      return null;
    }
  }

  async function getRelatedProducts(category, excludeId, limit = 6) {
    const supabaseUrl = ADMIN_CONFIG.SUPABASE.URL;
    const anonKey = ADMIN_CONFIG.SUPABASE.ANON_KEY;
    if (!supabaseUrl || !anonKey) return [];

    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/products?category=eq.${encodeURIComponent(category)}&sps_item_id=neq.${excludeId}&limit=${limit}&order=is_featured.desc`,
        {
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
          },
        }
      );
      if (!res.ok) throw new Error(`Supabase ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[AdminData] Related products fetch failed:', err.message);
      return [];
    }
  }

  async function updateProductEnrichment(spsItemId, description, applicationImages) {
    const endpoint = ADMIN_CONFIG.ENDPOINTS.PRODUCT_SYNC;
    if (!endpoint) return null;

    try {
      const res = await fetch(endpoint.replace('tss-product-sync', 'tss-product-update'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enrich',
          data: {
            sps_item_id: spsItemId,
            description: description || '',
            application_images: applicationImages || [],
          },
        }),
      });
      if (!res.ok) throw new Error(`n8n ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[AdminData] Product enrichment failed:', err.message);
      return null;
    }
  }

  async function triggerProductSync() {
    const endpoint = ADMIN_CONFIG.ENDPOINTS.PRODUCT_SYNC;
    if (!endpoint) return null;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' }),
      });
      if (!res.ok) throw new Error(`n8n ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[AdminData] Product sync trigger failed:', err.message);
      return null;
    }
  }

  async function uploadProductImage(file) {
    const supabaseUrl = ADMIN_CONFIG.SUPABASE.URL;
    const anonKey = ADMIN_CONFIG.SUPABASE.ANON_KEY;
    const bucket = ADMIN_CONFIG.SUPABASE.PRODUCT_STORAGE_BUCKET || 'product-images';
    if (!supabaseUrl || !anonKey) return null;

    const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    try {
      const res = await fetch(
        `${supabaseUrl}/storage/v1/object/${bucket}/${filename}`,
        {
          method: 'POST',
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': file.type,
          },
          body: file,
        }
      );
      if (!res.ok) throw new Error(`Upload ${res.status}`);
      return `${supabaseUrl}/storage/v1/object/public/${bucket}/${filename}`;
    } catch (err) {
      console.warn('[AdminData] Image upload failed:', err.message);
      return null;
    }
  }

  // ─── Public API ────────────────────────────────────────────

  return {
    // Posts (admin CRUD)
    getPosts,
    savePost,
    deletePost,
    // Posts (public reads)
    getPublishedPosts,
    getPostBySlug,
    getRelatedPosts,
    // Leads
    getLeads,
    saveLead,
    updateLead,
    deleteLead,
    // Settings
    getSettings,
    saveSetting,
    // AI Generation
    generateBlogIdeas,
    generateBlogContent,
    // Images
    searchUnsplashImage,
    uploadBlogImage,
    // Products
    getProducts,
    getProductById,
    getRelatedProducts,
    updateProductEnrichment,
    triggerProductSync,
    uploadProductImage,
    // Utilities
    generateLocalSEO,
    slugify,
    calcReadTime,
  };
})();
