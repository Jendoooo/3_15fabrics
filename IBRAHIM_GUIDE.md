# iby_closet — Ibrahim's Website Guide

Everything you need to know to run your store from your phone or laptop.

---

## 1. Logging In (Admin Panel)

Go to your site and add `/admin` to the end of the URL:

```
https://your-site.vercel.app/admin
```

Enter your **admin password** (the one set up in the environment variables as `ADMIN_PASSWORD`).

You'll see the dashboard — total revenue, total orders, active products, today's orders.

---

## 2. Adding a New Product

This is your most common task. Every piece you design goes in here.

### Step-by-step:

1. Go to **Admin → Products**
2. Click **"New Product"** (top right)
3. Fill in the form:

| Field | What to put |
|---|---|
| **Name** | The product name exactly as you want customers to see it e.g. `Lagos Linen Blazer` |
| **Slug** | Auto-fills from the name — don't touch it |
| **Price** | In Naira, numbers only e.g. `45000` |
| **Compare at Price** | Optional — the "original" price if it's on sale e.g. `55000` |
| **Status** | `draft` = not visible to customers, `active` = live on site, `sold_out` = shows but can't be purchased |
| **Is Featured** | Tick this to show the product on the homepage |
| **Collection** | Which collection this belongs to (e.g. Rhythm & Thread) |
| **Description** | Tell the story — fabric, inspiration, how it fits. The more the better. |
| **Fabric Details** | e.g. `100% premium linen, imported` |
| **Care Instructions** | e.g. `Hand wash cold. Do not tumble dry.` |
| **Fit Notes** | e.g. `Relaxed fit. Model is 6'1" wearing size L.` |

4. **Add Sizes (Variants)** — scroll to the Variants section, click "Add Variant" for each size:
   - Size: `S`, `M`, `L`, `XL`, `XS`, etc.
   - Stock: how many you have e.g. `3`
   - Leave color blank unless it comes in different colours

5. **Upload Photos** — click the upload box in the Images section, pick the photo from your phone/laptop. Wait for it to upload (you'll see a preview). Add all angles — front, back, detail shot. The **first image** is the main one shown in the shop.

6. Click **"Save Product"**

The product is now live on the website (if you set status to `active`).

---

## 3. Editing a Product

1. Go to **Admin → Products**
2. Find the product, click the **Edit** button next to it
3. Change whatever you need — price, stock, description, add more photos
4. Click **"Save"**

**Common updates:**
- **Item sold out:** Change the status to `sold_out` so customers see it but can't buy it
- **Restocked:** Update the stock quantity on each variant
- **Price change:** Update the Price field

---

## 4. Adding a New Collection

A collection is a themed drop — like "Rhythm & Thread" or "Back in the 90s". Products belong to a collection.

1. Go to **Admin → Collections**
2. Click **"New Collection"**

| Field | What to put |
|---|---|
| **Name** | e.g. `Summer in Lagos` |
| **Slug** | Auto-fills — don't touch |
| **Description** | The story/mood of the collection |
| **Status** | `upcoming` = shows with "Notify Me" button, `active` = fully live, `draft` = hidden |
| **Cover Image** | Paste the URL of a campaign photo (upload it to Cloudinary first, or use the image uploader if available) |
| **Release Date** | When you're launching — shows on the collection page |
| **Is Featured** | Tick to show on homepage |

3. Click **"Save Collection"**

After creating the collection, go to each product and set its **Collection** field to this new collection.

---

## 5. Logging a Sale from Instagram or WhatsApp

When a customer DMs you and pays, log it here so it's in the system.

1. Go to **Admin → Orders → New Manual Order**
2. Fill in:
   - **Source:** `instagram` or `whatsapp`
   - Customer name, phone, WhatsApp number, email (whatever they gave you)
   - Delivery address
   - Payment method: usually `bank_transfer`
   - **Add Items:** type the product name, select it from the results, pick the size
3. Click **"Submit Order"**

You'll get an order number like `IBY-2026-K3M7PQ`. You can share this with the customer to track their order.

---

## 6. Walk-In / Physical Store Sales

For customers who come in person:

1. Go to **Admin → Quick Sale**
2. Search for the product → pick the size → it adds to the sale
3. Select payment: **Cash** or **POS Terminal**
4. Optionally add customer name
5. Click **"Complete Sale"**

Order number generated instantly. That's it.

---

## 7. Updating an Order Status

When you ship something, mark it in the system — the customer gets a WhatsApp + email notification automatically.

1. Go to **Admin → Orders**
2. Find the order, click it
3. Change the **Status** dropdown:
   - `confirmed` → payment received, getting ready
   - `processing` → you're preparing/packaging
   - `shipped` → it's with the courier
   - `delivered` → customer received it
4. Add a note if you want (e.g. "Dispatched via GIG Logistics, tracking: GIG123456")
5. Click **"Save"**

The customer gets notified on WhatsApp and email the moment you save.

---

## 8. Viewing All Orders

Go to **Admin → Orders**

- Filter by status, source (website / instagram / whatsapp / walk-in), or search by name/order number
- Click any order to see full details

---

## 9. Contacts & Customer List

Go to **Admin → Contacts**

Everyone who signed up to the newsletter, bought something, or joined a waitlist is here.

**To send a WhatsApp message to all contacts:**
1. Scroll to the "WhatsApp Broadcast" section at the top
2. Type your message (e.g. "New drop tomorrow 👀 — shop link in bio")
3. Tick which contacts to send to (filter by those with WhatsApp numbers)
4. Click **Send**

**To export contacts as CSV** (for email campaigns):
- Click the **"Export CSV"** button — downloads a spreadsheet of all contacts

---

## 10. Checking Your Stats

Go to **Admin → Dashboard** (the home screen when you log in)

Shows:
- Total revenue
- Total orders
- Active products
- Orders today

---

## 11. What Customers See

| Page | URL | What it does |
|---|---|---|
| Homepage | `/` | Hero photo, featured products, lookbook, brand story |
| Shop | `/shop` | All active products with search + filter |
| Collections | `/collections` | All collections |
| Product page | `/products/[name]` | Photos, sizes, add to cart |
| Cart | `/cart` | Cart summary |
| Checkout | `/checkout` | Customer fills address, pays via Paystack |
| Track order | `/track` | Customer enters order number to see status |
| Lookbook | `/lookbook` | All campaign/editorial photos |
| Brand | `/brand` | Your story |

---

## 12. Things to Do When You Launch a New Drop

Checklist for every new collection:

- [ ] Create the collection in Admin → Collections (set status to `upcoming` first)
- [ ] Add all products to the collection with correct sizes and stock
- [ ] Upload clean product photos for each piece (front + back minimum)
- [ ] Set featured products (`Is Featured = true`) so they show on homepage
- [ ] When ready to go live: change collection status to `active`
- [ ] Broadcast to WhatsApp contacts: "New drop is live 🔥 — [link]"
- [ ] Post on Instagram with the product page links in bio

---

## Quick Reference

| Task | Where to go |
|---|---|
| Add product | Admin → Products → New Product |
| Edit product / update stock | Admin → Products → Edit |
| Log Instagram/WhatsApp sale | Admin → Orders → New Manual Order |
| Walk-in sale | Admin → Quick Sale |
| Update order status + notify customer | Admin → Orders → [order] → Save |
| Broadcast WhatsApp message | Admin → Contacts |
| View revenue + stats | Admin → Dashboard |
| Add new collection | Admin → Collections → New Collection |

---

*Built by Mobo Digital for iby_closet.*
