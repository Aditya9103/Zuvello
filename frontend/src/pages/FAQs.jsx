import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SEO from '../components/SEO';

const FAQs = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: "Are your soft toys safe for babies?",
            answer: "Yes! All Zuvello soft toys are thoroughly tested to meet and exceed global safety standards. We use non-toxic, hypoallergenic materials, and our toys are free from small detachable parts that could pose a choking hazard."
        },
        {
            question: "How do I wash my Zuvello plushie?",
            answer: "Most of our toys are machine washable on a gentle, cold cycle. We recommend placing them in a pillowcase or laundry bag for extra protection. Let them air dry completely. For extra fluffy toys, a quick brush after drying will restore their softness."
        },
        {
            question: "Do you offer international shipping?",
            answer: "Currently, we ship across all major cities and towns in India. We are working hard to bring Zuvello hugs to the rest of the world very soon!"
        },
        {
            question: "Can I include a gift message?",
            answer: "Absolutely! During checkout, you will have the option to add a personalized gift message, which we will print on a beautiful card and include with your package."
        },
        {
            question: "What if I receive a damaged product?",
            answer: "We take extreme care in packaging, but if your new friend arrives hurt, please contact us within 48 hours of delivery at zuvello@gmail.com with photos, and we will arrange a free replacement immediately."
        }
    ];

    return (
        <div className="pt-4 pb-20 min-h-screen bg-[#fdfaf7] font-sans">
            <SEO
                title="FAQs"
                description="Find answers to common questions about Zuvello's premium plushies, shipping, safety, and more."
                schema={{
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": faqs.map(faq => ({
                        "@type": "Question",
                        "name": faq.question,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": faq.answer
                        }
                    }))
                }}
            />
            <div className="max-w-3xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-[#1c1c1c] tracking-tight mb-4">Frequently Asked Questions</h1>
                    <p className="text-lg text-gray-500 font-medium">
                        Got a question? We've got answers!
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className="bg-white border border-[#f5eadb] rounded-2xl overflow-hidden shadow-sm transition-all"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full px-6 py-5 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-left"
                            >
                                <span className="font-bold text-[#1c1c1c]">{faq.question}</span>
                                {openIndex === idx ? (
                                    <ChevronUp className="w-5 h-5 text-[#cf7e28] shrink-0" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                                )}
                            </button>
                            {openIndex === idx && (
                                <div className="px-6 pb-5 text-[#483d36] leading-relaxed border-t border-gray-50 bg-gray-50/50 pt-4">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FAQs;