'use client';

import { usePaystackPayment } from 'react-paystack';

const formatNaira = (value: number) => {
  const numStr = value.toString();
  return `₦${numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

type PaystackButtonProps = {
  email: string;
  amount: number;
  onSuccess: (ref: { reference: string }) => void;
  onClose: () => void;
  disabled: boolean;
};

export default function PaystackButton({
  email,
  amount,
  onSuccess,
  onClose,
  disabled,
}: PaystackButtonProps) {
  const isLoadingAmount = amount <= 0;
  const isDisabled = disabled || isLoadingAmount;

  const config = {
    reference: `IBY-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    email,
    amount: amount * 100, // Paystack uses kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? '',
    currency: 'NGN',
  };

  const initializePayment = usePaystackPayment(config);

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => initializePayment({ onSuccess, onClose })}
      className="w-full bg-black py-4 text-sm uppercase tracking-widest text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600"
    >
      {isLoadingAmount ? 'Loading payment...' : `Pay ${formatNaira(amount)}`}
    </button>
  );
}
