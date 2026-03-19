# Native Product Catalog — Design Document

**Data:** 2026-03-19
**Status:** Aprovado
**Objetivo:** Substituir iframe do StoneProfitsWeb por catalogo nativo, bonito e eficiente

---

## Contexto

A area de produtos do site TSS usa um iframe do StoneProfitsWeb (`thestonesurfaces.stoneprofitsweb.com`) com hack CSS para esconder o header. Problemas:
- Visual inconsistente com o design system do site
- Sem controle sobre UX, filtros, ou layout
- Nao permite adicionar conteudo proprio (descricoes, fotos de aplicacao)
- SEO zero — Google nao indexa conteudo de iframe

## Descoberta: API StoneProfits

Investigacao revelou que o StoneProfitsWeb e uma Angular SPA que consome uma REST API:

| Recurso | Endpoint |
|---------|----------|
| **Base URL** | `https://thestonesurfaces.stoneprofits.com/api/fetchdataAngularProductionToyota.ashx` |
| **Produtos** | `act=getItemGallery` (POST com filtros no body) |
| **Locations** | `act=getLocations` (GET) |
| **Settings** | `act=getSettings` (GET) |

**Auth:** Token estatico (`SPSWebToken`) embeddado no HTML publico do StoneProfitsWeb. Funciona como API key. Armazenar em `.env` como `SPS_WEB_TOKEN`.

**Resultados:**
- 923 produtos
- 11 categorias: Quartzite (261), Quartz (276), Granite (162), Marble (99), Hard Marble (80), Dolomite (20), Onyx (12), Travertine (10), Soapstone (1), Semi Precious (1), Limestone (1)
- 3 locations: Miami (ID 2), Orlando (ID 3), Sarasota (ID 4)
- 861/923 produtos com imagem no S3
- Imagens em: `https://s3.us-east-1.amazonaws.com/thestonesurfaces-sps-files/{Filename}`

---

## Arquitetura

```
StoneProfits API ──→ n8n workflow ──→ Supabase (products) ──→ Site renderiza nativo
                     (diario 3AM +                           (JS fetch do Supabase)
                      botao admin)
```

### Principio: Zero-Downtime

1. Construir tudo em paralelo — iframe continua funcionando
2. Tabela `products` no Supabase populada via sync
3. Admin enriquece produtos (descricao + fotos aplicacao)
4. Frontend nativo construido e testado
5. Switch final: troca iframe pelo grid nativo (1 linha de HTML)

---

## 1. Banco de Dados — Supabase

### Tabela `products`

```sql
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

CREATE INDEX idx_products_sps_item_id ON products(sps_item_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_location ON products(location_name);
CREATE INDEX idx_products_finish ON products(finish_name);
CREATE INDEX idx_products_thickness ON products(thickness);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_name ON products(name);
```

### RLS Policies

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can read all products
CREATE POLICY "Public can read products"
  ON products FOR SELECT
  USING (true);

-- Service role full access
CREATE POLICY "Service role full access on products"
  ON products FOR ALL
  USING (auth.role() = 'service_role');
```

### Storage Bucket

- Bucket: `product-images`
- Public: Yes
- Max file size: 5MB
- Allowed types: image/webp, image/jpeg, image/png

### Mapa de Finish IDs

| Finish ID | Nome | Qtd |
|-----------|------|-----|
| 3630 | Polished | 811 |
| 3953 | Leather | 46 |
| 3936 | Honed | 34 |
| 3941 | Dual Polished/Leather | 12 |
| 4125 | Honed and Filled | 7 |
| 4047 | Satin | 5 |
| 3966 | Brushed | 3 |
| 3940 | Dual Polished/Honed | 3 |
| 4089 | Dual Honed/Leather | 1 |

### Mapa de Locations

| Location ID | Nome |
|-------------|------|
| 2 | Miami |
| 3 | Orlando |
| 4 | Sarasota |

---

## 2. Sync — n8n Workflow

**Workflow:** TSS Product Sync
**Trigger:** Schedule (diario 3AM) + Webhook (botao admin)

### Fluxo:

1. **HTTP Request** → GET `act=getLocations` → mapa location_id → nome
2. **HTTP Request** → POST `act=getItemGallery` com body vazio → 923 produtos
3. **Transform** → Para cada produto:
   - Mapear `finish_id` → `finish_name` (tabela hardcoded)
   - Mapear `location_id` → `location_name`
   - Construir `image_url` = `https://s3.us-east-1.amazonaws.com/thestonesurfaces-sps-files/{Filename}`
   - Construir `thickness` = `{Thickness}{ThicknessUOM}`
4. **Supabase Upsert** → upsert por `sps_item_id`
   - Atualiza dados do StoneProfits (inventario, qty, location)
   - PRESERVA campos de enriquecimento (description, application_images)
5. **Cleanup** → Remove produtos que nao vieram no sync (saiu do inventario)
6. **Log** → Registra: total sincronizado, novos, removidos, timestamp

### Headers da API

```
Authorization: {SPS_WEB_TOKEN}  (da .env)
Content-Type: application/json
Origin: https://thestonesurfaces.stoneprofitsweb.com
Referer: https://thestonesurfaces.stoneprofitsweb.com/
```

### Body do getItemGallery

```json
{
  "ItemName": "", "Location": "", "Type": "", "Category": "",
  "Thickness": "", "Finish": "", "Group": "", "Color": "",
  "PriceRange": "", "Origin": "", "Kind": "", "SubCategory": "",
  "SlabOptions": "", "SaleOptions": "", "AvailableOptions": "",
  "AvgCurrentAvailableQty": "", "AvgCurrentSlabLength": "",
  "AvgCurrentSlabWidth": "", "AvailableSlabs": "", "ItemIdentifiers": ""
}
```

