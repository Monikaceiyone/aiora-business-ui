'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    MessageCircle,
    CheckCircle,
    ChevronRight,
    ChevronLeft,
    Loader2,
    AlertCircle,
    Sparkles,
    Shield,
    Zap,
    ArrowRight,
    PartyPopper,
    Phone,
    Building2,
    ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmbeddedSignupButton } from '@/components/whatsapp/embedded-signup';
import { WhatsAppSignupData } from '@/lib/facebook-sdk';
import { dashboardFetch } from '@/lib/dashboard-fetch';
import { Input } from '@/components/ui/input';

// Get these from environment or config
const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID || '';
const FB_CONFIG_ID = process.env.NEXT_PUBLIC_FB_CONFIG_ID || '';

interface SignupResult {
    waba_id: string;
    phone_number_id: string;
    display_phone_number: string;
    business_name: string;
    selection_source?: 'fallback';
}

interface BusinessOption {
    id: string;
    name: string;
}

interface WabaOption {
    waba_id: string;
    name: string;
    phone: string;
    owner_business: string;
}

const STEPS = [
    { id: 1, title: 'Welcome', description: 'Get started with WhatsApp Business' },
    { id: 2, title: 'Connect', description: 'Link your Meta Business Account' },
    { id: 3, title: 'Complete', description: 'You\'re all set!' },
];

