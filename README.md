# The Stone Surfaces — Website + Admin

## Escopo

Website multi-pagina premium + area administrativa para **The Stone Surfaces**, distribuidora B2B de pedras naturais e quartzo em South Florida. Fundada em 2016, distribui Granite, Marble, Quartz, Quartzite, Dolomite, Hard Marble. Distribuidora oficial de **Hanstone Quartz by Hyundai L&C** e **Lucciare Handcrafted Quartz**. Publico-alvo: fabricantes, designers de interiores, arquitetos, construtoras, showrooms e homeowners.

**Repo:** github.com/heliodcf/thestonesurfaces
**Deploy:** GitHub Pages (site publico) | localhost:8080 (dev)

---

## Stack

| Tecnologia | Uso |
|------------|-----|
| HTML5 semantico | Estrutura de todas as paginas (publicas + admin) |
| CSS3 (vanilla) | Design system com custom properties (`styles.css`) + admin styles (`admin.css`) |
| JavaScript (vanilla) | Animacoes, carrossel, mega menu, chat widget, admin CRUD, AI generation |
| Google Fonts | Cormorant Garamond (headlines) + Space Grotesk (body/UI) |
| Web Crypto API | Hash SHA-256 para autenticacao admin |
| localStorage / sessionStorage | Persistencia de dados (leads, posts, sessao) |
| Supabase (Cloudfy) | Banco de dados PostgreSQL + Storage (blog_posts, leads, settings, blog-images) |
| n8n (Cloudfy) | 6 workflows: Blog CRUD, Ideas, Content, Chat Agent, Carrinho Perdido, Settings |
| OpenRouter (Cloudfy) | LLMs: Gemini 2.5 Flash, Mistral Small, Mistral Nemo |
| Redis (Cloudfy) | Chat memory persistente (TTL 24h) |
| Chatwoot (Cloudfy) | Chat widget + atendimento humano (pendente setup) |
| Evolution API (Cloudfy) | WhatsApp notificacoes (pendente config) |
| i18n (EN/ES/PT) | Sistema de traducao com `data-i18n` attributes + JSON files |

---

## Skills Utilizadas

| Skill | Quando usar |
|-------|-------------|
| `brainstorming` | Planejamento de features novas (admin, blog manager) |
| `writing-plans` | Planos de implementacao multi-step |
| `frontend-design` | Ajustes visuais, novos componentes, melhorias de UI |
| `senior-frontend` | Logica JS, responsividade, performance, admin area |
| `ui-ux-pro-max` | Revisao de design, paleta, tipografia |
| `landing-page-copywriter` | Textos de conversao, CTAs, headlines |
| `seo-copywriter-pro` | SEO on-page, meta tags, structured data |
| `n8n-mcp-tools-expert` | Workflows n8n para AI chatbot e blog |

---

## Estrutura do Projeto

```
thestonesurfaces/
├── index.html                    # Homepage (9 secoes + link admin no footer)
├── claude.md                     # Spec completa de design/build (Google Stitch prompt)
├── README.md                     # Este arquivo
│
├── css/
│   ├── styles.css                # Design system completo + responsivo (2800+ linhas)
│   └── admin.css                 # Estilos admin: dashboard, tabelas, modais, editor
│
├── js/
│   ├── main.js                   # Animacoes, carrossel, mega menu, chat, forms
│   ├── i18n.js                   # Sistema de traducao (EN/ES/PT)
│   ├── admin-config.js           # Config admin: endpoints n8n, auth hash, constantes
│   ├── admin-auth.js             # Autenticacao: SHA-256, sessao, guard, logout
│   └── admin-data.js             # Data layer: CRUD leads/posts, AI generation, fallback local
│
├── i18n/
│   ├── en.json                   # Traducoes ingles
│   ├── es.json                   # Traducoes espanhol
│   ├── fr.json                   # Traducoes frances
│   └── pt.json                   # Traducoes portugues
│
├── pages/
│   ├── admin-login.html          # Login do admin
│   ├── admin/
│   │   ├── dashboard.html        # CRM Dashboard de leads
│   │   └── blog-manager.html     # Blog Manager com AI
│   ├── products.html             # Catalogo com filtros e grid
│   ├── product-detail.html       # Detalhe do produto com specs
│   ├── hanstone.html             # Pagina dedicada Hanstone Quartz
│   ├── lucciare.html             # Pagina dedicada Lucciare Quartz
│   ├── inspired.html             # Galeria de projetos + Before/After
│   ├── blog.html                 # Blog publico (categorias + posts dinamicos do admin)
│   ├── about.html                # Historia, equipe, showroom, mapa
│   ├── contact.html              # Formulario de contato/quote
│   └── trade.html                # Portal para profissionais
│
├── images/
│   ├── header/                   # Logo TSS
│   ├── hero/                     # Imagens hero + badges distribuidores
│   ├── collections/              # Thumbnails das categorias de pedra
│   ├── hanstone/                 # Assets da marca Hanstone
│   │   ├── images-hanstone/      # 40 imagens reais do catalogo Hanstone (1-Antello a 40-Silhouette)
│   │   └── galeria/              # 7 fotos lifestyle para carrossel Brand Story
│   ├── lucciare/                 # Assets da marca Lucciare
│   └── inspired/                 # Galeria de projetos + Instagram
│
├── docs/plans/
│   ├── 2026-03-11-multi-language-i18n.md        # Design doc do sistema i18n
│   ├── 2026-03-11-admin-crm-blog-manager-design.md  # Design doc do admin
│   ├── 2026-03-19-native-product-catalog-design.md  # Design doc do catalogo nativo
│   └── 2026-03-19-native-product-catalog-plan.md    # Plano de implementacao do catalogo
│
└── .github/
    └── workflows/                # GitHub Pages deploy
```

