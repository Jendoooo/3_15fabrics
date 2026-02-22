// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const initializePaymentMock = vi.fn();
const usePaystackPaymentMock = vi.fn(() => initializePaymentMock);

vi.mock('react-paystack', () => ({
  usePaystackPayment: (config: unknown) => usePaystackPaymentMock(config),
}));

import PaystackButton from '@/app/(site)/checkout/PaystackButton';

describe('PaystackButton', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    initializePaymentMock.mockReset();
    usePaystackPaymentMock.mockClear();
  });

  it('renders with formatted amount text', () => {
    render(
      <PaystackButton
        email="test@example.com"
        amount={45000}
        onSuccess={vi.fn()}
        onClose={vi.fn()}
        disabled={false}
      />
    );

    expect(screen.getByRole('button')).toHaveTextContent(/Pay .*45,000/);
  });

  it('respects disabled state', () => {
    render(
      <PaystackButton
        email="test@example.com"
        amount={45000}
        onSuccess={vi.fn()}
        onClose={vi.fn()}
        disabled
      />
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading text when amount is 0', () => {
    render(
      <PaystackButton
        email="test@example.com"
        amount={0}
        onSuccess={vi.fn()}
        onClose={vi.fn()}
        disabled={false}
      />
    );

    expect(screen.getByRole('button')).toHaveTextContent('Loading payment...');
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls initializePayment on click when enabled', () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <PaystackButton
        email="test@example.com"
        amount={15000}
        onSuccess={onSuccess}
        onClose={onClose}
        disabled={false}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(initializePaymentMock).toHaveBeenCalledTimes(1);
    expect(initializePaymentMock).toHaveBeenCalledWith({ onSuccess, onClose });
  });
});
