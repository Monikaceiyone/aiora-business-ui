import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/meta-config';

export const metadata: Metadata = buildMetadata('connect');

export default function ConnectLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
