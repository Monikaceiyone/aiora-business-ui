'use client';

import { useState } from 'react';
import { Users, GraduationCap, Zap, Rocket, ChevronLeft, ChevronRight } from 'lucide-react';

const actions = [
    { name: 'Hire', icon: Users },
    { name: 'Train', icon: GraduationCap },
    { name: 'Automate', icon: Zap },
    { name: 'Deploy', icon: Rocket },
];

export function ActionSidebar() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
            <div
                className={`
          flex items-center transition-all duration-300 ease-out
          ${isExpanded ? 'translate-x-0' : 'translate-x-[calc(100%-48px)]'}
        `}
            >
                {/* Toggle Button */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-center w-6 h-12 bg-black rounded-l-lg text-white hover:bg-gray-900 transition-colors"
                >
                    {isExpanded ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <ChevronLeft className="w-4 h-4" />
                    )}
                </button>

                {/* Sidebar Content */}
                <div className="bg-black rounded-l-2xl py-4 px-3 shadow-2xl border-l border-t border-b border-white/10">
                    <div className="flex flex-col gap-4">
                        {actions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={action.name}
                                    className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform group"
                                >
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 group-hover:bg-white group-hover:text-black transition-colors">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-medium text-white/80 group-hover:text-white">
                                        {action.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
