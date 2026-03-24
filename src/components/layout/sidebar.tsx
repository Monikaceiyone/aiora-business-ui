import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingCart,
    HeadphonesIcon,
    MessageSquare,
    BadgeCheck,
    Settings,
    ChevronLeft,
    Menu,
    Package,
    Globe,
    X,
    Calendar,
    PlayCircle,
    Mail,
    Clock
} from 'lucide-react';

interface SidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
    mobileOpen?: boolean;
    isMobile?: boolean;
    onNavClick?: () => void;
}

const navItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Orders',
        href: '/dashboard/orders',
        icon: ShoppingCart,
    },
    {
        title: 'Appointments',
        href: '/dashboard/appointments',
        icon: Calendar,
    },
    {
        title: 'Conversations',
        href: '/dashboard/conversations',
        icon: PlayCircle,
    },
    {
        title: 'Usage',
        href: '/dashboard/usage',
        icon: Clock,
    },
    {
        title: 'Inquiries',
        href: '/dashboard/inquiries',
        icon: Mail,
    },
    {
        title: 'Service',
        href: '/dashboard/service',
        icon: HeadphonesIcon,
    },
    {
        title: 'Catalog',
        href: '/dashboard/catalog',
        icon: Package,
    },
    {
        title: 'WhatsApp',
        href: '/dashboard/whatsapp',
        icon: MessageSquare,
    },
    {
        title: 'Website',
        href: '/dashboard/website',
        icon: Globe,
    },
    {
        title: 'Verification',
        href: '/dashboard/verification',
        icon: BadgeCheck,
    },
    {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
    },
];

export function Sidebar({
    collapsed = false,
    onToggle,
    mobileOpen = false,
    isMobile = false,
    onNavClick
}: SidebarProps) {
    const pathname = usePathname();

    // On mobile, show/hide based on mobileOpen
    // On desktop, show normally with collapsed state
    const shouldShow = isMobile ? mobileOpen : true;

    if (isMobile && !mobileOpen) {
        return null;
    }

    return (
        <aside
            id="sidebar"
            className={cn(
                'fixed left-0 top-0 z-[60] h-screen bg-white border-r border-gray-200 transition-all duration-300',
                isMobile
                    ? 'w-64 shadow-2xl'
                    : (collapsed ? 'w-16' : 'w-64')
            )}
            style={{
                backgroundColor: '#ffffff',
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none'
            }}
        >
            {/* Logo */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
                {(!collapsed || isMobile) && (
                    <div className="flex items-center gap-2">
                        <img src="/aiora-logo.png" alt="AIORA" className="w-8 h-8 object-contain" />
                        <span className="font-bold text-gray-800">AIORA</span>
                    </div>
                )}
                <button
                    onClick={onToggle}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                    {isMobile ? (
                        <X className="w-5 h-5" />
                    ) : (
                        collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-64px)]">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavClick}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                                isActive
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            )}
                        >
                            <item.icon className={cn('w-5 h-5', collapsed && !isMobile && 'mx-auto')} />
                            {(!collapsed || isMobile) && <span className="font-medium">{item.title}</span>}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
