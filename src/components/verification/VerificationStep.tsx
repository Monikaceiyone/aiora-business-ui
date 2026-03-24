'use client';

import { useState } from 'react';
import {
    CheckCircle2,
    Circle,
    Loader2,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type StepStatus = 'pending' | 'in_progress' | 'action_required' | 'completed' | 'blocked';

interface VerificationStepProps {
    stepNumber: number;
    title: string;
    description: string;
    status: StepStatus;
    isEmbedded?: boolean;
    externalUrl?: string;
    instructions?: string[];
    estimatedTime?: string;
    onAction?: () => void;
    actionLabel?: string;
    children?: React.ReactNode;
}

const statusConfig: Record<StepStatus, { icon: React.ReactNode; color: string; bgColor: string; label: string }> = {
    pending: {
        icon: <Circle className="w-6 h-6" />,
        color: 'text-gray-400',
        bgColor: 'bg-gray-100',
        label: 'Not Started'
    },
    in_progress: {
        icon: <Loader2 className="w-6 h-6 animate-spin" />,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        label: 'In Progress'
    },
    action_required: {
        icon: <AlertCircle className="w-6 h-6" />,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        label: 'Action Required'
    },
    completed: {
        icon: <CheckCircle2 className="w-6 h-6" />,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        label: 'Completed'
    },
    blocked: {
        icon: <Circle className="w-6 h-6" />,
        color: 'text-gray-300',
        bgColor: 'bg-gray-50',
        label: 'Blocked'
    }
};

export function VerificationStep({
    stepNumber,
    title,
    description,
    status,
    isEmbedded = false,
    externalUrl,
    instructions,
    estimatedTime,
    onAction,
    actionLabel,
    children
}: VerificationStepProps) {
    const [isExpanded, setIsExpanded] = useState(status === 'action_required' || status === 'in_progress');
    const config = statusConfig[status];

    const handleAction = () => {
        if (externalUrl && !isEmbedded) {
            window.open(externalUrl, '_blank', 'noopener,noreferrer');
        }
        if (onAction) {
            onAction();
        }
    };

    return (
        <div className={cn(
            "border rounded-xl transition-all duration-200",
            status === 'completed' ? 'border-green-200 bg-green-50/30' :
                status === 'action_required' ? 'border-orange-200 bg-orange-50/30' :
                    status === 'in_progress' ? 'border-blue-200 bg-blue-50/30' :
                        'border-gray-200 bg-white'
        )}>
            {/* Header */}
            <div
                className="flex items-center gap-4 p-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {/* Step Number Circle */}
                <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                    config.bgColor, config.color
                )}>
                    {status === 'completed' ? (
                        <CheckCircle2 className="w-6 h-6" />
                    ) : status === 'in_progress' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        stepNumber
                    )}
                </div>

                {/* Title & Description */}
                <div className="flex-1">
                    <h3 className={cn(
                        "font-semibold",
                        status === 'completed' ? 'text-green-700' :
                            status === 'blocked' ? 'text-gray-400' :
                                'text-gray-900'
                    )}>
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>

                {/* Status Badge */}
                <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    config.bgColor, config.color
                )}>
                    {config.label}
                </div>

                {/* Expand Icon */}
                <div className="text-gray-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                    <div className="pt-4 space-y-4">
                        {/* Estimated Time */}
                        {estimatedTime && (
                            <p className="text-sm text-gray-500">
                                ⏱️ Estimated time: <span className="font-medium">{estimatedTime}</span>
                            </p>
                        )}

                        {/* Instructions */}
                        {instructions && instructions.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                                    {instructions.map((instruction, index) => (
                                        <li key={index}>{instruction}</li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        {/* Custom Children (for embedded components) */}
                        {children}

                        {/* Action Button */}
                        {status !== 'completed' && status !== 'blocked' && (onAction || externalUrl) && (
                            <Button
                                onClick={handleAction}
                                className={cn(
                                    "w-full",
                                    isEmbedded ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                                )}
                            >
                                {actionLabel || (isEmbedded ? 'Start Setup' : 'Open in Meta')}
                                {!isEmbedded && <ExternalLink className="w-4 h-4 ml-2" />}
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
