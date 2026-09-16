import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { CreditCard, Wallet, QrCode, ArrowRight, ArrowLeft, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '../api';
import SEO from '../components/SEO';
import { loadRazorpayScript } from '../utils/razorpay';

const PaymentPage = () => {
    const navigate = useNavigate();
    const { cartItems, cartTotal, clearCart } = useCart();
    const [paymentMethod, setPaymentMethod] = useState('Razorpay');
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            navigate('/login?redirect=/checkout/payment', { state: { from: '/checkout/payment' } });
            return;
        }

        if (!cartItems || cartItems.length === 0) {
            navigate('/cart');
            return;
        }

        // Preload Razorpay SDK script in the background
        loadRazorpayScript().catch(() => { });
    }, [navigate, cartItems]);

    const appliedCoupon = JSON.parse(localStorage.getItem('appliedCoupon') || 'null');
    const finalTotal = appliedCoupon ? Math.max(0, cartTotal - appliedCoupon.discountAmount) : cartTotal;

    const handlePlaceOrder = async () => {
        const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress') || 'null');
        const token = localStorage.getItem('userToken');

        if (!shippingAddress) {
            alert('Shipping address missing. Please fill your address first.');
            navigate('/checkout/address');
            return;
        }

        if (!token) {
            navigate('/login?redirect=/checkout/payment', { state: { from: '/checkout/payment' } });
            return;
        }

        // 1. CASH ON DELIVERY FLOW
        if (paymentMethod === 'COD') {
            try {
                setLoading(true);
                setLoadingText('Placing Order...');

                const orderData = {
                    orderItems: cartItems.map(item => ({
                        name: item.name,
                        qty: item.qty,
                        image: (item.images && item.images.length > 0) ? item.images[0] : 'https://via.placeholder.com/150',
                        price: item.price,
                        product: item._id,
                        size: item.selectedSize || '',
                        color: item.selectedColor || ''
                    })),
                    shippingAddress,
                    paymentMethod: 'COD',
                    totalPrice: finalTotal,
                    discountAmount: appliedCoupon ? appliedCoupon.discountAmount : 0,
                    couponCode: appliedCoupon ? appliedCoupon.code : null,
                };

                const { data } = await axios.post(`${API_BASE_URL}/orders`, orderData, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                clearCart();
                localStorage.removeItem('shippingAddress');
                localStorage.removeItem('appliedCoupon');
                navigate(`/checkout/success?id=${data._id}`);
            } catch (error) {
                console.error('Error placing COD order:', error);
                alert(error.response?.data?.message || 'Failed to place order');
            } finally {
                setLoading(false);
                setLoadingText('');
            }
            return;
        }

        // 2. ONLINE PAYMENT (RAZORPAY - UPI, QR, CARDS, NETBANKING, WALLETS)
        try {
            setLoading(true);
            setLoadingText('Initializing Payment Gateway...');

            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                alert('Failed to load Razorpay payment SDK. Please check your internet connection.');
                setLoading(false);
                setLoadingText('');
                return;
            }

            // Request backend to create Razorpay order with server-calculated amount
            const createOrderPayload = {
                orderItems: cartItems.map(item => ({
                    product: item._id,
                    qty: item.qty,
                    size: item.selectedSize || '',
                    color: item.selectedColor || '',
                    name: item.name,
                    image: (item.images && item.images.length > 0) ? item.images[0] : 'https://via.placeholder.com/150'
                })),
                shippingAddress,
                couponCode: appliedCoupon ? appliedCoupon.code : null
            };

            const { data } = await axios.post(`${API_BASE_URL}/payment/create-order`, createOrderPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!data.success || !data.razorpayOrderId) {
                throw new Error(data.message || 'Unable to initiate payment');
            }

            setLoadingText('Waiting for Payment...');

            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency || 'INR',
                name: 'Zuvello',
                description: `Order #${data.internalOrderId.slice(-8).toUpperCase()}`,
                order_id: data.razorpayOrderId,
                prefill: {
                    name: data.prefill?.name || shippingAddress.name || '',
                    email: data.prefill?.email || '',
                    contact: data.prefill?.contact || shippingAddress.phone || ''
                },
                config: {
                    display: {
                        blocks: {
                            upi: {
                                name: "Pay using UPI",
                                instruments: [
                                    {
                                        method: "upi",
                                        flows: ["intent", "qr"]
                                    }
                                ]
                            }
                        },
                        sequence: ["block.upi"],
                        preferences: {
                            show_default_blocks: true
                        }
                    }
                },
                theme: {
                    color: '#cf7e28'
                },
                retry: {
                    enabled: true,
                    max_count: 3
                },
                modal: {
                    backdropclose: false,
                    confirm_close: true,
                    handleback: true,
                    ondismiss: function () {
                        console.log('Payment modal dismissed by user');
                        setLoading(false);
                        setLoadingText('');
                    }
                },
                handler: async function (response) {
                    setLoading(true);
                    setLoadingText('Verifying Payment...');

                    try {
                        const verifyRes = await axios.post(`${API_BASE_URL}/payment/verify`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }, {
                            headers: { Authorization: `Bearer ${token}` }
                        });

                        if (verifyRes.data.success) {
                            clearCart();
                            localStorage.removeItem('shippingAddress');
                            localStorage.removeItem('appliedCoupon');
                            navigate(`/checkout/success?id=${verifyRes.data.orderId}`);
                        } else {
                            throw new Error(verifyRes.data.message || 'Payment verification failed');
                        }
                    } catch (verifyErr) {
                        console.error('Payment verification error:', verifyErr);
                        alert(verifyErr.response?.data?.message || 'Payment verification failed. Please contact support.');
                        setLoading(false);
                        setLoadingText('');
                    }
                }
            };

            const razorpayWindow = new window.Razorpay(options);
            razorpayWindow.on('payment.failed', function (response) {
                console.error('Razorpay payment failed:', response.error);
                alert(`Payment Unsuccessful: ${response.error?.description || 'Transaction failed'}`);
                setLoading(false);
                setLoadingText('');
            });

            razorpayWindow.open();
        } catch (error) {
            console.error('Error initiating Razorpay:', error);
            alert(error.response?.data?.message || error.message || 'Payment initiation failed');
            setLoading(false);
            setLoadingText('');
        }
    };

    return (
        <div className="pt-24 pb-24 min-h-screen bg-[#fdfaf7] flex items-center justify-center px-4 font-sans">
            <SEO title="Payment" noindex={true} />
            <div className="max-w-xl w-full">
                <button
                    onClick={() => navigate('/checkout/address')}
                    className="flex items-center gap-2 text-gray-500 hover:text-[#cf7e28] transition-colors mb-8 font-bold text-[14px]"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Address
                </button>

                <h1 className="text-4xl font-extrabold text-[#1c1c1c] mb-2 tracking-tight">Payment <span className="text-[#cf7e28]">Method</span></h1>
                <p className="text-gray-500 mb-8 font-medium">Choose your preferred way to pay</p>

                <div className="space-y-4">
                    <div className="bg-white border border-[#f5eadb] rounded-[24px] p-8 space-y-6 shadow-xl shadow-[#cf7e28]/5">
                        {/* Online Payment Option (UPI, QR, Cards, NetBanking, Wallets) */}
                        <div
                            onClick={() => setPaymentMethod('Razorpay')}
                            className={`p-6 rounded-[20px] border-2 transition-all cursor-pointer flex items-center justify-between ${paymentMethod === 'Razorpay' ? 'border-[#cf7e28] bg-[#fbf5f2]' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <QrCode className={`w-7 h-7 ${paymentMethod === 'Razorpay' ? 'text-[#cf7e28]' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-[#1c1c1c] font-bold">UPI, QR, Cards & NetBanking</h3>
                                        <span className="text-[10px] bg-green-100 text-green-700 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Fast</span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">Google Pay, PhonePe, Paytm, QR, Cards, Wallets</p>
                                </div>
                            </div>
                            {paymentMethod === 'Razorpay' && <CheckCircle2 className="w-6 h-6 text-[#cf7e28] fill-[#fbf5f2] shrink-0" />}
                        </div>

                        {/* COD Option */}
                        <div
                            onClick={() => setPaymentMethod('COD')}
                            className={`p-6 rounded-[20px] border-2 transition-all cursor-pointer flex items-center justify-between ${paymentMethod === 'COD' ? 'border-[#cf7e28] bg-[#fbf5f2]' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <Wallet className={`w-7 h-7 ${paymentMethod === 'COD' ? 'text-[#cf7e28]' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                    <h3 className="text-[#1c1c1c] font-bold">Cash On Delivery</h3>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">Pay when your order arrives at your doorstep</p>
                                </div>
                            </div>
                            {paymentMethod === 'COD' && <CheckCircle2 className="w-6 h-6 text-[#cf7e28] fill-[#fbf5f2] shrink-0" />}
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            {appliedCoupon && (
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-green-600 font-bold uppercase text-xs tracking-widest">Discount Applied ({appliedCoupon.code})</span>
                                    <span className="text-xl font-bold text-green-600">-₹{appliedCoupon.discountAmount.toFixed(0)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-end">
                                <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Final Amount</span>
                                <span className="text-3xl font-black text-[#1c1c1c]">
                                    ₹{finalTotal.toFixed(0)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                            <ShieldCheck className="w-4 h-4 text-green-600" />
                            100% Encrypted & Safe Payment Gateway
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        onClick={handlePlaceOrder}
                        className="w-full bg-[#cf7e28] hover:bg-[#b56e22] text-white font-extrabold py-5 rounded-[20px] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#cf7e28]/20 mt-4 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>{loadingText || 'Processing...'}</span>
                            </div>
                        ) : (
                            <>
                                <span>{paymentMethod === 'Razorpay' ? `Pay ₹${finalTotal.toFixed(0)} Now` : 'Confirm Order'}</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
