'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    loadFacebookSDK,
    launchWhatsAppSignup,
    WhatsAppSignupData
} from '@/lib/facebook-sdk';

interface EmbeddedSignupButtonProps {
    appId: string;
    configId: string;
    onSuccess: (data: WhatsAppSignupData) => void;
    onError: (error: string) => void;
    disabled?: boolean;
}

type SignupState = 'idle' | 'loading-sdk' | 'ready' | 'signing-up' | 'success' | 'error';

export function EmbeddedSignupButton({
    appId,
    configId,
    onSuccess,
    onError,
    disabled = false
}: EmbeddedSignupButtonProps) {
    const [state, setState] = useState<SignupState>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Load Facebook SDK on mount
    useEffect(() => {
        if (!appId) {
            setState('error');
            setErrorMessage('Meta App ID not configured');
            return;
        }

        setState('loading-sdk');
        loadFacebookSDK(appId)
            .then(() => {
                setState('ready');
            })
            .catch((err) => {
                setState('error');
                setErrorMessage(err.message || 'Failed to load Facebook SDK');
                onError(err.message);
            });
    }, [appId, onError]);

    const handleSignup = useCallback(async () => {
        if (!configId) {
            setErrorMessage('Configuration ID not set');
            setState('error');
            onError('Configuration ID not set');
            return;
        }

        setState('signing-up');
        setErrorMessage('');

        try {
            const data = await launchWhatsAppSignup(configId);

            if (data.code || data.accessToken) {
                setState('success');
                onSuccess(data);
            } else {
                throw new Error('No authorization code received');
            }
        } catch (err) {
            setState('error');
            const message = err instanceof Error ? err.message : 'Signup failed';
            setErrorMessage(message);
            onError(message);
        }
    }, [configId, onSuccess, onError]);

    const getButtonContent = () => {
        switch (state) {
            case 'loading-sdk':
                return (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading...
                    </>
                );
            case 'signing-up':
                return (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Connecting...
                    </>
                );
            case 'success':
                return (
                    <>
                        <CheckCircle className="w-5 h-5" />
                        Connected!
                    </>
                );
            case 'error':
                return (
                    <>
                        <AlertCircle className="w-5 h-5" />
                        {errorMessage ? 'Error: Try Again' : 'Try Again'}
                    </>
                );
            default:
                return (
                    <>
                        <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.05-.2-.06-.06-.14-.04-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.62-.2-1.12-.31-1.07-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                        </svg>
                        Connect with WhatsApp
                    </>
                );
        }
    };

    const isDisabled = disabled || state === 'loading-sdk' || state === 'signing-up'; // removed 'success' to allow retry/reset if needed externally, or user can just see it's done. Actually, if success, we probably want it disabled unless reset.


    return (
        <div className="space-y-3">
            <Button
                onClick={handleSignup}
                disabled={isDisabled}
                size="lg"
                className={`w-full gap-3 text-base py-6 ${state === 'success'
                    ? 'bg-green-600 hover:bg-green-700'
                    : state === 'error'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-[#25D366] hover:bg-[#128C7E]'
                    }`}
            >
                {getButtonContent()}
            </Button>

            {state === 'error' && errorMessage && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {state === 'ready' && (
                <p className="text-xs text-gray-500 text-center">
                    Click to open the Meta Business login popup
                </p>
            )}
        </div>
    );
}

export default EmbeddedSignupButton;
