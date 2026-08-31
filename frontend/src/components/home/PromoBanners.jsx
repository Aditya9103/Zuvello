import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, RotateCcw, Wallet, ShieldCheck, HeadphonesIcon, ArrowRight } from 'lucide-react';

const PromoBanners = () => {
    const features = [
        {
            icon: <Truck size={24} className="text-[#c1865a]" />,
            title: "Free Shipping",
            desc: "On orders above ₹999"
        },
        {
            icon: <RotateCcw size={24} className="text-[#c1865a]" />,
            title: "7 Days Returns",
            desc: "Easy return & refund"
        },
        {
            icon: <Wallet size={24} className="text-[#c1865a]" />,
            title: "COD Available",
            desc: "Pay on delivery"
        },
        {
            icon: <ShieldCheck size={24} className="text-[#c1865a]" />,
            title: "Secure Payments",
            desc: "100% safe & secure"
        },
        {
            icon: <HeadphonesIcon size={24} className="text-[#c1865a]" />,
            title: "24/7 Support",
            desc: "We are here to help"
        }
    ];

    return (
        <section className="bg-white font-sans md:py-8">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">

                {/* Combo Deals Banner - Mobile Optimized Horizontal Card */}
                <div className="w-full bg-[#fdf5f2] md:bg-gradient-to-r md:from-[#fdf5f2] md:to-[#faebd8] rounded-[20px] md:rounded-[24px] p-4 sm:p-6 md:px-12 lg:px-16 md:py-8 lg:py-10 flex flex-row items-center justify-between mb-6 md:mb-12 shadow-sm md:shadow-md overflow-hidden relative border border-[#fae5dd] md:border-none">

                    {/* Background decorative elements for desktop */}
                    <div className="hidden md:block absolute top-0 right-0 w-1/2 h-full bg-[#f5e0cf] rounded-l-full opacity-50 blur-3xl z-0"></div>
                    <div className="hidden md:block absolute -bottom-10 -left-10 w-48 h-48 bg-[#f8d5cd] rounded-full opacity-40 blur-3xl z-0"></div>

                    {/* Left Content */}
                    <div className="flex-[0.6] md:flex-[0.5] z-10 text-left pr-1 md:pr-8 lg:pr-12 relative">
                        <p className="text-[#cf7e28] font-bold text-[10px] sm:text-[13px] md:text-sm lg:text-base flex items-center gap-1 md:gap-2 mb-0.5 md:mb-2 uppercase tracking-wider">
                            Special Bundles <span className="md:text-xl">🎁</span>
                        </p>
                        <h2 className="text-[14px] sm:text-[18px] md:text-3xl lg:text-4xl font-black text-[#1c1c1c] leading-[1.15] md:leading-[1.2] mb-1.5 md:mb-4 pr-2">
                            The Perfect Gift Combos
                        </h2>
                        <p className="text-[#483d36] text-[9px] sm:text-[11px] md:text-sm lg:text-base font-medium mb-2.5 md:mb-6 md:text-gray-600 leading-snug md:leading-relaxed md:max-w-lg">
                            Discover our most loved soft toy bundles. Perfect for birthdays, anniversaries, or simply bringing a big smile to someone you love today!
                        </p>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-1 md:gap-2 bg-[#f05c87] text-white px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-md md:rounded-full text-[9px] sm:text-xs md:text-sm font-bold hover:bg-[#d94a73] hover:scale-105 transition-all duration-300 shadow-sm md:shadow-[0_4px_15px_rgba(240,92,135,0.4)] w-fit"
                        >
                            Explore Combos <ArrowRight size={12} className="md:w-4 md:h-4" />
                        </Link>
                    </div>

                    {/* Right Content / Images */}
                    <div className="flex-[0.4] md:flex-[0.5] relative flex items-center justify-center md:justify-end z-10 w-full min-h-[120px] sm:min-h-[160px] md:min-h-[220px] lg:min-h-[280px]">
                        <img
                            src="/combo_plushies.png"
                            alt="Combo Toys"
                            className="w-[120%] md:w-auto md:h-[130%] lg:h-[140%] md:max-w-none object-contain mix-blend-multiply scale-110 sm:scale-100 origin-right md:origin-center md:absolute md:-right-4 lg:-right-10 md:drop-shadow-2xl transition-transform duration-700 hover:scale-105"
                        />
                        {/* Save 50% Badge */}
                        <div className="absolute -top-2 right-0 md:top-2 md:left-0 lg:top-4 lg:left-12 bg-[#f05c87] md:bg-white text-white md:text-[#f05c87] w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center shadow-lg md:shadow-xl shadow-pink-200/50 md:shadow-pink-500/10 md:-rotate-12 hover:rotate-0 transition-all duration-300 z-20 md:border-[3px] border-transparent md:border-pink-50 cursor-default">
                            <span className="text-[5px] sm:text-[7px] md:text-[9px] font-bold uppercase tracking-wider leading-none mt-1 md:mt-1.5 md:text-gray-500">Up To</span>
                            <span className="text-[14px] sm:text-[20px] md:text-[32px] font-black leading-none my-[1px] md:my-0.5">50%</span>
                            <span className="text-[5px] sm:text-[7px] md:text-[9px] font-bold uppercase tracking-wider leading-none md:text-gray-500">Off</span>
                        </div>
                    </div>
                </div>

                {/* Features Row */}
                <div className="w-full bg-white rounded-2xl md:rounded-[28px] border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] md:shadow-[0_10px_40px_rgba(0,0,0,0.06)] py-6 md:py-10 px-4 md:px-12 flex flex-wrap md:flex-nowrap items-center justify-center md:justify-between gap-6 md:gap-4 mb-4">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-4 md:gap-5 min-w-[200px] lg:min-w-0 group cursor-default">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-[#fff6f0] md:group-hover:bg-[#cf7e28] md:group-hover:text-white transition-colors duration-300 flex items-center justify-center shrink-0">
                                {React.cloneElement(feature.icon, { className: "text-[#c1865a] md:group-hover:text-white transition-colors duration-300 md:w-7 md:h-7" })}
                            </div>
                            <div className="flex flex-col">
                                <h4 className="text-sm md:text-lg font-bold text-[#483d36] mb-0.5 md:mb-1 whitespace-nowrap">
                                    {feature.title}
                                </h4>
                                <p className="text-[11px] md:text-sm text-gray-500 whitespace-nowrap">
                                    {feature.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default PromoBanners;