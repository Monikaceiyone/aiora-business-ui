import { Navigation } from '@/components/website/navigation';
import { Footer } from '@/components/website/footer';
import { WebsiteLayoutClient } from '@/components/website/website-layout-client';

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
