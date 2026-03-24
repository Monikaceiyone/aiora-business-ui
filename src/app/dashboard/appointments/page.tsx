'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Appointment, type Conversation } from '@/lib/supabase/client';
import { Calendar, Clock, User, Phone, CheckCircle, XCircle, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AvailabilityManager } from '@/components/dashboard/availability-manager';

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [sellerId, setSellerId] = useState<string | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [upcomingLoading, setUpcomingLoading] = useState(true);

    const [conversationsByAppointment, setConversationsByAppointment] = useState<Record<string, Conversation[]>>({});
    const [activeTab, setActiveTab] = useState<'appointments' | 'availability'>('appointments');

    useEffect(() => {
        const storedSellerId = localStorage.getItem('seller_id');
        if (storedSellerId) {
            setSellerId(storedSellerId);
        }
    }, []);

    useEffect(() => {
        if (sellerId) {
            fetchAppointments();
        }
    }, [selectedDate, sellerId]);

    useEffect(() => {
        if (sellerId) {
            fetchUpcomingAppointments();
        }
    }, [sellerId]);

    const fetchAppointments = async () => {
        if (!sellerId) return;
        setLoading(true);
        // Start of selected day
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);

        // End of selected day
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        let query = supabase
            .from('appointments')
            .select('*')
            .gte('start_time', startOfDay.toISOString())
            .lte('start_time', endOfDay.toISOString())
            .neq('status', 'CANCELLED')
            .order('start_time', { ascending: true });

        if (sellerId) {
            query = query.eq('seller_id', sellerId);
        }

        const { data, error } = await query;

        if (!error && data) {
            setAppointments(data as Appointment[]);
        }
        setLoading(false);
    };

    const fetchUpcomingAppointments = async () => {
        if (!sellerId) return;
        setUpcomingLoading(true);

        const now = new Date();
        const end = new Date();
        end.setDate(end.getDate() + 30);

        let query = supabase
            .from('appointments')
            .select('*')
            .gte('start_time', now.toISOString())
            .lte('start_time', end.toISOString())
            .neq('status', 'CANCELLED')
            .order('start_time', { ascending: true });

        if (sellerId) {
            query = query.eq('seller_id', sellerId);
        }

        const { data, error } = await query;

        if (!error && data) {
            const upcoming = data as Appointment[];
            setUpcomingAppointments(upcoming);

            const appointmentIds = upcoming.map((apt) => apt.appointment_id).filter(Boolean);

            if (appointmentIds.length > 0) {
                const { data: convs, error: convError } = await supabase
                    .from('conversations')
                    .select('*')
                    .in('appointment_id', appointmentIds);

                if (!convError && convs) {
                    const map: Record<string, Conversation[]> = {};
                    (convs as Conversation[]).forEach((conv) => {
                        if (!conv.appointment_id) return;
                        if (!map[conv.appointment_id]) {
                            map[conv.appointment_id] = [];
                        }
                        map[conv.appointment_id].push(conv);
                    });
                    setConversationsByAppointment(map);
                } else {
                    setConversationsByAppointment({});
                }
            } else {
                setConversationsByAppointment({});
            }
        }

        setUpcomingLoading(false);
    };

    const handleConfirm = async (appointmentId: string) => {
        try {
            setActionLoadingId(appointmentId);
            const response = await fetch('/api/vapi/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ appointment_id: appointmentId }),
            });

            if (!response.ok) {
                console.error('Failed to confirm appointment');
                return;
            }

            await fetchAppointments();
        } catch (error) {
            console.error('Error confirming appointment:', error);
        } finally {
            setActionLoadingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'BOOKED': return 'bg-green-100 text-green-700 border-green-200';
            case 'TENTATIVE': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
            case 'COMPLETED': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Appointments & Availability</h1>
                    <p className="text-gray-500">Manage your schedule and doctor availability</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('appointments')}
                            className={cn("px-4 py-2 text-sm font-medium rounded-md transition-all", activeTab === 'appointments' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                        >
                            Appointments
                        </button>
                        <button
                            onClick={() => setActiveTab('availability')}
                            className={cn("px-4 py-2 text-sm font-medium rounded-md transition-all", activeTab === 'availability' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                        >
                            Availability
                        </button>
                    </div>
                </div>

            </div>

            {activeTab === 'availability' ? (
                sellerId ? <AvailabilityManager sellerId={sellerId} /> : <div className="text-center py-8 text-gray-400">Please configure your seller account to manage availability.</div>
            ) : (
                <>
                    {/* Date Picker (Only for appointments tab) */}
                    <div className="flex justify-end mb-6">
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="outline-none text-gray-700"
                            />
                        </div>
                    </div>

                    {/* Upcoming appointments section */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Upcoming (next 30 days)</h2>
                        {upcomingLoading ? (
                            <div className="flex justify-center py-6">
                                <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : upcomingAppointments.length === 0 ? (
                            <p className="text-sm text-gray-500">No upcoming appointments scheduled.</p>
                        ) : (
                            <div className="space-y-3">
                                {upcomingAppointments.map((apt) => {
                                    const convs = conversationsByAppointment[apt.appointment_id] || [];
                                    const firstConv = convs[0];
                                    return (
                                        <div
                                            key={apt.appointment_id}
                                            className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                                        >
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    {apt.client_name}
                                                </div>
                                                <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(apt.start_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </div>
                                                {apt.notes && (
                                                    <div className="mt-2 text-sm text-gray-700">
                                                        <span className="font-semibold">Reason:</span> {apt.notes}
                                                    </div>
                                                )}
                                            </div>
                                            {firstConv && firstConv.recording_url && (
                                                <div className="w-full md:w-64">
                                                    <div className="text-xs text-gray-500 mb-1">VOIT Recording</div>
                                                    <audio controls className="w-full">
                                                        <source src={firstConv.recording_url} />
                                                        Your browser does not support the audio element.
                                                    </audio>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No appointments found</h3>
                            <p className="text-gray-500">No appointments scheduled for this date.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {appointments.map((apt) => (
                                <div key={apt.appointment_id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusColor(apt.status))}>
                                            {apt.status}
                                        </div>
                                        <div className="text-sm text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(apt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Client</div>
                                            <div className="flex items-center gap-2 text-gray-900 font-medium">
                                                <User className="w-4 h-4 text-gray-400" />
                                                {apt.client_name}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Contact</div>
                                            <div className="flex items-center gap-2 text-gray-900">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {apt.client_phone}
                                            </div>
                                        </div>
                                        {apt.notes && (
                                            <div>
                                                <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1 mt-3">Reason / Notes</div>
                                                <p className="text-sm text-gray-700">{apt.notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions (Mock actions for now) */}
                                    {apt.status === 'TENTATIVE' && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                                            <button
                                                className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                onClick={() => handleConfirm(apt.appointment_id)}
                                                disabled={actionLoadingId === apt.appointment_id}
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
