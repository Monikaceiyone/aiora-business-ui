'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Globe,
    Save,
    ExternalLink,
    Upload,
    Loader2,
    Check,
    Copy,
    Eye,
    Palette,
    Building2,
    Phone,
    Plus,
    Trash2,
    ChevronDown,
    Clock,
    CheckCircle,
    XCircle,
    Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/toast';

interface WebsiteConfig {
    id?: string;
    seller_id: string;
    subdomain: string;
    website_name: string;
    website_number: number;
    business_name: string;
    logo_url: string;
    tagline: string;
    description: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    whatsapp: string;
    primary_color: string;
    is_published: boolean;
    approval_status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
    admin_notes?: string;
    submitted_at?: string;
}

const INITIAL_CONFIG: Omit<WebsiteConfig, 'website_number'> = {
    seller_id: '',
    subdomain: '',
    website_name: '',
    business_name: '',
    logo_url: '',
    tagline: '',
    description: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    whatsapp: '',
    primary_color: '#2563eb',
    is_published: false,
    approval_status: 'draft'
};

const COLOR_PRESETS = [
    { name: 'Blue', value: '#2563eb' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Purple', value: '#7c3aed' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Gold', value: '#ca8a04' },
    { name: 'Pink', value: '#db2777' },
    { name: 'Teal', value: '#0d9488' },
    { name: 'Orange', value: '#ea580c' },
];

const MAX_WEBSITES = 2;

const STATUS_CONFIG = {
    draft: {
        label: 'Draft',
        color: 'bg-gray-100 text-gray-700',
        icon: Clock,
        description: 'Save your changes and submit for review when ready.'
    },
    pending_approval: {
        label: 'Under Review',
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        description: 'Your website is being reviewed. You will be notified once approved.'
    },
    approved: {
        label: 'Live',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        description: 'Your website is live and accessible to customers.'
    },
    rejected: {
        label: 'Rejected',
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
        description: 'Your website was not approved. See notes below.'
    }
};

export default function WebsitePage() {
    const toast = useToast();
    const [websites, setWebsites] = useState<WebsiteConfig[]>([]);
    const [selectedWebsite, setSelectedWebsite] = useState<WebsiteConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sellerId, setSellerId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [subdomainError, setSubdomainError] = useState('');
    const [showWebsiteSelector, setShowWebsiteSelector] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const storedSellerId = localStorage.getItem('seller_id');
        if (storedSellerId) {
            setSellerId(storedSellerId);
            loadWebsites(storedSellerId);
        }
    }, []);

    const loadWebsites = async (sellerId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('seller_websites')
                .select('*')
                .eq('seller_id', sellerId)
                .order('website_number', { ascending: true });

            if (data && data.length > 0) {
                setWebsites(data);
                setSelectedWebsite(data[0]);
            } else {
                const newWebsite: WebsiteConfig = {
                    ...INITIAL_CONFIG,
                    seller_id: sellerId,
                    website_number: 1,
                    website_name: 'Main Website'
                } as WebsiteConfig;
                setWebsites([newWebsite]);
                setSelectedWebsite(newWebsite);
            }
        } catch (error) {
            console.error('Error loading websites:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateSubdomain = (value: string) => {
        const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        if (cleaned !== value) {
            setSubdomainError('Only lowercase letters, numbers, and hyphens allowed');
        } else if (cleaned.length < 3) {
            setSubdomainError('Minimum 3 characters');
        } else if (cleaned.length > 30) {
            setSubdomainError('Maximum 30 characters');
        } else {
            setSubdomainError('');
        }
        return cleaned;
    };

    const updateConfig = (field: keyof WebsiteConfig, value: string | boolean) => {
        if (!selectedWebsite) return;

        // Don't allow edits if website is pending or approved
        if (selectedWebsite.approval_status === 'pending_approval' || selectedWebsite.approval_status === 'approved') {
            toast.error('Cannot Edit', 'This website is under review or already approved.');
            return;
        }

        if (field === 'subdomain') {
            value = validateSubdomain(value as string);
        }

        const updated = { ...selectedWebsite, [field]: value };
        setSelectedWebsite(updated);

        setWebsites(prev => prev.map(w =>
            w.website_number === selectedWebsite.website_number ? updated : w
        ));
    };

    const createNewWebsite = () => {
        if (!sellerId || websites.length >= MAX_WEBSITES) return;

        const nextNumber = websites.length + 1;
        const newWebsite: WebsiteConfig = {
            ...INITIAL_CONFIG,
            seller_id: sellerId,
            website_number: nextNumber,
            website_name: `Website ${nextNumber}`
        } as WebsiteConfig;

        setWebsites(prev => [...prev, newWebsite]);
        setSelectedWebsite(newWebsite);
        toast.success('New Website Created', `Website ${nextNumber} is ready to configure.`);
    };

    const deleteWebsite = async () => {
        if (!selectedWebsite || !selectedWebsite.id || websites.length <= 1) {
            toast.error('Cannot Delete', 'You must have at least one website.');
            return;
        }

        if (selectedWebsite.approval_status === 'approved') {
            toast.error('Cannot Delete', 'Cannot delete an approved website. Contact support.');
            return;
        }

        if (!confirm(`Are you sure you want to delete "${selectedWebsite.website_name || selectedWebsite.subdomain}"?`)) {
            return;
        }

        try {
            await supabase
                .from('seller_websites')
                .delete()
                .eq('id', selectedWebsite.id);

            const remaining = websites.filter(w => w.id !== selectedWebsite.id);
            setWebsites(remaining);
            setSelectedWebsite(remaining[0] || null);
            toast.success('Website Deleted', 'The website has been removed.');
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Delete Failed', 'Could not delete the website.');
        }
    };

    const saveConfig = async () => {
        if (!sellerId || !selectedWebsite) return;

        if (!selectedWebsite.subdomain || !selectedWebsite.business_name) {
            toast.error('Missing Fields', 'Please fill in subdomain and business name.');
            return;
        }

        if (selectedWebsite.approval_status === 'pending_approval') {
            toast.error('Cannot Edit', 'This website is under review.');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...selectedWebsite,
                seller_id: sellerId,
                approval_status: selectedWebsite.approval_status === 'rejected' ? 'draft' : selectedWebsite.approval_status,
                updated_at: new Date().toISOString()
            };

            if (selectedWebsite.id) {
                await supabase
                    .from('seller_websites')
                    .update(payload)
                    .eq('id', selectedWebsite.id);
            } else {
                const { data } = await supabase
                    .from('seller_websites')
                    .insert(payload)
                    .select()
                    .single();

                if (data) {
                    setSelectedWebsite(data);
                    setWebsites(prev => prev.map(w =>
                        w.website_number === selectedWebsite.website_number ? data : w
                    ));
                }
            }

            toast.success('Website Saved', 'Your changes have been saved.');
        } catch (error: any) {
            console.error('Error saving:', error);
            if (error.code === '23505') {
                toast.error('Subdomain Taken', 'This subdomain is already in use.');
            } else {
                toast.error('Save Failed', error.message || 'Could not save configuration.');
            }
        } finally {
            setSaving(false);
        }
    };

    const submitForReview = async () => {
        if (!selectedWebsite?.subdomain || !selectedWebsite?.business_name) {
            toast.error('Not Ready', 'Please fill in all required fields first.');
            return;
        }

        if (!selectedWebsite.id) {
            toast.error('Save First', 'Please save the website before submitting.');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                approval_status: 'pending_approval',
                submitted_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await supabase
                .from('seller_websites')
                .update(payload)
                .eq('id', selectedWebsite.id);

            const updated = { ...selectedWebsite, ...payload };
            setSelectedWebsite(updated as WebsiteConfig);
            setWebsites(prev => prev.map(w =>
                w.id === selectedWebsite.id ? updated as WebsiteConfig : w
            ));

            toast.success('Submitted for Review', 'Your website is now under review. We will notify you once approved.');
        } catch (error) {
            console.error('Error submitting:', error);
            toast.error('Submit Failed', 'Could not submit for review.');
        } finally {
            setSaving(false);
        }
    };

    const getPreviewUrl = () => {
        if (!selectedWebsite?.subdomain) return '';
        // Preview works via the /store/[slug] route which is always available
        return `${typeof window !== 'undefined' ? window.location.origin : ''}/store/${selectedWebsite.subdomain}`;
    };

    const getLiveUrl = () => {
        if (!selectedWebsite?.subdomain) return '';
        return `https://${selectedWebsite.subdomain}.website.aiora.live`;
    };

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            updateConfig('logo_url', event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const currentStatus = selectedWebsite?.approval_status || 'draft';
    const statusInfo = STATUS_CONFIG[currentStatus];
    const StatusIcon = statusInfo.icon;
    const canEdit = currentStatus === 'draft' || currentStatus === 'rejected';

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">Your Websites</h1>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${websites.length >= MAX_WEBSITES
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                            }`}>
                            {websites.length}/{MAX_WEBSITES} used
                        </span>
                    </div>
                    <p className="text-gray-500 mt-1">
                        Each account can create up to {MAX_WEBSITES} custom websites for Meta verification
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {websites.length < MAX_WEBSITES && (
                        <Button
                            variant="outline"
                            onClick={createNewWebsite}
                            className="gap-2"
                        >
                            <Plus className="w-4 h-4" /> New Website
                        </Button>
                    )}
                </div>
            </div>

            {/* Action Buttons Bar */}
            {selectedWebsite && (
                <Card className="bg-gradient-to-r from-slate-50 to-gray-50">
                    <CardContent className="py-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusInfo.color}`}>
                                    {statusInfo.label}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {selectedWebsite.website_name || `Website ${selectedWebsite.website_number}`}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                {/* Preview Button - Always available if saved */}
                                {selectedWebsite.id && selectedWebsite.subdomain && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(getPreviewUrl(), '_blank')}
                                        className="gap-2"
                                    >
                                        <Eye className="w-4 h-4" /> Preview
                                    </Button>
                                )}

                                {/* Save Button - Only for drafts */}
                                {canEdit && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={saveConfig}
                                        disabled={saving}
                                        className="gap-2"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Draft
                                    </Button>
                                )}

                                {/* Submit Button - Only for saved drafts */}
                                {canEdit && selectedWebsite.id && selectedWebsite.subdomain && selectedWebsite.business_name && (
                                    <Button
                                        size="sm"
                                        onClick={submitForReview}
                                        disabled={saving}
                                        className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        <Send className="w-4 h-4" /> Submit for Approval
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Website Selector */}
            {websites.length > 1 && (
                <Card className="bg-gray-50">
                    <CardContent className="py-3">
                        <div className="relative">
                            <button
                                onClick={() => setShowWebsiteSelector(!showWebsiteSelector)}
                                className="w-full flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-blue-600" />
                                    <div className="text-left">
                                        <p className="font-medium text-gray-900">
                                            {selectedWebsite?.website_name || `Website ${selectedWebsite?.website_number}`}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {selectedWebsite?.subdomain ? `${selectedWebsite.subdomain}.website.aiora.live` : 'Not configured'}
                                        </p>
                                    </div>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showWebsiteSelector ? 'rotate-180' : ''}`} />
                            </button>

                            {showWebsiteSelector && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                    {websites.map((website) => {
                                        const wStatus = STATUS_CONFIG[website.approval_status || 'draft'];
                                        return (
                                            <button
                                                key={website.website_number}
                                                onClick={() => {
                                                    setSelectedWebsite(website);
                                                    setShowWebsiteSelector(false);
                                                }}
                                                className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left ${selectedWebsite?.website_number === website.website_number ? 'bg-blue-50' : ''
                                                    }`}
                                            >
                                                <Globe className={`w-4 h-4 ${website.approval_status === 'approved' ? 'text-green-600' : 'text-gray-400'}`} />
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">
                                                        {website.website_name || `Website ${website.website_number}`}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {website.subdomain ? `${website.subdomain}.website.aiora.live` : 'Not configured'}
                                                    </p>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full ${wStatus.color}`}>
                                                    {wStatus.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Status Banner */}
            <Card className={`${statusInfo.color.replace('text-', 'border-').replace('100', '200')}`}>
                <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                        <StatusIcon className={`w-5 h-5 ${statusInfo.color.includes('green') ? 'text-green-600' : statusInfo.color.includes('yellow') ? 'text-yellow-600' : statusInfo.color.includes('red') ? 'text-red-600' : 'text-gray-600'}`} />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                                    {statusInfo.label}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{statusInfo.description}</p>
                            {currentStatus === 'rejected' && selectedWebsite?.admin_notes && (
                                <p className="text-sm text-red-700 mt-2 bg-red-50 p-2 rounded">
                                    <strong>Reason:</strong> {selectedWebsite.admin_notes}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Preview URL (Always Available) */}
            {selectedWebsite?.subdomain && (
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <Eye className="w-5 h-5 text-blue-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Preview URL (always available)</p>
                                    <p className="font-mono text-blue-700 font-medium text-sm">{getPreviewUrl()}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyUrl(getPreviewUrl())}
                                    className="gap-2"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                    Copy
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(getPreviewUrl(), '_blank')}
                                    className="gap-2"
                                >
                                    <ExternalLink className="w-4 h-4" /> Preview
                                </Button>
                            </div>
                        </div>

                        {currentStatus === 'approved' && (
                            <div className="mt-4 pt-4 border-t border-blue-200">
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Live URL (for Meta verification)</p>
                                            <p className="font-mono text-green-700 font-medium text-sm">{getLiveUrl()}</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => copyUrl(getLiveUrl())}
                                        className="gap-2 bg-green-600 hover:bg-green-700"
                                    >
                                        <Copy className="w-4 h-4" /> Copy Live URL
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Website Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Website Name (Internal)
                            </label>
                            <Input
                                value={selectedWebsite?.website_name || ''}
                                onChange={(e) => updateConfig('website_name', e.target.value)}
                                placeholder="e.g., Main Store, Gold Collection, etc."
                                disabled={!canEdit}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subdomain *
                            </label>
                            <div className="flex items-center">
                                <Input
                                    value={selectedWebsite?.subdomain || ''}
                                    onChange={(e) => updateConfig('subdomain', e.target.value)}
                                    placeholder="mehtajewellers"
                                    className="rounded-r-none"
                                    disabled={!canEdit}
                                />
                                <span className="bg-gray-100 border border-l-0 rounded-r-md px-3 py-2 text-sm text-gray-500 whitespace-nowrap">
                                    .website.aiora.live
                                </span>
                            </div>
                            {subdomainError && (
                                <p className="text-red-500 text-xs mt-1">{subdomainError}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Business Name *
                            </label>
                            <Input
                                value={selectedWebsite?.business_name || ''}
                                onChange={(e) => updateConfig('business_name', e.target.value)}
                                placeholder="Mehta Emporium Jewellers"
                                disabled={!canEdit}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tagline
                            </label>
                            <Input
                                value={selectedWebsite?.tagline || ''}
                                onChange={(e) => updateConfig('tagline', e.target.value)}
                                placeholder="Trusted Jewellers Since 1985"
                                disabled={!canEdit}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                About Your Business
                            </label>
                            <textarea
                                value={selectedWebsite?.description || ''}
                                onChange={(e) => updateConfig('description', e.target.value)}
                                placeholder="Tell customers about your business..."
                                className="w-full border rounded-md p-2 text-sm min-h-[100px] disabled:bg-gray-100"
                                disabled={!canEdit}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Logo
                            </label>
                            <div className="flex items-center gap-4">
                                {selectedWebsite?.logo_url ? (
                                    <img
                                        src={selectedWebsite.logo_url}
                                        alt="Logo"
                                        className="w-16 h-16 object-contain border rounded"
                                        onError={(e) => (e.currentTarget.src = '/images/defaults/business-logo-placeholder.png')}
                                    />
                                ) : (
                                    <img
                                        src="/images/defaults/business-logo-placeholder.png"
                                        alt="Logo Placeholder"
                                        className="w-16 h-16 object-contain border rounded"
                                    />
                                )}
                                <div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                        disabled={!canEdit}
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="gap-2"
                                        disabled={!canEdit}
                                    >
                                        <Upload className="w-4 h-4" /> Upload Logo
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Info & Theme */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone
                                    </label>
                                    <Input
                                        value={selectedWebsite?.phone || ''}
                                        onChange={(e) => updateConfig('phone', e.target.value)}
                                        placeholder="+91 98765 43210"
                                        disabled={!canEdit}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        WhatsApp
                                    </label>
                                    <Input
                                        value={selectedWebsite?.whatsapp || ''}
                                        onChange={(e) => updateConfig('whatsapp', e.target.value)}
                                        placeholder="+91 98765 43210"
                                        disabled={!canEdit}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <Input
                                    value={selectedWebsite?.email || ''}
                                    onChange={(e) => updateConfig('email', e.target.value)}
                                    placeholder="contact@mehtajewellers.com"
                                    disabled={!canEdit}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <Input
                                    value={selectedWebsite?.address || ''}
                                    onChange={(e) => updateConfig('address', e.target.value)}
                                    placeholder="123 Main Market, Karol Bagh"
                                    disabled={!canEdit}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City
                                </label>
                                <Input
                                    value={selectedWebsite?.city || ''}
                                    onChange={(e) => updateConfig('city', e.target.value)}
                                    placeholder="New Delhi"
                                    disabled={!canEdit}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Palette className="w-4 h-4" />
                                Theme Color
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {COLOR_PRESETS.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => updateConfig('primary_color', color.value)}
                                        disabled={!canEdit}
                                        className={`w-10 h-10 rounded-full border-2 transition-all ${selectedWebsite?.primary_color === color.value
                                            ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                                            : 'hover:scale-105'
                                            } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Delete Website */}
                    {selectedWebsite?.id && websites.length > 1 && canEdit && (
                        <Card className="border-red-200">
                            <CardContent className="py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-red-700">Delete Website</p>
                                        <p className="text-sm text-red-600">This cannot be undone</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={deleteWebsite}
                                        className="text-red-600 border-red-300 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Submit for Review Button */}
            {selectedWebsite && currentStatus === 'draft' && selectedWebsite.subdomain && selectedWebsite.business_name && selectedWebsite.id && (
                <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h3 className="font-medium text-indigo-900">Ready to submit?</h3>
                                <p className="text-sm text-indigo-700">
                                    Submit your website for review. Once approved, it will go live at {getLiveUrl()}
                                </p>
                            </div>
                            <Button
                                onClick={submitForReview}
                                disabled={saving}
                                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                            >
                                <Send className="w-4 h-4" />
                                Submit for Review
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Rejected - Resubmit Button */}
            {selectedWebsite && currentStatus === 'rejected' && selectedWebsite.id && (
                <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h3 className="font-medium text-yellow-900">Make changes and resubmit</h3>
                                <p className="text-sm text-yellow-700">
                                    Address the feedback above, save your changes, then submit again.
                                </p>
                            </div>
                            <Button
                                onClick={submitForReview}
                                disabled={saving || !selectedWebsite.subdomain || !selectedWebsite.business_name}
                                className="gap-2 bg-yellow-600 hover:bg-yellow-700"
                            >
                                <Send className="w-4 h-4" />
                                Resubmit for Review
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
