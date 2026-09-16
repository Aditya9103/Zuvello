import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, CheckCircle, Clock, Truck, XCircle, ChevronDown, CreditCard, RotateCcw, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../api';
import SEO from '../../components/SEO';
import TableSkeleton from '../../components/skeletons/TableSkeleton';

const OrderManagement = () => {
    const queryClient = useQueryClient();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [trackingUpdate, setTrackingUpdate] = useState({ status: '', location: '', description: '' });
    const [editMode, setEditMode] = useState(false);
    const [editFormData, setEditFormData] = useState({ name: '', phone: '', address: '', city: '', postalCode: '' });

    // Payment & Status Filter states
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [paymentFilter, setPaymentFilter] = useState('ALL');

    // Refund Modal state
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [refundLoading, setRefundLoading] = useState(false);

    // Delete state
    const [deletingOrderId, setDeletingOrderId] = useState(null);

    const isDeletable = (order) => {
        if (!order) return false;
        const isPending = 
            order.status === 'Pending' || 
            order.orderStatus === 'PENDING_PAYMENT' || 
            order.paymentStatus === 'PENDING' || 
            order.paymentStatus === 'CREATED';

        const isFailedOrCancelled = 
            order.status === 'Cancelled' || 
            order.orderStatus === 'CANCELLED' || 
            order.paymentStatus === 'FAILED';

        return isPending || isFailedOrCancelled;
    };

    const handleDeleteOrder = async (orderId, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm('Are you sure you want to permanently delete this order? This action cannot be undone.')) {
            return;
        }

        try {
            setDeletingOrderId(orderId);
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            await axios.delete(`${API_BASE_URL}/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Order deleted successfully');
            queryClient.setQueryData(['adminOrders'], old => 
                old ? old.filter(o => o._id !== orderId) : old
            );

            if (selectedOrder && selectedOrder._id === orderId) {
                setShowDetailModal(false);
                setSelectedOrder(null);
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error(error.response?.data?.message || 'Failed to delete order');
        } finally {
            setDeletingOrderId(null);
        }
    };

    const { data: orders = [], isLoading: loading } = useQuery({
        queryKey: ['adminOrders'],
        queryFn: async () => {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            const { data } = await axios.get(`${API_BASE_URL}/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            await axios.put(`${API_BASE_URL}/orders/${orderId}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            queryClient.setQueryData(['adminOrders'], old => 
                old ? old.map(o => o._id === orderId ? { ...o, status: newStatus } : o) : old
            );
            
            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleAddTrackingUpdate = async (e) => {
        e.preventDefault();
        if (!trackingUpdate.status || !trackingUpdate.location) return;
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            const { data } = await axios.post(`${API_BASE_URL}/orders/${selectedOrder._id}/tracking`, trackingUpdate, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            queryClient.setQueryData(['adminOrders'], old => 
                old ? old.map(o => o._id === data._id ? data : o) : old
            );
            setSelectedOrder(data);
            setTrackingUpdate({ status: '', location: '', description: '' });
        } catch (error) {
            console.error('Error adding tracking update:', error);
        }
    };

    const handleEditSave = async () => {
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            const { data } = await axios.put(`${API_BASE_URL}/orders/${selectedOrder._id}/edit`, editFormData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            queryClient.setQueryData(['adminOrders'], old => 
                old ? old.map(o => o._id === data._id ? data : o) : old
            );
            setSelectedOrder(data);
            setEditMode(false);
        } catch (error) {
            console.error('Error updating order details:', error);
        }
    };

    const handleIssueRefund = async (e) => {
        e.preventDefault();
        if (!selectedOrder) return;

        try {
            setRefundLoading(true);
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            const { data } = await axios.post(`${API_BASE_URL}/payment/refund`, {
                orderId: selectedOrder._id,
                amount: refundAmount ? Number(refundAmount) : selectedOrder.totalPrice,
                reason: refundReason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(`Refund successful! Refund ID: ${data.refundId}`);
            setShowRefundModal(false);
            setRefundAmount('');
            setRefundReason('');

            // Refetch orders
            queryClient.invalidateQueries(['adminOrders']);
            setShowDetailModal(false);
        } catch (error) {
            console.error('Refund failed:', error);
            alert(error.response?.data?.message || 'Failed to process refund');
        } finally {
            setRefundLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'text-yellow-500 bg-yellow-500/10';
            case 'Processing': return 'text-blue-500 bg-blue-500/10';
            case 'Shipped': return 'text-purple-500 bg-purple-500/10';
            case 'Delivered': return 'text-green-500 bg-green-500/10';
            case 'Cancelled': return 'text-red-500 bg-red-500/10';
            default: return 'text-white bg-gray-500/10';
        }
    };

    const getPaymentStatus = (order) => {
        if (order.paymentStatus === 'REFUNDED') return { label: 'Refunded', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
        if (order.paymentStatus === 'PARTIALLY_REFUNDED') return { label: 'Partial Refund', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
        if (order.isPaid || order.paymentStatus === 'CAPTURED') return { label: 'Paid', color: 'text-green-400 bg-green-500/10 border-green-500/30' };
        if (order.paymentStatus === 'FAILED') return { label: 'Failed', color: 'text-red-400 bg-red-500/10 border-red-500/30' };
        return { label: 'Pending', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' };
    };

    // Filter orders
    const filteredOrders = orders.filter((order) => {
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
        
        let matchesPayment = true;
        if (paymentFilter === 'PAID') {
            matchesPayment = order.isPaid || order.paymentStatus === 'CAPTURED';
        } else if (paymentFilter === 'PENDING') {
            matchesPayment = !order.isPaid && order.paymentStatus !== 'FAILED' && order.paymentStatus !== 'REFUNDED';
        } else if (paymentFilter === 'FAILED') {
            matchesPayment = order.paymentStatus === 'FAILED';
        } else if (paymentFilter === 'REFUNDED') {
            matchesPayment = order.paymentStatus === 'REFUNDED' || order.paymentStatus === 'PARTIALLY_REFUNDED';
        }

        return matchesStatus && matchesPayment;
    });

    return (
        <div className="space-y-6">
            <SEO title="Order Management" />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-black text-white">Order Management</h1>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 items-center">
                <div className="text-xs font-bold text-gray-400 uppercase mr-2">Filters:</div>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-dark border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-primary"
                >
                    <option value="ALL">All Order Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>

                {/* Payment Status Filter */}
                <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="bg-dark border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-primary"
                >
                    <option value="ALL">All Payment Statuses</option>
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Payment Pending</option>
                    <option value="FAILED">Payment Failed</option>
                    <option value="REFUNDED">Refunded</option>
                </select>

                <div className="ml-auto text-xs font-bold text-gray-400">
                    Showing <span className="text-white">{filteredOrders.length}</span> of {orders.length} orders
                </div>
            </div>

            {loading ? (
                <TableSkeleton columns={7} rows={10} />
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-white text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Payment</th>
                                <th className="px-6 py-4">Order Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                        No orders match the selected filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const paymentInfo = getPaymentStatus(order);
                                    return (
                                        <tr key={order._id} className="text-white hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs">#{order._id.substring(order._id.length - 8)}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold">{order.shippingAddress.name}</div>
                                                <div className="text-xs text-white">{order.shippingAddress.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 font-bold">₹{order.totalPrice}</td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${paymentInfo.color}`}>
                                                        {paymentInfo.label}
                                                    </span>
                                                    <div className="text-[10px] text-gray-400 font-semibold">
                                                        {order.paymentMethod === 'Razorpay' ? 'Razorpay (Online)' : order.paymentMethod}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-white">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => { 
                                                            setSelectedOrder(order); 
                                                            setEditFormData({
                                                                name: order.shippingAddress.name || '',
                                                                phone: order.shippingAddress.phone || '',
                                                                address: order.shippingAddress.address || '',
                                                                city: order.shippingAddress.city || '',
                                                                postalCode: order.shippingAddress.postalCode || ''
                                                            });
                                                            setShowDetailModal(true); 
                                                            setEditMode(false);
                                                        }}
                                                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                        title="View Order Details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>

                                                    {isDeletable(order) && (
                                                        <button
                                                            disabled={deletingOrderId === order._id}
                                                            onClick={(e) => handleDeleteOrder(order._id, e)}
                                                            className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                                                            title="Delete Order (Failed / Pending)"
                                                        >
                                                            {deletingOrderId === order._id ? (
                                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-5 h-5" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-dark-light border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">Order Details</h2>
                            <button onClick={() => setShowDetailModal(false)} className="text-white hover:text-white">
                                <ChevronDown className="w-6 h-6 rotate-180" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-bold text-white uppercase">Customer Info</h3>
                                        <button 
                                            onClick={() => setEditMode(!editMode)} 
                                            className="text-xs text-primary hover:underline font-bold"
                                        >
                                            {editMode ? 'Cancel Edit' : 'Edit'}
                                        </button>
                                    </div>
                                    <div className="text-white">
                                        {editMode ? (
                                            <div className="space-y-2 mt-2">
                                                <input type="text" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full bg-dark border border-white/10 rounded px-2 py-1 text-sm outline-none" placeholder="Name" />
                                                <input type="text" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} className="w-full bg-dark border border-white/10 rounded px-2 py-1 text-sm outline-none" placeholder="Phone" />
                                                <input type="text" value={editFormData.address} onChange={e => setEditFormData({...editFormData, address: e.target.value})} className="w-full bg-dark border border-white/10 rounded px-2 py-1 text-sm outline-none" placeholder="Address" />
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input type="text" value={editFormData.city} onChange={e => setEditFormData({...editFormData, city: e.target.value})} className="w-full bg-dark border border-white/10 rounded px-2 py-1 text-sm outline-none" placeholder="City" />
                                                    <input type="text" value={editFormData.postalCode} onChange={e => setEditFormData({...editFormData, postalCode: e.target.value})} className="w-full bg-dark border border-white/10 rounded px-2 py-1 text-sm outline-none" placeholder="Postal Code" />
                                                </div>
                                                <button onClick={handleEditSave} className="w-full mt-2 bg-primary text-dark font-bold text-xs py-1.5 rounded hover:bg-primary/90">Save Changes</button>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="font-bold text-lg">{selectedOrder.shippingAddress.name}</p>
                                                <p>{selectedOrder.shippingAddress.phone}</p>
                                                <p className="text-sm text-white">{selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}</p>
                                                <p className="text-sm text-gray-400">PIN: {selectedOrder.shippingAddress.postalCode}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold text-white uppercase">Order Status</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => handleUpdateStatus(selectedOrder._id, status)}
                                                className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${selectedOrder.status === status
                                                    ? 'bg-primary text-dark'
                                                    : 'bg-white/5 text-white hover:bg-white/10'
                                                    }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Details Section */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-primary" />
                                        Payment Information
                                    </h3>
                                    {selectedOrder.isPaid && selectedOrder.paymentMethod === 'Razorpay' && selectedOrder.paymentStatus !== 'REFUNDED' && (
                                        <button
                                            onClick={() => {
                                                setRefundAmount(selectedOrder.totalPrice.toString());
                                                setShowRefundModal(true);
                                            }}
                                            className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 font-bold px-3 py-1 rounded-lg hover:bg-red-500/30 transition-all flex items-center gap-1.5"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            Issue Refund
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                                    <div>
                                        <span className="text-gray-400 block">Method</span>
                                        <span className="text-white font-bold">{selectedOrder.paymentMethod}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block">Payment Status</span>
                                        <span className={`font-bold ${selectedOrder.isPaid ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {selectedOrder.paymentStatus || (selectedOrder.isPaid ? 'PAID' : 'PENDING')}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block">Payment Date</span>
                                        <span className="text-white font-medium text-[11px]">
                                            {selectedOrder.paidAt ? new Date(selectedOrder.paidAt).toLocaleString() : (selectedOrder.isPaid ? 'Paid' : 'Unpaid')}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block">Razorpay Order ID</span>
                                        <span className="text-white font-mono text-[11px] truncate block" title={selectedOrder.razorpayOrderId || 'N/A'}>
                                            {selectedOrder.razorpayOrderId || 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block">Payment ID</span>
                                        <span className="text-white font-mono text-[11px] truncate block" title={selectedOrder.paymentResult?.razorpay_payment_id || selectedOrder.paymentResult?.id || 'N/A'}>
                                            {selectedOrder.paymentResult?.razorpay_payment_id || selectedOrder.paymentResult?.id || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-white uppercase">Items</h3>
                                <div className="space-y-2">
                                    {selectedOrder.orderItems.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" loading="lazy" decoding="async" />
                                                <div>
                                                    <div className="text-white font-bold">{item.name}</div>
                                                    <div className="text-xs text-white">Qty: {item.qty} × ₹{item.price}</div>
                                                    {(item.size || item.color) && (
                                                        <div className="text-xs text-primary mt-0.5">
                                                            {item.size && <span>Size: {item.size}</span>}
                                                            {item.size && item.color && <span className="mx-1">•</span>}
                                                            {item.color && <span>Color: {item.color}</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-white font-bold">₹{item.qty * item.price}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tracking Updates Section */}
                            <div className="space-y-4 pt-6 border-t border-white/10">
                                <h3 className="text-sm font-bold text-white uppercase">Tracking Updates</h3>
                                <div className="space-y-3 mb-4">
                                    {selectedOrder.trackingUpdates && selectedOrder.trackingUpdates.length > 0 ? (
                                        selectedOrder.trackingUpdates.map((update, idx) => (
                                            <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/10">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-primary text-sm">{update.status}</span>
                                                    <span className="text-xs text-gray-400">{new Date(update.date).toLocaleString()}</span>
                                                </div>
                                                <div className="text-sm text-white mb-1">📍 {update.location}</div>
                                                {update.description && <div className="text-xs text-gray-400">{update.description}</div>}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm">No tracking updates yet.</p>
                                    )}
                                </div>
                                <form onSubmit={handleAddTrackingUpdate} className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
                                    <h4 className="text-xs font-bold text-white uppercase">Add New Update</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input 
                                            type="text" 
                                            placeholder="Status (e.g. Shipped, In Transit)" 
                                            required 
                                            className="bg-dark border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none"
                                            value={trackingUpdate.status}
                                            onChange={e => setTrackingUpdate({...trackingUpdate, status: e.target.value})}
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="Location (e.g. Mumbai Hub)" 
                                            required 
                                            className="bg-dark border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none"
                                            value={trackingUpdate.location}
                                            onChange={e => setTrackingUpdate({...trackingUpdate, location: e.target.value})}
                                        />
                                    </div>
                                    <textarea 
                                        placeholder="Description (Optional)" 
                                        className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none resize-none h-16"
                                        value={trackingUpdate.description}
                                        onChange={e => setTrackingUpdate({...trackingUpdate, description: e.target.value})}
                                    />
                                    <button type="submit" className="w-full bg-primary text-dark font-bold py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm">
                                        Add Tracking Update
                                    </button>
                                </form>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 pt-6 border-t border-white/10">
                                <div>
                                    {isDeletable(selectedOrder) && (
                                        <button
                                            disabled={deletingOrderId === selectedOrder._id}
                                            onClick={() => handleDeleteOrder(selectedOrder._id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                        >
                                            {deletingOrderId === selectedOrder._id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                            <span>Delete Order</span>
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-xl font-bold text-white">Total Amount</div>
                                    <div className="text-2xl font-black text-primary">₹{selectedOrder.totalPrice}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Refund Confirmation Modal */}
            {showRefundModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-dark-light border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center gap-3 text-red-400">
                            <AlertCircle className="w-6 h-6" />
                            <h3 className="text-lg font-bold text-white">Issue Razorpay Refund</h3>
                        </div>
                        <p className="text-xs text-gray-400">
                            You are initiating a refund for Order <span className="text-white font-mono">#{selectedOrder._id.slice(-8)}</span>. The amount will be refunded directly to the customer's original payment method via Razorpay.
                        </p>
                        <form onSubmit={handleIssueRefund} className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-gray-300 block mb-1">Refund Amount (₹)</label>
                                <input
                                    type="number"
                                    required
                                    max={selectedOrder.totalPrice}
                                    min={1}
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none"
                                />
                                <span className="text-[10px] text-gray-400">Max refundable: ₹{selectedOrder.totalPrice}</span>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-300 block mb-1">Reason for Refund</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Customer return, Item defective, etc."
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowRefundModal(false)}
                                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-lg text-xs transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={refundLoading}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                                >
                                    {refundLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Refund'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;
