import React from 'react';
import SEO from '../components/SEO';

const TermsConditions = () => {
    return (
        <div className="pt-4 pb-20 min-h-screen bg-[#fdfaf7] font-sans">
            <SEO
                title="Terms & Conditions"
                description="Read the terms and conditions for shopping at Zuvello. Information regarding our policies, products, and services."
            />
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-[#1c1c1c] tracking-tight mb-4">Terms & Conditions</h1>
                    <p className="text-lg text-gray-500 font-medium">
                        The rules of the playhouse.
                    </p>
                </div>

                <div className="bg-white rounded-[30px] p-8 md:p-12 shadow-xl shadow-[#cf7e28]/5 border border-[#f5eadb]">
                    <div className="space-y-8 text-[#483d36] leading-relaxed text-sm">
                        <section>
                            <h2 className="text-xl font-extrabold text-[#1c1c1c] mb-4">1. Introduction</h2>
                            <p>
                                Welcome to Zuvello. By accessing our website and purchasing our soft toys, you agree to be bound by these Terms and Conditions. Please read them carefully.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-[#1c1c1c] mb-4">2. Products and Pricing</h2>
                            <p>
                                All our soft toys are subject to availability. We reserve the right to discontinue any product at any time. Prices for our products are subject to change without notice. We shall not be liable to you or to any third-party for any modification, price change, suspension, or discontinuance of a product.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-[#1c1c1c] mb-4">3. Accuracy of Billing and Account Information</h2>
                            <p>
                                We reserve the right to refuse any order you place with us. You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-[#1c1c1c] mb-4">4. Intellectual Property</h2>
                            <p>
                                All content on this site, including but not limited to the brand name "Zuvello", logos, images, graphics, and text, is the property of Zuvello and is protected by copyright and intellectual property laws.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-[#1c1c1c] mb-4">5. Governing Law</h2>
                            <p>
                                These Terms of Service and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of India.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsConditions;