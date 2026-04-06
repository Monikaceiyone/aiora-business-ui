'use client';

import UIDashboard from '@/ui-dashboard';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ShoppingCart,
    HeadphonesIcon,
    MessageSquare,
    BadgeCheck,
    TrendingUp,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { getSellerDashboard, DashboardData } from '@/lib/supabase/queries';

interface DashboardStats {
    totalRevenue: number;
    ordersToday: number;
    activeServiceOrders: number;
    totalOrders: number;
    totalServiceOrders: number;
}

export default function DashboardHome() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 0,
        ordersToday: 0,
        activeServiceOrders: 0,
        totalOrders: 0,
        totalServiceOrders: 0
    });
    const [sellerName, setSellerName] = useState('');
    const [sellerId, setSellerId] = useState<string | null>(null);

    useEffect(() => {
        const storedSellerId = localStorage.getItem('seller_id');
        const storedSellerName = localStorage.getItem('seller_name');
        if (storedSellerId) {
            setSellerId(storedSellerId);
            setSellerName(storedSellerName || 'User');
            loadStats(storedSellerId);
        }
    }, []);
    

    const loadStats = async (sellerId: string) => {
        setLoading(true);
        try {
            // Use the unified dashboard query for consistent data
            const dashboardData = await getSellerDashboard(sellerId);

            // Fetch service orders separately
            const { data: serviceOrders } = await supabase
                .from('service_orders')
                .select('order_status, created_at, technician_cost')
                .eq('seller_id', sellerId);

            const serviceList = serviceOrders || [];
            const today = new Date().toISOString().split('T')[0];

            // Orders today from recent orders
            const ordersToday = dashboardData.recent_orders.filter(o =>
                (o.created_at || o.order_date)?.startsWith(today)
            ).length;

            // Revenue from service orders (technician_cost for READY orders)
            const serviceRevenue = serviceList
                .filter(o => o.order_status === 'READY')
                .reduce((sum, o) => sum + (Number(o.technician_cost) || 0), 0);

            const totalRevenue = dashboardData.stats.total_revenue + serviceRevenue;

            const activeServiceOrders = serviceList.filter(o =>
                o.order_status !== 'READY'
            ).length;

            setStats({
                totalRevenue,
                ordersToday,
                activeServiceOrders,
                totalOrders: dashboardData.stats.total_orders,
                totalServiceOrders: serviceList.length
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const quickLinks = [
        {
            title: 'Orders',
            description: 'Manage orders, track revenue, and monitor deliveries',
            href: '/dashboard/orders',
            icon: ShoppingCart,
            color: 'from-blue-500 to-indigo-600',
            stats: `${stats.totalOrders} total orders`
        },
        {
            title: 'Service',
            description: 'Handle repairs and track technician work',
            href: '/dashboard/service',
            icon: HeadphonesIcon,
            color: 'from-green-500 to-emerald-600',
            stats: `${stats.totalServiceOrders} service orders`
        },
        {
            title: 'WhatsApp',
            description: 'Setup WhatsApp Business API and manage messages',
            href: '/dashboard/whatsapp',
            icon: MessageSquare,
            color: 'from-emerald-500 to-teal-600',
            stats: 'Manage'
        },
        {
            title: 'Verification',
            description: 'Get Meta verified blue tick for WhatsApp & Instagram',
            href: '/dashboard/verification',
            icon: BadgeCheck,
            color: 'from-purple-500 to-violet-600',
            stats: 'View status'
        },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
{/*             
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {sellerName}! 👋</h1>
                <p className="text-gray-500 mt-1">Here's what's happening with your business today.</p>
            </div> */}

            {/* Quick Stats */}
            {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Total Revenue</p>
                                {loading ? (
                                    <div className="h-9 w-24 bg-blue-400/30 animate-pulse rounded mt-1" />
                                ) : (
                                    <p className="text-3xl font-bold mt-1">₹{(stats.totalRevenue / 1000).toFixed(1)}K</p>
                                )}
                            </div>
                            <TrendingUp className="w-10 h-10 text-blue-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <p className="text-gray-500 text-sm">Orders Today</p>
                        {loading ? (
                            <div className="h-9 w-12 bg-gray-200 animate-pulse rounded mt-1" />
                        ) : (
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.ordersToday}</p>
                        )}
                        <p className="text-gray-500 text-sm mt-2">from {stats.totalOrders} total</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <p className="text-gray-500 text-sm">Active Services</p>
                        {loading ? (
                            <div className="h-9 w-12 bg-gray-200 animate-pulse rounded mt-1" />
                        ) : (
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeServiceOrders}</p>
                        )}
                        <p className="text-yellow-600 text-sm mt-2">Pending / In Progress</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <p className="text-gray-500 text-sm">Total Services</p>
                        {loading ? (
                            <div className="h-9 w-12 bg-gray-200 animate-pulse rounded mt-1" />
                        ) : (
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalServiceOrders}</p>
                        )}
                        <p className="text-gray-500 text-sm mt-2">Repair orders</p>
                    </CardContent>
                </Card>
            </div> */}

            {/* Quick Links */}

            {/* <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickLinks.map((link) => (
                        <Link key={link.href} href={link.href}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${link.color}`}>
                                            <link.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-gray-900">{link.title}</h3>
                                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">{link.description}</p>
                                            <p className="text-sm font-medium text-gray-700 mt-2">{link.stats}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div> */}
             <UIDashboard />
        </div>
    );
}
