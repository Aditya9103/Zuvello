import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../api';
import { Check, X, Trash2, Star, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import SEO from '../../components/SEO';
import TableSkeleton from '../../components/skeletons/TableSkeleton';

const ReviewManagement = () => {
    const queryClient = useQueryClient();

    const { data: reviews = [], isLoading: loading } = useQuery({
        queryKey: ['adminReviews'],
        queryFn: async () => {
            const token = localStorage.getItem('adminToken');
            const { data } = await axios.get(`${API_BASE_URL}/reviews/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });

    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(
                `${API_BASE_URL}/reviews/${id}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            queryClient.invalidateQueries(['adminReviews']);
            toast.success(`Review ${status} successfully`);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update review status');
        }
    };

    const deleteReview = async (id) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`${API_BASE_URL}/reviews/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            queryClient.invalidateQueries(['adminReviews']);
            toast.success('Review deleted successfully');
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Failed to delete review');
        }
    };

    return (
        <div className="space-y-6">
            <SEO title="Review Management" />
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-white">Manage Reviews</h1>
                <div className="text-white">
                    Total: <span className="text-primary font-bold">{reviews.length}</span> | Pending: <span className="text-yellow-500 font-bold">{reviews.filter(r => r.status === 'pending').length}</span>
                </div>
            </div>

            {loading ? (
                <TableSkeleton columns={5} rows={8} />
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Rating & Comment</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {reviews.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                            No reviews found.
                                        </td>
                                    </tr>
                                ) : (
                                    reviews.map((review) => (
                                        <tr key={review._id} className="hover:bg-white/5 transition-colors text-white">
                                            <td className="px-6 py-4">
                                                {review.product ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
                                                            <img src={review.product.images?.[0] || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt=""  loading="lazy" decoding="async" />
                                                        </div>
                                                        <div className="font-medium text-sm text-white line-clamp-2 max-w-[150px]">
                                                            {review.product.name}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-red-500 text-sm font-bold">Product Deleted</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-white">{review.user?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-400">{review.user?.email}</div>
                                                <div className="text-[10px] text-primary mt-1">{new Date(review.createdAt).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                <div className="flex items-center gap-1 mb-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={12} className={i < review.rating ? 'text-[#cf7e28] fill-[#cf7e28]' : 'text-gray-600'} />
                                                    ))}
                                                </div>
                                                <div className="text-sm font-bold text-white">{review.title}</div>
                                                <div className="text-sm text-gray-300 line-clamp-2 mt-1">{review.comment}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider ${
                                                    review.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                                    review.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                    {review.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {review.status !== 'approved' && (
                                                        <button
                                                            onClick={() => updateStatus(review._id, 'approved')}
                                                            className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-colors"
                                                            title="Approve"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                    )}
                                                    {review.status !== 'rejected' && (
                                                        <button
                                                            onClick={() => updateStatus(review._id, 'rejected')}
                                                            className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                                            title="Reject"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteReview(review._id)}
                                                        className="p-2 text-gray-500 hover:text-red-500 transition-colors ml-2"
                                                        title="Delete completely"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewManagement;
