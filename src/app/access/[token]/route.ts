// import { NextRequest, NextResponse } from 'next/server';
// import { verifyMagicLinkToken, MAGIC_SESSION_COOKIE } from '@/lib/magic-link';

// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ token: string }> }
// ) {
//   const { token } = await params;
//   const verification = verifyMagicLinkToken(token);

//   if (!verification.valid) {
//     return NextResponse.redirect(new URL('/login?error=invalid_magic_link', request.url));
//   }

//   const response = NextResponse.redirect(new URL('/dashboard', request.url));
//   response.cookies.set(MAGIC_SESSION_COOKIE, token, {
//     httpOnly: true,
//     secure: true,
//     sameSite: 'lax',
//     path: '/',
//     maxAge: Math.max(60, verification.payload.exp - Math.floor(Date.now() / 1000)),
//   });

//   return response;
// }

