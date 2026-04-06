'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const tabs: { name: string; href: string; comingSoon?: boolean }[] = [
    { name: 'commence', href: '/' },
    { name: 'core suite', href: '/core-suite' },
    { name: 'configurations', href: '/configurations' },
    { name: 'costing', href: '/costing' },
    { name: 'connect', href: '/connect' },
    { name: 'command center', href: '/dashboard' },
];

export function Navigation() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const isHome = pathname === '/';

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    const handleClick = (e: React.MouseEvent, tab: typeof tabs[0]) => {
        if (tab.comingSoon) {
            e.preventDefault();
            return;
        }
        setIsMobileMenuOpen(false);
    };

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // On homepage, nav overlays the dark video — use white text until scrolled
    const logoColor = !scrolled && isHome ? 'text-white' : 'text-black';
    const linkColor = (active: boolean) =>
        !scrolled && isHome
            ? active ? 'text-white font-bold' : 'text-white/70 hover:text-white'
            : active ? 'text-black font-bold' : 'text-gray-400 hover:text-black';
    const hamburgerColor = !scrolled && isHome ? 'text-white hover:bg-white/10' : 'text-black hover:bg-gray-100';

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled
                        ? 'bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm'
                        : 'bg-transparent'
                }`}
            >
                <div className="w-full px-6 md:px-12 h-20 relative flex items-center justify-between">
                    <div className="flex-shrink-0 z-20">
                        <Link href="/" className={`text-2xl font-black tracking-tight transition-colors ${logoColor}`}>
                            ai.ora
                        </Link>
                    </div>

                    <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center gap-8 py-2 z-10">
                        {tabs.map((tab) => (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                onClick={(e) => handleClick(e, tab)}
                                className={`text-sm font-medium tracking-wide uppercase transition-all duration-300 whitespace-nowrap
                                    ${linkColor(isActive(tab.href))}
                                    ${tab.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                {tab.name}
                            </Link>
                        ))}
                    </div>

                    <div className="md:hidden z-20">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={`p-2 rounded-full transition-colors ${hamburgerColor}`}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    <div className="hidden md:block w-8" />
                </div>
            </nav>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-white pt-24 px-6 pb-8 md:hidden flex flex-col items-center justify-start space-y-6 overflow-y-auto"
                    >
                        {tabs.map((tab, idx) => (
                            <motion.div
                                key={tab.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="w-full text-center"
                            >
                                <Link
                                    href={tab.href}
                                    onClick={(e) => handleClick(e, tab)}
                                    className={`block w-full py-4 text-2xl font-black uppercase tracking-tight transition-colors
                                        ${isActive(tab.href) ? 'text-black' : 'text-gray-400 hover:text-black'}
                                    `}
                                >
                                    {tab.name}
                                </Link>
                                <div className="w-12 h-[1px] bg-gray-100 mx-auto mt-2" />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
