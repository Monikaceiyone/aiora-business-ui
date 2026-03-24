import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

function getPublicOrigin(request: NextRequest): string {
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const forwardedHost = request.headers.get('x-forwarded-host');

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    return appUrl;
  }

  const requestUrl = new URL(request.url);
  return requestUrl.origin;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const nextParam = url.searchParams.get('next') || '/dashboard';
  const nextPath =
    nextParam.startsWith('/') && !nextParam.startsWith('//')
      ? nextParam
      : '/dashboard';
  const publicOrigin = getPublicOrigin(request);

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL('/login?error=oauth_exchange_failed', publicOrigin));
    }
  }

  return NextResponse.redirect(new URL(nextPath, publicOrigin));
}

