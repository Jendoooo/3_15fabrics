import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const cookieStore = cookies();
        const adminSession = cookieStore.get('iby_admin_session')?.value;

        if (!adminSession || adminSession !== process.env.ADMIN_SESSION_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const [
            { data: revenueData },
            { count: totalOrders },
            { count: totalProducts },
            { count: todayOrders },
            { count: totalContacts }
        ] = await Promise.all([
            supabaseServer.from('orders').select('total').eq('payment_status', 'paid'),
            supabaseServer.from('orders').select('*', { count: 'exact', head: true }),
            supabaseServer.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            supabaseServer.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
            supabaseServer.from('contacts').select('*', { count: 'exact', head: true })
        ]);

        const totalRevenue = (revenueData || []).reduce((sum, order) => sum + (Number(order.total) || 0), 0);

        return NextResponse.json({
            totalRevenue,
            totalOrders: totalOrders || 0,
            totalProducts: totalProducts || 0,
            todayOrders: todayOrders || 0,
            totalContacts: totalContacts || 0,
        });
    } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
