'use client';

import { useState, useEffect } from 'react';
import { Activity, Users, Pause, FileText, Plus } from 'lucide-react';

const liveFeedItems = [
    { time: '10:42 AM', message: 'Sales agent closed deal', type: 'success' },
    { time: '10:42 AM', message: 'Support agent resolved ticket #123', type: 'info' },
    { time: '10:42 AM', message: 'Marketing agent launched campaign', type: 'info' },
    { time: '10:41 AM', message: 'Finance agent processed invoice batch', type: 'success' },
    { time: '10:40 AM', message: 'Operations agent optimized workflow', type: 'info' },
];

export default function CommandCentrePage() {
    const [systemHealth, setSystemHealth] = useState(98);
    const [activeAgents, setActiveAgents] = useState(12);
    const [activeTasks, setActiveTasks] = useState(34);

    useEffect(() => {
        const interval = setInterval(() => {
            setSystemHealth(prev => Math.min(100, Math.max(95, prev + (Math.random() - 0.5) * 2)));
            setActiveTasks(prev => Math.max(30, prev + Math.floor(Math.random() * 3) - 1));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center px-4 md:px-8 py-8 md:py-16 bg-zinc-900">
            <div className="w-full max-w-4xl">
                {/* Main Card */}
                <div className="bg-zinc-900 rounded-3xl shadow-2xl p-10 border-2 border-white/10">
                    <h1 className="text-3xl font-black text-white mb-8">
                        Command Centre Overview
                    </h1>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* System Health */}
                        <div className="bg-zinc-900 rounded-2xl p-6 text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <Activity className="w-5 h-5 text-white/60" />
                                <h3 className="font-medium text-white/80">System Health</h3>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-6xl font-black">
                                    {Math.round(systemHealth)}%
                                </span>
                            </div>
                            <p className="text-white/50 mt-2">All systems operational</p>
                            <button className="mt-4 w-full py-3 bg-zinc-900 text-white rounded-full font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" />
                                Deploy New Agent
                            </button>
                        </div>

                        {/* Active Agents */}
                        <div className="bg-zinc-900/5 rounded-2xl p-6 border border-white/10">
                            <div className="flex items-center gap-3 mb-4">
                                <Users className="w-5 h-5 text-white/50" />
                                <h3 className="font-medium text-white/70">Active Agents</h3>
                            </div>
                            <div className="flex items-end gap-4">
                                <span className="text-6xl font-black text-white">{activeAgents}</span>
                                <span className="text-white/50 mb-2">Performing {activeTasks} active tasks</span>
                            </div>
                        </div>
                    </div>

                    {/* Live Feed */}
                    <div className="bg-zinc-900/5 rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-2 h-2 bg-zinc-900 rounded-full animate-pulse" />
                            <h3 className="font-medium text-white/70">Live Feed</h3>
                        </div>
                        <div className="space-y-3">
                            {liveFeedItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 py-2 border-b border-white/10 last:border-0"
                                >
                                    <div className={`w-2 h-2 rounded-full mt-2 ${item.type === 'success' ? 'bg-zinc-900' : 'bg-zinc-900/40'
                                        }`} />
                                    <div className="flex-1">
                                        <span className="text-white/40 text-sm">[{item.time}]</span>{' '}
                                        <span className="text-white">{item.message}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 mt-8">
                        <button className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors">
                            <Pause className="w-4 h-4" />
                            Pause All
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 border-2 border-white text-white rounded-full font-medium hover:bg-zinc-900 hover:text-white transition-colors">
                            <FileText className="w-4 h-4" />
                            View Logs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
