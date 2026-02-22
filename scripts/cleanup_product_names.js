require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Intelligently generate a clean product name from a raw Instagram caption.
 * Uses keyword detection, price extraction, and pattern matching.
 */
function generateCleanName(rawCaption, fabricType, index) {
    if (!rawCaption || rawCaption === 'Fabric Post') {
        return fabricType
            ? `${fabricType} Fabric — Style ${index}`
            : `Premium Fabric — Style ${index}`;
    }

    const caption = rawCaption.replace(/[\n\r]+/g, ' ').trim();

    // Known fabric keywords to look for in the caption
    const fabricKeywords = [
        { pattern: /ankara\s*sequin/i, name: 'Ankara Sequin Fabric' },
        { pattern: /ankara/i, name: 'Premium Ankara Print' },
        { pattern: /french\s*lace/i, name: 'French Lace' },
        { pattern: /swiss\s*voile/i, name: 'Swiss Voile' },
        { pattern: /chantil+y\s*lace/i, name: 'Chantilly Lace' },
        { pattern: /chemical\s*lace/i, name: 'Chemical Lace' },
        { pattern: /guipure\s*lace/i, name: 'Guipure Lace' },
        { pattern: /korea\s*lace/i, name: 'Korean Lace' },
        { pattern: /taffeta/i, name: 'Taffeta Fabric' },
        { pattern: /mesh\s*lace/i, name: 'Mesh Lace' },
        { pattern: /aso[\s-]*oke/i, name: 'Aso-Oke' },
        { pattern: /senator/i, name: 'Senator Material' },
        { pattern: /cotton/i, name: 'Cotton Fabric' },
        { pattern: /silk/i, name: 'Silk Fabric' },
        { pattern: /chiffon/i, name: 'Chiffon Fabric' },
        { pattern: /george/i, name: 'George Fabric' },
        { pattern: /lace/i, name: 'Luxury Lace' },
        { pattern: /appliqué|applique/i, name: '3D Appliqué Lace' },
        { pattern: /sequin/i, name: 'Sequin Fabric' },
        { pattern: /velvet/i, name: 'Velvet Fabric' },
        { pattern: /organza/i, name: 'Organza Fabric' },
        { pattern: /damask/i, name: 'Damask Fabric' },
    ];

    // Detect fabric type from caption
    let detectedName = null;
    for (const { pattern, name } of fabricKeywords) {
        if (pattern.test(caption)) {
            detectedName = name;
            break;
        }
    }

    // Try to extract color mentions
    const colorPatterns = [
        /\b(wine|burgundy|maroon)\b/i,
        /\b(gold|golden)\b/i,
        /\b(navy|blue|royal\s*blue)\b/i,
        /\b(champagne|cream|ivory|off[\s-]*white)\b/i,
        /\b(red|scarlet|crimson)\b/i,
        /\b(green|emerald|olive)\b/i,
        /\b(peach|coral|salmon)\b/i,
        /\b(white|snow)\b/i,
        /\b(black|onyx)\b/i,
        /\b(pink|rose|fuchsia|magenta)\b/i,
        /\b(teal|turquoise|aqua)\b/i,
        /\b(purple|violet|plum|lilac)\b/i,
        /\b(orange|amber|rust)\b/i,
        /\b(grey|gray|silver|charcoal)\b/i,
        /\b(brown|chocolate|camel|tan)\b/i,
        /\b(nude|beige)\b/i,
        /\b(yellow|lemon|mustard)\b/i,
    ];

    let detectedColor = null;
    for (const colorPat of colorPatterns) {
        const match = caption.match(colorPat);
        if (match) {
            detectedColor = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
            break;
        }
    }

    // Extract price if mentioned (e.g. "280k" or "₦150,000")
    let priceFromCaption = 0;
    const priceMatch = caption.match(/(\d{2,3})k\b/i);
    if (priceMatch) {
        priceFromCaption = parseInt(priceMatch[1]) * 1000;
    }
    const nairaMatch = caption.match(/₦\s*([\d,]+)/);
    if (nairaMatch && !priceFromCaption) {
        priceFromCaption = parseInt(nairaMatch[1].replace(/,/g, ''));
    }

    // Detect if it's a celebrant/event type
    const isCelebrant = /celebrant|asoebi|aso[\s-]*ebi|wedding|bride/i.test(caption);
    const isLuxe = /luxe|luxury|premium|exclusive|VIP/i.test(caption);

    // Build the final name
    let finalName = detectedName || fabricType || 'Premium Fabric';

    if (isLuxe && !finalName.includes('Luxur')) {
        finalName = 'Luxury ' + finalName;
    }

    if (detectedColor) {
        finalName += ` — ${detectedColor}`;
    }

    if (isCelebrant && !finalName.includes('Celebrant')) {
        finalName += ' (Celebrant)';
    }

    // Add a unique suffix based on index to avoid duplicate names
    finalName += ` #${String(index).padStart(2, '0')}`;

    return { name: finalName, price: priceFromCaption };
}

async function run() {
    console.log('Fetching all products with messy names...\n');

    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, slug, fabric_type, price, description')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Failed to fetch products:', error.message);
        process.exit(1);
    }

    // Skip our manually-created demo products (they have clean names)
    const demoSlugs = [
        'ankara-wine-gold', 'french-lace-champagne', 'senator-charcoal-grey',
        'swiss-voile-soft-peach', 'asoke-traditional-set', 'cotton-adire-indigo',
        'test-ankara-print', 'test-senator-bundle',
    ];

    let updated = 0;
    let idx = 1;

    for (const product of products) {
        if (demoSlugs.includes(product.slug)) {
            console.log(`⊘ Skipping demo product: ${product.name}`);
            continue;
        }

        const description = product.description || product.name || '';
        const { name: cleanName, price: extractedPrice } = generateCleanName(
            description,
            product.fabric_type,
            idx
        );

        const updates = { name: cleanName };

        // Update price if we extracted one and the current price is 0
        if (extractedPrice > 0 && (!product.price || product.price === 0)) {
            updates.price = extractedPrice;
        }

        const { error: updateError } = await supabase
            .from('products')
            .update(updates)
            .eq('id', product.id);

        if (updateError) {
            console.error(`✗ Failed to update ${product.slug}: ${updateError.message}`);
        } else {
            const priceNote = updates.price ? ` | price → ₦${updates.price.toLocaleString()}` : '';
            console.log(`✓ ${product.slug}: "${product.name.substring(0, 40)}..." → "${cleanName}"${priceNote}`);
            updated++;
        }

        idx++;
    }

    console.log(`\n========================================`);
    console.log(`Updated ${updated} product names.`);
    console.log(`========================================`);
}

run();
