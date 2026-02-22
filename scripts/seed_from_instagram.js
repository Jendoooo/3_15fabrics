require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const cloudinary = require('cloudinary').v2;
const XLSX = require('xlsx');
const fetch = require('node-fetch'); // NOTE: using node-fetch for CommonJS compat

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function uploadToCloudinary(url, publicId) {
    const response = await fetch(url);
    const buffer = await response.buffer();
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: '315fabrics/instagram', public_id: publicId },
            (error, result) => error ? reject(error) : resolve(result.secure_url)
        ).end(buffer);
    });
}

function stripEmojis(str) {
    return str.replace(/[\u{1F000}-\u{1FFFF}|\u{2600}-\u{27BF}|\u{1F900}-\u{1F9FF}|\u{FE00}-\u{FEFF}]/gu, '').trim();
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
    return null;
}

async function run() {
    const wb = XLSX.readFile('./IGPOSTS_USERS_3_15fabrics_100.xlsx');
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    const validRows = rows.filter(r => r['Is Video'] !== 'YES');

    let created = 0, skipped = 0, errors = 0;

    for (const row of validRows) {
        const shortcode = row['Shortcode'];
        const caption = row['Caption'] || '';
        const cleanCaption = stripEmojis(caption).substring(0, 60).trim();

        const productData = {
            name: cleanCaption || 'Fabric Post',
            slug: shortcode,
            description: caption || null,
            status: 'draft',
            unit_type: 'yard',
            minimum_quantity: 1,
            is_featured: false,
            price: 0,
            fabric_type: detectFabricType(caption),
            gender: 'unisex'
        };

        try {
            const { data: existing, error: errExist } = await supabase
                .from('products')
                .select('id')
                .eq('slug', shortcode)
                .maybeSingle();

            if (errExist && errExist.code !== 'PGRST116') {
                throw new Error(`DB Error checking existence: ${errExist.message}`);
            }

            if (existing) {
                skipped++;
                console.log(`⚠ Skipped (exists): ${shortcode}`);
                continue;
            }

            const { data: newProduct, error: errInsert } = await supabase
                .from('products')
                .upsert(productData, { onConflict: 'slug' })
                .select('id')
                .single();

            if (errInsert) {
                throw new Error(`Insert failed: ${errInsert.message}`);
            }

            const productId = newProduct.id;

            let urlsToProcess = [];
            const thumbnailUrl = row['Thumbnail URL'];
            if (thumbnailUrl) urlsToProcess.push(thumbnailUrl);

            if (row['Is Carousel'] === 'YES' && row['Image URLs']) {
                const additionalUrls = row['Image URLs'].split('\n').filter(Boolean);
                urlsToProcess.push(...additionalUrls);
            }

            urlsToProcess = urlsToProcess.filter(Boolean).slice(0, 4);

            for (let i = 0; i < urlsToProcess.length; i++) {
                const publicId = `${shortcode}_${i}`;
                const cloudinaryUrl = await uploadToCloudinary(urlsToProcess[i], publicId);

                await supabase.from('product_images').insert({
                    product_id: productId,
                    image_url: cloudinaryUrl,
                    is_primary: i === 0,
                    sort_order: i
                });
            }

            created++;
            console.log(`✓ Created: ${productData.name} | slug: ${shortcode}`);

        } catch (e) {
            errors++;
            console.log(`✗ Error: ${shortcode} — ${e.message}`);
        }
    }

    console.log(`Done. Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`);
}

run();
