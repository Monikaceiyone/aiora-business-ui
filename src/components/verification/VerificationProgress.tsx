'use client';

interface VerificationProgressProps {
    currentPhase: number;
    totalPhases: number;
    completedSteps: number;
    totalSteps: number;
    phaseNames: string[];
}

export function VerificationProgress({
    currentPhase,
    totalPhases,
    completedSteps,
    totalSteps,
    phaseNames
}: VerificationProgressProps) {
    const progressPercent = Math.round((completedSteps / totalSteps) * 100);

    return (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold">Meta Verification Progress</h2>
                    <p className="text-indigo-200 text-sm">Complete all steps to get your Blue Tick</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold">{progressPercent}%</div>
                    <div className="text-indigo-200 text-sm">Complete</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-white/20 rounded-full mb-4">
                <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Phase Indicators */}
            <div className="flex justify-between">
                {phaseNames.map((name, index) => (
                    <div
                        key={index}
                        className={`flex flex-col items-center ${index < currentPhase ? 'text-white' :
                                index === currentPhase ? 'text-yellow-300' :
                                    'text-indigo-300'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${index < currentPhase ? 'bg-white text-indigo-600' :
                                index === currentPhase ? 'bg-yellow-400 text-indigo-900' :
                                    'bg-white/20'
                            }`}>
                            {index < currentPhase ? '✓' : index + 1}
                        </div>
                        <span className="text-xs text-center max-w-16 leading-tight hidden sm:block">{name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
