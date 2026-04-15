import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/meta-config';

export const metadata: Metadata = buildMetadata('coreSuite');

export default function CoreSuiteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
