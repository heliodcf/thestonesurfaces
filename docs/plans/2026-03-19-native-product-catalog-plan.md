# Native Product Catalog — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace StoneProfitsWeb iframe with a native, beautiful product catalog powered by Supabase + n8n sync from StoneProfits API.

**Architecture:** n8n workflow syncs 923 products from StoneProfits REST API into Supabase `products` table daily + on-demand. Admin enriches products with descriptions and application images. Frontend renders natively from Supabase with client-side search/filters. Zero-downtime: iframe stays live until switch.

**Tech Stack:** Vanilla HTML/CSS/JS, Supabase (PostgreSQL + Storage), n8n (workflow automation), StoneProfits REST API

**Design Doc:** `docs/plans/2026-03-19-native-product-catalog-design.md`

---

## Phase 1: Supabase Migration

### Task 1.1: Add products table to migration SQL

**Files:**
- Modify: `docs/supabase-migration.sql` (append after line 103)

**Step 1: Append products table SQL to migration file**

Add this after the Storage bucket comment block at line 103:

```sql
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
```

**Step 2: Run the NEW SQL block in Supabase SQL Editor**

Go to `grouplivingcentipede-supabase.cloudfy.live` → SQL Editor → paste and run ONLY the new block (table `products` + indexes + RLS + storage comment).

**Step 3: Create storage bucket `product-images` via Supabase Dashboard**

Dashboard → Storage → New Bucket → name: `product-images`, Public: Yes.

**Step 4: Verify**

Run in SQL Editor:
```sql
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products' ORDER BY ordinal_position;
```
Expected: 27 columns returned.

**Step 5: Commit**

```bash
cd thestonesurfaces
git add docs/supabase-migration.sql
git commit -m "feat: add products table migration for native catalog"
```

---

## Phase 2: n8n Sync Workflow

### Task 2.1: Add SPS_WEB_TOKEN to environment

**Step 1: Add token to `.env`**

```
SPS_WEB_TOKEN=9NyWP5Vz5MnoxuRngg34tf7bDH5+s6tSge6uTSzn2n8KY/enJMovH2z5qx7vf9RrWM74QB2s0Mgoi0ug
SPS_API_BASE=https://thestonesurfaces.stoneprofits.com/api/fetchdataAngularProductionToyota.ashx
```

**Step 2: Add to n8n credentials**

In n8n (grouplivingcentipede-n8n.cloudfy.live) → Credentials → Create new → Header Auth:
- Name: `StoneProfits_TSS`
- Header Name: `Authorization`
- Header Value: the token from `.env`

### Task 2.2: Create n8n workflow — TSS Product Sync

**Create workflow via n8n UI or MCP** with these nodes:

**Node 1 — Trigger (dual)**
- Schedule Trigger: cron `0 3 * * *` (daily 3AM)
- Webhook Trigger: POST `/tss-product-sync` (for admin button)

**Node 2 — HTTP Request: Get Locations**
```
Method: GET
URL: https://thestonesurfaces.stoneprofits.com/api/fetchdataAngularProductionToyota.ashx?act=getLocations&WebconnectSettingID=1
Headers:
  Authorization: {{ $env.SPS_WEB_TOKEN }}
  Origin: https://thestonesurfaces.stoneprofitsweb.com
  Referer: https://thestonesurfaces.stoneprofitsweb.com/
```

**Node 3 — HTTP Request: Get All Products**
```
Method: POST
URL: https://thestonesurfaces.stoneprofits.com/api/fetchdataAngularProductionToyota.ashx?act=getItemGallery&WebconnectSettingID=1&InventoryGroupBy=IDOne_IDTwo_Lot_&SearchbyItemIdentifiers=on&ShowFeatureProductOnTop=on&OnHold=null&OnSO=null&Intransit=null&showNotInStock=null&SearchbyFinish=on&SearchbySKU=on&Alphabet=
Headers: (same as above)
Body (JSON):
{
  "ItemName":"","Location":"","Type":"","Category":"","Thickness":"","Finish":"",
  "Group":"","Color":"","PriceRange":"","Origin":"","Kind":"","SubCategory":"",
  "SlabOptions":"","SaleOptions":"","AvailableOptions":"","AvgCurrentAvailableQty":"",
  "AvgCurrentSlabLength":"","AvgCurrentSlabWidth":"","AvailableSlabs":"","ItemIdentifiers":""
}
```

