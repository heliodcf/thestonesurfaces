# Google Stitch Prompt: The Stone Surfaces Website

Build a complete, multi-page luxury website for **The Stone Surfaces**, a premium stone and quartz slab distributor located in Doral, Florida. This is a B2B wholesale distributor founded in 2016 that sells Granite, Marble, Quartz, Quartzite, Engineered Stones, Porcelain, and Tiles. They just became the official distributor of **Hanstone Quartz by Hyundai L&C** — this partnership must be featured prominently throughout the site. Target audiences: fabricators, interior designers, architects, contractors, retail showrooms, and homeowners researching materials.

---

## DESIGN SYSTEM

### Color Palette (Dark Premium Luxury)
Use CSS custom properties. The site uses a dark, sophisticated aesthetic with warm gold accents that evoke natural stone elegance.

```
--color-bg-primary: #0F0F0F        /* Near-black main background */
--color-bg-surface: #1A1A1A        /* Elevated card/section surfaces */
--color-bg-light: #F5F2ED          /* Warm stone-white for contrast sections */
--color-accent-gold: #C4A35A       /* Primary gold accent — luxury cue */
--color-accent-bronze: #8B7355     /* Hover states, secondary accent */
--color-cta: #D97706              /* Amber-orange CTA buttons — high visibility */
--color-cta-hover: #B45309        /* Darker amber on hover */
--color-text-light: #FAFAF9       /* Warm white text on dark backgrounds */
--color-text-muted: #A8A29E       /* Muted warm gray for secondary text */
--color-text-dark: #1C1917        /* Near-black text on light sections */
--color-trust: #059669            /* Green for warranty badges, trust indicators */
--color-border-dark: rgba(255,255,255,0.08)  /* Subtle borders on dark bg */
--color-border-light: rgba(0,0,0,0.08)       /* Subtle borders on light bg */
```

### Typography
Load from Google Fonts. Do NOT use Inter, Roboto, Open Sans, Lato, or Montserrat.

- **Headlines**: Cormorant Garamond — weight 300 (light, elegant) and 700 (bold emphasis). Letter-spacing: -0.02em on large sizes.
- **Body & UI**: Space Grotesk — weight 400 (regular), 500 (medium), 700 (bold). Clean, geometric, excellent readability.
- **Size scale**: 14px base body, with dramatic jumps: 14, 18, 24, 36, 48, 72, 96px.
- **Line height**: 1.15 for headlines, 1.6 for body text.
- **Small caps / Labels**: Space Grotesk 500, 12px, letter-spacing 0.1em, uppercase, color --color-accent-gold.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
```

### Spacing & Layout
- 8px base spacing unit. Section vertical padding: 96px desktop, 64px mobile.
- Max container width: 1440px with 64px horizontal padding (desktop), 20px (mobile).
- Cards have sharp 0px border-radius (architectural, clean). Buttons and inputs: 4px radius.
- Use asymmetric grids: 2/3 + 1/3 splits, not always 50/50.
- Generous whitespace between sections — let the design breathe.

### Motion & Animation
- Scroll-triggered fade-up reveals: elements animate from opacity 0 + translateY(30px) to visible, 200ms ease-out, staggered 100ms between siblings.
- Hero background: subtle slow-zoom (scale 1.0 to 1.05 over 20 seconds).
- Hover transitions: 300ms cubic-bezier(0.4, 0, 0.2, 1).
- Product cards on hover: scale(1.02) + 1px gold border reveal.
- Add a subtle CSS noise texture overlay on dark sections for depth.
- Always include `@media (prefers-reduced-motion: reduce)` to disable all animations.

---

## NAVIGATION (Global)

**Sticky header** that starts transparent over the hero image, transitioning to solid `#0F0F0F` with subtle backdrop-blur on scroll.

