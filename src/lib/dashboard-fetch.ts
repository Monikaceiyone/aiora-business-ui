/**
 * dashboardFetch — a thin fetch wrapper for internal Next.js API routes.
 * Automatically prepends NEXT_PUBLIC_APP_URL when called from the server,
 * and uses relative paths on the client (where window is defined).
 *
 * Usage:
 *   const res = await dashboardFetch('/api/usage/seller-001');
 *   const data = await res.json();
 */
export async function dashboardFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  // On the server we need an absolute URL; on the client relative is fine.
  const base =
    typeof window === 'undefined'
      ? (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')
      : '';

  const url = path.startsWith('http') ? path : `${base}${path}`;

  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
}