**Node 4 — Code: Transform Products**
```javascript
const FINISH_MAP = {
  3630: 'Polished', 3953: 'Leather', 3936: 'Honed',
  3941: 'Dual Polished/Leather', 4125: 'Honed and Filled',
  4047: 'Satin', 3966: 'Brushed', 3940: 'Dual Polished/Honed',
  4089: 'Dual Honed/Leather'
};

const LOCATION_MAP = { 2: 'Miami', 3: 'Orlando', 4: 'Sarasota' };

const S3_BASE = 'https://s3.us-east-1.amazonaws.com/thestonesurfaces-sps-files/';

const products = $input.all().map(item => {
  const d = item.json;
  return {
    json: {
      sps_item_id: d.ItemID,
      name: d.ItemName || '',
      sku: d.SKU || '',
      category: d.CategoryName || '',
      category_id: d.CategoryID || null,
      type: d.type || 'SLAB',
      thickness: (d.Thickness || '') + (d.ThicknessUOM || ''),
      finish_id: d.Finish || null,
      finish_name: FINISH_MAP[d.Finish] || 'Polished',
      image_filename: d.Filename || '',
      image_url: d.Filename ? S3_BASE + d.Filename : '',
      location_id: d.LocationID || null,
      location_name: LOCATION_MAP[d.LocationID] || '',
      block_number: String(d.IDOne || ''),
      bundle_number: String(d.IDTwo || ''),
      avg_length: d.AvgCurrentSlabLength || 0,
      avg_width: d.AvgCurrentSlabWidth || 0,
      available_qty_sf: d.AvgCurrentAvailableQty || 0,
      available_slabs: d.AvailableSlabs || 0,
      is_featured: d.FeatureProduct === 'on',
      is_new_arrival: d.NewArrival === 'on',
      slab_options: d.SlabOptions || 'Full Slab',
      kind: d.Kind || 'Stock',
      alternate_name: d.AlternateName || '',
      synced_at: new Date().toISOString()
    }
  };
});

return products;
```

**Node 5 — Supabase: Upsert Products**
- Operation: Upsert
- Table: `products`
- Conflict column: `sps_item_id`
- Map ALL fields from Node 4 EXCEPT `description` and `application_images` (preserve enrichments)

**Node 6 — Supabase: Cleanup stale products**

Code node that:
1. Gets all `sps_item_id` from current sync (Node 4 output)
2. Queries Supabase for products NOT in that list
3. Deletes them (they left inventory)

```javascript
const syncedIds = $('Transform Products').all().map(i => i.json.sps_item_id);
// Pass to next node for Supabase delete WHERE sps_item_id NOT IN (...)
return [{ json: { synced_ids: syncedIds, count: syncedIds.length } }];
```

**Node 7 — Respond to Webhook**
```json
{ "success": true, "synced": {{ $node['Transform Products'].all().length }}, "timestamp": "{{ $now }}" }
```

**Step: Activate and test**

1. Save workflow
2. Click "Test Workflow" — verify products appear in Supabase
3. Activate for daily schedule
4. Note the webhook URL for admin integration

### Task 2.3: Verify first sync

**Step 1: Check Supabase**

```sql
SELECT COUNT(*) FROM products;
-- Expected: ~923

SELECT category, COUNT(*) FROM products GROUP BY category ORDER BY count DESC;
-- Expected: Quartz 276, Quartzite 261, Granite 162, etc.

SELECT DISTINCT location_name FROM products;
-- Expected: Miami, Orlando, Sarasota
```

---

## Phase 3: Admin Config + Data Layer

### Task 3.1: Add product endpoints to admin-config.js

