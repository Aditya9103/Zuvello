import React from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Users, Mail, Phone, Calendar, ShoppingBag, ShieldCheck, User } from 'lucide-react';
import { API_BASE_URL } from '../../api';
import TableSkeleton from '../../components/skeletons/TableSkeleton';

const UserManagement = () => {
    const { data: users = [], isLoading: loading } = useQuery({
        queryKey: ['adminUsers'],
        queryFn: async () => {
            const token = localStorage.getItem('adminToken');
            const { data } = await axios.get(`${API_BASE_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#2a2a2a] p-6 rounded-2xl border border-white/5">
                <div>
                    <h2 className="text-xl font-bold text-white mb-1">User Management</h2>
                    <p className="text-gray-400 text-sm">View and manage all registered users across the platform.</p>
                </div>
                <div className="bg-[#cf7e28]/20 text-[#cf7e28] px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm border border-[#cf7e28]/30">
                    <Users className="w-5 h-5" />
                    {users.length} Total Users
                </div>
            </div>

            {loading ? (
                <TableSkeleton columns={4} rows={10} />
            ) : (
                <div className="bg-[#2a2a2a] rounded-2xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">User Details</th>
                                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Info</th>
                                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined On</th>
                                    <th className="text-center py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Orders</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                                    <User className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm flex items-center gap-2">
                                                        {user.name}
                                                        {user.role === 'admin' && (
                                                            <span className="flex items-center gap-1 text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30 uppercase tracking-wider font-extrabold">
                                                                <ShieldCheck className="w-3 h-3" /> Admin
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                                    <Mail className="w-4 h-4 text-gray-500" />
                                                    {user.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                                    <Phone className="w-4 h-4 text-gray-500" />
                                                    {user.phone || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                {new Date(user.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="inline-flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                                <ShoppingBag className="w-4 h-4 text-[#cf7e28]" />
                                                <span className="font-bold text-white text-sm">{user.orderCount || 0}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {users.length === 0 && (
                        <div className="p-12 text-center text-gray-500 font-medium">
                            No users found in the system.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserManagement;
