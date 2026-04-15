import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/meta-config';

export const metadata: Metadata = buildMetadata('costing');

export default function CostingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
