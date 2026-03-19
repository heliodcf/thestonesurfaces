# Google Ads — Audit & Activation Schema
**Data:** 2026-03-19
**Executor:** Claude Coworker (Browser Session)
**Conta:** Google Ads ocid=877770435
**Objetivo:** Auditar as 6 campanhas, corrigir problemas, ativar

---

## CONTEXTO RAPIDO

- 6 campanhas criadas, TODAS PAUSADAS
- Campanhas 1-4: ads DISAPPROVED (provavel causa: URLs pages.dev ou site offline quando criados)
- Campanha 5 (PMax): OK
- Campanha 6 (Caribbean): OK, bid strategy learning
- Site LIVE em thestonesurfaces.com desde 2026-03-18
- Tracking (GTM + GA4 + conversions) ja configurado

---

## FASE 1: DIAGNOSTICO (fazer ANTES de qualquer mudanca)

### 1.1 — Verificar motivo de reprovacao dos ads

Para CADA campanha (1-4), abrir e anotar:
- [ ] Qual o motivo EXATO de reprovacao (Google mostra no status do ad)
- [ ] Anotar se e "Destination not working", "Malicious software", "Policy violation" ou outro

**Resultado esperado:** Lista com motivo de reprovacao de cada ad em cada campanha.

### 1.2 — Auditar TODAS as URLs

Verificar em TODAS as 6 campanhas, em TODOS os niveis:
- [ ] **Final URLs dos ads** — deve ser `thestonesurfaces.com/pages/contact.html` (campanhas 1-3, 6) ou `thestonesurfaces.com/pages/hanstone.html` (campanha 4) ou `thestonesurfaces.com` (campanha 5)
- [ ] **Display paths** — verificar se estao corretos
- [ ] **Sitelink URLs** — TODAS devem apontar para `thestonesurfaces.com/pages/...` (NAO pages.dev)
- [ ] **Callout extensions** — verificar se existem em todas campanhas
- [ ] **Structured snippets** — verificar se existem em todas campanhas

**Se encontrar QUALQUER URL com `pages.dev`:** trocar para `thestonesurfaces.com` equivalente.

### 1.3 — Verificar Call Asset

- [ ] Call Asset (866) 960-8579 esta vinculado a TODAS as 6 campanhas?
- [ ] Status do Call Asset: approved? under review? disapproved?
- [ ] Google forwarding number esta ativo?

### 1.4 — Verificar Conversion Tracking

- [ ] Conversao "Phone call lead" — ativa e recebendo dados?
- [ ] Conversao "Request quote" — ativa e recebendo dados?
- [ ] Verificar se o GA4 (G-8WBNDX8E2W) esta vinculado a conta

### 1.5 — Verificar Bid Strategies

| Campanha | Bidding CORRETO (conforme plano) |
|----------|----------------------------------|
| 1. Miami Search | Maximize conversions |
| 2. Orlando Search | Maximize conversions |
| 3. Sarasota B2B | Maximize conversions |
| 4. Hanstone Florida | **Maximize clicks** (NAO conversions) |
| 5. PMax Remarketing | Maximize conversions |
| 6. Caribbean + PR | Maximize conversions |

- [ ] Campanha 4 (Hanstone) esta com Maximize Clicks? Se nao, trocar.

---

## FASE 2: CORRECOES

Executar SOMENTE se Fase 1 identificou problemas.

### 2.1 — Corrigir URLs (se necessario)

Para cada URL incorreta encontrada:
1. Editar o ad/sitelink/extension
2. Trocar URL para o equivalente em `thestonesurfaces.com`
3. Salvar

**Mapa de URLs corretas:**
| Destino | URL |
|---------|-----|
| Homepage | `https://thestonesurfaces.com` |
| Contact | `https://thestonesurfaces.com/pages/contact.html` |
| Hanstone | `https://thestonesurfaces.com/pages/hanstone.html` |
| Lucciare | `https://thestonesurfaces.com/pages/lucciare.html` |
| Products | `https://thestonesurfaces.com/pages/products.html` |

### 2.2 — Corrigir Bid Strategy Hanstone (se necessario)

- Campanha 4 [SEARCH] HANSTONE deve usar **Maximize Clicks** (nao Maximize Conversions)
- Motivo: campanha de marca precisa volume primeiro, otimizar depois

### 2.3 — Re-submeter ads reprovados

Depois de corrigir URLs:
- [ ] Editar cada ad reprovado (mesmo que seja so adicionar/remover um espaco) para forcar re-review
- [ ] Ou usar "Appeal" se disponivel

### 2.4 — Negative Keywords (replicar para campanhas 1-4)

Verificar se campanhas 1-4 tem negative keywords. Se nao tiverem:

