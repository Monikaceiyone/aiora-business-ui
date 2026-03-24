'use client';

import { useState, useEffect, useCallback } from 'react';
import { dashboardFetch } from '@/lib/dashboard-fetch';

export interface VerificationStatus {
    // Phase 1: Prerequisites
    hasMetaBusinessAccount: boolean;
    // Phase 2: WhatsApp Business
    wabaConnected: boolean;
    phoneNumberVerified: boolean;
    // Phase 3: Business Verification
    fbmVerified: boolean;
    // Phase 4: AIORA Backend Setup
    aioraSetupComplete: boolean;
    // Phase 5: Catalog
    catalogSynced: boolean;
    // Phase 6: Meta Verified
    blueTickApproved: boolean;
}

export interface VerificationAssistantState {
    seller_id: string;
    waba_connected: boolean;
    phone_number_id: string | null;
    meta_business_id: string | null;
    deep_link: string | null;
    meta_verification_status: string;
    meta_status_reason: string | null;
    case_id: string | null;
    opened_security_center: boolean;
    docs_prepared: boolean;
    case_submitted: boolean;
    started_at: string | null;
    submitted_at: string | null;
    last_polled_at: string | null;
    last_poll_status: string | null;
    last_poll_error: string | null;
    can_poll: boolean;
}

interface UseVerificationStatusReturn {
    status: VerificationStatus;
    assistant: VerificationAssistantState | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    saveAssistantState: (payload: {
        case_id?: string;
        opened_security_center?: boolean;
        docs_prepared?: boolean;
        case_submitted?: boolean;
        meta_business_id?: string;
    }) => Promise<boolean>;
    pollMetaStatus: () => Promise<boolean>;
    currentPhase: number;
    completedSteps: number;
    totalSteps: number;
}

export function useVerificationStatus(sellerId: string | null): UseVerificationStatusReturn {
    const [status, setStatus] = useState<VerificationStatus>({
        hasMetaBusinessAccount: false,
        wabaConnected: false,
        phoneNumberVerified: false,
        fbmVerified: false,
        aioraSetupComplete: false,
        catalogSynced: false,
        blueTickApproved: false
    });
    const [assistant, setAssistant] = useState<VerificationAssistantState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = useCallback(async () => {
        if (!sellerId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const [verificationRes, productsRes] = await Promise.all([
                dashboardFetch(`/api/verification/status?seller_id=${encodeURIComponent(sellerId)}`),
                dashboardFetch(`/api/catalog/products?seller_id=${encodeURIComponent(sellerId)}&limit=1`)
            ]);

            const verificationJson = await verificationRes.json();
            const productsJson = await productsRes.json().catch(() => ({ products: [] }));

            if (!verificationRes.ok || !verificationJson?.success) {
                throw new Error(verificationJson?.error || 'Failed to fetch verification status');
            }

            const assistantData: VerificationAssistantState = verificationJson.data;
            setAssistant(assistantData);
            const hasProducts =
                (Array.isArray(productsJson?.products) && productsJson.products.length > 0) ||
                (Array.isArray(productsJson?.data) && productsJson.data.length > 0);

            const newStatus: VerificationStatus = {
                hasMetaBusinessAccount: !!assistantData.meta_business_id,
                wabaConnected: assistantData.waba_connected,
                phoneNumberVerified: !!assistantData.phone_number_id,
                fbmVerified: assistantData.meta_verification_status === 'verified',
                // This remains an internal AIORA ops step and can be toggled later if needed.
                aioraSetupComplete: assistantData.meta_verification_status === 'verified',
                catalogSynced: hasProducts,
                blueTickApproved: assistantData.meta_verification_status === 'verified'
            };

            setStatus(newStatus);
        } catch (err: unknown) {
            console.error('Error fetching verification status:', err);
            const message = err instanceof Error ? err.message : 'Failed to fetch verification status';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [sellerId]);

    const saveAssistantState = useCallback(async (payload: {
        case_id?: string;
        opened_security_center?: boolean;
        docs_prepared?: boolean;
        case_submitted?: boolean;
        meta_business_id?: string;
    }): Promise<boolean> => {
        if (!sellerId) return false;
        try {
            const response = await dashboardFetch('/api/verification/status', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seller_id: sellerId,
                    ...payload
                })
            });
            const json = await response.json();
            if (!response.ok || !json?.success) {
                throw new Error(json?.error || 'Failed to save verification state');
            }
            await fetchStatus();
            return true;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to save verification state';
            setError(message);
            return false;
        }
    }, [sellerId, fetchStatus]);

    const pollMetaStatus = useCallback(async (): Promise<boolean> => {
        if (!sellerId) return false;
        try {
            const response = await dashboardFetch('/api/verification/poll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seller_id: sellerId })
            });
            const json = await response.json();
            if (!response.ok || !json?.success) {
                throw new Error(json?.error || 'Failed to poll Meta verification status');
            }
            await fetchStatus();
            return true;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to poll Meta verification status';
            setError(message);
            return false;
        }
    }, [sellerId, fetchStatus]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    // Calculate current phase and progress
    const calculateProgress = (): { currentPhase: number; completedSteps: number } => {
        let completed = 0;
        let phase = 0;

        // Check each step
        if (status.hasMetaBusinessAccount) { completed++; }
        if (status.wabaConnected) { completed++; phase = Math.max(phase, 1); }
        if (status.phoneNumberVerified) { completed++; phase = Math.max(phase, 2); }
        if (status.fbmVerified) { completed++; phase = Math.max(phase, 3); }
        if (status.aioraSetupComplete) { completed++; phase = Math.max(phase, 4); }
        if (status.catalogSynced) { completed++; phase = Math.max(phase, 5); }
        if (status.blueTickApproved) { completed++; phase = 6; }

        return { currentPhase: phase, completedSteps: completed };
    };

    const { currentPhase, completedSteps } = calculateProgress();

    return {
        status,
        assistant,
        loading,
        error,
        refresh: fetchStatus,
        saveAssistantState,
        pollMetaStatus,
        currentPhase,
        completedSteps,
        totalSteps: 7
    };
}