**Desktop layout:**
- Left: The Stone Surfaces logo (text-based, Cormorant Garamond 700, white + gold "S" icon).
- Center: Main navigation links — Products (mega menu), Hanstone Quartz, Get Inspired, Blog, About, For The Trade.
- Right: "Request a Quote" amber CTA button + user type toggle pill: "Homeowner | Trade Professional" (switches site content emphasis).
- Products mega menu: opens full-width dropdown showing all 7 material categories with thumbnail images.

**Mobile layout:**
- Hamburger menu icon opens full-screen dark overlay with large nav links.
- Bottom tab bar (fixed): 5 icons — Home, Products, Hanstone (star icon), Inspire, Contact. This ensures thumb-zone accessibility.

---

## PAGE 1: HOMEPAGE

### Section 1 — Cinematic Hero (full viewport height)
Full-screen background: high-resolution image of a luxury modern kitchen featuring stone countertops, warm ambient lighting, dramatic angles. Dark gradient overlay from bottom (transparent to `#0F0F0F` at 70% opacity).

Centered content:
- Gold label: "SOUTH FLORIDA'S PREMIER STONE DISTRIBUTOR" (Space Grotesk, 12px, uppercase, gold, letter-spaced).
- Headline: "Where Natural Beauty Meets Precision Engineering" (Cormorant Garamond 300, 72px desktop / 42px mobile, white).
- Subheadline: "Premium slabs, expert guidance, and now — the exclusive home of Hanstone Quartz in South Florida." (Space Grotesk 400, 20px, muted gray).
- Two CTAs side by side: "Explore Our Collection" (amber filled button) and "Visit Our Showroom" (white outline button).
- Small Hanstone Quartz badge/logo anchored in the top-right area of the hero.

### Section 2 — Hanstone Quartz Partnership Spotlight (MANDATORY — dark bg #1A1A1A)
This section must feel like a premium product launch announcement. Full-width, generous padding.

Layout: 60% left (large lifestyle image of Hanstone quartz in a luxury bathroom) | 40% right (content).

Right column:
- Gold label: "NOW FEATURING"
- Headline: "Hanstone Quartz by Hyundai L&C" (Cormorant Garamond 700, 48px, white).
- Tagline: "Created by Earth. Designed for You." (italic, Space Grotesk, 18px, muted).
- Four key selling points as icon-list with gold checkmark icons:
  - "93% Natural Quartz — harder than granite"
  - "Lifetime Residential Warranty"
  - "60+ Colors, 3 Premium Finishes"
  - "Advanced Breton™ Technology"
- CTA: "Discover the Hanstone Collection" (amber button, full width on mobile).

### Section 3 — Product Categories Grid (dark bg #0F0F0F)
- Label: "OUR COLLECTIONS" (gold, uppercase).
- Headline: "Every Surface Tells a Story" (Cormorant Garamond, 48px).
- Asymmetric masonry grid showing 7 categories: Granite (large, spans 2 rows), Marble, Quartz, Quartzite, Engineered Stone, Porcelain, Tiles.
- Each card: full-bleed image of the material, dark bottom gradient overlay, category name in white, product count badge ("120+ Slabs").
- Hover effect: slight scale(1.03) + 1px gold border reveal + arrow icon appears.

### Section 4 — Trust Pillars (light bg #F5F2ED)
Three columns, centered:
- "10+" (large Cormorant number, 72px, dark) + "Years of Excellence" (Space Grotesk, dark).
- "500+" + "Slab Varieties in Stock".
- "100%" + "Expert Consultation Included".
Subtle divider lines between columns. Gold underline on the numbers.

### Section 5 — Get Inspired Gallery Preview (dark bg)
- Label: "GET INSPIRED" (gold).
- Headline: "See What's Possible" (Cormorant, 48px).
- Horizontal scrolling carousel (6-8 cards). Each card: room scene photograph (kitchen, bathroom, commercial, outdoor), room type label, material used label, designer credit.
- One featured card is a Before/After transformation with a draggable slider divider.
- CTA at end of carousel: "View Full Gallery" (outline button).

