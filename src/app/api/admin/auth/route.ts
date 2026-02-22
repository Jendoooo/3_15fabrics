import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { password } = await req.json();

        const correctPassword = process.env.ADMIN_PASSWORD;
        const sessionSecret = process.env.ADMIN_SESSION_SECRET;

        if (!correctPassword || !sessionSecret) {
            console.error('Missing ADMIN_PASSWORD or ADMIN_SESSION_SECRET in environment variables');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        if (password === correctPassword) {
            const response = NextResponse.json({ success: true }, { status: 200 });

            response.cookies.set({
                name: 'iby_admin_session',
                value: sessionSecret,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/', // Must be '/' so cookie is sent to /api/admin/* routes too
                maxAge: 86400 * 7, // 1 week
            });

            return response;
        }

        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    } catch (error) {
        console.error('Admin Auth Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