---

## Etapas do Projeto

| # | Etapa | Descricao | Status |
|---|-------|-----------|--------|
| 1 | Design System | Paleta Cool Gray Monochrome, tipografia, spacing, motion, CSS custom properties | done |
| 2 | Homepage | 9 secoes: hero cinematico, spotlights Hanstone/Lucciare, collections grid, trust strip inline, galeria, reviews, blog preview, newsletter, footer com 3 locacoes | done |
| 3 | Products | Catalogo nativo com 440 produtos do Supabase, filtros (categoria, espessura, finish, location), busca, paginacao 24/pg, sort. Substituiu iframe StoneProfitsWeb | done |
| 4 | Product Detail | Pagina dinamica via `?id=`, imagem com zoom, specs, disponibilidade por location, galeria de aplicacao, produtos relacionados, mobile sticky CTA | done |
| 5 | Hanstone Page | Brand page: hero, brand story com carrossel auto-rotativo (7 fotos lifestyle), catalogo real 40 cores Hanstone com imagens oficiais, lightbox popup com nome em rosa Hanstone + codigo referencia, beneficios, recursos profissionais | done |
| 6 | Lucciare Page | Brand page: hero split, brand story, flat swatch grid (23 cores com collection badges), Genesis Technology, benefits, Professional Resources (BIM, CAD, CEU, Specs, Care), CTA, lightbox popup com suporte a placeholders | done |
| 7 | Get Inspired | Masonry gallery, Before/After slider, Instagram feed, submit project form | done |
| 8 | Blog | Featured post hero, category tabs, grid 2-col + sidebar, newsletter signup | done |
| 9 | About | Timeline historia, missao e valores, equipe, showroom gallery, mapa Google | done |
| 10 | Contact | Formulario split-layout (60/40) com mapa, file upload, validacao | done |
| 11 | For The Trade | Portal profissional: beneficios, formulario trade account, recursos, promos | done |
| 12 | Chat Widget | Botao flutuante gold, painel de chat, placeholder n8n webhook | done |
| 13 | i18n | Sistema de traducao EN/ES/FR/PT com `data-i18n` attributes, seletor de idioma, localStorage | done |
| 14 | Mobile Responsivo | Bottom tab bar, hamburger menu, swipeable carousels, touch targets 44px | done |
| 15 | Admin Login | Autenticacao SHA-256 via Web Crypto API, sessao 8h em sessionStorage, guard de rotas | done |
| 16 | CRM Dashboard | 4 metric cards, tabela de leads com filtros (status/source/search), paginacao, export CSV, painel slide-out com notas, add lead modal | done |
| 17 | Blog Manager AI | Geracao de ideias via n8n, geracao de conteudo AI, editor com toolbar, tags input, SEO auto-gerado, preview modal, CRUD de posts, upload de imagem (Supabase Storage), busca Unsplash com 4 opcoes | done |
| 18 | Blog Dinamico | Posts publicados no admin aparecem automaticamente no blog publico via Supabase. Hero = primeiro post, grid = restante | done |
| 19 | Cloudfy Migration | Supabase, n8n, Redis, OpenRouter — toda infraestrutura migrada para Cloudfy | done |
| 20 | n8n Workflows | 8 workflows: Blog CRUD/Ideas/Content, Chat Agent, Carrinho Perdido, Settings, Leads CRUD, **Product Sync** — todos com credentials corretas | done |
| 21 | Chat Agent AI | OpenRouter Gemini 2.5 Flash + Redis Memory + Save Lead Tool → Supabase | done |
| 22 | Chatwoot + Evolution | Chat widget profissional + WhatsApp notificacoes | in-progress |
| 23 | Product Catalog Native | 440 produtos sincronizados do StoneProfits via API → Supabase. Sync diario 3AM + manual. Catalogo nativo substituiu iframe | done |
| 24 | Blog Image Upload | Upload drag & drop pro Supabase Storage + busca Unsplash automatica com 4 opcoes | done |
| 25 | Blog CRUD Fixes | Fix save (UUID validation), fix list (empty array response), fix Success Response (always array) | done |
| 26 | SEO & Performance | Structured data, meta tags, lazy loading, CLS | todo |

