const fs = require('fs');

const newTasks = `
---

## GEMINI — Batch 7 — Full UI/UX Overhaul — Assigned 2026-02-22

> Context: 80% of remaining work. Site was forked from IBY Closet (fashion). Needs structural adaptation for a Nigerian fabric store.

### Hero and First Impressions

- [ ] **G21:** Homepage hero — add a real fabric hero image. Use generate_image tool or download a royalty-free fabric image. Save to public/images/hero-fabric.jpg. Update hero in page.tsx to use as full-width background with text overlay.

- [ ] **G22:** Brand page — add Ayodeji photo. Find personal photo from product_images. Save to public/images/founder.jpg. Update brand/page.tsx with portrait beside story text.

### Product and Shopping Experience

- [ ] **G23:** Seed default product variants for all variant-less products. Create + run scripts/seed_default_variants.js. Insert { color: 'Standard', size: null, stock_quantity: 50 } per product with 0 variants.

- [ ] **G24:** Product detail page — warm brand styling. bg-brand-cream, forest green Add to Cart, font-display headings, fix fallback image, add Share on WhatsApp button.

- [ ] **G25:** Cart page — warm brand styling + yards display. bg-brand-cream, bg-brand-forest checkout button, show X yards in line items.

- [ ] **G26:** Checkout — verify Paystack integration end-to-end. Test full flow with test card 4084 0840 8408 4081.

### Content Pages

- [ ] **G27:** Lookbook page — replace placeholder. Query top 12 product images. Display in masonry grid. Title: Our Fabric Collection.

- [ ] **G28:** Yardage guide page — add real content. Table with outfit types and yard counts (blouse 2-3, iro and buba 5-6, agbada 8-10, senator 5, asoebi 5-6, gele 2).

- [ ] **G29:** Contact page — add TikTok + Facebook cards. TikTok: https://www.tiktok.com/@315fabrics. Facebook: https://web.facebook.com/profile.php?id=100057922604897.

### Mobile and Polish

- [ ] **G30:** Mobile responsiveness audit at 375px. Fix hero text, filter pills, product detail stacking, cart layout, footer columns.

- [ ] **G31:** Loading + empty states. Update loading.tsx with brand colors. Add skeleton shimmer for product grid.

- [ ] **G32:** SEO meta tags audit. Verify all pages have proper title + description.

- [ ] **G33:** Create scripts/ensure_production_schema.js safety-net script. All ALTER TABLE statements. Do NOT run.

---

## CODEX — Batch 8 — Admin and Backend — Assigned 2026-02-22

> Context: 20% of work — admin-facing features.

- [ ] **C16:** Admin products — inline price editor. Each row gets editable price input that saves on blur via PATCH.

- [ ] **C17:** Checkout success page — warm brand styling. bg-brand-cream, font-display heading, text-brand-forest order number.

- [ ] **C18:** Admin dashboard — summary cards (total products, orders this month, revenue, pending orders).

- [ ] **C19:** Admin orders — WhatsApp notification sent badge.
`;

const content = fs.readFileSync('task.md', 'utf8');
const updated = content.trimEnd() + '\n' + newTasks.trim() + '\n';
fs.writeFileSync('task.md', updated);
console.log('Task assignments appended successfully');
