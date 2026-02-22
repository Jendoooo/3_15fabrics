'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

import { useCartStore } from '@/lib/cart-store';

type VariantOption = {
  id: string;
  size: string | null;
  color: string | null;
  stock_quantity: number;
};

type ProductPurchasePanelProps = {
  productId: string;
  productName: string;
  unitPrice: number;
  productStatus: string;
  primaryImageUrl: string | null;
  variants: VariantOption[];
  unitType: 'yard' | 'bundle';
  minimumQuantity: number;
};

export default function ProductPurchasePanel({
  productId,
  productName,
  unitPrice,
  productStatus,
  primaryImageUrl,
  variants,
  unitType,
  minimumQuantity,
}: ProductPurchasePanelProps) {
  const params = useParams<{ slug: string | string[] }>();
  const addItem = useCartStore((state) => state.addItem);
  const productSlug = Array.isArray(params.slug) ? (params.slug[0] ?? '') : (params.slug ?? '');

  const inStockVariants = useMemo(
    () => variants.filter((variant) => variant.stock_quantity > 0),
    [variants]
  );
  const hasNoVariants = variants.length === 0;
  const hasNoInStockVariants = !hasNoVariants && inStockVariants.length === 0;
  const hasOutOfStockVariant = variants.some((variant) => variant.stock_quantity === 0);
  const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '');
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi, I'm interested in ${productName}`
  )}`;

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    inStockVariants[0]?.id ?? variants[0]?.id ?? null
  );
  const [yards, setYards] = useState<number>(minimumQuantity);

  useEffect(() => {
    setSelectedVariantId((currentVariantId) => {
      if (currentVariantId && variants.some((variant) => variant.id === currentVariantId)) {
        return currentVariantId;
      }

      return inStockVariants[0]?.id ?? variants[0]?.id ?? null;
    });
  }, [inStockVariants, variants]);

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId) ?? null,
    [selectedVariantId, variants]
  );

  const maxYards = useMemo(
    () => Math.max(minimumQuantity, selectedVariant?.stock_quantity ?? minimumQuantity),
    [minimumQuantity, selectedVariant]
  );

  useEffect(() => {
    if (unitType === 'bundle') {
      setYards(1);
      return;
    }

    setYards((currentYards) => Math.min(Math.max(currentYards, minimumQuantity), maxYards));
  }, [maxYards, minimumQuantity, selectedVariantId, unitType]);

  const hasInsufficientStockForMinimum =
    unitType === 'yard' && !!selectedVariant && selectedVariant.stock_quantity < minimumQuantity;
  const isSoldOut =
    productStatus === 'sold_out' ||
    !selectedVariant ||
    selectedVariant.stock_quantity <= 0 ||
    hasInsufficientStockForMinimum;

  const handleAddToCart = useCallback(() => {
    if (!selectedVariant || isSoldOut) {
      return;
    }

    addItem({
      product_id: productId,
      slug: productSlug,
      variant_id: selectedVariant.id,
      product_name: productName,
      size: '',
      color: selectedVariant.color ?? 'Default',
      unit_price: unitPrice,
      quantity: unitType === 'bundle' ? 1 : yards,
      image_url: primaryImageUrl ?? '',
      unit_type: unitType,
      minimum_quantity: minimumQuantity,
    });
  }, [
    selectedVariant,
    isSoldOut,
    addItem,
    productId,
    productSlug,
    productName,
    unitPrice,
    unitType,
    yards,
    primaryImageUrl,
    minimumQuantity,
  ]);

  if (hasNoVariants) {
    return (
      <div className="space-y-4">
        {unitType === 'yard' ? (
          <div>
            <label htmlFor="yards-no-variant" className="mb-3 block text-sm uppercase tracking-wider">
              Yards
            </label>
            <input
              id="yards-no-variant"
              type="number"
              min={minimumQuantity}
              step={0.5}
              value={yards}
              onChange={(event) => {
                const parsedValue = parseFloat(event.target.value);
                if (Number.isNaN(parsedValue)) {
                  setYards(minimumQuantity);
                  return;
                }
                setYards(Math.max(parsedValue, minimumQuantity));
              }}
              className="w-full border border-black px-4 py-3 text-sm focus:outline-none"
            />
            <p className="mt-3 text-sm text-neutral-700">
              {`${yards} yards × ₦${unitPrice.toLocaleString('en-NG')} = ₦${(yards * unitPrice).toLocaleString('en-NG')}`}
            </p>
          </div>
        ) : (
          <p className="text-sm uppercase tracking-wider text-neutral-700">
            {`Complete set — ${minimumQuantity} yards`}
          </p>
        )}

        <button
          type="button"
          disabled={productStatus === 'sold_out'}
          onClick={() => {
            addItem({
              product_id: productId,
              slug: productSlug,
              variant_id: 'default',
              product_name: productName,
              size: '',
              color: 'Standard',
              unit_price: unitPrice,
              quantity: unitType === 'bundle' ? 1 : yards,
              image_url: primaryImageUrl ?? '',
              unit_type: unitType,
              minimum_quantity: minimumQuantity,
            });
          }}
          className="w-full bg-brand-forest py-4 text-sm uppercase tracking-widest text-white transition-colors hover:bg-brand-forest/90 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600"
        >
          {productStatus === 'sold_out' ? 'Sold Out' : unitType === 'bundle' ? 'Order This Bundle' : 'Add to Cart'}
        </button>

        {whatsappNumber && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="block w-full border border-brand-gold py-3 text-center text-xs uppercase tracking-widest text-brand-gold transition-colors hover:bg-brand-gold hover:text-white"
          >
            Or Enquire on WhatsApp
          </a>
        )}
      </div>
    );
  }

  const buttonLabel = isSoldOut
    ? 'Sold Out'
    : unitType === 'bundle'
      ? 'Order This Bundle'
      : 'Add to Cart';
  const lineTotal = yards * unitPrice;

  return (
    <div className="space-y-6">
      <div>
        <span className="mb-3 block text-sm uppercase tracking-wider">Colourway</span>
        <div className="flex flex-wrap gap-3">
          {variants.map((variant) => {
            const isSelected = variant.id === selectedVariantId;
            const isOutOfStock = variant.stock_quantity <= 0;

            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariantId(variant.id)}
                disabled={isOutOfStock || productStatus === 'sold_out'}
                className={`min-w-24 border px-4 py-3 text-sm uppercase tracking-widest transition-colors ${isSelected
                  ? 'border-black bg-black text-white'
                  : 'border-black text-black hover:bg-black hover:text-white'
                  } ${isOutOfStock || productStatus === 'sold_out' ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {variant.color ?? 'Default'}
              </button>
            );
          })}
        </div>
        {hasNoInStockVariants ? (
          <p className="mt-3 text-xs uppercase tracking-widest text-red-600">Out of Stock</p>
        ) : null}
        {!hasNoInStockVariants && hasOutOfStockVariant ? (
          <p className="mt-3 text-xs uppercase tracking-widest text-neutral-500">
            Out-of-stock colourways are disabled
          </p>
        ) : null}
      </div>

      {unitType === 'yard' ? (
        <div>
          <label htmlFor="yards" className="mb-3 block text-sm uppercase tracking-wider">
            Yards
          </label>
          <input
            id="yards"
            type="number"
            min={minimumQuantity}
            max={selectedVariant?.stock_quantity ?? minimumQuantity}
            step={0.5}
            value={yards}
            onChange={(event) => {
              const parsedValue = parseFloat(event.target.value);
              if (Number.isNaN(parsedValue)) {
                setYards(minimumQuantity);
                return;
              }

              setYards(Math.min(Math.max(parsedValue, minimumQuantity), maxYards));
            }}
            disabled={isSoldOut}
            className="w-full border border-black px-4 py-3 text-sm focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-100"
          />
          <p className="mt-3 text-sm text-neutral-700">
            {`${yards} yards x ₦${unitPrice.toLocaleString('en-NG')} = ₦${lineTotal.toLocaleString('en-NG')}`}
          </p>
          {selectedVariant ? (
            <p className="mt-2 text-xs uppercase tracking-widest text-neutral-500">
              {`${selectedVariant.stock_quantity} yards in stock`}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm uppercase tracking-wider text-neutral-700">
          {`Complete set - ${minimumQuantity} yards`}
        </p>
      )}

      <button
        type="button"
        disabled={isSoldOut}
        onClick={handleAddToCart}
        className="w-full bg-brand-forest py-4 text-sm uppercase tracking-widest text-white transition-colors hover:bg-brand-forest/90 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