---

## Area Administrativa

### Acesso
- **URL:** `pages/admin-login.html` (link discreto no footer da homepage: "Admin")
- **Senha:** `TSS@dmin2026!`
- **Sessao:** 8 horas (sessionStorage — fecha ao fechar aba)

### CRM Dashboard (`pages/admin/dashboard.html`)
- **Metricas:** Total leads, novos, qualificados, convertidos (4 cards com cores distintas)
- **Tabela de leads:** Nome, email, telefone, interesse, source, status, data
- **Filtros:** Por status (new/contacted/qualified/converted), source (chatbot/contact/trade/manual), busca por texto
- **Acoes:** Ver detalhes (painel slide-out), mudar status, adicionar notas, deletar
- **Add Lead:** Modal com formulario completo (nome, email, phone, interesse, projeto, source, nota)
- **Export CSV:** Exporta leads filtrados como arquivo `.csv`
- **Paginacao:** 20 leads por pagina
- **Seed data:** 5 leads de exemplo para demonstracao

### Blog Manager AI (`pages/admin/blog-manager.html`)
- **Lista de posts:** Tabela com titulo, categoria, status, data, acoes (edit/preview/publish/delete)
- **Tabs:** All Posts | Drafts | Published | + New Post
- **Gerar 5 Ideias AI:** Botao que chama webhook n8n (fallback: pool local de 15+ templates do nicho stone/quartz/design)
- **Selecionar ideia → gera conteudo:** Chama webhook n8n para gerar texto completo, excerpt, tags, categoria
- **Modo manual:** Inserir titulo + conteudo + imagem → sistema gera SEO automaticamente
- **Editor:** Textarea com toolbar (bold, italic, underline, H2, H3, listas, link, imagem, blockquote)
- **Tags:** Input com pills removiveis (Enter ou virgula para adicionar)
- **SEO Panel auto-gerado:**
  - SEO Title (com char count /60)
  - Meta Description (com char count /155)
  - OG Title / OG Description
  - Image Alt Text
  - Canonical URL (auto-gerado do slug)
  - Schema.org Article JSON-LD
- **Google Snippet Preview:** Visualizacao de como o post aparece no Google
- **Preview Modal:** Renderiza o post como aparece no blog publico (mesma tipografia/cores)
- **Status:** Draft, Published, Scheduled
- **Seed data:** 3 posts de exemplo (2 publicados, 1 rascunho)

### Arquitetura Admin

```
admin-config.js  →  Configuracao central (endpoints, hash, constantes, categorias)
admin-auth.js    →  Autenticacao (login, guard, logout, hash SHA-256)
admin-data.js    →  CRUD + AI generation (dual mode: n8n API + localStorage fallback)
admin.css        →  Estilos separados (reutiliza :root custom properties de styles.css)
```

### Infraestrutura Cloudfy (Plano Max)

Toda a infraestrutura backend roda no Cloudfy (grouplivingcentipede):

