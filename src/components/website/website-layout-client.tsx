'use client';

import { usePathname } from 'next/navigation';
import { Navigation } from '@/components/website/navigation';
import { Footer } from '@/components/website/footer';

export function WebsiteLayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLockedPage = pathname === '/core-suite';

    if (isLockedPage) {
        return (
            <div className="h-[100dvh] w-full bg-white text-black font-sans flex flex-col overflow-hidden relative">
                <Navigation />
                <main className="flex-1 w-full relative z-0 overflow-hidden pt-20 pb-32">
                    {children}
                </main>
                <div className="absolute bottom-0 left-0 w-full z-50">
                    <Footer />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white text-black font-sans relative">
            <Navigation />
            <main className="w-full relative z-0 pt-20">
                {children}
            </main>
            <Footer />
        </div>
    );
}
