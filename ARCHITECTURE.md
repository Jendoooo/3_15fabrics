# ARCHITECTURE.md — iby_closet System Architecture & Product Design

> **Last updated:** 2026-02-21
> **Project:** iby_closet — editorial men's fashion e-commerce
> **Owner:** Ibrahim Hamed (Lagos, Nigeria)

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Sitemap & Page Relationships](#2-sitemap--page-relationships)
3. [User Flows](#3-user-flows)
4. [Page-by-Page Functionality](#4-page-by-page-functionality)
5. [API Routes](#5-api-routes)
6. [Database Schema (ER Diagram)](#6-database-schema-er-diagram)
7. [Data Flow](#7-data-flow)
8. [Sales Channels](#8-sales-channels)
9. [Third-Party Integrations](#9-third-party-integrations)
10. [File Structure Map](#10-file-structure-map)

---

## 1. System Architecture

```mermaid
graph TB
    subgraph "Client (Browser)"
        SITE["Storefront<br/>(site) route group"]
        ADMIN["Admin Panel<br/>admin/ route group"]
        CART["Zustand Cart<br/>localStorage"]
    end

    subgraph "Next.js 14 (Vercel)"
        MW["Middleware<br/>Cookie Auth Guard"]
        API["API Routes<br/>/api/*"]
        SSR["Server Components<br/>Product/Shop/Collection pages"]
    end

    subgraph "External Services"
        SUPA["Supabase<br/>PostgreSQL + Auth"]
        PS["Paystack<br/>Payments"]
        RS["Resend<br/>Transactional Email"]
        FN["Fonnte<br/>WhatsApp Broadcasts"]
        CL["Cloudinary<br/>Image CDN"]
        PH["PostHog<br/>Analytics"]
        RD["Upstash Redis<br/>Cache Layer"]
    end

    SITE -->|reads| SSR
    SITE -->|POST/GET| API
    ADMIN -->|guarded by| MW
    ADMIN -->|CRUD| API

    SSR -->|cached via| RD
    SSR -->|queries| SUPA
    API -->|queries| SUPA
    API -->|verify webhook| PS
    API -->|send email| RS
    API -->|send WhatsApp| FN
    API -->|delivery calc| API

    PS -->|webhook: charge.success| API
    SITE -->|inline payment| PS
    SITE -->|track events| PH
    SSR -->|image src| CL

    CART -->|persisted| SITE

    style SITE fill:#1a1a1a,color:#fff
    style ADMIN fill:#333,color:#fff
    style SUPA fill:#3ecf8e,color:#000
    style PS fill:#00c3f7,color:#000
    style RD fill:#dc2626,color:#fff
    style PH fill:#f59e0b,color:#000
```

---

## 2. Sitemap & Page Relationships

```mermaid
graph TD
    HOME["/ <br/>Homepage"]
    SHOP["/ shop<br/>All Products"]
    CAT["/shop/[category]<br/>Category Filter"]
    COLL["/collections<br/>All Collections"]
    COLLDET["/collections/[slug]<br/>Collection Detail"]
    PROD["/products/[slug]<br/>Product Detail"]
    CART["/cart<br/>Shopping Cart"]
    CHECK["/checkout<br/>Checkout + Payment"]
    SUCCESS["/checkout/success<br/>Order Confirmation"]
    TRACK["/track<br/>Order Tracking"]

    ALOGIN["/admin/login<br/>Admin Login"]
    AORDERS["/admin/orders<br/>Orders Dashboard"]
    AORDERDET["/admin/orders/[id]<br/>Order Detail"]
    ANEWORDER["/admin/orders/new<br/>Manual Order Entry"]
    APRODS["/admin/products<br/>Products List"]
    APRODDET["/admin/products/[id]<br/>Edit Product"]
    ANEWPROD["/admin/products/new<br/>New Product"]
    ACOLLS["/admin/collections<br/>Collections List"]
    ACOLLDET["/admin/collections/[id]<br/>Edit Collection"]
    ANEWCOLL["/admin/collections/new<br/>New Collection"]
    ACONTACTS["/admin/contacts<br/>Contacts + Broadcast"]
    AQUICK["/admin/quick-sale<br/>Walk-in POS"]

    HOME -->|"Featured Products"| PROD
    HOME -->|"Featured Collections"| COLLDET
    HOME -->|"Shop All CTA"| SHOP

    SHOP -->|"Product Card"| PROD
    SHOP -->|"Category Link"| CAT
    CAT -->|"Product Card"| PROD
    CAT -->|"Back to Shop"| SHOP

    COLL -->|"Explore"| COLLDET
    COLL -->|"Notify Me (upcoming)"| COLL
    COLLDET -->|"Product Card"| PROD

    PROD -->|"Add to Cart"| CART
    PROD -->|"WhatsApp Enquiry"| WA["wa.me (external)"]
    CART -->|"Checkout CTA"| CHECK
    CART -->|"Continue Shopping"| SHOP
    CHECK -->|"Paystack → Order"| SUCCESS
    SUCCESS -->|"Track Order"| TRACK
    SUCCESS -->|"Continue Shopping"| SHOP

    ALOGIN -->|"Password Auth"| AORDERS
    AORDERS -->|"View Order"| AORDERDET
    AORDERS -->|"New Order"| ANEWORDER
    APRODS -->|"Edit"| APRODDET
    APRODS -->|"New"| ANEWPROD
    ACOLLS -->|"Edit"| ACOLLDET
    ACOLLS -->|"New"| ANEWCOLL
    AQUICK -->|"Complete Sale"| AQUICK

    subgraph "Storefront (Public)"
        HOME
        SHOP
        CAT
        COLL
        COLLDET
        PROD
        CART
        CHECK
        SUCCESS
        TRACK
    end

    subgraph "Admin Panel (Protected)"
        ALOGIN
        AORDERS
        AORDERDET
        ANEWORDER
        APRODS
        APRODDET
        ANEWPROD
        ACOLLS
        ACOLLDET
        ANEWCOLL
        ACONTACTS
        AQUICK
    end

    style HOME fill:#1a1a1a,color:#fff
    style CHECK fill:#059669,color:#fff
    style AQUICK fill:#7c3aed,color:#fff
    style ALOGIN fill:#dc2626,color:#fff
```

---

## 3. User Flows

### 3.1 — Shopping & Checkout Flow

```mermaid
flowchart TD
    A["Customer lands on Homepage"] --> B{"Browse Products?"}
    B -->|Shop All| C["/shop — Product Grid"]
    B -->|By Category| D["/shop/[category] — Filtered Grid"]
    B -->|By Collection| E["/collections — Collection Cards"]

    C --> F["/products/[slug] — Product Detail"]
    D --> F
    E --> G["/collections/[slug] — Collection Page"]
    G --> F

    F --> H{"Has Variants?"}
    H -->|Yes, in stock| I["Select Size → Add to Cart"]
    H -->|Yes, out of stock| J["'Out of Stock' message"]
    H -->|No variants| K["'Enquire on WhatsApp' CTA"]

    I --> L["/cart — Review Cart"]
    L --> M{"Adjust Cart?"}
    M -->|Change qty| L
    M -->|Remove item| L
    M -->|Proceed| N["/checkout"]

    N --> O["Fill Contact (email, WhatsApp)"]
    O --> P["Fill Delivery (name, address, state)"]
    P --> Q["Select Country (Nigeria default / International)"]
    Q --> R["Delivery options auto-calculated"]
    R --> S["Select shipping option"]
    S --> T["Click 'Pay ₦XX,XXX' → Paystack modal"]
    T --> U{"Payment Successful?"}
    U -->|Yes| V["POST /api/orders → Order Created"]
    V --> W["/checkout/success — Show IBY-YYYYXXXX"]
    U -->|No / Closed| N

    W --> X["Track Order at /track"]
    W --> Y["Continue Shopping at /shop"]

    style A fill:#1a1a1a,color:#fff
    style T fill:#00c3f7,color:#000
    style W fill:#059669,color:#fff
```

### 3.2 — Order Tracking Flow

```mermaid
flowchart LR
    A["Customer visits /track"] --> B["Enter Order Number<br/>IBY-YYYYXXXX"]
    B --> C["GET /api/orders/[orderNumber]"]
    C --> D{"Order Found?"}
    D -->|Yes| E["Show: Status Badge,<br/>Items, Address,<br/>Tracking Timeline"]
    D -->|No| F["'Order not found' message"]

    style A fill:#1a1a1a,color:#fff
    style E fill:#059669,color:#fff
    style F fill:#dc2626,color:#fff
```

### 3.3 — Admin: Manual Order Entry (Instagram/WhatsApp/Walk-in)

```mermaid
flowchart TD
    A["Ibrahim opens /admin/orders/new"] --> B["Select Source:<br/>Instagram / WhatsApp / Walk-in / Other"]
    B --> C["Enter Customer Details:<br/>Name, Phone, WhatsApp, Email"]
    C --> D["Search Products by Name<br/>(debounced Supabase query)"]
    D --> E["Select Product → Pick Variant/Size"]
    E --> F["Add to Order Items List"]
    F --> G{"More items?"}
    G -->|Yes| D
    G -->|No| H["Select Payment Method:<br/>Bank Transfer / Cash / POS"]
    H --> I["Submit → POST /api/orders"]
    I --> J["Order Created: IBY-YYYYXXXX"]

    style A fill:#333,color:#fff
    style J fill:#059669,color:#fff
```

### 3.4 — Admin: Quick Sale (Walk-in POS)

```mermaid
flowchart LR
    A["Ibrahim at physical store<br/>/admin/quick-sale"] --> B["Search products"]
    B --> C["Tap product → select variant"]
    C --> D["Item added to sale"]
    D --> E{"More items?"}
    E -->|Yes| B
    E -->|No| F["Select: Cash / POS Terminal"]
    F --> G["'Complete Sale' button"]
    G --> H["POST /api/orders<br/>source: walk_in"]
    H --> I["✓ Sale Complete — IBY-YYYYXXXX<br/>'New Sale' button to reset"]

    style A fill:#7c3aed,color:#fff
    style I fill:#059669,color:#fff
```

### 3.5 — Payment Confirmation Flow

```mermaid
sequenceDiagram
    participant C as Customer Browser
    participant PS as Paystack
    participant API as /api/orders
    participant WH as /api/paystack/webhook
    participant DB as Supabase
    participant EM as Resend Email

    C->>PS: Paystack.popup.open()
    PS->>PS: Customer enters card details
    PS-->>C: onSuccess({ reference })
    C->>API: POST /api/orders (payment_reference, items, etc.)
    API->>DB: INSERT order (status: pending, payment_status: unpaid)
    API->>DB: INSERT order_items
    API->>DB: UPSERT contact (source: checkout)
    API-->>C: { order_number: "IBY-20260001" }
    C->>C: Redirect to /checkout/success

    Note over PS,WH: Async webhook (seconds later)
    PS->>WH: POST /api/paystack/webhook (charge.success)
    WH->>WH: Verify HMAC signature
    WH->>DB: Find order by payment_reference
    WH->>DB: UPDATE order (payment_status: paid, status: confirmed)
    WH->>DB: INSERT delivery_tracking (status: confirmed)
    WH->>EM: sendOrderConfirmation()
    EM-->>C: Email: "Order IBY-20260001 Confirmed"
```

### 3.6 — Contact Capture Flow

```mermaid
flowchart TD
    A["Footer Newsletter Form"] -->|email + source: footer| API["POST /api/contacts"]
    B["Checkout (on order)"] -->|email + whatsapp + source: checkout| API
    C["Waitlist (Notify Me)"] -->|email + collection_id| W["POST /api/waitlist"]
    D["Walk-in (Quick Sale)"] -->|name + phone + source: walk_in| API

    API --> DB["contacts table<br/>(upsert by email or whatsapp)"]
    W --> WDB["waitlist table"]

    DB --> RS["Resend<br/>Email Campaigns"]
    DB --> FN["Fonnte<br/>WhatsApp Broadcasts"]

    style API fill:#059669,color:#fff
    style DB fill:#3ecf8e,color:#000
```

---

## 4. Page-by-Page Functionality

### Storefront Pages

| Page | URL | Type | Key Functionality |
|---|---|---|---|
| **Homepage** | `/` | Server | Full-screen black hero, featured products grid (4-col), featured collections section. Data from Supabase, cached via Redis (5-min TTL). |
| **Shop** | `/shop` | Server | All active products in 4-col grid (2-col mobile). Product cards: image (aspect-4/5), name, price. Cached via Redis. |
| **Category** | `/shop/[category-slug]` | Server | Same as shop but filtered by `category_id`. Category header, "Back to Shop" link. `notFound()` if invalid slug. |
| **Collections** | `/collections` | Server | All active + upcoming collections. Card grid with cover image, description (2-line clamp), status badge. "Notify Me" form for upcoming (client component). |
| **Collection Detail** | `/collections/[slug]` | Server | Hero section (cover image or black fallback), collection story, products in that collection. "Collection arriving soon" if no products yet. |
| **Product Detail** | `/products/[slug]` | Server + Client | Image gallery (primary + thumbnails), name, price, collection tag, description. Client `ProductPurchasePanel`: size selector, add-to-cart, out-of-stock, WhatsApp enquiry. Fabric/care accordions. |
| **Cart** | `/cart` | Client | Items list with image, name, size, qty controls (+/-), remove. Order summary sidebar with subtotal. "Proceed to Checkout" CTA. Empty state → link to `/shop`. |
| **Checkout** | `/checkout` | Client | Contact (email, WhatsApp), Delivery (name, address, city, state/country), Shipping options (radio, auto-fetched), Paystack payment button (dynamic import, SSR-safe). Order summary sidebar. |
| **Order Success** | `/checkout/success` | Client | "Order Confirmed" + large order number. Links to track order and continue shopping. Clears cart on mount. |
| **Order Tracking** | `/track` | Client | Order number input → `GET /api/orders/[orderNumber]`. Shows status badge, items, address, vertical tracking timeline from `delivery_tracking`. |

### Admin Pages

| Page | URL | Auth | Key Functionality |
|---|---|---|---|
| **Login** | `/admin/login` | None | Password form → `POST /api/admin/auth`. Sets `iby_admin_session` cookie. Redirects to `/admin/orders`. |
| **Dashboard** | `/admin` → `/admin/orders` | Cookie | Redirects to orders. |
| **Orders** | `/admin/orders` | Cookie | Orders table with source + status filters. Links to detail/new. |
| **Order Detail** | `/admin/orders/[id]` | Cookie | Full order view, update status dropdown, add tracking notes. Timeline of `delivery_tracking` events. |
| **New Order** | `/admin/orders/new` | Cookie | Manual entry: source, customer info, product search (debounced), variant picker, payment method. For Instagram/WhatsApp/Walk-in orders. |
| **Products** | `/admin/products` | Cookie | Product list with status. Edit/Delete actions. |
| **Edit Product** | `/admin/products/[id]` | Cookie | Form: name, slug, price, description, fabric, care, category, collection, images, status. |
| **New Product** | `/admin/products/new` | Cookie | Same form, creates new product. |
| **Collections** | `/admin/collections` | Cookie | Collection list with status/release date. |
| **Edit Collection** | `/admin/collections/[id]` | Cookie | Form: name, slug, description, cover image, status, release date, featured. |
| **New Collection** | `/admin/collections/new` | Cookie | Same form, creates new collection. |
| **Contacts** | `/admin/contacts` | Cookie | Contact table with source filter. CSV export. WhatsApp broadcast via Fonnte API. |
| **Quick Sale** | `/admin/quick-sale` | Cookie | Mobile-friendly POS. Product search → variant select → add to sale. Cash/POS payment. Instant order creation. |

---

## 5. API Routes

```mermaid
graph LR
    subgraph "Public API"
        A["POST /api/orders<br/>Create order"]
        B["GET /api/orders/[orderNumber]<br/>Public order lookup"]
        C["POST /api/delivery/calculate<br/>Shipping fee calc"]
        D["POST /api/contacts<br/>Newsletter/contact capture"]
        E["POST /api/waitlist<br/>Collection waitlist signup"]
        F["POST /api/paystack/webhook<br/>Payment confirmation"]
    end

    subgraph "Admin API"
        G["POST /api/admin/auth<br/>Password login"]
        H["POST /api/admin/logout<br/>Clear session cookie"]
    end

    style A fill:#059669,color:#fff
    style F fill:#00c3f7,color:#000
    style G fill:#dc2626,color:#fff
```

| Route | Method | Auth | Input | Output | Notes |
|---|---|---|---|---|---|
| `/api/orders` | POST | None | `{customer_name, email, phone, whatsapp, delivery_address, items[], delivery_fee, payment_method, payment_reference}` | `{order_number, order_id}` | Generates IBY-YYYYXXXX, inserts order + items, upserts contact |
| `/api/orders/[orderNumber]` | GET | None | URL param | `{order, items[], tracking[]}` | Public tracking — omits email/phone |
| `/api/delivery/calculate` | POST | None | `{state, city, subtotal, country?}` | `{options: [{courier, service, fee, estimated_days}]}` | Lagos/non-Lagos/international pricing |
| `/api/contacts` | POST | None | `{email?, whatsapp_number?, first_name?, last_name?, source}` | `{success, id}` | Upserts by email or whatsapp |
| `/api/waitlist` | POST | None | `{email?, whatsapp_number?, collection_id?, product_id?}` | `{success}` | No upsert — allows duplicates |
| `/api/paystack/webhook` | POST | HMAC | Paystack event payload | `{received: true}` | Verifies signature, updates order to paid/confirmed, sends email |
| `/api/admin/auth` | POST | None | `{password}` | Sets cookie | Cookie: `iby_admin_session`, httpOnly, 7-day expiry |
| `/api/admin/logout` | POST | Cookie | — | Clears cookie | `maxAge: 0`, `path: /admin` |

---

## 6. Database Schema (ER Diagram)

```mermaid
erDiagram
    CONTACTS {
        uuid id PK
        text email UK
        text whatsapp_number UK
        text first_name
        text last_name
        text source
        boolean subscribed
        timestamptz created_at
    }

    CATEGORIES {
        uuid id PK
        text name
        text slug UK
        uuid parent_id FK
        text image_url
        int sort_order
    }

    COLLECTIONS {
        uuid id PK
        text name
        text slug UK
        text description
        text cover_image
        jsonb lookbook_images
        date release_date
        text status
        boolean is_featured
        timestamptz created_at
    }

    PRODUCTS {
        uuid id PK
        text name
        text slug UK
        text description
        numeric price
        numeric compare_at_price
        uuid category_id FK
        uuid collection_id FK
        text fabric_details
        text care_instructions
        text fit_notes
        boolean is_featured
        text status
        timestamptz created_at
    }

    PRODUCT_IMAGES {
        uuid id PK
        uuid product_id FK
        text image_url
        text alt_text
        int sort_order
        boolean is_primary
    }

    PRODUCT_VARIANTS {
        uuid id PK
        uuid product_id FK
        text size
        text color
        int stock_quantity
        text sku UK
    }

    ORDERS {
        uuid id PK
        text order_number UK
        uuid customer_id FK
        text customer_name
        text customer_phone
        text customer_whatsapp
        text customer_email
        jsonb delivery_address
        text status
        text source
        text payment_method
        numeric subtotal
        numeric delivery_fee
        numeric total
        text payment_status
        text payment_reference
        text notes
        timestamptz created_at
    }

    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        uuid variant_id FK
        text product_name
        text size
        text color
        int quantity
        numeric unit_price
    }

    DELIVERY_TRACKING {
        uuid id PK
        uuid order_id FK
        text status
        text note
        timestamptz updated_at
        text updated_by
    }

    WAITLIST {
        uuid id PK
        text email
        text whatsapp_number
        uuid collection_id FK
        uuid product_id FK
        timestamptz created_at
    }

    ABANDONED_CARTS {
        uuid id PK
        text email
        text whatsapp_number
        jsonb cart_data
        boolean recovered
        timestamptz created_at
    }

    CUSTOMERS {
        uuid id PK
        text email UK
        text phone
        text whatsapp_number
        text first_name
        text last_name
        timestamptz created_at
    }

    ADDRESSES {
        uuid id PK
        uuid customer_id FK
        text street
        text city
        text state
        text lga
        boolean is_default
    }

    CATEGORIES ||--o{ PRODUCTS : "has"
    COLLECTIONS ||--o{ PRODUCTS : "contains"
    PRODUCTS ||--o{ PRODUCT_IMAGES : "has"
    PRODUCTS ||--o{ PRODUCT_VARIANTS : "has sizes/colors"
    ORDERS ||--o{ ORDER_ITEMS : "contains"
    ORDERS ||--o{ DELIVERY_TRACKING : "tracked by"
    PRODUCTS ||--o{ ORDER_ITEMS : "ordered as"
    PRODUCT_VARIANTS ||--o{ ORDER_ITEMS : "selected variant"
    CUSTOMERS ||--o{ ORDERS : "places"
    CUSTOMERS ||--o{ ADDRESSES : "has"
    COLLECTIONS ||--o{ WAITLIST : "waitlisted for"
    PRODUCTS ||--o{ WAITLIST : "waitlisted for"
    CATEGORIES ||--o{ CATEGORIES : "parent_id"
```

---

## 7. Data Flow

### Caching Layer

```mermaid
flowchart LR
    A["Server Component<br/>(Shop, Homepage)"] -->|"cachedFetch('shop:products', fetcher, 300)"| B{"Redis Cache"}
    B -->|"HIT (< 5 min)"| C["Return cached data"]
    B -->|"MISS"| D["Query Supabase"]
    D --> E["Store in Redis<br/>TTL: 300s"]
    E --> C

    style B fill:#dc2626,color:#fff
    style D fill:#3ecf8e,color:#000
```

### State Management

```mermaid
flowchart TD
    A["Cart Store (Zustand)"] -->|"persisted in"| B["localStorage"]
    A -->|"items, subtotal, totalItems"| C["Cart Page"]
    A -->|"items, subtotal"| D["Checkout Page"]
    A -->|"totalItems"| E["Header Badge"]
    A -->|"clearCart()"| F["Success Page"]
    A -->|"addItem event"| G["PostHog: add_to_cart"]

    style A fill:#f59e0b,color:#000
```

---

## 8. Sales Channels

All orders converge to same `orders` table with unified `IBY-YYYYXXXX` format:

```mermaid
flowchart TD
    WEB["🌐 Website Checkout<br/>source: website<br/>payment: paystack_online"]
    IG["📸 Instagram DMs<br/>source: instagram<br/>payment: bank_transfer"]
    WA["💬 WhatsApp<br/>source: whatsapp<br/>payment: bank_transfer"]
    WALK["🏪 Walk-in<br/>source: walk_in<br/>payment: cash / pos_terminal"]

    WEB -->|"Paystack + auto"| ORDERS["orders table<br/>IBY-YYYYXXXX"]
    IG -->|"Ibrahim via /admin/orders/new"| ORDERS
    WA -->|"Ibrahim via /admin/orders/new"| ORDERS
    WALK -->|"Ibrahim via /admin/quick-sale"| ORDERS

    ORDERS --> TRACK["Public Tracking<br/>/track?order=IBY-YYYYXXXX"]
    ORDERS --> EMAIL["Email Confirmation<br/>(Resend)"]
    ORDERS --> CONTACTS["Contact Capture<br/>(email + WhatsApp DB)"]

    style ORDERS fill:#059669,color:#fff
    style WEB fill:#00c3f7,color:#000
    style WALK fill:#7c3aed,color:#fff
```

---

## 9. Third-Party Integrations

| Service | Purpose | Env Vars | Integration Point |
|---|---|---|---|
| **Supabase** | PostgreSQL database, storage | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | `src/lib/supabase.ts` — two clients (browser + server) |
| **Paystack** | Payment processing | `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY` | Inline popup via `react-paystack`, webhook at `/api/paystack/webhook` |
| **Resend** | Transactional email | `RESEND_API_KEY` | `src/lib/email.ts` — order confirmation HTML emails |
| **Fonnte** | WhatsApp broadcasts | `NEXT_PUBLIC_FONNTE_TOKEN` | Admin contacts page — bulk messaging via Fonnte REST API |
| **Cloudinary** | Image hosting/CDN | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Product/collection images served via Cloudinary URLs |
| **PostHog** | Analytics & events | `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | `PostHogProvider` + `PostHogPageView` in site layout. Tracks `$pageview` + `add_to_cart`. |
| **Upstash Redis** | Server-side caching | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | `src/lib/redis.ts` + `src/lib/cache.ts` — `cachedFetch()` with TTL |
| **Vercel** | Hosting & deployment | — | Next.js App Router, edge middleware, serverless API routes |

---

## 10. File Structure Map

```
iby_closet/
├── CLAUDE.md                          # Project brief (Claude owns)
├── GEMINI.md                          # Gemini agent workspace
├── CODEX.md                           # Codex agent workspace
├── ARCHITECTURE.md                    # This file
├── task.md                            # Shared task board
├── .env.local                         # Environment variables (gitignored)
├── .env.example                       # Template for env vars
├── next.config.mjs                    # Next.js config (image domains, etc.)
├── tailwind.config.ts                 # Tailwind configuration
├── tsconfig.json                      # TypeScript config
├── vitest.config.ts                   # Test runner config (Batch 4)
│
├── public/images/instagram/           # Product images (seeded from Instagram)
│
├── scripts/
│   ├── seed_collection_and_variants.js   # Seeds Rhythm & Thread collection
│   ├── fix_product_data.js               # Product data repair script
│   └── cleanup_products.js               # Product cleanup script
│
├── supabase/migrations/
│   └── 20240221000000_initial_schema.sql # Full DB schema
│
├── __tests__/                         # Test files (Batch 4)
│   ├── setup.ts                       # Supabase mock setup
│   ├── api/                           # API route tests
│   └── components/                    # Component + store tests
│
└── src/
    ├── middleware.ts                   # Admin auth guard (cookie check)
    │
    ├── lib/
    │   ├── supabase.ts                # Supabase clients (browser + server)
    │   ├── types.ts                   # TypeScript DB interfaces
    │   ├── cart-store.ts              # Zustand cart with localStorage persist
    │   ├── redis.ts                   # Upstash Redis singleton
    │   ├── cache.ts                   # cachedFetch() helper
    │   └── email.ts                   # Resend order confirmation
    │
    ├── components/
    │   ├── Header.tsx                 # Sticky nav + cart badge (client)
    │   ├── Footer.tsx                 # Links + newsletter form (client)
    │   ├── PostHogProvider.tsx         # PostHog init wrapper (client)
    │   └── PostHogPageView.tsx         # Route-based pageview tracking (client)
    │
    └── app/
        ├── layout.tsx                 # Root layout (fonts, globals.css)
        ├── globals.css                # Tailwind + custom styles
        │
        ├── (site)/                    # ← Route group (no URL effect)
        │   ├── layout.tsx             # Header + Footer + PostHog
        │   ├── page.tsx               # Homepage (server, cached)
        │   ├── shop/
        │   │   ├── page.tsx           # Shop All (server, cached)
        │   │   └── [category-slug]/page.tsx  # Category filter (server)
        │   ├── collections/
        │   │   ├── page.tsx           # Collections index (server)
        │   │   ├── [slug]/page.tsx    # Collection detail (server)
        │   │   └── _components/NotifyMeButton.tsx  # Waitlist form (client)
        │   ├── products/
        │   │   └── [slug]/
        │   │       ├── page.tsx       # Product detail (server)
        │   │       └── ProductPurchasePanel.tsx  # Size/cart/WhatsApp (client)
        │   ├── cart/page.tsx          # Shopping cart (client)
        │   ├── checkout/
        │   │   ├── page.tsx           # Checkout form + payment (client)
        │   │   ├── PaystackButton.tsx # Paystack popup trigger (client)
        │   │   └── success/page.tsx   # Order confirmed (client)
        │   └── track/page.tsx         # Public order tracking (client)
        │
        ├── admin/                     # ← Separate layout, cookie-guarded
        │   ├── layout.tsx             # Admin shell + sidebar
        │   ├── page.tsx               # Redirect → /admin/orders
        │   ├── login/page.tsx         # Password login form
        │   ├── _components/
        │   │   ├── AdminSidebar.tsx   # Nav (desktop sidebar + mobile bottom)
        │   │   └── CollectionForm.tsx # Reusable collection form
        │   ├── orders/
        │   │   ├── page.tsx           # Orders dashboard
        │   │   ├── [id]/page.tsx      # Order detail + status update
        │   │   └── new/page.tsx       # Manual order entry
        │   ├── products/
        │   │   ├── page.tsx           # Products list
        │   │   ├── [id]/page.tsx      # Edit product
        │   │   ├── new/page.tsx       # New product
        │   │   └── _components/ProductForm.tsx  # Reusable product form
        │   ├── collections/
        │   │   ├── page.tsx           # Collections list
        │   │   ├── [id]/page.tsx      # Edit collection
        │   │   └── new/page.tsx       # New collection
        │   ├── contacts/page.tsx      # Contacts + WhatsApp broadcast
        │   └── quick-sale/page.tsx    # Walk-in POS
        │
        └── api/
            ├── admin/
            │   ├── auth/route.ts      # POST — password login
            │   └── logout/route.ts    # POST — clear session
            ├── contacts/route.ts      # POST — upsert contact
            ├── delivery/
            │   └── calculate/route.ts # POST — shipping fee calc
            ├── orders/
            │   ├── route.ts           # POST — create order
            │   └── [orderNumber]/route.ts  # GET — public lookup
            ├── paystack/
            │   └── webhook/route.ts   # POST — payment webhook
            └── waitlist/route.ts      # POST — waitlist signup
```

---

## Design Principles

1. **Editorial-first** — Not a generic product catalogue. Every collection has a story, campaign shoots, lookbook energy. Inspired by garmisland.com but more brand-world-driven.
2. **Nigeria-optimized** — Default to Nigerian states, Naira pricing, Lagos delivery tiers. International is additive, not primary.
3. **Mobile-first** — All pages designed for 375px+ first. Admin panel optimized for Ibrahim's phone usage at the physical store.
4. **Progressive data** — Server components for SEO-critical pages (shop, collections, products). Client components only for interactivity (cart, checkout, admin).
5. **Resilient** — Redis cache fails silently to Supabase. Paystack webhook validates HMAC. Email errors don't break orders. Mock Redis for missing env vars.
6. **Unified orders** — All 4 sales channels (website, Instagram, WhatsApp, walk-in) produce identical `IBY-YYYYXXXX` orders. Same tracking, same admin view.
