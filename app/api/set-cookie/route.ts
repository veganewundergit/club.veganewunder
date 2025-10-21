import { NextResponse } from 'next/server';

const COOKIE_NAME = 'club_pw';
const WEEK_IN_SECONDS = 60 * 60 * 24 * 7;

interface SetCookiePayload {
  password?: string;
  redirectTo?: string;
}

function isSafeRedirect(target: string | undefined) {
  if (!target) return false;
  return target.startsWith('/');
}

export async function POST(request: Request) {
  let body: SetCookiePayload;

  try {
    body = (await request.json()) as SetCookiePayload;
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request payload.' }, { status: 400 });
  }

  const expectedPassword = process.env.CLUB_PASSWORD;

  if (!expectedPassword) {
    return NextResponse.json(
      {
        success: false,
        message: 'Server configuration missing. CLUB_PASSWORD is not set.'
      },
      { status: 500 }
    );
  }

  if (!body.password || body.password !== expectedPassword) {
    return NextResponse.json(
      {
        success: false,
        message: 'Ungültiges Passwort.'
      },
      { status: 401 }
    );
  }

  const redirectTo = isSafeRedirect(body.redirectTo) ? body.redirectTo : '/';

  const response = NextResponse.json({
    success: true,
    redirectTo
  });

  response.cookies.set({
    name: COOKIE_NAME,
    value: expectedPassword,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: WEEK_IN_SECONDS,
    path: '/'
  });

  return response;
}
