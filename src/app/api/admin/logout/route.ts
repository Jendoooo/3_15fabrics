import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true });
    response.cookies.set({
        name: '315fabrics_admin_session',
        value: '',
        httpOnly: true,
        path: '/', // Match the path used when setting the cookie
        maxAge: 0,
    });
    return response;
}
