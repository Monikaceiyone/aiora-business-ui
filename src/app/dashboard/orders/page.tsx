'use client';

import { useEffect, useState } from 'react';
import {
    ShoppingCart,
    DollarSign,
    Clock,
    CheckCircle,
    TrendingUp,
    Package,
    CreditCard,
    Truck,
    AlertTriangle,
    RotateCcw,
    XCircle,
    RefreshCw,
    Loader2,
    ExternalLink,
    MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { getSellerDashboard, DashboardData } from '@/lib/supabase/queries';
import { getStatusInfo, getStatusBadgeClasses, STATUS_GROUPS } from '@/lib/status-codes';

// Stats Card Component
interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    trend?: { value: number; positive: boolean };
    iconColor?: string;
    iconBg?: string;
    loading?: boolean;
}

function StatCard({ title, value, subtitle, icon: Icon, trend, iconColor = 'text-blue-600', iconBg = 'bg-blue-50', loading }: StatCardProps) {
    return (
        <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">{title}</p>
                        {loading ? (
                            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1" />
                        ) : (
                            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                        )}
                        {subtitle && !loading && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                {trend && (
                                    <span className={trend.positive ? 'text-green-600' : 'text-red-600'}>
                                        {trend.positive ? '↑' : '↓'}{Math.abs(trend.value)}%
                                    </span>
                                )}
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <div className={`p-2.5 rounded-lg ${iconBg}`}>
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function OrderDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sellerId, setSellerId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Get seller_id from localStorage on mount
    useEffect(() => {
        const storedSellerId = localStorage.getItem('seller_id');
        if (storedSellerId) {
            setSellerId(storedSellerId);
        }
    }, []);

    const loadData = async (isRefresh = false) => {
        if (!sellerId) return;

        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const response = await getSellerDashboard(sellerId);
            setData(response);
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (sellerId) {
            loadData();
        }
    }, [sellerId]);

    const stats = data?.stats;
    const orders = data?.recent_orders || [];
    const seller = data?.seller;
    const charts = data?.charts;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {seller?.seller_name || 'Order Dashboard'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {seller?.business_type} • {seller?.city}
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => loadData(true)}
                    disabled={refreshing}
                    className="gap-2"
                >
                    {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Order Status Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <StatCard
                    title="Total Orders"
                    value={stats?.total_orders || 0}
                    icon={ShoppingCart}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-50"
                    loading={loading}
                />
                <StatCard
                    title="Revenue"
                    value={`₹${((stats?.total_revenue || 0) / 1000).toFixed(1)}K`}
                    icon={DollarSign}
                    iconColor="text-green-600"
                    iconBg="bg-green-50"
                    loading={loading}
                    subtitle="This month"
                />
                <StatCard
                    title="Payment Pending"
                    value={stats?.payment_pending || 0}
                    icon={Clock}
                    iconColor="text-yellow-600"
                    iconBg="bg-yellow-50"
                    loading={loading}
                />
                <StatCard
                    title="In Transit"
                    value={stats?.in_transit || 0}
                    icon={Truck}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-50"
                    loading={loading}
                />
                <StatCard
                    title="Delivered"
                    value={stats?.delivered || 0}
                    icon={CheckCircle}
                    iconColor="text-emerald-600"
                    iconBg="bg-emerald-50"
                    loading={loading}
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Processing"
                    value={stats?.processing || 0}
                    icon={Package}
                    iconColor="text-purple-600"
                    iconBg="bg-purple-50"
                    loading={loading}
                />
                <StatCard
                    title="RTO"
                    value={stats?.rto || 0}
                    icon={RotateCcw}
                    iconColor="text-red-600"
                    iconBg="bg-red-50"
                    loading={loading}
                />
                <StatCard
                    title="Exceptions"
                    value={stats?.exceptions || 0}
                    icon={AlertTriangle}
                    iconColor="text-orange-600"
                    iconBg="bg-orange-50"
                    loading={loading}
                />
                <StatCard
                    title="Cancelled"
                    value={stats?.cancelled || 0}
                    icon={XCircle}
                    iconColor="text-gray-600"
                    iconBg="bg-gray-100"
                    loading={loading}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Status Pie */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Order Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={charts?.status_distribution || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={75}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {(charts?.status_distribution || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 mt-2">
                            {(charts?.status_distribution || []).map((item) => (
                                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-gray-600">{item.name}</span>
                                    <span className="font-medium">({item.value})</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue & Orders Line Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Orders & Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={charts?.orders_by_date || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" stroke="#888" fontSize={11} />
                                    <YAxis yAxisId="left" stroke="#3b82f6" fontSize={11} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#22c55e" fontSize={11} />
                                    <Tooltip />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Orders" />
                                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Revenue (₹)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Products */}
            {charts?.top_products && charts.top_products.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Top Selling Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts.top_products} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" fontSize={11} />
                                    <YAxis type="category" dataKey="name" width={120} fontSize={11} />
                                    <Tooltip />
                                    <Bar dataKey="orders" fill="#6366f1" radius={[0, 4, 4, 0]} name="Orders" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recent Orders Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
                    <span className="text-sm text-gray-500">{orders.length} orders</span>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium">No orders yet</p>
                            <p className="text-sm mt-1">Orders from WhatsApp will appear here</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-3 px-2 font-medium text-gray-500">Order ID</th>
                                        <th className="text-left py-3 px-2 font-medium text-gray-500">Product</th>
                                        <th className="text-left py-3 px-2 font-medium text-gray-500">Customer</th>
                                        <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
                                        <th className="text-left py-3 px-2 font-medium text-gray-500">Date</th>
                                        <th className="text-right py-3 px-2 font-medium text-gray-500">Qty</th>
                                        <th className="text-right py-3 px-2 font-medium text-gray-500">Amount</th>
                                        <th className="text-center py-3 px-2 font-medium text-gray-500">Track</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order: any) => {
                                        const statusInfo = getStatusInfo(order.status_code || order.status);
                                        const productName = order.product_name || order.product_id || '-';
                                        return (
                                            <tr key={order.order_id} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="py-3 px-2 font-medium text-blue-600">{order.order_id}</td>
                                                <td className="py-3 px-2">
                                                    <span className="text-gray-900 font-medium">{productName}</span>
                                                </td>
                                                <td className="py-3 px-2">
                                                    <div>
                                                        <p className="text-gray-900">{order.user_name || order.user_phone}</p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClasses(order.status_code || order.status)}`}>
                                                        {statusInfo.icon} {statusInfo.name}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-2 text-gray-500">{order.order_date?.split('T')[0]}</td>
                                                <td className="py-3 px-2 text-right text-gray-900">{order.quantity || 1}</td>
                                                <td className="py-3 px-2 text-right font-semibold text-gray-900">
                                                    ₹{order.total_amount?.toLocaleString() || '-'}
                                                </td>
                                                <td className="py-3 px-2 text-center">
                                                    {order.tracking_url ? (
                                                        <a
                                                            href={order.tracking_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            <ExternalLink className="w-4 h-4 inline" />
                                                        </a>
                                                    ) : order.awb_number ? (
                                                        <span className="text-xs text-gray-500">{order.awb_number}</span>
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Business Info Card */}
            <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
                <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold">{seller?.seller_name || 'Your Business'}</p>
                                <p className="text-sm text-indigo-100">
                                    {stats?.total_products || 0} Products • {stats?.total_categories || 0} Categories
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold">₹{((stats?.total_revenue || 0) / 1000).toFixed(1)}K</div>
                            <div className="text-sm text-indigo-200">Total Revenue</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
