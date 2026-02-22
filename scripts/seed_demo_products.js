require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Real Instagram image URLs from @3_15fabrics Excel export
const demoProducts = [
    {
        product: {
            name: 'Premium Ankara Print — Wine & Gold',
            slug: 'ankara-wine-gold',
            description: 'Rich wine and gold Ankara print. Perfect for aso-ebi, gowns, and statement pieces. Premium quality, vibrant colours that last.',
            price: 5500,
            status: 'active',
            unit_type: 'yard',
            minimum_quantity: 5,
            fabric_type: 'Ankara',
            gender: 'unisex',
            is_featured: true,
        },
        variants: [
            { color: 'Wine & Gold', size: null, stock_quantity: 25 },
            { color: 'Navy & Gold', size: null, stock_quantity: 18 },
        ],
        images: [
            'https://instagram.fiba2-1.fna.fbcdn.net/v/t51.75761-15/481819342_18284585038247648_1955051393612819242_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=103&ig_cache_key=MzU3NjYwODcxODQzOTI0MjQ0Mg%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjEyODR4MjI4My5zZHIuQzMifQ%3D%3D&_nc_ohc=cqk89fmEQYwQ7kNvwH5Y5Lp&_nc_oc=AdnCZSfWZm9dbxRCPw603HIxMcz4wN97H2neNdRQfydF3k9YjqFYWTTfEkybU5KTl08&_nc_ad=z-m&_nc_cid=1080&_nc_zt=23&_nc_ht=instagram.fiba2-1.fna&_nc_gid=_eA4Bps1aaGT6FxicHQrig&oh=00_Afva2i9yL_mw-1As6z3Dx4cbpx6dLqPog2QUK2m87BRFZw&oe=69A09AF3',
        ],
    },
    {
        product: {
            name: 'Luxury French Lace — Champagne',
            slug: 'french-lace-champagne',
            description: 'Exquisite French lace in champagne gold. Ideal for weddings, naming ceremonies, and special occasions. Delicate embroidery with premium finish.',
            price: 18000,
            status: 'active',
            unit_type: 'yard',
            minimum_quantity: 5,
            fabric_type: 'French Lace',
            gender: 'women',
            is_featured: true,
        },
        variants: [
            { color: 'Champagne', size: null, stock_quantity: 12 },
            { color: 'Ivory White', size: null, stock_quantity: 8 },
        ],
        images: [
            'https://instagram.fiba2-2.fna.fbcdn.net/v/t51.82787-15/635961448_18327942703247648_4012010659534329821_n.jpg?stp=dst-jpegr_e35_tt6&_nc_cat=101&ig_cache_key=MzgzMzAzMTQzNDU2MzIzMzkwNw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTkxNC5oZHIuQzMifQ%3D%3D&_nc_ohc=J6yfY-7msi8Q7kNvwFQmjCi&_nc_oc=Adng9K-cjQbFiRl-_1xH9OWltKIijXZ9Sqizk3bIQhoNPCiJW5-wVkpJ1ryx80ndsl4&_nc_ad=z-m&_nc_cid=1080&_nc_zt=23&_nc_ht=instagram.fiba2-2.fna&_nc_gid=_eA4Bps1aaGT6FxicHQrig&oh=00_AftCqnI7-w_aHzrp904-F73eVeyA-u7a3bNHjpR0mg1B2A&oe=69A075D8',
        ],
    },
    {
        product: {
            name: 'Senator Material — Charcoal Grey',
            slug: 'senator-charcoal-grey',
            description: 'Premium senator material in charcoal grey. Clean finish, perfect for corporate events and traditional wear. Sold as a complete bundle.',
            price: 35000,
            status: 'active',
            unit_type: 'bundle',
            minimum_quantity: 8,
            fabric_type: 'Senator',
            gender: 'men',
            is_featured: true,
        },
        variants: [
            { color: 'Charcoal Grey', size: null, stock_quantity: 10 },
            { color: 'Navy Classic', size: null, stock_quantity: 6 },
        ],
        images: [
            'https://placehold.co/600x800/2a2a2a/ccc?text=Senator+Charcoal',
        ],
    },
    {
        product: {
            name: 'Swiss Voile — Soft Peach',
            slug: 'swiss-voile-soft-peach',
            description: 'Lightweight Swiss voile in soft peach. Breathable and elegant — perfect for iro and buba, gowns, and asoebi sets.',
            price: 12000,
            status: 'active',
            unit_type: 'yard',
            minimum_quantity: 5,
            fabric_type: 'Swiss Voile',
            gender: 'women',
            is_featured: true,
        },
        variants: [
            { color: 'Soft Peach', size: null, stock_quantity: 20 },
            { color: 'Dusty Rose', size: null, stock_quantity: 15 },
        ],
        images: [
            'https://placehold.co/600x800/f5d5c8/333?text=Swiss+Voile+Peach',
        ],
    },
    {
        product: {
            name: 'Aso-Oke Traditional Set',
            slug: 'asoke-traditional-set',
            description: 'Hand-woven Aso-Oke in classic earth tones. Complete traditional set for weddings and special celebrations. Each piece is unique.',
            price: 45000,
            status: 'active',
            unit_type: 'bundle',
            minimum_quantity: 6,
            fabric_type: 'Aso-Oke',
            gender: 'unisex',
            is_featured: true,
        },
        variants: [
            { color: 'Earth Tone', size: null, stock_quantity: 5 },
            { color: 'Royal Blue & Gold', size: null, stock_quantity: 4 },
        ],
        images: [
            'https://placehold.co/600x800/8B6914/fff?text=Aso-Oke+Set',
        ],
    },
    {
        product: {
            name: 'Cotton Adire — Indigo Blue',
            slug: 'cotton-adire-indigo',
            description: 'Traditional Adire tie-dye cotton in deep indigo. Locally crafted, each piece with unique patterns. Great for casual and semi-formal wear.',
            price: 4000,
            status: 'active',
            unit_type: 'yard',
            minimum_quantity: 3,
            fabric_type: 'Cotton',
            gender: 'unisex',
            is_featured: true,
        },
        variants: [
            { color: 'Indigo Blue', size: null, stock_quantity: 30 },
            { color: 'Natural Brown', size: null, stock_quantity: 25 },
        ],
        images: [
            'https://placehold.co/600x800/1a237e/fff?text=Adire+Indigo',
        ],
    },
];

