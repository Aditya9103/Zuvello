import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../api';
import { Eye, X, Trash2, Phone, Mail, MapPin, GraduationCap, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';
import SEO from '../../components/SEO';
import TableSkeleton from '../../components/skeletons/TableSkeleton';

const EnquiryManagement = () => {
    const queryClient = useQueryClient();
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const { data: enquiries = [], isLoading: loading } = useQuery({
        queryKey: ['adminEnquiries'],
        queryFn: async () => {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            const response = await axios.get(`${API_BASE_URL}/enquiry/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    const viewDetails = (enquiry) => {
        setSelectedEnquiry(enquiry);
        setShowDetailModal(true);
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            await axios.put(
                `${API_BASE_URL}/enquiry/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            queryClient.invalidateQueries(['adminEnquiries']);
            if (selectedEnquiry && selectedEnquiry._id === id) {
                setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
            }
            toast.success('Status updated successfully');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this enquiry?')) {
            return;
        }

        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            await axios.delete(`${API_BASE_URL}/enquiry/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            queryClient.invalidateQueries(['adminEnquiries']);
            setShowDetailModal(false);
            toast.success('Enquiry deleted successfully');
        } catch (error) {
            console.error('Error deleting enquiry:', error);
            toast.error('Failed to delete enquiry');
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'spam': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'pending':
            default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        }
    };

    return (
        <div className="space-y-6">
            <SEO title="Enquiry Management" />
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-white">Inquiries</h1>
                <div className="text-white">
                    Total: <span className="text-primary font-bold">{enquiries.length}</span>
                </div>
            </div>

            {loading ? (
                <TableSkeleton columns={6} rows={8} />
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Message</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {enquiries.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-white">
                                            No inquiries yet
                                        </td>
                                    </tr>
                                ) : (
                                    enquiries.map((enquiry) => (
                                        <tr key={enquiry._id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-white font-medium">{enquiry.name}</td>
                                            <td className="px-6 py-4 text-white text-sm">{enquiry.email}</td>
                                            <td className="px-6 py-4">
                                                <p className="text-gray-300 text-sm truncate max-w-[200px]">{enquiry.message}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={enquiry.status}
                                                    onChange={(e) => handleStatusChange(enquiry._id, e.target.value)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer outline-none border ${getStatusStyles(enquiry.status)}`}
                                                >
                                                    <option value="pending" className="bg-dark text-white">Pending</option>
                                                    <option value="in_progress" className="bg-dark text-white">In Progress</option>
                                                    <option value="resolved" className="bg-dark text-white">Resolved</option>
                                                    <option value="spam" className="bg-dark text-white">Spam</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-white text-sm">
                                                {new Date(enquiry.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => viewDetails(enquiry)}
                                                        className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-dark rounded-lg transition-all font-bold text-sm"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(enquiry._id)}
                                                        className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all font-bold text-sm"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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

            {/* Detail Modal */}
            {showDetailModal && selectedEnquiry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-10">
                    <div
                        className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm"
                        onClick={() => setShowDetailModal(false)}
                    />
                    <div className="bg-dark border border-white/20 relative w-full max-w-2xl p-0 rounded-3xl shadow-2xl z-10 max-h-[90vh] flex flex-col">
                        <div className="p-8 pb-0 flex justify-between items-center shrink-0">
                            <h2 className="text-3xl font-black text-white">Inquiry Details</h2>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="p-2 text-white hover:text-white hover:bg-white/10 rounded-xl transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Name</label>
                                        <p className="text-white font-bold text-lg">{selectedEnquiry.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Email</label>
                                        <div className="flex items-center gap-2 text-white font-bold text-lg">
                                            <Mail className="w-4 h-4 text-primary" />
                                            {selectedEnquiry.email}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Message</label>
                                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                                        <p className="text-white whitespace-pre-wrap">{selectedEnquiry.message}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                    <div>
                                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Status</label>
                                        <select
                                            value={selectedEnquiry.status}
                                            onChange={(e) => {
                                                handleStatusChange(selectedEnquiry._id, e.target.value);
                                            }}
                                            className={`px-4 py-2 rounded-lg font-bold cursor-pointer outline-none border ${getStatusStyles(selectedEnquiry.status)}`}
                                        >
                                            <option value="pending" className="bg-dark text-white">Pending</option>
                                            <option value="in_progress" className="bg-dark text-white">In Progress</option>
                                            <option value="resolved" className="bg-dark text-white">Resolved</option>
                                            <option value="spam" className="bg-dark text-white">Spam</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Submitted On</label>
                                        <p className="text-white font-bold">
                                            {new Date(selectedEnquiry.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Delete Button */}
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={() => handleDelete(selectedEnquiry._id)}
                                    className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all font-bold"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    Delete Inquiry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnquiryManagement;
