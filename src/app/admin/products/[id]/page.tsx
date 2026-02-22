import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase';
import type { Product, ProductVariant } from '@/lib/types';
import ProductForm from '../_components/ProductForm';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [{ data: product }, { data: variants }] = await Promise.all([
    supabaseServer.from('products').select('*').eq('id', params.id).single(),
    supabaseServer.from('product_variants').select('*').eq('product_id', params.id),
  ]);

  if (!product) notFound();

  return (
    <div className="p-5 md:p-8">
      <h1 className="mb-8 text-xl font-light uppercase tracking-widest">Edit Product</h1>
      <ProductForm product={product as Product} variants={(variants ?? []) as ProductVariant[]} />
    </div>
  );
}
