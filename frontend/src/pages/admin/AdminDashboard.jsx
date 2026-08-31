import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import AdminSidebar from '../../components/admin/AdminSidebar';
import BlogManagement from './BlogManagement';
import OrderManagement from './OrderManagement';
import EnquiryManagement from './EnquiryManagement';
import ProductManagement from './ProductManagement';
import CategoryManagement from './CategoryManagement';
import OfferManagement from './OfferManagement';
import InstagramManagement from './InstagramManagement';
import ReviewManagement from './ReviewManagement';
import UserManagement from './UserManagement';
import SEO from '../../components/SEO';
import { IndianRupee, Users, ShoppingBag, Clock } from 'lucide-react';
import { API_BASE_URL } from '../../api';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const { data: stats, isLoading: loadingStats } = useQuery({
        queryKey: ['adminStats'],
        queryFn: async () => {
            const token = localStorage.getItem('adminToken');
            const { data } = await axios.get(`${API_BASE_URL}/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        },
        staleTime: 5 * 60 * 1000,
        initialData: {
            totalUsers: 0,
            totalOrders: 0,
            totalRevenue: 0,
            pendingOrders: 0
        }
    });

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <SEO title="Admin Dashboard | Zuvello" />
                        
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                                    Welcome Back, Admin
                                </h1>
                                <p className="text-gray-400 mt-2 font-medium">Here's what's happening with your store today.</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl backdrop-blur-xl">
                                <p className="text-sm font-bold text-[#cf7e28]">
                                    {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        {/* Premium Stats Grid */}
                        <div className="grid md:grid-cols-4 gap-6">
                            {/* Revenue Card */}
                            <div className="relative group overflow-hidden rounded-[2rem] bg-[#1c1c1c]/60 backdrop-blur-2xl border border-white/10 p-8 hover:border-[#cf7e28]/50 transition-colors duration-500">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#cf7e28]/10 blur-3xl rounded-full group-hover:bg-[#cf7e28]/20 transition-all duration-500"></div>
                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#cf7e28] to-[#9c5a15] flex items-center justify-center shadow-[0_0_20px_rgba(207,126,40,0.3)]">
                                        <IndianRupee className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm font-bold tracking-wider uppercase mb-1">Total Revenue</div>
                                        <div className="text-3xl font-black text-white">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Users Card */}
                            <div className="relative group overflow-hidden rounded-[2rem] bg-[#1c1c1c]/60 backdrop-blur-2xl border border-white/10 p-8 hover:border-blue-500/50 transition-colors duration-500">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full group-hover:bg-blue-500/20 transition-all duration-500"></div>
                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm font-bold tracking-wider uppercase mb-1">Total Users</div>
                                        <div className="text-3xl font-black text-white">{stats.totalUsers}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Orders Card */}
                            <div className="relative group overflow-hidden rounded-[2rem] bg-[#1c1c1c]/60 backdrop-blur-2xl border border-white/10 p-8 hover:border-emerald-500/50 transition-colors duration-500">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full group-hover:bg-emerald-500/20 transition-all duration-500"></div>
                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                        <ShoppingBag className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm font-bold tracking-wider uppercase mb-1">Total Orders</div>
                                        <div className="text-3xl font-black text-white">{stats.totalOrders}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Pending Orders Card */}
                            <div className="relative group overflow-hidden rounded-[2rem] bg-[#1c1c1c]/60 backdrop-blur-2xl border border-white/10 p-8 hover:border-purple-500/50 transition-colors duration-500">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full group-hover:bg-purple-500/20 transition-all duration-500"></div>
                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                                        <Clock className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm font-bold tracking-wider uppercase mb-1">Pending Orders</div>
                                        <div className="text-3xl font-black text-white">{stats.pendingOrders}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ambient Message */}
                        <div className="bg-[#1c1c1c]/40 border border-white/5 rounded-3xl p-10 text-center relative overflow-hidden mt-8">
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                            <h3 className="text-2xl font-bold text-white mb-2 relative z-10">You're all caught up!</h3>
                            <p className="text-gray-400 relative z-10 max-w-lg mx-auto">Use the sidebar to manage your store's inventory, process new customer orders, and publish fresh content to your blog.</p>
                        </div>
                    </div>
                );

            case 'categories':
                return <CategoryManagement />;

            case 'products':
                return <ProductManagement />;

            case 'blogs':
                return <BlogManagement />;

            case 'orders':
                return <OrderManagement />;

            case 'offers':
                return <OfferManagement />;

            case 'instagram':
                return <InstagramManagement />;

            case 'enquiries':
                return <EnquiryManagement />;

            case 'reviews':
                return <ReviewManagement />;

            case 'users':
                return <UserManagement />;

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex selection:bg-[#cf7e28]/30">
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