### Section 6 — Customer Reviews (dark bg #1A1A1A)
- Label: "CLIENT STORIES" (gold).
- Headline: "Trusted by Fabricators & Designers Across Florida" (Cormorant, 48px).
- Testimonial carousel showing one review at a time:
  - Large quotation mark icon in gold.
  - Review text (Space Grotesk 20px, white, italic).
  - 5-star rating in gold.
  - Reviewer name, company, role.
  - Small circular portrait photo.
- Carousel dots navigation below. Auto-advances every 6 seconds.
- Below the carousel: a row of partner/client logos in muted white (opacity 0.5, full opacity on hover).

### Section 7 — Blog Preview (light bg #F5F2ED)
- Label: "FROM OUR BLOG" (gold on dark text).
- Headline: "Insights & Inspiration" (Cormorant, 48px, dark).
- Three cards in a row (1 column on mobile):
  - Featured image with category tag overlay (e.g., "Design Trends", "Stone Care", "Hanstone Updates").
  - Title (Space Grotesk 700, 20px).
  - Excerpt (2 lines, muted).
  - Read time + date.
- CTA: "Read Our Blog" (amber text link with arrow).

### Section 8 — Newsletter Lead Magnet (dark bg with subtle stone texture background image)
- Centered layout:
  - Headline: "Get Our 2026 Stone Selection Guide" (Cormorant 700, 48px, white).
  - Subtext: "Expert tips on choosing the perfect surface for your next project. Free, straight to your inbox." (Space Grotesk, muted).
  - Inline form: Name input + Email input + "Download Free Guide" amber button. All on one row (stacked on mobile).

### Section 9 — Footer (bg #0A0A0A)
Four columns:
1. **Company**: The Stone Surfaces logo, brief tagline, address (7980 NW 56th St, Doral, FL 33166), phone, email.
2. **Products**: Links to each material category + Hanstone Quartz.
3. **Resources**: Blog, Get Inspired, FAQs, Warranty Info, For The Trade.
4. **Connect**: Social media icons (Instagram, Facebook, Pinterest, LinkedIn, Houzz), newsletter mini-signup.

Below columns: embedded Google Maps link to showroom. Business hours. Copyright. Privacy Policy / Terms links.

---

## PAGE 2: PRODUCTS (Category Landing)

- Breadcrumb navigation at top.
- Category hero banner: full-width image of the material type, category name in Cormorant 72px, description text.
- **Filter sidebar (left, 25% width)**: Filter by color family (White, Gray, Black, Brown, Blue, Green, Multi), finish (Polished, Honed, Leathered, Brushed), brand (Hanstone, and others), thickness, price tier, application (Kitchen, Bathroom, Commercial, Outdoor). Collapsible filter groups.
- **Product grid (right, 75%)**: 3 columns desktop, 2 tablet, 1 mobile. Sort dropdown: Newest, Popular, Color Family, Price.
- Each product card: slab image, name, origin/brand, finish badges, "View Details" + "Compare" (checkbox icon) + "Request Quote" CTA.
- **Comparison bar**: When user selects "Compare" on any product, a floating bottom bar appears showing up to 3 selected product thumbnails + "Compare Now" button. Clicking opens a full comparison modal: side-by-side images, specs (composition, hardness, absorption rate, dimensions, price tier), available finishes.

---

## PAGE 3: PRODUCT DETAIL

- Full-width slab image with zoom-on-hover (magnifying glass cursor).
- Product info panel beside image: name, collection, material type, available finishes (as clickable tags), thickness options, standard dimensions.
- Two primary CTAs: "Request a Quote" (amber) + "Order a Sample" (outline).
- Technical specifications accordion: Composition, Mohs Hardness, Water Absorption, Flexural Strength, Recommended Applications.
- "Related Products" horizontal carousel below.
- "View in Room" placeholder section with text: "Coming Soon — Visualize this surface in your space with our AR tool."

---

## PAGE 4: HANSTONE QUARTZ (Dedicated Brand Page)

