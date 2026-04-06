import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
    Phone,
    Mail,
    MapPin,
    MessageCircle,
    ExternalLink,
    Building2,
    Sparkles
} from 'lucide-react';

function getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Missing Supabase environment variables');
    return createClient(url, key);
}

interface WebsiteConfig {
    subdomain: string;
    business_name: string;
    logo_url: string;
    tagline: string;
    description: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    whatsapp: string;
    primary_color: string;
    seller_id: string;
}

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    image_link: string;
    category_id: string;
}

// Convert Google Drive links to direct image URLs
function getDirectImageUrl(url: string | null): string | null {
    if (!url) return null;

    // Handle Google Drive links
    if (url.includes('drive.google.com')) {
        try {
            let fileId = '';
            // Pattern: /file/d/{fileId}/
            const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
            // Pattern: ?id={fileId}
            const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);

            if (match1 && match1[1]) fileId = match1[1];
            else if (match2 && match2[1]) fileId = match2[1];

            if (fileId) {
                // Use lh3.googleusercontent.com format which is more reliable
                return `https://lh3.googleusercontent.com/d/${fileId}`;
            }
        } catch (e) {
            console.warn('Failed to parse Drive URL:', url);
        }
    }

    return url;
}

async function getWebsiteConfig(slug: string): Promise<WebsiteConfig | null> {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('seller_websites')
            .select('*')
            .eq('subdomain', slug)
            .single();

        if (error) {
            console.error('[Store] Error fetching config:', error);
            // PGRST116 means no rows found, which is not a crash, just 404
            if (error.code !== 'PGRST116') return null;
        }

        return data;
    } catch (e) {
        console.error('[Store] Unexpected error in getWebsiteConfig:', e);
        return null;
    }
}

async function getProducts(sellerId: string): Promise<Product[]> {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('catalog')
            .select('id, title, description, price, currency, image_link, category_id')
            .eq('seller_id', sellerId)
            .limit(12);

        if (error) {
            console.error('[Store] Error fetching products:', error);
            return [];
        }

        return data || [];
    } catch (e) {
        console.error('[Store] Unexpected error in getProducts:', e);
        return [];
    }
}

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
    try {
        const resolvedParams = await params;
        if (!resolvedParams || !resolvedParams.slug) {
            console.error('[Store] Missing params or slug');
            notFound();
        }
        const { slug } = resolvedParams;

        console.log('[Store] Loading store for slug:', slug);
        const config = await getWebsiteConfig(slug);

        if (!config) {
            console.log('[Store] Store config not found for slug:', slug);
            notFound();
        }

        const products = await getProducts(config.seller_id);
        const primaryColor = config.primary_color || '#2563eb';

        return (
            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <header
                    className="relative py-10 sm:py-16 px-4 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundColor: primaryColor,
                        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('/images/defaults/storefront-banner.png')`
                    }}
                >
                    <div className="max-w-4xl mx-auto text-center text-white relative z-10">
                        {config.logo_url ? (
                            <img
                                src={config.logo_url}
                                alt={config.business_name}
                                className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-white p-2 object-contain shadow-lg"
                            />
                        ) : (
                            <img
                                src="/images/defaults/business-logo-placeholder.png"
                                alt="Logo"
                                className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-white p-2 object-contain shadow-lg"
                            />
                        )}
                        <h1 className="text-3xl md:text-4xl font-bold mb-3">
                            {config.business_name}
                        </h1>
                        {config.tagline && (
                            <p className="text-lg opacity-90 mb-6">{config.tagline}</p>
                        )}
                        {config.whatsapp && (
                            <a
                                href={`https://wa.me/${config.whatsapp.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-medium hover:shadow-lg transition-shadow"
                            >
                                <MessageCircle className="w-5 h-5 text-green-600" />
                                Chat on WhatsApp
                            </a>
                        )}
                    </div>
                </header>

                {/* About Section */}
                {config.description && (
                    <section className="py-12 px-4">
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                                About Us
                            </h2>
                            <p className="text-gray-600 text-center leading-relaxed">
                                {config.description}
                            </p>
                        </div>
                    </section>
                )}

                {/* Products Section */}
                {products.length > 0 && (
                    <section className="py-12 px-4 bg-white">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Our Collection
                                </h2>
                                <p className="text-gray-500">
                                    Explore our latest products
                                </p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                                    >
                                        {getDirectImageUrl(product.image_link) ? (
                                            <img
                                                src={getDirectImageUrl(product.image_link) || ''}
                                                alt={product.title}
                                                className="w-full h-40 object-cover"
                                            />
                                        ) : (
                                            <img
                                                src="/images/defaults/product-placeholder.png"
                                                alt="Product Placeholder"
                                                className="w-full h-40 object-cover"
                                            />
                                        )}
                                        <div className="p-3">
                                            <h3 className="font-medium text-gray-900 text-sm truncate">
                                                {product.title}
                                            </h3>
                                            {product.category_id && (
                                                <p className="text-xs text-gray-500 mb-1">
                                                    {product.category_id}
                                                </p>
                                            )}
                                            <p
                                                className="font-bold"
                                                style={{ color: primaryColor }}
                                            >
                                                ₹{product.price?.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Contact Section */}
                <section className="py-12 px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                            Contact Us
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {config.phone && (
                                <a
                                    href={`tel:${config.phone}`}
                                    className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: `${primaryColor}20` }}
                                    >
                                        <Phone className="w-5 h-5" style={{ color: primaryColor }} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium text-gray-900">{config.phone}</p>
                                    </div>
                                </a>
                            )}
                            {config.whatsapp && (
                                <a
                                    href={`https://wa.me/${config.whatsapp.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                        <MessageCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">WhatsApp</p>
                                        <p className="font-medium text-gray-900">{config.whatsapp}</p>
                                    </div>
                                </a>
                            )}
                            {config.email && (
                                <a
                                    href={`mailto:${config.email}`}
                                    className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: `${primaryColor}20` }}
                                    >
                                        <Mail className="w-5 h-5" style={{ color: primaryColor }} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">{config.email}</p>
                                    </div>
                                </a>
                            )}
                            {(config.address || config.city) && (
                                <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: `${primaryColor}20` }}
                                    >
                                        <MapPin className="w-5 h-5" style={{ color: primaryColor }} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="font-medium text-gray-900">
                                            {config.address}{config.city && `, ${config.city}`}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer
                    className="py-8 px-4 text-center text-white"
                    style={{ backgroundColor: primaryColor }}
                >
                    <p className="text-sm opacity-80">
                        © {new Date().getFullYear()} {config.business_name}. All rights reserved.
                    </p>
                </footer>
            </div>
        );
    } catch (e) {
        console.error('[Store] Fatal error in StorePage:', e);
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
                    <p className="text-gray-600">We couldn't load this store. Please try again later.</p>
                </div>
            </div>
        );
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    try {
        const resolvedParams = await params;
        if (!resolvedParams || !resolvedParams.slug) return { title: 'Store Not Found' };

        const { slug } = resolvedParams;
        const config = await getWebsiteConfig(slug);

        if (!config) {
            return { title: 'Store Not Found' };
        }

        return {
            title: `${config.business_name}${config.tagline ? ` - ${config.tagline}` : ''}`,
            description: config.description || `Welcome to ${config.business_name}`,
            openGraph: {
                title: config.business_name,
                description: config.description || config.tagline,
                images: config.logo_url ? [config.logo_url] : [],
            },
        };
    } catch (e) {
        console.error('[Store] Error generating metadata:', e);
        return { title: 'Error Loading Store' };
    }
}