| Servico | URL | Status |
|---------|-----|--------|
| Supabase | `grouplivingcentipede-supabase.cloudfy.live` | ATIVO |
| n8n | `grouplivingcentipede-n8n.cloudfy.live` | ATIVO (8 workflows ativos) |
| Redis | `grouplivingcentipede-redis.cloudfy.live:6379` | ATIVO |
| Chatwoot | `grouplivingcentipede-chatwoot.cloudfy.live` | Pendente onboarding |
| Evolution API | `grouplivingcentipede-evolution.cloudfy.live` | Pendente config |

### Supabase Tables

| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `blog_posts` | Posts do blog (CRUD via n8n) | Public read published, service_role full |
| `leads` | Leads do CRM (chatbot, forms, manual) | Service_role only |
| `settings` | Config key-value (notificacoes) | Service_role only |
| `products` | 440 produtos sincronizados do StoneProfits | Public read all, service_role full |

### Supabase Storage Buckets

| Bucket | Uso | Public |
|--------|-----|--------|
| `blog-images` | Featured images dos blog posts (upload via admin) | Sim |
| `product-images` | Fotos de aplicacao de produtos (admin enrichment) | Sim |

### n8n Workflows (Cloudfy)

| Workflow | ID | Webhook | Status |
|----------|-----|---------|--------|
| TSS Blog CRUD API | `dpHyaxeBSyTkeCRJ` | POST `/tss-blog-posts` | Ativo |
| TSS Blog Ideas Generator | `ZeCbmGTDE1s908Yt` | POST `/tss-blog-ideas` | Ativo |
| TSS Blog Content Generator | `rykKEueJcCXisRsj` | POST `/tss-blog-generate` | Ativo |
| TSS Chat Agent (Atendimento) | `2OGBWVHj4hb9ftzm` | Chat Trigger | Ativo |
| TSS Carrinho Perdido (Cron) | `hjn1iS2Y9W0dvweh` | Schedule (1h) | Ativo |
| TSS Settings CRUD | `wNB5oukELRPaexTS` | POST `/tss-settings` | Ativo |
| TSS Leads CRUD API | `UkwtEF54UFIexQ5I` | POST `/tss-leads` | Ativo |
| **TSS Product Sync** | `ZnkfOixiOi5hNhub` | POST `/tss-product-sync` + Schedule 3AM | **Ativo** |

### n8n Credentials

| ID | Nome | Tipo |
|----|------|------|
| `cWxvS4F4YThtSz3R` | Supabase_TSS | supabaseApi |

### Webhooks (configurados em `js/admin-config.js`)

| Endpoint | URL Completa |
|----------|-------------|
| Blog CRUD | `https://grouplivingcentipede-n8n.cloudfy.live/webhook/tss-blog-posts` |
| Blog Ideas | `https://grouplivingcentipede-n8n.cloudfy.live/webhook/tss-blog-ideas` |
| Blog Generate | `https://grouplivingcentipede-n8n.cloudfy.live/webhook/tss-blog-generate` |
| Settings | `https://grouplivingcentipede-n8n.cloudfy.live/webhook/tss-settings` |
| Leads CRUD | `https://grouplivingcentipede-n8n.cloudfy.live/webhook/tss-leads` |
| Product Sync | `https://grouplivingcentipede-n8n.cloudfy.live/webhook/tss-product-sync` |

### StoneProfits API (Product Sync)

| Item | Valor |
|------|-------|
| Base URL | `https://thestonesurfaces.stoneprofits.com/api/fetchdataAngularProductionToyota.ashx` |
| Auth | Token estatico (SPSWebToken) em `.env` |
| Endpoint | `act=getItemGallery` (POST) |
| Locations | `act=getLocations` (GET) → Miami, Orlando, Sarasota |
| Produtos | 922 registros → 440 unicos (deduplicados por ItemID, slabs/qty agregados) |
| Imagens | S3: `https://s3.us-east-1.amazonaws.com/thestonesurfaces-sps-files/{Filename}` |
| Sync | Diario 3AM ET + botao manual via webhook |

**Como ativar:** `API_MODE: 'api'` em `js/admin-config.js`. Fallback automatico para localStorage se webhook falhar.

---

## Design System

