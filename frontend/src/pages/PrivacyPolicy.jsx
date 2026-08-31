import React from 'react';
import SEO from '../components/SEO';

const PrivacyPolicy = () => {
    return (
    <div className="pt-4 pb-20 min-h-screen bg-[#fdfaf7] font-sans">
      <SEO 
        title="Privacy Policy"
        description="Read Zuvello's privacy policy to understand how we protect your data and handle your personal information."
      />
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-[#1c1c1c] tracking-tight mb-4">Privacy Policy</h1>
                    <p className="text-lg text-gray-500 font-medium">
                        How we protect you and your data.
                    </p>
                </div>
                
                <div className="bg-white rounded-[30px] p-8 md:p-12 shadow-xl shadow-[#cf7e28]/5 border border-[#f5eadb]">
                    <div className="space-y-8 text-[#483d36] leading-relaxed text-sm">
                        <section>
                            <h2 className="text-xl font-extrabold text-[#1c1c1c] mb-4">1. Information We Collect</h2>
                            <p>
                                When you visit Zuvello, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, when you make a purchase, we collect your name, billing address, shipping address, payment information, email address, and phone number.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-[#1c1c1c] mb-4">2. How We Use Your Information</h2>
                            <p>
                                We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).
                            </p>
                            <p className="mt-2">
                                We use the Device Information that we collect to help us screen for potential risk and fraud, and more generally to improve and optimize our Site.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-[#1c1c1c] mb-4">3. Data Security</h2>
                            <p>
                                We take your privacy seriously. We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
