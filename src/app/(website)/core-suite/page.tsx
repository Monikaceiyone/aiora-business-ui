'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, QrCode, ChevronLeft, ChevronRight } from 'lucide-react';

type Agent = {
    id: string;
    title: string;
    description: string;
    image: string;
    type?: 'image' | 'video';
    features: string[];
};

const agents: Agent[] = [
    {
        id: 'voice',
        title: 'Voice Agent (VoIT)',
        description: 'Natural, human-like voice interactions for customer support and sales.',
        image: '/videos/voit.mp4',
        type: 'video',
        features: ['Natural Language Understanding', 'Real-time Sentiment', 'Multi-language Support']
    },
    {
        id: 'marketing',
        title: 'Marketing Agent',
        description: 'Automate your campaigns and reach the right audience at the right time.',
        image: '/images/agents/marketing-agent.png',
        type: 'image',
        features: ['Campaign Automation', 'Audience Targeting', 'Performance Analytics']
    },
    {
        id: 'ecommerce',
        title: 'E-commerce Agent',
        description: 'Manage your online store, orders, and customer inquiries seamlessly.',
        image: '/images/agents/ecommerce-agent.png',
        type: 'image',
        features: ['Order Management', 'Customer Support', 'Inventory Sync']
    },
    {
        id: 'inventory',
        title: 'Inventory Agent',
        description: 'Keep track of stock levels, optimize supply chain, and prevent stockouts.',
        image: '/images/agents/inventory-agent.png',
        type: 'image',
        features: ['Real-time Tracking', 'Demand Forecasting', 'Supplier Management']
    },
    {
        id: 'repair',
        title: 'Repair Service Agent',
        description: 'Streamline service requests, track repairs, and update customers automatically.',
        image: '/images/agents/repair-agent.png',
        type: 'image',
        features: ['Ticket Tracking', 'Status Updates', 'Service History']
    },
    {
        id: 'booking',
        title: 'Appointment Booking Agent',
        description: 'Schedule appointments, manage calendars, and reduce no-shows with reminders.',
        image: '/images/agents/booking-agent.png',
        type: 'image',
        features: ['Calendar Sync', 'Automated Reminders', 'Self-service Booking']
    },
    {
        id: 'logistics',
        title: 'Logistics Agent',
        description: 'Optimize your supply chain, route planning, and delivery efficiency.',
        image: '/images/agents/logistics-agent.png',
        type: 'image',
        features: ['Route Optimization', 'Fleet Management', 'Delivery Tracking']
    },
    {
        id: 'finance',
        title: 'Finance Manager',
        description: 'Automate invoicing, expense tracking, and financial forecasting.',
        image: '/images/agents/finance-agent.png',
        type: 'image',
        features: ['Smart Invoicing', 'Expense Categorization', 'Profit Analysis']
    },
    {
        id: 'operations',
        title: 'Operations Agent',
        description: 'Streamline daily workflows and ensure operational excellence across teams.',
        image: '/images/agents/operations-agent.jpg',
        type: 'image',
        features: ['Workflow Automation', 'Resource Allocation', 'Quality Control']
    }
];

export default function CoreSuitePage() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % agents.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + agents.length) % agents.length);
    };

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(nextSlide, 30000); // 30s interval
        return () => clearInterval(timer);
    }, []);

    const activeAgent = agents[currentSlide];

    return (

        <div className="h-full w-full relative bg-white overflow-hidden">

            {/* Background Slider */}
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={activeAgent.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="fixed inset-0 z-0"
                >
                    {/* Media Layer (Video or Image) */}
                    {activeAgent.type === 'video' ? (
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="auto"
                            className="absolute inset-0 w-full h-full object-cover scale-105"
                        >
                            <source src={activeAgent.image} type="video/mp4" />
                        </video>
                    ) : (
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-linear scale-105 hover:scale-100"
                            style={{ backgroundImage: `url(${activeAgent.image})` }}
                        />
                    )}

                    {/* White Overlay */}
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
                </motion.div>
            </AnimatePresence>

            {/* Content Layer */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-14 md:px-16 py-4 text-center">

                {/* Agent Info */}
                <div className="max-w-5xl w-full space-y-4 md:space-y-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeAgent.id + '-text'}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="space-y-3 md:space-y-5"
                        >
                            <h2 className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-gray-500">
                                Core Suite Intelligence
                            </h2>
                            <h1 className="text-3xl sm:text-4xl md:text-7xl font-black text-black tracking-tighter leading-tight drop-shadow-sm">
                                {activeAgent.title}
                            </h1>
                            <div className="h-1 w-20 md:w-32 bg-black mx-auto rounded-full" />
                            <p className="text-base md:text-2xl font-medium text-black/80 max-w-3xl mx-auto leading-relaxed">
                                {activeAgent.description}
                            </p>

                            <div className="pt-2 md:pt-4">
                                <ul className="inline-flex flex-wrap justify-center gap-2 md:gap-4">
                                    {activeAgent.features.map((feature, idx) => (
                                        <li key={idx} className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-black/10 text-xs md:text-sm font-semibold text-black shadow-sm">
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Slider Controls */}
                <div className="absolute top-1/2 left-2 md:left-12 -translate-y-1/2">
                    <button onClick={prevSlide} className="p-2 md:p-4 rounded-full border-2 border-black/10 hover:border-black hover:bg-black hover:text-white transition-all duration-300 group">
                        <ChevronLeft className="w-5 h-5 md:w-8 md:h-8 group-hover:-translate-x-1 transition-transform" />
                    </button>
                </div>
                <div className="absolute top-1/2 right-2 md:right-12 -translate-y-1/2">
                    <button onClick={nextSlide} className="p-2 md:p-4 rounded-full border-2 border-black/10 hover:border-black hover:bg-black hover:text-white transition-all duration-300 group">
                        <ChevronRight className="w-5 h-5 md:w-8 md:h-8 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Slide Indicators */}
                <div className="absolute bottom-16 md:bottom-28 flex gap-2 md:gap-3">
                    {agents.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-8 md:w-12 bg-black' : 'w-2 md:w-3 bg-black/20 hover:bg-black/40'}`}
                        />
                    ))}
                </div>

            </div>
        </div>
    );
}
