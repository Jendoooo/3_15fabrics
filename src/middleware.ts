import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const adminSession = request.cookies.get('iby_admin_session')?.value;
    const isLoginPage = request.nextUrl.pathname === '/admin/login';

    // Allow access to login page
    if (isLoginPage) {
        if (adminSession && adminSession === process.env.ADMIN_SESSION_SECRET) {
            return NextResponse.redirect(new URL('/admin/orders', request.url));
        }
        return NextResponse.next();
    }

    // Check auth for all other /admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!adminSession || adminSession !== process.env.ADMIN_SESSION_SECRET) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
