import React, { useState } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../api';
import { Eye, X, Phone, Mail, MapPin, GraduationCap, School } from 'lucide-react';
import SEO from '../../components/SEO';
import TableSkeleton from '../../components/skeletons/TableSkeleton';

const CounsellingManagement = () => {
    const [selectedCounselling, setSelectedCounselling] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const { data: counsellings = [], isLoading: loading } = useQuery({
        queryKey: ['adminCounsellings'],
        queryFn: async () => {
            const response = await axios.get(`${API_BASE_URL}/contact/all`);
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    const viewDetails = (counselling) => {
        setSelectedCounselling(counselling);
        setShowDetailModal(true);
    };

    return (
        <div className="space-y-6">
            <SEO title="Counselling Management" />
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-white">Counselling Requests</h1>
                <div className="text-white">
                    Total: <span className="text-primary font-bold">{counsellings.length}</span>
                </div>
            </div>

            {loading ? (
                <TableSkeleton columns={8} rows={8} />
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Mobile</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Course</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">12th %</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Stream</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {counsellings.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-white">
                                            No counselling requests yet
                                        </td>
                                    </tr>
                                ) : (
                                    counsellings.map((counselling) => (
                                        <tr key={counselling._id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-white font-medium">{counselling.name}</td>
                                            <td className="px-6 py-4 text-white">{counselling.phone}</td>
                                            <td className="px-6 py-4 text-white">{counselling.email}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                                                    {counselling.course}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-white">{counselling.marks12th}%</td>
                                            <td className="px-6 py-4 text-white">{counselling.stream12th}</td>
                                            <td className="px-6 py-4 text-white text-sm">
                                                {new Date(counselling.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => viewDetails(counselling)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-dark rounded-lg transition-all font-bold text-sm"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>
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
            {showDetailModal && selectedCounselling && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-10">
                    <div
                        className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm"
                        onClick={() => setShowDetailModal(false)}
                    />
                    <div className="bg-dark border border-white/20 relative w-full max-w-4xl p-8 rounded-3xl shadow-2xl z-10">
                        <button
                            onClick={() => setShowDetailModal(false)}
                            className="absolute top-6 right-6 p-2 text-white hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-3xl font-black text-white mb-8">Student Details</h2>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Personal Information */}
                            <div className="space-y-6">
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                                    <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-4">Personal Information</h3>

                                    <div>
                                        <label className="text-white text-xs font-bold uppercase">Student Name</label>
                                        <p className="text-white font-bold text-lg">{selectedCounselling.name}</p>
                                    </div>

                                    <div>
                                        <label className="text-white text-xs font-bold uppercase">Father's Name</label>
                                        <p className="text-white font-bold">{selectedCounselling.fatherName}</p>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Phone className="w-5 h-5 text-primary mt-1" />
                                        <div className="flex-1">
                                            <label className="text-white text-xs font-bold uppercase">Mobile</label>
                                            <p className="text-white font-bold">{selectedCounselling.phone}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Phone className="w-5 h-5 text-primary mt-1" />
                                        <div className="flex-1">
                                            <label className="text-white text-xs font-bold uppercase">Alternate Mobile</label>
                                            <p className="text-white font-bold">{selectedCounselling.alternateMobile}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Mail className="w-5 h-5 text-primary mt-1" />
                                        <div className="flex-1">
                                            <label className="text-white text-xs font-bold uppercase">Email</label>
                                            <p className="text-white font-bold break-all">{selectedCounselling.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-primary mt-1" />
                                        <div className="flex-1">
                                            <label className="text-white text-xs font-bold uppercase">Address</label>
                                            <p className="text-white">{selectedCounselling.address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Academic Information */}
                            <div className="space-y-6">
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                                    <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-4">Academic Information</h3>

                                    <div className="flex items-start gap-3">
                                        <GraduationCap className="w-5 h-5 text-primary mt-1" />
                                        <div className="flex-1">
                                            <label className="text-white text-xs font-bold uppercase">Interested Course</label>
                                            <p className="text-white font-bold text-lg">{selectedCounselling.course}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-white text-xs font-bold uppercase">10th Marks</label>
                                            <p className="text-white font-bold text-2xl">{selectedCounselling.marks10th}%</p>
                                        </div>
                                        <div>
                                            <label className="text-white text-xs font-bold uppercase">12th Marks</label>
                                            <p className="text-white font-bold text-2xl">{selectedCounselling.marks12th}%</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-white text-xs font-bold uppercase">12th Stream</label>
                                        <p className="text-white font-bold">{selectedCounselling.stream12th}</p>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <School className="w-5 h-5 text-primary mt-1" />
                                        <div className="flex-1">
                                            <label className="text-white text-xs font-bold uppercase">12th School Name</label>
                                            <p className="text-white">{selectedCounselling.schoolName12th}</p>
                                        </div>
                                    </div>

                                    {selectedCounselling.message && (
                                        <div>
                                            <label className="text-white text-xs font-bold uppercase">Message</label>
                                            <p className="text-white bg-white/5 p-4 rounded-xl mt-2">{selectedCounselling.message}</p>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-white/10">
                                        <label className="text-white text-xs font-bold uppercase">Submitted On</label>
                                        <p className="text-white font-bold">
                                            {new Date(selectedCounselling.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CounsellingManagement;
