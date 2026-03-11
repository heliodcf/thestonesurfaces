# Admin Area + CRM + Blog Manager AI — Design Document

**Date:** 2026-03-11
**Status:** Implemented

## Summary

Added admin area to The Stone Surfaces website with:
1. **Admin Login** — SHA-256 password auth with session management
2. **CRM Dashboard** — Lead management with metrics, filters, export
3. **AI Blog Manager** — Content generation via n8n webhooks, SEO auto-generation

## Architecture

### New Files
- `js/admin-config.js` — Central config (endpoints, auth hash, constants)
- `js/admin-auth.js` — Auth module (login, guard, logout)
- `js/admin-data.js` — Data layer (CRUD leads/posts, AI generation, localStorage fallback)
- `css/admin.css` — Admin-specific styles
- `pages/admin-login.html` — Login page
- `pages/admin/dashboard.html` — CRM Dashboard
- `pages/admin/blog-manager.html` — Blog Manager with AI

### Modified Files
- `pages/blog.html` — Added dynamic post rendering from localStorage

## Integration Points (n8n)

All endpoints configured in `js/admin-config.js`. Set `API_MODE: 'api'` and fill webhook URLs.

| Feature | Webhook |
|---------|---------|
| List leads | `GET /webhook/leads` |
| Create lead | `POST /webhook/leads` |
| Update lead | `PATCH /webhook/leads/{id}` |
| Generate blog ideas | `POST /webhook/blog-ideas` |
| Generate blog content | `POST /webhook/blog-generate` |
| Generate blog SEO | `POST /webhook/blog-seo` |

## Auth

- Password: `TSS@dmin2026!` (stored as SHA-256 hash)
- Session: `sessionStorage` with 8-hour expiry
- Guard: `<main>` hidden until auth verified
