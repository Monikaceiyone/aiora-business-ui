"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronRight, AlertCircle, Building2, Phone, Store } from "lucide-react";
import { EmbeddedSignupButton } from "./embedded-signup";
import { useToast } from "@/components/ui/toast";

type Step = 'intro' | 'prerequisites' | 'connect' | 'success';

interface WhatsAppSetupWizardProps {
    appId: string;
    configId: string;
    onSuccess: (data: any) => void;
    onError: (error: string) => void;
    onComplete: () => void;
}

export function WhatsAppSetupWizard({ appId, configId, onSuccess, onError, onComplete }: WhatsAppSetupWizardProps) {
    const [step, setStep] = useState<Step>('intro');
    const [isLoading, setIsLoading] = useState(false);
    const { success, error: toastError } = useToast();

    const handleSignupComplete = (data: any) => {
        setIsLoading(false);
        setStep('success');
        success("WhatsApp Business Account connected successfully!");
        onSuccess(data);
        // Small delay before closing/refreshing to let user see success state
        setTimeout(() => {
            onComplete();
        }, 2000);
    };

    const handleSignupError = (errMsg: string) => {
        setIsLoading(false);
        toastError("Connection Failed", errMsg);
        onError(errMsg);
    };

    const renderIntro = () => (
        <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                <Building2 className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                    <h4 className="font-semibold text-blue-900">Manage Your Business</h4>
                    <p className="text-sm text-blue-700">Connect your WhatsApp Business Account to automatically sync catalogs and manage orders directly from this dashboard.</p>
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="font-medium">What you'll need:</h4>
                <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500" />
                        A Facebook Account
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500" />
                        A Phone Number (not currently linked to personal WhatsApp)
                    </li>
                </ul>
            </div>
        </div>
    );

    const renderPrerequisites = () => (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="border border-l-4 border-l-yellow-500 bg-yellow-50 p-4 rounded-r-lg">
                    <h4 className="font-medium text-yellow-900 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Important Requirement
                    </h4>
                    <p className="text-sm text-yellow-800 mt-1">
                        You must have a <strong>Meta Business Account</strong>. If you don't have one, the setup popup will ask you to create one.
                    </p>
                </div>

                <div className="text-sm text-gray-600">
                    <p>During the setup process, you will be asked to:</p>
                    <ol className="list-decimal list-inside mt-2 space-y-1 ml-2">
                        <li>Log in to Facebook</li>
                        <li>Select or create a Meta Business Account</li>
                        <li>Create a WhatsApp Business Profile</li>
                        <li>Verify your phone number with an OTP</li>
                    </ol>
                </div>
            </div>
        </div>
    );

    const renderConnect = () => (
        <div className="space-y-6 text-center py-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-8 h-8 text-green-600" />
            </div>

            <div className="space-y-2">
                <h3 className="font-semibold text-lg">Ready to Connect</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    Click the button below to open the Meta secure window. Make sure to complete all steps until the window closes automatically.
                </p>
            </div>

            <div className="flex justify-center pt-4">
                <EmbeddedSignupButton
                    appId={appId}
                    configId={configId}
                    onSuccess={handleSignupComplete}
                    onError={handleSignupError}
                />
            </div>

            <p className="text-xs text-gray-400">
                A pop-up window will open. Please ensure pop-ups are allowed.
            </p>
        </div>
    );

    const renderSuccess = () => (
        <div className="space-y-6 text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                <Check className="w-8 h-8 text-green-600" />
            </div>

            <div className="space-y-2">
                <h3 className="font-semibold text-lg text-green-700">Successfully Connected!</h3>
                <p className="text-sm text-gray-500">
                    Your WhatsApp Business Account is now linked. Redirecting you to the dashboard...
                </p>
            </div>
        </div>
    );

    return (
        <Card className="w-full max-w-lg mx-auto shadow-lg border-t-4 border-t-green-500">
            <CardHeader>
                <CardTitle>
                    {step === 'intro' && "Connect WhatsApp Business"}
                    {step === 'prerequisites' && "Before We Start"}
                    {step === 'connect' && "Connect to Meta"}
                    {step === 'success' && "Setup Complete"}
                </CardTitle>
                <CardDescription>
                    {step === 'intro' && "Step 1 of 3"}
                    {step === 'prerequisites' && "Step 2 of 3"}
                    {step === 'connect' && "Step 3 of 3"}
                </CardDescription>
            </CardHeader>

            <CardContent>
                {step === 'intro' && renderIntro()}
                {step === 'prerequisites' && renderPrerequisites()}
                {step === 'connect' && renderConnect()}
                {step === 'success' && renderSuccess()}
            </CardContent>

            <CardFooter className="flex justify-between border-t pt-6">
                {step === 'intro' && (
                    <Button onClick={() => setStep('prerequisites')} className="w-full bg-green-600 hover:bg-green-700">
                        Get Started <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                )}

                {step === 'prerequisites' && (
                    <div className="flex gap-3 w-full">
                        <Button variant="outline" onClick={() => setStep('intro')} className="flex-1">
                            Back
                        </Button>
                        <Button onClick={() => setStep('connect')} className="flex-1 bg-green-600 hover:bg-green-700">
                            I Understand <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}

                {step === 'connect' && (
                    <Button variant="ghost" onClick={() => setStep('prerequisites')} className="mx-auto text-gray-500">
                        Back to Instructions
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
