import { NextResponse } from 'next/server';

export function proxy() {
  const response = NextResponse.next();
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://vercel.live https://*.vercel.live",
    "script-src-elem 'self' 'unsafe-inline' https://vercel.live https://*.vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https://vercel.live https://*.vercel.live",
  ].join('; ');

  response.headers.set(
    'Content-Security-Policy',
    csp
  );
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains'
    );
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
