import React from 'react';
import SEO from '../components/SEO';

const ReturnPolicy = () => {
    return (
        <div className="pt-4 pb-20 min-h-screen bg-[#fdfaf7] font-sans">
            <SEO
                title="Return Policy"
                description="Learn about Zuvello's 15-Day Happiness Guarantee. Read our return and refund policy for soft toys."
            />
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-[#1c1c1c] tracking-tight mb-4">Returns & Refunds</h1>
                    <p className="text-lg text-gray-500 font-medium">
                        Not the perfect match? Let's make it right.
                    </p>
                </div>

                <div className="bg-white rounded-[30px] p-8 md:p-12 shadow-xl shadow-[#cf7e28]/5 border border-[#f5eadb]">
                    <div className="space-y-8 text-[#483d36] leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-extrabold text-[#1c1c1c] mb-4">Our 15-Day Happiness Guarantee</h2>
                            <p>
                                We want you to love your Zuvello soft toy as much as we loved making it. If you or your little one are not completely satisfied with your purchase, you can return it within 15 days of receiving your order for a full refund or exchange.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-extrabold text-[#1c1c1c] mb-4">Return Conditions</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>The item must be in its original, unused, and unwashed condition.</li>
                                <li>All original tags and packaging must be intact.</li>
                                <li>Customized or personalized soft toys are not eligible for returns unless there is a manufacturing defect.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-extrabold text-[#1c1c1c] mb-4">How to Initiate a Return</h2>
                            <ol className="list-decimal pl-5 space-y-2">
                                <li>Email us at <strong>zuvello@gmail.com</strong> with your Order ID and reason for return.</li>
                                <li>Our team will respond within 24 hours with a return authorization and a prepaid shipping label (for defective items) or shipping instructions (for general returns).</li>
                                <li>Pack the toy securely and hand it over to the courier partner.</li>
                            </ol>
                        </section>

                        <section>
                            <h2 className="text-2xl font-extrabold text-[#1c1c1c] mb-4">Refunds</h2>
                            <p>
                                Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. If approved, your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment within 5-7 business days.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReturnPolicy;