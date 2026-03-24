'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ConfigurationsPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(0); // 1 = next, -1 = prev
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const [isLoading, setIsLoading] = useState(false);

    const steps = [
        {
            id: 'task',
            label: 'What Manual Task do you want to Automate?',
            type: 'textarea',
            placeholder: 'e.g. Extracting invoice details from emails...',
            example: 'Example: "I want to automatically extract invoice number and amount from incoming PDF emails and save them to an Airtable database."'
        },
        {
            id: 'steps',
            label: 'Provide each Task Stepwise',
            type: 'textarea',
            placeholder: '1. Open Email\n2. Download PDF...',
            example: 'Example:\n1. Monitor Gmail for "Invoice"\n2. Use OCR to scan PDF attachment\n3. Extract "Total Amount"\n4. Create record in Airtable'
        },
        {
            id: 'input',
            label: 'Input Data Source',
            type: 'input',
            placeholder: 'e.g. Gmail, Dropbox, Google Drive',
            example: 'Example: "Gmail (Incoming emails from @vendors.com)"'
        },
        {
            id: 'execution',
            label: 'Automate Execution Trigger',
            type: 'input',
            placeholder: 'e.g. specific time, new email, file upload',
            example: 'Example: "Trigger immediately when a new email arrives with an attachment."'
        },
        {
            id: 'output',
            label: 'Expected Output',
            type: 'input',
            placeholder: 'e.g. Notion Row, Slack Message, CSV File',
            example: 'Example: "A new row in my Finance Base on Airtable with the extracted data."'
        },
        // Contact Information
        { id: 'name', label: 'Your Name', type: 'input', placeholder: 'John Doe', example: '' },
        { id: 'email', label: 'Email Address', type: 'input', placeholder: 'john@example.com', example: '' },
        { id: 'phone', label: 'Phone Number', type: 'input', placeholder: '+1 234 567 8900', example: '' },
    ];

    const totalSteps = steps.length;

    const submitConfiguration = async () => {
        setIsLoading(true);
        try {
            const payload = {
                manual_task: answers['task'],
                task_steps: answers['steps'],
                input_data: answers['input'],
                execution_trigger: answers['execution'],
                expected_output: answers['output'],
                name: answers['name'],
                email: answers['email'],
                phone: answers['phone']
            };

            const response = await fetch('/api/configurations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to save');

            setDirection(1);
            setCurrentStep(totalSteps); // Success Screen
        } catch (error) {
            console.error(error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const [error, setError] = useState('');

    const handleNext = () => {
        if (!answers[steps[currentStep].id]?.trim()) {
            setError('This field is required');
            return;
        }

        if (currentStep < totalSteps - 1) {
            setDirection(1);
            setCurrentStep(prev => prev + 1);
        } else {
            submitConfiguration();
        }
    };

    const handlePrev = () => {
        setError('');
        if (currentStep > 0) {
            setDirection(-1);
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleAnswerChange = (value: string) => {
        if (error) setError('');
        setAnswers(prev => ({ ...prev, [steps[currentStep].id]: value }));
    };

    // Animation Variants
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 100 : -100,
            opacity: 0,
        })
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white p-6 relative overflow-hidden">

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.02]">
                <div className="w-[800px] h-[800px] bg-black rounded-full blur-3xl absolute -top-40 -right-40" />
            </div>

            {currentStep < totalSteps ? (
                <div className="w-full max-w-3xl space-y-12 relative z-10">

                    {/* Main Page Title */}
                    <div className="text-center">
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
                            Build Your Own AI Agent
                        </h1>
                    </div>

                    {/* Header: Progress & Steps */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <h2 className="text-sm font-semibold tracking-widest uppercase text-gray-400">
                                Configuration
                            </h2>
                            <span className="font-mono text-sm font-medium text-black">
                                {currentStep + 1} / {totalSteps}
                            </span>
                        </div>

                        {/* Segmented Progress Bar */}
                        <div className="grid grid-cols-8 gap-2 h-1.5">
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`
                                        h-full rounded-full transition-all duration-500
                                        ${idx <= currentStep ? 'bg-black' : 'bg-gray-100'}
                                    `}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Question Card */}
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={currentStep}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                            className="space-y-8"
                        >
                            <h1 className="text-3xl md:text-5xl font-light text-black leading-tight">
                                {steps[currentStep].label}
                            </h1>

                            <div className="space-y-4">
                                {steps[currentStep].type === 'textarea' ? (
                                    <textarea
                                        autoFocus
                                        value={answers[steps[currentStep].id] || ''}
                                        onChange={(e) => handleAnswerChange(e.target.value)}
                                        placeholder={steps[currentStep].placeholder}
                                        className="w-full bg-transparent border-b-2 border-gray-200 focus:border-black outline-none py-4 text-xl font-light text-black placeholder-gray-300 resize-none min-h-[140px] transition-colors"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleNext();
                                            }
                                        }}
                                    />
                                ) : (
                                    <input
                                        autoFocus
                                        type="text"
                                        value={answers[steps[currentStep].id] || ''}
                                        onChange={(e) => handleAnswerChange(e.target.value)}
                                        placeholder={steps[currentStep].placeholder}
                                        className="w-full bg-transparent border-b-2 border-gray-200 focus:border-black outline-none py-4 text-2xl font-light text-black placeholder-gray-300 transition-colors"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleNext();
                                        }}
                                    />
                                )}

                                {/* Error Message */}
                                {error && (
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm">
                                        * {error}
                                    </motion.p>
                                )}

                                {/* Helper Example */}
                                {steps[currentStep].example && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-500 italic"
                                    >
                                        <p>{steps[currentStep].example}</p>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-all text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            {isLoading ? 'Sending...' : (currentStep === totalSteps - 1 ? 'Finish' : 'Next Step')}
                            <ArrowRight className="w-4 h-4" />
                        </button>

                        {currentStep > 0 && (
                            <button
                                onClick={handlePrev}
                                className="p-3 text-gray-400 hover:text-black transition-colors flex items-center gap-2 hover:bg-gray-50 rounded-full px-4"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back</span>
                            </button>
                        )}
                    </div>

                </div>
            ) : (
                // Success Screen
                <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6 max-w-lg"
                >
                    <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto text-white shadow-2xl">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl font-bold text-black">Configuration Received</h1>
                    <p className="text-lg text-gray-500">
                        We have successfully recorded your automation request.
                        Our AI team will review it and get back to you at <strong>{answers['email']}</strong> shortly.
                    </p>
                    <div className="pt-8">
                        <a href="/" className="text-black font-medium hover:underline underline-offset-4">Return Home</a>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
