const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const env = {};
for (const line of fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('--- Starting Seeding (Task G14) ---');

    // 1. Insert Collection
    console.log('Inserting collection...');
    const { data: collection, error: collError } = await supabase
        .from('collections')
        .insert({
            name: 'Rhythm & Thread',
            slug: 'rhythm-and-thread',
            description: 'A collection that blends rhythm and structure — from tank tops to tailored jackets. Every piece tells a story of movement and craft.',
            status: 'active',
            is_featured: true,
        })
        .select('id')
        .single();

    if (collError) {
        if (collError.code === '23505') {
            console.log('Collection already exists (unique constraint). Finding existing ID...');
        } else {
            console.error('Error creating collection:', collError);
            return;
        }
    }

    const { data: existingCollection } = await supabase
        .from('collections')
        .select('id')
        .eq('slug', 'rhythm-and-thread')
        .single();

    const collectionId = collection ? collection.id : existingCollection?.id;

    if (!collectionId) {
        console.error('Could not obtain collection ID.');
        return;
    }

    console.log('Collection ID acquired:', collectionId);

    // 2. Link all active products to this collection
    console.log('Linking active products to collection...');
    const { error: updateError } = await supabase
        .from('products')
        .update({ collection_id: collectionId })
        .eq('status', 'active');

    if (updateError) {
        console.error('Error linking products:', updateError);
    } else {
        console.log('Successfully linked active products.');
    }

    // 3. Seed product variants
    console.log('Fetching active products to seed variants...');
    const { data: products, error: prodError } = await supabase
        .from('products')
        .select('id, name')
        .eq('status', 'active');

    if (prodError || !products) {
        console.error('Error fetching products:', prodError);
        return;
    }

    console.log(`Found ${products.length} active products.`);

    for (const product of products) {
        // Check if variants exist
        const { count, error: countError } = await supabase
            .from('product_variants')
            .select('id', { count: 'exact', head: true })
            .eq('product_id', product.id);

        if (countError) {
            console.error(`Error checking variants for ${product.name}:`, countError);
            continue;
        }

        if (count && count > 0) {
            console.log(`Skipping ${product.name} — already has ${count} variants.`);
            continue;
        }

        const nameLower = product.name.toLowerCase();
        let variantsToInsert = [];

        if (nameLower.includes('loafer') || nameLower.includes('shoe')) {
            variantsToInsert = ['40', '41', '42', '43', '44', '45'].map(size => ({
                product_id: product.id,
                size,
                stock_quantity: 5,
            }));
        } else if (nameLower.includes('cap') || nameLower.includes('hat')) {
            variantsToInsert = [{
                product_id: product.id,
                size: 'One Size',
                stock_quantity: 20,
            }];
        } else {
            variantsToInsert = ['XS', 'S', 'M', 'L', 'XL'].map(size => ({
                product_id: product.id,
                size,
                stock_quantity: 10,
            }));
        }

        console.log(`Inserting ${variantsToInsert.length} variants for ${product.name}...`);
        const { error: varInsertError } = await supabase
            .from('product_variants')
            .insert(variantsToInsert);

        if (varInsertError) {
            console.error(`Error inserting variants for ${product.name}:`, varInsertError);
        }
    }

    console.log('--- Seeding Complete ---');
}

seed().catch(console.error);
