'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase';
import ImageUploader from '@/components/ImageUploader';
import type { Product, ProductVariant, Collection, ProductImage } from '@/lib/types';

type VariantDraft = { id?: string; size: string; color: string; stock_quantity: number; sku: string };

type Props = {
  product?: Product;
  variants?: ProductVariant[];
};

export default function ProductForm({ product, variants: initialVariants = [] }: Props) {
  const router = useRouter();
  const isEdit = !!product;

  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [price, setPrice] = useState(product?.price?.toString() ?? '');
  const [comparePrice, setComparePrice] = useState(product?.compare_at_price?.toString() ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [fabricDetails, setFabricDetails] = useState(product?.fabric_details ?? '');
  const [careInstructions, setCareInstructions] = useState(product?.care_instructions ?? '');
  const [fitNotes, setFitNotes] = useState(product?.fit_notes ?? '');
  const [status, setStatus] = useState(product?.status ?? 'draft');
  const [unitType, setUnitType] = useState<'yard' | 'bundle'>(
    (product?.unit_type as 'yard' | 'bundle') ?? 'yard'
  );
  const [minimumQuantity, setMinimumQuantity] = useState<number>(product?.minimum_quantity ?? 1);
  const [fabricType, setFabricType] = useState<string>(product?.fabric_type ?? '');
  const [gender, setGender] = useState<'men' | 'women' | 'unisex'>((product?.gender ?? 'unisex') as 'men' | 'women' | 'unisex');
  const [collectionId, setCollectionId] = useState(product?.collection_id ?? '');
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [imageRows, setImageRows] = useState<string[]>(['']);
  const [variants, setVariants] = useState<VariantDraft[]>(
    initialVariants.length > 0
      ? initialVariants.map((v) => ({ id: v.id, size: v.size ?? '', color: v.color ?? '', stock_quantity: v.stock_quantity, sku: v.sku ?? '' }))
      : [{ size: '', color: '', stock_quantity: 0, sku: '' }]
  );
  const [collections, setCollections] = useState<Collection[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadFormData = async () => {
      const [collectionsResult, imagesResult] = await Promise.all([
        supabaseBrowser.from('collections').select('id, name').order('name', { ascending: true }),
        isEdit && product?.id
          ? supabaseBrowser
              .from('product_images')
              .select('image_url, sort_order')
              .eq('product_id', product.id)
              .order('sort_order', { ascending: true })
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (!active) return;

      setCollections((collectionsResult.data ?? []) as Collection[]);

      if (isEdit && product?.id) {
        const existingImages = (imagesResult.data ?? []) as Pick<ProductImage, 'image_url' | 'sort_order'>[];
        setImageRows(existingImages.length > 0 ? existingImages.map((image) => image.image_url) : ['']);
      }
    };

    void loadFormData();

    return () => {
      active = false;
    };
  }, [isEdit, product?.id]);

  const autoSlug = (n: string) =>
    n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleNameChange = (v: string) => {
    setName(v);
    if (!isEdit) setSlug(autoSlug(v));
  };

  const addVariant = () =>
    setVariants((prev) => [...prev, { size: '', color: '', stock_quantity: 0, sku: '' }]);

  const updateVariant = (i: number, field: keyof VariantDraft, value: string | number) =>
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)));

  const removeVariant = (i: number) =>
    setVariants((prev) => prev.filter((_, idx) => idx !== i));

  const addImageRow = () => setImageRows((prev) => [...prev, '']);

  const setImageUrlAt = (index: number, url: string) =>
    setImageRows((prev) => prev.map((rowUrl, rowIndex) => (rowIndex === index ? url : rowUrl)));

  const removeImageRow = (index: number) =>
    setImageRows((prev) => {
      if (prev.length <= 1) {
        return [''];
      }

      return prev.filter((_, rowIndex) => rowIndex !== index);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      name,
      slug,
      price: parseFloat(price),
      compare_at_price: comparePrice ? parseFloat(comparePrice) : null,
      description: description || null,
      fabric_details: fabricDetails || null,
      care_instructions: careInstructions || null,
      fit_notes: fitNotes || null,
      status,
      unit_type: unitType,
      minimum_quantity: minimumQuantity,
      fabric_type: fabricType || null,
      gender,
      collection_id: collectionId || null,
      is_featured: isFeatured,
    };

    let productId = product?.id;

    if (isEdit) {
      const { error: updateError } = await supabaseBrowser.from('products').update(payload).eq('id', productId!);
      if (updateError) { setError(updateError.message); setSaving(false); return; }
    } else {
      const { data, error: insertError } = await supabaseBrowser.from('products').insert(payload).select('id').single();
      if (insertError) { setError(insertError.message); setSaving(false); return; }
      productId = (data as { id: string }).id;
    }

    // Upsert variants
    for (const v of variants) {
      if (!v.size && !v.color) continue;
      const vPayload = {
        product_id: productId!,
        size: v.size || null,
        color: v.color || null,
        stock_quantity: Number(v.stock_quantity),
        sku: v.sku || null,
      };
      if (v.id) {
        await supabaseBrowser.from('product_variants').update(vPayload).eq('id', v.id);
      } else {
        await supabaseBrowser.from('product_variants').insert(vPayload);
      }
    }

    const normalizedImageUrls = imageRows.map((url) => url.trim()).filter(Boolean);

    if (isEdit) {
      const { error: deleteImagesError } = await supabaseBrowser
        .from('product_images')
        .delete()
        .eq('product_id', productId!);

      if (deleteImagesError) {
        setError(deleteImagesError.message);
        setSaving(false);
        return;
      }
    }

    if (normalizedImageUrls.length > 0) {
      const imagePayload = normalizedImageUrls.map((imageUrl, index) => ({
        product_id: productId!,
        image_url: imageUrl,
        sort_order: index,
        is_primary: index === 0,
      }));

      const { error: insertImagesError } = await supabaseBrowser
        .from('product_images')
        .insert(imagePayload);

      if (insertImagesError) {
        setError(insertImagesError.message);
        setSaving(false);
        return;
      }
    }

    router.push('/admin/products');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* Basic info */}
      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-widest text-neutral-500">Basic Info</h2>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest">Name *</label>
          <input value={name} onChange={(e) => handleNameChange(e.target.value)} required
            className="w-full border border-neutral-300 p-2.5 text-sm focus:border-black focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest">Slug *</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} required
            className="w-full border border-neutral-300 p-2.5 text-sm focus:border-black focus:outline-none font-mono" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest">Price (₦) *</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" step="100"
              className="w-full border border-neutral-300 p-2.5 text-sm focus:border-black focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest">Compare at (₦)</label>
            <input type="number" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} min="0" step="100"
              className="w-full border border-neutral-300 p-2.5 text-sm focus:border-black focus:outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-neutral-300 bg-white p-2.5 text-sm focus:border-black focus:outline-none">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="sold_out">Sold Out</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest">Collection</label>
            <select value={collectionId} onChange={(e) => setCollectionId(e.target.value)}
              className="w-full border border-neutral-300 bg-white p-2.5 text-sm focus:border-black focus:outline-none">
              <option value="">— None —</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest">Fabric Type</label>
          <select
            value={fabricType}
            onChange={(e) => setFabricType(e.target.value)}
            className="w-full border border-neutral-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">- Select Fabric Type -</option>
            <option value="Ankara">Ankara</option>
            <option value="French Lace">French Lace</option>
            <option value="Swiss Voile">Swiss Voile</option>
            <option value="Senator">Senator</option>
            <option value="Aso-Oke">Aso-Oke</option>
            <option value="Cotton">Cotton</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as 'men' | 'women' | 'unisex')}
            className="w-full border border-neutral-200 bg-white px-3 py-2 text-sm"
          >
            <option value="unisex">Unisex</option>
            <option value="women">Women</option>
            <option value="men">Men</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest">Sold By</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                value="yard"
                checked={unitType === 'yard'}
                onChange={() => setUnitType('yard')}
              />
              Per Yard
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                value="bundle"
                checked={unitType === 'bundle'}
                onChange={() => setUnitType('bundle')}
              />
              Bundle Only (fixed set)
            </label>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest">
            {unitType === 'yard' ? 'Minimum Yards to Order' : 'Bundle Size (total yards in set)'}
          </label>
          <input
            type="number"
            min={0.5}
            step={0.5}
            value={minimumQuantity}
            onChange={(e) => setMinimumQuantity(parseFloat(e.target.value) || 1)}
            className="w-full border border-neutral-200 px-3 py-2 text-sm"
            placeholder={unitType === 'yard' ? 'e.g. 5' : 'e.g. 6'}
          />
          <p className="mt-1 text-xs text-neutral-500">
            {unitType === 'yard'
              ? 'Customers cannot order fewer yards than this.'
              : 'The number of yards included in this bundle set.'}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4" />
          Featured product (show on homepage)
        </label>
      </section>

      {/* Description & Details */}
      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-widest text-neutral-500">Description & Details</h2>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
            className="w-full border border-neutral-300 p-2.5 text-sm focus:border-black focus:outline-none resize-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest">Fabric Details</label>
          <textarea value={fabricDetails} onChange={(e) => setFabricDetails(e.target.value)} rows={2}
            className="w-full border border-neutral-300 p-2.5 text-sm focus:border-black focus:outline-none resize-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest">Care Instructions</label>
          <textarea value={careInstructions} onChange={(e) => setCareInstructions(e.target.value)} rows={2}
            className="w-full border border-neutral-300 p-2.5 text-sm focus:border-black focus:outline-none resize-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest">Fit Notes</label>
          <input value={fitNotes} onChange={(e) => setFitNotes(e.target.value)}
            className="w-full border border-neutral-300 p-2.5 text-sm focus:border-black focus:outline-none" />
        </div>
      </section>

      {/* Variants */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-widest text-neutral-500">Colorway / Pattern</h2>
          <button type="button" onClick={addVariant}
            className="text-xs uppercase tracking-widest underline hover:text-neutral-600">
            + Add Variant
          </button>
        </div>
        {variants.map((v, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 items-end">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-widest text-neutral-400">
                Colorway / Pattern
              </label>
              <input value={v.size} onChange={(e) => updateVariant(i, 'size', e.target.value)} placeholder="(not used for fabrics)"
                className="w-full border border-neutral-300 p-2 text-sm opacity-50 focus:border-black focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-widest text-neutral-400">Color</label>
              <input value={v.color} onChange={(e) => updateVariant(i, 'color', e.target.value)} placeholder="Black"
                className="w-full border border-neutral-300 p-2 text-sm focus:border-black focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-widest text-neutral-400">Stock</label>
              <input type="number" value={v.stock_quantity} onChange={(e) => updateVariant(i, 'stock_quantity', parseInt(e.target.value) || 0)} min="0"
                className="w-full border border-neutral-300 p-2 text-sm focus:border-black focus:outline-none" />
            </div>
            <button type="button" onClick={() => removeVariant(i)}
              className="pb-2 text-xs text-red-400 hover:text-red-600 text-right">
              Remove
            </button>
          </div>
        ))}
      </section>

      {/* Images */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-widest text-neutral-500">Images</h2>
          <button
            type="button"
            onClick={addImageRow}
            className="text-xs uppercase tracking-widest underline hover:text-neutral-600"
          >
            + Add Image Slot
          </button>
        </div>

        {imageRows.map((imageUrl, index) => (
          <div key={`image-row-${index}`} className="space-y-2 border border-neutral-200 p-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-widest text-neutral-400">
                {index === 0 ? 'Primary Image' : `Image ${index + 1}`}
              </p>
              <button
                type="button"
                onClick={() => removeImageRow(index)}
                className="text-[10px] uppercase tracking-widest text-red-400 hover:text-red-600"
              >
                Remove
              </button>
            </div>

            <ImageUploader
              label={index === 0 ? 'Upload Primary Image' : 'Upload Image'}
              onUpload={(url) => setImageUrlAt(index, url)}
            />

            {imageUrl ? (
              <p className="break-all border border-neutral-200 bg-neutral-50 px-2 py-1 font-mono text-[10px] text-neutral-500">
                {imageUrl}
              </p>
            ) : (
              <p className="text-[10px] uppercase tracking-widest text-neutral-400">
                No image uploaded yet
              </p>
            )}
          </div>
        ))}

        <p className="text-xs text-neutral-400">
          Upload product images in display order. The first image is used as primary.
        </p>
      </section>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-4">
        <button type="submit" disabled={saving}
          className="bg-black px-8 py-3 text-sm uppercase tracking-widest text-white hover:bg-neutral-800 disabled:opacity-50">
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
        </button>
        <button type="button" onClick={() => router.push('/admin/products')}
          className="px-8 py-3 text-sm uppercase tracking-widest text-neutral-500 hover:text-black">
          Cancel
        </button>
      </div>
    </form>
  );
}