**Negatives para campanhas 1-3 (Miami, Orlando, Sarasota):**
- installation, install, fabrication, fabricator, countertop install, DIY, how to install, cheap, free, used, remnant, remnants

**Negatives adicionais para campanha 3 (Sarasota B2B):**
- homeowner, residential DIY, how to, home improvement

**Negatives para campanha 4 (Hanstone):**
- canada, hanstone canada, review, reviews, complaints, price

**Campanha 6 (Caribbean) ja tem negatives — so verificar.**

### 2.5 — Vincular Call Asset

Se Call Asset nao estiver vinculado a todas campanhas:
- [ ] Vincular (866) 960-8579 como Call Asset em TODAS as 6 campanhas

---

## FASE 3: VALIDACAO PRE-ATIVACAO

Antes de ativar QUALQUER campanha, confirmar:

- [ ] TODOS os ads estao APPROVED (ou pelo menos em review, nao disapproved)
- [ ] TODAS as URLs apontam para thestonesurfaces.com (zero pages.dev)
- [ ] Call Asset vinculado em todas campanhas
- [ ] Negative keywords presentes em todas campanhas
- [ ] Bid strategies corretas (Hanstone = Maximize Clicks, resto = Maximize Conversions)
- [ ] Conversion tracking ativo (Phone call lead + Request quote)
- [ ] Budget de cada campanha confere com o plano:
  - Miami: $18/dia
  - Orlando: $12/dia
  - Sarasota: $8/dia
  - Hanstone: $10/dia
  - PMax: $7/dia
  - Caribbean: $8/dia

---

## FASE 4: ATIVACAO (ordem especifica)

Ativar UMA campanha por vez, nesta ordem:

### Rodada 1 — Imediata
1. **[PMAX] REMARKETING + LOCAL** — ativar primeiro (ja estava OK, sem reprovacoes)
2. **[SEARCH] CARIBBEAN + PUERTO RICO** — ativar segundo (ja estava OK)

### Rodada 2 — Apos ads aprovados
3. **[SEARCH] MIAMI — High Intent** — prioridade maxima (maior budget, mercado principal)
4. **[SEARCH] HANSTONE — Florida Wide** — produto exclusivo, diferencial competitivo

### Rodada 3 — Sequencial
5. **[SEARCH] ORLANDO — High Intent** — segundo mercado
6. **[SEARCH] SARASOTA — B2B Only** — menor budget, mercado menor

**Para cada ativacao:**
- Mudar status de PAUSED para ENABLED
- Confirmar que ads estao rodando (verificar impressions apos 30 min se possivel)

---

## FASE 5: RELATORIO

Ao final, produzir relatorio com:

```
## Google Ads Audit Report — 2026-03-19

### Problemas Encontrados
- [listar cada problema encontrado na Fase 1]

### Correcoes Aplicadas
- [listar cada correcao feita na Fase 2]

### Status Final por Campanha
| Campanha | Ads Status | URLs OK | Negatives | Bid Strategy | Call Asset | ATIVA? |
|----------|-----------|---------|-----------|--------------|------------|--------|
| Miami    |           |         |           |              |            |        |
| Orlando  |           |         |           |              |            |        |
| Sarasota |           |         |           |              |            |        |
| Hanstone |           |         |           |              |            |        |
| PMax     |           |         |           |              |            |        |
| Caribbean|           |         |           |              |            |        |

### Pendencias (se houver)
- [itens que nao puderam ser resolvidos]

### Proximos Passos
- Monitorar impressions/clicks nas primeiras 24h
- Verificar se ads reprovados foram re-aprovados (leva ate 1 dia util)
- Semana 1: pausar keywords sem conversao
- Semana 2-4: mover budget pro que converte
```

---

## REGRAS PARA O COWORKER

1. **NAO deletar nenhuma campanha** — apenas pausar ou editar
2. **NAO criar campanhas novas** — so trabalhar com as 6 existentes
3. **NAO alterar copy dos ads** (headlines/descriptions) — so corrigir URLs
4. **NAO alterar budgets** — manter conforme plano
5. **NAO alterar targeting geografico** — ja esta correto
6. **NAO ativar campanha com ads disapproved** — resolver primeiro
7. **Seguir a ordem de ativacao** da Fase 4
8. **Documentar TUDO** no relatorio da Fase 5
9. **Se algo estiver ambiguo: PARAR e perguntar** ao owner antes de agir

---

## REFERENCIAS

- Plano estrategico completo: `docs/plans/2026-03-16-google-ads-strategy.md`
- Brief de execucao original: `docs/plans/2026-03-16-google-ads-execution-brief.md`
- Conta Google Ads: ocid=877770435
- Site: thestonesurfaces.com
- GTM: GTM-KPZR9CKJ
- GA4: G-8WBNDX8E2W
- Telefone: (866) 960-8579