**Files:**
- Modify: `js/admin-config.js`

**Step 1: Add Supabase anon key (needed for public product reads)**

In `ADMIN_CONFIG.SUPABASE`, set the `ANON_KEY` value. Get it from Supabase Dashboard → Settings → API → `anon` `public` key.

**Step 2: Add product sync endpoint and product storage bucket**

```javascript
// Add to ENDPOINTS object:
PRODUCT_SYNC: 'https://grouplivingcentipede-n8n.cloudfy.live/webhook/tss-product-sync',

// Add to SUPABASE object:
PRODUCT_STORAGE_BUCKET: 'product-images',

// Add new section:
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

PRODUCTS_PER_PAGE: 24,
```

**Step 3: Commit**

```bash
git add js/admin-config.js
git commit -m "feat: add product catalog config to admin-config.js"
```

### Task 3.2: Add product methods to admin-data.js

**Files:**
- Modify: `js/admin-data.js`

**Step 1: Add product data methods to the AdminData IIFE**

Add before the `return` statement (before line 690):

```javascript
// ─── PRODUCTS ─────────────────────────────────────────────

async function getProducts(filters = {}) {
  // Read directly from Supabase (public RLS allows SELECT)
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
  // This goes through n8n (needs service_role key)
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
```

**Step 2: Add to public API return object**

Add to the `return { ... }` block:

```javascript
// Products
getProducts,
getProductById,
getRelatedProducts: getRelatedProducts,
updateProductEnrichment,
triggerProductSync,
uploadProductImage,
```

Note: rename existing `getRelatedPosts` stays — this is `getRelatedProducts` (different).

**Step 3: Commit**

```bash
git add js/admin-data.js
git commit -m "feat: add product data layer (Supabase reads, sync trigger, image upload)"
```

---

## Phase 4: Admin Product Manager

### Task 4.1: Create product-manager.html

**Files:**
- Create: `pages/admin/product-manager.html`

**Step 1: Create the admin page**

Follow the same structure as `dashboard.html` and `blog-manager.html`:
- Same `<head>` (GTM, fonts, styles.css, admin.css)
- Same `<header>` admin nav (Dashboard | Blog Manager | **Product Manager**)
- Auth guard: `<main style="display:none">` revealed by `checkAuth()`

**Layout sections:**
1. **Page header:** "Product Manager" title + last sync timestamp + "Sync Now" button
2. **Filters bar:** Search input + Category dropdown + Location dropdown + Finish dropdown
3. **Products grid:** Cards showing image thumbnail + name + SKU + category + location badge
4. **Detail panel** (slide-out right, same pattern as lead detail panel in dashboard): read-only StoneProfits fields + editable description textarea + application image upload area + Save button

**Step 2: Add inline `<style>` for product manager specific styles**

Key styles needed:
- `.pm-grid` — CSS grid 4 cols desktop, 3 tablet, 2 mobile
- `.pm-card` — product card with image, info, location badge
- `.pm-card:hover` — subtle scale + border
- `.pm-detail-panel` — slide-out panel (reuse `.detail-panel` pattern from dashboard)
- `.pm-upload-zone` — drag-and-drop area for images
- `.pm-image-gallery` — preview grid for uploaded application images
- `.pm-sync-badge` — small badge showing "Last sync: X"
- `.pm-location-pill` — colored pill per location

**Step 3: Add inline `<script>` for page logic**

Core functions:
- `loadProducts(filters)` — calls `AdminData.getProducts()`, renders grid
- `renderProductCard(product)` — builds card HTML
- `openProductDetail(spsItemId)` — opens slide-out, calls `AdminData.getProductById()`
- `saveEnrichment()` — saves description + images via `AdminData.updateProductEnrichment()`
- `handleImageUpload(files)` — calls `AdminData.uploadProductImage()` per file
- `triggerSync()` — calls `AdminData.triggerProductSync()`, shows toast
- Debounced search (300ms) on input
- Filter dropdowns populated from `ADMIN_CONFIG.PRODUCT_CATEGORIES`, etc.

