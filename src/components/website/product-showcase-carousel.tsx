'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';

export interface ShowcaseProduct {
    title: string;
    subtitle: string;
    description: string;
    image: string;
    bgImage?: string;
    color: string;
    icon: LucideIcon;
    tag?: string;
}

interface Props {
    products: ShowcaseProduct[];
    autoPlayInterval?: number;
}

// Card dimensions — desktop
const CARD_W = 190;
const CARD_H_ACTIVE = 340;
const CARD_H_NEXT = 310;
const CARD_H_PEEK = 285;
const CARD_H_FAR = 265;

// Card dimensions — mobile
const M_CARD_W = 140;
const M_CARD_H_ACTIVE = 220;
const M_CARD_H_NEXT = 200;
const M_CARD_H_PEEK = 182;
const M_CARD_H_FAR = 165;

export default function  ProductShowcaseCarousel({ products, autoPlayInterval = 5000 }: Props) {
    const [active, setActive] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const touchStartX = useRef<number | null>(null);
    const total = products.length;

    // Background = previous product image
    const prevIdx = (active - 1 + total) % total;
    const bgSrc = products[prevIdx].bgImage ?? products[prevIdx].image;

    const go = useCallback((idx: number) => setActive(idx), []);
    const next = useCallback(() => setActive(i => (i + 1) % total), [total]);
    const prev = useCallback(() => setActive(i => (i - 1 + total) % total), [total]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(next, autoPlayInterval);
    }, [next, autoPlayInterval]);

    useEffect(() => {
        resetTimer();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [resetTimer]);

    const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); resetTimer(); }
        touchStartX.current = null;
    };

    const current = products[active];

    return (
        <section
            className="relative w-full overflow-hidden select-none"
            style={{ height: '100dvh', minHeight: 600 }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            {/* ── Background: always previous product ── */}
            <AnimatePresence initial={false}>
                <motion.div
                    key={`bg-${prevIdx}`}
                    className="absolute inset-0 w-full h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                    style={{ zIndex: 0 }}
                >
                    <img
                        src={bgSrc}
                        alt=""
                        aria-hidden
                        className="w-full h-full object-cover"
                    />
                    {/* Left-heavy dark vignette for text legibility */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(95deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.52) 38%, rgba(0,0,0,0.18) 65%, rgba(0,0,0,0.08) 100%)',
                        }}
                    />
                </motion.div>
            </AnimatePresence>

            {/* ── Left text block ── */}
            <div
                className="absolute inset-y-0 left-0 flex flex-col justify-center z-10 pointer-events-none"
                style={{ width: '42%', paddingLeft: 'clamp(2rem, 5vw, 5rem)' }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`text-${active}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        {/* Tag line */}
                        <div className="flex items-center gap-2 mb-5">
                            <span className="block w-7 h-[2px]" style={{ background: current.color }} />
                            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">
                                {current.tag ?? current.subtitle}
                            </span>
                        </div>

                        {/* Big title */}
                        <h2
                            className="font-black text-white uppercase leading-[0.92] mb-6"
                            style={{ fontSize: 'clamp(2.8rem, 5.5vw, 5.2rem)' }}
                        >
                            {current.title}
                        </h2>

                        <p className="text-white/55 text-sm leading-relaxed max-w-[280px] mb-8">
                            {current.description}
                        </p>

                        {/* CTA */}
                        <a
                            href="/core-suite"
                            className="pointer-events-auto inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] px-5 py-3 rounded-full transition-all"
                            style={{
                                background: `${current.color}22`,
                                color: current.color,
                                border: `1px solid ${current.color}55`,
                            }}
                        >
                            Discover
                            <ChevronRight className="w-3.5 h-3.5" />
                        </a>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── Card row ── */}
            {/*
                Layout (matches reference image):
                  pos -1 (prev): blurred, partially off-screen left, low opacity
                  pos  0 (active): tallest, sharp, leftmost of visible group
                  pos +1: slightly shorter
                  pos +2: shorter still
                  pos +3: peeking from right edge, partially clipped
                Cards are absolutely positioned, anchored from a start X ~38% of viewport.
            */}
            <CardRow
                products={products}
                active={active}
                total={total}
                onCardClick={(i) => { go(i); resetTimer(); }}
            />

            {/* ── Bottom bar ── */}
            <div className="absolute bottom-8 left-0 right-0 z-20 flex items-center justify-between px-8 md:px-14">
                {/* Arrows */}
                {/* <div className="flex items-center gap-3">
                    <button
                        onClick={() => { prev(); resetTimer(); }}
                        className="w-11 h-11 rounded-full flex items-center justify-center border border-white/25 bg-black/35 backdrop-blur-md hover:bg-white/20 transition-all text-white"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => { next(); resetTimer(); }}
                        className="w-11 h-11 rounded-full flex items-center justify-center border border-white/25 bg-black/35 backdrop-blur-md hover:bg-white/20 transition-all text-white"
                        aria-label="Next"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div> */}

                {/* Dots */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {products.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => { go(i); resetTimer(); }}
                            aria-label={`Slide ${i + 1}`}
                            className="rounded-full transition-all duration-300"
                            style={{
                                width: i === active ? 22 : 7,
                                height: 7,
                                background: i === active ? products[active].color : 'rgba(255,255,255,0.3)',
                            }}
                        />
                    ))}
                </div>

                {/* Slide number */}
                {/* <span
                    className="font-black text-white/80 tabular-nums"
                    style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)' }}
                >
                    {String(active + 1).padStart(2, '0')}
                </span> */}
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// CardRow: renders all cards with absolute positioning driven by their
// offset from the active index. Matches the reference image layout:
//
//   offset -1 → blurred ghost card, partially off-screen left
//   offset  0 → active: tallest, fully sharp, starts at ~38vw
//   offset +1 → next: slightly shorter, full opacity
//   offset +2 → after-next: shorter, slight opacity drop
//   offset +3 → far peek: partially clipped by right edge
//   offset +4+ → hidden off-screen right
// ─────────────────────────────────────────────────────────────────────────────

function CardRow({
    products,
    active,
    total,
    onCardClick,
}: {
    products: ShowcaseProduct[];
    active: number;
    total: number;
    onCardClick: (i: number) => void;
}) {
    const [mobile, setMobile] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 768px)');
        setMobile(mq.matches);
        const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    return (
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
            {products.map((p, i) => {
                let offset = i - active;
                if (offset > total / 2) offset -= total;
                if (offset < -total / 2) offset += total;

                return (
                    <AnimatedCard
                        key={p.title}
                        product={p}
                        offset={offset}
                        mobile={mobile}
                        onClick={() => onCardClick(i)}
                    />
                );
            })}
        </div>
    );
}

// Per-offset visual config
function getConfig(offset: number, mobile: boolean): {
    rightVw: number;
    bottomPx: number;
    height: number;
    width: number;
    opacity: number;
    blur: number;
    scale: number;
    zIndex: number;
    visible: boolean;
} {
    const H_ACTIVE = mobile ? M_CARD_H_ACTIVE : CARD_H_ACTIVE;
    const H_NEXT   = mobile ? M_CARD_H_NEXT   : CARD_H_NEXT;
    const H_PEEK   = mobile ? M_CARD_H_PEEK   : CARD_H_PEEK;
    const H_FAR    = mobile ? M_CARD_H_FAR    : CARD_H_FAR;
    const W        = mobile ? M_CARD_W        : CARD_W;
    const bottom   = mobile ? 48              : 60;

    switch (offset) {
        case  0: return { rightVw: 2,  bottomPx: bottom, height: H_ACTIVE, width: W, opacity: 1,    blur: 0, scale: 1,    zIndex: 40, visible: true };
        case  1: return { rightVw: 14, bottomPx: bottom, height: H_NEXT,   width: W, opacity: 1,    blur: 0, scale: 0.96, zIndex: 30, visible: true };
        case  2: return { rightVw: 25, bottomPx: bottom, height: H_PEEK,   width: W, opacity: 0.85, blur: 0, scale: 0.92, zIndex: 20, visible: true };
        case  3: return { rightVw: 35, bottomPx: bottom, height: H_FAR,    width: W, opacity: 0.6,  blur: 0, scale: 0.88, zIndex: 10, visible: true };
        case -1: return { rightVw: 44, bottomPx: bottom, height: H_PEEK,   width: W, opacity: 0.4,  blur: 6, scale: 0.88, zIndex: 5,  visible: true };
        default:
            return {
                rightVw: offset > 0 ? -30 : 110,
                bottomPx: bottom,
                height: H_FAR,
                width: W,
                opacity: 0,
                blur: 0,
                scale: 0.8,
                zIndex: 0,
                visible: false,
            };
    }
}

function AnimatedCard({
    product,
    offset,
    mobile,
    onClick,
}: {
    product: ShowcaseProduct;
    offset: number;
    mobile: boolean;
    onClick: () => void;
}) {
    const cfg = getConfig(offset, mobile);

    return (
        <motion.div
            animate={{
                right: `${cfg.rightVw}vw`,
                bottom: cfg.bottomPx,
                height: cfg.height,
                opacity: cfg.opacity,
                scale: cfg.scale,
                filter: cfg.blur > 0 ? `blur(${cfg.blur}px)` : 'blur(0px)',
            }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute pointer-events-auto cursor-pointer"
            style={{
                width: cfg.width,
                zIndex: cfg.zIndex,
                willChange: 'transform, opacity, right, bottom, height',
            }}
            onClick={onClick}
        >
            <div
                className="w-full h-full rounded-2xl overflow-hidden shadow-2xl relative flex flex-col"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
                {/* Full-card image */}
                <img
                    src={product.image}
                    alt={product.title}
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Bottom gradient for text */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 45%, transparent 100%)',
                    }}
                />

                {/* Text overlay at bottom */}
                <div className={`absolute bottom-0 left-0 right-0 ${mobile ? 'px-2 pb-2 pt-6' : 'px-3 pb-3 pt-8'}`}>
                    {product.tag && (
                        <p
                            className={`uppercase font-semibold mb-0.5 ${mobile ? 'text-[8px] tracking-[0.12em]' : 'text-[9px] tracking-[0.16em]'}`}
                            style={{ color: product.color }}
                        >
                            {product.tag}
                        </p>
                    )}
                    <h3 className={`text-white font-black uppercase leading-tight ${mobile ? 'text-[10px]' : 'text-[12px]'}`}>
                        {product.title}
                    </h3>
                    <p className={`text-white/55 leading-snug mt-0.5 ${mobile ? 'text-[9px]' : 'text-[10px]'}`}>
                        {product.subtitle}
                    </p>
                </div>

                {/* Bottom color accent */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-[3px]"
                    style={{
                        background: `linear-gradient(90deg, transparent, ${product.color}, transparent)`,
                    }}
                />
            </div>
        </motion.div>
    );
}
