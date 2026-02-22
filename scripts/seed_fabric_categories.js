require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
    { name: 'Ankara & African Print', slug: 'ankara-african-print', sort_order: 1 },
    { name: 'French Lace & Swiss Voile', slug: 'french-lace-swiss-voile', sort_order: 2 },
    { name: 'Aso-Oke & Traditional', slug: 'asoke-traditional', sort_order: 3 },
    { name: 'Senator & Corporate', slug: 'senator-corporate', sort_order: 4 },
    { name: 'Wedding & Asoebi', slug: 'wedding-asoebi', sort_order: 5 },
    { name: 'New Arrivals', slug: 'new-arrivals', sort_order: 6 },
];

async function seedCategories() {
    console.log('Seeding fabric categories...');

    const { data, error } = await supabase
        .from('categories')
        .upsert(categories, { onConflict: 'slug' })
        .select();

    if (error) {
        console.error('Error seeding categories:', error);
    } else {
        console.log(`Successfully seeded ${data?.length} categories.`);
    }
}

seedCategories();
