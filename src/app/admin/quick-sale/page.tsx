'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase';

type ProductSearch = { id: string; name: string; price: number; image_url?: string };
type VariantInfo = { id: string; size: string | null; color: string | null; stock_quantity: number };
type CartItem = {
    product_id: string;
    variant_id: string;
    product_name: string;
    size: string | null;
    color: string | null;
    quantity: number;
    unit_price: number;
};

export default function QuickSalePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<ProductSearch[]>([]);
    const [loadingSearch, setLoadingSearch] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState<ProductSearch | null>(null);
    const [variants, setVariants] = useState<VariantInfo[]>([]);

    const [cart, setCart] = useState<CartItem[]>([]);

    const [customerName, setCustomerName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successOrder, setSuccessOrder] = useState<{ id: string; number: string } | null>(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length >= 2) {
                setLoadingSearch(true);
                const { data } = await supabaseBrowser
                    .from('products')
                    .select('id, name, price')
                    .eq('status', 'active')
                    .ilike('name', `%${searchTerm}%`)
                    .limit(10);
                setProducts((data as ProductSearch[]) || []);
                setLoadingSearch(false);
            } else {
                setProducts([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleProductClick = async (p: ProductSearch) => {
        setSelectedProduct(p);
        const { data } = await supabaseBrowser
            .from('product_variants')
            .select('id, size, color, stock_quantity')
            .eq('product_id', p.id);
        setVariants((data as VariantInfo[]) || []);
    };

    const addVariantToCart = (v: VariantInfo) => {
        if (v.stock_quantity <= 0) return;

        setCart(prev => {
            const existing = prev.find(item => item.variant_id === v.id);
            if (existing) {
                return prev.map(item =>
                    item.variant_id === v.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, {
                product_id: selectedProduct!.id,
                variant_id: v.id,
                product_name: selectedProduct!.name,
                size: v.size,
                color: v.color,
                quantity: 1,
                unit_price: selectedProduct!.price
            }];
        });

        setSelectedProduct(null);
        setVariants([]);
        setSearchTerm('');
        setProducts([]);
    };

    const updateQuantity = (index: number, delta: number) => {
        setCart(prev => {
            const next = [...prev];
            const item = next[index];
            const newQty = item.quantity + delta;
            if (newQty <= 0) return next.filter((_, i) => i !== index);
            next[index] = { ...item, quantity: newQty };
            return next;
        });
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    const handleCompleteSale = async () => {
        if (cart.length === 0) return setError('Cart is empty');
        setSaving(true);
        setError('');

        const payload = {
            customer_name: customerName || 'Walk-in Customer',
            customer_email: null,
            customer_phone: null,
            customer_whatsapp: null,
            delivery_address: { street: 'Store Pickup', city: 'Store', state: 'Lagos' },
            items: cart,
            delivery_fee: 0,
            payment_method: paymentMethod,
            source: 'walk_in'
        };

        try {
            const resp = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await resp.json();

            if (!resp.ok) throw new Error(data.error || 'Failed to complete sale');

            setSuccessOrder({ id: data.order_id, number: data.order_number });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setSaving(false);
        }
    };

    if (successOrder) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6">
                <div className="mb-6 rounded-full bg-green-100 p-6">
                    <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-light uppercase tracking-widest mb-2">Sale Complete</h1>
                <p className="text-4xl font-mono mb-12">{successOrder.number}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-black px-12 py-4 text-sm uppercase tracking-widest text-white w-full max-w-sm hover:bg-neutral-800"
                >
                    New Sale
                </button>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col md:flex-row overflow-hidden">

            {/* Left Panel: Search & Select */}
            <div className="flex-1 flex flex-col border-r border-neutral-200 bg-neutral-50 overflow-hidden">
                <div className="p-4 border-b border-neutral-200 bg-white shadow-sm z-10">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-neutral-300 p-3 text-sm focus:border-black focus:outline-none"
                        autoFocus
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-4 relative">
                    {selectedProduct ? (
                        <div className="space-y-4">
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="text-xs uppercase tracking-widest text-neutral-500 hover:text-black mb-4 flex items-center"
                            >
                                ← Back to search
                            </button>
                            <h2 className="text-lg font-medium">{selectedProduct.name}</h2>
                            <p className="text-neutral-500 mb-6">₦{selectedProduct.price.toLocaleString()}</p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {variants.map(v => (
                                    <button
                                        key={v.id}
                                        onClick={() => addVariantToCart(v)}
                                        disabled={v.stock_quantity <= 0}
                                        className={`p-4 border text-center transition-colors ${v.stock_quantity > 0
                                                ? 'border-neutral-300 bg-white hover:border-black hover:bg-black hover:text-white'
                                                : 'border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <span className="block font-medium text-sm">{v.size || 'STD'}</span>
                                        {v.color && <span className="block text-xs mt-1">{v.color}</span>}
                                        <span className="block text-[10px] mt-2 opacity-60">{v.stock_quantity} left</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {loadingSearch && <p className="col-span-full text-center text-xs text-neutral-400 py-8">Searching...</p>}
                            {!loadingSearch && searchTerm.length >= 2 && products.length === 0 && (
                                <p className="col-span-full text-center text-xs text-neutral-400 py-8">No products found</p>
                            )}
                            {products.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => handleProductClick(p)}
                                    className="bg-white p-4 border border-neutral-200 text-left hover:border-black transition-colors flex flex-col"
                                >
                                    <span className="font-medium text-sm line-clamp-2 leading-snug">{p.name}</span>
                                    <span className="text-neutral-500 text-xs mt-auto pt-2">₦{p.price.toLocaleString()}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel: Cart & Checkout */}
            <div className="w-full md:w-96 flex flex-col bg-white overflow-hidden shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-20">
                <div className="p-4 border-b border-neutral-200 bg-neutral-50">
                    <h2 className="text-sm font-medium uppercase tracking-widest text-center">Current Sale ({cart.reduce((a, b) => a + b.quantity, 0)})</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-neutral-400 text-sm italic">
                            Cart is empty
                        </div>
                    ) : (
                        <ul className="divide-y divide-neutral-100 border-b border-neutral-100 pb-2">
                            {cart.map((item, index) => (
                                <li key={index} className="py-3 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-medium pr-4 leading-snug">{item.product_name}</span>
                                        <span className="text-sm">₦{(item.unit_price * item.quantity).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-neutral-500">
                                            {item.size || 'STD'} {item.color ? `(${item.color})` : ''}
                                        </span>
                                        <div className="flex items-center border border-neutral-200 rounded-sm">
                                            <button onClick={() => updateQuantity(index, -1)} className="px-3 py-1 text-neutral-500 hover:text-black hover:bg-neutral-50 transition-colors">-</button>
                                            <span className="text-xs w-6 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(index, 1)} className="px-3 py-1 text-neutral-500 hover:text-black hover:bg-neutral-50 transition-colors">+</button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="p-4 border-t border-neutral-200 space-y-4 bg-white">
                    <div className="flex justify-between items-end mb-4">
                        <span className="uppercase tracking-widest text-xs text-neutral-500">Total</span>
                        <span className="text-2xl font-light">₦{subtotal.toLocaleString()}</span>
                    </div>

                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Customer Name (Optional)"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full border border-neutral-300 p-3 text-sm focus:border-black focus:outline-none"
                        />

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setPaymentMethod('cash')}
                                className={`p-3 text-xs uppercase tracking-widest border transition-colors ${paymentMethod === 'cash' ? 'border-black bg-black text-white' : 'border-neutral-300 text-neutral-600 hover:border-black hover:text-black'
                                    }`}
                            >
                                Cash
                            </button>
                            <button
                                onClick={() => setPaymentMethod('pos_terminal')}
                                className={`p-3 text-xs uppercase tracking-widest border transition-colors ${paymentMethod === 'pos_terminal' ? 'border-black bg-black text-white' : 'border-neutral-300 text-neutral-600 hover:border-black hover:text-black'
                                    }`}
                            >
                                POS
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-xs text-red-500 text-center">{error}</p>}

                    <button
                        onClick={handleCompleteSale}
                        disabled={saving || cart.length === 0}
                        className="w-full bg-[#111] text-white py-4 text-sm uppercase tracking-widest font-medium hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {saving ? 'Processing...' : 'Complete Sale'}
                    </button>
                </div>
            </div>

        </div>
    );
}
