'use client';

import { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AskOra() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');

    return (
        <div className="fixed bottom-6 left-6 z-50 font-sans">
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-zinc-900 rounded-3xl shadow-2xl w-[380px] sm:w-[420px] overflow-hidden border border-white/10 flex flex-col max-h-[600px] h-[550px]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-zinc-900">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg leading-none">Ask ORA</h3>
                                    <p className="text-zinc-400 text-xs mt-1">Always online</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-zinc-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 p-5 overflow-y-auto bg-zinc-950/50 space-y-4">
                            {/* AI Message */}
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center mt-1">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-zinc-800/80 p-4 rounded-2xl rounded-tl-none border border-white/5 text-white/90 text-[15px] leading-relaxed shadow-sm max-w-[85%]">
                                    Hi! I'm ORA, your AI assistant. How can I help you build your business today?
                                </div>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-zinc-900 border-t border-white/10">
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Ask anything..."
                                    className="w-full bg-zinc-950 text-white placeholder-zinc-500 outline-none text-[15px] rounded-2xl pl-5 pr-12 py-4 border border-white/10 focus:border-white/20 transition-all shadow-inner"
                                />
                                <button className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all duration-200 ${message ? 'bg-white text-black hover:scale-105' : 'bg-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-700'}`}>
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="text-center mt-3">
                                <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-medium">Powered by AIORA Engine</p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="group flex items-center gap-3 bg-white text-black px-6 py-4 rounded-full shadow-[0_8px_30px_rgb(255,255,255,0.2)] hover:shadow-[0_8px_35px_rgb(255,255,255,0.3)] transition-all duration-300"
                    >
                        <div className="relative">
                            <MessageCircle className="w-6 h-6" />
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                            </span>
                        </div>
                        <span className="font-bold text-lg tracking-tight">Ask ORA</span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