- **Brand hero**: Hanstone lifestyle imagery. Headline: "Hanstone Quartz — Created by Earth. Designed for You." Hyundai L&C partnership badge. Brief brand story: Canadian manufacturing since 2009, Breton™ technology, Kreos innovation.

- **Brand Story section**: Two-column layout. Left: text about heritage, quality (93% natural quartz), sustainability. Right: factory/production imagery.

- **Collections Browser**: Horizontal scrolling bands for each collection — Signature, Pinnacle, Connections, Opimo. Each shows 4-6 representative color swatches with names. Click to expand full collection.

- **Color Palette Explorer**: Filterable grid. Filter tabs at top: All, White, Warm, Cool, Vibrant, Grey, Black. Secondary filter: Finish (Polished, Leather, River Washed). Each swatch card shows: color image, name, collection badge, finish icons. Click opens detail modal with full slab view + specs.

- **Benefits section**: Four large cards with icons:
  - "Harder Than Granite" — natural quartz durability.
  - "Never Needs Sealing" — zero maintenance promise.
  - "Non-Porous & Hygienic" — bacteria and stain resistant.
  - "Lifetime Warranty" — residential lifetime limited warranty details.

- **Professional Resources**: BIM Library download links, CAD files, CEU opportunities, product spec sheets, care & maintenance guides.

- **CTA Section**: "Ready to see Hanstone in person?" + "Visit Our Showroom" (amber button) + "Request Hanstone Samples" (outline button).

---

## PAGE 5: GET INSPIRED

- Hero: "Get Inspired" headline, "Real projects, real materials, real beauty." subtext.
- **Filter bar**: Room Type (Kitchen, Bathroom, Commercial, Outdoor, Living Space), Material (all types), Color Family.
- **Masonry gallery layout**: Mixed-size image cards. Each image: room photo, hover overlay showing material name + room type + designer credit.
- Click any image: opens a lightbox with large image, project details (material used, finish, dimensions, designer/fabricator credit, location).
- **Before/After Section**: 2-3 featured transformations with draggable slider component showing the before and after renovation.
- **Instagram Feed Integration**: Bottom section pulling latest posts from @thestonesurfaces Instagram. Grid of 8 recent posts with "Follow Us" CTA.
- **Submit Your Project**: "Are you a designer or fabricator? Share your project and get featured." + submission form (name, email, project photos upload, description).

---

## PAGE 6: BLOG

- **Featured post hero**: Latest post with large image, title, excerpt, author, date, read time. Dark overlay.
- **Category tabs**: All, Industry News, Design Trends, Stone Care, Project Spotlights, Hanstone Updates.
- **Post grid**: 2 columns desktop, 1 mobile. Each card: featured image, category tag, title, excerpt (2 lines), author avatar + name, date, read time.
- **Sidebar** (desktop): Popular posts list, category links, newsletter signup card, Hanstone promotion banner.
- **Individual post layout**: Full-width featured image, article title (Cormorant 48px), author + date + read time, rich text body with images, related posts carousel at bottom, social share buttons (floating left sidebar on desktop), newsletter signup between content sections.

---

## PAGE 7: ABOUT US

- **Company Story**: "Our Journey" headline. Timeline from 2016 founding through growth milestones to 2026 Hanstone partnership. Alternating left-right layout with year markers.
- **Mission & Values**: Three pillars — Quality ("We inspect every slab"), Service ("Expert guidance from selection to installation"), Integrity ("Transparent pricing, honest advice").
- **Team Section**: Grid of team member cards with photos, names, roles. Hover reveals brief bio.
- **Showroom**: Large photo gallery of the Doral showroom. Virtual tour placeholder. Address + directions CTA.
- **Location map**: Embedded interactive Google Map centered on 7980 NW 56th St, Doral, FL 33166.

---

## PAGE 8: CONTACT / REQUEST A QUOTE

