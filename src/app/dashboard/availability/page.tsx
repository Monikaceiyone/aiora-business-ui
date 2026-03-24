
'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { dashboardFetch } from '@/lib/dashboard-fetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';

// Helper to format date
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

export default function AvailabilityPage() {
    const [slots, setSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00'); // Default to full day? No, lets do slots.
    // Actually, distinct slots are better for AI booking. 
    // Let's allow adding a specific slot, e.g., 10:00 to 10:30.
    const [slotStart, setSlotStart] = useState('10:00');
    const [duration, setDuration] = useState('30'); // minutes

    const [sellerId, setSellerId] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('seller_id');
        if (stored) setSellerId(stored);
    }, []);

    const fetchSlots = useCallback(async () => {
        if (!sellerId) return;
        setLoading(true);
        try {
            const res = await dashboardFetch(`/api/availability/manage?sellerId=${sellerId}`);
            const data = await res.json();
            if (data.slots) {
                const now = Date.now();
                setSlots(
                    data.slots.filter((slot: { start_time: string }) => {
                        const slotTime = new Date(slot.start_time).getTime();
                        return Number.isFinite(slotTime) && slotTime > now;
                    })
                );
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [sellerId]);

    useEffect(() => {
        if (!sellerId) return;
        fetchSlots();
    }, [sellerId, fetchSlots]);

    useEffect(() => {
        if (!sellerId) return;
        const intervalId = setInterval(() => {
            fetchSlots();
        }, 60000);
        return () => clearInterval(intervalId);
    }, [sellerId, fetchSlots]);

    const handleAddSlot = async () => {
        if (!date || !slotStart || !sellerId) return;

        const startDateTime = new Date(`${date}T${slotStart}`);
        const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60000);

        try {
            const res = await dashboardFetch('/api/availability/manage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sellerId,
                    startTime: startDateTime.toISOString(),
                    endTime: endDateTime.toISOString()
                })
            });

            if (res.ok) {
                fetchSlots();
                // Optional: show toast
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this slot?')) return;
        try {
            await dashboardFetch(`/api/availability/manage?id=${id}`, { method: 'DELETE' });
            fetchSlots();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Availability</h1>
                    <p className="text-gray-500">Manage your open appointment slots.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Add Slot Form */}
                <Card className="md:col-span-1 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Add New Slot</CardTitle>
                        <CardDescription>Open a time for booking</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                <Input
                                    type="date"
                                    className="pl-9"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Start Time</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                <Input
                                    type="time"
                                    className="pl-9"
                                    value={slotStart}
                                    onChange={(e) => setSlotStart(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Duration (Minutes)</Label>
                            <Input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                            />
                        </div>

                        <Button onClick={handleAddSlot} className="w-full bg-[#25D366] hover:bg-[#128C7E]">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Slot
                        </Button>
                    </CardContent>
                </Card>

                {/* Slots List */}
                <Card className="md:col-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Upcoming Open Slots</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-gray-400">Loading...</div>
                        ) : slots.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                                No slots available. Add one to get started.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {slots.map((slot) => (
                                    <div
                                        key={slot.id}
                                        className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 font-medium text-sm">
                                                {new Date(slot.start_time).getDate()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {formatDate(slot.start_time)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Duration: {Math.round((new Date(slot.end_time).getTime() - new Date(slot.start_time).getTime()) / 60000)} mins
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(slot.id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