export default function WhatsAppSetupWizard() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errorDetails, setErrorDetails] = useState<{ redirectUri?: string; exchangeError?: unknown; testError?: unknown } | null>(null);
    const [sellerId, setSellerId] = useState<string | null>(null);
    const [signupResult, setSignupResult] = useState<SignupResult | null>(null);
    const [pendingSignupData, setPendingSignupData] = useState<WhatsAppSignupData | null>(null);
    const [businessOptions, setBusinessOptions] = useState<BusinessOption[]>([]);
    const [wabaOptions, setWabaOptions] = useState<WabaOption[]>([]);
    const [selectionRequired, setSelectionRequired] = useState(false);
    const [manualWabaId, setManualWabaId] = useState('');
    const [showManualSetup, setShowManualSetup] = useState(false);

    useEffect(() => {
        const storedSellerId = localStorage.getItem('seller_id');
        if (storedSellerId) {
            setSellerId(storedSellerId);
        }
    }, []);

    const completeSignup = async (data: WhatsAppSignupData, selectedBusinessIdOverride?: string) => {
        if (!sellerId) {
            setError('Seller ID not found. Please log in again.');
            return;
        }

        setLoading(true);
        setError('');
        setErrorDetails(null);

        try {
            const response = await dashboardFetch('/api/whatsapp/embedded-signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: data.code,
                    accessToken: data.accessToken, // Explicitly send access token for bypass strategy
                    seller_id: sellerId,
                    waba_id: data.wabaId || undefined,
                    phone_number_id: data.phoneNumberId || undefined,
                    selected_business_id: selectedBusinessIdOverride || data.selectedBusinessId || undefined,
                    strict_selection: true,
                    // MIRROR STRATEGY: Use the exact page URL including query params
                    // We only strip the hash
                    redirect_uri: window.location.href.split('#')[0]
                }),
            });

            const result = await response.json();

            if (result.success) {
                setSignupResult(result.data as SignupResult);
                setPendingSignupData(null);
                setBusinessOptions([]);
                setWabaOptions([]);
                setSelectionRequired(false);
                setCurrentStep(3);
            } else if (result.code === 'business_selection_required' && Array.isArray(result.businesses)) {
                setPendingSignupData(data);
                setBusinessOptions(result.businesses as BusinessOption[]);
                setSelectionRequired(true);
                setError('Select your business below to continue setup.');
            } else if (result.code === 'waba_selection_required' && Array.isArray(result.waba_options)) {
                setPendingSignupData(data);
                setWabaOptions(result.waba_options as WabaOption[]);
                setSelectionRequired(true);
                setError('Multiple WhatsApp accounts found. Select the one you want to connect:');
            } else {
                setError(result.error || 'Failed to complete setup');
                // Capture detailed error information for debugging
                if (result.details) {
                    setErrorDetails(result.details);
                    console.error('[Setup] Meta auth error details:', result.details);
                }
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignupSuccess = async (data: WhatsAppSignupData) => {
        await completeSignup(data);
    };

    const handleBusinessSelection = async (businessId: string) => {
        if (!pendingSignupData) return;
        await completeSignup(pendingSignupData, businessId);
    };

    const handleWabaSelection = async (wabaId: string) => {
        if (!pendingSignupData) return;
        // Re-call completeSignup but inject the chosen waba_id directly
        if (!sellerId) return;
        setLoading(true);
        setError('');
        try {
            const response = await dashboardFetch('/api/whatsapp/embedded-signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: pendingSignupData.code,
                    accessToken: pendingSignupData.accessToken,
                    seller_id: sellerId,
                    waba_id: wabaId,
                    selected_business_id: pendingSignupData.selectedBusinessId || undefined,
                    strict_selection: true,
                    redirect_uri: window.location.href.split('#')[0]
                }),
            });
            const result = await response.json();
            if (result.success) {
                setSignupResult(result.data as SignupResult);
                setPendingSignupData(null);
                setWabaOptions([]);
                setSelectionRequired(false);
                setCurrentStep(3);
            } else {
                setError(result.error || 'Failed to complete setup');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignupError = (errorMsg: string) => {
        setError(errorMsg);
    };

    const goToDashboard = () => {
        router.push('/dashboard/whatsapp');
    };

    const handleManualSubmit = async () => {
        if (!sellerId || !manualWabaId.trim()) {
            setError('WABA ID is required.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await dashboardFetch('/api/whatsapp/manual-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seller_id: sellerId,
                    waba_id: manualWabaId.trim(),
                }),
            });
            const result = await response.json();
            if (result.success) {
                setSignupResult(result.data as SignupResult);
                setShowManualSetup(false);
                setCurrentStep(3);
            } else {
                setError(result.error || 'Manual setup failed.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-8">
                        {/* Hero Section */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <MessageCircle className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                Connect WhatsApp Business API
                            </h2>
                            <p className="text-gray-600 max-w-md mx-auto">
                                Start receiving orders directly from WhatsApp in just a few clicks.
                            </p>
                        </div>

                        {/* Benefits */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                                <Zap className="w-8 h-8 text-blue-600 mb-3" />
                                <h3 className="font-semibold text-gray-900 mb-1">Instant Setup</h3>
                                <p className="text-sm text-gray-600">
                                    Connect in under 5 minutes with our streamlined flow
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                                <Shield className="w-8 h-8 text-green-600 mb-3" />
                                <h3 className="font-semibold text-gray-900 mb-1">Secure & Official</h3>
                                <p className="text-sm text-gray-600">
                                    Direct integration with Meta's official APIs
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                                <Sparkles className="w-8 h-8 text-purple-600 mb-3" />
                                <h3 className="font-semibold text-gray-900 mb-1">Full Features</h3>
                                <p className="text-sm text-gray-600">
                                    Access catalogs, messaging, and order management
                                </p>
                            </div>
                        </div>

                        {/* What you'll need */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                            <h3 className="font-semibold text-amber-900 mb-3">What you&apos;ll need:</h3>
                            <ul className="space-y-2 text-sm text-amber-800">
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-amber-600" />
                                    A Facebook account (personal or business)
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-amber-600" />
                                    A phone number not currently on WhatsApp
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-amber-600" />
                                    Your business name and website
                                </li>
                            </ul>
                        </div>

                        {/* CTA */}
                        <Button
                            onClick={() => setCurrentStep(2)}
                            size="lg"
                            className="w-full gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-lg py-6"
                        >
                            Get Started
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                Connect with Meta
                            </h2>
                            <p className="text-gray-600">
                                Click the button below to sign in and authorize WhatsApp access
                            </p>
                        </div>

                        {/* Missing Configuration Warning */}
                        {(!META_APP_ID || !FB_CONFIG_ID) && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-red-900">Configuration Required</h4>
                                        <p className="text-sm text-red-700 mt-1">
                                            Please add the following to your <code className="bg-red-100 px-1 rounded">.env.local</code>:
                                        </p>
                                        <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-x-auto">
                                            {`NEXT_PUBLIC_META_APP_ID=your_app_id
NEXT_PUBLIC_FB_CONFIG_ID=your_config_id
META_APP_SECRET=your_app_secret`}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Signup Button - Force reset on error by changing key */}
                        <EmbeddedSignupButton
                            key={`signup-btn-${error ? 'error' : 'normal'}`}
                            appId={META_APP_ID}
                            configId={FB_CONFIG_ID}
                            onSuccess={handleSignupSuccess}
                            onError={handleSignupError}
                            disabled={loading || !META_APP_ID || !FB_CONFIG_ID}
                        />

                        {selectionRequired && businessOptions.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                                <p className="text-sm font-semibold text-blue-900">
                                    Select the Meta Business you want to connect
                                </p>
                                <div className="grid gap-2">
                                    {businessOptions.map((biz) => (
                                        <Button
                                            key={biz.id}
                                            type="button"
                                            variant="outline"
                                            className="justify-start"
                                            onClick={() => handleBusinessSelection(biz.id)}
                                            disabled={loading}
                                        >
                                            {biz.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectionRequired && wabaOptions.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                                <p className="text-sm font-semibold text-blue-900">
                                    Select the WhatsApp account to connect
                                </p>
                                <div className="grid gap-2">
                                    {wabaOptions.map((waba) => (
                                        <Button
                                            key={waba.waba_id}
                                            type="button"
                                            variant="outline"
                                            className="justify-start text-left h-auto py-3"
                                            onClick={() => handleWabaSelection(waba.waba_id)}
                                            disabled={loading}
                                        >
                                            <div>
                                                <div className="font-medium">{waba.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {waba.phone && <span>{waba.phone} · </span>}
                                                    {waba.owner_business}
                                                </div>
                                            </div>
                                        </Button>
                                    ))}
                                </div>

                                {/* Manual WABA ID input for when discovery can't find it */}
                                <div className="border-t border-blue-200 pt-3 mt-3">
                                    <p className="text-xs text-blue-800 mb-2">
                                        Don&apos;t see your account? Enter the WABA ID manually:
                                    </p>
                                    <div className="flex gap-2">
                                        <Input
                                            value={manualWabaId}
                                            onChange={(e) => setManualWabaId(e.target.value)}
                                            placeholder="e.g. 709925338779454"
                                            className="flex-1 bg-white"
                                        />
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                if (manualWabaId.trim()) handleWabaSelection(manualWabaId.trim());
                                            }}
                                            disabled={loading || !manualWabaId.trim()}
                                            size="sm"
                                        >
                                            Connect
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="flex items-center justify-center gap-3 text-gray-600">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Completing setup...</span>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-red-900 mb-1">Authentication Failed</h4>
                                        <p className="text-sm text-red-700">{error}</p>

                                        {/* Specific Help for Domain Error */}
                                        {error.includes('domain of this URL') && (
                                            <div className="mt-3 bg-white border border-red-100 rounded p-3">
                                                <p className="text-sm font-semibold text-red-800 mb-2">
                                                    Action Required: Whitelist Domain
                                                </p>
                                                <ol className="list-decimal list-inside text-sm text-red-700 space-y-1">
                                                    <li>Go to <a href="https://developers.facebook.com/apps" target="_blank" className="underline">Meta App Dashboard</a></li>
                                                    <li>Select your App &gt; <strong>Settings</strong> &gt; <strong>Basic</strong></li>
                                                    <li>Find <strong>App Domains</strong> field</li>
                                                    <li>Add this domain: <code className="bg-red-50 px-1 rounded font-mono">{window.location.hostname}</code></li>
                                                    <li>Click <strong>Save Changes</strong> at the bottom</li>
                                                </ol>
                                            </div>
                                        )}

                                        {errorDetails && (
                                            <details className="mt-3">
                                                <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800 font-medium">
                                                    Show technical details
                                                </summary>
                                                <div className="mt-2 bg-red-100 rounded p-3 text-xs space-y-2">
                                                    {errorDetails.redirectUri && (
                                                        <div>
                                                            <span className="font-semibold">Redirect URI:</span> {errorDetails.redirectUri}
                                                        </div>
                                                    )}
                                                    {errorDetails.exchangeError != null ? (
                                                        <div>
                                                            <span className="font-semibold">Token Exchange Error:</span>
                                                            <pre className="mt-1 overflow-x-auto whitespace-pre-wrap">
                                                                {JSON.stringify(errorDetails.exchangeError, null, 2)}
                                                            </pre>
                                                        </div>
                                                    ) : null}
                                                    {errorDetails.testError != null ? (
                                                        <div>
                                                            <span className="font-semibold">Token Test Error:</span>
                                                            <pre className="mt-1 overflow-x-auto whitespace-pre-wrap">
                                                                {JSON.stringify(errorDetails.testError, null, 2)}
                                                            </pre>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </details>
                                        )}

                                        <div className="mt-3 text-xs text-red-600">
                                            <p className="font-medium mb-1">Common fixes:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Verify Meta App has <code className="bg-red-100 px-1 rounded">{errorDetails?.redirectUri ?? 'https://dashboard.aiora.live/'}</code> in OAuth Redirect URIs</li>
                                                <li>Ensure your Meta App is in &quot;Live&quot; mode (not Development)</li>
                                                <li>Try again - authorization codes expire quickly</li>
                                                <li>Disable ad-blockers</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* What happens next */}
                        <div className="bg-gray-50 rounded-xl p-5 mt-6">
                            <h4 className="font-medium text-gray-900 mb-3">What happens when you click:</h4>
                            <ol className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                                    A popup will open for Meta login
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                                    Create or select your Meta Business Account
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                                    Verify your business phone number
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                                    Grant permissions and you&apos;re done!
                                </li>
                            </ol>
                        </div>

                        {/* Alternative: Manual Setup */}
                        <div className="text-center pt-4 border-t">
                            <button
                                onClick={() => setShowManualSetup(!showManualSetup)}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                {showManualSetup ? 'Back to automatic setup' : 'Having trouble? Configure manually'}
                            </button>
                        </div>

                        {showManualSetup && (
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mt-4 space-y-4">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Manual Configuration</h4>
                                    <p className="text-xs text-gray-500">
                                        Enter the WABA ID. Phone number and business name are fetched automatically.
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">WABA ID</label>
                                    <Input
                                        value={manualWabaId}
                                        onChange={(e) => setManualWabaId(e.target.value)}
                                        placeholder="e.g. 709925338779454"
                                        className="bg-white"
                                    />
                                </div>

                                <Button
                                    onClick={handleManualSubmit}
                                    disabled={loading || !manualWabaId.trim()}
                                    className="w-full gap-2"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-4 h-4" />
                                    )}
                                    Save Configuration
                                </Button>
                            </div>
                        )}
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6 text-center">
                        {/* Success Animation */}
                        <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                                <PartyPopper className="w-12 h-12 text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                                <Sparkles className="w-4 h-4 text-yellow-800" />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                You&apos;re All Set! 🎉
                            </h2>
                            <p className="text-gray-600">
                                WhatsApp Business API is now connected to your account
                            </p>
                        </div>

                        {/* Connection Details */}
                        {signupResult && (
                            <div className="bg-gray-50 rounded-xl p-6 text-left space-y-4">
                                <h4 className="font-semibold text-gray-900">Connection Details</h4>

                                <div className="space-y-3">
                                    {signupResult.business_name && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Business Name</p>
                                                <p className="font-medium text-gray-900">{signupResult.business_name}</p>
                                            </div>
                                        </div>
                                    )}

                                    {signupResult.display_phone_number && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <Phone className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Phone Number</p>
                                                <p className="font-medium text-gray-900">{signupResult.display_phone_number}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Status</p>
                                            <p className="font-medium text-green-600">Connected & Verified</p>
                                        </div>
                                    </div>
                                </div>
                                {signupResult.selection_source === 'fallback' && (
                                    <p className="text-amber-700 text-sm mt-3 bg-amber-50 p-3 rounded-lg">
                                        If you have multiple Meta businesses, confirm this is the correct one. Otherwise, disconnect and retry.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Next Steps */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-left">
                            <h4 className="font-semibold text-blue-900 mb-2">What&apos;s next?</h4>
                            <ul className="space-y-1 text-sm text-blue-800">
                                <li>• Add products to your catalog</li>
                                <li>• Set up your WhatsApp welcome message</li>
                                <li>• Start receiving orders!</li>
                            </ul>
                        </div>

                        <Button
                            onClick={goToDashboard}
                            size="lg"
                            className="w-full gap-2 text-lg py-6"
                        >
                            Go to WhatsApp Dashboard
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">WhatsApp Setup</h1>
                <p className="text-gray-500 mt-1">Step {currentStep} of 3</p>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {STEPS.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step.id === currentStep
                                ? 'bg-green-600 text-white scale-110'
                                : step.id < currentStep
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-gray-100 text-gray-400'
                                }`}
                        >
                            {step.id < currentStep ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : (
                                <span className="text-sm font-medium">{step.id}</span>
                            )}
                        </div>
                        {index < STEPS.length - 1 && (
                            <div
                                className={`w-16 h-1 mx-2 rounded ${step.id < currentStep ? 'bg-green-600' : 'bg-gray-200'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Label */}
            <p className="text-center text-sm text-gray-500 mb-6">
                {STEPS[currentStep - 1].description}
            </p>

            {/* Main Content */}
            <Card className="shadow-lg border-0">
                <CardContent className="p-8">
                    {renderStepContent()}
                </CardContent>
            </Card>

            {/* Back Button */}
            {currentStep > 1 && currentStep < 3 && (
                <div className="mt-6 text-center">
                    <Button
                        variant="ghost"
                        onClick={() => setCurrentStep(prev => prev - 1)}
                        className="gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </Button>
                </div>
            )}
        </div>
    );
}
