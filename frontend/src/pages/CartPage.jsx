import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, XCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import SEO from '../components/SEO';
import { API_BASE_URL } from '../api';

const CartPage = () => {
    const { cartItems, removeFromCart, updateQty, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    // Initialize coupon from localStorage if it exists
    React.useEffect(() => {
        const savedCoupon = localStorage.getItem('appliedCoupon');
        if (savedCoupon) {
            setAppliedCoupon(JSON.parse(savedCoupon));
        }
    }, []);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponError('');
        try {
            const { data } = await axios.post(`${API_BASE_URL}/coupons/validate`, { code: couponCode });
            const discountAmount = (cartTotal * (data.discountPercentage / 100));
            const couponData = {
                code: data.code,
                discountPercentage: data.discountPercentage,
                discountAmount: discountAmount
            };
            setAppliedCoupon(couponData);
            localStorage.setItem('appliedCoupon', JSON.stringify(couponData));
            setCouponCode('');
        } catch (error) {
            setCouponError(error.response?.data?.message || 'Invalid coupon code');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        localStorage.removeItem('appliedCoupon');
    };

    const finalTotal = appliedCoupon ? cartTotal - appliedCoupon.discountAmount : cartTotal;

    if (cartItems.length === 0) {
        return (
    <div className="pt-32 pb-24 min-h-screen bg-[#fdfaf7] flex flex-col items-center justify-center px-4 font-sans">
      <SEO title="Cart" noindex={true} />
                <ShoppingBag className="w-20 h-20 text-gray-300 mb-6" />
                <h2 className="text-3xl font-black text-[#1c1c1c] mb-4">Your cart is empty</h2>
                <p className="text-gray-500 mb-8 text-center max-w-md font-medium">
                    Looks like you haven't added anything to your cart yet. Explore our premium collection and start shopping!
                </p>
                <Link
                    to="/shop"
                    className="bg-[#cf7e28] hover:bg-[#b56e22] text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-lg shadow-[#cf7e28]/20"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="pt-12 pb-24 min-h-screen bg-[#fdfaf7] font-sans">
            <div className="max-w-[1400px] mx-auto px-4">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#1c1c1c] tracking-tight">
                        Your Shopping <span className="text-[#cf7e28]">Cart</span>
                    </h1>
                    {cartItems.length > 0 && (
                        <button 
                            onClick={clearCart}
                            className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-700 bg-red-50 px-4 py-2 rounded-lg transition-colors"
                        >
                            <Trash2 size={16} />
                            Clear Cart
                        </button>
                    )}
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div
                                key={item._id}
                                className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 group hover:shadow-md transition-all"
                            >
                                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                                    <img src={item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/150'} alt={item.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-xl font-bold text-[#1c1c1c] mb-1">{item.name}</h3>
                                    <p className="text-gray-500 text-xs uppercase tracking-widest">{item.category}</p>
                                    {item.selectedSize && (
                                        <p className="text-[#cf7e28] text-xs font-bold mt-1">Size: {item.selectedSize}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 bg-[#fbf5f2] p-2 rounded-xl border border-[#f5eadb]">
                                    <button
                                        onClick={() => updateQty(item._id, Math.max(1, item.qty - 1), item.selectedSize)}
                                        className="p-1 text-[#c18641] hover:text-[#1c1c1c] transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="text-[#1c1c1c] font-bold w-4 text-center">{item.qty}</span>
                                    <button
                                        onClick={() => updateQty(item._id, item.qty + 1, item.selectedSize)}
                                        className="p-1 text-[#c18641] hover:text-[#1c1c1c] transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="text-xl font-black text-[#1c1c1c] md:w-24 text-right">
                                    ₹{item.price * item.qty}
                                </div>
                                <button
                                    onClick={() => removeFromCart(item._id, item.selectedSize)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-[#f5eadb] rounded-[24px] p-8 sticky top-32 shadow-xl shadow-[#cf7e28]/5">
                            <h2 className="text-2xl font-extrabold text-[#1c1c1c] mb-6">Order Summary</h2>
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Subtotal</span>
                                    <span className="text-[#1c1c1c] font-bold">₹{cartTotal}</span>
                                </div>
                                
                                {/* Coupon Section */}
                                {!appliedCoupon ? (
                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1 group">
                                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#cf7e28]" />
                                                <input
                                                    type="text"
                                                    placeholder="Coupon Code"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                    className="w-full bg-[#fdfaf7] border border-[#f5eadb] rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#cf7e28] focus:ring-1 focus:ring-[#cf7e28] uppercase font-bold text-[#1c1c1c] transition-all"
                                                />
                                            </div>
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={couponLoading || !couponCode.trim()}
                                                className="bg-[#1c1c1c] hover:bg-black disabled:bg-gray-300 text-white font-bold px-4 rounded-xl text-sm transition-colors"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                        {couponError && <p className="text-red-500 text-xs mt-2 font-medium">{couponError}</p>}
                                    </div>
                                ) : (
                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                <div>
                                                    <p className="text-sm font-bold text-green-800">{appliedCoupon.code}</p>
                                                    <p className="text-xs text-green-600">{appliedCoupon.discountPercentage}% OFF applied</p>
                                                </div>
                                            </div>
                                            <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {appliedCoupon && (
                                    <div className="flex justify-between text-green-600 font-bold">
                                        <span>Discount</span>
                                        <span>-₹{appliedCoupon.discountAmount.toFixed(0)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-gray-500">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-bold uppercase text-xs">Free</span>
                                </div>
                                <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                                    <span className="text-[#1c1c1c] font-bold">Total Amount</span>
                                    <span className="text-3xl font-black text-[#cf7e28]">₹{finalTotal.toFixed(0)}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    const token = localStorage.getItem('userToken');
                                    if (!token) {
                                        navigate('/login?redirect=/checkout/address');
                                    } else {
                                        navigate('/checkout/address');
                                    }
                                }}
                                className="w-full bg-[#cf7e28] hover:bg-[#b56e22] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#cf7e28]/20"
                            >
                                Proceed to Checkout
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <p className="text-[10px] text-gray-400 mt-4 text-center font-bold uppercase tracking-widest">
                                Safe & Secure Checkout
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
