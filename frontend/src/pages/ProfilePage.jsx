import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, MapPin, LogOut, Package, Edit2, Plus, X, Save } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import SEO from '../components/SEO';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [userInfo, setUserInfo] = useState(null);
    const [shippingAddress, setShippingAddress] = useState(null);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [addressForm, setAddressForm] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        postalCode: ''
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        setUserInfo(JSON.parse(storedUser));

        const storedAddress = localStorage.getItem('shippingAddress');
        if (storedAddress) {
            setShippingAddress(JSON.parse(storedAddress));
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('userToken');
        clearCart();
        navigate('/');
    };

    const handleEditAddress = () => {
        if (shippingAddress) {
            setAddressForm({
                name: shippingAddress.name || shippingAddress.fullName || '',
                phone: shippingAddress.phone || '',
                address: shippingAddress.address || '',
                city: shippingAddress.city || '',
                postalCode: shippingAddress.postalCode || shippingAddress.pincode || ''
            });
        } else {
            setAddressForm({
                name: userInfo?.name || '',
                phone: userInfo?.phone || '',
                address: '',
                city: '',
                postalCode: ''
            });
        }
        setIsEditingAddress(true);
    };

    const handleSaveAddress = (e) => {
        e.preventDefault();
        localStorage.setItem('shippingAddress', JSON.stringify(addressForm));
        setShippingAddress(addressForm);
        setIsEditingAddress(false);
    };

    if (!userInfo) return null;

    return (
        <div className="min-h-screen bg-[#fdfaf7] pt-12 pb-20 font-sans">
            <SEO title="My Profile" noindex={true} />
            <div className="max-w-[1200px] mx-auto px-4 md:px-8">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-[#1c1c1c] mb-3 tracking-tight">
                        My <span className="text-[#cf7e28]">Profile</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Manage your account details and preferences.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column: Profile Card */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white rounded-[24px] p-8 border border-[#f5eadb] shadow-sm text-center relative overflow-hidden group hover:shadow-md hover:border-[#cf7e28]/30 transition-all duration-300">
                            <div className="w-24 h-24 bg-[#fbf9f6] rounded-full mx-auto flex items-center justify-center border-4 border-white shadow-sm mb-6 relative z-10 group-hover:scale-105 transition-transform duration-300">
                                <User className="w-10 h-10 text-[#cf7e28]" />
                            </div>
                            <h2 className="text-2xl font-black text-[#1c1c1c] mb-1 relative z-10">{userInfo.name}</h2>
                            <p className="text-gray-500 text-[13px] font-bold flex items-center justify-center gap-2 relative z-10">
                                <Mail className="w-4 h-4" /> {userInfo.email}
                            </p>

                            {/* Decorative background element */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#cf7e28]/5 rounded-full blur-2xl group-hover:bg-[#cf7e28]/10 transition-colors duration-500"></div>
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#cf7e28]/5 rounded-full blur-2xl group-hover:bg-[#cf7e28]/10 transition-colors duration-500"></div>
                        </div>

                        <div className="bg-white rounded-[24px] p-4 border border-[#f5eadb] shadow-sm">
                            <button
                                onClick={() => navigate('/my-orders')}
                                className="w-full flex items-center gap-4 p-4 hover:bg-[#fbf9f6] rounded-xl transition-all duration-300 text-left group"
                            >
                                <div className="bg-[#fbf5f2] p-3 rounded-xl text-[#cf7e28] group-hover:bg-[#cf7e28] group-hover:text-white transition-colors duration-300">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#1c1c1c]">My Orders</h3>
                                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">View and track</p>
                                </div>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-4 p-4 hover:bg-red-50 rounded-xl transition-all duration-300 text-left mt-2 group"
                            >
                                <div className="bg-red-50 p-3 rounded-xl text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                                    <LogOut className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-red-500">Logout</h3>
                                    <p className="text-[11px] text-red-400 font-bold uppercase tracking-wider mt-0.5">Sign out of account</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-[24px] p-8 border border-[#f5eadb] shadow-sm hover:shadow-md transition-shadow duration-300">
                            <h3 className="text-xl font-bold text-[#1c1c1c] mb-6 flex items-center gap-3 border-b border-gray-100 pb-5">
                                <div className="w-8 h-8 rounded-full bg-[#fbf5f2] flex items-center justify-center text-[#cf7e28]">
                                    <User className="w-4 h-4" />
                                </div>
                                Personal Information
                            </h3>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="group">
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</p>
                                    <p className="text-[#1c1c1c] font-bold bg-[#fbf9f6] px-5 py-4 rounded-xl border border-transparent group-hover:border-[#f5eadb] group-hover:bg-white transition-all duration-300">{userInfo.name}</p>
                                </div>
                                <div className="group">
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</p>
                                    <p className="text-[#1c1c1c] font-bold bg-[#fbf9f6] px-5 py-4 rounded-xl border border-transparent group-hover:border-[#f5eadb] group-hover:bg-white transition-all duration-300">{userInfo.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[24px] p-8 border border-[#f5eadb] shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-5 mb-6">
                                <h3 className="text-xl font-bold text-[#1c1c1c] flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#fbf5f2] flex items-center justify-center text-[#cf7e28]">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    Saved Delivery Address
                                </h3>
                                {!isEditingAddress && (
                                    <button
                                        onClick={handleEditAddress}
                                        className="text-[#cf7e28] hover:text-[#b58145] font-bold text-sm flex items-center gap-1.5 transition-colors"
                                    >
                                        {shippingAddress ? <><Edit2 size={14} /> Edit</> : <><Plus size={14} /> Add</>}
                                    </button>
                                )}
                            </div>

                            {isEditingAddress ? (
                                <form onSubmit={handleSaveAddress} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Full Name</label>
                                            <input required type="text" value={addressForm.name} onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })} className="w-full bg-[#fbf9f6] border border-[#f5eadb] rounded-xl px-4 py-2.5 text-sm font-bold text-[#1c1c1c] focus:border-[#cf7e28] outline-none" placeholder="Name" />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Phone</label>
                                            <input required type="text" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} className="w-full bg-[#fbf9f6] border border-[#f5eadb] rounded-xl px-4 py-2.5 text-sm font-bold text-[#1c1c1c] focus:border-[#cf7e28] outline-none" placeholder="Phone" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Full Address</label>
                                        <textarea required rows="2" value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} className="w-full bg-[#fbf9f6] border border-[#f5eadb] rounded-xl px-4 py-2.5 text-sm font-bold text-[#1c1c1c] focus:border-[#cf7e28] outline-none resize-none" placeholder="Street Address, Area" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">City</label>
                                            <input required type="text" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full bg-[#fbf9f6] border border-[#f5eadb] rounded-xl px-4 py-2.5 text-sm font-bold text-[#1c1c1c] focus:border-[#cf7e28] outline-none" placeholder="City" />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Postal Code</label>
                                            <input required type="text" value={addressForm.postalCode} onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} className="w-full bg-[#fbf9f6] border border-[#f5eadb] rounded-xl px-4 py-2.5 text-sm font-bold text-[#1c1c1c] focus:border-[#cf7e28] outline-none" placeholder="Postal Code" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button type="button" onClick={() => setIsEditingAddress(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                                        <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#cf7e28] hover:bg-[#b58145] text-white flex items-center gap-2 transition-colors shadow-md shadow-[#cf7e28]/20"><Save size={16} /> Save Address</button>
                                    </div>
                                </form>
                            ) : shippingAddress ? (
                                <div className="bg-[#fbf9f6] p-6 rounded-xl border border-transparent hover:border-[#cf7e28]/30 transition-all duration-300 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#cf7e28]/5 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>
                                    <p className="text-[#1c1c1c] font-black mb-3 text-lg relative z-10">{shippingAddress.name || shippingAddress.fullName || userInfo.name}</p>
                                    <p className="text-gray-600 font-medium mb-1.5 text-sm relative z-10 flex items-center gap-2">
                                        <span className="font-bold text-[#1c1c1c]">Phone:</span> {shippingAddress.phone}
                                    </p>
                                    <p className="text-gray-600 font-medium leading-relaxed text-sm relative z-10">
                                        {shippingAddress.address}<br />
                                        {shippingAddress.city}, {shippingAddress.postalCode || shippingAddress.pincode}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-[#fbf9f6] rounded-xl border border-dashed border-gray-200">
                                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-[#1c1c1c] font-bold mb-1">No address saved yet</p>
                                    <p className="text-[13px] font-medium text-gray-500 max-w-[250px] mx-auto">Your address will be automatically saved here after you place your first order.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
