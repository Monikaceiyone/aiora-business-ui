'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface FeatureCard {
    icon: LucideIcon;
    title: string;
    description: string;
    image?: string;       // ← optional image URL for inside the card
    bgColor?: string;
    iconColor?: string;
}

interface FeaturesSectionProps {
    heading?: string;
    subheading?: string;
    cards: FeatureCard[];
}

export default function FeaturesSection({
    heading = 'Everything you need',
    subheading = 'features',
    cards,
}: FeaturesSectionProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const touchStartX = useRef<number | null>(null);
    const total = cards.length;

    const next = () => setActiveIndex((i) => (i + 1) % total);
    const prev = () => setActiveIndex((i) => (i - 1 + total) % total);

    const resetTimer = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(next, 3500);
    };

    useEffect(() => {
        intervalRef.current = setInterval(next, 3500);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [total]);

    const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); resetTimer(); }
        touchStartX.current = null;
    };

    return (
        <section className="w-full bg-[#f5f5f5] py-16 px-6 md:px-12">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
            >
                <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">{subheading}</p>
                <h2 className="text-2xl md:text-4xl font-black text-gray-900">{heading}</h2>
            </motion.div>

            {/* ── Desktop / Tablet ── */}
            <div className="hidden sm:block ">
                <div className="flex gap-12 overflow-x-auto scroll-smooth pb-3 snap-x snap-mandatory scrollbar-hide">
                    {cards.map((card, i) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.06 }}
                            className="snap-start flex-shrink-0 flex flex-col rounded-3xl overflow-hidden
                                       border border-white/40 bg-white/10 backdrop-blur-sm
                                       hover:bg-white/20 hover:-translate-y-1
                                       transition-colors duration-300 cursor-default shadow-sm hover:shadow-xl"
                            style={{
                                width: 'calc(25% - 15px)',
                                minWidth: '220px',
                                minHeight: '520px',
                            }}
                        >
                            {/* Image area — fills top ~65% of card */}
                            <div className="relative flex-1 overflow-hidden" style={{ minHeight: '340px' }}>
                                <img
                                    src={card.image}
                                    alt={card.title}
                                    className="w-full h-full object-cover"
                                />
                                {/* subtle dark gradient so text below doesn't clash */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>

                            {/* Text area */}
                            <div className="bg-white px-5 py-6 text-left">
                                <div className="flex items-center gap-3 mb-2">
                                    <div
                                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: card.iconColor ? `${card.iconColor}22` : '#f3f4f6' }}
                                    >
                                        <card.icon
                                            className="w-5 h-5"
                                            style={{ color: card.iconColor ?? '#374151' }}
                                        />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900">{card.title}</h3>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed">{card.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ── Mobile carousel — with navigation arrows ── */}
            <div
                className="sm:hidden relative overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                    {cards.map((card) => (
                        <div key={card.title} className="w-full flex-shrink-0 px-2">
                            <div
                                className="rounded-3xl overflow-hidden mx-auto max-w-sm flex flex-col
                                           border border-white/40 bg-white/10 backdrop-blur-sm shadow-sm relative"
                                style={{ minHeight: '520px' }}
                            >
                                {/* Image — tall top area with full coverage */}
                                <div className="relative overflow-hidden flex-1">
                                    <img
                                        src={card.image}
                                        alt={card.title}
                                        className="w-full h-full object-cover absolute inset-0"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>

                                {/* Text */}
                                <div className="bg-white px-6 py-6 text-left">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div
                                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: card.iconColor ? `${card.iconColor}22` : '#f3f4f6' }}
                                        >
                                            <card.icon
                                                className="w-5 h-5"
                                                style={{ color: card.iconColor ?? '#374151' }}
                                            />
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900">{card.title}</h3>
                                    </div>
                                    <p className="text-sm text-gray-500 leading-relaxed">{card.description}</p>
                                </div>

                                {/* Navigation Arrows */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); prev(); resetTimer(); }}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-colors z-10"
                                    aria-label="Previous"
                                >
                                    <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); next(); resetTimer(); }}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-colors z-10"
                                    aria-label="Next"
                                >
                                    <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}