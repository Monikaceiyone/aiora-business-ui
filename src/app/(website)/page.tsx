'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Volume2, VolumeX, Send, Phone, MessageCircle, Camera, LayoutGrid, ArrowRight, ChevronRight, ShoppingCart, UtensilsCrossed, Scissors, Stethoscope, Store, Wrench, Plus, Zap, BarChart2, Shield, Globe, Clock, Headphones } from 'lucide-react';
import FeaturesSection, { FeatureCard } from '@/components/website/features-section';
import ProductShowcaseCarousel, { ShowcaseProduct } from '@/components/website/product-showcase-carousel';
import UseCasesCarousel from '@/components/website/UseCasesCarousel';

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
        image: '/images/agents/ecommerce-agent.png',
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

const showcaseProducts: ShowcaseProduct[] = [
    {
        title: 'VOIT',
        subtitle: 'Voice AI Agent',
        description: 'Your AI receptionist handles calls, books appointments, and takes orders — in Hindi & English.',
        image: '/voice Ai.png',
        bgImage: '/voice Ai.png',
        color: '#7C3AED',
        icon: Phone,
        tag: 'Voice & Telephony',
    },
    {
        title: 'WhatsApp AI',
        subtitle: 'Smart Chat Agent',
        description: 'Automated customer support on WhatsApp. Answers queries, books slots, manages orders 24/7.',
        image: '/images/agents/ecommerce-agent.png',
        color: '#059669',
        icon: MessageCircle,
        tag: 'Messaging & Commerce',
    },
    {
        title: 'OCR Engine',
        subtitle: 'Photo to Order',
        description: 'Customer sends a photo of their grocery list — AI reads it and creates an order instantly.',
        image: '/images/agents/inventory-agent.png',
        color: '#2563EB',
        icon: Camera,
        tag: 'Retail & Grocery',
    },
    {
        title: 'Smart Catalog',
        subtitle: 'Digital Inventory',
        description: 'Full product catalog with search, PDF generation, and WhatsApp browsing built-in.',
        image: '/images/agents/marketing-agent.png',
        color: '#D97706',
        icon: LayoutGrid,
        tag: 'Catalog & Discovery',
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

// const netflixCards: NetflixCard[] = [
//     { name: 'Grocery Stores',     category: 'Retail',           tagline: 'Automate orders, manage inventory, and serve customers 24/7 with AI.',          image: '/images/homepage/smart.png',  color: '#22c55e' },
//     { name: 'Restaurants',        category: 'Food & Beverage',  tagline: 'Take reservations, handle menu queries, and process orders hands-free.',         image: '/images/homepage/cctv.png', color: '#f97316' },
//     { name: 'Salons & Spas',      category: 'Beauty',           tagline: 'Book appointments, send reminders, and delight clients with smart AI.',           image: '/images/homepage/RetailShops.png',    color: '#ec4899' },
//     { name: 'Clinics',            category: 'Healthcare',       tagline: 'Manage patient calls, schedule visits, and answer FAQs automatically.',           image: '/images/homepage/businessi.png',    color: '#06b6d4' },
//     { name: 'Retail Shops',       category: 'Commerce',         tagline: 'Showcase your catalog, process WhatsApp orders, and grow sales effortlessly.',    image: '/images/agents/ecommerce-agent.png',  color: '#a855f7' },
//     { name: 'Service Providers',  category: 'Services',         tagline: 'Dispatch jobs, follow up with clients, and never miss a lead again.',             image: '/images/agents/repair-agent.png',     color: '#eab308' },
// ];


// ─── Campaign Analytics Section ───────────────────────────────────────────────

const funnelSteps = [
    { label: 'Overview', pct: 100, count: '17,861', color: '#6b7280', icon: '▦' },
    { label: 'Sent', pct: 100, count: '17.9K', color: '#6b7280', icon: '✓' },
    { label: 'Delivered', pct: 97, count: '17.3K', color: '#10b981', icon: '✓✓' },
    { label: 'Read', pct: 93, count: '16.6K', color: '#10b981', icon: '✓✓' },
    { label: 'Clicked', pct: 45, count: '7.3K', color: '#8b5cf6', icon: '↑', active: true },
    { label: 'Replied', pct: 42, count: '7.5K', color: '#6b7280', icon: '↩' },
    { label: 'Failed', pct: 3, count: '535', color: '#ef4444', icon: '!' },
];

// Audience area chart data (23 Jan → 31 Jan)
const audienceData = [
    { day: '23 Jan', val: 400 },
    { day: '24 Jan', val: 3100 },
    { day: '25 Jan', val: 2800 },
    { day: '25.5 Jan', val: 1800 },
    { day: '26 Jan', val: 2450 },
    { day: '27 Jan', val: 0 },
    { day: '28 Jan', val: 0 },
    { day: '29 Jan', val: 0 },
    { day: '30 Jan', val: 0 },
    { day: '31 Jan', val: 0 },
];

const yTicks = [0, 850, 1700, 2550, 3400];
const xLabels = ['23 Jan', '24 Jan', '25 Jan', '26 Jan', '27 Jan', '28 Jan', '29 Jan', '30 Jan', '31 Jan'];

function DonutChart({ pct, size = 80 }: { pct: number; size?: number }) {
    const r = (size - 12) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    const [animated, setAnimated] = useState(false);
    const ref = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAnimated(true); }, { threshold: 0.5 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg ref={ref} width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
                <circle
                    cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke="#8b5cf6" strokeWidth="10"
                    strokeDasharray={`${animated ? dash : 0} ${circ}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-violet-600 rotate-0">
                {pct}%
            </span>
        </div>
    );
}

function AudienceChart() {
    const W = 560; const H = 160; const PL = 44; const PR = 8; const PT = 8; const PB = 24;
    const chartW = W - PL - PR; const chartH = H - PT - PB;
    const maxVal = 3400;

    const pts = audienceData.map((d, i) => ({
        x: PL + (i / (audienceData.length - 1)) * chartW,
        y: PT + chartH - (d.val / maxVal) * chartH,
    }));

    const smooth = (points: { x: number; y: number }[]) => {
        return points.map((p, i) => {
            if (i === 0) return `M ${p.x},${p.y}`;
            const prev = points[i - 1];
            const cpx = (prev.x + p.x) / 2;
            return `C ${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`;
        }).join(' ');
    };

    const linePath = smooth(pts);
    const areaPath = `${linePath} L ${pts[pts.length - 1].x},${PT + chartH} L ${pts[0].x},${PT + chartH} Z`;

    const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; val: number } | null>(null);

    return (
        <div className="relative w-full overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 280 }}>
                <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                {yTicks.map((t) => {
                    const y = PT + chartH - (t / maxVal) * chartH;
                    return (
                        <g key={t}>
                            <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="#e5e7eb" strokeWidth="0.8" strokeDasharray="3 3" />
                            <text x={PL - 4} y={y + 4} textAnchor="end" fontSize="8" fill="#9ca3af">{t === 0 ? '0' : t >= 1000 ? `${t / 1000}k` : t}</text>
                        </g>
                    );
                })}

                {/* Area fill */}
                <path d={areaPath} fill="url(#areaGrad)" />

                {/* Line */}
                <path d={linePath} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                {/* X labels */}
                {xLabels.map((lbl, i) => {
                    const x = PL + (i / (xLabels.length - 1)) * chartW;
                    return <text key={lbl} x={x} y={H - 4} textAnchor="middle" fontSize="7.5" fill="#9ca3af">{lbl}</text>;
                })}

                {/* Interactive hit areas */}
                {pts.map((p, i) => (
                    <g key={i}>
                        <rect
                            x={p.x - 20} y={PT} width={40} height={chartH}
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => audienceData[i].val > 0 && setTooltip({ x: p.x, y: p.y, label: audienceData[i].day, val: audienceData[i].val })}
                            onMouseLeave={() => setTooltip(null)}
                            onTouchStart={() => audienceData[i].val > 0 && setTooltip({ x: p.x, y: p.y, label: audienceData[i].day, val: audienceData[i].val })}
                            onTouchEnd={() => setTimeout(() => setTooltip(null), 1500)}
                        />
                        {audienceData[i].val > 0 && (
                            <circle cx={p.x} cy={p.y} r="3" fill="#8b5cf6" stroke="white" strokeWidth="1.5"
                                className="pointer-events-none" />
                        )}
                    </g>
                ))}

                {/* Tooltip */}
                {tooltip && (
                    <g>
                        <rect x={tooltip.x - 28} y={tooltip.y - 26} width={56} height={20} rx="4" fill="#1e1b4b" />
                        <text x={tooltip.x} y={tooltip.y - 12} textAnchor="middle" fontSize="8.5" fill="white" fontWeight="600">
                            {tooltip.val.toLocaleString()}
                        </text>
                    </g>
                )}

                {/* Legend */}
                <g transform={`translate(${PL + chartW / 2 - 22}, ${H - 6})`}>
                    <line x1="0" y1="-2" x2="8" y2="-2" stroke="#8b5cf6" strokeWidth="1.5" />
                    <circle cx="4" cy="-2" r="2" fill="#8b5cf6" />
                    <text x="11" y="1" fontSize="7.5" fill="#6b7280">clicked</text>
                </g>
            </svg>
        </div>
    );
}

function FunnelBar() {
    const [active, setActive] = useState(4);

    return (
        <div className="flex items-stretch divide-x divide-gray-100 overflow-x-auto scrollbar-hide">
            {funnelSteps.map((s, i) => (
                <button
                    key={s.label}
                    onClick={() => setActive(i)}
                    className={`flex-1 min-w-[72px] px-3 py-2.5 text-left transition-colors duration-150 focus:outline-none
                        ${active === i ? 'bg-violet-50' : 'bg-white hover:bg-gray-50'}`}
                >
                    <div className={`text-xs font-bold mb-0.5 ${active === i ? 'text-violet-700' : 'text-gray-700'}`}>
                        {s.pct}%
                        <span className="font-normal text-gray-400 ml-1">({s.count})</span>
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] ${active === i ? 'text-violet-500' : 'text-gray-400'}`}>
                        <span style={{ color: s.color }}>{s.icon}</span>
                        {s.label}
                    </div>
                </button>
            ))}
        </div>
    );
}

