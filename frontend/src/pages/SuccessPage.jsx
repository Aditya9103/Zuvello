import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Package, Home, FileText, Download, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../api';
import SEO from '../components/SEO';
import InvoiceModal from '../components/InvoiceModal';

const SuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('id');

    const [order, setOrder] = useState(null);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    useEffect(() => {
        if (!orderId) return;

        const fetchOrder = async () => {
            try {
                const token = localStorage.getItem('userToken');
                if (!token) return;

                const { data } = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrder(data);
            } catch (err) {
                console.error('Failed to fetch order on success page:', err);
            }
        };

        fetchOrder();
    }, [orderId]);

    const handleDownloadPDF = () => {
        setIsInvoiceOpen(true);
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#fdfaf7] flex flex-col items-center justify-start pt-16 pb-16 px-4 text-center font-sans">
            <SEO title="Order Success" noindex={true} />
            
            {/* Animated Celebration Icon */}
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-[#cf7e28]/20 blur-2xl rounded-full animate-pulse"></div>
                <div className="relative bg-white border border-[#f5eadb] p-6 rounded-full shadow-xl shadow-[#cf7e28]/10">
                    <CheckCircle className="w-20 h-20 text-[#cf7e28]" />
                </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1c1c1c] mb-3 tracking-tight">
                Order <span className="text-[#cf7e28]">Successful!</span>
            </h1>
            <p className="text-gray-600 font-medium text-lg mb-1">
                Thank you for choosing Zuvello. Your plushies are getting ready!
            </p>
            <p className="text-sm font-bold text-gray-400 mb-8">
                Order ID: #{orderId ? orderId.substring(orderId.length - 8).toUpperCase() : 'CONFIRMED'}
            </p>

            {/* Quick Invoice Download Card */}
            <div className="w-full max-w-md bg-white border border-[#f5eadb] rounded-2xl p-6 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                    <div className="text-left">
                        <div className="text-xs text-gray-400 font-extrabold uppercase tracking-wider">Official Receipt</div>
                        <div className="text-sm font-bold text-[#1c1c1c]">Tax Invoice Available</div>
                    </div>
                    <span className="text-[11px] bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full uppercase">
                        Ready
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        disabled={downloadingPdf}
                        onClick={handleDownloadPDF}
                        className="flex-1 bg-[#cf7e28] hover:bg-[#b56e22] text-white text-sm font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-[#cf7e28]/20 disabled:opacity-50"
                    >
                        {downloadingPdf ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Generating PDF...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                <span>Download PDF</span>
                            </>
                        )}
                    </button>

                    {order && (
                        <button
                            onClick={() => setIsInvoiceOpen(true)}
                            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                        >
                            <FileText className="w-4 h-4 text-[#cf7e28]" />
                            <span>View Invoice</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="grid sm:grid-cols-2 gap-4 w-full max-w-md">
                <button
                    onClick={() => navigate('/my-orders')}
                    className="flex-1 bg-white hover:bg-gray-50 border border-[#f5eadb] text-black font-extrabold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm"
                >
                    <Package className="w-5 h-5 text-[#cf7e28]" />
                    Track in My Orders
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="flex-1 bg-[#1a1614] hover:bg-black text-white font-extrabold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm"
                >
                    <Home className="w-5 h-5" />
                    Back Home
                </button>
            </div>

            <div className="mt-10 p-6 bg-white border border-[#f5eadb] rounded-2xl max-w-lg shadow-sm">
                <p className="text-gray-600 font-medium text-[14px] leading-relaxed">
                    A confirmation email along with your official Tax Invoice PDF has also been sent to your email inbox!
                </p>
            </div>

            {/* Invoice Modal */}
            {order && (
                <InvoiceModal
                    order={order}
                    isOpen={isInvoiceOpen}
                    onClose={() => setIsInvoiceOpen(false)}
                />
            )}
        </div>
    );
};

export default SuccessPage;
