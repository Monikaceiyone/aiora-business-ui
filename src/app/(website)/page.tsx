'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Volume2, VolumeX, Send, Phone, MessageCircle, Camera, LayoutGrid, ArrowRight, ChevronRight, ShoppingCart, UtensilsCrossed, Scissors, Stethoscope, Store, Wrench, Plus, Zap, BarChart2, Shield, Globe, Clock, Headphones } from 'lucide-react';
import FeaturesSection, { FeatureCard } from '@/components/website/features-section';

const stats = [
    { value: '50+', label: 'businesses powered' },
    { value: '10M+', label: 'messages processed' },
    { value: '99.9%', label: 'uptime' },
    { value: '24/7', label: 'AI support' },
];

const features = [
    {
        icon: Phone,
        title: 'VOIT',
        subtitle: 'Voice AI Agent',
        desc: 'Your AI receptionist handles calls, books appointments, and takes orders — in Hindi & English.',
        color: '#7C3AED',
        image: '/voice Ai.png',
        industry: 'Voice & Telephony',
        href: '/core-suite',
        industries: ['Healthcare', 'Restaurants & Food Services', 'Hospitality (Hotels & Resorts)', 'E-commerce & Retail'],
    },
    {
        icon: MessageCircle,
        title: 'WhatsApp AI',
        subtitle: 'Smart Chat Agent',
        desc: 'Automated customer support on WhatsApp. Answers queries, books slots, manages orders.',
        color: '#059669',
        image: '/images/agents/ecommerce-agent.png',
        industry: 'Messaging & Commerce',
        href: '/core-suite',
    },
    {
        icon: Camera,
        title: 'OCR Engine',
        subtitle: 'Photo to Order',
        desc: 'Customer sends a photo of their grocery list — AI reads it and creates an order instantly.',
        color: '#2563EB',
        image: '/images/agents/inventory-agent.png',
        industry: 'Retail & Grocery',
        href: '/core-suite',
    },
    {
        icon: LayoutGrid,
        title: 'Smart Catalog',
        subtitle: 'Digital Inventory',
        desc: 'Full product catalog with search, PDF generation, and WhatsApp browsing built-in.',
        color: '#D97706',
        image: '/images/agents/marketing-agent.png',
        industry: 'Catalog & Discovery',
        href: '/core-suite',
    },
];

const featureCards: FeatureCard[] = [
    {
        icon: Phone,
        title: 'VOIT',
        description: 'Your AI receptionist handles calls, books appointments, and takes orders — in Hindi & English.',
        image: '/voice Ai.png',
        iconColor: '#d97706',
    },
    {
        icon: MessageCircle,
        title: 'WhatsApp AI',
        description: 'Automated customer support on WhatsApp. Answers queries, books slots, manages orders.',
        image: '/images/agents/ecommerce-agent.png',
        iconColor: '#059669',
        
    },
    {
        icon: Camera,
        title: 'OCR Engine',
        description: 'Customer sends a photo of their grocery list — AI reads it and creates an order instantly.',
        image: '/images/agents/inventory-agent.png',
        iconColor: '#7c3aed',
    },
    {
        icon: LayoutGrid,
        title: 'Smart Catalog',
        description: 'Full product catalog with search, PDF generation, and WhatsApp browsing built-in.',
        image: '/images/agents/marketing-agent.png',
        iconColor: '#2563eb',
    },
    {
        icon: Shield,
        title: 'Enterprise Security',
        description: 'End-to-end encryption, role-based access, and compliance-ready infrastructure out of the box.',
        image: '/voice Ai.png',
        iconColor: '#e11d48',
    },
   
];

const useCasesData = [
    { name: 'Grocery Stores', icon: ShoppingCart, image: '/images/agents/inventory-agent.png', category: 'Retail' },
    { name: 'Restaurants', icon: UtensilsCrossed, image: '/images/agents/operations-agent.jpg', category: 'Food & Beverage' },
    { name: 'Salons & Spas', icon: Scissors, image: '/images/agents/booking-agent.png', category: 'Beauty' },
    { name: 'Clinics', icon: Stethoscope, image: '/images/agents/finance-agent.png', category: 'Healthcare' },
    { name: 'Retail Shops', icon: Store, image: '/images/agents/ecommerce-agent.png', category: 'Commerce' },
    { name: 'Service Providers', icon: Wrench, image: '/images/agents/repair-agent.png', category: 'Services' },
];

