'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Clock, Phone, TrendingUp, Zap, CreditCard, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { dashboardFetch } from '@/lib/dashboard-fetch';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface UsageData {
    has_subscription: boolean;
    base_minutes: number;
    topup_minutes: number;
    total_minutes: number;
    used_minutes: number;
    used_seconds: number;
    remaining_minutes: number;
    percentage_used: number;
    cycle_start: string | null;
    cycle_end: string | null;
    subscription_id: string | null;
    price_per_minute_paise: number;
    recent_calls: Array<{
        id: string;
        client_phone: string | null;
        duration_seconds: number | null;
        started_at: string;
    }>;
    topup_history: Array<{
        id: string;
        minutes_purchased: number;
        amount_paise: number;
        status: string;
        created_at: string;
        paid_at: string | null;
    }>;
}

const QUICK_PICKS = [30, 60, 90, 120, 180];

function CircularProgress({ percentage, used, total }: { percentage: number; used: number; total: number }) {
    const radius = 70;
    const strokeWidth = 12;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
    const isOverLimit = used > total;

    return (
        <div className="relative w-48 h-48 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
                <circle
                    cx="90" cy="90" r={radius}
                    stroke="#e5e7eb" strokeWidth={strokeWidth} fill="none"
                />
                <circle
                    cx="90" cy="90" r={radius}
                    stroke={isOverLimit ? '#ef4444' : percentage > 80 ? '#f59e0b' : '#3b82f6'}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{used}</span>
                <span className="text-sm text-gray-500">of {total} min</span>
                {isOverLimit && (
                    <span className="text-xs text-red-500 font-medium mt-1">Over limit</span>
                )}
            </div>
        </div>
    );
}

function formatDuration(seconds: number | null | undefined) {
    if (!seconds || seconds <= 0) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
}

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
    });
}