**Step 4: Add "Product Manager" link to admin nav in dashboard.html and blog-manager.html**

In both files, find the admin nav and add:
```html
<a href="product-manager.html">Product Manager</a>
```

**Step 5: Commit**

```bash
git add pages/admin/product-manager.html pages/admin/dashboard.html pages/admin/blog-manager.html
git commit -m "feat: add Product Manager admin page with enrichment UI"
```

### Task 4.2: Create n8n workflow for product enrichment

**Create workflow: TSS Product Update**

**Node 1 — Webhook Trigger:** POST `/tss-product-update`

**Node 2 — Switch on action:**
- `action === 'enrich'` → Node 3
- Default → respond 400

**Node 3 — Supabase Update:**
- Table: `products`
- Filter: `sps_item_id = {{ $json.data.sps_item_id }}`
- Set: `description`, `application_images`, `updated_at`

**Node 4 — Respond:**
```json
{ "success": true }
```

**Step: Add endpoint to admin-config.js**

```javascript
PRODUCT_UPDATE: 'https://grouplivingcentipede-n8n.cloudfy.live/webhook/tss-product-update',
```

---

## Phase 5: Frontend — Native Product Catalog

### Task 5.1: Build native products grid in products.html

**Files:**
- Modify: `pages/products.html`

**Step 1: Add the native catalog section (hidden initially)**

Below the existing iframe section, add a new section with `id="nativeCatalog"` and `style="display:none"`:

```html
<!-- ===== NATIVE PRODUCT CATALOG ===== -->
<section id="nativeCatalog" class="section" style="display: none; padding-top: 0;">
  <div class="container">

    <!-- Search Bar -->
    <div class="catalog-search reveal">
      <input type="text" id="catalogSearch" placeholder="Search by name, SKU, or material..."
             class="catalog-search-input" autocomplete="off">
      <svg class="catalog-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    </div>

    <!-- Filters + Grid Layout -->
    <div class="catalog-layout">

      <!-- Filter Sidebar -->
      <aside class="catalog-filters" id="catalogFilters">
        <!-- Category filter -->
        <div class="filter-group">
          <h4 class="filter-group-title">Category</h4>
          <div id="filterCategory" class="filter-options"></div>
        </div>
        <!-- Location filter -->
        <div class="filter-group">
          <h4 class="filter-group-title">Location</h4>
          <div id="filterLocation" class="filter-options"></div>
        </div>
        <!-- Finish filter -->
        <div class="filter-group">
          <h4 class="filter-group-title">Finish</h4>
          <div id="filterFinish" class="filter-options"></div>
        </div>
        <!-- Thickness filter -->
        <div class="filter-group">
          <h4 class="filter-group-title">Thickness</h4>
          <div id="filterThickness" class="filter-options"></div>
        </div>
        <!-- Clear All -->
        <button class="filter-clear-all" id="clearAllFilters">Clear All Filters</button>
      </aside>

      <!-- Products Main -->
      <div class="catalog-main">
        <div class="catalog-toolbar">
          <span class="catalog-count" id="catalogCount">Loading...</span>
          <div class="catalog-sort">
            <label for="catalogSort">Sort:</label>
            <select id="catalogSort">
              <option value="featured">Featured</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>

        <!-- Product Grid -->
        <div class="catalog-grid" id="catalogGrid"></div>

        <!-- Pagination -->
        <div class="catalog-pagination" id="catalogPagination"></div>
      </div>
    </div>
  </div>
</section>
```

**Step 2: Add CSS for native catalog**

Add `<style>` block with catalog-specific styles:
- `.catalog-search` — full-width search with icon
- `.catalog-layout` — flex: sidebar 260px + main 1fr
- `.catalog-filters` — sticky sidebar with filter groups
- `.catalog-grid` — CSS grid 3 cols desktop, 2 tablet, 1 mobile
- `.catalog-card` — product card with image, badges, info, hover effect
- `.catalog-card-image` — aspect-ratio 1/1, object-fit cover
- `.catalog-card .location-pill` — colored pill per location
- `.catalog-card .badge-new` / `.badge-featured` — overlay badges
- `.catalog-pagination` — page numbers
- Mobile: filters become drawer (reuse existing mobile-filter pattern)

