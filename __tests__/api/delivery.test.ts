import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/delivery/calculate/route';

describe('POST /api/delivery/calculate', () => {
    it('returns Lagos fees when country is default and state is Lagos', async () => {
        const request = new Request('http://localhost:3000/api/delivery/calculate', {
            method: 'POST',
            body: JSON.stringify({ state: 'Lagos' })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.options).toBeDefined();
        expect(data.options.length).toBe(2);
        expect(data.options[0].courier).toBe('Iby Logistics');
        expect(data.options[1].courier).toBe('Standard');
    });

    it('returns Nationwide fees when state is not Lagos', async () => {
        const request = new Request('http://localhost:3000/api/delivery/calculate', {
            method: 'POST',
            body: JSON.stringify({ state: 'Abuja' })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.options.length).toBe(1);
        expect(data.options[0].courier).toBe('GIG Logistics / Sendbox');
    });

    it('returns International fees when country is not Nigeria', async () => {
        const request = new Request('http://localhost:3000/api/delivery/calculate', {
            method: 'POST',
            body: JSON.stringify({ state: 'Accra', country: 'Ghana' })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.options.length).toBe(2);
        expect(data.options[0].courier).toBe('DHL Express');
        expect(data.options[1].courier).toBe('iby_closet');
    });
});
