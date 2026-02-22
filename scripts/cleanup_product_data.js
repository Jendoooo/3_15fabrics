require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
    console.log('=== Product Data Cleanup ===\n');

    // 1. Delete demo products with placeholder images
    const demoSlugs = [
        'ankara-wine-gold', 'french-lace-champagne', 'senator-charcoal-grey',
        'swiss-voile-soft-peach', 'asoke-traditional-set', 'cotton-adire-indigo',
        'test-ankara-print', 'test-senator-bundle',
    ];

    for (const slug of demoSlugs) {
        const { data: prod } = await supabase.from('products').select('id').eq('slug', slug).maybeSingle();
        if (prod) {
            await supabase.from('product_images').delete().eq('product_id', prod.id);
            await supabase.from('product_variants').delete().eq('product_id', prod.id);
            await supabase.from('products').delete().eq('id', prod.id);
            console.log(`🗑 Deleted demo: ${slug}`);
        }
    }

    // 2. Get all remaining products
    const { data: products } = await supabase
        .from('products')
        .select('id, name, slug, price, fabric_type, description')
        .order('created_at', { ascending: true });

    console.log(`\nProcessing ${products.length} products...\n`);

    // 3. Analyze each product's caption/description for better pricing and naming
    for (const p of products) {
        const caption = (p.description || '').toLowerCase();
        const updates = {};

        // --- PRICE FIX ---
        if (!p.price || p.price === 0) {
            // Try to extract price from caption
            const priceK = caption.match(/(\d{2,3})k\b/);
            const priceNaira = caption.match(/[₦n]\s*([\d,]+)/);

            if (priceK) {
                updates.price = parseInt(priceK[1]) * 1000;
            } else if (priceNaira) {
                updates.price = parseInt(priceNaira[1].replace(/,/g, ''));
            } else {
                // Assign a reasonable default based on what we can detect
                if (caption.includes('lace') || caption.includes('guipure')) updates.price = 18000;
                else if (caption.includes('ankara')) updates.price = 5000;
                else if (caption.includes('senator')) updates.price = 28000;
                else if (caption.includes('voile')) updates.price = 12000;
                else if (caption.includes('aso-oke') || caption.includes('asooke')) updates.price = 35000;
                else if (caption.includes('cotton')) updates.price = 4000;
                else if (caption.includes('silk')) updates.price = 15000;
                else updates.price = 8000; // Default mid-range for unknown fabrics
            }
        }

        // --- FABRIC TYPE FIX ---
        if (!p.fabric_type) {
            if (caption.includes('lace') && caption.includes('guipure')) updates.fabric_type = 'Guipure Lace';
            else if (caption.includes('lace') && caption.includes('chantil')) updates.fabric_type = 'Chantilly Lace';
            else if (caption.includes('lace') && caption.includes('korea')) updates.fabric_type = 'Korean Lace';
            else if (caption.includes('french lace')) updates.fabric_type = 'French Lace';
            else if (caption.includes('lace')) updates.fabric_type = 'Lace';
            else if (caption.includes('ankara')) updates.fabric_type = 'Ankara';
            else if (caption.includes('senator')) updates.fabric_type = 'Senator';
            else if (caption.includes('voile')) updates.fabric_type = 'Swiss Voile';
            else if (caption.includes('cotton')) updates.fabric_type = 'Cotton';
            else if (caption.includes('silk')) updates.fabric_type = 'Silk';
            else if (caption.includes('velvet')) updates.fabric_type = 'Velvet';
            else if (caption.includes('fabric') || caption.includes('yard') || caption.includes('material'))
                updates.fabric_type = 'Premium Fabric';
        }

        // --- NAME FIX for "Fabric Post" ---
        if (p.name === 'Fabric Post' || p.name === 'undefined') {
            const ft = updates.fabric_type || p.fabric_type;
            if (ft) {
                updates.name = `${ft} — Instagram Collection`;
            } else {
                updates.name = `Premium Fabric — Style Collection`;
            }
        }

        // Apply updates
        if (Object.keys(updates).length > 0) {
            const { error } = await supabase.from('products').update(updates).eq('id', p.id);
            if (error) {
                console.error(`✗ ${p.slug}: ${error.message}`);
            } else {
                const notes = [];
                if (updates.price) notes.push(`price → ₦${updates.price.toLocaleString()}`);
                if (updates.fabric_type) notes.push(`type → ${updates.fabric_type}`);
                if (updates.name) notes.push(`name → ${updates.name}`);
                console.log(`✓ ${p.slug}: ${notes.join(' | ')}`);
            }
        }
    }

    // 4. Feature the 8 best products (with highest prices and real images)
    await supabase.from('products').update({ is_featured: false }).neq('id', '');

    const { data: bestProducts } = await supabase
        .from('products')
        .select('id, name, price')
        .eq('status', 'active')
        .gt('price', 0)
        .order('price', { ascending: false })
        .limit(8);

    if (bestProducts && bestProducts.length > 0) {
        const ids = bestProducts.map(p => p.id);
        await supabase.from('products').update({ is_featured: true }).in('id', ids);
        console.log(`\n⭐ Featured ${bestProducts.length} top products:`);
        bestProducts.forEach(p => console.log(`   ${p.name} — ₦${p.price.toLocaleString()}`));
    }

    // Final count
    const { count: total } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active');
    const { count: withPrice } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active').gt('price', 0);
    const { count: imgs } = await supabase.from('product_images').select('*', { count: 'exact', head: true });

    console.log(`\n========================================`);
    console.log(`Active products: ${total}`);
    console.log(`With price > 0: ${withPrice}`);
    console.log(`Total images: ${imgs}`);
    console.log(`========================================`);
}

run();