### Query Params do getItemGallery

```
act=getItemGallery
WebconnectSettingID=1
InventoryGroupBy=IDOne_IDTwo_Lot_
SearchbyItemIdentifiers=on
ShowFeatureProductOnTop=on
OnHold=null
OnSO=null
Intransit=null
showNotInStock=null
SearchbyFinish=on
SearchbySKU=on
Alphabet=
```

---

## 3. Admin — Product Manager

### Nova pagina: `pages/admin/product-manager.html`

**Funcionalidades:**
- Lista todos os produtos sincronizados do Supabase
- Busca por nome, SKU
- Filtro por categoria, location
- Badge mostrando data do ultimo sync
- Botao "Sync Now" (chama webhook n8n)

**Ao clicar num produto — painel de edicao:**
- Dados do StoneProfits (read-only): nome, SKU, categoria, espessura, finish, location, inventario
- Imagem do slab (S3, read-only)
- **Campo "Description"** — textarea para descrever o produto (editavel)
- **Upload "Application Images"** — fotos de projetos/ambientes com esse produto
  - Drag & drop ou click to upload
  - Ate 6 imagens por produto
  - Armazena no Supabase Storage bucket `product-images`
  - Preview das imagens com opcao de remover
- Botao "Save" → atualiza `description` e `application_images` no Supabase

---

## 4. Frontend — Catalogo Nativo

### Pagina de Produtos (`products.html`)

**Layout:**
- Hero (existente, mantido)
- Barra de busca proeminente (full-width, busca por nome/SKU)
- Filtros laterais (desktop) / drawer (mobile):
  - Categoria (checkboxes com contagem)
  - Espessura (2cm, 3cm)
  - Finish (Polished, Leather, Honed, etc.)
  - Location (Miami, Orlando, Sarasota) com badges de cor
  - Toggles: New Arrivals, Featured
- Grid de produtos (3 col desktop, 2 tablet, 1 mobile)
- Paginacao ou infinite scroll
- Sort: Nome A-Z, Categoria, Newest

**Product Card:**
- Imagem do slab (lazy loaded, S3)
- Badge "NEW" (se is_new_arrival)
- Badge "FEATURED" (se is_featured)
- Nome do produto
- SKU (texto muted)
- Categoria
- Badges inline: espessura, finish
- Location pills (Miami / Orlando / Sarasota)
- Hover: leve scale + botoes aparecem
- CTAs: "View Details" + "Request Quote"

### Pagina de Detalhe (`product-detail.html` — dinamica via query param)

**URL:** `product-detail.html?id={sps_item_id}`

**Layout:**
- Breadcrumb: Home > Products > {Category} > {Name}
- Split layout:
  - **Esquerda (60%):** Imagem principal do slab (zoom on hover)
  - **Direita (40%):** Info do produto
    - Nome, SKU, Categoria
    - Espessura, Finish
    - Badges: New, Featured
    - CTAs: "Schedule an Appointment" + "Request Quote"

- **Descricao** (se existir texto do admin)
- **Galeria de Aplicacao** (se existir fotos do admin) — carrossel de ambientes
- **Disponibilidade** — cards por location:
  - Location name + estado
  - Block: {IDOne}
  - Bundle: {IDTwo}
  - Avg Size: {Length}" x {Width}"
  - Qty: {available_qty_sf} SF / {available_slabs} SLABS
- **Produtos Relacionados** — carrossel com mesma categoria

### Dados no Frontend

- **Fetch do Supabase** direto (anon key, RLS permite leitura publica)
- Cache local opcional (sessionStorage) pra performance
- Filtros aplicados client-side (923 produtos e leve, nao precisa server-side)

---

## 5. Seguranca

| Item | Abordagem |
|------|-----------|
| SPS_WEB_TOKEN | Em `.env`, usado apenas server-side (n8n) |
| Supabase anon key | No frontend, protegido por RLS |
| Service role key | Apenas no n8n para write operations |
| Admin auth | Existente (SHA-256 + sessionStorage) |
| Product images | Supabase Storage, bucket publico (fotos de aplicacao) |

---

## 6. Fases de Implementacao

| Fase | Descricao | Impacto no site |
|------|-----------|-----------------|
| 1 | Migration SQL + tabela products no Supabase | Nenhum |
| 2 | n8n workflow de sync + primeiro sync | Nenhum |
| 3 | Admin Product Manager (enriquecimento) | Nenhum no publico |
| 4 | Frontend nativo (products.html + product-detail.html) | Nenhum (construido escondido) |
| 5 | Testes completos | Nenhum |
| 6 | Switch: troca iframe pelo grid nativo | Go live |

**A qualquer momento ate a Fase 6, o iframe continua funcionando normalmente.**

---

## API Reference — StoneProfits Endpoints Descobertos

| Acao | Metodo | Params | Retorno |
|------|--------|--------|---------|
| `getSettings` | GET | `WebconnectSettingID=1` | Config do catalogo (filtros, campos visiveis) |
| `getItemGallery` | POST | Query params + body JSON com filtros | Array de 923 produtos |
| `getLocations` | GET | `WebconnectSettingID=1` | Array de 3 locations (Miami, Orlando, Sarasota) |
| `getItemInventory` | GET/POST | `ItemID={id}` | Detalhe de inventario (requer params corretos — investigar) |

**Base URL:** `https://thestonesurfaces.stoneprofits.com/api/fetchdataAngularProductionToyota.ashx`
**Auth Header:** `Authorization: {SPS_WEB_TOKEN}`
**Required Headers:** `Origin` e `Referer` do stoneprofitsweb.com
