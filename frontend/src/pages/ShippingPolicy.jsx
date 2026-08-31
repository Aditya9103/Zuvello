import React from 'react';
import SEO from '../components/SEO';

const ShippingPolicy = () => {
    return (
        <div className="pt-4 pb-20 min-h-screen bg-[#fdfaf7] font-sans">
            <SEO
                title="Shipping Policy"
                description="Details on Zuvello's shipping rates, processing times, and delivery estimates across India."
            />
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-[#1c1c1c] tracking-tight mb-4">Shipping Policy</h1>
                    <p className="text-lg text-gray-500 font-medium">
                        How and when your new best friend will arrive.
                    </p>
                </div>

                <div className="bg-white rounded-[30px] p-8 md:p-12 shadow-xl shadow-[#cf7e28]/5 border border-[#f5eadb]">
                    <div className="space-y-8 text-[#483d36] leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-extrabold text-[#1c1c1c] mb-4">Processing Time</h2>
                            <p>
                                All orders are processed within 1-2 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped containing your tracking number.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-extrabold text-[#1c1c1c] mb-4">Shipping Rates & Delivery Estimates</h2>
                            <p className="mb-4">
                                Shipping charges for your order will be calculated and displayed at checkout.
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-[#f5eadb]">
                                            <th className="py-3 pr-4 font-bold text-[#1c1c1c]">Shipping Method</th>
                                            <th className="py-3 px-4 font-bold text-[#1c1c1c]">Estimated Delivery Time</th>
                                            <th className="py-3 pl-4 font-bold text-[#1c1c1c]">Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        <tr>
                                            <td className="py-3 pr-4">Standard Delivery</td>
                                            <td className="py-3 px-4">4-6 Business Days</td>
                                            <td className="py-3 pl-4">₹49 (Free over ₹999)</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 pr-4">Express Delivery</td>
                                            <td className="py-3 px-4">2-3 Business Days</td>
                                            <td className="py-3 pl-4">₹149</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-extrabold text-[#1c1c1c] mb-4">In-Store Pickup</h2>
                            <p>
                                You can skip the shipping fees with free local pickup at our main warehouse in Nawada Housing Complex, New Delhi. After placing your order and selecting local pickup at checkout, your order will be prepared and ready for pick up within 1 business day. We will send you an email when your order is ready along with instructions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-extrabold text-[#1c1c1c] mb-4">How do I check the status of my order?</h2>
                            <p>
                                When your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 48 hours for the tracking information to become available. You can also view real-time tracking updates directly in the "My Orders" section of your account.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingPolicy;