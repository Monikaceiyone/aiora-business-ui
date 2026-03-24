
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const posts = [
    {
        title: 'The Future of Business Automation with AI',
        excerpt: 'How AI agents are transforming traditional business workflows and increasing efficiency by 300%.',
        date: 'Jan 15, 2024',
        category: 'Industry Trends',
        readTime: '5 min read',
    },
    {
        title: 'Introducing AIORA Core Suite',
        excerpt: 'A deep dive into our latest suite of tools designed to streamline your business operations.',
        date: 'Jan 10, 2024',
        category: 'Product Updates',
        readTime: '3 min read',
    },
    {
        title: 'Ethical AI: Our Commitment',
        excerpt: 'Why we prioritize transparency and user control in all our AI models and deployments.',
        date: 'Dec 28, 2023',
        category: 'Company',
        readTime: '7 min read',
    },
];

export default function BlogPage() {
    return (
        <div className="min-h-[calc(100vh-96px)] px-8 py-16 bg-white text-black">
            <div className="max-w-6xl mx-auto">
                <div className="mb-20">
                    <h1 className="text-5xl md:text-7xl font-black text-black mb-6 leading-tight">
                        Insights &<br />Updates.
                    </h1>
                    <p className="text-xl text-black/60 max-w-2xl leading-relaxed">
                        Latest thoughts, industry trends, and product updates from the AIORA team.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post, index) => (
                        <article key={index} className="group flex flex-col h-full bg-gray-50 border border-black/10 rounded-2xl p-6 hover:shadow-xl hover:border-black/30 transition-all cursor-pointer">
                            <div className="mb-4 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-black/40">
                                <span>{post.category}</span>
                                <span>{post.date}</span>
                            </div>
                            <h2 className="text-2xl font-bold text-black mb-3 group-hover:text-blue-600 transition-colors flex-1">
                                {post.title}
                            </h2>
                            <p className="text-black/60 mb-6 leading-relaxed">
                                {post.excerpt}
                            </p>
                            <div className="flex items-center justify-between mt-auto pt-6 border-t border-black/5">
                                <span className="text-sm text-black/40">{post.readTime}</span>
                                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
}
