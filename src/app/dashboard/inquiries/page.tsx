'use client';

import { useState, useEffect } from 'react';
import { Inquiry } from '@/lib/supabase/client';
import { MessageSquare, Mail, Phone, Building, Clock, User, FileText, Mic, Image, CheckCircle, Eye, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

type InquiryStatus = 'all' | 'new' | 'viewed' | 'contacted' | 'archived';

export default function InquiriesPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState<InquiryStatus>('all');
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    useEffect(() => {
        fetchInquiries();
    }, [activeStatus]);

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (activeStatus !== 'all') {
                params.set('status', activeStatus);
            }

            const response = await fetch(`/api/inquiries?${params.toString()}`);
            const result = await response.json();

            if (result.success && result.data) {
                setInquiries(result.data);
            } else {
                console.error('Failed to fetch inquiries:', result.error);
                setInquiries([]);
            }
        } catch (error) {
            console.error('Error fetching inquiries:', error);
            setInquiries([]);
        }
        setLoading(false);
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            setActionLoadingId(id);
            const response = await fetch('/api/inquiries', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (response.ok) {
                await fetchInquiries();
            } else {
                console.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setActionLoadingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'viewed': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'contacted': return 'bg-green-100 text-green-700 border-green-200';
            case 'archived': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const statusTabs: { key: InquiryStatus; label: string; count?: number }[] = [
        { key: 'all', label: 'All' },
        { key: 'new', label: 'New' },
        { key: 'viewed', label: 'Viewed' },
        { key: 'contacted', label: 'Contacted' },
        { key: 'archived', label: 'Archived' },
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
                    <p className="text-gray-500">Manage customer inquiries and leads</p>
                </div>

                <div className="text-sm text-gray-500">
                    {inquiries.length} {inquiries.length === 1 ? 'inquiry' : 'inquiries'} found
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-lg mb-6 overflow-x-auto">
                {statusTabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveStatus(tab.key)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap",
                            activeStatus === tab.key
                                ? "bg-white shadow-sm text-gray-900"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : inquiries.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No inquiries found</h3>
                    <p className="text-gray-500">
                        {activeStatus === 'all' 
                            ? 'No inquiries have been submitted yet.' 
                            : `No ${activeStatus} inquiries at the moment.`}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {inquiries.map((inquiry) => (
                        <div 
                            key={inquiry.id} 
                            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
                        >
                            {/* Header with Status */}
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn(
                                    "px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
                                    getStatusColor(inquiry.status)
                                )}>
                                    {inquiry.status}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatDate(inquiry.created_at)}
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-3">
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Name</div>
                                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                                        <User className="w-4 h-4 text-gray-400" />
                                        {inquiry.name}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Email</div>
                                    <div className="flex items-center gap-2 text-gray-900 text-sm">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <a href={`mailto:${inquiry.email}`} className="hover:text-blue-600 truncate">
                                            {inquiry.email}
                                        </a>
                                    </div>
                                </div>

                                {inquiry.phone && (
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Phone</div>
                                        <div className="flex items-center gap-2 text-gray-900 text-sm">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <a href={`tel:${inquiry.phone}`} className="hover:text-blue-600">
                                                {inquiry.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {inquiry.company_name && (
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Company</div>
                                        <div className="flex items-center gap-2 text-gray-900 text-sm">
                                            <Building className="w-4 h-4 text-gray-400" />
                                            {inquiry.company_name}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Interest</div>
                                    <div className="flex items-center gap-2 text-gray-900 text-sm">
                                        <FileText className="w-4 h-4 text-gray-400" />
                                        {inquiry.field_of_interest}
                                    </div>
                                </div>

                                {inquiry.message && (
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Message</div>
                                        <p className="text-sm text-gray-700 line-clamp-3">
                                            {inquiry.message}
                                        </p>
                                    </div>
                                )}

                                {/* Attachments */}
                                {(inquiry.voice_url || inquiry.image_url) && (
                                    <div className="flex items-center gap-3 pt-2">
                                        {inquiry.voice_url && (
                                            <div className="flex items-center gap-1 text-xs text-blue-600">
                                                <Mic className="w-4 h-4" />
                                                <a href={inquiry.voice_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                    Voice Note
                                                </a>
                                            </div>
                                        )}
                                        {inquiry.image_url && (
                                            <div className="flex items-center gap-1 text-xs text-blue-600">
                                                <Image className="w-4 h-4" />
                                                <a href={inquiry.image_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                    Attachment
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            {inquiry.status !== 'archived' && (
                                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                                    {inquiry.status === 'new' && (
                                        <button
                                            className="flex-1 bg-yellow-50 text-yellow-700 py-2 rounded-lg text-sm font-medium hover:bg-yellow-100 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                                            onClick={() => updateStatus(inquiry.id, 'viewed')}
                                            disabled={actionLoadingId === inquiry.id}
                                        >
                                            <Eye className="w-4 h-4" />
                                            Mark Viewed
                                        </button>
                                    )}
                                    {(inquiry.status === 'new' || inquiry.status === 'viewed') && (
                                        <button
                                            className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                                            onClick={() => updateStatus(inquiry.id, 'contacted')}
                                            disabled={actionLoadingId === inquiry.id}
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Contacted
                                        </button>
                                    )}
                                    <button
                                        className="flex-1 bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                                        onClick={() => updateStatus(inquiry.id, 'archived')}
                                        disabled={actionLoadingId === inquiry.id}
                                    >
                                        <Archive className="w-4 h-4" />
                                        Archive
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
