# context_window.md — Ultra-Compressed Project Reference

**Read this instead of all other .md files when you need a fast orientation.**
Full details: CLAUDE.md | Your tasks: task.md | Your log: GEMINI.md or CODEX.md

---

## Project
iby_closet — Lagos men's fashion e-commerce. Next.js 14 + Supabase + Paystack + Tailwind.

## Stack (short)
Next14 · TypeScript · Tailwind · Supabase · Paystack · Resend · Fonnte · Cloudinary · PostHog · Upstash · Vercel

## Key Paths
```
src/app/          → pages (shop, collections, products/[slug], cart, checkout, track, admin/, api/)
src/components/   → Header.tsx, Footer.tsx
src/lib/          → supabase.ts, types.ts, cart-store.ts  (TO BE BUILT)
supabase/migrations/20240221000000_initial_schema.sql  → full DB schema
```

## DB Tables
contacts · categories · collections · products · product_images · product_variants
customers · addresses · orders · order_items · delivery_tracking · waitlist · abandoned_carts

## Critical Rules
- Order number format: `IBY-YYYYXXXX`
- orders.source: website / instagram / whatsapp / walk_in
- orders.payment_method: paystack_online / bank_transfer / cash / pos_terminal
- contacts.source: waitlist / newsletter / abandoned_cart / checkout / footer / walk_in
- Server Components by default — `'use client'` only for hooks/events/browser APIs
- All Supabase calls → `src/lib/supabase.ts` clients
- No hardcoded secrets — use env vars from `.env.example`
- Mobile-first (375px), Tailwind only, no inline styles

## Env Vars (all in .env.example)
NEXT_PUBLIC_SUPABASE_URL · NEXT_PUBLIC_SUPABASE_ANON_KEY · SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY · PAYSTACK_SECRET_KEY · RESEND_API_KEY · FONNTE_TOKEN
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME · CLOUDINARY_API_KEY · CLOUDINARY_API_SECRET
NEXT_PUBLIC_POSTHOG_KEY · NEXT_PUBLIC_POSTHOG_HOST · UPSTASH_REDIS_REST_URL · UPSTASH_REDIS_REST_TOKEN

## API Routes (all to be built)
POST   /api/contacts                → upsert contact by email or whatsapp
POST   /api/orders                  → create order + items, return IBY-XXXXXX
GET    /api/orders/[orderNumber]    → public order lookup (no auth)
POST   /api/paystack/webhook        → verify sig, mark order paid
POST   /api/delivery/calculate      → return delivery fee options by state

## Agent Roles (3 agents)
- GEMINI  → backend: supabase.ts, types.ts, .env.example, all API routes (G1–G8)
- CODEX   → frontend: cart store, all UI pages connected to real data (C1–C10)
- CLAUDE  → auditor + admin panel builder. Reviews all output before it's considered done.

## What's Built
- Next.js project initialized, deps installed
- Supabase schema migration created
- UI scaffolds: shop, collections, products/[slug], cart, checkout, track (all static placeholders)
- Header.tsx, Footer.tsx in src/components/

## What's NOT Built Yet
- src/lib/ (supabase.ts, types.ts, cart-store.ts)
- .env.example
- Any API routes
- Any page connected to real data
- Admin panel
- Cart state
