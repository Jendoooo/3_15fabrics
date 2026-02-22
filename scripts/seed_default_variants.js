require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedDefaultVariants() {
    console.log('Seeding default variants...');

    // 1. Get all active products
    const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('id, name')
        .eq('status', 'active');

    if (fetchError) {
        console.error('Error fetching products:', fetchError);
        return;
    }

    let newVariantsCount = 0;

    for (const product of products) {
        // 2. Check if product has any variants
        const { data: variants, error: varError } = await supabase
            .from('product_variants')
            .select('id')
            .eq('product_id', product.id);

        if (varError) {
            console.error(`Error fetching variants for ${product.id}:`, varError);
            continue;
        }

        // 3. Insert default variant if 0 variants exist
        if (!variants || variants.length === 0) {
            const { error: insertError } = await supabase
                .from('product_variants')
                .insert({
                    product_id: product.id,
                    color: 'Standard',
                    size: null,
                    stock_quantity: 50
                });

            if (insertError) {
                console.error(`Error inserting variant for ${product.name}:`, insertError);
            } else {
                newVariantsCount++;
                console.log(`Added default variant for: ${product.name}`);
            }
        }
    }

    console.log(`\nFinished! Added default variants to ${newVariantsCount} products.`);
}

seedDefaultVariants().catch(console.error);
