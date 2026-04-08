'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface FeatureCard {
    icon: LucideIcon;
    title: string;
    description: string;
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

    const handleDotClick = (i: number) => { setActiveIndex(i); resetTimer(); };
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

            {/* Desktop / Tablet: 4 cards visible, overflow scrolls horizontally */}
            <div className="hidden sm:block max-w-7xl mx-auto">
                <div className="flex gap-5 overflow-x-auto scroll-smooth pb-3 snap-x snap-mandatory scrollbar-hide">
                    {cards.map((card, i) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.06 }}
                            className="snap-start flex-shrink-0 flex flex-col rounded-3xl overflow-hidden
                                       shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default"
                            style={{
                                width: 'calc(25% - 15px)',
                                minWidth: '220px',
                                background: card.bgColor ?? '#ffffff',
                            }}
                        >
                            {/* Icon area — top colored block */}
                            <div
                                className="flex items-center justify-center pt-8 pb-6 px-6"
                                style={{ background: card.bgColor ?? '#f3f4f6' }}
                            >
                                <div
                                    className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm"
                                    style={{ backgroundColor: card.iconColor ? `${card.iconColor}22` : '#e5e7eb' }}
                                >
                                    <card.icon
                                        className="w-9 h-9"
                                        style={{ color: card.iconColor ?? '#374151' }}
                                    />
                                </div>
                            </div>

                            {/* Text area — white bottom */}
                            <div className="bg-white flex flex-col flex-1 px-5 py-5 text-center">
                                <h3 className="text-base font-bold text-gray-900 mb-2">{card.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{card.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Mobile: single-card auto-slide carousel */}
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
                        <div key={card.title} className="w-full flex-shrink-0 px-4">
                            <div
                                className="rounded-3xl overflow-hidden shadow-sm mx-auto max-w-xs"
                                style={{ background: card.bgColor ?? '#ffffff' }}
                            >
                                {/* Icon area */}
                                <div
                                    className="flex items-center justify-center pt-10 pb-8 px-6"
                                    style={{ background: card.bgColor ?? '#f3f4f6' }}
                                >
                                    <div
                                        className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-sm"
                                        style={{ backgroundColor: card.iconColor ? `${card.iconColor}22` : '#e5e7eb' }}
                                    >
                                        <card.icon
                                            className="w-11 h-11"
                                            style={{ color: card.iconColor ?? '#374151' }}
                                        />
                                    </div>
                                </div>

                                {/* Text area */}
                                <div className="bg-white px-6 py-6 text-center">
                                    <h3 className="text-base font-bold text-gray-900 mb-2">{card.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{card.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation dots */}
                <div className="flex justify-center gap-2 mt-6">
                    {cards.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => handleDotClick(i)}
                            aria-label={`Go to slide ${i + 1}`}
                            className={`rounded-full transition-all duration-300 ${
                                i === activeIndex
                                    ? 'w-6 h-2 bg-gray-800'
                                    : 'w-2 h-2 bg-gray-300'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