### Paleta de Cores (Cool Gray Monochrome)
| Variavel | Valor | Uso |
|----------|-------|-----|
| `--color-bg-primary` | `#F7F7F8` | Background principal (quase branco frio) |
| `--color-bg-surface` | `#EDEDEF` | Cards e secoes elevadas (cinza muito claro) |
| `--color-bg-accent` | `#E0E0E3` | Background accent (cinza claro) |
| `--color-bg-feature` | `#D1D1D6` | Background feature (cinza medio claro) |
| `--color-bg-light` | `#FFFFFF` | Branco puro |
| `--color-accent-gold` | `#6B6B6B` | Accent principal (cinza medio) |
| `--color-accent-bronze` | `#525252` | Hover states, accent secundario (cinza escuro) |
| `--color-accent-gold-light` | `#9E9E9E` | Accent light |
| `--color-accent-gold-bg` | `#F0F0F2` | Accent background |
| `--color-cta` | `#6B6B6B` | Botoes CTA (cinza medio) |
| `--color-cta-hover` | `#525252` | Hover dos CTAs |
| `--color-text-light` | `#1A1A1E` | Texto principal |
| `--color-text-muted` | `#6B6B72` | Texto secundario |
| `--color-text-dark` | `#1A1A1E` | Texto sobre light bg |
| `--color-trust` | `#059669` | Badges de garantia/trust |

### Tipografia
- **Headlines:** Cormorant Garamond (300 light, 700 bold) — serif elegante
- **Body/UI:** Space Grotesk (400, 500, 700) — sans-serif geometrica
- **Scale:** 14, 18, 24, 36, 48, 72, 96px
- **Labels:** Space Grotesk 500, 12px, uppercase, letter-spacing 0.1em, gold

### Componentes CSS Reutilizaveis
| Classe | Uso |
|--------|-----|
| `.btn.btn--primary` | Botao amber filled |
| `.btn.btn--outline` | Botao outline branco |
| `.btn.btn--gold` | Botao gold (admin) |
| `.btn.btn--small` | Botao tamanho reduzido |
| `.form-group` + `label` + `input` | Grupo de formulario padrao |
| `.form-row` | 2 colunas de form groups |
| `.status-badge--{status}` | Pills de status coloridos |
| `.admin-table` | Tabela estilizada dark |
| `.admin-modal` | Modal overlay + content |
| `.detail-panel` | Painel slide-out direito |
| `.metric-card` | Card de metrica com borda colorida |
| `.idea-card` | Card clicavel de ideia AI |
| `.seo-panel` | Painel de campos SEO |
| `.seo-preview` | Preview Google snippet |
| `.reveal` | Fade-up scroll animation |
| `.toast` | Notificacao toast (success/error/warning) |

### Lucciare Quartz Page — Detalhes Tecnicos

A pagina Lucciare (`pages/lucciare.html`) foi redesenhada para espelhar a estrutura da Hanstone:

**Estrutura de Secoes (7 secoes):**
1. Hero split (logo + texto + badge partnership + HGTV featured)
2. Brand Story (two-column grid + certificacoes GreenGuard Gold, NSF, GreenGuard)
3. Collections Grid flat (23 swatches com `collection-badge` overlay: Signature/Genesis/Solstice)
4. Genesis Technology (two-column com detalhes das series Strata, Art, Lumina)
5. Benefits (4 cards: Italian Design, Stain Resistant, Certified Safe, Exceptional Durability)
6. Professional Resources (BIM Library, CAD Files, CEU Courses, Spec Sheets, Care & Maintenance)
7. CTA (Request a Quote + Visit Our Showroom)

**Lightbox com suporte dual:**
Funciona com imagens `<img>` reais e com placeholders `<div>` de gradiente CSS. Quando nao ha imagem, cria um `div.lightbox-placeholder` dinamicamente com o mesmo gradiente do swatch. Ao fechar, remove o placeholder. Mostra nome da pedra + collection badge como referencia.

**CSS Custom Properties Lucciare:**
| Variavel | Valor | Uso |
|----------|-------|-----|
| `--lc-terracotta` | `#CD7E59` | Cor oficial Lucciare — accents, badges, buttons, labels |
| `--lc-terracotta-hover` | `#b56a47` | Hover state dos botoes |
| `--lc-terracotta-glow` | `rgba(205,126,89,0.15)` | Hero flares radiais |
| `--lc-terracotta-subtle` | `rgba(205,126,89,0.08)` | Background sutil (hover resources) |
| `--lc-teal` | `#102526` | Background escuro do hero |

**Colecoes (23 cores total):**
| Colecao | Cores | Tiers |
|---------|-------|-------|
| Signature | 10 | Prestige, Premiere, Select, Designer |
| Genesis | 9 | Strata, Art, Lumina |
| Solstice | 4 | Solstice |

