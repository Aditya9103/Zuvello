import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { CreditCard, Wallet, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../api';
import SEO from '../components/SEO';

const PaymentPage = () => {
    const navigate = useNavigate();
    const { cartItems, cartTotal, clearCart } = useCart();
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            navigate('/login?redirect=/checkout/payment');
        }
    }, [navigate]);

    const handlePlaceOrder = async () => {
        try {
            setLoading(true);
            const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress'));
            const token = localStorage.getItem('userToken');

            const appliedCoupon = JSON.parse(localStorage.getItem('appliedCoupon'));
            const finalTotal = appliedCoupon ? cartTotal - appliedCoupon.discountAmount : cartTotal;

            const orderData = {
                orderItems: cartItems.map(item => ({
                    name: item.name,
                    qty: item.qty,
                    image: (item.images && item.images.length > 0) ? item.images[0] : 'https://via.placeholder.com/150',
                    price: item.price,
                    product: item._id,
                    size: item.selectedSize,
                    color: item.selectedColor
                })),
                shippingAddress,
                paymentMethod,
                totalPrice: finalTotal,
                discountAmount: appliedCoupon ? appliedCoupon.discountAmount : 0,
                couponCode: appliedCoupon ? appliedCoupon.code : null,
            };

            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const { data } = await axios.post(`${API_BASE_URL}/orders`, orderData, {
                headers
            });

            if (data.newUserToken && data.newUserInfo) {
                localStorage.setItem('userToken', data.newUserToken);
                localStorage.setItem('userInfo', JSON.stringify(data.newUserInfo));
            }

            clearCart();
            localStorage.removeItem('shippingAddress');
            localStorage.removeItem('appliedCoupon');
            navigate(`/checkout/success?id=${data._id}`);
        } catch (error) {
            console.error('Error placing order:', error);
            alert(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
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
                        {/* COD Option */}
                        <div
                            onClick={() => setPaymentMethod('COD')}
                            className={`p-6 rounded-[20px] border-2 transition-all cursor-pointer flex items-center justify-between ${paymentMethod === 'COD' ? 'border-[#cf7e28] bg-[#fbf5f2]' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <Wallet className={`w-8 h-8 ${paymentMethod === 'COD' ? 'text-[#cf7e28]' : 'text-gray-400'}`} />
                                <div>
                                    <h3 className="text-[#1c1c1c] font-bold">Cash On Delivery</h3>
                                    <p className="text-xs text-gray-500 font-medium">Pay when your order arrives</p>
                                </div>
                            </div>
                            {paymentMethod === 'COD' && <CheckCircle2 className="w-6 h-6 text-[#cf7e28] fill-[#fbf5f2]" />}
                        </div>

                        {/* UPI Option */}
                        <div
                            onClick={() => setPaymentMethod('UPI')}
                            className={`p-6 rounded-[20px] border-2 transition-all cursor-pointer flex items-center justify-between ${paymentMethod === 'UPI' ? 'border-[#cf7e28] bg-[#fbf5f2]' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <CreditCard className={`w-8 h-8 ${paymentMethod === 'UPI' ? 'text-[#cf7e28]' : 'text-gray-400'}`} />
                                <div>
                                    <h3 className="text-[#1c1c1c] font-bold">UPI / QR Payment</h3>
                                    <p className="text-xs text-gray-500 font-medium">Coming Soon - Scan & Pay</p>
                                </div>
                            </div>
                            {paymentMethod === 'UPI' && <CheckCircle2 className="w-6 h-6 text-[#cf7e28] fill-[#fbf5f2]" />}
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            {JSON.parse(localStorage.getItem('appliedCoupon')) && (
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-green-600 font-bold uppercase text-xs tracking-widest">Discount Applied</span>
                                    <span className="text-xl font-bold text-green-600">-₹{JSON.parse(localStorage.getItem('appliedCoupon')).discountAmount.toFixed(0)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-end">
                                <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Final Amount</span>
                                <span className="text-3xl font-black text-[#1c1c1c]">
                                    ₹{JSON.parse(localStorage.getItem('appliedCoupon')) 
                                        ? (cartTotal - JSON.parse(localStorage.getItem('appliedCoupon')).discountAmount).toFixed(0) 
                                        : cartTotal}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        onClick={handlePlaceOrder}
                        className="w-full bg-[#cf7e28] hover:bg-[#b56e22] text-white font-extrabold py-5 rounded-[20px] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#cf7e28]/20 mt-4 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                Final Order
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
