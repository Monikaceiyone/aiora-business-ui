'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { ToastProvider } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { DEV_AUTH_ENABLED, DEV_SELLER } from '@/lib/dev-auth';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    // Check authentication on mount
    useEffect(() => {
        
        const checkAuth = async () => {
            // ── Dev mode bypass ──────────────────────────────────────────────
            if (DEV_AUTH_ENABLED) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('seller_id', DEV_SELLER.seller_id);
                localStorage.setItem('seller_name', DEV_SELLER.seller_name);
                localStorage.setItem('phone_number', DEV_SELLER.phone_number);
                setIsAuthenticated(true);
                return;
            }
            // ────────────────────────────────────────────────────────────────
            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData.session?.access_token;

            // if (!accessToken) {
                const magicResponse = await fetch(`/api/auth/magic-session`);
                if (magicResponse.ok) {
                    const magic = await magicResponse.json();
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('seller_id', magic.seller.seller_id);
                    localStorage.setItem('seller_name', magic.seller.seller_name || '');
                    localStorage.setItem('phone_number', magic.seller.phone_number || '');
                    setIsAuthenticated(true);
                    return;
                }
                router.push('/login');
                return;
            // }

            const response = await fetch('http://192.168.3.131:4000/api/auth/seller-context', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (!response.ok) {
                const result = await response.json().catch(() => ({}));
                if (result.code === 'not_mapped') {
                    router.push('/login?error=not_mapped');
                    return;
                }

                await supabase.auth.signOut();
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('seller_id');
                localStorage.removeItem('seller_name');
                localStorage.removeItem('phone_number');
                router.push('/login');
                return;
            }

            const result = await response.json();
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('seller_id', result.seller.seller_id);
            localStorage.setItem('seller_name', result.seller.seller_name || '');
            localStorage.setItem('phone_number', result.seller.phone_number || '');
            setIsAuthenticated(true);
        };

        checkAuth();

        // Also listen for storage changes (logout from another tab)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'seller_id' && !e.newValue) {
                router.push('/login');
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [router]);

useEffect(() => {
    const fetchMagicSession = async () => {
        const magicResponse = await fetch(`/api/auth/magic-session`);
    console.log(magicResponse,"magicResponse")
    };
    fetchMagicSession();
}, []);


    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarCollapsed(true);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (mobileMenuOpen && isMobile) {
                const sidebar = document.getElementById('sidebar');
                if (sidebar && !sidebar.contains(e.target as Node)) {
                    setMobileMenuOpen(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [mobileMenuOpen, isMobile]);

    const handleSidebarToggle = () => {
        if (isMobile) {
            setMobileMenuOpen(!mobileMenuOpen);
        } else {
            setSidebarCollapsed(!sidebarCollapsed);
        }
    };

    const handleNavClick = () => {
        if (isMobile) {
            setMobileMenuOpen(false);
        }
    };

    // Show loading while checking auth
    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    // Don't render if not authenticated (will redirect)
    if (!isAuthenticated) {
        return null;
    }

    return (
        <ToastProvider>
            <div className="min-h-screen bg-gray-50">
                {/* Dev Mode Banner */}
                {DEV_AUTH_ENABLED && (
                    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-400 text-amber-900 text-xs font-semibold text-center py-1 px-4">
                        ⚠ DEV MODE — Mock auth active (seller: {DEV_SELLER.seller_id}). Set NEXT_PUBLIC_SKIP_AUTH=false to use real login.
                    </div>
                )}
                {/* Mobile Overlay */}
                {mobileMenuOpen && isMobile && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <Sidebar
                    collapsed={isMobile ? false : sidebarCollapsed}
                    onToggle={handleSidebarToggle}
                    mobileOpen={mobileMenuOpen}
                    isMobile={isMobile}
                    onNavClick={handleNavClick}
                />

                {/* Main Content */}
                <div
                    className={cn(
                        'transition-all duration-300',
                        DEV_AUTH_ENABLED ? 'pt-6' : '',
                        isMobile ? 'ml-0' : (sidebarCollapsed ? 'ml-16' : 'ml-64')
                    )}
                >
                    <Header
                        title="Dashboard"
                        onMenuClick={handleSidebarToggle}
                        showMenuButton={isMobile}
                    />
                    <main className="p-4 md:p-6">{children}</main>
                </div>
            </div>
        </ToastProvider>
    );
}