### Hanstone Quartz Page — Detalhes Tecnicos

A pagina Hanstone (`pages/hanstone.html`) foi atualizada com dados reais do catalogo oficial:

**Catalogo de 40 Cores Reais:**
Grid responsivo com 40 swatch cards, cada um com imagem real do produto. Ordem numerica (1-Antello ate 40-Silhouette). Cada card mostra: imagem com `object-fit: cover`, nome da pedra e codigo de referencia (ex: LO804).

**Carrossel Brand Story:**
7 fotos lifestyle na secao "The Hanstone Story" com rotacao automatica a cada 4s. CSS crossfade usando `position: absolute` + transicao de `opacity`. Imagens em `images/hanstone/galeria/`.

**Lightbox Popup:**
Ao clicar em qualquer swatch card, abre overlay com imagem ampliada, nome da pedra em rosa Hanstone (`--hs-pink: #c44398`) e codigo de referencia. Fecha via botao X, click fora ou tecla Escape.

**CSS Custom Properties Hanstone:**
| Variavel | Valor | Uso |
|----------|-------|-----|
| `--hs-pink` | `#c44398` | Cor oficial Hanstone — nome no lightbox, accents |
| `--hs-dark` | `#1a1a2e` | Background escuro da pagina |
| `--hs-light` | `#f8f5f0` | Secoes claras |

---

## Internacionalizacao (i18n)

- **Idiomas:** English (default), Español, Français, Português
- **Ordem:** EN → ES → FR → PT (nos seletores desktop e mobile)
- **Arquivos:** `i18n/en.json`, `i18n/es.json`, `i18n/fr.json`, `i18n/pt.json`
- **Atributos:** `data-i18n` (textContent), `data-i18n-html` (innerHTML), `data-i18n-placeholder`, `data-i18n-alt`, `data-i18n-title`
- **Storage:** `localStorage('tss-lang')`
- **Auto-detect:** localStorage → navigator.language → default (en)
- **Seletor:** Desktop (dropdown) + Mobile (button group)
- **Modulo:** IIFE em `js/i18n.js`, carrega JSON via fetch

---

## Data Models

### Lead
```js
{
  id: 'lead_' + timestamp,
  name: string,
  email: string,
  phone: string,
  interest: string,          // material (Granite, Marble, Quartz, etc.)
  source: 'chatbot' | 'contact_form' | 'trade_form' | 'manual',
  status: 'new' | 'contacted' | 'qualified' | 'converted',
  notes: [{ text: string, date: ISO string }],
  projectType: string,       // Residential Kitchen, Commercial, etc.
  createdAt: ISO string,
  updatedAt: ISO string
}
```

### Blog Post
```js
{
  id: 'post_' + timestamp,
  title: string,
  slug: string,              // auto-generated from title
  content: string,           // HTML
  excerpt: string,
  featuredImage: string,     // URL
  category: 'design-trends' | 'stone-care' | 'industry-news' | 'project-spotlights' | 'hanstone-updates',
  tags: string[],
  author: { name: string, avatar: string },
  seo: {
    titleTag, metaDescription, canonicalUrl,
    ogTitle, ogDescription, altText,
    schemaArticle: { @context, @type, headline, description, author, publisher, datePublished, dateModified }
  },
  status: 'draft' | 'published' | 'scheduled',
  readTime: string,          // auto-calculated (words / 200)
  createdAt, updatedAt, publishedAt: ISO string
}
```

---

## Historico de Commits

| Hash | Descricao |
|------|-----------|
| `429f695` | Initial commit — site completo com todas as 9 paginas publicas |
| `4099bf7` | Add GitHub Pages deploy workflow |
| `7572c99` | Fix mobile: hero, carousel, testimonials, lucciare flares |
| `308292f` | Rename prompt → claude.md, hero bg TajMahal.jpg |
| `22270ad` | Update hero text colors e header scroll behavior |
| `cfe7763` | Remove hero overlay, show bg image com cores originais |
| `96e28e4` | Add hero video, update categories, create README |
| `326b606` | Add i18n system (EN/ES/PT) + hero visual design update |
| `7747a88` | Add admin area: CRM dashboard + AI blog manager |
| `fdcb21b` | Change header logo to black color using CSS invert filter |
| `486b02d` | Hanstone page: real 40-color catalog, brand story carousel, lightbox popup |
| — | Hanstone grid: 4 colunas fixas, pedras 25% maiores, fonte proporcional |
| — | Trust section: refatorado de video+data layout para trust-strip inline com spans |
| — | Paleta de cores: migrado de warm beige/gold para Cool Gray Monochrome |
| — | Locations section: adicionado logo TSS em preto acima do heading |
| — | Footer: logo em preto, 3 enderecos (Doral, Orlando, Sarasota), telefone padrao |

