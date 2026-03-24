
import { Users, MessagesSquare, Share2, Shield } from 'lucide-react';

const features = [
    {
        icon: Users,
        title: 'Team Workspaces',
        description: 'Create dedicated workspaces for different teams or projects. Manage access and permissions with granular control.',
    },
    {
        icon: MessagesSquare,
        title: 'Real-time Chat with Context',
        description: 'Chat with your team and AI agents in the same thread. Agents have full context of the conversation and project data.',
    },
    {
        icon: Share2,
        title: 'Seamless Sharing',
        description: 'Share insights, reports, and automation workflows instantly with a single click. Collaborate on drafts and finalize faster.',
    },
    {
        icon: Shield,
        title: 'Enterprise-Grade Security',
        description: 'Your collaborative data is protected with end-to-end encryption and compliance with global security standards.',
    },
];

export default function CollaborationPage() {
    return (
        <div className="min-h-[calc(100vh-96px)] bg-white text-black">
            {/* Hero */}
            <div className="px-4 md:px-8 py-10 md:py-24 text-center max-w-4xl mx-auto">
                <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-bold uppercase tracking-widest mb-6">
                    Better Together
                </div>
                <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
                    Collaboration for the<br />AI Era.
                </h1>
                <p className="text-xl text-black/60 max-w-2xl mx-auto leading-relaxed">
                    Break down silos between humans and AI. AIORA Collaboration brings your team and your intelligent agents into a single, unified workflow.
                </p>
            </div>

            {/* Feature Grid */}
            <div className="px-8 py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-6">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-black/60 leading-relaxed text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="px-8 py-24 text-center">
                <h2 className="text-3xl md:text-5xl font-black mb-8">Ready to transform how you work?</h2>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <button className="px-8 py-4 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors">
                        Start Free Trial
                    </button>
                    <button className="px-8 py-4 bg-white border border-black/10 text-black rounded-full font-bold hover:bg-gray-50 transition-colors">
                        Schedule Demo
                    </button>
                </div>
            </div>
        </div>
    );
}
