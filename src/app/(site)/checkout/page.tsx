'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useCartStore } from '@/lib/cart-store';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
];

const COUNTRY_OPTIONS = [
  'Nigeria',
  'Ghana',
  'Kenya',
  'South Africa',
  'United Kingdom',
  'United States',
  'Canada',
  'Other',
];

type DeliveryOption = {
  courier: string;
  service: string;
  fee: number;
  estimated_days: string;
};

const formatNaira = (value: number) => {
  const numStr = value.toString();
  return `₦${numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

const PaystackButton = dynamic(() => import('./PaystackButton'), {
  ssr: false,
  loading: () => (
    <button
      type="button"
      disabled
      className="w-full bg-neutral-300 py-4 text-sm uppercase tracking-widest text-neutral-600"
    >
      Loading payment...
    </button>
  ),
});

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();

  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [customCountry, setCustomCountry] = useState('');
  const [state, setState] = useState('');
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<number | null>(null);
  const [loadingDelivery, setLoadingDelivery] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'delivery' | 'pickup'>('delivery');

  const resolvedCountry = country === 'Other' ? customCountry.trim() : country;
  const isNigeria = resolvedCountry.toLowerCase() === 'nigeria';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch delivery options when state changes
  useEffect(() => {
    if (!state || !resolvedCountry) {
      setDeliveryOptions([]);
      setSelectedDelivery(null);
      return;
    }

    const fetchDelivery = async () => {
      setLoadingDelivery(true);
      setSelectedDelivery(null);
      try {
        const res = await fetch('/api/delivery/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state, city, subtotal, country: resolvedCountry || 'Nigeria' }),
        });
        const data = await res.json();
        if (data.options) {
          setDeliveryOptions(data.options as DeliveryOption[]);
          if (data.options.length === 1) {
            setSelectedDelivery(0);
          }
        }
      } catch {
        setDeliveryOptions([]);
      } finally {
        setLoadingDelivery(false);
      }
    };

    fetchDelivery();
  }, [state, city, subtotal, resolvedCountry]);

  const deliveryFee =
    fulfillmentMethod === 'pickup'
      ? 0
      : selectedDelivery !== null
      ? deliveryOptions[selectedDelivery]?.fee ?? 0
      : 0;
  const total = subtotal + deliveryFee;

  const isFormValid =
    email.trim() !== '' &&
    firstName.trim() !== '' &&
    items.length > 0 &&
    (fulfillmentMethod === 'pickup' ||
      (address.trim() !== '' &&
        city.trim() !== '' &&
        resolvedCountry !== '' &&
        state !== '' &&
        selectedDelivery !== null));

  const handlePaymentSuccess = async (ref: { reference: string }) => {
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          customer_email: email.trim(),
          customer_phone: whatsapp.trim(),
          customer_whatsapp: whatsapp.trim(),
          delivery_address:
            fulfillmentMethod === 'pickup'
              ? { pickup: true, note: 'Customer will collect in-store (Lagos)' }
              : {
                  street: address.trim(),
                  apartment: apartment.trim(),
                  city: city.trim(),
                  state,
                  country: resolvedCountry || 'Nigeria',
                },
          items: items.map((item) => ({
            product_id: item.product_id,
            variant_id: item.variant_id,
            product_name: item.product_name,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
          delivery_fee: deliveryFee,
          payment_method: 'paystack_online',
          payment_reference: ref.reference,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to create order');
      }

      clearCart();
      router.push(`/checkout/success?order=${data.order_number}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please contact us.');
      setSubmitting(false);
    }
  };

  const handlePaymentClose = () => {
    // User closed Paystack modal — do nothing
  };

  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm uppercase tracking-widest text-neutral-400">Loading checkout...</p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <h1 className="mb-4 text-2xl font-light uppercase tracking-widest">Your cart is empty</h1>
        <a
          href="/shop"
          className="border border-black px-8 py-3 text-sm uppercase tracking-widest transition-colors hover:bg-black hover:text-white"
        >
          Continue Shopping
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl bg-white px-6 py-16 text-black md:px-12">
      <h1 className="mb-12 text-3xl font-light uppercase tracking-widest">Checkout</h1>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
        {/* Left — Form */}
        <div className="space-y-12">
          {/* Fulfillment Method */}
          <section>
            <h2 className="mb-6 text-xl font-light uppercase tracking-widest">How would you like to receive your order?</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFulfillmentMethod('delivery')}
                className={`border p-4 text-left transition-colors ${
                  fulfillmentMethod === 'delivery'
                    ? 'border-black bg-neutral-50'
                    : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <p className="text-sm font-medium uppercase tracking-widest">Delivery</p>
                <p className="mt-1 text-xs text-neutral-500">Ship to your address</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFulfillmentMethod('pickup');
                  setDeliveryOptions([]);
                  setSelectedDelivery(null);
                }}
                className={`border p-4 text-left transition-colors ${
                  fulfillmentMethod === 'pickup'
                    ? 'border-black bg-neutral-50'
                    : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <p className="text-sm font-medium uppercase tracking-widest">Pick Up</p>
                <p className="mt-1 text-xs text-neutral-500">Collect in Lagos · Free</p>
              </button>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="mb-6 text-xl font-light uppercase tracking-widest">Contact</h2>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-neutral-300 p-3 text-sm transition-colors focus:border-black focus:outline-none"
              />
              <input
                type="tel"
                placeholder="WhatsApp Number"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full border border-neutral-300 p-3 text-sm transition-colors focus:border-black focus:outline-none"
              />
            </div>
          </section>

          {/* Details */}
          <section>
            <h2 className="mb-6 text-xl font-light uppercase tracking-widest">
              {fulfillmentMethod === 'pickup' ? 'Your Details' : 'Delivery'}
            </h2>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name *"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full border border-neutral-300 p-3 transition-colors focus:border-black focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-neutral-300 p-3 transition-colors focus:border-black focus:outline-none"
                />
              </div>

              {fulfillmentMethod === 'pickup' ? (
                <div className="border border-neutral-200 bg-neutral-50 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest">Pick Up — Lagos</p>
                  <p className="text-neutral-600">
                    We&apos;ll send the pickup address and available times to your WhatsApp once your order is confirmed.
                    Make sure your WhatsApp number is filled in above.
                  </p>
                  <p className="mt-2 text-xs text-neutral-400">Walk-in space · No delivery fee</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4">
                    <select
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        setState('');
                        setDeliveryOptions([]);
                        setSelectedDelivery(null);
                      }}
                      className="w-full border border-neutral-300 bg-white p-3 transition-colors focus:border-black focus:outline-none"
                    >
                      {COUNTRY_OPTIONS.map((entry) => (
                        <option key={entry} value={entry}>
                          {entry}
                        </option>
                      ))}
                    </select>
                    {country === 'Other' ? (
                      <input
                        type="text"
                        placeholder="Country *"
                        value={customCountry}
                        onChange={(e) => setCustomCountry(e.target.value)}
                        required
                        className="w-full border border-neutral-300 p-3 transition-colors focus:border-black focus:outline-none"
                      />
                    ) : null}
                  </div>
                  <input
                    type="text"
                    placeholder="Address *"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full border border-neutral-300 p-3 transition-colors focus:border-black focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Apartment, suite, etc. (optional)"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    className="w-full border border-neutral-300 p-3 transition-colors focus:border-black focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="City *"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full border border-neutral-300 p-3 transition-colors focus:border-black focus:outline-none"
                    />
                    {isNigeria ? (
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full border border-neutral-300 bg-white p-3 transition-colors focus:border-black focus:outline-none"
                      >
                        <option value="">State *</option>
                        {NIGERIAN_STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="State/Province *"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                        className="w-full border border-neutral-300 p-3 transition-colors focus:border-black focus:outline-none"
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Delivery Options — only shown for delivery method */}
          {fulfillmentMethod === 'delivery' && state && (
            <section>
              <h2 className="mb-6 text-xl font-light uppercase tracking-widest">Shipping</h2>
              {loadingDelivery ? (
                <p className="text-sm text-neutral-500">Calculating delivery options...</p>
              ) : deliveryOptions.length > 0 ? (
                <div className="space-y-3">
                  {deliveryOptions.map((opt, index) => (
                    <label
                      key={`${opt.courier}-${opt.service}`}
                      className={`flex cursor-pointer items-center justify-between border p-4 transition-colors ${
                        selectedDelivery === index
                          ? 'border-black bg-neutral-50'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="delivery"
                          checked={selectedDelivery === index}
                          onChange={() => setSelectedDelivery(index)}
                          className="accent-black"
                        />
                        <div>
                          <span className="text-sm font-medium">{opt.service}</span>
                          <span className="ml-2 text-xs text-neutral-500">
                            ({opt.courier} &middot; {opt.estimated_days})
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-medium">{formatNaira(opt.fee)}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500">No delivery options available for this state.</p>
              )}
            </section>
          )}

          {/* Payment */}
          <section>
            {error && (
              <p className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}
            <PaystackButton
              email={email}
              amount={total}
              onSuccess={handlePaymentSuccess}
              onClose={handlePaymentClose}
              disabled={!isFormValid || submitting}
            />
            {!isFormValid && (
              <p className="mt-3 text-center text-xs text-neutral-400">
                Fill in all required fields and select a delivery option to continue
              </p>
            )}
            {submitting && (
              <p className="mt-3 text-center text-xs text-neutral-500">
                Creating your order...
              </p>
            )}
          </section>
        </div>

        {/* Right — Order Summary */}
        <div className="sticky top-8 h-max bg-neutral-50 p-8">
          <h2 className="mb-6 text-sm font-medium uppercase tracking-widest">Order Summary</h2>
          <div className="mb-8 space-y-4 border-b border-neutral-200 pb-8">
            {items.map((item) => (
              <div key={item.variant_id} className="flex gap-4 text-sm">
                <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden bg-neutral-200">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.product_name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : null}
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] text-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex flex-1 justify-between">
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-widest">{item.product_name}</p>
                    <p className="text-neutral-500">
                      {item.size}
                      {item.color && item.color !== 'Default' ? ` / ${item.color}` : ''}
                    </p>
                  </div>
                  <p>{formatNaira(item.unit_price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Subtotal</span>
              <span>{formatNaira(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">
                {fulfillmentMethod === 'pickup' ? 'Pick Up' : 'Delivery'}
              </span>
              <span>
                {fulfillmentMethod === 'pickup'
                  ? 'Free'
                  : selectedDelivery !== null
                  ? formatNaira(deliveryFee)
                  : 'Select state'}
              </span>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-4 text-base font-bold">
              <span>Total</span>
              <span>{formatNaira(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
