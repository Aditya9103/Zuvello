import React, { useState } from 'react';
import axios from 'axios';
import { Tag, Copy, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../api';
import SEO from '../components/SEO';

const OffersPage = () => {
    const [copiedCode, setCopiedCode] = useState(null);

    const { data: offers = [], isLoading } = useQuery({
        queryKey: ['offers'],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE_URL}/coupons`);
            return Array.isArray(data) ? data.filter(c => c.visibleToAll) : [];
        },
        staleTime: 5 * 60 * 1000,
    });

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const collectionSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Zuvello Offers & Coupons",
        "description": "Discover our latest promotions and discount codes to save on your favorite premium plushies.",
        "url": "https://www.zuvello.in/offers"
    };

    return (
        <div className="pt-8 pb-20 min-h-screen bg-[#fdfaf7] font-sans">
            <SEO
                title="Exclusive Offers & Coupons"
                description="Discover our latest promotions and discount codes to save on your favorite premium plushies."
                schema={[collectionSchema]}
            />
            <div className="container-custom px-4 max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-[#2a2a2a] mb-4 font-serif">
                        Exclusive <span className="text-[#b58145]">Offers</span>
                    </h1>
                    <p className="text-[#786b62] max-w-2xl mx-auto">
                        Discover our latest promotions and discount codes to save on your favorite premium soft toys
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-pulse flex flex-col h-[250px]">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-24 h-12 bg-gray-200 rounded-xl"></div>
                                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                </div>
                                <div className="w-3/4 h-6 bg-gray-200 rounded mb-4"></div>
                                <div className="mt-auto border-t border-dashed border-gray-200 pt-6 flex items-center justify-between">
                                    <div className="w-32 h-10 bg-gray-200 rounded-xl"></div>
                                    <div className="w-32 h-10 bg-gray-300 rounded-xl"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : offers.length === 0 ? (
                    <div className="text-center bg-white p-12 rounded-3xl shadow-sm border border-[#e8dfd8]">
                        <Tag className="w-16 h-16 text-[#e8dfd8] mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-[#2a2a2a] mb-2">No active offers right now</h3>
                        <p className="text-[#786b62]">Check back later for exciting discounts and promotions!</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {offers.map((offer) => (
                            <div key={offer._id} className="bg-white rounded-3xl overflow-hidden border border-[#e8dfd8] shadow-sm hover:shadow-md transition-shadow relative group">
                                <div className="absolute top-0 left-0 w-2 h-full bg-[#b58145]"></div>
                                <div className="p-8 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="bg-[#fcf9f5] text-[#b58145] px-4 py-2 rounded-xl font-black text-2xl border border-[#e8dfd8]">
                                            {offer.discountPercentage}% OFF
                                        </div>
                                        <Tag className="w-8 h-8 text-[#e8dfd8]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-[#2a2a2a] mb-4 flex-1">
                                        {offer.description}
                                    </h3>

                                    <div className="mt-auto border-t border-dashed border-[#e8dfd8] pt-6 flex items-center justify-between">
                                        <div className="bg-[#fdfaf7] border border-[#e8dfd8] px-4 py-2.5 rounded-xl font-mono font-bold text-[#2a2a2a] tracking-wider uppercase text-lg">
                                            {offer.code}
                                        </div>
                                        <button
                                            onClick={() => handleCopy(offer.code)}
                                            className="flex items-center gap-2 bg-[#1c1c1c] hover:bg-[#b58145] text-white px-5 py-2.5 rounded-xl font-bold transition-colors"
                                        >
                                            {copiedCode === offer.code ? (
                                                <><CheckCircle2 className="w-4 h-4" /> Copied</>
                                            ) : (
                                                <><Copy className="w-4 h-4" /> Copy Code</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                {/* Ticket cutouts */}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-6 rounded-r-full bg-[#fdfaf7] border-r border-[#e8dfd8]"></div>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-6 rounded-l-full bg-[#fdfaf7] border-l border-[#e8dfd8]"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OffersPage;
