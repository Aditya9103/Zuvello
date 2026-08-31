import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Truck, RefreshCcw, FileText, Phone, MessageSquare } from 'lucide-react';
import SEO from '../components/SEO';

const HelpCenter = () => {
    const topics = [
        { icon: <HelpCircle size={32} />, title: "FAQs", desc: "Find answers to common questions.", link: "/faqs" },
        { icon: <Truck size={32} />, title: "Shipping Policy", desc: "Learn about delivery times.", link: "/shipping-policy" },
        { icon: <RefreshCcw size={32} />, title: "Returns & Refunds", desc: "Our 15-day return process.", link: "/return-policy" },
        { icon: <FileText size={32} />, title: "Terms & Conditions", desc: "Read our business rules.", link: "/terms" },
        { icon: <MessageSquare size={32} />, title: "Contact Us", desc: "Get in touch with our team.", link: "/contact" },
        { icon: <Phone size={32} />, title: "Track Order", desc: "See where your order is.", link: "/my-orders" }
    ];

    return (
        <div className="pt-4 pb-20 min-h-screen bg-[#fdfaf7] font-sans">
            <SEO title="Help Center" />
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-[#1c1c1c] tracking-tight mb-4">Zuvello Help Center</h1>
                    <p className="text-lg text-gray-500 font-medium">
                        How can we help you today?
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topics.map((topic, idx) => (
                        <Link
                            key={idx}
                            to={topic.link}
                            className="bg-white p-8 rounded-2xl border border-[#f5eadb] shadow-sm hover:shadow-xl hover:shadow-[#cf7e28]/10 hover:-translate-y-1 transition-all group"
                        >
                            <div className="text-[#ef4c7f] mb-6 group-hover:scale-110 transition-transform">
                                {topic.icon}
                            </div>
                            <h3 className="text-xl font-bold text-[#1c1c1c] mb-2">{topic.title}</h3>
                            <p className="text-gray-500 font-medium">{topic.desc}</p>
                        </Link>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-[#483d36] font-medium mb-4">Still need help?</p>
                    <Link to="/contact" className="inline-block bg-[#cf7e28] hover:bg-[#b56e22] text-white font-bold px-8 py-3 rounded-xl transition-colors">
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;