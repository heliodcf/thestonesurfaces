# The Stone Surfaces — Website

## Escopo
Website multi-pagina premium para **The Stone Surfaces**, distribuidora B2B de pedras naturais e quartzo em South Florida. Fundada em 2016, distribui Granite, Marble, Quartz, Quartzite, Dolomite, Hard Marble. Distribuidora oficial de **Hanstone Quartz by Hyundai L&C** e **Lucciare Handcrafted Quartz**. Publico-alvo: fabricantes, designers de interiores, arquitetos, construtoras, showrooms e homeowners.

## Stack
| Tecnologia | Uso |
|------------|-----|
| HTML5 semantico | Estrutura de todas as paginas |
| CSS3 (vanilla) | Design system com custom properties, responsivo |
| JavaScript (vanilla) | Animacoes, carrossel, mega menu, chat widget |
| Google Fonts | Cormorant Garamond (headlines) + Space Grotesk (body/UI) |
| n8n Chat Widget | Placeholder para integracao com AI agent backend |

## Skills Utilizadas
| Skill | Quando usar |
|-------|-------------|
| `frontend-design` | Ajustes visuais, novos componentes, melhorias de UI |
| `senior-frontend` | Logica JS, responsividade, performance |
| `ui-ux-pro-max` | Revisao de design, paleta, tipografia |
| `landing-page-copywriter` | Textos de conversao, CTAs, headlines |
| `seo-copywriter-pro` | SEO on-page, meta tags, structured data |

## Estrutura do Projeto
```
thestonesurfaces/
├── index.html              # Homepage (9 secoes)
├── claude.md               # Spec completa de design/build (Google Stitch prompt)
├── README.md               # Este arquivo
├── css/
│   ├── styles.css          # Design system completo + responsivo
│   └── admin.css           # Estilos da area admin
├── js/
│   ├── main.js             # Animacoes, carrossel, navegacao, chat
│   ├── admin-config.js     # Config admin: endpoints, auth, constantes
│   ├── admin-auth.js       # Autenticacao (SHA-256, session, guard)
│   └── admin-data.js       # Data layer CRUD (leads, posts, AI gen)
├── pages/
│   ├── admin-login.html    # Login do admin
│   ├── admin/
│   │   ├── dashboard.html  # CRM Dashboard de leads
│   │   └── blog-manager.html # Blog Manager com AI
│   ├── products.html       # Catalogo com filtros e grid
│   ├── product-detail.html # Detalhe do produto com specs
│   ├── hanstone.html       # Pagina dedicada Hanstone Quartz
│   ├── lucciare.html       # Pagina dedicada Lucciare Quartz
│   ├── inspired.html       # Galeria de projetos + Before/After
│   ├── blog.html           # Blog com categorias + posts dinamicos
│   ├── about.html          # Historia, equipe, showroom
│   ├── contact.html        # Formulario de contato/quote
│   └── trade.html          # Portal para profissionais
└── images/
    ├── header/             # Logo TSS
    ├── hero/               # Imagens hero + badges distribuidores
    ├── collections/        # Thumbnails das categorias de pedra
    ├── hanstone/           # Assets da marca Hanstone
    ├── lucciare/           # Assets da marca Lucciare
    └── inspired/           # Galeria de projetos + Instagram
```

## Etapas do Projeto
| Etapa | Descricao | Skill | Status |
|-------|-----------|-------|--------|
| 1. Design System | Paleta, tipografia, spacing, motion | `frontend-design` | done |
| 2. Homepage | 9 secoes: hero, spotlights, collections, trust, carousel, reviews, blog, locations, newsletter | `senior-frontend` | done |
| 3. Pagina Products | Grid com filtros, comparison bar | `senior-frontend` | done |
| 4. Product Detail | Zoom, specs accordion, related products | `senior-frontend` | done |
| 5. Hanstone Page | Brand page dedicada com collections browser | `senior-frontend` | done |
| 6. Lucciare Page | Brand page dedicada | `senior-frontend` | done |
| 7. Get Inspired | Masonry gallery, Before/After slider, Instagram feed | `senior-frontend` | done |
| 8. Blog | Featured post, grid, sidebar | `senior-frontend` | done |
| 9. About | Timeline, equipe, showroom, mapa | `senior-frontend` | done |
| 10. Contact | Formulario split-layout com mapa | `senior-frontend` | done |
| 11. For The Trade | Portal profissional com formulario | `senior-frontend` | done |
| 12. Chat Widget | n8n integration placeholder | `senior-frontend` | done |
| 13. n8n AI Agent | Backend do chat com webhook real | `n8n-mcp-tools-expert` | todo |
| 14. SEO & Performance | Structured data, meta tags, lazy loading, CLS | `seo-copywriter-pro` | in-progress |
| 15. Admin Login | Autenticacao SHA-256, sessao 8h, guard | `senior-frontend` | done |
| 16. CRM Dashboard | Metricas, tabela de leads, filtros, export CSV | `senior-frontend` | done |
| 17. Blog Manager AI | Geracao de conteudo via n8n, editor, SEO auto | `senior-frontend` | done |

## Decisoes de Arquitetura
- **Vanilla HTML/CSS/JS** — sem frameworks. Site estatico, focado em performance e simplicidade de deploy.
- **Design system via CSS custom properties** — paleta dark premium com gold accents, facil de manter.
- **Duas marcas parceiras (Hanstone + Lucciare)** — cada uma com pagina dedicada e spotlight na homepage.
- **3 locacoes** — Doral (main showroom), Orlando, Sarasota. Cada uma com mapa embeddado.
- **Chat widget placeholder** — estrutura HTML/CSS pronta, aguardando webhook real do n8n.
- **Spec completa em `claude.md`** — documento de referencia para qualquer ajuste ou nova feature.

- **Admin area separada** — CSS e JS proprios (`admin.css`, `admin-*.js`), nao polui os arquivos publicos.
- **Data layer com dual mode** — `admin-data.js` suporta localStorage (fallback) e n8n API (producao). Troca via `ADMIN_CONFIG.API_MODE`.
- **Blog dinamico** — Posts publicados no admin aparecem automaticamente em `blog.html` via localStorage.
- **n8n webhooks prontos** — Endpoints definidos em `admin-config.js`, basta preencher as URLs quando os workflows estiverem no ar.

## Aprendizados
- O `claude.md` funciona como spec de design (originalmente prompt para Google Stitch). Ler ANTES de qualquer alteracao visual.
- Site usa classes `.reveal` com IntersectionObserver para animacoes scroll-triggered.
- Mega menu ativado via `data-mega-menu` no link de Products.
- Carrossel de testimonials com auto-advance (6s) e dots navigation.
- Mobile tem bottom tab bar fixa (5 itens) alem do hamburger menu.