Visual design targets:
- Clean white/light gray cards on the light page background
- Image takes full width of card, 1:1 aspect ratio
- Subtle shadow on hover, 1px border
- Gold/accent color for badges and hover states
- Location pills with distinct colors (Miami blue, Orlando purple, Sarasota green)

**Step 3: Add `<script>` for catalog logic**

```javascript
// At end of products.html, after main.js
<script>
(function() {
  const SUPABASE_URL = 'https://grouplivingcentipede-supabase.cloudfy.live';
  const SUPABASE_KEY = ''; // anon key — fill in
  const PER_PAGE = 24;

  let allProducts = [];
  let filteredProducts = [];
  let currentPage = 1;
  let activeFilters = { category: [], location: [], finish: [], thickness: [], search: '' };

  // ── Fetch all products from Supabase ──
  async function fetchProducts() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/products?order=is_featured.desc,name.asc&limit=1000`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      allProducts = await res.json();
      applyFilters();
      buildFilterCounts();
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  }

  // ── Build filter checkboxes with counts ──
  function buildFilterCounts() {
    buildFilterGroup('filterCategory', 'category', allProducts);
    buildFilterGroup('filterLocation', 'location_name', allProducts);
    buildFilterGroup('filterFinish', 'finish_name', allProducts);
    buildFilterGroup('filterThickness', 'thickness', allProducts);
  }

  function buildFilterGroup(containerId, field, products) {
    const container = document.getElementById(containerId);
    const counts = {};
    products.forEach(p => {
      const val = p[field];
      if (val) counts[val] = (counts[val] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    container.innerHTML = sorted.map(([val, count]) => `
      <label class="filter-checkbox-label">
        <input type="checkbox" value="${val}" data-field="${field}">
        <span>${val}</span>
        <span class="filter-count">${count}</span>
      </label>
    `).join('');

    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        updateActiveFilters();
        applyFilters();
      });
    });
  }

  // ── Apply filters + search ──
  function updateActiveFilters() {
    activeFilters.category = getCheckedValues('filterCategory');
    activeFilters.location = getCheckedValues('filterLocation');
    activeFilters.finish = getCheckedValues('filterFinish');
    activeFilters.thickness = getCheckedValues('filterThickness');
  }

  function getCheckedValues(containerId) {
    return [...document.querySelectorAll(`#${containerId} input:checked`)].map(cb => cb.value);
  }

  function applyFilters() {
    filteredProducts = allProducts.filter(p => {
      if (activeFilters.category.length && !activeFilters.category.includes(p.category)) return false;
      if (activeFilters.location.length && !activeFilters.location.includes(p.location_name)) return false;
      if (activeFilters.finish.length && !activeFilters.finish.includes(p.finish_name)) return false;
      if (activeFilters.thickness.length && !activeFilters.thickness.includes(p.thickness)) return false;
      if (activeFilters.search) {
        const q = activeFilters.search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !(p.sku || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });

    // Sort
    const sort = document.getElementById('catalogSort').value;
    if (sort === 'name-asc') filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'name-desc') filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
    else if (sort === 'category') filteredProducts.sort((a, b) => a.category.localeCompare(b.category));
    // 'featured' is default order from Supabase

    currentPage = 1;
    renderGrid();
    renderPagination();
  }

  // ── Render product grid ──
  function renderGrid() {
    const grid = document.getElementById('catalogGrid');
    const start = (currentPage - 1) * PER_PAGE;
    const page = filteredProducts.slice(start, start + PER_PAGE);

    document.getElementById('catalogCount').innerHTML =
      `Showing <strong>${page.length}</strong> of <strong>${filteredProducts.length}</strong> products`;

    grid.innerHTML = page.map(p => `
      <a href="product-detail.html?id=${p.sps_item_id}" class="catalog-card">
        <div class="catalog-card-image">
          ${p.image_url
            ? `<img src="${p.image_url}" alt="${p.name}" loading="lazy">`
            : `<div class="catalog-card-placeholder"></div>`}
          ${p.is_new_arrival ? '<span class="badge-new">NEW</span>' : ''}
          ${p.is_featured ? '<span class="badge-featured">FEATURED</span>' : ''}
        </div>
        <div class="catalog-card-body">
          <span class="catalog-card-category">${p.category}</span>
          <h3 class="catalog-card-name">${p.name}</h3>
          <p class="catalog-card-sku">${p.sku}</p>
          <div class="catalog-card-meta">
            <span class="meta-tag">${p.thickness}</span>
            <span class="meta-tag">${p.finish_name}</span>
          </div>
          <div class="catalog-card-location">
            <span class="location-pill location-${p.location_name.toLowerCase()}">${p.location_name}</span>
          </div>
          <div class="catalog-card-inventory">
            ${p.available_slabs} slab${p.available_slabs !== 1 ? 's' : ''} &middot; ${Math.round(p.available_qty_sf)} SF
          </div>
        </div>
      </a>
    `).join('');
  }

  // ── Render pagination ──
  function renderPagination() {
    const totalPages = Math.ceil(filteredProducts.length / PER_PAGE);
    const container = document.getElementById('catalogPagination');
    if (totalPages <= 1) { container.innerHTML = ''; return; }

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    container.innerHTML = html;
    container.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = parseInt(btn.dataset.page);
        renderGrid();
        renderPagination();
        window.scrollTo({ top: document.getElementById('catalogGrid').offsetTop - 100, behavior: 'smooth' });
      });
    });
  }

  // ── Event listeners ──
  document.getElementById('catalogSearch').addEventListener('input', debounce(e => {
    activeFilters.search = e.target.value;
    applyFilters();
  }, 300));

  document.getElementById('catalogSort').addEventListener('change', applyFilters);

  document.getElementById('clearAllFilters').addEventListener('click', () => {
    document.querySelectorAll('.catalog-filters input:checked').forEach(cb => cb.checked = false);
    document.getElementById('catalogSearch').value = '';
    activeFilters = { category: [], location: [], finish: [], thickness: [], search: '' };
    applyFilters();
  });

  function debounce(fn, ms) {
    let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }

  // ── Init ──
  fetchProducts();
})();
</script>
```

**Step 4: Commit**

```bash
git add pages/products.html
git commit -m "feat: add native product catalog grid (hidden, behind iframe)"
```

### Task 5.2: Build dynamic product-detail.html

**Files:**
- Modify: `pages/product-detail.html`

**Step 1: Make product-detail.html dynamic**

Replace the hardcoded Alaska White content with a dynamic template that:
1. Reads `?id=` from URL params
2. Fetches product from Supabase via `AdminData.getProductById(id)` or direct Supabase REST
3. Populates: breadcrumb, title, image, SKU, category, thickness, finish
4. Shows description if enriched
5. Shows application images gallery if enriched
6. Shows availability card (location, block, bundle, dimensions, qty/slabs)
7. Fetches and renders related products via `AdminData.getRelatedProducts()`

**Key HTML structure:**

```html
<!-- Dynamic content populated by JS -->
<section class="product-detail-section">
  <div class="container">
    <div class="product-detail-grid">
      <!-- Left: Image + Application Gallery -->
      <div class="product-image" id="productImage"></div>
      <!-- Right: Info -->
      <div class="product-info" id="productInfo"></div>
    </div>
  </div>
