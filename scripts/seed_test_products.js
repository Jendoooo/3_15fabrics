require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    const p1 = {
        name: 'Rich Ankara Print — Test',
        slug: 'test-ankara-print',
        description: 'Test product for checkout.',
        price: 5000,
        status: 'active',
        unit_type: 'yard',
        minimum_quantity: 5,
        fabric_type: 'Ankara',
        gender: 'unisex',
        is_featured: true,
    };

    const p2 = {
        name: 'Senator Bundle — Test',
        slug: 'test-senator-bundle',
        description: 'Test bundle product.',
        price: 35000,
        status: 'active',
        unit_type: 'bundle',
        minimum_quantity: 8,
        fabric_type: 'Senator',
        gender: 'men',
        is_featured: false,
    };

    console.log('Inserting Product 1...');
    const { data: prod1, error: err1 } = await supabase
        .from('products')
        .upsert(p1, { onConflict: 'slug' })
        .select()
        .single();

    if (err1) {
        console.error('Error inserting Product 1:', err1);
    } else {
        console.log('✓ Product 1 created');

        const vars1 = [
            { product_id: prod1.id, color: 'Wine Red', size: null, stock_quantity: 20 },
            { product_id: prod1.id, color: 'Navy Blue', size: null, stock_quantity: 15 },
        ];
        await supabase.from('product_variants').upsert(vars1, { onConflict: 'product_id,color,size' });

        await supabase.from('product_images').upsert(
            { product_id: prod1.id, image_url: 'https://placehold.co/600x800/222/fff?text=Ankara+Test', is_primary: true, sort_order: 0 },
            { onConflict: 'product_id,image_url' }
        );
    }

    console.log('Inserting Product 2...');
    const { data: prod2, error: err2 } = await supabase
        .from('products')
        .upsert(p2, { onConflict: 'slug' })
        .select()
        .single();

    if (err2) {
        console.error('Error inserting Product 2:', err2);
    } else {
        console.log('✓ Product 2 created');

        const vars2 = [
            { product_id: prod2.id, color: 'Charcoal Grey', size: null, stock_quantity: 10 },
            { product_id: prod2.id, color: 'Champagne', size: null, stock_quantity: 8 },
        ];
        await supabase.from('product_variants').upsert(vars2, { onConflict: 'product_id,color,size' });

        await supabase.from('product_images').upsert(
            { product_id: prod2.id, image_url: 'https://placehold.co/600x800/333/ccc?text=Senator+Bundle', is_primary: true, sort_order: 0 },
            { onConflict: 'product_id,image_url' }
        );
    }

    console.log('Done.');
    process.exit(0);
}

main().catch(console.error);
