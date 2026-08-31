import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, CheckCircle, Clock, Truck, XCircle, ChevronDown } from 'lucide-react';
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
            
            // Invalidate to refetch immediately, or optimistic update
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

    return (
    <div className="space-y-6">
      <SEO title="Order Management" />
            <h1 className="text-3xl font-black text-white">Order Management</h1>

            {loading ? (
                <TableSkeleton columns={6} rows={10} />
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-white text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {orders.map((order) => (
                                <tr key={order._id} className="text-white hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs">#{order._id.substring(order._id.length - 8)}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold">{order.shippingAddress.name}</div>
                                        <div className="text-xs text-white">{order.shippingAddress.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold">₹{order.totalPrice}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-white">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
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
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
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

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-white uppercase">Items</h3>
                                <div className="space-y-2">
                                    {selectedOrder.orderItems.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover"  loading="lazy" decoding="async" />
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
                            
                            <div className="flex justify-between items-center p-4 pt-6 border-t border-white/10">
                                <div className="text-xl font-bold text-white">Total Amount</div>
                                <div className="text-2xl font-black text-primary">₹{selectedOrder.totalPrice}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;
