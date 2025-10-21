import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
const PROTECTED_PREFIX = '/club';

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith(PROTECTED_PREFIX)) {
    return NextResponse.next();
  }

  if (process.env.NEXT_PUBLIC_DEV_BYPASS === 'true') {
    return NextResponse.next();
  }

  // TODO: Ergänze Supabase- und Stripe-Checks, sobald die Logik bereit ist.
  return NextResponse.next();
}

export const config = {
  matcher: ['/club/:path*']
};
