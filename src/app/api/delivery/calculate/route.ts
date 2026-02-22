import { NextResponse } from 'next/server';

interface DeliveryCalculateRequest {
    state?: string;
    city?: string;
    subtotal?: number;
    country?: string;
}

export async function POST(request: Request) {
    try {
        const body: DeliveryCalculateRequest = await request.json();
        const { state, country = 'Nigeria' } = body;

        // Hardcoded delivery options for now depending on location
        let options = [];

        if (country.toLowerCase() !== 'nigeria') {
            options = [
                {
                    courier: 'DHL Express',
                    service: 'International Express',
                    fee: 25000,
                    estimated_days: '7-14 business days'
                },
                {
                    courier: '3:15 Fabrics',
                    service: 'International Standard',
                    fee: 15000,
                    estimated_days: '14-21 business days'
                }
            ];
        } else {
            const isLagos = state && state.toLowerCase() === 'lagos';

            if (isLagos) {
                options = [
                    {
                        courier: '3:15 Fabrics Delivery',
                        service: 'Same-day Delivery',
                        fee: 3500,
                        estimated_days: '0-1 days'
                    },
                    {
                        courier: 'Standard',
                        service: 'Next-day Delivery',
                        fee: 2500,
                        estimated_days: '1-2 days'
                    }
                ];
            } else {
                options = [
                    {
                        courier: 'GIG Logistics / Sendbox',
                        service: 'Nationwide Delivery',
                        fee: 5000,
                        estimated_days: '3-5 days'
                    }
                ];
            }
        }

        return NextResponse.json({ options }, { status: 200 });
    } catch (err) {
        console.error('Delivery calculation error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
