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
| n8n Webhooks | Backend AI para chat, blog ideas, content generation, SEO (futuro) |
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
│   └── 2026-03-11-admin-crm-blog-manager-design.md  # Design doc do admin
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
| 3 | Products | Grid com filtros (cor, finish, marca, espessura), comparison bar (ate 3 produtos) | done |
| 4 | Product Detail | Zoom on hover, accordion de specs tecnicas, produtos relacionados | done |
| 5 | Hanstone Page | Brand page: hero, brand story com carrossel auto-rotativo (7 fotos lifestyle), catalogo real 40 cores Hanstone com imagens oficiais, lightbox popup com nome em rosa Hanstone + codigo referencia, beneficios, recursos profissionais | done |
| 6 | Lucciare Page | Brand page dedicada com spotlight e collections | done |
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
| 17 | Blog Manager AI | Geracao de 5 ideias via n8n, geracao de conteudo AI, editor com toolbar, tags input, SEO auto-gerado (title, meta desc, OG, alt text, schema.org), preview modal com Google snippet, CRUD de posts | done |
| 18 | Blog Dinamico | Posts publicados no admin aparecem automaticamente no blog publico via localStorage | done |
| 19 | n8n AI Agent | Backend do chat com webhook real | todo |
| 20 | SEO & Performance | Structured data, meta tags, lazy loading, CLS | in-progress |

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

### n8n Webhooks (configurar em `js/admin-config.js`)

| Endpoint | Metodo | Funcao |
|----------|--------|--------|
| `/webhook/leads` | GET | Listar leads com filtros (status, source, date range) |
| `/webhook/leads` | POST | Criar lead (chatbot, forms) |
| `/webhook/leads/{id}` | PATCH | Atualizar status e notas de um lead |
| `/webhook/blog-ideas` | POST | Gerar 5 ideias de blog posts para o nicho |
| `/webhook/blog-generate` | POST | Gerar conteudo completo (HTML, excerpt, tags, categoria) |
| `/webhook/blog-seo` | POST | Gerar SEO completo (title, meta desc, OG, schema.org) |
| `/webhook/blog-posts` | GET | Listar posts (filtro por status) |
| `/webhook/blog-posts/{id}` | PUT | Salvar/atualizar post |

**Como ativar:** Editar `js/admin-config.js` → preencher URLs nos `ENDPOINTS` → manter `API_MODE: 'api'`. Se webhook falhar, fallback automatico para localStorage.

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
6. **Blog dinamico** — Posts publicados gravados em `localStorage('tss-blog-posts')`. Blog publico le e renderiza antes dos cards estaticos.
7. **i18n sem biblioteca** — IIFE puro, JSON de traducao, `data-i18n` attributes. Suporta textContent, innerHTML, placeholder, alt, title.
8. **Duas marcas parceiras** — Hanstone + Lucciare com paginas dedicadas.
9. **3 locacoes** — Doral (main showroom), Orlando, Sarasota. Mapas Google embeddados.

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

| Prioridade | Task | Dependencia |
|------------|------|-------------|
| Alta | Configurar workflows n8n para blog AI (ideas, generate, SEO) | n8n instance rodando |
| Alta | Configurar workflow n8n para AI chatbot (webhook real) | n8n instance rodando |
| Media | Conectar endpoints n8n em `admin-config.js` | Workflows n8n prontos |
| Media | SEO completo: structured data, meta tags em todas as paginas | — |
| Media | Imagens reais: hero, produtos, showroom, equipe | Assets do cliente |
| Baixa | Otimizacao: lazy loading, WebP, critical CSS, CLS | — |
| Baixa | PWA: service worker, offline support, manifest | — |
