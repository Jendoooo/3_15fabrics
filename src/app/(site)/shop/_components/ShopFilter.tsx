'use client';

import { useMemo, useState } from 'react';

import ProductCard from '@/components/ProductCard';

type ShopProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  categoryId: string | null;
};

type ShopCategory = {
  id: string;
  name: string;
  slug: string;
};

type ShopFilterProps = {
  products: ShopProduct[];
  categories: ShopCategory[];
};

export default function ShopFilter({ products, categories }: ShopFilterProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch = normalizedSearch
        ? product.name.toLowerCase().includes(normalizedSearch)
        : true;
      const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  return (
    <section className="space-y-8">
      <div className="space-y-4 border border-neutral-200 bg-white p-4">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products…"
          className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 text-xs uppercase tracking-widest transition-colors ${
              selectedCategory === null
                ? 'bg-black text-white'
                : 'border border-neutral-200 text-neutral-600 hover:border-black hover:text-black'
            }`}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1.5 text-xs uppercase tracking-widest transition-colors ${
                selectedCategory === category.id
                  ? 'bg-black text-white'
                  : 'border border-neutral-200 text-neutral-600 hover:border-black hover:text-black'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="py-20 text-center text-sm uppercase tracking-widest text-neutral-500">
          No products found.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-8 gap-y-16 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              slug={product.slug}
              name={product.name}
              price={product.price}
              imageUrl={product.imageUrl}
            />
          ))}
        </div>
      )}
    </section>
  );
}
