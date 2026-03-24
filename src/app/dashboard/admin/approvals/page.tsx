'use client';

import { useState, useEffect } from 'react';
import {
    CheckCircle,
    XCircle,
    Clock,
    Globe,
    Loader2,
    ExternalLink,
    RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/toast';

interface PendingWebsite {
    id: string;
    seller_id: string;
    subdomain: string;
    website_name: string;
    business_name: string;
    tagline: string;
    phone: string;
    email: string;
    whatsapp: string;
    city: string;
    approval_status: string;
    submitted_at: string;
    created_at: string;
    seller?: {
        seller_name: string;
        phone_number: string;
    };
}

export default function AdminApprovalsPage() {
    const toast = useToast();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [websites, setWebsites] = useState<PendingWebsite[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [rejectNotes, setRejectNotes] = useState<{ [key: string]: string }>({});
    const [showRejectInput, setShowRejectInput] = useState<string | null>(null);

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
                loadPendingWebsites();
            } else {
                toast.error('Invalid Password', 'Please enter the correct admin password.');
            }
        } catch {
            toast.error('Error', 'Could not verify credentials.');
        } finally {
            setAuthLoading(false);
        }
    };

    const loadPendingWebsites = async () => {
        setLoading(true);
        try {
            // Simple query without joins to avoid FK errors
            const { data, error } = await supabase
                .from('seller_websites')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Filter by status client-side (handles missing column gracefully)
            const filtered = (data || []).filter(w =>
                w.approval_status === 'pending_approval' ||
                w.approval_status === 'approved' ||
                w.approval_status === 'rejected' ||
                !w.approval_status // Include rows without status (old data)
            );

            setWebsites(filtered);
        } catch (error) {
            console.error('Error loading websites:', error);
            toast.error('Load Failed', 'Could not load pending websites.');
        } finally {
            setLoading(false);
        }
    };

    const approveWebsite = async (website: PendingWebsite) => {
        setProcessing(website.id);
        try {
            await supabase
                .from('seller_websites')
                .update({
                    approval_status: 'approved',
                    is_published: true,
                    admin_notes: null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', website.id);

            toast.success('Website Approved', `${website.subdomain}.website.aiora.live is now ready for DNS setup.`);
            loadPendingWebsites();
        } catch (error) {
            console.error('Error approving:', error);
            toast.error('Approve Failed', 'Could not approve the website.');
        } finally {
            setProcessing(null);
        }
    };

    const rejectWebsite = async (website: PendingWebsite) => {
        const notes = rejectNotes[website.id];
        if (!notes) {
            toast.error('Notes Required', 'Please provide a reason for rejection.');
            return;
        }

        setProcessing(website.id);
        try {
            await supabase
                .from('seller_websites')
                .update({
                    approval_status: 'rejected',
                    is_published: false,
                    admin_notes: notes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', website.id);

            toast.success('Website Rejected', 'The seller will be notified to make changes.');
            setShowRejectInput(null);
            setRejectNotes(prev => ({ ...prev, [website.id]: '' }));
            loadPendingWebsites();
        } catch (error) {
            console.error('Error rejecting:', error);
            toast.error('Reject Failed', 'Could not reject the website.');
        } finally {
            setProcessing(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_approval':
                return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
            case 'approved':
                return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved</span>;
            case 'rejected':
                return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
            default:
                return null;
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center">Admin Access</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            type="password"
                            placeholder="Enter admin password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && checkAuth()}
                        />
                        <Button onClick={checkAuth} className="w-full" disabled={authLoading}>
                            {authLoading ? 'Verifying...' : 'Access Admin Panel'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Website Approvals</h1>
                    <p className="text-sm text-gray-500">Review and approve seller websites</p>
                </div>
                <Button variant="outline" onClick={loadPendingWebsites} className="gap-2 w-full sm:w-auto">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="py-4 text-center">
                        <p className="text-2xl font-bold text-yellow-700">
                            {websites.filter(w => w.approval_status === 'pending_approval').length}
                        </p>
                        <p className="text-sm text-yellow-600">Pending Review</p>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="py-4 text-center">
                        <p className="text-2xl font-bold text-green-700">
                            {websites.filter(w => w.approval_status === 'approved').length}
                        </p>
                        <p className="text-sm text-green-600">Approved</p>
                    </CardContent>
                </Card>
                <Card className="bg-red-50 border-red-200">
                    <CardContent className="py-4 text-center">
                        <p className="text-2xl font-bold text-red-700">
                            {websites.filter(w => w.approval_status === 'rejected').length}
                        </p>
                        <p className="text-sm text-red-600">Rejected</p>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Websites */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        Pending Approval
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    ) : websites.filter(w => w.approval_status === 'pending_approval').length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No websites pending approval</p>
                    ) : (
                        <div className="space-y-4">
                            {websites.filter(w => w.approval_status === 'pending_approval').map((website) => (
                                <div key={website.id} className="border rounded-lg p-3 sm:p-4 bg-yellow-50/50">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <Globe className="w-4 h-4 text-blue-600" />
                                                <span className="font-mono text-blue-700 font-medium text-sm sm:text-base break-all">
                                                    {website.subdomain}.website.aiora.live
                                                </span>
                                                {getStatusBadge(website.approval_status)}
                                            </div>
                                            <p className="font-medium text-gray-900">{website.business_name}</p>
                                            {website.tagline && <p className="text-sm text-gray-600">{website.tagline}</p>}
                                            <div className="mt-2 text-xs text-gray-500 space-y-1">
                                                <p>Seller: {website.seller?.seller_name || website.seller_id}</p>
                                                <p>Phone: {website.phone || website.seller?.phone_number || 'N/A'}</p>
                                                <p>City: {website.city || 'N/A'}</p>
                                                <p>Submitted: {new Date(website.submitted_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => window.open(`/store/${website.subdomain}`, '_blank')}
                                                className="gap-1 flex-1 sm:flex-none"
                                            >
                                                <ExternalLink className="w-3 h-3" /> Preview
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => approveWebsite(website)}
                                                disabled={processing === website.id}
                                                className="bg-green-600 hover:bg-green-700 gap-1 flex-1 sm:flex-none"
                                            >
                                                {processing === website.id ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="w-3 h-3" />
                                                )}
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setShowRejectInput(showRejectInput === website.id ? null : website.id)}
                                                className="text-red-600 border-red-300 hover:bg-red-50 gap-1 flex-1 sm:flex-none"
                                            >
                                                <XCircle className="w-3 h-3" /> Reject
                                            </Button>
                                        </div>
                                    </div>

                                    {showRejectInput === website.id && (
                                        <div className="mt-3 pt-3 border-t flex gap-2">
                                            <Input
                                                placeholder="Reason for rejection..."
                                                value={rejectNotes[website.id] || ''}
                                                onChange={(e) => setRejectNotes(prev => ({ ...prev, [website.id]: e.target.value }))}
                                                className="flex-1"
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() => rejectWebsite(website)}
                                                disabled={processing === website.id}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                Confirm Reject
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Approved Websites - DNS Setup Reminder */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Approved (Need DNS Setup)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {websites.filter(w => w.approval_status === 'approved').length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No approved websites</p>
                    ) : (
                        <div className="space-y-2">
                            {websites.filter(w => w.approval_status === 'approved').map((website) => (
                                <div key={website.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <div>
                                        <span className="font-mono text-green-700 font-medium">
                                            {website.subdomain}.website.aiora.live
                                        </span>
                                        <span className="text-sm text-gray-500 ml-2">({website.business_name})</span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Add to Vercel + Cloudflare DNS
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* DNS Setup Instructions */}
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-blue-900">DNS Setup Instructions</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-800 space-y-2">
                    <p><strong>For each approved website:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Go to <strong>Vercel</strong> → Project → Settings → Domains</li>
                        <li>Add: <code className="bg-blue-100 px-1 rounded">[subdomain].website.aiora.live</code></li>
                        <li>Go to <strong>Cloudflare</strong> → aiora.live → DNS</li>
                        <li>Add CNAME: Name = <code className="bg-blue-100 px-1 rounded">[subdomain].website</code>, Target = <code className="bg-blue-100 px-1 rounded">cname.vercel-dns.com</code></li>
                        <li>Wait 5-10 minutes for propagation</li>
                    </ol>
                </CardContent>
            </Card>
        </div>
    );
}
