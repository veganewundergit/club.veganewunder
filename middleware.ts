import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/password', '/api/set-cookie'];
const PASSWORD_COOKIE_NAME = 'club_pw';

function isAssetPath(pathname: string) {
  if (pathname.startsWith('/_next')) return true;
  if (pathname.startsWith('/static')) return true;
  if (pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|js|css)$/i)) return true;
  return false;
}

function isPublicPath(pathname: string) {
  if (isAssetPath(pathname)) return true;
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

export function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request;
  const { pathname } = nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (process.env.NEXT_PUBLIC_DEV_BYPASS === 'true') {
    return NextResponse.next();
  }

  const expectedPassword = process.env.CLUB_PASSWORD;

  if (!expectedPassword) {
    console.warn('CLUB_PASSWORD is not configured. Skipping password middleware.');
    return NextResponse.next();
  }

  const cookieValue = cookies.get(PASSWORD_COOKIE_NAME)?.value;
  if (cookieValue === expectedPassword) {
    return NextResponse.next();
  }

  const redirectUrl = nextUrl.clone();
  redirectUrl.pathname = '/password';
  redirectUrl.searchParams.set('redirectTo', `${pathname}${nextUrl.search}`);

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|js|css)$).*)']
};
