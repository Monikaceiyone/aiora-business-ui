'use client';

import { useEffect, useState } from 'react';
import {
    Wrench,
    Clock,
    UserCheck,
    Play,
    CheckCircle,
    RefreshCw,
    Loader2,
    ExternalLink,
    FileText,
    User,
    Calendar,
    DollarSign,
    Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';

interface ServiceOrder {
    id: string;
    order_id: string;
    seller_id: string;
    customer_name: string;
    customer_id: string;
    owner_id: string;
    item_weight: string;
    repair_agent_id: string;
    repair_agent_name: string;
    order_status: string;
    technician_cost: number;
    delivery_date: string;
    comment: string;
    files_url: string;
    task_description: string;
    created_at: string;
}

interface Stats {
    total: number;
    new_orders: number;
    assigned: number;
    in_progress: number;
    ready: number;
    total_cost: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
    'NEW': { label: 'New', color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-200', icon: Clock },
    'ASSIGNED': { label: 'Assigned', color: 'text-purple-700', bgColor: 'bg-purple-100 border-purple-200', icon: UserCheck },
    'INPROGRESS': { label: 'In Progress', color: 'text-amber-700', bgColor: 'bg-amber-100 border-amber-200', icon: Play },
    'READY': { label: 'Ready', color: 'text-green-700', bgColor: 'bg-green-100 border-green-200', icon: CheckCircle },
};

function StatCard({ title, value, icon: Icon, color, bgColor }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
}) {
    return (
        <Card>
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">{title}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    </div>
                    <div className={`p-2.5 rounded-lg ${bgColor}`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ServiceDashboard() {
    const [orders, setOrders] = useState<ServiceOrder[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, new_orders: 0, assigned: 0, in_progress: 0, ready: 0, total_cost: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sellerId, setSellerId] = useState<string | null>(null);
    const [sellerName, setSellerName] = useState<string>('');
    const [filter, setFilter] = useState<string>('ALL');

    useEffect(() => {
        const storedSellerId = localStorage.getItem('seller_id');
        const storedSellerName = localStorage.getItem('seller_name');
        if (storedSellerId) {
            setSellerId(storedSellerId);
            setSellerName(storedSellerName || '');
            loadData(storedSellerId);
        }
    }, []);

    const loadData = async (sellerId: string, isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const { data, error } = await supabase
                .from('service_orders')
                .select('*')
                .eq('seller_id', sellerId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const orderList = data || [];
            setOrders(orderList);

            // Calculate stats
            const statsData: Stats = {
                total: orderList.length,
                new_orders: orderList.filter(o => o.order_status === 'NEW').length,
                assigned: orderList.filter(o => o.order_status === 'ASSIGNED').length,
                in_progress: orderList.filter(o => o.order_status === 'INPROGRESS').length,
                ready: orderList.filter(o => o.order_status === 'READY').length,
                total_cost: orderList.reduce((sum, o) => sum + (o.technician_cost || 0), 0),
            };
            setStats(statsData);
        } catch (error) {
            console.error('Error loading service orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filteredOrders = filter === 'ALL'
        ? orders
        : orders.filter(o => o.order_status === filter);

    const getStatusBadge = (status: string) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG['NEW'];
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.color}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
                    <p className="text-gray-500">{sellerName} • Repair Orders</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => sellerId && loadData(sellerId, true)}
                    disabled={refreshing}
                    className="gap-2"
                >
                    {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard
                    title="Total Orders"
                    value={stats.total}
                    icon={Package}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    title="New"
                    value={stats.new_orders}
                    icon={Clock}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    title="Assigned"
                    value={stats.assigned}
                    icon={UserCheck}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                />
                <StatCard
                    title="In Progress"
                    value={stats.in_progress}
                    icon={Play}
                    color="text-amber-600"
                    bgColor="bg-amber-50"
                />
                <StatCard
                    title="Ready"
                    value={stats.ready}
                    icon={CheckCircle}
                    color="text-green-600"
                    bgColor="bg-green-50"
                />
                <StatCard
                    title="Total Cost"
                    value={`₹${stats.total_cost.toLocaleString()}`}
                    icon={DollarSign}
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
                />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['ALL', 'NEW', 'ASSIGNED', 'INPROGRESS', 'READY'].map((status) => (
                    <Button
                        key={status}
                        variant={filter === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter(status)}
                        className="whitespace-nowrap"
                    >
                        {status === 'ALL' ? 'All Orders' : STATUS_CONFIG[status]?.label || status}
                        {status !== 'ALL' && (
                            <span className="ml-1.5 text-xs">
                                ({status === 'NEW' ? stats.new_orders :
                                    status === 'ASSIGNED' ? stats.assigned :
                                        status === 'INPROGRESS' ? stats.in_progress :
                                            stats.ready})
                            </span>
                        )}
                    </Button>
                ))}
            </div>

            {/* Orders Table */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Wrench className="w-4 h-4" />
                        Service Orders
                        <span className="text-gray-500 font-normal">({filteredOrders.length})</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
                            ))}
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <Wrench className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium">No service orders found</p>
                            <p className="text-sm mt-1">Orders will appear here after sync</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-3 px-2 font-medium text-gray-500">Order ID</th>
                                        <th className="text-left py-3 px-2 font-medium text-gray-500">Customer</th>
                                        <th className="text-left py-3 px-2 font-medium text-gray-500">Task</th>
                                        <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
                                        <th className="text-left py-3 px-2 font-medium text-gray-500">Repair Agent</th>
                                        <th className="text-right py-3 px-2 font-medium text-gray-500">Cost</th>
                                        <th className="text-left py-3 px-2 font-medium text-gray-500">Delivery</th>
                                        <th className="text-center py-3 px-2 font-medium text-gray-500">Files</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="py-3 px-2 font-medium text-blue-600">{order.order_id}</td>
                                            <td className="py-3 px-2">
                                                <div>
                                                    <p className="text-gray-900">{order.customer_name}</p>
                                                    <p className="text-xs text-gray-500">{order.item_weight}</p>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 max-w-[200px]">
                                                <p className="text-gray-700 truncate" title={order.task_description}>
                                                    {order.task_description || '-'}
                                                </p>
                                            </td>
                                            <td className="py-3 px-2">{getStatusBadge(order.order_status)}</td>
                                            <td className="py-3 px-2">
                                                {order.repair_agent_name ? (
                                                    <div className="flex items-center gap-1">
                                                        <User className="w-3 h-3 text-gray-400" />
                                                        <span>{order.repair_agent_name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-2 text-right font-semibold">
                                                {order.technician_cost ? `₹${order.technician_cost.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="py-3 px-2">
                                                {order.delivery_date ? (
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{new Date(order.delivery_date).toLocaleDateString()}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                {order.files_url ? (
                                                    <a
                                                        href={order.files_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <ExternalLink className="w-4 h-4 inline" />
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
