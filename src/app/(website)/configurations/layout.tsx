import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/meta-config';

export const metadata: Metadata = buildMetadata('configurations');

export default function ConfigurationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
