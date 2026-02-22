import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/orders/route';
import { mockSupabase } from '../setup';

describe('POST /api/orders', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 400 if items are missing or empty', async () => {
        const request = new Request('http://localhost:3000/api/orders', {
            method: 'POST',
            body: JSON.stringify({
                customer_name: 'Test',
                items: []
            })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Order items are required');
    });

    it('generates order number in IBY-YYYYXXXX format and inserts it', async () => {
        const year = new Date().getFullYear();
        // Mock order number query sequence
        mockSupabase.limit.mockResolvedValueOnce({ data: [] });

        // Mock order insert: insert() returns the chainable mock, single() resolves it
        mockSupabase.insert.mockReturnValueOnce(mockSupabase);
        mockSupabase.single.mockResolvedValueOnce({ data: { id: 'uuid-123', order_number: `IBY-${year}0001` }, error: null });

        // Mock items insert: insert() resolves directly
        mockSupabase.insert.mockResolvedValueOnce({ error: null });

        // Mock customer upsert: upsert() resolves directly
        mockSupabase.upsert.mockResolvedValueOnce({ error: null });

        const request = new Request('http://localhost:3000/api/orders', {
            method: 'POST',
            body: JSON.stringify({
                customer_name: 'Test User',
                customer_email: 'test@example.com',
                delivery_address: {},
                delivery_fee: 2500,
                items: [
                    { product_id: 'prod-1', quantity: 1, unit_price: 10000, product_name: 'Test Prod' }
                ],
                payment_method: 'bank_transfer'
            })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.order_number).toBe(`IBY-${year}0001`);
        expect(data.order_id).toBe('uuid-123');
    });
});
