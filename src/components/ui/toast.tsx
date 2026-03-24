'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
}

interface ToastContextType {
    showToast: (type: ToastType, title: string, message?: string) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

const toastConfig = {
    success: {
        icon: CheckCircle,
        bg: 'bg-emerald-600',
        iconColor: 'text-emerald-100'
    },
    error: {
        icon: XCircle,
        bg: 'bg-red-600',
        iconColor: 'text-red-100'
    },
    warning: {
        icon: AlertTriangle,
        bg: 'bg-amber-500',
        iconColor: 'text-amber-100'
    },
    info: {
        icon: Info,
        bg: 'bg-blue-600',
        iconColor: 'text-blue-100'
    }
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: ToastType, title: string, message?: string) => {
        const id = Math.random().toString(36).slice(2);
        setToasts(prev => [...prev, { id, type, title, message }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const success = useCallback((title: string, message?: string) => showToast('success', title, message), [showToast]);
    const error = useCallback((title: string, message?: string) => showToast('error', title, message), [showToast]);
    const warning = useCallback((title: string, message?: string) => showToast('warning', title, message), [showToast]);
    const info = useCallback((title: string, message?: string) => showToast('info', title, message), [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
            {children}

            <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-3 pointer-events-none">
                {toasts.map((toast) => {
                    const config = toastConfig[toast.type];
                    const Icon = config.icon;

                    return (
                        <div
                            key={toast.id}
                            className={`
                                pointer-events-auto
                                ${config.bg}
                                text-white rounded-xl shadow-2xl
                                min-w-[320px] max-w-[400px]
                                transform transition-all duration-300
                            `}
                            style={{
                                animation: 'slideIn 0.3s ease-out'
                            }}
                        >
                            <div className="flex items-start gap-3 p-4">
                                <div className="bg-white/20 rounded-lg p-2 flex-shrink-0">
                                    <Icon className={`w-5 h-5 ${config.iconColor}`} />
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <p className="font-semibold text-white text-sm">{toast.title}</p>
                                    {toast.message && (
                                        <p className="text-white/80 text-sm mt-0.5">{toast.message}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="text-white/60 hover:text-white transition-colors p-1 -mr-1 flex-shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="h-1 bg-white/10 overflow-hidden">
                                <div
                                    className="h-full bg-white/30"
                                    style={{
                                        animation: 'shrink 5s linear forwards'
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <style jsx global>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </ToastContext.Provider>
    );
}
