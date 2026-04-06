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
