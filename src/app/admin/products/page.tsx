'use client';

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase';
import type { Category, Collection, Product } from '@/lib/types';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  draft: 'bg-neutral-100 text-neutral-500',
  sold_out: 'bg-red-100 text-red-600',
};

type ProductInsertPayload = {
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  description: string | null;
  fabric_details: string | null;
  care_instructions: string | null;
  fit_notes: string | null;
  status: 'draft' | 'active' | 'sold_out';
  is_featured: boolean;
  collection_id: string | null;
  category_id: string | null;
};

type VariantInsertPayload = {
  size: string | null;
  color: string | null;
  stock_quantity: number;
  sku: string | null;
};

type ImageInsertPayload = {
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
};

type PreviewRow = {
  line: number;
  product: ProductInsertPayload;
  variants: VariantInsertPayload[];
  images: ImageInsertPayload[];
  errors: string[];
};

type CsvPreview = {
  rows: PreviewRow[];
  globalErrors: string[];
};

const ALLOWED_STATUSES = new Set(['draft', 'active', 'sold_out'] as const);
const BULK_HEADER_HINT =
  'name,slug,price,status,collection_slug,category_slug,variants,image_urls';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const parseCsvLine = (line: string): string[] => {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
};

const parseBoolean = (raw: string) => {
  const normalized = raw.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
};

