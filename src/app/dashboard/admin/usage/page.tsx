'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Loader2, RefreshCw, Save, Database, Users, TrendingUp, Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';

interface PoolData {
    total_purchased: number;
    total_allocated: number;
    total_used: number;
    pool_remaining: number;
    price_per_minute_paise: number;
}

interface SellerUsage {
    seller_id: string;
    seller_name: string;
    base_minutes: number;
    topup_minutes: number;
    used_minutes: number;
    remaining_minutes: number;
    cycle_start: string;
    cycle_end: string;
}

interface TopupRow {
    id: string;
    seller_id: string;
    seller_name?: string;
    minutes_purchased: number;
    amount_paise: number;
    status: string;
    created_at: string;
    paid_at: string | null;
}

interface AdminUsageData {
    pool: PoolData;
    sellers: SellerUsage[];
    recent_topups: TopupRow[];
}

export default function AdminUsagePage() {
    const toast = useToast();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [adminKey, setAdminKey] = useState('');

    const [data, setData] = useState<AdminUsageData | null>(null);
    const [loading, setLoading] = useState(false);

    // Pool editor state
    const [editPool, setEditPool] = useState(false);
    const [poolTotal, setPoolTotal] = useState('');
    const [poolPrice, setPoolPrice] = useState('');
    const [saving, setSaving] = useState(false);

    const checkAuth = async () => {
        setAuthLoading(true);
        try {
            const res = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            if (res.ok) {
                setIsAuthenticated(true);
                setAdminKey(password);
            } else {
                toast.error('Invalid Password', 'Please enter the correct admin password.');
            }
        } catch {
            toast.error('Error', 'Could not verify credentials.');
        } finally {
            setAuthLoading(false);
        }
    };

    const fetchData = useCallback(async () => {
        if (!adminKey) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/usage', {
                headers: { 'x-admin-key': adminKey },
            });
            if (!res.ok) throw new Error('Failed');
            const json = await res.json();
            setData(json);
            setPoolTotal(String(json.pool.total_purchased));
            setPoolPrice(String(json.pool.price_per_minute_paise));
        } catch {
            toast.error('Error', 'Failed to load admin usage data');
        } finally {
            setLoading(false);
        }
    }, [adminKey]);

    useEffect(() => {
        if (isAuthenticated) fetchData();
    }, [isAuthenticated, fetchData]);

    const savePool = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/usage', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': adminKey,
                },
                body: JSON.stringify({
                    total_purchased: Number(poolTotal),
                    price_per_minute_paise: Number(poolPrice),
                }),
            });
            if (res.ok) {
                toast.success('Saved', 'Pool settings updated');
                setEditPool(false);
                fetchData();
            } else {
                toast.error('Error', 'Failed to update pool settings');
            }
        } catch {
            toast.error('Error', 'Network error');
        } finally {
            setSaving(false);
        }
    };

    // Auth screen
    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="w-full max-w-sm">
                    <CardContent className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 text-center">Admin — Minute Pool</h2>
                        <p className="text-sm text-gray-500 text-center">Enter admin password to access</p>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && checkAuth()}
                            placeholder="Admin password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <button
                            onClick={checkAuth}
                            disabled={authLoading || !password}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {authLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Authenticate
                        </button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (loading || !data) {
        return (
            <div className="flex justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const { pool, sellers, recent_topups } = data;
    const allocPct = pool.total_purchased > 0
        ? Math.round((pool.total_allocated / pool.total_purchased) * 100)
        : 0;

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin — Minute Pool Management</h1>
                    <p className="text-gray-500 mt-1">Global VOIT minute pool and per-seller breakdown</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Pool Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-2 text-blue-100">
                            <Database className="w-4 h-4" /> Total Pool
                        </div>
                        <p className="text-3xl font-bold">{pool.total_purchased.toLocaleString()}</p>
                        <p className="text-sm text-blue-200 mt-1">minutes purchased</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-2 text-gray-500">
                            <Users className="w-4 h-4" /> Allocated
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{pool.total_allocated.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-1">{allocPct}% of pool</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-2 text-gray-500">
                            <TrendingUp className="w-4 h-4" /> Used
                        </div>
                        <p className="text-3xl font-bold text-orange-600">{pool.total_used.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-1">minutes consumed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-2 text-gray-500">
                            <Clock className="w-4 h-4" /> Unallocated
                        </div>
                        <p className={`text-3xl font-bold ${pool.pool_remaining < 500 ? 'text-red-600' : 'text-green-600'}`}>
                            {pool.pool_remaining.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">minutes available</p>
                    </CardContent>
                </Card>
            </div>

            {/* Pool allocation bar */}
            <Card>
                <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Pool Allocation</span>
                        <span className="text-sm text-gray-500">
                            {pool.total_allocated.toLocaleString()} / {pool.total_purchased.toLocaleString()} min
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${allocPct > 90 ? 'bg-red-500' : allocPct > 70 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(100, allocPct)}%` }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Edit Pool */}
            <Card>
                <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Pool Settings</h3>
                        {!editPool ? (
                            <button
                                onClick={() => setEditPool(true)}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Edit
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditPool(false)}
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={savePool}
                                    disabled={saving}
                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                    Save
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Total Pool (minutes)</label>
                            <input
                                type="number"
                                value={poolTotal}
                                onChange={(e) => setPoolTotal(e.target.value)}
                                disabled={!editPool}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Price per Minute (paise)</label>
                            <input
                                type="number"
                                value={poolPrice}
                                onChange={(e) => setPoolPrice(e.target.value)}
                                disabled={!editPool}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                = ₹{(Number(poolPrice) / 100).toFixed(2)} per minute
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Per-Seller Breakdown */}
            <Card>
                <CardContent className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Per-Seller Usage</h3>
                    {sellers.length === 0 ? (
                        <p className="text-gray-500 text-sm py-4 text-center">No active subscriptions</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-2 text-gray-500 font-medium">Seller</th>
                                        <th className="text-center py-2 text-gray-500 font-medium">Base</th>
                                        <th className="text-center py-2 text-gray-500 font-medium">Top-ups</th>
                                        <th className="text-center py-2 text-gray-500 font-medium">Used</th>
                                        <th className="text-center py-2 text-gray-500 font-medium">Remaining</th>
                                        <th className="text-left py-2 text-gray-500 font-medium min-w-[160px]">Usage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sellers.map((s) => {
                                        const total = s.base_minutes + s.topup_minutes;
                                        const pct = total > 0 ? Math.min(100, Math.round((s.used_minutes / total) * 100)) : 0;
                                        return (
                                            <tr key={s.seller_id} className="border-b border-gray-50 last:border-0">
                                                <td className="py-3">
                                                    <div className="font-medium text-gray-900">{s.seller_name}</div>
                                                    <div className="text-xs text-gray-400">{s.seller_id}</div>
                                                </td>
                                                <td className="py-3 text-center text-gray-700">{s.base_minutes}</td>
                                                <td className="py-3 text-center text-green-600">+{s.topup_minutes}</td>
                                                <td className="py-3 text-center text-orange-600 font-medium">{s.used_minutes}</td>
                                                <td className="py-3 text-center font-medium">
                                                    <span className={s.remaining_minutes <= 10 ? 'text-red-600' : 'text-green-600'}>
                                                        {s.remaining_minutes}
                                                    </span>
                                                </td>
                                                <td className="py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
                                                    </div>
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

            {/* Recent Topup Transactions */}
            {recent_topups.length > 0 && (
                <Card>
                    <CardContent className="p-5">
                        <h3 className="font-semibold text-gray-900 mb-4">Recent Top-up Transactions</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-2 text-gray-500 font-medium">Seller</th>
                                        <th className="text-center py-2 text-gray-500 font-medium">Minutes</th>
                                        <th className="text-center py-2 text-gray-500 font-medium">Amount</th>
                                        <th className="text-left py-2 text-gray-500 font-medium">Date</th>
                                        <th className="text-right py-2 text-gray-500 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent_topups.map((tx) => (
                                        <tr key={tx.id} className="border-b border-gray-50 last:border-0">
                                            <td className="py-2.5 text-gray-900">{tx.seller_name || tx.seller_id}</td>
                                            <td className="py-2.5 text-center font-medium text-gray-900">+{tx.minutes_purchased}</td>
                                            <td className="py-2.5 text-center text-gray-600">₹{(tx.amount_paise / 100).toFixed(0)}</td>
                                            <td className="py-2.5 text-gray-600">
                                                {new Date(tx.paid_at || tx.created_at).toLocaleString('en-IN', {
                                                    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="py-2.5 text-right">
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    tx.status === 'paid'
                                                        ? 'bg-green-50 text-green-700'
                                                        : tx.status === 'pending'
                                                        ? 'bg-yellow-50 text-yellow-700'
                                                        : 'bg-red-50 text-red-700'
                                                }`}>
                                                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
