import { NextResponse } from 'next/server';
import { DEV_AUTH_ENABLED, DEV_SELLER } from '@/lib/dev-auth';

// GET /api/auth/magic-session
// In dev mode (NEXT_PUBLIC_SKIP_AUTH=true), returns a mock seller session.
// In production this route returns 404 — real magic sessions are handled
// via the /access/[token] route using signed JWT cookies.
export async function GET() {
  if (!DEV_AUTH_ENABLED) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ seller: DEV_SELLER });
}

// DELETE /api/auth/magic-session — logout (no-op in dev, clears cookie in prod)
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('magic_session');
  return response;
}
