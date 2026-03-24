'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, User, Package, CreditCard, MessageSquare, Loader2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase/client';

interface HeaderProps {
    title?: string;
    onMenuClick?: () => void;
    showMenuButton?: boolean;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'order' | 'payment' | 'service';
    read: boolean;
}

interface SearchResult {
    type: 'order' | 'product';
    id: string;
    title: string;
    subtitle: string;
}

function getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
}

function getNotificationIcon(type: string) {
    switch (type) {
        case 'order':
            return { icon: Package, bg: 'bg-blue-100', color: 'text-blue-600' };
        case 'payment':
            return { icon: CreditCard, bg: 'bg-green-100', color: 'text-green-600' };
        case 'service':
            return { icon: MessageSquare, bg: 'bg-yellow-100', color: 'text-yellow-600' };
        default:
            return { icon: Package, bg: 'bg-gray-100', color: 'text-gray-600' };
    }
}

export function Header({ title = 'Dashboard', onMenuClick, showMenuButton = false }: HeaderProps) {
    const router = useRouter();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [readIds, setReadIds] = useState<Set<string>>(new Set());
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Load notifications from recent orders and service orders
    const loadNotifications = async () => {
        const sellerId = localStorage.getItem('seller_id');
        if (!sellerId) return;

        setLoading(true);
        try {
            const notifs: Notification[] = [];

            // Fetch recent orders (last 7 days)
            const { data: orders } = await supabase
                .from('orders')
                .select('order_id, user_name, total_amount, status, created_at')
                .eq('seller_id', sellerId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (orders) {
                orders.forEach(order => {
                    const status = (order.status || '').toLowerCase();
                    const isRead = readIds.has(`order-${order.order_id}`);

                    if (status.includes('captured') || status.includes('paid') || status.includes('confirm')) {
                        notifs.push({
                            id: `order-${order.order_id}`,
                            title: 'Payment Received',
                            message: `₹${order.total_amount?.toLocaleString()} from ${order.user_name || 'Customer'}`,
                            time: getTimeAgo(order.created_at),
                            type: 'payment',
                            read: isRead
                        });
                    } else if (status.includes('pending') || status.includes('new')) {
                        notifs.push({
                            id: `order-${order.order_id}`,
                            title: 'New Order',
                            message: `Order ${order.order_id} - ₹${order.total_amount?.toLocaleString()}`,
                            time: getTimeAgo(order.created_at),
                            type: 'order',
                            read: isRead
                        });
                    }
                });
            }

            // Fetch recent service orders
            const { data: serviceOrders } = await supabase
                .from('service_orders')
                .select('order_id, customer_name, order_status, created_at')
                .eq('seller_id', sellerId)
                .order('created_at', { ascending: false })
                .limit(5);

            if (serviceOrders) {
                serviceOrders.forEach(so => {
                    const isRead = readIds.has(`service-${so.order_id}`);
                    if (so.order_status === 'READY') {
                        notifs.push({
                            id: `service-${so.order_id}`,
                            title: 'Service Complete',
                            message: `Repair for ${so.customer_name || 'Customer'} is ready`,
                            time: getTimeAgo(so.created_at),
                            type: 'service',
                            read: isRead
                        });
                    } else if (so.order_status === 'NEW') {
                        notifs.push({
                            id: `service-${so.order_id}`,
                            title: 'New Service Request',
                            message: `Service order from ${so.customer_name || 'Customer'}`,
                            time: getTimeAgo(so.created_at),
                            type: 'service',
                            read: isRead
                        });
                    }
                });
            }

            setNotifications(notifs.slice(0, 8)); // Max 8 notifications
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Search function
    const handleSearch = async (query: string) => {
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        const sellerId = localStorage.getItem('seller_id');
        if (!sellerId) return;

        setSearchLoading(true);
        setShowSearchResults(true);

        try {
            const results: SearchResult[] = [];

            // Search orders
            const { data: orders } = await supabase
                .from('orders')
                .select('order_id, user_name, total_amount')
                .eq('seller_id', sellerId)
                .or(`order_id.ilike.%${query}%,user_name.ilike.%${query}%`)
                .limit(5);

            if (orders) {
                orders.forEach(order => {
                    results.push({
                        type: 'order',
                        id: order.order_id,
                        title: `Order ${order.order_id}`,
                        subtitle: `${order.user_name || 'Customer'} - ₹${order.total_amount?.toLocaleString()}`
                    });
                });
            }

            // Search products
            const { data: products } = await supabase
                .from('products')
                .select('product_id, product_name, price')
                .eq('seller_id', sellerId)
                .ilike('product_name', `%${query}%`)
                .limit(5);

            if (products) {
                products.forEach(product => {
                    results.push({
                        type: 'product',
                        id: product.product_id,
                        title: product.product_name,
                        subtitle: `₹${product.price?.toLocaleString()}`
                    });
                });
            }

            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearchResultClick = (result: SearchResult) => {
        if (result.type === 'order') {
            router.push('/dashboard/orders');
        } else if (result.type === 'product') {
            router.push('/dashboard/catalog');
        }
        setSearchQuery('');
        setShowSearchResults(false);
    };

    // Load notifications on mount
    useEffect(() => {
        loadNotifications();
    }, []);

    useEffect(() => {
        if (showNotifications) {
            loadNotifications();
        }
    }, [showNotifications]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setReadIds(prev => new Set([...prev, id]));
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        const allIds = new Set(notifications.map(n => n.id));
        setReadIds(allIds);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
            {/* Left - Menu + Title */}
            <div className="flex items-center gap-3">
                {showMenuButton && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onMenuClick}
                        className="md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                )}
                <h1 className="text-lg md:text-xl font-semibold text-gray-900">{title}</h1>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-2 md:gap-4">
                {/* Search */}
                <div className="relative hidden md:block" ref={searchRef}>
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        type="search"
                        placeholder="Search orders, products..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-64 pl-9 h-9 bg-gray-50 border-gray-200"
                    />

                    {/* Search Results Dropdown */}
                    {showSearchResults && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                            {searchLoading ? (
                                <div className="p-4 text-center">
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                                </div>
                            ) : searchResults.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    No results found
                                </div>
                            ) : (
                                <div className="max-h-60 overflow-y-auto">
                                    {searchResults.map((result, idx) => (
                                        <button
                                            key={`${result.type}-${result.id}-${idx}`}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                                            onClick={() => handleSearchResultClick(result)}
                                        >
                                            <div className={`w-8 h-8 rounded flex items-center justify-center ${result.type === 'order' ? 'bg-blue-100' : 'bg-green-100'
                                                }`}>
                                                <Package className={`w-4 h-4 ${result.type === 'order' ? 'text-blue-600' : 'text-green-600'
                                                    }`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{result.title}</p>
                                                <p className="text-xs text-gray-500">{result.subtitle}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <div className="relative" ref={dropdownRef}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell className="h-5 w-5 text-gray-500" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-900">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>

                            {/* Notification List */}
                            <div className="max-h-80 overflow-y-auto">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="py-8 text-center text-gray-500 text-sm">
                                        No new notifications
                                    </div>
                                ) : (
                                    notifications.map((notification) => {
                                        const { icon: Icon, bg, color } = getNotificationIcon(notification.type);
                                        return (
                                            <div
                                                key={notification.id}
                                                className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50/50' : ''
                                                    }`}
                                                onClick={() => markAsRead(notification.id)}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                                                        <Icon className={`w-4 h-4 ${color}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                                {notification.title}
                                                            </p>
                                                            {!notification.read && (
                                                                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-0.5 truncate">{notification.message}</p>
                                                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-3 bg-gray-50 text-center">
                                <button
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    onClick={() => setShowNotifications(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* User Avatar */}
                <div className="rounded-full cursor-default">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                    </div>
                </div>
            </div>
        </header>
    );
}