(async () => {
    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const item of demoProducts) {
        try {
            // Upsert product
            const { data: product, error: productError } = await supabase
                .from('products')
                .upsert(item.product, { onConflict: 'slug' })
                .select('id')
                .single();

            if (productError) {
                console.error(`✗ Error upserting ${item.product.slug}:`, productError.message);
                errors++;
                continue;
            }

            const productId = product.id;

            // Upsert variants
            for (const variant of item.variants) {
                const { error: variantError } = await supabase
                    .from('product_variants')
                    .upsert(
                        { product_id: productId, ...variant },
                        { onConflict: 'product_id,color' }
                    );
                if (variantError) {
                    console.warn(`  ⚠ Variant error for ${variant.color}:`, variantError.message);
                }
            }

            // Insert images (delete existing first to avoid duplicates)
            await supabase
                .from('product_images')
                .delete()
                .eq('product_id', productId);

            for (let i = 0; i < item.images.length; i++) {
                const { error: imageError } = await supabase
                    .from('product_images')
                    .insert({
                        product_id: productId,
                        image_url: item.images[i],
                        is_primary: i === 0,
                        sort_order: i,
                    });
                if (imageError) {
                    console.warn(`  ⚠ Image error:`, imageError.message);
                }
            }

            console.log(`✓ Created: ${item.product.name} (${item.product.slug})`);
            created++;
        } catch (err) {
            console.error(`✗ Unexpected error for ${item.product.slug}:`, err.message);
            errors++;
        }
    }

    console.log(`\nDone. Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`);
})();
