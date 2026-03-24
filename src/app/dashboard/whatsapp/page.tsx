'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    MessageCircle,
    Settings,
    CheckCircle,
    XCircle,
    ExternalLink,
    RefreshCw,
    Loader2,
    Phone,
    Tag,
    Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';

interface WhatsAppConfig {
    phone_number_id: string;
    catalog_id: string;
    is_verified: boolean;
    verified_at: string;
    created_at: string;
}

export default function WhatsAppDashboard() {
    const [config, setConfig] = useState<WhatsAppConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [sellerId, setSellerId] = useState<string | null>(null);

    useEffect(() => {
        const storedSellerId = localStorage.getItem('seller_id');
        if (storedSellerId) {
            setSellerId(storedSellerId);
            loadConfig(storedSellerId);
        }
    }, []);

    const loadConfig = async (sellerId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('whatsapp_config')
                .select('*')
                .eq('seller_id', sellerId)
                .single();

            if (data) {
                setConfig(data);
            }
        } catch (error) {
            console.error('Error loading config:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    // Not connected yet
    if (!config) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">Connect WhatsApp Business</h1>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Set up your WhatsApp Business API to start receiving orders directly from WhatsApp.
                </p>
                <Link href="/dashboard/whatsapp/setup">
                    <Button size="lg" className="gap-2">
                        <Settings className="w-5 h-5" />
                        Start Setup Wizard
                    </Button>
                </Link>
            </div>
        );
    }

    // Connected - show status
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">WhatsApp Business</h1>
                    <p className="text-gray-500">Manage your WhatsApp Business API connection</p>
                </div>
                <Link href="/dashboard/whatsapp/setup">
                    <Button variant="outline" className="gap-2">
                        <Settings className="w-4 h-4" />
                        Reconfigure
                    </Button>
                </Link>
                <Button variant="ghost" className="gap-2 text-gray-500" onClick={async () => {
                    if (!sellerId) return;
                    try {
                        const res = await fetch(`/api/debug/whatsapp-status?seller_id=${sellerId}`);
                        const data = await res.json();
                        alert(JSON.stringify(data, null, 2));
                    } catch (e) {
                        alert('Failed to run troubleshooting');
                    }
                }}>
                    Troubleshoot
                </Button>
            </div>

            {/* Connection Status */}
            <Card className={config.is_verified ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${config.is_verified ? 'bg-green-100' : 'bg-yellow-100'
                            }`}>
                            {config.is_verified ? (
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                                <XCircle className="w-6 h-6 text-yellow-600" />
                            )}
                        </div>
                        <div>
                            <h3 className={`font-semibold ${config.is_verified ? 'text-green-900' : 'text-yellow-900'
                                }`}>
                                {config.is_verified ? 'Connected & Verified' : 'Connection Not Verified'}
                            </h3>
                            <p className={`text-sm ${config.is_verified ? 'text-green-700' : 'text-yellow-700'
                                }`}>
                                {config.is_verified
                                    ? `Verified on ${new Date(config.verified_at).toLocaleDateString()}`
                                    : 'Test your connection to verify'
                                }
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Configuration Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Phone Number ID
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {config.phone_number_id || 'Not set'}
                        </code>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Catalog ID
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {config.catalog_id || 'Not set'}
                        </code>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Links */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <a
                        href="https://business.facebook.com/commerce"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Meta Commerce Manager (Manage Catalog)
                    </a>
                    <a
                        href="https://developers.facebook.com/apps"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Meta Developer Portal (API Settings)
                    </a>
                    <a
                        href="https://business.facebook.com/wa/manage"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                        <ExternalLink className="w-4 h-4" />
                        WhatsApp Manager
                    </a>
                </CardContent>
            </Card>
        </div>
    );
}
