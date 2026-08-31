import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Home, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

const SuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('id');

    return (
    <div className="min-h-[calc(100vh-80px)] bg-[#fdfaf7] flex flex-col items-center justify-start pt-16 pb-16 px-4 text-center font-sans">
      <SEO title="Success" noindex={true} />
            {/* Animated Celebration Icon */}
            <div className="relative mb-10">
                <div className="absolute inset-0 bg-[#cf7e28]/20 blur-2xl rounded-full animate-pulse"></div>
                <div className="relative bg-white border border-[#f5eadb] p-6 rounded-full shadow-xl shadow-[#cf7e28]/10">
                    <CheckCircle className="w-20 h-20 text-[#cf7e28]" />
                </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1c1c1c] mb-3 tracking-tight">
                Order <span className="text-[#cf7e28]">Successful!</span>
            </h1>
            <p className="text-gray-600 font-medium text-lg mb-1">
                Thank you for choosing Zuvello.
            </p>
            <p className="text-sm font-bold text-gray-400 mb-10">
                Order ID: #{orderId?.substring(orderId.length - 8).toUpperCase()}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 w-full max-w-md">
                <button
                    onClick={() => navigate('/my-orders')}
                    className="flex-1 bg-white hover:bg-gray-50 border border-[#f5eadb] text-black font-extrabold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm"
                >
                    <Package className="w-5 h-5 text-[#cf7e28]" />
                    Track Order
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="flex-1 bg-[#cf7e28] hover:bg-[#b56e22] text-white font-extrabold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-md shadow-[#cf7e28]/20"
                >
                    <Home className="w-5 h-5" />
                    Back Home
                </button>
            </div>

            <div className="mt-12 p-6 bg-white border border-[#f5eadb] rounded-2xl max-w-lg shadow-sm">
                <p className="text-gray-600 font-medium text-[14px] leading-relaxed">
                    A confirmation message has been sent to your registered WhatsApp number. Our team will notify you once your premium order is shipped!
                </p>
            </div>
        </div>
    );
};

export default SuccessPage;
