import ProductForm from '../_components/ProductForm';

export default function NewProductPage() {
  return (
    <div className="p-5 md:p-8">
      <h1 className="mb-8 text-xl font-light uppercase tracking-widest">Add Product</h1>
      <ProductForm />
    </div>
  );
}