export default function UsagePage() {
    const [sellerId, setSellerId] = useState<string | null>(null);
    const [usage, setUsage] = useState<UsageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedMinutes, setSelectedMinutes] = useState<number>(90);
    const [customMinutes, setCustomMinutes] = useState('');
    const [isCustom, setIsCustom] = useState(false);
    const [paying, setPaying] = useState(false);
    const scriptLoaded = useRef(false);
    const toast = useToast();

    useEffect(() => {
        const sid = localStorage.getItem('seller_id');
        if (sid) setSellerId(sid);
    }, []);

    const fetchUsage = useCallback(async () => {
        if (!sellerId) return;
        setLoading(true);
        try {
            const res = await dashboardFetch(`/api/usage/${sellerId}`);
            const data = await res.json();
            setUsage(data);
        } catch {
            toast.error('Error', 'Failed to load usage data');
        } finally {
            setLoading(false);
        }
    }, [sellerId]);

    useEffect(() => { fetchUsage(); }, [fetchUsage]);

    // Load Razorpay checkout script
    useEffect(() => {
        if (scriptLoaded.current) return;
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => { scriptLoaded.current = true; };
        document.body.appendChild(script);
    }, []);

    const effectiveMinutes = isCustom ? Number(customMinutes) || 0 : selectedMinutes;
    const priceRupees = usage
        ? ((effectiveMinutes * (usage.price_per_minute_paise || 150)) / 100).toFixed(0)
        : '0';

    const handleTopup = async () => {
        if (!usage?.subscription_id || effectiveMinutes < 10) {
            toast.warning('Invalid', 'Please select at least 10 minutes');
            return;
        }
        if (effectiveMinutes > 500) {
            toast.warning('Too many', 'Maximum 500 minutes per top-up');
            return;
        }

        setPaying(true);
        try {
            const res = await dashboardFetch('/api/topup/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seller_id: sellerId,
                    minutes: effectiveMinutes,
                    subscription_id: usage.subscription_id,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                toast.error('Error', data.error || 'Failed to create payment order');
                setPaying(false);
                return;
            }

            const options = {
                key: data.key_id,
                amount: data.amount,
                currency: data.currency,
                name: 'AIORA',
                description: `Top-up: ${data.minutes} VOIT minutes`,
                order_id: data.razorpay_order_id,
                handler: async (response: any) => {
                    try {
                        const verifyRes = await dashboardFetch('/api/topup/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });
                        const verifyData = await verifyRes.json();
                        if (verifyRes.ok && verifyData.success) {
                            toast.success('Payment Successful', `+${verifyData.minutes_added} minutes added to your account`);
                            fetchUsage();
                        } else {
                            toast.error('Verification Failed', 'Payment received but verification failed. Contact support.');
                        }
                    } catch {
                        toast.error('Error', 'Could not verify payment. Contact support.');
                    }
                    setPaying(false);
                },
                modal: {
                    ondismiss: () => { setPaying(false); },
                },
                theme: { color: '#3b82f6' },
            };

            if (window.Razorpay) {
                const rzp = new window.Razorpay(options);
                rzp.open();
            } else {
                toast.error('Error', 'Payment gateway not loaded. Please refresh and try again.');
                setPaying(false);
            }
        } catch {
            toast.error('Error', 'Failed to initiate payment');
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!usage?.has_subscription) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">VOIT Minutes Usage</h1>
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 mt-8">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No Active Subscription</h3>
                    <p className="text-gray-500 mt-2">Your subscription has not been set up yet. Please contact AIORA support to activate your plan.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">VOIT Minutes Usage</h1>
                    <p className="text-gray-500 mt-1">
                        Billing cycle: {formatDate(usage.cycle_start!)} — {formatDate(usage.cycle_end!)}
                    </p>
                </div>
                <button
                    onClick={fetchUsage}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Usage Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Circular Progress */}
                <Card>
                    <CardContent className="p-6 flex flex-col items-center">
                        <CircularProgress
                            percentage={usage.percentage_used}
                            used={usage.used_minutes}
                            total={usage.total_minutes}
                        />
                        <p className="text-sm text-gray-500 mt-4">
                            {usage.remaining_minutes > 0
                                ? `${usage.remaining_minutes} minutes remaining`
                                : 'Minutes exhausted — top up below'
                            }
                        </p>
                    </CardContent>
                </Card>

                {/* Breakdown */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h3 className="font-semibold text-gray-900 text-lg">Minute Breakdown</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-blue-500" /> Base Plan
                                </span>
                                <span className="font-semibold text-gray-900">{usage.base_minutes} min</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-green-500" /> Top-ups
                                </span>
                                <span className="font-semibold text-gray-900">+{usage.topup_minutes} min</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between items-center">
                                <span className="font-medium text-gray-900">Total Available</span>
                                <span className="font-bold text-gray-900 text-lg">{usage.total_minutes} min</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Used</span>
                                <span className="font-semibold text-orange-600">{usage.used_minutes} min</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Remaining</span>
                                <span className={`font-bold text-lg ${usage.remaining_minutes <= 10 ? 'text-red-600' : 'text-green-600'}`}>
                                    {usage.remaining_minutes} min
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Up Section */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-500" /> Top Up Minutes
                    </h3>

                    {/* Quick Picks */}
                    <div className="flex flex-wrap gap-3 mb-4">
                        {QUICK_PICKS.map((mins) => (
                            <button
                                key={mins}
                                onClick={() => { setSelectedMinutes(mins); setIsCustom(false); }}
                                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                                    !isCustom && selectedMinutes === mins
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                            >
                                {mins} min
                            </button>
                        ))}
                        <button
                            onClick={() => setIsCustom(true)}
                            className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                                isCustom
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                        >
                            Custom
                        </button>
                    </div>

                    {/* Custom input */}
                    {isCustom && (
                        <div className="mb-4">
                            <label className="text-sm text-gray-600 mb-1 block">Enter minutes (10–500)</label>
                            <input
                                type="number"
                                min="10"
                                max="500"
                                value={customMinutes}
                                onChange={(e) => setCustomMinutes(e.target.value)}
                                placeholder="e.g. 45"
                                className="w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>
                    )}

                    {/* Price + Pay */}
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                        <div>
                            <p className="text-sm text-gray-500">Total price</p>
                            <p className="text-2xl font-bold text-gray-900">
                                ₹{priceRupees}
                            </p>
                            <p className="text-xs text-gray-400">
                                ₹{((usage.price_per_minute_paise || 150) / 100).toFixed(2)}/min × {effectiveMinutes} min
                            </p>
                        </div>
                        <button
                            onClick={handleTopup}
                            disabled={paying || effectiveMinutes < 10}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {paying ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                            ) : (
                                <>Pay with Razorpay</>
                            )}
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Calls */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-blue-500" /> Recent Calls
                    </h3>
                    {usage.recent_calls.length === 0 ? (
                        <p className="text-gray-500 text-sm py-4 text-center">No calls this cycle</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-2 text-gray-500 font-medium">Phone</th>
                                        <th className="text-left py-2 text-gray-500 font-medium">Date</th>
                                        <th className="text-right py-2 text-gray-500 font-medium">Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usage.recent_calls.map((call) => (
                                        <tr key={call.id} className="border-b border-gray-50 last:border-0">
                                            <td className="py-2.5 text-gray-900">
                                                {call.client_phone || 'Unknown'}
                                            </td>
                                            <td className="py-2.5 text-gray-600">
                                                {formatDateTime(call.started_at)}
                                            </td>
                                            <td className="py-2.5 text-right font-medium text-gray-900">
                                                {formatDuration(call.duration_seconds)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Top-up History */}
            {usage.topup_history.length > 0 && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-green-500" /> Top-up History
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-2 text-gray-500 font-medium">Minutes</th>
                                        <th className="text-left py-2 text-gray-500 font-medium">Amount</th>
                                        <th className="text-left py-2 text-gray-500 font-medium">Date</th>
                                        <th className="text-right py-2 text-gray-500 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usage.topup_history.map((tx) => (
                                        <tr key={tx.id} className="border-b border-gray-50 last:border-0">
                                            <td className="py-2.5 font-medium text-gray-900">+{tx.minutes_purchased} min</td>
                                            <td className="py-2.5 text-gray-600">₹{(tx.amount_paise / 100).toFixed(0)}</td>
                                            <td className="py-2.5 text-gray-600">
                                                {formatDateTime(tx.paid_at || tx.created_at)}
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
