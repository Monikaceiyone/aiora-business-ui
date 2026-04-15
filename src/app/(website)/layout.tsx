import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/meta-config';
import { WebsiteLayoutClient } from '@/components/website/website-layout-client';

// Default metadata for the website group (overridden per-page below)
export const metadata: Metadata = buildMetadata('commence');

export default function WebsiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <WebsiteLayoutClient>
            {children}
        </WebsiteLayoutClient>
    );
}
