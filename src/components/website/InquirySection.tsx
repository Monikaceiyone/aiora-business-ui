'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'react-qr-code';
import { Send, ScanLine, Mic, Image as ImageIcon, Type, X, Upload, StopCircle, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function InquirySection() {
    const [mounted, setMounted] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [activeTab, setActiveTab] = useState<'text' | 'voice' | 'image'>('text');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        company: '',
        field: '',
        message: ''
    });

    // Multimedia State
    const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
    const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [currentUrl, setCurrentUrl] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            setCurrentUrl(window.location.href);
        }
        return () => {
            if (voiceUrl) URL.revokeObjectURL(voiceUrl);
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- Voice Logic ---
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const chunks: BlobPart[] = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setVoiceBlob(blob);
                setVoiceUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingDuration(0);
            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const resetVoice = () => {
        setVoiceBlob(null);
        setVoiceUrl(null);
        setRecordingDuration(0);
    };

    const formatDuration = (sec: number) => {
        const min = Math.floor(sec / 60);
        const s = sec % 60;
        return `${min}:${s < 10 ? '0' : ''}${s}`;
    };

    // --- Image Logic ---
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    // --- Upload Logic ---
    const uploadFile = async (file: Blob | File, path: string) => {
        const { data, error } = await supabase.storage
            .from('inquiries')
            .upload(path, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('inquiries')
            .getPublicUrl(path);

        return publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            let uploadedVoiceUrl = null;
            let uploadedImageUrl = null;
            const timestamp = Date.now();

            // Upload Voice
            if (activeTab === 'voice' && voiceBlob) {
                const path = `voice/${timestamp}_recording.webm`;
                uploadedVoiceUrl = await uploadFile(voiceBlob, path);
            }

            // Upload Image
            if (activeTab === 'image' && selectedImage) {
                const ext = selectedImage.name.split('.').pop();
                const path = `images/${timestamp}_${formData.name.replace(/\s+/g, '_')}.${ext}`;
                uploadedImageUrl = await uploadFile(selectedImage, path);
            }

            const payload = {
                ...formData,
                voice_url: uploadedVoiceUrl,
                image_url: uploadedImageUrl,
                // If switching tabs, we might want to clear message if not in text mode, 
                // but keeping it is safer. However, we should prioritize the active tab type.
            };

            const response = await fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', phone: '', email: '', company: '', field: '', message: '' });
                resetVoice();
                removeImage();
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                const errorData = await response.json();
                console.error('Submission failed:', errorData);
                alert(`Error submitting form: ${errorData.error || 'Unknown error'}`);
                setStatus('error');
            }
        } catch (error) {
            console.error('Error submitting inquiry:', error);
            alert(`Network or Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setStatus('error');
        }
    };

    const inputClasses = "w-full bg-transparent border-b border-black/20 py-2 text-xl font-light text-black focus:outline-none focus:border-black transition-colors placeholder-black/20";
    const labelClasses = "block text-xs uppercase tracking-wider text-black/50 mb-1 group-focus-within:text-black transition-colors";

    if (!mounted) return null;

    return (
        <section className="w-full min-h-[60vh] py-8 md:py-20 px-4 md:px-8 bg-white/50 backdrop-blur-sm relative overflow-hidden" id="inquiry">
            <div className="max-w-6xl mx-auto">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row gap-12 md:gap-24 items-start"
                >
                    {/* Left Side: Inquiry Form */}
                    <div className="w-full md:w-2/3 space-y-8">
                        <div>
                            <h2 className="text-4xl font-light text-black mb-2">Get in touch</h2>
                            <p className="text-black/60 font-light">
                                Tell us about your project. We'd love to explore it with you.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Personal Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="group relative">
                                    <label className={labelClasses}>Your Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={inputClasses}
                                        placeholder="Jane Doe"
                                    />
                                </div>

                                <div className="group relative">
                                    <label className={labelClasses}>Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={inputClasses}
                                        placeholder="jane@example.com"
                                    />
                                </div>

                                <div className="group relative">
                                    <label className={labelClasses}>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={inputClasses}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>

                                <div className="group relative">
                                    <label className={labelClasses}>Company Name</label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        className={inputClasses}
                                        placeholder="Acme Inc."
                                    />
                                </div>

                                <div className="group relative">
                                    <label className={labelClasses}>Field of Interest *</label>
                                    <select
                                        name="field"
                                        required
                                        value={formData.field}
                                        onChange={handleChange}
                                        className={`${inputClasses} appearance-none cursor-pointer`}
                                    >
                                        <option value="" disabled>Select a field</option>
                                        <option value="Business">Business</option>
                                        <option value="Technology">Technology</option>
                                        <option value="Design">Design</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Multimedia Section - "What they want" */}
                            <div className="space-y-4">
                                <label className="block text-xs uppercase tracking-wider text-black/50">How can we help? *</label>

                                {/* Tabs */}
                                <div className="flex gap-4 border-b border-black/5 pb-2">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('text')}
                                        className={`flex items-center gap-2 pb-2 text-sm uppercase tracking-wider transition-colors relative ${activeTab === 'text' ? 'text-black' : 'text-black/40 hover:text-black/70'}`}
                                    >
                                        <Type className="w-4 h-4" />
                                        <span>Text</span>
                                        {activeTab === 'text' && <motion.div layoutId="tab-indicator" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-black" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('voice')}
                                        className={`flex items-center gap-2 pb-2 text-sm uppercase tracking-wider transition-colors relative ${activeTab === 'voice' ? 'text-black' : 'text-black/40 hover:text-black/70'}`}
                                    >
                                        <Mic className="w-4 h-4" />
                                        <span>Voice</span>
                                        {activeTab === 'voice' && <motion.div layoutId="tab-indicator" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-black" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('image')}
                                        className={`flex items-center gap-2 pb-2 text-sm uppercase tracking-wider transition-colors relative ${activeTab === 'image' ? 'text-black' : 'text-black/40 hover:text-black/70'}`}
                                    >
                                        <ImageIcon className="w-4 h-4" />
                                        <span>Image</span>
                                        {activeTab === 'image' && <motion.div layoutId="tab-indicator" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-black" />}
                                    </button>
                                </div>

                                {/* Content Area */}
                                <div className="min-h-[120px] relative">
                                    <AnimatePresence mode="wait">
                                        {activeTab === 'text' && (
                                            <motion.div
                                                key="text"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="w-full"
                                            >
                                                <textarea
                                                    name="message"
                                                    required={activeTab === 'text'}
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    rows={4}
                                                    className="w-full bg-black/5 border-none rounded-lg p-4 text-black font-light focus:ring-1 focus:ring-black/20 resize-none placeholder-black/30"
                                                    placeholder="Describe your inquiry details here..."
                                                />
                                            </motion.div>
                                        )}

                                        {activeTab === 'voice' && (
                                            <motion.div
                                                key="voice"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="w-full bg-black/5 rounded-lg p-8 flex flex-col items-center justify-center gap-4"
                                            >
                                                {!voiceUrl ? (
                                                    <>
                                                        <div className="text-black/40 text-sm font-light uppercase tracking-widest">
                                                            {isRecording ? 'Recording...' : 'Click to Record'}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={isRecording ? stopRecording : startRecording}
                                                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-black hover:bg-black/80'}`}
                                                        >
                                                            {isRecording ? <div className="w-6 h-6 bg-white rounded-md" /> : <Mic className="w-8 h-8 text-white" />}
                                                        </button>
                                                        {isRecording && <div className="font-mono text-xl">{formatDuration(recordingDuration)}</div>}
                                                    </>
                                                ) : (
                                                    <div className="w-full flex flex-col items-center gap-4">
                                                        <div className="w-full bg-white p-4 rounded-full flex items-center gap-4 shadow-sm">
                                                            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0">
                                                                <Play className="w-4 h-4 text-white ml-0.5" />
                                                            </div>
                                                            <div className="grow h-1 bg-gray-200 rounded-full overflow-hidden">
                                                                <div className="h-full bg-black/50 w-1/3" />
                                                            </div>
                                                            <audio src={voiceUrl} controls className="hidden" /> {/* Hidden native audio, bespoke UI above implies verification needed or just keep simple native: */}
                                                            {/* Actually, for simplicity let's use native audio control for playback */}
                                                            <div className="text-xs font-mono text-black/50">Voice Note Recorded</div>
                                                        </div>
                                                        <audio src={voiceUrl} controls className="w-full max-w-sm" />

                                                        <button
                                                            type="button"
                                                            onClick={resetVoice}
                                                            className="text-xs text-red-500 hover:text-red-600 uppercase tracking-wider flex items-center gap-1"
                                                        >
                                                            <X className="w-3 h-3" /> Remove & Record Again
                                                        </button>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}

                                        {activeTab === 'image' && (
                                            <motion.div
                                                key="image"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="w-full"
                                            >
                                                {!imagePreview ? (
                                                    <label className="w-full h-40 bg-black/5 rounded-lg border-2 border-dashed border-black/10 flex flex-col items-center justify-center cursor-pointer hover:bg-black/10 transition-colors">
                                                        <Upload className="w-8 h-8 text-black/30 mb-2" />
                                                        <span className="text-black/40 text-sm uppercase tracking-widest">Upload Image</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleImageSelect}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                ) : (
                                                    <div className="relative w-full h-64 bg-black/5 rounded-lg overflow-hidden group">
                                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                                        <button
                                                            type="button"
                                                            onClick={removeImage}
                                                            className="absolute top-4 right-4 bg-black/50 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={status === 'loading'}
                                className={`mt-8 px-8 py-4 w-full md:w-auto min-w-[200px] text-white text-sm font-medium uppercase tracking-widest rounded-full transition-colors flex items-center justify-center gap-2 ${status === 'success' ? 'bg-green-600' : status === 'error' ? 'bg-red-600' : 'bg-black hover:bg-black/90'
                                    }`}
                            >
                                {status === 'loading' ? (
                                    <span>Sending...</span>
                                ) : status === 'success' ? (
                                    <span>Sent Successfully!</span>
                                ) : status === 'error' ? (
                                    <span>Try Again</span>
                                ) : (
                                    <>
                                        <span>Submit Inquiry</span>
                                        <Send className="w-4 h-4 ml-1" />
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </div>

                    {/* Right Side: Simple Scanner/QR */}
                    <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-8 border border-black/5 rounded-2xl bg-white/40 md:sticky md:top-24">
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-2">
                                <ScanLine className="w-6 h-6 text-black/60" />
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-black">Scan to Connect</h3>
                                <p className="text-sm text-black/50 mt-1">Open this page on your mobile device</p>
                            </div>

                            <div className="p-4 bg-white rounded-xl shadow-sm border border-black/5">
                                {currentUrl && (
                                    <QRCode
                                        value={currentUrl}
                                        size={180}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        viewBox={`0 0 256 256`}
                                    />
                                )}
                            </div>

                            <p className="text-xs text-black/30 max-w-[200px]">
                                Use your camera to scan and redirect here instantly.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
