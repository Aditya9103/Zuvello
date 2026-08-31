import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, Clock, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp, ShoppingBag, MapPin } from 'lucide-react';
import { API_BASE_URL } from '../api';
import SEO from '../components/SEO';
import OrderSkeleton from '../components/skeletons/OrderSkeleton';

const MyOrders = () => {
    const [expandedOrder, setExpandedOrder] = useState(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: orders = [], isLoading: loading } = useQuery({
        queryKey: ['myOrders'],
        queryFn: async () => {
            const token = localStorage.getItem('userToken');
            if (!token) {
                navigate('/login');
                throw new Error("No token");
            }
            const { data } = await axios.get(`${API_BASE_URL}/orders/myorders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    const handleCancelOrder = async (orderId) => {
        if (window.confirm("Are you sure you want to cancel this order?")) {
            try {
                const token = localStorage.getItem('userToken');
                const { data } = await axios.put(`${API_BASE_URL}/orders/${orderId}/cancel`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                queryClient.setQueryData(['myOrders'], old => 
                    old ? old.map(o => o._id === orderId ? data : o) : old
                );
            } catch (error) {
                console.error("Failed to cancel order:", error);
                alert(error.response?.data?.message || "Failed to cancel order");
            }
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'Processing': return <Package className="w-5 h-5 text-blue-500" />;
            case 'Shipped': return <Truck className="w-5 h-5 text-purple-500" />;
            case 'Delivered': return <CheckCircle className="w-5 h-5 text-green-500" />;
            default: return <XCircle className="w-5 h-5 text-red-500" />;
        }
    };

    if (!loading && orders.length === 0) return (
        <div className="pt-32 pb-24 min-h-screen bg-[#fdfaf7] flex flex-col items-center justify-center px-4">
            <ShoppingBag className="w-20 h-20 text-gray-300 mb-6" />
            <h2 className="text-3xl font-extrabold text-[#1c1c1c] mb-4 tracking-tight">No orders yet</h2>
            <button onClick={() => navigate('/shop')} className="bg-[#cf7e28] hover:bg-[#b56e22] text-white font-bold px-8 py-3 rounded-xl shadow-md shadow-[#cf7e28]/20 transition-all">Start Shopping</button>
        </div>
    );

    return (
        <div className="pt-10 pb-16 min-h-[calc(100vh-80px)] bg-[#fdfaf7] font-sans">
            <SEO title="My Orders" noindex={true} />
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#1c1c1c] mb-8 tracking-tight">My Orders</h1>

                <div className="space-y-6">
                    {loading ? (
                        <>
                            <OrderSkeleton />
                            <OrderSkeleton />
                            <OrderSkeleton />
                        </>
                    ) : (
                        orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-white border border-[#f5eadb] rounded-2xl overflow-hidden shadow-xl shadow-[#cf7e28]/5 transition-all"
                            >
                                {/* Order Header */}
                                <div 
                                    className="p-6 border-b border-[#f5eadb] cursor-pointer hover:bg-gray-50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                >
                                    <div>
                                        <div className="text-xs text-gray-500 font-extrabold uppercase tracking-widest mb-1">Order ID</div>
                                        <div className="text-[#1c1c1c] font-bold text-sm">#{order._id.toUpperCase()}</div>
                                        <div className="text-sm text-gray-500 font-medium mt-1">Ordered on {new Date(order.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500 font-extrabold uppercase tracking-widest mb-1">Total Paid</div>
                                            <div className="text-lg font-black text-[#cf7e28]">₹{order.totalPrice}</div>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                                            {getStatusIcon(order.status)}
                                            <span className="text-[#1c1c1c] text-xs font-bold uppercase tracking-wider">{order.status}</span>
                                        </div>
                                        <button className="p-2 text-gray-400 hover:text-[#cf7e28] transition-colors rounded-full hover:bg-[#cf7e28]/10">
                                            {expandedOrder === order._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Order Details (Expanded) */}
                                {expandedOrder === order._id && (
                                    <div className="p-6 bg-gray-50">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            {/* Items List */}
                                            <div className="space-y-4">
                                                <h3 className="text-[13px] font-extrabold text-gray-400 uppercase tracking-widest">Items in Order</h3>
                                                <div className="space-y-3">
                                                    {order.orderItems.map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover"  loading="lazy" decoding="async" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="text-[#1c1c1c] font-bold text-sm leading-tight mb-1">{item.name}</div>
                                                                <div className="text-xs font-bold text-gray-500">Qty: {item.qty} × ₹{item.price}</div>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-2">
                                                                <div className="text-[#1c1c1c] font-black text-sm">₹{item.qty * item.price}</div>
                                                                {order.status === 'Delivered' && (
                                                                    <button 
                                                                        onClick={() => navigate(`/product/${item.product}?tab=REVIEWS`)}
                                                                        className="text-xs font-bold text-[#cf7e28] hover:text-[#a1601d] bg-[#cf7e28]/10 px-3 py-1.5 rounded-md transition-colors"
                                                                    >
                                                                        Write a Review
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Tracking Timeline */}
                                            <div className="space-y-4">
                                                <h3 className="text-[13px] font-extrabold text-gray-400 uppercase tracking-widest">Order Tracking</h3>
                                                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                                    {order.trackingUpdates && order.trackingUpdates.length > 0 ? (
                                                        <div className="relative pl-6 border-l-2 border-[#cf7e28]/20 space-y-6">
                                                            {order.trackingUpdates.map((update, idx) => (
                                                                <div key={idx} className="relative">
                                                                    <div className="absolute -left-[31px] bg-white p-1 rounded-full">
                                                                        <div className="w-3 h-3 bg-[#cf7e28] rounded-full shadow-[0_0_0_4px_white]"></div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex justify-between items-start mb-1">
                                                                            <div className="font-extrabold text-[#1c1c1c] text-sm">{update.status}</div>
                                                                            <div className="text-xs font-bold text-gray-400">{new Date(update.date).toLocaleString()}</div>
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#cf7e28] mb-1">
                                                                            <MapPin className="w-3.5 h-3.5" /> {update.location}
                                                                        </div>
                                                                        {update.description && (
                                                                            <p className="text-sm text-gray-500 font-medium">{update.description}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 text-sm font-medium text-center py-4">Your order is being processed. Tracking details will appear here shortly.</p>
                                                    )}
                                                    
                                                    {(order.status === 'Pending' || order.status === 'Processing') && (
                                                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                                                            <button 
                                                                onClick={() => handleCancelOrder(order._id)}
                                                                className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
                                                            >
                                                                Cancel Order
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyOrders;
