const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const env = {};
for (const line of fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
    // Create test product at ₦1,000
    const { data: product, error: pError } = await supabase
        .from('products')
        .upsert({
            name: 'Test Checkout Tee',
            slug: 'test-checkout-tee',
            description: 'A test product for checkout testing at ₦1,000. Remove before launch.',
            price: 1000,
            status: 'active',
            is_featured: true,
            fabric_details: 'Cotton blend test fabric.',
            care_instructions: 'Machine wash cold.'
        }, { onConflict: 'slug' })
        .select('id')
        .single();

    if (pError) {
        console.error('Product error:', pError);
        return;
    }
    console.log('Product created:', product.id);

    // Add S/M/L variants with stock
    const { error: vError } = await supabase
        .from('product_variants')
        .upsert([
            { product_id: product.id, size: 'S', stock_quantity: 50, sku: 'TEST-S' },
            { product_id: product.id, size: 'M', stock_quantity: 50, sku: 'TEST-M' },
            { product_id: product.id, size: 'L', stock_quantity: 50, sku: 'TEST-L' },
        ], { onConflict: 'sku' });

    if (vError) console.error('Variant error:', vError);
    else console.log('Variants created (S, M, L)');

    console.log('\nDone! Visit /products/test-checkout-tee — price: ₦1,000');
})();
