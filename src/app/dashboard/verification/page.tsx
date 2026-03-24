'use client';

import { useState, useEffect } from 'react';
import {
    BadgeCheck,
    FileText,
    ExternalLink,
    RefreshCw,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VerificationStep, StepStatus } from '@/components/verification/VerificationStep';
import { VerificationProgress } from '@/components/verification/VerificationProgress';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';
import { EmbeddedSignupButton } from '@/components/whatsapp/embedded-signup';
import { useToast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';

const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID || '';
const CONFIG_ID = process.env.NEXT_PUBLIC_FB_CONFIG_ID || '2691641021170000';

const PHASE_NAMES = ['Setup', 'Connect', 'Trigger', 'Submit', 'Review', 'Scale', 'Done'];

export default function VerificationGuidePage() {
    const [sellerId] = useState<string | null>(() => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('seller_id');
    });
    const [sellerName] = useState(() => {
        if (typeof window === 'undefined') return 'Your Business';
        return localStorage.getItem('seller_name') || 'Your Business';
    });
    const {
        status,
        assistant,
        loading,
        error,
        refresh,
        pollMetaStatus,
        saveAssistantState,
        currentPhase,
        completedSteps,
        totalSteps
    } = useVerificationStatus(sellerId);
    const { success, error: toastError } = useToast();
    const [isPolling, setIsPolling] = useState(false);
    const [isSavingCase, setIsSavingCase] = useState(false);
    const [caseIdInput, setCaseIdInput] = useState('');

    // Auto-poll for status updates every 60 seconds
    useEffect(() => {
        if (!sellerId) return;

        const interval = setInterval(() => {
            pollMetaStatus();
        }, 60000);

        return () => clearInterval(interval);
    }, [sellerId, pollMetaStatus]);

    const handleManualRefresh = async () => {
        setIsPolling(true);
        const ok = await pollMetaStatus();
        if (!ok) await refresh();
        setIsPolling(false);
        if (ok) success('Meta verification status refreshed');
    };

    const handleEmbeddedSignupSuccess = async () => {
        success('WhatsApp Business connected successfully!');
        await refresh();
    };

    const handleEmbeddedSignupError = (errorMsg: string) => {
        toastError('Connection Failed', errorMsg);
    };

    const handleOpenSecurityCenter = async () => {
        if (!assistant?.deep_link) {
            toastError('Missing Meta Business ID', 'Connect WhatsApp first to generate your Meta business context.');
            return;
        }
        window.open(assistant.deep_link, '_blank', 'noopener,noreferrer');
        await saveAssistantState({ opened_security_center: true });
        success('Opened Meta Security Center');
    };

    const handleSaveCaseId = async () => {
        if (!caseIdInput.trim()) {
            toastError('Case ID required', 'Paste the case ID shown by Meta after submitting verification.');
            return;
        }
        setIsSavingCase(true);
        const ok = await saveAssistantState({ case_id: caseIdInput.trim(), case_submitted: true });
        setIsSavingCase(false);
        if (ok) success('Case ID saved');
    };

    // Determine step statuses
    const getStepStatus = (isComplete: boolean, prereqMet: boolean): StepStatus => {
        if (isComplete) return 'completed';
        if (!prereqMet) return 'blocked';
        return 'action_required';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Meta Verification Guide</h1>
                    <p className="text-gray-500 mt-1">Scale messaging for {sellerName} with guided verification</p>
                </div>
                <Button
                    variant="outline"
                    onClick={handleManualRefresh}
                    disabled={isPolling}
                >
                    {isPolling ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Refresh Status
                </Button>
            </div>

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6 text-red-700 flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 mt-0.5" />
                        <p className="text-sm">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Progress Overview */}
            <VerificationProgress
                currentPhase={currentPhase}
                totalPhases={PHASE_NAMES.length}
                completedSteps={completedSteps}
                totalSteps={totalSteps}
                phaseNames={PHASE_NAMES}
            />

            <Card className="bg-indigo-50 border-indigo-200">
                <CardHeader>
                    <CardTitle className="text-lg">Guided Automation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-indigo-900">
                    <p>
                        Meta does not allow silent app creation. This flow automates what is feasible:
                        deep-linking to your exact security center, persistent checklist tracking, and API polling.
                    </p>
                    <div className="text-xs text-indigo-700">
                        Status: <span className="font-semibold">{assistant?.meta_verification_status || 'unknown'}</span>
                        {assistant?.last_polled_at && (
                            <span> • Last checked: {new Date(assistant.last_polled_at).toLocaleString()}</span>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Steps */}
            <div className="space-y-4">

                {/* Step 1: Prerequisites */}
                <VerificationStep
                    stepNumber={1}
                    title="Prerequisites Check"
                    description="Ensure you have all required documents and business details"
                    status={status.hasMetaBusinessAccount ? 'completed' : 'action_required'}
                    estimatedTime="5 minutes"
                    instructions={[
                        'Keep your business PAN card ready',
                        'Keep your GST registration certificate',
                        'Have a valid business email address',
                        'Prepare a phone number NOT linked to personal WhatsApp'
                    ]}
                >
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                        <h4 className="font-medium text-yellow-800 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Documents You&apos;ll Need
                        </h4>
                        <ul className="mt-2 space-y-1 text-sm text-yellow-700">
                            <li>✓ Business PAN Card</li>
                            <li>✓ GST Certificate (if applicable)</li>
                            <li>✓ Business Address Proof (utility bill, bank statement)</li>
                            <li>✓ Business License / Registration</li>
                        </ul>
                    </div>
                </VerificationStep>

                {/* Step 2: Connect WhatsApp Business */}
                <VerificationStep
                    stepNumber={2}
                    title="Connect WhatsApp Business Account"
                    description="Complete embedded signup to create/link your WABA asset"
                    status={status.wabaConnected ? 'completed' : getStepStatus(false, true)}
                    isEmbedded={true}
                    estimatedTime="10 minutes"
                    instructions={[
                        'Click the button below to open Meta\'s secure popup',
                        'Log in with your Facebook account',
                        'Create or select a Meta Business Account',
                        'Create a WhatsApp Business Profile',
                        'Verify your phone number with OTP',
                        'Grant the required permissions'
                    ]}
                    actionLabel="Connect with Meta"
                >
                    {!status.wabaConnected && (
                        <div className="mt-4">
                            <EmbeddedSignupButton
                                appId={META_APP_ID}
                                configId={CONFIG_ID}
                                onSuccess={handleEmbeddedSignupSuccess}
                                onError={handleEmbeddedSignupError}
                            />
                        </div>
                    )}
                    {status.wabaConnected && (
                        <div className="flex items-center gap-2 text-green-600 mt-2">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-medium">WhatsApp Business Account Connected</span>
                        </div>
                    )}
                </VerificationStep>

                {/* Step 3: Facebook Business Verification */}
                <VerificationStep
                    stepNumber={3}
                    title="Trigger Verification Flow"
                    description="Open Meta Security Center using your exact business context"
                    status={status.fbmVerified ? 'completed' : getStepStatus(false, status.wabaConnected)}
                    estimatedTime="2 minutes"
                    instructions={[
                        'Click "Scale to Big Tier"',
                        'Meta Security Center opens for your specific Business ID',
                        'Click Start Verification when shown',
                        'Return here and mark progress'
                    ]}
                    onAction={handleOpenSecurityCenter}
                    actionLabel="Scale to Big Tier"
                >
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                        <h4 className="font-medium text-blue-800">Deep Link</h4>
                        <p className="text-sm text-blue-700 mt-1 break-all">
                            {assistant?.deep_link || 'Connect WABA first to enable deep link'}
                        </p>
                    </div>
                </VerificationStep>

                {/* Step 4: AIORA Backend Setup */}
                <VerificationStep
                    stepNumber={4}
                    title="Submit Case ID & Checklist"
                    description="Track your verification submission state inside AIORA"
                    status={assistant?.case_submitted ? 'completed' : getStepStatus(false, status.wabaConnected)}
                    estimatedTime="3 minutes"
                >
                    <div className="space-y-3 mt-2">
                        <div className="flex items-center gap-2">
                            <input
                                id="docs-prepared"
                                type="checkbox"
                                checked={!!assistant?.docs_prepared}
                                onChange={async (e) => {
                                    await saveAssistantState({ docs_prepared: e.target.checked });
                                }}
                            />
                            <label htmlFor="docs-prepared" className="text-sm text-gray-700">
                                I prepared and uploaded required business documents
                            </label>
                        </div>
                        <div className="space-y-2">
                            <Input
                                value={caseIdInput}
                                onChange={(e) => setCaseIdInput(e.target.value)}
                                placeholder={assistant?.case_id || 'Paste Meta verification case ID'}
                            />
                            <Button onClick={handleSaveCaseId} disabled={isSavingCase}>
                                {isSavingCase ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : null}
                                Save Case ID
                            </Button>
                        </div>
                    </div>
                </VerificationStep>

                {/* Step 5: Sync Catalog */}
                <VerificationStep
                    stepNumber={5}
                    title="Poll Meta Verification Status"
                    description="Check live status from Graph API and update your dashboard state"
                    status={status.fbmVerified ? 'completed' : getStepStatus(false, status.wabaConnected)}
                    estimatedTime="1 minute"
                    instructions={[
                        'Use Refresh Status to poll Meta Graph API',
                        'If status remains unknown, wait and retry after a few minutes',
                        'When approved, status changes to verified automatically'
                    ]}
                    onAction={handleManualRefresh}
                    actionLabel="Check Verification Status"
                >
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2 text-sm text-gray-700">
                        <div><span className="font-medium">Normalized status:</span> {assistant?.meta_verification_status || 'unknown'}</div>
                        <div><span className="font-medium">Raw status:</span> {assistant?.last_poll_status || 'not checked yet'}</div>
                        {assistant?.last_poll_error && (
                            <div className="text-red-600 mt-1">
                                <span className="font-medium">Polling error:</span> {assistant.last_poll_error}
                            </div>
                        )}
                    </div>
                </VerificationStep>

                {/* Step 6: Apply for Meta Verified */}
                <VerificationStep
                    stepNumber={6}
                    title="Scale Your Messaging Tier"
                    description="After verification approval, proceed with higher quality and messaging scale"
                    status={status.fbmVerified ? 'completed' : 'blocked'}
                    externalUrl="https://www.facebook.com/verified"
                    estimatedTime="Ongoing"
                    instructions={[
                        'Maintain high quality rating and low block rates',
                        'Continue gradual scale-up after verification',
                        'Use Meta Manager for final trust/compliance settings'
                    ]}
                    actionLabel="Open Meta Verified"
                >
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
                        <h4 className="font-medium text-purple-800 flex items-center gap-2">
                            <BadgeCheck className="w-5 h-5" />
                            Meta Verified Benefits
                        </h4>
                        <ul className="mt-2 space-y-1 text-sm text-purple-700">
                            <li>✓ Official blue tick verification badge</li>
                            <li>✓ Increased visibility in search results</li>
                            <li>✓ Enhanced trust with customers</li>
                            <li>✓ Access to premium features</li>
                        </ul>
                    </div>
                </VerificationStep>

                {/* Step 7: Completion */}
                <VerificationStep
                    stepNumber={7}
                    title="Verification Complete"
                    description="Congratulations! Your business is now Meta Verified"
                    status={status.fbmVerified ? 'completed' : 'blocked'}
                    estimatedTime="Done!"
                >
                    {status.fbmVerified && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <BadgeCheck className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-green-700">🎉 You&apos;re Verified!</h3>
                            <p className="text-gray-600 mt-2">
                                Your business now has the official Meta blue tick.
                            </p>
                        </div>
                    )}
                </VerificationStep>

            </div>

            {/* Help Section */}
            <Card className="bg-gray-50 border-gray-200">
                <CardHeader>
                    <CardTitle className="text-lg">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <a
                        href="https://www.facebook.com/business/help"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Meta Business Help Center
                    </a>
                    <a
                        href="https://developers.facebook.com/docs/whatsapp/embedded-signup"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                        <ExternalLink className="w-4 h-4" />
                        WhatsApp Embedded Signup Documentation
                    </a>
                </CardContent>
            </Card >
        </div >
    );
}
