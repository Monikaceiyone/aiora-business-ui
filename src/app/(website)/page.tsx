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
        icon: Zap,
        title: 'Instant Automation',
        description: 'Automate repetitive tasks across calls, chats, and orders without writing a single line of code.',
        bgColor: '#fefce8',
        iconColor: '#d97706',
    },
    {
        icon: MessageCircle,
        title: 'WhatsApp Commerce',
        description: 'Let customers browse, order, and pay directly inside WhatsApp — no app download needed.',
        bgColor: '#f0fdf4',
        iconColor: '#059669',
    },
    {
        icon: Phone,
        title: 'Voice AI Agent',
        description: 'An AI receptionist that answers calls, books appointments, and handles queries in Hindi & English.',
        bgColor: '#f5f3ff',
        iconColor: '#7c3aed',
    },
    {
        icon: BarChart2,
        title: 'Real-time Analytics',
        description: 'Track conversations, orders, and agent performance from a single unified dashboard.',
        bgColor: '#eff6ff',
        iconColor: '#2563eb',
    },
    {
        icon: Shield,
        title: 'Enterprise Security',
        description: 'End-to-end encryption, role-based access, and compliance-ready infrastructure out of the box.',
        bgColor: '#fff1f2',
        iconColor: '#e11d48',
    },
    {
        icon: Globe,
        title: 'Multi-language Support',
        description: 'Serve customers in their preferred language — Hindi, English, and regional languages supported.',
        bgColor: '#ecfeff',
        iconColor: '#0891b2',
    },
    {
        icon: Clock,
        title: '24/7 Availability',
        description: 'Your AI agents never sleep. Handle customer queries and orders around the clock, every day.',
        bgColor: '#fdf4ff',
        iconColor: '#a21caf',
    },
    {
        icon: Headphones,
        title: 'Dedicated Support',
        description: 'Onboarding specialists and a support team that helps you go live and stay live without friction.',
        bgColor: '#fff7ed',
        iconColor: '#ea580c',
    },
];

const useCases = [
    { name: 'Grocery Stores', icon: ShoppingCart },
    { name: 'Restaurants', icon: UtensilsCrossed },
    { name: 'Salons & Spas', icon: Scissors },
    { name: 'Clinics', icon: Stethoscope },
    { name: 'Retail Shops', icon: Store },
    { name: 'Service Providers', icon: Wrench },
];

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
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Features */}
            <section className="px-6 md:px-12 py-10 max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-8"
                >
                    <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">what we build</p>
                    <h2 className="text-2xl md:text-4xl font-black text-gray-900">
                        four products. <span className="text-gray-300">one platform.</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {features.map((f, i) => (
                        <motion.a
                            key={f.title}
                            href={f.href}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.08 }}
                            className="group relative rounded-2xl overflow-hidden aspect-[4/3] block"
                        >
                            {/* Background image */}
                            <Image
                                src={f.image}
                                alt={f.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, 50vw"
                            />

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />

                            {/* Industry tag — top left */}
                            <div className="absolute top-4 left-4 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                                <span className="text-white text-xs font-medium tracking-wide">{f.industry}</span>
                            </div>

                            {/* Industries center overlay — first card only, visible on hover */}
                            {'industries' in f && f.industries && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 backdrop-blur-sm px-6">
                                    <p className="text-white/50 text-xs uppercase tracking-[0.25em] mb-3">industries</p>
                                    <div className="flex flex-col items-center gap-2">
                                        {(f.industries as string[]).map((ind) => (
                                            <span
                                                key={ind}
                                                className="text-white text-sm font-semibold text-center"
                                            >
                                                {ind}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Product info — bottom left */}
                            <div className="absolute bottom-4 left-4 right-14">
                                <h3 className="text-white text-xl font-black leading-tight">{f.title}</h3>
                                <p className="text-white/70 text-sm mt-0.5 leading-snug">{f.desc}</p>
                            </div>

                            {/* Plus button — bottom right */}
                            <div className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                <Plus className="w-4 h-4 text-white" />
                            </div>
                        </motion.a>
                    ))}
                </div>
            </section>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Feature Cards Section */}
            {/* <FeaturesSection
                subheading="why aiora"
                heading="Built for businesses that move fast."
                cards={featureCards}
            /> */}

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Use Cases */}
            <section className="px-6 md:px-12 py-10 max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-8"
                >
                    <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">built for</p>
                    <h2 className="text-2xl md:text-4xl font-black text-gray-900">
                        businesses like <span className="text-gray-300">yours.</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
                    {useCases.map((uc, i) => (
                        <motion.div
                            key={uc.name}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: i * 0.04 }}
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center hover:border-gray-300 hover:shadow-md transition-all duration-300"
                        >
                            <uc.icon className="w-6 h-6 text-gray-900 mx-auto mb-2" />
                            <span className="text-sm font-semibold text-gray-700">{uc.name}</span>
                        </motion.div>
                    ))}
                </div>
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
