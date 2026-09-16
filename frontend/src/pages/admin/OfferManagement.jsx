import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import SEO from '../../components/SEO';
import TableSkeleton from '../../components/skeletons/TableSkeleton';
import { API_BASE_URL } from '../../api';

const OfferManagement = () => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        code: '',
        discountPercentage: '',
        description: '',
        isActive: true,
        visibleToAll: false
    });

    const { data: coupons = [], isLoading: loading, error } = useQuery({
        queryKey: ['adminCoupons'],
        queryFn: async () => {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_BASE_URL}/coupons/admin`, config);
            return Array.isArray(data) ? data : [];
        },
        staleTime: 5 * 60 * 1000,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_BASE_URL}/coupons`, formData, config);
            setFormData({ code: '', discountPercentage: '', description: '', isActive: true, visibleToAll: false });
            queryClient.invalidateQueries(['adminCoupons']);
            queryClient.invalidateQueries(['offers']);
            toast.success('Offer created successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create coupon');
        }
    };

    const handleToggleVisibleToAll = async (coupon) => {
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const updatedVal = !coupon.visibleToAll;
            await axios.put(`${API_BASE_URL}/coupons/${coupon._id}`, { visibleToAll: updatedVal }, config);
            
            queryClient.setQueryData(['adminCoupons'], old =>
                old ? old.map(c => c._id === coupon._id ? { ...c, visibleToAll: updatedVal } : c) : old
            );
            queryClient.invalidateQueries(['offers']);
            toast.success(updatedVal ? `Coupon "${coupon.code}" is now visible on Exclusive Offers page` : `Coupon "${coupon.code}" is now hidden from Exclusive Offers page`);
        } catch (err) {
            toast.error('Failed to update coupon visibility');
        }
    };

    const handleToggleActive = async (coupon) => {
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const updatedVal = !coupon.isActive;
            await axios.put(`${API_BASE_URL}/coupons/${coupon._id}`, { isActive: updatedVal }, config);
            
            queryClient.setQueryData(['adminCoupons'], old =>
                old ? old.map(c => c._id === coupon._id ? { ...c, isActive: updatedVal } : c) : old
            );
            queryClient.invalidateQueries(['offers']);
            toast.success(updatedVal ? `Coupon "${coupon.code}" activated` : `Coupon "${coupon.code}" deactivated`);
        } catch (err) {
            toast.error('Failed to update coupon status');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            try {
                const token = localStorage.getItem('adminToken');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`${API_BASE_URL}/coupons/${id}`, config);
                queryClient.invalidateQueries(['adminCoupons']);
                queryClient.invalidateQueries(['offers']);
                toast.success('Offer deleted successfully!');
            } catch (err) {
                toast.error('Failed to delete coupon');
            }
        }
    };

    if (error) return <div className="text-red-500 p-8">{error.message || 'Failed to load coupons'}</div>;

    return (
    <div className="space-y-6">
      <SEO title="Offer Management" />
            <h1 className="text-3xl font-black text-white">Offer Management</h1>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Create New Coupon</h2>
                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-white mb-1">Coupon Code</label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            required
                            placeholder="e.g. SAVE20"
                            className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 uppercase font-mono font-bold"
                        />
                    </div>
                    <div>
                        <label className="block text-white mb-1">Discount Percentage (%)</label>
                        <input
                            type="number"
                            name="discountPercentage"
                            value={formData.discountPercentage}
                            onChange={handleChange}
                            required
                            min="1"
                            max="100"
                            placeholder="e.g. 20"
                            className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-white mb-1">Description</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Get 20% off your entire order!"
                            className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2"
                        />
                    </div>
                    <div className="md:col-span-2 flex flex-wrap gap-4 items-center pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl hover:bg-white/10 transition-colors">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="w-4 h-4 rounded text-primary accent-[#cf7e28] cursor-pointer"
                            />
                            <span className="text-white text-xs font-bold">Active (Usable at Checkout)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl hover:bg-white/10 transition-colors">
                            <input
                                type="checkbox"
                                name="visibleToAll"
                                checked={formData.visibleToAll}
                                onChange={handleChange}
                                className="w-4 h-4 rounded text-primary accent-[#cf7e28] cursor-pointer"
                            />
                            <span className="text-white text-xs font-bold flex items-center gap-1.5">
                                <span>Visible to all</span>
                                <span className="text-gray-400 font-normal text-[11px]">(Shows on Exclusive Offers page)</span>
                            </span>
                        </label>
                    </div>
                    <div className="md:col-span-2 pt-2">
                        <button type="submit" className="bg-primary hover:bg-primary/90 text-dark font-extrabold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-md">
                            <Plus size={20} /> Create Coupon
                        </button>
                    </div>
                </form>
            </div>

            {loading ? (
                <TableSkeleton columns={6} rows={5} />
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-white">
                        <thead className="bg-white/10">
                            <tr>
                                <th className="p-4 font-bold">Code</th>
                                <th className="p-4 font-bold">Discount</th>
                                <th className="p-4 font-bold">Description</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold">Visible to All</th>
                                <th className="p-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((coupon) => (
                                <tr key={coupon._id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-black font-mono text-primary text-sm">{coupon.code}</td>
                                    <td className="p-4 font-bold">{coupon.discountPercentage}%</td>
                                    <td className="p-4 text-gray-300 text-sm">{coupon.description}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleToggleActive(coupon)}
                                            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all border ${coupon.isActive ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'}`}
                                            title="Click to toggle Active status"
                                        >
                                            {coupon.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleToggleVisibleToAll(coupon)}
                                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${coupon.visibleToAll ? 'bg-[#cf7e28]/20 text-[#cf7e28] border-[#cf7e28]/30 hover:bg-[#cf7e28]/30' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
                                            title="Click to toggle visibility on Exclusive Offers page"
                                        >
                                            {coupon.visibleToAll ? (
                                                <>
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Visible on Offers</span>
                                                </>
                                            ) : (
                                                <>
                                                    <EyeOff className="w-3.5 h-3.5" />
                                                    <span>Hidden (Private)</span>
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(coupon._id)}
                                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                                            title="Delete Coupon"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {coupons.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400">No coupons found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OfferManagement;
