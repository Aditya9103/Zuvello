import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, LogOut, Menu, X, MessageSquare, Inbox, ShoppingBag, Grid2X2, Tag, Instagram, Star } from 'lucide-react';
import { logoutAdmin } from '../../utils/auth';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'categories', label: 'Categories', icon: Grid2X2 },
        { id: 'products', label: 'Products', icon: ShoppingBag },
        { id: 'orders', label: 'Orders', icon: MessageSquare },
        { id: 'offers', label: 'Offers', icon: Tag },
        { id: 'instagram', label: 'Instagram Reels', icon: Instagram },
        { id: 'reviews', label: 'Reviews', icon: Star },
        { id: 'blogs', label: 'Blog Posts', icon: FileText },
        { id: 'enquiries', label: 'Enquiries', icon: Inbox },
        { id: 'users', label: 'User Details', icon: Users },
    ];

    const handleLogout = () => {
        logoutAdmin();
        navigate('/admin/login');
    };

    return (
        <>
            {/* Mobile Menu Toggle */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-[#1c1c1c]/90 backdrop-blur-xl border border-white/10 rounded-xl text-[#cf7e28] shadow-2xl transition-transform active:scale-95"
            >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar */}
            <div className={`
                fixed lg:relative inset-y-0 left-0 z-40
                w-72 
                transform transition-all duration-500 ease-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex flex-col h-[calc(100vh-2rem)] m-4 bg-[#1c1c1c]/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
                    
                    {/* Logo Section */}
                    <div className="p-8 border-b border-white/5 relative overflow-hidden">
                        {/* Subtle glow effect behind logo */}
                        <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#cf7e28]/20 blur-3xl rounded-full pointer-events-none"></div>
                        
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#cf7e28] via-[#e2a865] to-[#f5eadb] relative z-10">
                            ZUVELLO
                        </h1>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-[0.3em] relative z-10">Admin Portal</p>
                    </div>

                    {/* Menu Items */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1.5 scrollbar-hide">
                        {menuItems.map((item) => {
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`
                                        w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl
                                        transition-all duration-300 group relative overflow-hidden
                                        ${isActive
                                            ? 'bg-gradient-to-r from-[#cf7e28]/10 to-transparent text-[#cf7e28] font-bold shadow-[0_0_20px_rgba(207,126,40,0.05)]'
                                            : 'text-gray-400 hover:text-white hover:bg-white/[0.02] font-medium hover:translate-x-1'
                                        }
                                    `}
                                >
                                    {/* Active Indicator Line */}
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#cf7e28] rounded-r-full shadow-[0_0_10px_rgba(207,126,40,0.8)]"></div>
                                    )}
                                    
                                    <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                    <span className="tracking-wide text-[14px]">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Logout Button */}
                    <div className="p-4 border-t border-white/5 bg-white/[0.01]">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 font-bold hover:translate-x-1"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="tracking-wide text-[14px]">Secure Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity"
                />
            )}
        </>
    );
};

export default AdminSidebar;
