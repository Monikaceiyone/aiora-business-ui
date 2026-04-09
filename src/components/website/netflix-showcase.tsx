'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Plus, X } from 'lucide-react';

export interface NetflixCard {
    name: string;
    category: string;
    tagline: string;
    image: string;
    color: string;
}

interface Props {
    cards: NetflixCard[];
}

export default function NetflixShowcase({ cards }: Props) {
    const [active, setActive] = useState<number | null>(null);

    return (
        <section
            className="relative w-full overflow-hidden"
            style={{ minHeight: '100vh', background: '#111113' }}
        >
            {/* Ambient blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-20 blur-[140px] transition-all duration-700"
                    style={{ background: active !== null ? cards[active].color : '#9CA3AF' }}
                />
                <div
                    className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-15 blur-[120px] transition-all duration-700"
                    style={{ background: active !== null ? cards[active].color : '#9CA3AF' }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center py-16 px-4 md:px-12">

                {/* Heading */}
                {/* <AnimatePresence>
                    {active === null && (
                        <motion.div
                            key="heading"
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.3 }}
                            className="text-center mb-10"
                        >
                            <p className="text-xs uppercase tracking-[0.3em] font-semibold text-white/40 mb-2">
                                built for
                            </p>
                            <h2 className="text-3xl md:text-5xl font-black text-white">
                                businesses like{' '}
                                <span className="text-white/25">yours.</span>
                            </h2>
                            <p className="text-white/30 text-xs mt-3 uppercase tracking-widest">
                                tap a card to explore
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence> */}

                {/* Card area */}
                <div className="relative w-full">
                    <AnimatePresence mode="wait">
                        {active === null ? (
                            /* ── Default strip ── */
                            <motion.div
                                key="strip"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 justify-start md:justify-center"
                            >
                                {cards.map((card, i) => (
                                    <motion.div
                                        key={card.name}
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.2 }}
                                        className="snap-center flex-shrink-0 relative rounded-2xl overflow-hidden cursor-pointer"
                                        style={{
                                            width: 130,
                                            height: 340,
                                            border: `1.5px solid rgba(255,255,255,0.1)`,
                                            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
                                        }}
                                        onClick={() => setActive(i)}
                                    >
                                        <img
                                            src={card.image}
                                            alt={card.name}
                                            className="absolute inset-0 w-full h-full object-cover"
                                            draggable={false}
                                        />
                                        {/* frost */}
                                        <div className="absolute inset-0 bg-black/35" style={{ backdropFilter: 'blur(1px)' }} />
                                        {/* shimmer */}
                                        <div className="absolute inset-0 pointer-events-none"
                                            style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.07) 0%,transparent 55%)' }} />
                                        {/* bottom gradient */}
                                        <div className="absolute inset-0"
                                            style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 55%)' }} />
                                        {/* vertical label */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <p className="text-white/80 text-[11px] font-bold uppercase tracking-wider"
                                                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}>
                                                {card.name}
                                            </p>
                                        </div>
                                        {/* category dot */}
                                        <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                                            <span className="w-2 h-2 rounded-full" style={{ background: card.color }} />
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            /* ── Expanded hero card ── */
                            <motion.div
                                key={`expanded-${active}`}
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                                className="relative w-full rounded-3xl overflow-hidden"
                                style={{
                                    height: '78vh',
                                    minHeight: 420,
                                    border: `1.5px solid ${cards[active].color}55`,
                                    boxShadow: `0 0 60px ${cards[active].color}33, 0 16px 48px rgba(0,0,0,0.7)`,
                                }}
                            >
                                {/* Background image */}
                                <img
                                    src={cards[active].image}
                                    alt={cards[active].name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    draggable={false}
                                />

                                {/* Gradient overlays */}
                                <div className="absolute inset-0"
                                    style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.1) 100%)' }} />
                                <div className="absolute inset-0"
                                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 45%)' }} />

                                {/* Glass shimmer */}
                                <div className="absolute inset-0 pointer-events-none"
                                    style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.04) 0%,transparent 50%)' }} />

                                {/* Close button */}
                                <button
                                    onClick={() => setActive(null)}
                                    className="absolute top-5 right-5 z-30 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                                    style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
                                    aria-label="Close"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                {/* Hero content */}
                                <motion.div
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.2 }}
                                    className="absolute inset-0 flex flex-col justify-center pl-8 md:pl-16 pr-8 md:pr-1/2 z-20"
                                >
                                    <p className="text-xs uppercase tracking-[0.25em] font-semibold mb-3"
                                        style={{ color: cards[active].color }}>
                                        {cards[active].category}
                                    </p>
                                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase leading-tight mb-4">
                                        {cards[active].name}
                                    </h2>
                                    <p className="text-white/60 text-sm md:text-base leading-relaxed mb-8 max-w-md">
                                        {cards[active].tagline}
                                    </p>

                                    <div className="flex items-center gap-3 flex-wrap">
                                        <a
                                            href="/connect"
                                            className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-black transition-all hover:opacity-90"
                                            style={{ background: cards[active].color }}
                                        >
                                            <ArrowRight className="w-4 h-4" />
                                            Get Started
                                        </a>
                                        <a
                                            href="/core-suite"
                                            className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white transition-all hover:bg-white/20"
                                            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}
                                        >
                                            <Plus className="w-4 h-4" />
                                            Learn More
                                        </a>
                                    </div>
                                </motion.div>

                                {/* Color accent bar */}
                                <div
                                    className="absolute bottom-0 left-0 right-0 h-[3px]"
                                    style={{ background: `linear-gradient(90deg, transparent, ${cards[active].color}, transparent)` }}
                                />

                                {/* Thumbnail strip at bottom-right */}
                                <div className="absolute bottom-5 right-5 hidden md:flex gap-2 z-20">
                                    {cards.map((c, i) => (
                                        <div
                                            key={c.name}
                                            onClick={() => setActive(i)}
                                            className="relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300"
                                            style={{
                                                width: 56,
                                                height: 72,
                                                opacity: i === active ? 1 : 0.45,
                                                border: i === active ? `1.5px solid ${c.color}` : '1.5px solid rgba(255,255,255,0.15)',
                                                transform: i === active ? 'scale(1.08)' : 'scale(1)',
                                            }}
                                        >
                                            <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
