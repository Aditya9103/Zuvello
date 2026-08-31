import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Facebook, Instagram, Twitter, MapPin, Phone, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../api';

const Footer = () => {
    const [categories, setCategories] = useState([]);
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/categories`);
                setCategories(data.slice(0, 5));
            } catch (error) {
                console.error("Error fetching categories for footer:", error);
            }
        };
        fetchCategories();
    }, []);

    const quickLinks = [
        { name: 'About Us', path: '/about' },
        { name: 'Contact Us', path: '/contact' },
        { name: 'Blog', path: '/blog' },
        { name: 'FAQs', path: '/faqs' },
        { name: 'Track Order', path: '/my-orders' },
        { name: 'Returns & Refunds', path: '/return-policy' },
    ];

    const customerService = [
        { name: 'Shipping Policy', path: '/shipping-policy' },
        { name: 'Return Policy', path: '/return-policy' },
        { name: 'Terms & Conditions', path: '/terms' },
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Help Center', path: '/help' },
    ];

    return (
        <footer className="w-full font-sans mt-auto bg-[#fbf5f2]">
            <div className="max-w-[1300px] mx-auto px-4 md:px-8">

                {/* NEWSLETTER SECTION */}
                <div className="py-2 md:py-5 border-b border-gray-200">
                    <div className="bg-white border border-[#cf7e28]/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center gap-5 w-full md:w-1/2">
                            <div className="w-14 h-14 rounded-full border border-[#cf7e28]/30 flex items-center justify-center shrink-0 bg-[#cf7e28]/5">
                                <Mail className="text-[#cf7e28]" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-black text-black mb-1">Join the Zuvello Family! ✨</h3>
                                <p className="font-semibold text-gray-900 text-[15px]">
                                    Get exclusive offers, new arrival alerts & more.
                                </p>
                            </div>
                        </div>

                        <div className="w-full md:w-1/2 relative">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (email) {
                                        setSubscribed(true);
                                        setEmail('');
                                        setTimeout(() => setSubscribed(false), 3000);
                                    }
                                }}
                                className="flex"
                            >
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-l-lg py-4 pl-5 outline-none focus:border-[#cf7e28] transition-colors text-[14px]"
                                />
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-[#d98c3a] to-[#c4711f] hover:from-[#c4711f] hover:to-[#a65d16] text-white font-bold px-8 rounded-r-lg transition-colors whitespace-nowrap"
                                >
                                    Subscribe
                                </button>
                            </form>
                            {subscribed && (
                                <p className="absolute -bottom-6 left-2 text-[#cf7e28] text-[12px] font-bold animate-fade-in">
                                    🎉 Welcome to the family!
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* MAIN FOOTER */}
                <div className="pt-16 pb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

                        {/* 1. Brand Identity */}
                        <div className="flex flex-col items-center text-center gap-6 lg:col-span-1 pr-0 md:pr-4">
                            <Link to="/" className="inline-block">
                                <img src="/logo.png" alt="Zuvello Logo" className="h-[90px] md:h-[120px] object-contain rounded-lg brightness-90 contrast-125" loading="lazy" decoding="async" />
                            </Link>
                            <p className="font-semibold text-gray-900 text-[15px] leading-relaxed">
                                Premium soft toys for kids and loved ones. Because every hug matters!
                            </p>
                            <div className="flex items-center justify-center gap-3 w-full">
                                <a href="https://instagram.com/zuvello.in" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[#cf7e28]/30 flex items-center justify-center text-[#cf7e28] hover:bg-[#cf7e28] hover:text-white transition-all">
                                    <Instagram size={18} />
                                </a>
                                <a href="https://facebook.com/zuvello.in" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[#cf7e28]/30 flex items-center justify-center text-[#cf7e28] hover:bg-[#cf7e28] hover:text-white transition-all">
                                    <Facebook size={18} />
                                </a>
                                <a href="https://twitter.com/zuvello_in" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[#cf7e28]/30 flex items-center justify-center text-[#cf7e28] hover:bg-[#cf7e28] hover:text-white transition-all">
                                    <Twitter size={18} />
                                </a>
                            </div>
                        </div>

                        {/* 2. Quick Links */}
                        <div className="flex flex-col">
                            <div className="mb-6">
                                <h4 className="text-[15px] font-black text-black tracking-widest uppercase">Quick Links</h4>
                                <div className="h-[2px] w-8 bg-[#cf7e28] mt-2"></div>
                            </div>
                            <ul className="flex flex-col gap-4">
                                {quickLinks.map(link => (
                                    <li key={link.name} className="group">
                                        <Link to={link.path} className="text-[15px] font-bold text-gray-900 group-hover:text-[#cf7e28] transition-colors flex items-center justify-between w-full md:pr-8">
                                            {link.name}
                                            <ChevronRight size={14} className="text-[#cf7e28] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* 3. Customer Service */}
                        <div className="flex flex-col">
                            <div className="mb-6">
                                <h4 className="text-[15px] font-black text-black tracking-widest uppercase">Customer Service</h4>
                                <div className="h-[2px] w-8 bg-[#cf7e28] mt-2"></div>
                            </div>
                            <ul className="flex flex-col gap-4">
                                {customerService.map(link => (
                                    <li key={link.name} className="group">
                                        <Link to={link.path} className="text-[15px] font-bold text-gray-900 group-hover:text-[#cf7e28] transition-colors flex items-center justify-between w-full md:pr-8">
                                            {link.name}
                                            <ChevronRight size={14} className="text-[#cf7e28] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* 4. Categories */}
                        <div className="flex flex-col">
                            <div className="mb-6">
                                <h4 className="text-[15px] font-black text-black tracking-widest uppercase">Categories</h4>
                                <div className="h-[2px] w-8 bg-[#cf7e28] mt-2"></div>
                            </div>
                            <ul className="flex flex-col gap-4">
                                {categories.map(cat => (
                                    <li key={cat._id} className="group">
                                        <Link to={`/shop?category=${cat.name}`} className="text-[15px] font-bold text-gray-900 group-hover:text-[#cf7e28] transition-colors flex items-center justify-between w-full md:pr-8">
                                            {cat.name}
                                            <ChevronRight size={14} className="text-[#cf7e28] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    </li>
                                ))}
                                <li className="group">
                                    <Link to="/shop" className="text-[15px] font-bold text-gray-900 group-hover:text-[#cf7e28] transition-colors flex items-center justify-between w-full md:pr-8">
                                        All Products
                                        <ChevronRight size={14} className="text-[#cf7e28] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* 5. Contact Info */}
                        <div className="flex flex-col">
                            <div className="mb-6">
                                <h4 className="text-[15px] font-black text-black tracking-widest uppercase">Contact Us</h4>
                                <div className="h-[2px] w-8 bg-[#cf7e28] mt-2"></div>
                            </div>
                            <ul className="flex flex-col gap-6">
                                <li className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full border border-[#cf7e28]/30 flex items-center justify-center text-[#cf7e28] shrink-0 bg-[#cf7e28]/5">
                                        <Phone size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-black text-[14px] font-black">Phone</span>
                                        <span className="text-gray-900 font-bold text-[14px]">+91 8873405595</span>
                                    </div>
                                </li>
                                <li className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full border border-[#cf7e28]/30 flex items-center justify-center text-[#cf7e28] shrink-0 bg-[#cf7e28]/5">
                                        <Mail size={16} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-black text-[14px] font-black">Email</span>
                                        <span className="text-gray-900 font-bold text-[14px] break-words">info@zuvello.com</span>
                                    </div>
                                </li>
                                <li className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full border border-[#cf7e28]/30 flex items-center justify-center text-[#cf7e28] shrink-0 bg-[#cf7e28]/5">
                                        <MapPin size={16} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-black text-[14px] font-black">Address</span>
                                        <span className="text-gray-900 font-bold text-[14px] leading-snug break-words">
                                            C-31, Nawada Housing Complex, New Delhi-110059
                                        </span>
                                    </div>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>

                {/* BOTTOM: Copyright & Payments */}
                <div className="border-t border-gray-200 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="Icon" className="w-8 h-8 rounded-full object-cover" loading="lazy" decoding="async" />
                        <p className="text-[14px] text-gray-900 font-bold">
                            © {new Date().getFullYear()} Zuvello. All Rights Reserved.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-[14px] text-gray-900 font-bold">We Accept</span>
                        <div className="flex items-center gap-2">
                            <div className="h-7 w-11 bg-white rounded flex items-center justify-center font-black text-blue-900 text-[10px]">VISA</div>
                            <div className="h-7 w-11 bg-white rounded flex items-center justify-center">
                                <div className="flex">
                                    <div className="w-3.5 h-3.5 rounded-full bg-red-500"></div>
                                    <div className="w-3.5 h-3.5 rounded-full bg-yellow-500 -ml-1.5 mix-blend-multiply"></div>
                                </div>
                            </div>
                            <div className="h-7 w-11 bg-white rounded flex items-center justify-center font-black text-gray-800 text-[11px] italic pr-1">UPI</div>
                            <div className="h-7 w-11 bg-white rounded flex items-center justify-center font-black text-sky-500 text-[10px]">Paytm</div>
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;