/**
 * The Stone Surfaces — Admin Data Layer
 * CRUD operations for Leads & Blog Posts
 * Supports n8n API mode with localStorage fallback
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

  async function apiFetch(url, options = {}) {
    if (!url) return null;
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[AdminData] API call failed, using localStorage fallback:', err.message);
      return null;
    }
  }

  // ─── LEADS ─────────────────────────────────────────────────

  async function getLeads(filters = {}) {
    const endpoint = ADMIN_CONFIG.ENDPOINTS.LEADS_LIST;
    if (ADMIN_CONFIG.API_MODE === 'api' && endpoint) {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.source) params.set('source', filters.source);
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);
      const result = await apiFetch(endpoint + '?' + params.toString());
      if (result) return result;
    }

    // localStorage fallback
    let leads = getStorage(ADMIN_CONFIG.STORAGE_KEYS.LEADS);
    if (leads.length === 0) {
      leads = getSeedLeads();
      setStorage(ADMIN_CONFIG.STORAGE_KEYS.LEADS, leads);
    }
    // Apply filters locally
    if (filters.status) leads = leads.filter(l => l.status === filters.status);
    if (filters.source) leads = leads.filter(l => l.source === filters.source);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      leads = leads.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.includes(q)
      );
    }
    return leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async function saveLead(lead) {
    lead.id = lead.id || generateId('lead');
    lead.createdAt = lead.createdAt || new Date().toISOString();
    lead.updatedAt = new Date().toISOString();
    lead.notes = lead.notes || [];

    const endpoint = ADMIN_CONFIG.ENDPOINTS.LEADS_CREATE;
    if (ADMIN_CONFIG.API_MODE === 'api' && endpoint) {
      const result = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(lead),
      });
      if (result) return result;
    }

    const leads = getStorage(ADMIN_CONFIG.STORAGE_KEYS.LEADS);
    leads.unshift(lead);
    setStorage(ADMIN_CONFIG.STORAGE_KEYS.LEADS, leads);
    return lead;
  }

  async function updateLead(id, updates) {
    const endpoint = ADMIN_CONFIG.ENDPOINTS.LEADS_UPDATE;
    if (ADMIN_CONFIG.API_MODE === 'api' && endpoint) {
      const result = await apiFetch(endpoint.replace('{id}', id), {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      if (result) return result;
    }

    const leads = getStorage(ADMIN_CONFIG.STORAGE_KEYS.LEADS);
    const idx = leads.findIndex(l => l.id === id);
    if (idx === -1) return null;
    Object.assign(leads[idx], updates, { updatedAt: new Date().toISOString() });
    setStorage(ADMIN_CONFIG.STORAGE_KEYS.LEADS, leads);
    return leads[idx];
  }

  async function deleteLead(id) {
    const leads = getStorage(ADMIN_CONFIG.STORAGE_KEYS.LEADS);
    const filtered = leads.filter(l => l.id !== id);
    setStorage(ADMIN_CONFIG.STORAGE_KEYS.LEADS, filtered);
    return true;
  }

  // ─── BLOG POSTS ────────────────────────────────────────────

  async function getPosts(filters = {}) {
    const endpoint = ADMIN_CONFIG.ENDPOINTS.BLOG_POSTS_LIST;
    if (ADMIN_CONFIG.API_MODE === 'api' && endpoint) {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      const result = await apiFetch(endpoint + '?' + params.toString());
      if (result) return result;
    }

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

    const endpoint = ADMIN_CONFIG.ENDPOINTS.BLOG_POSTS_SAVE;
    if (ADMIN_CONFIG.API_MODE === 'api' && endpoint) {
      const result = await apiFetch(endpoint.replace('{id}', post.id), {
        method: 'PUT',
        body: JSON.stringify(post),
      });
      if (result) return result;
    }

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
    const posts = getStorage(ADMIN_CONFIG.STORAGE_KEYS.POSTS);
    setStorage(ADMIN_CONFIG.STORAGE_KEYS.POSTS, posts.filter(p => p.id !== id));
    return true;
  }

  // ─── AI GENERATION (n8n webhooks) ──────────────────────────

  async function generateBlogIdeas() {
    const endpoint = ADMIN_CONFIG.ENDPOINTS.BLOG_IDEAS;
    if (endpoint) {
      const result = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          niche: 'natural stone, quartz, interior design, countertops, South Florida',
          count: 5,
        }),
      });
      if (result && result.ideas) return result.ideas;
    }

    // Fallback: curated local ideas
    return getLocalIdeas();
  }

  async function generateBlogContent(title, angle) {
    const endpoint = ADMIN_CONFIG.ENDPOINTS.BLOG_GENERATE;
    if (endpoint) {
      const result = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          title,
          angle: angle || '',
          tone: 'professional yet warm, luxury stone distributor',
          brand: 'The Stone Surfaces',
        }),
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

  async function generateBlogSEO(title, content, url) {
    const endpoint = ADMIN_CONFIG.ENDPOINTS.BLOG_SEO;
    if (endpoint) {
      const result = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ title, content, url }),
      });
      if (result) return result;
    }

    // Fallback: local SEO generation
    return generateLocalSEO({ title, content, slug: slugify(title) });
  }

  // ─── LOCAL SEO GENERATION ─────────────────────────────────

  function generateLocalSEO(post) {
    const plainText = (post.content || '').replace(/<[^>]*>/g, '');
    const excerpt = plainText.slice(0, 155).trim();
    const slug = post.slug || slugify(post.title || '');

    return {
      titleTag: (post.title || 'Blog Post') + ' | The Stone Surfaces Blog',
      metaDescription: excerpt || 'Read the latest insights from The Stone Surfaces, South Florida\'s premier stone distributor.',
      canonicalUrl: '/pages/blog/' + slug,
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

    // Shuffle and pick 5
    const shuffled = pool.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
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
        source: 'chatbot',
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
        source: 'trade_form',
        status: 'contacted',
        notes: [
          { text: 'Trade account application received.', date: '2026-03-08T10:00:00.000Z' },
          { text: 'Called and discussed volume pricing. Interested in 50+ slabs/month.', date: '2026-03-09T16:30:00.000Z' },
        ],
        projectType: 'Commercial',
        createdAt: '2026-03-08T10:00:00.000Z',
        updatedAt: '2026-03-09T16:30:00.000Z',
      },
      {
        id: 'lead_demo_003',
        name: 'Sarah Williams',
        email: 'sarah.w@email.com',
        phone: '+1 954-555-0303',
        interest: 'Marble',
        source: 'contact_form',
        status: 'qualified',
        notes: [
          { text: 'Wants Calacatta marble for master bathroom.', date: '2026-03-05T09:00:00.000Z' },
          { text: 'Showroom visit scheduled for March 15.', date: '2026-03-07T11:00:00.000Z' },
        ],
        projectType: 'Residential Bathroom',
        createdAt: '2026-03-05T09:00:00.000Z',
        updatedAt: '2026-03-07T11:00:00.000Z',
      },
      {
        id: 'lead_demo_004',
        name: 'David Park',
        email: 'dpark@parkdesigns.com',
        phone: '+1 305-555-0404',
        interest: 'Granite',
        source: 'chatbot',
        status: 'converted',
        notes: [
          { text: 'Commercial project — restaurant countertops.', date: '2026-02-28T08:00:00.000Z' },
          { text: 'Order placed: 12 slabs Black Galaxy granite.', date: '2026-03-04T15:00:00.000Z' },
        ],
        projectType: 'Commercial',
        createdAt: '2026-02-28T08:00:00.000Z',
        updatedAt: '2026-03-04T15:00:00.000Z',
      },
      {
        id: 'lead_demo_005',
        name: 'Laura Martinez',
        email: 'laura.m@interiors.com',
        phone: '+1 786-555-0505',
        interest: 'Porcelain',
        source: 'manual',
        status: 'new',
        notes: [],
        projectType: 'Residential Kitchen',
        createdAt: '2026-03-11T08:00:00.000Z',
        updatedAt: '2026-03-11T08:00:00.000Z',
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
          canonicalUrl: '/pages/blog/5-quartzite-trends-south-florida-kitchens',
          ogTitle: '5 Quartzite Trends Dominating South Florida Kitchens',
          ogDescription: 'Discover the top quartzite varieties transforming South Florida kitchens in 2026.',
          altText: 'Quartzite kitchen countertop trends in South Florida',
          schemaArticle: {},
        },
        status: 'published',
        scheduledDate: null,
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
          canonicalUrl: '/pages/blog/hanstone-quartz-official-distributors',
          ogTitle: 'Hanstone Quartz: Why We Became Official Distributors',
          ogDescription: 'Learn why The Stone Surfaces chose Hanstone Quartz as our flagship quartz brand.',
          altText: 'Hanstone Quartz official distributor announcement',
          schemaArticle: {},
        },
        status: 'published',
        scheduledDate: null,
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
          canonicalUrl: '/pages/blog/marble-care-guide',
          ogTitle: 'Marble Care Guide: Protecting Your Investment',
          ogDescription: 'Expert tips on maintaining and protecting your marble surfaces.',
          altText: 'Marble surface care and maintenance guide',
          schemaArticle: {},
        },
        status: 'draft',
        scheduledDate: null,
        readTime: '2 min read',
        createdAt: '2026-03-09T09:00:00.000Z',
        updatedAt: '2026-03-09T09:00:00.000Z',
        publishedAt: null,
      },
    ];
  }

  // ─── Public API ────────────────────────────────────────────

  return {
    // Leads
    getLeads,
    saveLead,
    updateLead,
    deleteLead,
    // Posts
    getPosts,
    savePost,
    deletePost,
    // AI Generation
    generateBlogIdeas,
    generateBlogContent,
    generateBlogSEO,
    // Utilities
    generateLocalSEO,
    slugify,
    calcReadTime,
  };
})();