---

## Decisoes de Arquitetura

1. **Vanilla HTML/CSS/JS** — sem frameworks, sem build tools. Performance maxima, simplicidade de deploy.
2. **Design system via CSS custom properties** — paleta Cool Gray Monochrome (cinza medio, cinza claro, branco). Todas as paginas reutilizam as mesmas variaveis.
3. **Admin separado do publico** — CSS e JS proprios. Nenhum arquivo publico modificado para admin (exceto footer link + blog integration script).
4. **Data layer com dual mode** — `admin-data.js` verifica `ADMIN_CONFIG.API_MODE`. Se `'api'` + endpoint: fetch para n8n. Se falha: fallback localStorage. Zero mudanca no frontend ao alternar.
5. **Autenticacao client-side (MVP)** — SHA-256 via Web Crypto API. Hash no config, sessao em sessionStorage. Upgrade para JWT via n8n quando backend existir.
6. **Blog dinamico** — Posts salvos no Supabase via n8n webhook. Blog publico le via n8n CRUD endpoint. Primeiro post = hero, restante = grid.
7. **Blog images** — Upload drag & drop pro Supabase Storage (bucket `blog-images`) + busca Unsplash com 4 opcoes por query. Auto-busca apos geracao AI.
8. **i18n sem biblioteca** — IIFE puro, JSON de traducao, `data-i18n` attributes. Suporta textContent, innerHTML, placeholder, alt, title.
9. **Duas marcas parceiras** — Hanstone + Lucciare com paginas dedicadas.
10. **3 locacoes** — Doral (main showroom), Orlando, Sarasota. Mapas Google embeddados.
11. **Catalogo nativo de produtos** — 440 produtos do StoneProfits sincronizados via API REST → Supabase. Frontend nativo com filtros client-side (categoria, espessura, finish, location), busca, paginacao. Substituiu iframe do StoneProfitsWeb.
12. **Product Sync** — n8n workflow faz GET na API StoneProfits (token estatico), deduplicao por ItemID (agrega slabs/qty), upsert em batches de 20 no Supabase com `on_conflict=sps_item_id`. Preserva campos de enriquecimento (description, application_images).
13. **Product detail dinamico** — Pagina carrega produto do Supabase via `?id={sps_item_id}`. Zoom on hover com tracking de cursor, disponibilidade por location, galeria de aplicacao, produtos relacionados, mobile sticky CTA.

---

## Aprendizados

