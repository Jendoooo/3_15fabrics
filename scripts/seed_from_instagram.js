require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function stripEmojis(str) {
    return str
        .replace(/[\u{1F000}-\u{1FFFF}|\u{2600}-\u{27BF}|\u{1F900}-\u{1F9FF}|\u{FE00}-\u{FEFF}]/gu, '')
        .trim();
}

function detectFabricType(caption) {
    if (!caption) return null;
    const c = caption.toLowerCase();
    if (c.includes('ankara')) return 'Ankara';
    if (c.includes('lace')) return 'French Lace';
    if (c.includes('voile')) return 'Swiss Voile';
    if (c.includes('aso-oke') || c.includes('asooke')) return 'Aso-Oke';
    if (c.includes('senator')) return 'Senator';
    if (c.includes('cotton')) return 'Cotton';
    if (c.includes('silk')) return 'Silk';
    if (c.includes('chiffon')) return 'Chiffon';
    return null;
}

// Generate a reasonable price based on fabric type
function suggestPrice(fabricType) {
    const prices = {
        'Ankara': 5000,
        'French Lace': 18000,
        'Swiss Voile': 12000,
        'Aso-Oke': 35000,
        'Senator': 28000,
        'Cotton': 4000,
        'Silk': 15000,
        'Chiffon': 8000,
    };
    return prices[fabricType] || 0;
}

async function run() {
    console.log('Reading Excel file...');
    const wb = XLSX.readFile('./IGPOSTS_USERS_3_15fabrics_100.xlsx');
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    const validRows = rows.filter(r => r['Is Video'] !== 'YES');

    console.log(`Found ${rows.length} total rows, ${validRows.length} non-video posts to process.\n`);

    let created = 0, skipped = 0, errors = 0;

    for (const row of validRows) {
        const shortcode = row['Shortcode'];
        const caption = row['Caption'] || '';
        const cleanCaption = stripEmojis(caption).substring(0, 60).trim();
        const fabricType = detectFabricType(caption);

        const productData = {
            name: cleanCaption || 'Fabric Post',
            slug: shortcode,
            description: caption || null,
            status: 'draft',
            unit_type: 'yard',
            minimum_quantity: 5,
            is_featured: false,
            price: suggestPrice(fabricType),
            fabric_type: fabricType,
            gender: 'unisex',
        };

        try {
            // Check if product already exists
            const { data: existing } = await supabase
                .from('products')
                .select('id')
                .eq('slug', shortcode)
                .maybeSingle();

            if (existing) {
                skipped++;
                console.log(`⚠ Skipped (exists): ${shortcode}`);
                continue;
            }

            // Insert product
            const { data: newProduct, error: errInsert } = await supabase
                .from('products')
                .upsert(productData, { onConflict: 'slug' })
                .select('id')
                .single();

            if (errInsert) {
                throw new Error(`Insert failed: ${errInsert.message}`);
            }

            const productId = newProduct.id;

            // Collect image URLs — use Instagram URLs directly (no Cloudinary needed)
            let imageUrls = [];

            // Primary: Thumbnail URL (always present for non-video)
            const thumbnailUrl = row['Thumbnail URL'];
            if (thumbnailUrl) imageUrls.push(thumbnailUrl);

            // For carousel posts, add extra Image URLs
            if (row['Is Carousel'] === 'YES' && row['Image URLs']) {
                const carouselUrls = row['Image URLs'].split('\n').filter(Boolean);
                imageUrls.push(...carouselUrls);
            }

            // Also try the single Image URL column
            if (row['Image URL'] && !imageUrls.includes(row['Image URL'])) {
                imageUrls.push(row['Image URL']);
            }

            // Cap at 4 images per product, deduplicate
            imageUrls = [...new Set(imageUrls.filter(Boolean))].slice(0, 4);

            // Insert images directly using Instagram URLs
            for (let i = 0; i < imageUrls.length; i++) {
                const { error: imgError } = await supabase
                    .from('product_images')
                    .insert({
                        product_id: productId,
                        image_url: imageUrls[i],
                        is_primary: i === 0,
                        sort_order: i,
                    });

                if (imgError) {
                    console.warn(`  ⚠ Image insert error for ${shortcode}[${i}]: ${imgError.message}`);
                }
            }

            created++;
            console.log(`✓ Created: ${productData.name} | slug: ${shortcode} | images: ${imageUrls.length} | type: ${fabricType || 'unknown'}`);

        } catch (e) {
            errors++;
            console.log(`✗ Error: ${shortcode} — ${e.message}`);
        }
    }

    console.log(`\n========================================`);
    console.log(`Done. Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`);
    console.log(`========================================`);
    console.log(`\nNext steps:`);
    console.log(`  1. Go to your admin panel and set prices for draft products`);
    console.log(`  2. Change status from 'draft' to 'active' for products you want to show`);
    console.log(`  3. Or run this SQL to activate the first 12:`);
    console.log(`     UPDATE products SET status = 'active', is_featured = true WHERE status = 'draft' ORDER BY created_at DESC LIMIT 12;`);
}

run();