</section>

<!-- Description (if enriched) -->
<section id="productDescription" style="display:none"></section>

<!-- Application Gallery (if enriched) -->
<section id="applicationGallery" style="display:none"></section>

<!-- Availability -->
<section id="productAvailability"></section>

<!-- Related Products -->
<section id="relatedProducts"></section>
```

**Step 2: Add `<script>` that fetches and renders dynamically**

Script reads `?id=` param, fetches from Supabase, populates all sections. If product has `description` or `application_images`, shows those sections. Related products fetched by same category.

**Step 3: Commit**

```bash
git add pages/product-detail.html
git commit -m "feat: make product-detail.html dynamic from Supabase"
```

---

## Phase 6: Testing + Verification

### Task 6.1: End-to-end test

**Step 1: Verify sync data**

```sql
SELECT name, sku, category, finish_name, location_name, available_slabs, image_url
FROM products
WHERE category = 'Quartz'
ORDER BY name
LIMIT 10;
```

**Step 2: Test native catalog (temporarily show it)**

In `products.html`, temporarily set `#nativeCatalog` to `display: block` and iframe to `display: none`.

Test:
- [ ] Products load and display in grid
- [ ] Search by name works (debounced)
- [ ] Search by SKU works
- [ ] Category filter works (checkboxes with counts)
- [ ] Location filter works (colored pills)
- [ ] Finish filter works
- [ ] Thickness filter works
- [ ] Clear All Filters resets everything
- [ ] Sort options work (Featured, A-Z, Z-A, Category)
- [ ] Pagination works (24 per page)
- [ ] Product card shows: image, name, SKU, category, badges, location, slabs/SF
- [ ] Clicking card navigates to product-detail.html?id=X