const parseNullableNumber = (raw: string) => {
  if (!raw.trim()) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const parseVariantExpression = (raw: string, errors: string[]) => {
  const variants: VariantInsertPayload[] = [];
  const entries = raw
    .split('|')
    .map((entry) => entry.trim())
    .filter(Boolean);

  entries.forEach((entry) => {
    const [sizeRaw = '', colorRaw = '', stockRaw = '0', skuRaw = ''] = entry.split(':');
    const stockQuantity = Number(stockRaw.trim());

    if (!Number.isFinite(stockQuantity)) {
      errors.push(`Invalid stock value in variants expression "${entry}"`);
      return;
    }

    variants.push({
      size: sizeRaw.trim() || null,
      color: colorRaw.trim() || null,
      stock_quantity: Math.max(0, Math.floor(stockQuantity)),
      sku: skuRaw.trim() || null,
    });
  });

  return variants;
};

const parseImageUrls = (raw: string, altText: string | null) =>
  raw
    .split('|')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((url, index) => ({
      image_url: url,
      alt_text: altText,
      sort_order: index,
      is_primary: index === 0,
    }));

const buildPreview = (
  csvText: string,
  collectionsBySlug: Record<string, string>,
  categoriesBySlug: Record<string, string>
): CsvPreview => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { rows: [], globalErrors: ['CSV file is empty.'] };
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());
  const requiredHeaders = ['name', 'slug', 'price'];
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    return {
      rows: [],
      globalErrors: [
        `Missing required header(s): ${missingHeaders.join(', ')}`,
        `Expected headers include: ${BULK_HEADER_HINT}`,
      ],
    };
  }

  const rows: PreviewRow[] = lines.slice(1).map((line, index) => {
    const cells = parseCsvLine(line);
    const rowLine = index + 2;
    const rowErrors: string[] = [];
    const data = headers.reduce<Record<string, string>>((acc, header, headerIndex) => {
      acc[header] = cells[headerIndex]?.trim() ?? '';
      return acc;
    }, {});

    const name = data.name;
    const slug = slugify(data.slug || data.name);
    const parsedPrice = parseNullableNumber(data.price);
    const parsedCompareAtPrice = parseNullableNumber(data.compare_at_price);
    const status = (data.status || 'draft').toLowerCase();

    if (!name) rowErrors.push('Product name is required.');
    if (!slug) rowErrors.push('Slug is required.');
    if (parsedPrice === null || Number.isNaN(parsedPrice)) rowErrors.push('Valid price is required.');
    if (parsedCompareAtPrice !== null && Number.isNaN(parsedCompareAtPrice)) {
      rowErrors.push('compare_at_price must be a valid number.');
    }
    if (!ALLOWED_STATUSES.has(status as 'draft' | 'active' | 'sold_out')) {
      rowErrors.push(`Invalid status "${data.status}". Use draft, active, or sold_out.`);
    }

    const collectionSlug = data.collection_slug?.toLowerCase() ?? '';
    const categorySlug = data.category_slug?.toLowerCase() ?? '';
    const collectionId = collectionSlug ? collectionsBySlug[collectionSlug] ?? null : null;
    const categoryId = categorySlug ? categoriesBySlug[categorySlug] ?? null : null;

    if (collectionSlug && !collectionId) {
      rowErrors.push(`Unknown collection_slug "${collectionSlug}".`);
    }
    if (categorySlug && !categoryId) {
      rowErrors.push(`Unknown category_slug "${categorySlug}".`);
    }

    let variants: VariantInsertPayload[] = [];
    if (data.variants) {
      variants = parseVariantExpression(data.variants, rowErrors);
    } else {
      const hasSingleVariantField = Boolean(
        data.variant_size || data.variant_color || data.variant_stock || data.variant_sku
      );
      if (hasSingleVariantField) {
        const singleStockRaw = data.variant_stock || '0';
        const singleStock = Number(singleStockRaw);
        if (!Number.isFinite(singleStock)) {
          rowErrors.push('variant_stock must be numeric.');
        } else {
          variants = [
            {
              size: data.variant_size?.trim() || null,
              color: data.variant_color?.trim() || null,
              stock_quantity: Math.max(0, Math.floor(singleStock)),
              sku: data.variant_sku?.trim() || null,
            },
          ];
        }
      }
    }

    const imageSource = data.image_urls || data.image_url || '';
    const imageAltText = data.image_alt_text?.trim() || null;
    const images = imageSource ? parseImageUrls(imageSource, imageAltText) : [];

    const product: ProductInsertPayload = {
      name,
      slug,
      price: parsedPrice ?? 0,
      compare_at_price: parsedCompareAtPrice,
      description: data.description?.trim() || null,
      fabric_details: data.fabric_details?.trim() || null,
      care_instructions: data.care_instructions?.trim() || null,
      fit_notes: data.fit_notes?.trim() || null,
      status: ALLOWED_STATUSES.has(status as 'draft' | 'active' | 'sold_out')
        ? (status as 'draft' | 'active' | 'sold_out')
        : 'draft',
      is_featured: parseBoolean(data.is_featured || ''),
      collection_id: collectionId,
      category_id: categoryId,
    };

    return {
      line: rowLine,
      product,
      variants,
      images,
      errors: rowErrors,
    };
  });

  return { rows, globalErrors: [] };
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCsvName, setSelectedCsvName] = useState('');
  const [csvPreviewRows, setCsvPreviewRows] = useState<PreviewRow[]>([]);
  const [csvPreviewErrors, setCsvPreviewErrors] = useState<string[]>([]);
  const [isParsingCsv, setIsParsingCsv] = useState(false);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [uploadSummary, setUploadSummary] = useState('');
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const validPreviewRows = useMemo(
    () => csvPreviewRows.filter((row) => row.errors.length === 0),
    [csvPreviewRows]
  );
  const invalidPreviewRows = useMemo(
    () => csvPreviewRows.filter((row) => row.errors.length > 0),
    [csvPreviewRows]
  );

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabaseBrowser
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    setProducts((data ?? []) as Product[]);
    setLoading(false);
  }, []);

  const loadLookups = useCallback(async () => {
    const [{ data: collections }, { data: categories }] = await Promise.all([
      supabaseBrowser.from('collections').select('id, slug'),
      supabaseBrowser.from('categories').select('id, slug'),
    ]);

    const collectionMap = ((collections ?? []) as Pick<Collection, 'id' | 'slug'>[]).reduce<
      Record<string, string>
    >((acc, collection) => {
      acc[collection.slug.toLowerCase()] = collection.id;
      return acc;
    }, {});

    const categoryMap = ((categories ?? []) as Pick<Category, 'id' | 'slug'>[]).reduce<
      Record<string, string>
    >((acc, category) => {
      acc[category.slug.toLowerCase()] = category.id;
      return acc;
    }, {});

    return { collectionMap, categoryMap };
  }, []);

  useEffect(() => {
    void loadProducts();
    void loadLookups();
  }, [loadProducts, loadLookups]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await supabaseBrowser.from('products').delete().eq('id', id);
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const handleCsvChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedCsvName(file.name);
    setIsParsingCsv(true);
    setUploadSummary('');
    setUploadErrors([]);

    try {
      const { collectionMap, categoryMap } = await loadLookups();
      const csvText = await file.text();
      const preview = buildPreview(csvText, collectionMap, categoryMap);
      setCsvPreviewRows(preview.rows);
      setCsvPreviewErrors(preview.globalErrors);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to parse CSV.';
      setCsvPreviewRows([]);
      setCsvPreviewErrors([message]);
    } finally {
      setIsParsingCsv(false);
    }
  };

  const handleConfirmBulkUpload = async () => {
    if (validPreviewRows.length === 0) return;

    setIsUploadingCsv(true);
    setUploadSummary('');
    setUploadErrors([]);

    let successCount = 0;
    const rowErrors: string[] = [];

    for (const row of validPreviewRows) {
      const { data: insertedProduct, error: productError } = await supabaseBrowser
        .from('products')
        .insert(row.product)
        .select('id')
        .single();

      if (productError || !insertedProduct) {
        rowErrors.push(
          `Line ${row.line} (${row.product.slug}): ${
            productError?.message ?? 'Failed to create product.'
          }`
        );
        continue;
      }

      const productId = (insertedProduct as { id: string }).id;
      let rowFailed = false;

      if (row.variants.length > 0) {
        const variantsPayload = row.variants.map((variant) => ({
          ...variant,
          product_id: productId,
        }));
        const { error: variantError } = await supabaseBrowser
          .from('product_variants')
          .insert(variantsPayload);

        if (variantError) {
          rowFailed = true;
          rowErrors.push(
            `Line ${row.line} (${row.product.slug}): failed to insert variants (${variantError.message}).`
          );
        }
      }

      if (row.images.length > 0) {
        const imagesPayload = row.images.map((image) => ({
          ...image,
          product_id: productId,
        }));
        const { error: imageError } = await supabaseBrowser.from('product_images').insert(imagesPayload);

        if (imageError) {
          rowFailed = true;
          rowErrors.push(
            `Line ${row.line} (${row.product.slug}): failed to insert images (${imageError.message}).`
          );
        }
      }

      if (rowFailed) {
        await supabaseBrowser.from('products').delete().eq('id', productId);
        continue;
      }

      successCount += 1;
    }

    setUploadErrors(rowErrors);
    setUploadSummary(`Uploaded ${successCount} of ${validPreviewRows.length} product(s).`);
    setIsUploadingCsv(false);
    await loadProducts();
  };

  const formatNaira = (value: number) => `\u20A6${value.toLocaleString('en-NG')}`;

  return (
    <div className="p-5 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-light uppercase tracking-widest">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-black px-4 py-2 text-xs uppercase tracking-widest text-white hover:bg-neutral-800"
        >
          + Add Product
        </Link>
      </div>

      <section className="mb-8 border border-neutral-200 bg-white p-4 md:p-5">
        <h2 className="text-xs uppercase tracking-widest text-neutral-500">Bulk Upload CSV</h2>
        <p className="mt-2 text-xs text-neutral-500">
          Use one product per row. Required headers: <span className="font-mono">name, slug, price</span>.
          Optional headers include <span className="font-mono">{BULK_HEADER_HINT}</span>.
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          For multiple variants use <span className="font-mono">variants</span> with{' '}
          <span className="font-mono">size:color:stock:sku|...</span>. For multiple images use{' '}
          <span className="font-mono">image_urls</span> with <span className="font-mono">url|url|...</span>.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center border border-neutral-300 px-3 py-2 text-xs uppercase tracking-widest hover:border-black">
            <input type="file" accept=".csv,text/csv" onChange={handleCsvChange} className="hidden" />
            Choose CSV
          </label>
          {selectedCsvName ? <span className="text-xs text-neutral-500">{selectedCsvName}</span> : null}
          {isParsingCsv ? <span className="text-xs text-neutral-500">Parsing...</span> : null}
        </div>

        {csvPreviewErrors.length > 0 ? (
          <div className="mt-4 border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {csvPreviewErrors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        ) : null}

        {csvPreviewRows.length > 0 ? (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-widest text-neutral-500">
              <span>{validPreviewRows.length} ready</span>
              <span>{invalidPreviewRows.length} with errors</span>
            </div>

            <div className="overflow-x-auto border border-neutral-200">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-neutral-50 uppercase tracking-widest text-neutral-500">
                  <tr>
                    <th className="px-3 py-2">Line</th>
                    <th className="px-3 py-2">Product</th>
                    <th className="px-3 py-2">Price</th>
                    <th className="px-3 py-2">Variants</th>
                    <th className="px-3 py-2">Images</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {csvPreviewRows.map((row) => (
                    <tr
                      key={`${row.line}-${row.product.slug}`}
                      className={row.errors.length > 0 ? 'bg-red-50 text-red-700' : 'bg-white'}
                    >
                      <td className="px-3 py-2 align-top">{row.line}</td>
                      <td className="px-3 py-2 align-top">
                        <p className="font-medium text-black">{row.product.name}</p>
                        <p className="font-mono text-[10px] text-neutral-500">{row.product.slug}</p>
                        {row.errors.length > 0 ? (
                          <p className="mt-1 text-[10px]">{row.errors.join(' | ')}</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 align-top">{formatNaira(row.product.price)}</td>
                      <td className="px-3 py-2 align-top">{row.variants.length}</td>
                      <td className="px-3 py-2 align-top">{row.images.length}</td>
                      <td className="px-3 py-2 align-top">{row.product.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleConfirmBulkUpload}
                disabled={isUploadingCsv || validPreviewRows.length === 0}
                className="bg-black px-4 py-2 text-xs uppercase tracking-widest text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isUploadingCsv ? 'Uploading...' : `Upload ${validPreviewRows.length} Product(s)`}
              </button>
              {uploadSummary ? <span className="text-xs text-neutral-500">{uploadSummary}</span> : null}
            </div>

            {uploadErrors.length > 0 ? (
              <div className="border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                {uploadErrors.map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {loading ? (
        <p className="text-sm text-neutral-400">Loading...</p>
      ) : products.length === 0 ? (
        <div className="py-16 text-center">
          <p className="mb-4 text-sm uppercase tracking-widest text-neutral-400">No products yet</p>
          <Link href="/admin/products/new" className="text-sm underline">
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <div key={product.id} className="flex items-center gap-4 border border-neutral-200 bg-white p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{product.name}</span>
                  <span
                    className={`rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-widest ${
                      STATUS_COLORS[product.status] ?? 'bg-neutral-100'
                    }`}
                  >
                    {product.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-neutral-500">{formatNaira(product.price)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="text-xs uppercase tracking-widest text-neutral-500 underline hover:text-black"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(product.id, product.name)}
                  className="text-xs uppercase tracking-widest text-red-400 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