function CampaignAnalyticsSection() {
    return (
        <section className="w-full bg-[#f5f4f0] px-4 sm:px-6 md:px-12 py-14 sm:py-20 flex flex-col items-center text-center">
            <h3 className="text-xl font-black text-gray-900 leading-[1.05] tracking-tight max-w-3xl mb-8 sm:mb-10 px-2">
                Your AI voice agent handled 87% of calls automatically today. Your business runs even when you don't.
            </h3>

            <div className="w-full  flex flex-col gap-3">
                  {/* Funnel stats bar */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <FunnelBar />
                </div>
                {/* Campaign info + Audience chart — stacked on mobile, side-by-side on md+ */}
                <div className="flex flex-col md:flex-row gap-3">
                    {/* Campaign info card */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm md:w-72 lg:w-80 flex-shrink-0">
                        <div className="flex items-start justify-between gap-4">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 flex-1 text-left">
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Campaign Name</p>
                                    <p className="text-sm font-semibold text-gray-800">Republic_Day_Sale</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Sent On</p>
                                    <p className="text-sm font-semibold text-gray-800">23rd January, 2024</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">CTA (URL)</p>
                                    <p className="text-sm font-semibold text-gray-800">Shop Now</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Campaign Duration</p>
                                    <p className="text-sm font-semibold text-gray-800">0:00:57</p>
                                </div>
                            </div>
                            <DonutChart pct={45} size={80} />
                        </div>
                    </div>

                    {/* Audience chart card */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-800 mb-3">Audience <span className="text-gray-400 font-normal">(per day)</span></p>
                        <AudienceChart />
                    </div>
                </div>

              
            </div>
                    </section>
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
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            <section className="w-full bg-[#f5f4f0] px-4 sm:px-6 md:px-12 py-14 sm:py-20 flex flex-col items-center text-center">

                {/* Headline */}
                <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight max-w-3xl mb-8 sm:mb-10 px-2">
                    The AI Voice Agent That Scales Last Mile Delivery
                </h2>

                {/* Demo CTA */}
                <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-5">Experience our demo!</p>

                {/* Phone input pill */}
                <div className="flex items-center w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 gap-2 sm:gap-3">
                    {/* Flag + dial code */}
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0 border-r border-gray-200 pr-2 sm:pr-3">
                        <span className="text-lg sm:text-xl leading-none">🇮🇳</span>
                        <span className="text-xs sm:text-sm text-gray-500 font-medium">+91</span>
                        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>

                    {/* Number input */}
                    <input
                        type="tel"
                        placeholder="Enter number"
                        className="flex-1 min-w-0 bg-transparent outline-none text-gray-700 text-sm sm:text-base placeholder-gray-400"
                    />

                    {/* Call button */}
                    <a
                        href="/connect"
                        aria-label="Request demo call"
                        className="flex-shrink-0 bg-gray-900 text-white rounded-xl px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-center hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.47 11.47 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z" />
                        </svg>
                    </a>
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-3 sm:flex sm:flex-row items-center justify-center gap-6 sm:gap-16 mt-10 sm:mt-14 w-full max-w-sm sm:max-w-none">
                    {[
                        { stat: '10,000+', label: 'Concurrent Calls' },
                        { stat: '99.9%', label: 'Adherence' },
                        { stat: '20+', label: 'Languages Supported' },
                    ].map((item) => (
                        <div key={item.label} className="text-center">
                            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900">{item.stat}</div>
                            <div className="text-xs sm:text-sm text-gray-500 mt-1">{item.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Product Showcase Carousel */}
            <section className="">
                {/* <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center  px-6 md:px-12  bg-black/40 backdrop-blur-md"
                >
                    <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">built for</p>
                    <h2 className="text-2xl md:text-4xl font-black text-gray-900">
                        businesses like <span className="text-gray-300">yours.</span>
                    </h2>
                </motion.div> */}
                <ProductShowcaseCarousel products={showcaseProducts} autoPlayInterval={4500} />
            </section>

            <CampaignAnalyticsSection />


            {/* Divider */}
            {/* <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" /> */}

            {/* Feature Cards Section */}
            {/* <FeaturesSection
                subheading="what we build"
                heading="four products. one platform."
                cards={featureCards}
            /> */}

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Use Cases — Accordion Carousel */}
            <UseCasesCarousel />

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
