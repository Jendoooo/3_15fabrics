'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase';

const NIGERIAN_STATES = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo',
    'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
    'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
    'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT - Abuja'
];

type ProductSearch = { id: string; name: string; price: number };
type VariantInfo = { id: string; size: string | null; color: string | null; stock_quantity: number };
type OrderItemDraft = {
    product_id: string;
    variant_id: string;
    product_name: string;
    size: string | null;
    color: string | null;
    quantity: number;
    yardsOrdered?: number;
    unit_price: number;
};

export default function ManualOrderEntryPage() {
    const [source, setSource] = useState('instagram');
    const [customerName, setCustomerName] = useState('');
    const [phone, setPhone] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [email, setEmail] = useState('');

    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('Lagos');

    const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
    const [notes, setNotes] = useState('');

    // Items search & selection
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<ProductSearch[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<ProductSearch | null>(null);
    const [variants, setVariants] = useState<VariantInfo[]>([]);
    const [selectedVariantId, setSelectedVariantId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [yardsOrdered, setYardsOrdered] = useState<number | ''>('');

    const [items, setItems] = useState<OrderItemDraft[]>([]);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successOrder, setSuccessOrder] = useState<{ id: string; number: string } | null>(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length >= 2) {
                const { data } = await supabaseBrowser
                    .from('products')
                    .select('id, name, price')
                    .ilike('name', `%${searchTerm}%`)
                    .limit(5);
                setSearchResults((data as ProductSearch[]) || []);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const selectProduct = async (p: ProductSearch) => {
        setSelectedProduct(p);
        setSearchTerm('');
        setSearchResults([]);

        const { data } = await supabaseBrowser
            .from('product_variants')
            .select('id, size, color, stock_quantity')
            .eq('product_id', p.id);

        const vars = (data as VariantInfo[]) || [];
        setVariants(vars);
        if (vars.length > 0) setSelectedVariantId(vars[0].id);
    };

    const addItem = () => {
        if (!selectedProduct || !selectedVariantId) return;
        const variant = variants.find(v => v.id === selectedVariantId);
        if (!variant) return;

        setItems(prev => [...prev, {
            product_id: selectedProduct.id,
            variant_id: selectedVariantId,
            product_name: selectedProduct.name,
            size: variant.size,
            color: variant.color,
            quantity,
            yardsOrdered: typeof yardsOrdered === 'number' ? yardsOrdered : quantity,
            unit_price: selectedProduct.price
        }]);

        setSelectedProduct(null);
        setVariants([]);
        setSelectedVariantId('');
        setQuantity(1);
        setYardsOrdered('');
    };

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) {
            setError('Please add at least one item');
            return;
        }

        setSaving(true);
        setError('');

        const payload = {
            customer_name: customerName,
            customer_email: email || null,
            customer_phone: phone || null,
            customer_whatsapp: whatsapp || null,
            delivery_address: { street, city, state },
            items: items.map(i => ({ ...i, yards_ordered: i.yardsOrdered ?? i.quantity })),
            delivery_fee: 0, // Simplified for manual entry
            payment_method: paymentMethod,
            source
        };

        try {
            const resp = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await resp.json();

            if (!resp.ok) throw new Error(data.error || 'Failed to submit order');

            if (notes) {
                await supabaseBrowser.from('orders').update({ notes }).eq('id', data.order_id);
            }

            setSuccessOrder({ id: data.order_id, number: data.order_number });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setSaving(false);
        }
    };

    if (successOrder) {
        return (
            <div className="p-5 md:p-8 flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-6 rounded-full bg-green-100 p-4">
                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-3xl font-light uppercase tracking-widest mb-4">Order Created</h1>
                <p className="text-4xl font-mono mb-8">{successOrder.number}</p>
                <div className="flex gap-4">
                    <Link href={`/admin/orders/${successOrder.id}`} className="bg-black px-6 py-3 text-sm uppercase tracking-widest text-white hover:bg-neutral-800">
                        View Order
                    </Link>
                    <button onClick={() => window.location.reload()} className="px-6 py-3 text-sm uppercase tracking-widest text-neutral-500 hover:text-black">
                        New Order
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-5 md:p-8 max-w-5xl mx-auto">
            <h1 className="text-xl font-light uppercase tracking-widest mb-8">Manual Order Entry</h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-xs uppercase tracking-widest text-neutral-500">Customer Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="mb-1 block text-xs uppercase tracking-widest">Source *</label>
                                <select value={source} onChange={e => setSource(e.target.value)} className="w-full border border-neutral-300 p-2 text-sm bg-white">
                                    <option value="instagram">Instagram</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="walk_in">Walk-in</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1 block text-xs uppercase tracking-widest">Full Name *</label>
                                <input required value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full border border-neutral-300 p-2 text-sm" />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs uppercase tracking-widest">Phone</label>
                                <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full border border-neutral-300 p-2 text-sm" />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs uppercase tracking-widest">WhatsApp</label>
                                <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full border border-neutral-300 p-2 text-sm" />
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1 block text-xs uppercase tracking-widest">Email</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-neutral-300 p-2 text-sm" />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xs uppercase tracking-widest text-neutral-500">Delivery Address</h2>
                        <div>
                            <label className="mb-1 block text-xs uppercase tracking-widest">Street Address</label>
                            <input value={street} onChange={e => setStreet(e.target.value)} className="w-full border border-neutral-300 p-2 text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-xs uppercase tracking-widest">City</label>
                                <input value={city} onChange={e => setCity(e.target.value)} className="w-full border border-neutral-300 p-2 text-sm" />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs uppercase tracking-widest">State</label>
                                <select value={state} onChange={e => setState(e.target.value)} className="w-full border border-neutral-300 p-2 text-sm bg-white">
                                    {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs uppercase tracking-widest">Notes</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full border border-neutral-300 p-2 text-sm resize-none" />
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xs uppercase tracking-widest text-neutral-500">Payment</h2>
                        <div>
                            <label className="mb-1 block text-xs uppercase tracking-widest">Payment Method *</label>
                            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full border border-neutral-300 p-2 text-sm bg-white">
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="cash">Cash</option>
                                <option value="pos_terminal">POS Terminal</option>
                            </select>
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <section className="space-y-4">
                        <h2 className="text-xs uppercase tracking-widest text-neutral-500">Order Items</h2>

                        <div className="bg-neutral-50 border border-neutral-200 p-4 space-y-4">
                            {!selectedProduct ? (
                                <div className="relative">
                                    <label className="mb-1 block text-xs uppercase tracking-widest">Search Product</label>
                                    <input
                                        placeholder="Type name..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full border border-neutral-300 p-2 text-sm focus:border-black focus:outline-none"
                                    />
                                    {searchResults.length > 0 && (
                                        <div className="absolute top-16 left-0 right-0 bg-white border border-neutral-200 shadow-xl z-10">
                                            {searchResults.map(p => (
                                                <button key={p.id} type="button" onClick={() => selectProduct(p)} className="w-full text-left px-4 py-2 hover:bg-neutral-50 text-sm">
                                                    {p.name} - ₦{p.price.toLocaleString()}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-sm">{selectedProduct.name}</span>
                                        <button type="button" onClick={() => setSelectedProduct(null)} className="text-xs underline text-neutral-500">Change</button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1 block text-[10px] uppercase tracking-widest">Variant</label>
                                            <select value={selectedVariantId} onChange={e => setSelectedVariantId(e.target.value)} className="w-full border border-neutral-300 p-2 text-sm bg-white">
                                                {variants.map(v => (
                                                    <option key={v.id} value={v.id}>
                                                        {v.size || 'N/A'} {v.color ? `(${v.color})` : ''} - {v.stock_quantity} in stock
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-[10px] uppercase tracking-widest">Qty / Yards</label>
                                            <div className="flex gap-2">
                                                <input type="number" min="1" placeholder="Qty" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} className="w-1/2 border border-neutral-300 p-2 text-sm" />
                                                <input type="number" min="0" step="0.5" placeholder="Yards" value={yardsOrdered} onChange={e => setYardsOrdered(e.target.value ? parseFloat(e.target.value) : '')} className="w-1/2 border border-neutral-300 p-2 text-sm" />
                                            </div>
                                        </div>
                                    </div>

                                    <button type="button" onClick={addItem} className="w-full bg-black text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-neutral-800">
                                        Add to Order
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="border border-neutral-200">
                            {items.length === 0 ? (
                                <p className="p-4 text-center text-sm text-neutral-400">No items added</p>
                            ) : (
                                <ul className="divide-y divide-neutral-200">
                                    {items.map((item, i) => (
                                        <li key={i} className="flex justify-between items-center p-4">
                                            <div>
                                                <p className="text-sm font-medium">{item.product_name}</p>
                                                <p className="text-xs text-neutral-500">
                                                    {item.size || 'Standard'} {item.color ? `(${item.color})` : ''} &bull; Qty {item.quantity} &bull; {item.yardsOrdered} Yards
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm">₦{(item.quantity * item.unit_price).toLocaleString()}</span>
                                                <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 text-sm">×</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="flex border-t border-black pt-4 justify-between items-end">
                            <span className="uppercase tracking-widest text-xs">Total</span>
                            <span className="text-xl">₦{subtotal.toLocaleString()}</span>
                        </div>
                    </section>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button type="submit" disabled={saving || items.length === 0} className="w-full bg-black text-white px-4 py-4 text-sm uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50 mt-8">
                        {saving ? 'Creating Order...' : 'Submit Order'}
                    </button>
                </div>
            </form>
        </div>
    );
}
