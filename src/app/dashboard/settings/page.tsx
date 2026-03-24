'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    User,
    Building2,
    LogOut,
    Loader2,
    Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/toast';

interface SellerInfo {
    seller_id: string;
    seller_name: string;
    phone_number: string;
    email: string;
    business_type: string;
    city: string;
    gst_number: string;
}

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [seller, setSeller] = useState<SellerInfo | null>(null);
    const [formData, setFormData] = useState({
        seller_name: '',
        phone_number: '',
        email: '',
        business_type: '',
        city: '',
        gst_number: ''
    });
    const toast = useToast();

    useEffect(() => {
        const storedSellerId = localStorage.getItem('seller_id');
        if (storedSellerId) {
            loadSeller(storedSellerId);
        }
    }, []);

    const loadSeller = async (sellerId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('sellers')
                .select('*')
                .eq('seller_id', sellerId)
                .single();

            if (data) {
                setSeller(data);
                setFormData({
                    seller_name: data.seller_name || '',
                    phone_number: data.phone_number || '',
                    email: data.email || '',
                    business_type: data.business_type || '',
                    city: data.city || '',
                    gst_number: data.gst_number || ''
                });
            }
        } catch (error) {
            console.error('Error loading seller:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!seller) return;
        setSaving(true);

        try {
            const { data, error } = await supabase
                .from('sellers')
                .update({
                    seller_name: formData.seller_name,
                    phone_number: formData.phone_number,
                    email: formData.email,
                    business_type: formData.business_type,
                    city: formData.city,
                    gst_number: formData.gst_number
                })
                .eq('seller_id', seller.seller_id)
                .select();

            if (error) {
                console.error('Save error:', error);
                toast.error('Save Failed', error.message);
            } else {
                // Update localStorage and seller state
                localStorage.setItem('seller_name', formData.seller_name);
                setSeller(prev => prev ? { ...prev, ...formData } : null);
                toast.success('Settings Saved', 'Your changes have been saved successfully.');
            }
        } catch (error: unknown) {
            console.error('Error saving:', error);
            toast.error('Error', 'An unexpected error occurred.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        await fetch('/api/auth/magic-session', { method: 'DELETE' }).catch(() => null);
        localStorage.clear();
        sessionStorage.clear();
        router.push('/login');
    };

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account and preferences</p>
            </div>

            {/* Profile Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{seller?.seller_name || 'User'}</h2>
                            <p className="text-gray-500">{seller?.phone_number}</p>
                            <p className="text-sm text-gray-400 mt-1">{seller?.business_type} • {seller?.city}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Business Name</Label>
                            <Input
                                value={formData.seller_name}
                                onChange={(e) => updateField('seller_name', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input
                                value={formData.phone_number}
                                onChange={(e) => updateField('phone_number', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                value={formData.email}
                                onChange={(e) => updateField('email', e.target.value)}
                                type="email"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Business Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Business Type</Label>
                            <Input
                                value={formData.business_type}
                                onChange={(e) => updateField('business_type', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>City</Label>
                            <Input
                                value={formData.city}
                                onChange={(e) => updateField('city', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>GST Number</Label>
                            <Input
                                value={formData.gst_number}
                                onChange={(e) => updateField('gst_number', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Save Button */}
            <Button
                className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                onClick={handleSave}
                disabled={saving}
            >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save All Changes
            </Button>

            {/* Logout */}
            <Card className="border-red-200">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                                <LogOut className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Logout</p>
                                <p className="text-sm text-gray-500">Sign out of your account</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
