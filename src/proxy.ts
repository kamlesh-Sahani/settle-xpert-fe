import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/login',
  '/verify-otp',
  '/verify',
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets, next internal routes, and direct files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // A session is considered active if either the access_token OR the long-lived refresh_token exists
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const isAuthenticated = Boolean(accessToken || refreshToken);

  // If unauthenticated and attempting to access a protected route -> redirect to login
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated and attempting to access public auth pages -> redirect to default dashboard
  // Only redirect if not explicitly directed to login via callbackUrl
  const hasCallbackUrl = request.nextUrl.searchParams.has('callbackUrl');
  if (isAuthenticated && !hasCallbackUrl && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
