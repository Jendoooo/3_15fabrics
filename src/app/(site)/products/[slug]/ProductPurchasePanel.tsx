'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
};

export default function ProductPurchasePanel({
  productId,
  productName,
  unitPrice,
  productStatus,
  primaryImageUrl,
  variants,
}: ProductPurchasePanelProps) {
  const params = useParams<{ slug: string | string[] }>();
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const productSlug = Array.isArray(params.slug) ? (params.slug[0] ?? '') : (params.slug ?? '');

  const inStockVariants = useMemo(
    () => variants.filter((variant) => variant.stock_quantity > 0),
    [variants]
  );
  const hasNoVariants = variants.length === 0;
  const hasNoInStockVariants = variants.length > 0 && inStockVariants.length === 0;
  const hasOutOfStockVariant = variants.some((variant) => variant.stock_quantity === 0);
  const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '');
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi, I'm interested in ${productName}`
  )}`;

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    inStockVariants[0]?.id ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId) ?? null,
    [selectedVariantId, variants]
  );

  // Check if the selected variant is already in cart
  const variantInCart = useMemo(
    () => cartItems.find((item) => item.variant_id === selectedVariantId),
    [cartItems, selectedVariantId]
  );

  const maxQuantity = selectedVariant
    ? Math.min(selectedVariant.stock_quantity, 10)
    : 1;

  const isSoldOut =
    productStatus === 'sold_out' || !selectedVariant || selectedVariant.stock_quantity <= 0;

  // Reset quantity when variant changes
  useEffect(() => {
    setQuantity(1);
    setJustAdded(false);
  }, [selectedVariantId]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    };
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!selectedVariant || isSoldOut) {
      return;
    }

    addItem({
      product_id: productId,
      slug: productSlug,
      variant_id: selectedVariant.id,
      product_name: productName,
      size: selectedVariant.size ?? 'One Size',
      color: selectedVariant.color ?? 'Default',
      unit_price: unitPrice,
      quantity,
      image_url: primaryImageUrl ?? '',
    });

    // Show "Added ✓" feedback for 2.5 seconds
    setJustAdded(true);
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => setJustAdded(false), 2500);
  }, [selectedVariant, isSoldOut, addItem, productId, productSlug, productName, unitPrice, quantity, primaryImageUrl]);

  if (hasNoVariants) {
    return (
      <div className="space-y-4">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="block w-full bg-black py-4 text-center text-sm uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
        >
          Enquire on WhatsApp
        </a>
      </div>
    );
  }

  // Determine button label
  let buttonLabel = 'Add to Cart';
  if (isSoldOut) {
    buttonLabel = 'Sold Out';
  } else if (justAdded) {
    buttonLabel = 'Added ✓';
  } else if (mounted && variantInCart) {
    buttonLabel = `In Cart (${variantInCart.quantity}) — Add More`;
  }

  return (
    <div className="space-y-6">
      {/* Size selector */}
      <div>
        <span className="mb-3 block text-sm uppercase tracking-wider">Size</span>
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
                className={`flex h-12 min-w-12 items-center justify-center border px-4 text-sm uppercase tracking-widest transition-colors ${isSelected
                    ? 'border-black bg-black text-white'
                    : 'border-black text-black hover:bg-black hover:text-white'
                  } ${isOutOfStock || productStatus === 'sold_out' ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {variant.size ?? 'OS'}
              </button>
            );
          })}
        </div>
        {hasNoInStockVariants ? (
          <p className="mt-3 text-xs uppercase tracking-widest text-red-600">Out of Stock</p>
        ) : null}
        {!hasNoInStockVariants && hasOutOfStockVariant ? (
          <p className="mt-3 text-xs uppercase tracking-widest text-neutral-500">
            Out-of-stock sizes are disabled
          </p>
        ) : null}
        {selectedVariant?.color ? (
          <p className="mt-3 text-xs uppercase tracking-widest text-neutral-500">
            Color: {selectedVariant.color}
          </p>
        ) : null}
      </div>

      {/* Quantity selector */}
      {!isSoldOut && (
        <div>
          <span className="mb-3 block text-sm uppercase tracking-wider">Quantity</span>
          <div className="inline-flex items-center border border-black">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="flex h-12 w-12 items-center justify-center text-lg transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="flex h-12 w-14 items-center justify-center border-x border-black text-sm font-medium tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              disabled={quantity >= maxQuantity}
              className="flex h-12 w-12 items-center justify-center text-lg transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Add to Cart button */}
      <button
        type="button"
        disabled={isSoldOut}
        onClick={handleAddToCart}
        className={`w-full py-4 text-sm uppercase tracking-widest transition-colors disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600 ${justAdded
            ? 'bg-green-700 text-white'
            : 'bg-black text-white hover:bg-neutral-800'
          }`}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
