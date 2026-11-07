import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'cV3rS3cr3tK3y!2024#CricVerseApp$Secure';
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('cv_token')?.value;

    let isAuthenticated = false;
    let userRole = 'user';

    if (token) {
        try {
            const { payload } = await jwtVerify(token, secret);
            if (payload && payload.id) {
                isAuthenticated = true;
                userRole = payload.role || 'user';
            }
        } catch {
            isAuthenticated = false;
        }
    }

    const isAuthPage = pathname === '/login' || pathname === '/register';

    // 1. If already authenticated and trying to access /login or /register, redirect away immediately
    if (isAuthenticated && isAuthPage) {
        const destination = userRole === 'admin' ? '/admin/products' : '/dashboard';
        return NextResponse.redirect(new URL(destination, request.url));
    }

    // 2. Define protected routes that require a logged-in session
    const isProtectedRoute =
        pathname === '/dashboard' ||
        pathname.startsWith('/dashboard/') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/profile') ||
        pathname.startsWith('/orders') ||
        pathname.startsWith('/teams') ||
        pathname.startsWith('/tournaments/create') ||
        pathname.startsWith('/matches/create') ||
        pathname.includes('/score') ||
        pathname.includes('/toss') ||
        pathname.includes('/start-innings');

    // If unauthenticated user tries to visit a protected route, redirect to /login
    if (!isAuthenticated && isProtectedRoute) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // 3. Admin-only route protection
    if (isAuthenticated && pathname.startsWith('/admin') && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - static image/asset extensions
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp)$).*)',
    ],
};