function UseCasesCarousel({ useCases }: { useCases: typeof useCasesData }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const total = useCases.length;

    const scrollTo = (dir: 'prev' | 'next') => {
        const el = scrollRef.current;
        if (!el) return;
        const cardWidth = el.offsetWidth - 32;
        el.scrollBy({ left: dir === 'next' ? cardWidth + 16 : -(cardWidth + 16), behavior: 'smooth' });
    };

    const resetTimer = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            const el = scrollRef.current;
            if (!el) return;
            const cardWidth = el.offsetWidth - 32;
            const maxScroll = el.scrollWidth - el.offsetWidth;
            if (el.scrollLeft >= maxScroll - 4) {
                el.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                el.scrollBy({ left: cardWidth + 16, behavior: 'smooth' });
            }
        }, 3500);
    };

    useEffect(() => {
        resetTimer();
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [total]);

    return (
        <div className="sm:hidden relative">
            <div
                ref={scrollRef}
                className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide gap-4 px-4"
                onTouchStart={() => { if (intervalRef.current) clearInterval(intervalRef.current); }}
                onTouchEnd={resetTimer}
            >
                {useCases.map((uc) => (
                    <div key={uc.name} className="snap-center flex-shrink-0 w-[calc(100%-32px)]">
                        <div className="relative rounded-3xl overflow-hidden h-80 cursor-pointer">
                            <img
                                src={uc.image}
                                alt={uc.name}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
                            <div className="absolute top-5 left-5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                                <span className="text-xs font-medium text-white">• {uc.category}</span>
                            </div>
                            <div className="absolute bottom-5 left-5 right-20 text-white">
                                <h3 className="text-xl font-bold mb-1">{uc.name}</h3>
                                <p className="text-sm text-white/80">Started by you. Accelerated with AI.</p>
                            </div>
                            {/* <button className="absolute bottom-5 right-5 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                                <Plus className="w-5 h-5 text-white" />
                            </button> */}
                            {/* Arrows */}
                            <button
                                onClick={() => { scrollTo('prev'); resetTimer(); }}
                                className="absolute left-0 bottom-[131px] w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center z-10"
                                aria-label="Previous"
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={() => { scrollTo('next'); resetTimer(); }}
                                className="absolute right-0 bottom-[131px] w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center z-10"
                                aria-label="Next"
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function CommencePage() {
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = true;
        setIsMuted(true);
        const playVideo = async () => {
            try { await video.play(); } catch { }
        };
        playVideo();
        const timer = setTimeout(() => { if (video.paused) playVideo(); }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="w-full bg-white overflow-x-hidden">
            {/* Hero — full-viewport background video, extends behind fixed nav */}
            <section className="relative w-full h-[100dvh] min-h-[600px] flex flex-col items-center justify-center overflow-hidden">
                {/* Background video */}
                <video
                    ref={videoRef}
                    src="/videos/intro.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    controls={false}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ backgroundImage: 'url(/hero-banner.png)', backgroundSize: 'cover' }}
                    onLoadedData={() => {
                        if (videoRef.current) videoRef.current.play().catch(() => { });
                    }}
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/60" />

                {/* Mute toggle — offset below nav */}
                <button
                    onClick={toggleMute}
                    className="absolute top-24 right-5 z-20 text-white/80 hover:text-white transition-colors p-2.5 bg-black/40 backdrop-blur-md rounded-full"
                    aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                {/* Overlay content */}
                {/* <div className="relative z-10 flex flex-col items-center text-center px-6 md:px-12 max-w-4xl mx-auto">
                

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-5"
                    >
                        The AI Platform for<br className="hidden sm:block" /> Real Businesses
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.22 }}
                        className="text-white/70 text-base md:text-lg max-w-2xl leading-relaxed mb-8"
                    >
                        AI-powered voice agents, WhatsApp automation, and smart commerce —
                        built for businesses that want to scale without hiring an army.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.34 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full"
                    >
                        <a
                            href="/connect"
                            className="group flex items-center justify-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-base hover:bg-gray-100 transition-all duration-300 shadow-lg w-full sm:w-auto"
                        >
                            get started
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                        <a
                            href="/core-suite"
                            className="flex items-center justify-center gap-2 text-white border border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 px-8 py-4 rounded-full text-base font-medium transition-colors w-full sm:w-auto"
                        >
                            explore core suite
                            <ChevronRight className="w-4 h-4" />
                        </a>
                    </motion.div>
                </div> */}

                {/* Stats bar pinned to bottom of hero */}
                {/* <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.45 }}
                    className="absolute bottom-0 left-0 right-0 z-10 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10 border-t border-white/10 bg-black/40 backdrop-blur-md"
                >
                    {stats.map((s) => (
                        <div key={s.label} className="text-center py-4 px-2">
                            <div className="text-2xl md:text-3xl font-black text-white">{s.value}</div>
                            <div className="text-xs text-white/50 mt-1 uppercase tracking-wider">{s.label}</div>
                        </div>
                    ))}
                </motion.div> */}


                {/* Overlay content */}
<div className="relative z-10 flex flex-col items-center text-center px-6 md:px-12 max-w-4xl mx-auto w-full">
    <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-4"
    >
        The AI Platform for<br className="hidden sm:block" /> Real Businesses
    </motion.h1>

    <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.22 }}
        className="text-white/70 text-sm md:text-lg max-w-2xl leading-relaxed mb-6"
    >
        AI-powered voice agents, WhatsApp automation, and smart commerce —
        built for businesses that want to scale without hiring an army.
    </motion.p>

    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.34 }}
        className="flex flex-col items-center justify-center gap-3 w-full max-w-xs sm:max-w-none sm:flex-row"
    >
        <a
        
            href="/connect"
            className="group flex items-center justify-center gap-3 bg-white text-gray-900 px-8 py-3.5 rounded-full font-bold text-base hover:bg-gray-100 transition-all duration-300 shadow-lg w-full sm:w-auto"
        >
            get started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
        
        <a
            href="/core-suite"
            className="flex items-center justify-center gap-2 text-white border border-white/40 bg-white/10 backdrop-blur-sm hover:bg-white/20 px-8 py-3.5 rounded-full text-base font-medium transition-colors w-full sm:w-auto"
        >
            explore core suite
            <ChevronRight className="w-4 h-4" />
        </a>
    </motion.div>
</div>

{/* Stats bar pinned to bottom of hero */}
<motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.45 }}
    className="absolute bottom-0 left-0 right-0 z-10 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10 border-t border-white/10 bg-black/40 backdrop-blur-md"
>
    {stats.map((s) => (
        <div key={s.label} className="text-center py-3 px-2">
            <div className="text-xl md:text-3xl font-black text-white">{s.value}</div>
            <div className="text-xs text-white/50 mt-1 uppercase tracking-wider">{s.label}</div>
        </div>
    ))}
</motion.div>
            </section>

            {/* Divider */}

            {/* Features */}
   
            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Feature Cards Section */}
            <FeaturesSection
                subheading="what we build"
                heading="four products. one platform."
                cards={featureCards}
            />

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Use Cases */}
            <section className="py-10  ">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-8 px-6 md:px-12"
                >
                    <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">built for</p>
                    <h2 className="text-2xl md:text-4xl font-black text-gray-900">
                        businesses like <span className="text-gray-300">yours.</span>
                    </h2>
                </motion.div>

                {/* Desktop/Tablet - Horizontal scrollable */}
                <div className="hidden sm:block px-6 md:px-12">
                    <div className="flex gap-4 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory scrollbar-hide">
                        {useCasesData.map((uc, i) => (
                            <motion.div
                                key={uc.name}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: i * 0.04 }}
                                className="snap-start flex-shrink-0 relative rounded-3xl overflow-hidden h-80 group cursor-pointer"
                                style={{ width: 'calc(50% - 8px)', minWidth: '320px' }}
                            >
                                {/* Background Image */}
                                <img
                                    src={uc.image}
                                    alt={uc.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                
                                {/* Dark overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
                                
                                {/* Category tag - top left */}
                                <div className="absolute top-5 left-5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                                    <span className="text-xs font-medium text-white">• {uc.category}</span>
                                </div>
                                
                                {/* Content - bottom left */}
                                <div className="absolute bottom-5 left-5 right-20 text-white">
                                    <h3 className="text-xl font-bold mb-1">{uc.name}</h3>
                                    <p className="text-sm text-white/80">Started by you. Accelerated with AI.</p>
                                </div>
                                
                                {/* Read more button - bottom right */}
                                {/* <button className="absolute bottom-5 right-5 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all duration-200 group-hover:scale-110">
                                    <Plus className="w-5 h-5 text-white" />
                                </button> */}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Mobile - One card at a time with swipe */}
                <UseCasesCarousel useCases={useCasesData} />
            </section>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* How It Works */}
            <section className="px-6 md:px-12 py-10 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-8"
                >
                    <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">how it works</p>
                    <h2 className="text-2xl md:text-4xl font-black text-gray-900">
                        live in <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">48 hours.</span>
                    </h2>
                </motion.div>

                <div className="space-y-0">
                    {[
                        { step: '01', title: 'connect', desc: 'Link your WhatsApp Business in 5 minutes via our embedded signup.' },
                        { step: '02', title: 'configure', desc: 'Upload your catalog, set business hours, customize AI responses.' },
                        { step: '03', title: 'go live', desc: 'Your AI agent starts handling calls, messages, and orders automatically.' },
                    ].map((s, i) => (
                        <motion.div
                            key={s.step}
                            initial={{ opacity: 0, x: -15 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            className="flex items-start gap-5 py-5 border-b border-gray-100 last:border-b-0"
                        >
                            <span className="text-3xl font-black text-gray-200 flex-shrink-0 w-12">{s.step}</span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-0.5">{s.title}</h3>
                                <p className="text-gray-500 text-sm">{s.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* CTA */}
            <section className="px-6 md:px-12 py-10 max-w-4xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-4">
                        ready to automate<span className="text-gray-300">?</span>
                    </h2>
                    <p className="text-gray-500 text-base mb-8 max-w-xl mx-auto">
                        Join 50+ businesses already using AIORA to handle calls, messages, and orders on autopilot.
                    </p>
                    <a
                        href="/connect"
                        className="group inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-full font-bold text-base hover:bg-gray-800 transition-all duration-300 shadow-lg"
                    >
                        get started
                        <Send className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                    </a>
                </motion.div>
            </section>
        </div>
    );
}
