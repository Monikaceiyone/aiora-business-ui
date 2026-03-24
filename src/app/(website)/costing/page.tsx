import Link from 'next/link';
import { Check } from 'lucide-react';

export default function CostingPage() {
    return (
        <div className="min-h-screen w-full px-4 md:px-8 py-8 md:py-24 flex flex-col items-center justify-start md:justify-center font-sans">
            <div className="max-w-7xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
                        Choose the Perfect Plan
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto w-full">
                    {/* Business Plan */}
                    <div className="border-2 border-black rounded-2xl p-6 md:p-8 flex flex-col hover:shadow-xl transition-shadow duration-300 bg-white">
                        <div className="mb-6 border-b border-gray-100 pb-4">
                            <h2 className="text-2xl font-black uppercase mb-2">Business</h2>
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-2xl font-bold">₹9,999</span>
                                <span className="text-black/60 text-sm font-medium">/One Time Setup</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black">₹3,999</span>
                                <span className="text-black/60 text-sm font-medium">/month</span>
                            </div>
                        </div>

                        <div className="space-y-4 flex-grow text-sm">
                            {/* Voice Agent */}
                            <div>
                                <h3 className="font-bold mb-1 flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-600" /> Voice Agent
                                </h3>
                                <ul className="pl-6 list-disc list-outside text-black/70 space-y-0.5">
                                    <li>Attend 90 calls on your behalf</li>
                                    <li>In the language spoken by customer</li>
                                    <li>Take appointments & Reservations</li>
                                </ul>
                            </div>

                            {/* Sales Agent */}
                            <div>
                                <h3 className="font-bold mb-1 flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-600" /> Sales Agent
                                </h3>
                                <ul className="pl-6 list-disc list-outside text-black/70 space-y-0.5">
                                    <li>Filter & Sell products on WhatsApp</li>
                                    <li>User can chat to buy</li>
                                </ul>
                            </div>

                            {/* Marketing Agent */}
                            <div>
                                <h3 className="font-bold mb-1 flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-600" /> Marketing Agent
                                </h3>
                                <ul className="pl-6 list-disc list-outside text-black/70 space-y-0.5">
                                    <li>Social Media post automations</li>
                                </ul>
                            </div>

                            {/* Inventory Agent */}
                            <div>
                                <h3 className="font-bold mb-1 flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-600" /> Inventory Agent
                                </h3>
                                <ul className="pl-6 list-disc list-outside text-black/70 space-y-0.5">
                                    <li>Auto Sync Products & Catalog</li>
                                </ul>
                            </div>
                            {/* Other Agent */}

                            <div>
                                <h3 className="font-bold mb-1 flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-600" /> Other Agents
                                </h3>
                                <ul className="pl-6 list-disc list-outside text-black/70 space-y-0.5">
                                    <li>More Agents to be added</li>
                                </ul>
                            </div>

                        </div>

                        <Link
                            href="/connect"
                            className="w-full mt-6 block py-3 bg-black text-white font-bold rounded-lg hover:bg-black/90 transition-colors uppercase tracking-widest text-sm text-center"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Custom Plan */}
                    <div className="bg-gray-50 border-2 border-black/10 rounded-2xl p-6 md:p-8 flex flex-col hover:border-black/30 transition-colors duration-300">
                        <div className="mb-6 border-b border-gray-200 pb-4">
                            <div className="flex justify-between items-start">
                                <h2 className="text-2xl font-black uppercase mb-2">Custom</h2>
                                <span className="bg-black text-white px-3 py-1 text-xs font-bold uppercase rounded-full">Enterprise</span>
                            </div>

                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold">Contact Us</span>
                            </div>
                            <p className="text-sm mt-2 text-black/70 leading-snug">
                                Customize your AI Agent experience to meet & exceed your ambitious goals.
                            </p>
                        </div>

                        <div className="space-y-3 flex-grow text-sm">
                            {[
                                "Automate all Manual Tasks via AI Agents",
                                "10x your Team's Productivity",
                                "Natural Language Interface",
                                "Faster Decision Support",
                                "Seamless System Integration",
                                "Database & AI Ecosystem Access",
                                "API & Event Driven Automation"
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-black" />
                                    <p className="text-black/80">{item}</p>
                                </div>
                            ))}
                        </div>

                        <Link
                            href="/connect"
                            className="w-full mt-6 block py-3 border-2 border-black text-black font-bold rounded-lg hover:bg-black hover:text-white transition-all uppercase tracking-widest text-sm text-center"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