**Step 3: Test product detail page**

- [ ] Page loads with correct product data from URL param
- [ ] Breadcrumb shows correct category
- [ ] Image displays from S3
- [ ] Specs show (SKU, category, thickness, finish)
- [ ] Availability card shows location, block, bundle, dimensions, qty
- [ ] Related products carousel shows same-category products
- [ ] CTAs link to contact page

**Step 4: Test admin Product Manager**

- [ ] Login → navigate to Product Manager
- [ ] Products list loads from Supabase
- [ ] Search and filters work
- [ ] Click product → detail panel opens
- [ ] Can type description → Save → verify in Supabase
- [ ] Can upload application image → verify URL saved
- [ ] Sync Now button triggers n8n → shows toast

**Step 5: Revert display states**

Set `#nativeCatalog` back to `display: none` and iframe back to visible. Everything still works via iframe.

---

## Phase 7: Switch (Go Live)

### Task 7.1: Swap iframe for native catalog

**Files:**
- Modify: `pages/products.html`

**Step 1: Hide iframe, show native catalog**

In `products.html`:
- Change the iframe wrapper div: `style="display: none;"`
- Change `#nativeCatalog`: remove `style="display: none;"`

This is the ONLY change needed to go live.

**Step 2: Verify live**

- [ ] Products page shows native grid (not iframe)
- [ ] All filters/search work
- [ ] Product detail pages work
- [ ] Mobile responsive
- [ ] Performance acceptable (page load < 2s)

**Step 3: Commit**

```bash
git add pages/products.html
git commit -m "feat: switch to native product catalog (remove StoneProfitsWeb iframe)"
```

**Step 4: Deploy**

Push to GitHub → GitHub Pages auto-deploys.

---

## Reference: File Map

| File | Action | Phase |
|------|--------|-------|
| `docs/supabase-migration.sql` | Append products table | 1 |
| `.env` | Add SPS_WEB_TOKEN | 2 |
| n8n workflow (UI) | Create TSS Product Sync | 2 |
| `js/admin-config.js` | Add product endpoints + categories | 3 |
| `js/admin-data.js` | Add product CRUD methods | 3 |
| `pages/admin/product-manager.html` | Create new | 4 |
| `pages/admin/dashboard.html` | Add nav link | 4 |
| `pages/admin/blog-manager.html` | Add nav link | 4 |
| n8n workflow (UI) | Create TSS Product Update | 4 |
| `pages/products.html` | Add native catalog (hidden) | 5 |
| `pages/product-detail.html` | Make dynamic | 5 |
| `pages/products.html` | Switch display (go live) | 7 |
