import { MapPin, Phone, Mail } from 'lucide-react';

const teamMembers = [
    { name: 'Team Member 1', role: 'CEO & Founder', rotation: '-2deg' },
    { name: 'Team Member 2', role: 'CTO', rotation: '3deg' },
    { name: 'Team Member 3', role: 'Head of AI', rotation: '-1deg' },
    { name: 'Team Member 4', role: 'Lead Engineer', rotation: '2deg' },
    { name: 'Team Member 5', role: 'Product Manager', rotation: '-3deg' },
    { name: 'Team Member 6', role: 'Designer', rotation: '1deg' },
];

const values = [
    {
        title: 'Innovation First',
        description: 'We push boundaries and embrace new technologies to solve complex problems.',
    },
    {
        title: 'Customer Obsession',
        description: 'Every decision we make starts with understanding our customer\'s needs.',
    },
    {
        title: 'Radical Transparency',
        description: 'We believe in open communication, honest feedback, and shared knowledge.',
    },
    {
        title: 'Continuous Learning',
        description: 'We invest in growth, celebrate curiosity, and learn from every experience.',
    },
];

export default function CulturePage() {
    return (
        <div className="min-h-screen px-4 md:px-8 py-8 md:py-16 bg-zinc-900">
            <div className="max-w-6xl mx-auto">
                {/* Hero Section */}
                <div className="mb-20">
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                        Drop by for some<br />coffee. At anytime.
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl leading-relaxed">
                        A space where we can bounce ideas off each other, support colleagues,
                        catch up on the weekend's activities or play table tennis at lunch.
                    </p>
                </div>

                {/* Team Photos - Polaroid Style */}
                <div className="mb-20">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {teamMembers.map((member, index) => (
                            <div
                                key={index}
                                className="bg-zinc-900 p-3 shadow-xl rounded-sm transform hover:scale-105 transition-all duration-300 cursor-pointer border border-white/10"
                                style={{ transform: `rotate(${member.rotation})` }}
                            >
                                {/* Placeholder Image */}
                                <div className="aspect-square bg-zinc-900/5 mb-3 rounded-sm flex items-center justify-center">
                                    <div className="w-24 h-24 rounded-full bg-zinc-900/10 flex items-center justify-center">
                                        <span className="text-4xl text-white/30">👤</span>
                                    </div>
                                </div>
                                <div className="text-center py-2">
                                    <p className="font-bold text-white">{member.name}</p>
                                    <p className="text-sm text-white/50">{member.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Values Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
                    <div className="md:col-span-2">
                        <h2 className="text-3xl font-black text-white mb-8">Our Values</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {values.map((value, index) => (
                                <div key={index} className="bg-zinc-900/5 rounded-2xl p-6 hover:bg-zinc-900/10 transition-colors border border-white/5">
                                    <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
                                    <p className="text-white/60">{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-white">Visit Us</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-white/40 mt-0.5" />
                                <div>
                                    <p className="text-white">AIORA Headquarters</p>
                                    <p className="text-white/50 text-sm">Bangalore, India</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-white/40 mt-0.5" />
                                <div>
                                    <p className="text-white">+91 80 1234 5678</p>
                                    <p className="text-white/50 text-sm">Mon-Fri, 9am-6pm IST</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-white/40 mt-0.5" />
                                <div>
                                    <p className="text-white">hello@aiora.live</p>
                                    <p className="text-white/50 text-sm">We'll respond within 24h</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mission Statement */}
                <div className="bg-zinc-900 text-white rounded-3xl p-12 text-center">
                    <h2 className="text-3xl font-black mb-4">Our Mission</h2>
                    <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                        To empower businesses with intelligent automation that works alongside humans,
                        not to replace them. We believe AI should amplify human potential,
                        making work more meaningful and productive.
                    </p>
                </div>
            </div>
        </div>
    );
}