- **Split layout**: Left 60% = form, Right 40% = contact info + map.
- **Form fields**: Full name, company name, email, phone, project type (dropdown: Residential Kitchen, Residential Bathroom, Commercial, Outdoor, Other), materials of interest (multi-select checkboxes: Granite, Marble, Quartz, Quartzite, Hanstone Quartz, Engineered Stone, Porcelain, Tiles), message textarea, file upload for project plans/drawings.
- **Contact info panel**: Phone number (clickable), email, address, business hours (Mon-Fri 8am-5pm, Sat 9am-2pm, Sun Closed), embedded Google Maps mini-view.
- **CTA**: "Send Your Request" amber button. Success state shows confirmation message with expected response time.

---

## PAGE 9: FOR THE TRADE

- **Hero**: "Built for Professionals" headline. "Exclusive pricing, dedicated support, and the tools you need to grow your business."
- **Trade Benefits Grid**: 4 cards — Volume Pricing, Priority Inventory Access, Dedicated Account Manager, Marketing Support Materials.
- **Trade Account Application**: Form with company name, license number, business type (Fabricator, Designer, Contractor, Showroom, Other), years in business, estimated monthly volume, references.
- **Professional Resources**: Downloadable spec sheets, care guides, installation manuals, Hanstone BIM Library + CAD files, CEU credit opportunities through Hanstone.
- **Current Promotions**: Banner area for seasonal deals or new arrival announcements for trade accounts.
- **Trade Representative Contact**: Direct phone line + email + scheduling link for in-person meetings.

---

## N8N CHAT WIDGET (Global — All Pages)

Floating chat button fixed at bottom-right corner, 56x56px circle, background color `#C4A35A` (gold), white chat icon. Subtle pulse animation on first visit.

On click, expands to a chat panel (360px wide, 500px tall on desktop, full-screen on mobile):
- Header: "The Stone Surfaces Assistant" + minimize button.
- Initial message: "Hi! I'm here to help you find the perfect stone for your project. What are you looking for?"
- Quick action buttons below greeting: "Browse Products", "Request a Quote", "Hanstone Quartz Info", "Visit Our Showroom".
- Text input at bottom with send button.
- Placeholder: `<div id="n8n-chat-widget" data-webhook-url="YOUR_N8N_WEBHOOK_URL"></div>` for integration with the n8n AI agent backend.

---

## RESPONSIVE BEHAVIOR

- **Desktop (1440px+)**: Full layouts as described above, all columns and sidebars visible.
- **Tablet (768-1439px)**: 2-column grids instead of 3, sidebar filters collapse to a slide-out drawer, hero text scales down to 48px headlines.
- **Mobile (320-767px)**: Single column layouts, fixed bottom tab navigation bar, hamburger for full menu, full-width CTA buttons, swipeable carousels with touch gesture support, collapsible accordions for filter groups.
- All interactive elements: minimum 44x44px touch target.
- All images: responsive with `srcset` and `sizes` attributes, WebP format with JPEG fallback, lazy loading on all below-fold images.
- Sticky "Request a Quote" bar at bottom of mobile product pages (always visible).

---

## SEO & TECHNICAL

- Semantic HTML5 throughout: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`.
- One `<h1>` per page, logical heading hierarchy (h1 > h2 > h3).
- Schema.org structured data: LocalBusiness (company), Product (each slab/material), Review (testimonials), BreadcrumbList (navigation).
- Open Graph meta tags for social sharing with preview images.
- `font-display: swap` on all custom fonts.
- Critical CSS inlined in `<head>` for above-fold content.
- No cumulative layout shift: reserve space for images with aspect-ratio, use skeleton loading states.

---

## COPY TONE & VOICE

- Professional yet warm. Not cold corporate — approachable luxury.
- Speak to both the trade professional ("precision-cut slabs for demanding installations") and the homeowner ("transform your kitchen into the heart of your home").
- Emphasize quality, expertise, and the Hanstone partnership as a mark of distinction.
- Use short, confident sentences. Avoid jargon unless speaking to trade professionals in the For The Trade section.
