'use client';

import { useEffect, useState } from 'react';
import { supabase, type Conversation } from '@/lib/supabase/client';
import { Calendar, Clock, Phone, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ConversationsPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [sellerId, setSellerId] = useState<string | null>(null);

    useEffect(() => {
        const storedSellerId = localStorage.getItem('seller_id');
        if (storedSellerId) {
            setSellerId(storedSellerId);
        }
    }, []);

    useEffect(() => {
        if (sellerId) {
            fetchConversations();
        }
    }, [sellerId]);

    const fetchConversations = async () => {
        if (!sellerId) return;
        setLoading(true);

        let query = supabase
            .from('conversations')
            .select('*')
            .order('started_at', { ascending: false });

        if (sellerId) {
            query = query.eq('seller_id', sellerId);
        }

        const { data, error } = await query;

        if (!error && data) {
            setConversations(data as Conversation[]);
        }
        setLoading(false);
    };

    const formatDuration = (seconds: number | null | undefined) => {
        if (!seconds || seconds <= 0) return '—';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins === 0) return `${secs}s`;
        return `${mins}m ${secs.toString().padStart(2, '0')}s`;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
                    <p className="text-gray-500">Listen to recorded VOIT calls linked to your bookings</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : conversations.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <PlayCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No conversations found</h3>
                    <p className="text-gray-500">Once VOIT starts sending call recordings, they will appear here.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {conversations.map((conv) => (
                        <div key={conv.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {conv.started_at && new Date(conv.started_at).toLocaleString()}
                                </div>
                                <div className="px-2 py-0.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                                    Mehta's Customer
                                </div>
                            </div>

                            <div className="space-y-2 mb-3">
                                <div className="flex items-center gap-2 text-gray-900">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm">{conv.client_phone || 'Unknown caller'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatDuration(conv.duration_seconds as number | null)}</span>
                                </div>
                            </div>

                            {conv.recording_url && (
                                <audio controls className="w-full mt-2">
                                    <source src={conv.recording_url} />
                                    Your browser does not support the audio element.
                                </audio>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
