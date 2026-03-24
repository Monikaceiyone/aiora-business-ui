'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const polaroids = [
    {
        id: 1,
        src: '/images/culture/office.png',
        rotate: -6,
        x: -250,
        y: -40,
        caption: 'HQ - Late Nights'
    },
    {
        id: 2,
        src: '/images/culture/meeting.png',
        rotate: 4,
        x: -80,
        y: 50,
        caption: 'Brainstorming'
    },
    {
        id: 3,
        src: '/images/culture/coding.png',
        rotate: -3,
        x: 100,
        y: -30,
        caption: 'Shipping Code'
    },
    {
        id: 4,
        src: '/images/culture/social.png',
        rotate: 5,
        x: 270,
        y: 40,
        caption: 'Friday Socials'
    }
];

export function PolaroidSection() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <section className="relative py-16 md:py-32 bg-zinc-900 overflow-hidden">
            <div className="container mx-auto px-4 md:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12">

                    {/* Text Content */}
                    <div className="lg:w-1/3 text-white z-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: isMobile ? 0.3 : 0.6 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 md:mb-6">
                                <span className="bg-white text-black px-2 inline-block transform -rotate-2">Innovation</span> happens<br />
                                when we connect.
                            </h2>
                            <p className="text-zinc-400 text-base md:text-lg leading-relaxed mb-6 md:mb-8">
                                A space where ideas collide, code ships, and the future is built.
                                Our culture is the operating system for our success.
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                </div>
                                <span className="text-xs md:text-sm font-mono text-zinc-500 uppercase tracking-widest">
                                    Hiring Now
                                </span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Polaroids Container */}
                    <div className="lg:w-2/3 relative h-[400px] md:h-[600px] w-full flex items-center justify-center mt-12 lg:mt-0">
                        <div className="relative w-full h-full max-w-2xl mx-auto">
                            {polaroids.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    className="absolute left-1/2 top-1/2 w-48 md:w-80 bg-white p-2 md:p-3 pb-6 md:pb-8 shadow-2xl"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{
                                        opacity: 1,
                                        scale: 1,
                                        rotate: item.rotate,
                                        x: isMobile ? item.x * 0.3 : item.x,
                                        y: isMobile ? item.y * 0.3 : item.y
                                    }}
                                    viewport={{ once: true }}
                                    // Only animate on desktop
                                    animate={isMobile ? {} : {
                                        y: [item.y, item.y - 10, item.y],
                                        rotate: [item.rotate, item.rotate + 2, item.rotate - 2, item.rotate],
                                    }}
                                    transition={{
                                        duration: isMobile ? 0.4 : 0.8,
                                        delay: index * (isMobile ? 0.05 : 0.1),
                                        ...(!isMobile && {
                                            y: {
                                                duration: 3 + index * 0.5,
                                                repeat: Infinity,
                                                repeatType: "reverse" as const,
                                                ease: "easeInOut",
                                            },
                                            rotate: {
                                                duration: 4 + index * 0.3,
                                                repeat: Infinity,
                                                repeatType: "reverse" as const,
                                                ease: "easeInOut",
                                            }
                                        })
                                    }}
                                    drag={!isMobile}
                                    dragConstraints={{ left: -50, right: -50, top: -50, bottom: 50 }}
                                    whileHover={!isMobile ? { scale: 1.1, zIndex: 50, rotate: 0 } : {}}
                                    whileTap={!isMobile ? { scale: 0.95 } : {}}
                                >
                                    <div className="aspect-[4/5] relative overflow-hidden bg-zinc-100 mb-2">
                                        <Image
                                            src={item.src}
                                            alt={item.caption}
                                            fill
                                            className={isMobile ? "object-cover grayscale" : "object-cover grayscale hover:grayscale-0 transition-all duration-500"}
                                        />
                                    </div>
                                    <p className="font-handwriting text-black text-center text-sm md:text-lg font-medium transform -rotate-1 opacity-80" style={{ fontFamily: 'cursive' }}>
                                        {item.caption}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Background elements - Hidden on mobile */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent z-10" />
            <div className="hidden md:block absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl z-0" />
            <div className="hidden md:block absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl z-0" />
        </section>
    );
}
