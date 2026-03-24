
import { ArrowRight, Briefcase, MapPin } from 'lucide-react';

const positions = [
    {
        title: 'Senior Full Stack Engineer',
        department: 'Engineering',
        location: 'Bangalore, India',
        type: 'Full-time',
    },
    {
        title: 'AI Research Scientist',
        department: 'Research',
        location: 'Remote',
        type: 'Full-time',
    },
    {
        title: 'Product Designer',
        department: 'Design',
        location: 'Bangalore, India',
        type: 'Full-time',
    },
];

export default function CareersPage() {
    return (
        <div className="min-h-screen px-4 md:px-8 py-8 md:py-16 bg-white text-black">
            <div className="max-w-6xl mx-auto">
                <div className="mb-20">
                    <h1 className="text-5xl md:text-7xl font-black text-black mb-6 leading-tight">
                        Join the<br />Revolution.
                    </h1>
                    <p className="text-xl text-black/60 max-w-2xl leading-relaxed">
                        We are looking for passionate individuals who want to shape the future of business automation.
                        Join us in building the next generation of intelligent tools.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 mb-20">
                    <h2 className="text-3xl font-bold text-black mb-8">Open Positions</h2>
                    {positions.map((position, index) => (
                        <div key={index} className="group border border-black/10 rounded-2xl p-8 hover:border-black/30 transition-all cursor-pointer bg-gray-50 hover:bg-white hover:shadow-lg">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-black mb-2 group-hover:text-blue-600 transition-colors">{position.title}</h3>
                                    <div className="flex flex-wrap gap-4 text-sm text-black/50">
                                        <div className="flex items-center gap-1">
                                            <Briefcase className="w-4 h-4" />
                                            <span>{position.department}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            <span>{position.location}</span>
                                        </div>
                                        <div className="px-2 py-0.5 bg-black/5 rounded-full text-xs font-medium uppercase tracking-wider">
                                            {position.type}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 font-medium text-black group-hover:translate-x-1 transition-transform">
                                    Apply Now <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-black text-white rounded-3xl p-12 text-center">
                    <h2 className="text-3xl font-black mb-4">Don't see a fit?</h2>
                    <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-8">
                        We are always looking for exceptional talent. Send us your resume and tell us
                        how you can contribute to our mission.
                    </p>
                    <button className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-100 transition-colors">
                        Send Open Application
                    </button>
                </div>
            </div>
        </div>
    );
}
