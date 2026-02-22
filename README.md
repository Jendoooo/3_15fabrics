# iby_closet

E-commerce website for **iby_closet** — a Lagos-based men's fashion brand by Ibrahim Hamed. Editorial identity, themed collections, and a full order management system built for a founder running the business solo.

## Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion |
| Database | Supabase (Postgres + Storage) |
| Payments | Paystack |
| Email | Resend |
| WhatsApp | Fonnte |
| Images | Cloudinary |
| Analytics | PostHog |
| Caching | Upstash Redis |
| Hosting | Vercel |

## Features

**Storefront**
- Shop, Collections, Product detail pages
- Cart (Zustand, persisted to localStorage)
- Checkout with Paystack — delivery or pick up in Lagos
- International shipping support
- Public order tracking (no login required)
- Lookbook, Size Guide, FAQ, Contact, Brand pages

**Admin Panel** (`/admin`)
- Orders dashboard with search/filter by status, source, customer
- Order detail — update status, add tracking notes, auto-notifies customer via email + WhatsApp
- Products CRUD with Cloudinary image upload
- Collections CRUD
- Contacts list with CSV export and WhatsApp broadcast
- Manual order entry (for Instagram/WhatsApp orders)
- Quick Sale POS screen (for walk-in customers)
- Analytics link (PostHog)

**Backend**
- Paystack webhook — marks orders paid, sends confirmation email
- Delivery fee calculation (Lagos / outside Lagos / international)
- Abandoned cart recovery (email + WhatsApp)
- Redis caching for product/collection pages
- SEO metadata, sitemap.xml, robots.txt

## Local Development

```bash
cp .env.example .env.local
# Fill in all env vars

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

## Environment Variables

See `.env.example` for the full list. Key ones:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
PAYSTACK_SECRET_KEY
RESEND_API_KEY
NEXT_PUBLIC_FONNTE_TOKEN
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
NEXT_PUBLIC_POSTHOG_KEY
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
NEXT_PUBLIC_WHATSAPP_NUMBER
```

## Order Number Format

All orders use `IBY-YYYYXXXX` (e.g. `IBY-20260001`). Sources: website checkout, Instagram DM, WhatsApp, walk-in.

## Scripts

```bash
node scripts/seed_collection_and_variants.js   # Seed Rhythm & Thread collection + product variants
node scripts/create_test_product.js            # Create a test product for checkout testing
```