- `claude.md` e a spec de design (originalmente prompt Google Stitch). Ler ANTES de qualquer alteracao visual.
- Classes `.reveal` com IntersectionObserver para animacoes scroll-triggered.
- Mega menu ativado via `data-mega-menu` no link de Products.
- Carrossel de testimonials com auto-advance (6s) e dots navigation.
- Mobile tem bottom tab bar fixa (5 itens) alem do hamburger menu.
- Admin guard: `<main style="display:none">` revelado apos `checkAuth()`.
- SEO auto-gerado: tenta webhook n8n primeiro, fallback gera localmente.
- Export CSV usa `Blob` + `URL.createObjectURL` para download sem backend.
- Tags input usa Enter/virgula para criar pills com botao de remover.
- Debounce no filtro de busca (300ms) para evitar re-renders excessivos.
- Header logo usa `filter: invert(1)` para converter PNG branco em preto — funciona tanto no estado transparente quanto no solido.
- Trust strip: `.section` class causava conflito de CSS specificity com padding. Solucao: classe independente `.trust-strip` com `<span>` elements (inline por natureza) em vez de `<div>/<p>` dentro de flex container.
- Migracao de paleta de cores: alterar `:root` custom properties primeiro, depois hardcoded CSS, depois bulk replacement via sed em todos os HTMLs, depois valores `rgba()` de tint/shadow.
- Locations logo usa `filter: brightness(0)` para renderizar em preto. Footer logo usa inline style `filter: brightness(0)`.
- Hanstone grid com `repeat(4, 1fr)` em vez de `auto-fill` para garantir exatamente 4 colunas. Mobile usa `repeat(2, 1fr)`.
- Pagina Hanstone: dados originais de collections eram placeholder/fake (nomes inventados, gradientes CSS como swatches). Substituido por catalogo real de 40 cores com imagens oficiais.
- Brand Story carousel: CSS crossfade com `position: absolute` + `opacity` transitions, JS auto-rotativo a cada 4s usando IIFE.
- Lightbox: overlay com `pointer-events: none/all` toggle, fecha com X, click no overlay ou tecla Escape.
- Cor rosa Hanstone (`--hs-pink: #c44398`) usada no nome da pedra no lightbox para manter identidade visual da marca.
- Imagens com espacos no nome do arquivo (ex: "1 ANTELLO - LO804.jpg") funcionam em HTML src mas devem ser URL-encoded em alguns contextos.
- Pagina Lucciare redesenhada para espelhar estrutura Hanstone: collections convertidas de scroll horizontal para flat grid com `collection-badge` overlay por swatch. Lightbox adaptado para funcionar com placeholders de gradiente CSS (cria div dinamico) ate imagens reais serem adicionadas.
- Lucciare tem 3 colecoes (Signature 10 cores, Genesis 9 cores, Solstice 4 cores = 23 total) vs Hanstone (40 cores com imagens reais).
- StoneProfits API retorna duplicatas por location/bundle — 922 registros sao 440 produtos unicos. Deduplicacao obrigatoria no Transform node com agregacao de slabs/qty.
- Supabase upsert via REST requer `?on_conflict=sps_item_id` na URL + header `Prefer: resolution=merge-duplicates`. Sem o `on_conflict`, retorna 500 com "ON CONFLICT DO UPDATE command cannot affect row a second time".
- `this.helpers.httpRequest` no n8n Code node: usar `body: JSON.stringify(array)` (string), NAO `body: array, json: true` (double-serialize).
- Blog CRUD: IDs gerados pelo frontend (`post_123...`) nao sao UUID validos. O workflow "Prepare Save" precisa validar com regex UUID e tratar como insert novo se invalido.
- Blog CRUD: `alwaysOutputData: true` no node Supabase "List Posts" + filtrar items vazios (`item.json.id` exists) no "Filter By Status" e "Success Response".
- Unsplash API: query longa demais retorna poucos resultados. Usar titulo + "luxury interior" em vez de titulo + "stone countertop interior design".
- Location colors desaturadas pro palette monochrome: Miami `#5A6B7A`, Orlando `#6B5A7A`, Sarasota `#5A7A6B`.

---

## Como Rodar

```bash
# Iniciar servidor local
cd thestonesurfaces
python3 -m http.server 8080

# Abrir no browser
open http://localhost:8080

# Admin direto
open http://localhost:8080/pages/admin-login.html
# Senha: TSS@dmin2026!
```

---

## Proximos Passos

| Prioridade | Task | Status |
|------------|------|--------|
| Alta | ~~Migrar backend para Cloudfy (Supabase, n8n, Redis)~~ | FEITO |
| Alta | ~~Trocar LLMs: OpenAI → OpenRouter (Gemini, Mistral)~~ | FEITO |
| Alta | ~~Configurar Redis Chat Memory no Chat Agent~~ | FEITO |
| Alta | ~~Catalogo nativo de produtos (substituir iframe StoneProfitsWeb)~~ | FEITO |
| Alta | ~~Blog: fix save/list + upload imagem + Unsplash~~ | FEITO |
| Alta | ~~Product Sync: n8n workflow diario + manual~~ | FEITO |
| Alta | Admin Product Manager (enriquecimento: descricao + fotos aplicacao) | Pendente |
| Alta | Completar onboarding Chatwoot (browser ou super_admin) | Pendente |
| Alta | Configurar Gmail credential no n8n (App Password) | Pendente |
| Alta | Cliente responder questionario → system prompt do agente | Pendente |
| Media | Configurar Evolution API (WhatsApp notificacoes) | Pendente |
| Media | SEO completo: structured data, meta tags em todas as paginas | Pendente |
| Baixa | Otimizacao: lazy loading, WebP, critical CSS, CLS | Pendente |
