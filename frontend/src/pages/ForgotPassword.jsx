import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Phone, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../api';
import SEO from '../components/SEO';
import ButtonLoader from '../components/ButtonLoader';

const ForgotPassword = () => {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (step === 1) {
            try {
                setLoading(true);
                await axios.post(`${API_BASE_URL}/auth/forgot-password-otp`, { phone });
                setStep(2);
                setSuccess('OTP sent successfully to your WhatsApp!');
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to send OTP');
            } finally {
                setLoading(false);
            }
        } else {
            if (newPassword !== confirmPassword) {
                return setError('Passwords do not match');
            }
            try {
                setLoading(true);
                const { data } = await axios.post(`${API_BASE_URL}/auth/reset-password-otp`, {
                    phone,
                    otp,
                    newPassword
                });
                
                setSuccess(data.message);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } catch (error) {
                setError(error.response?.data?.message || 'Password reset failed');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-start justify-center bg-[#fdfaf7] px-4 pt-10 pb-16 font-sans">
            <SEO title="Forgot Password" />
            <div className="w-full max-w-[480px]">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#1c1c1c] tracking-tight mb-2">
                        {step === 1 ? 'Reset Password' : 'Verify & Reset'}
                    </h1>
                    <p className="text-gray-500 text-[14px]">
                        {step === 1 
                            ? 'Enter your registered mobile number' 
                            : 'Enter the OTP sent to your WhatsApp'}
                    </p>
                </div>

                <div className="bg-white border border-[#f5eadb] shadow-xl shadow-[#cf7e28]/5 rounded-[24px] p-8 md:p-10">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-500 text-sm font-bold p-4 rounded-xl mb-6 text-center">
                            {error}
                        </div>
                    )}
                    
                    {success && (
                        <div className="bg-green-50 border border-green-100 text-green-600 text-sm font-bold p-4 rounded-xl mb-6 text-center">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {step === 1 ? (
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-extrabold text-black">Mobile Number</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#cf7e28] transition-colors" />
                                    <input
                                        required
                                        type="tel"
                                        placeholder="+91 XXXXX XXXXX"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-[#fdfaf7] border border-[#f5eadb] rounded-xl py-3.5 pl-11 pr-4 text-[14px] font-bold text-black placeholder-gray-400 focus:bg-white focus:border-[#cf7e28] focus:ring-1 focus:ring-[#cf7e28] outline-none transition-all"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-extrabold text-black">WhatsApp OTP</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#cf7e28] transition-colors" />
                                        <input
                                            required
                                            type="text"
                                            placeholder="123456"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full bg-[#fdfaf7] border border-[#f5eadb] rounded-xl py-3.5 pl-11 pr-4 text-[14px] font-bold text-black tracking-widest placeholder-gray-400 focus:bg-white focus:border-[#cf7e28] focus:ring-1 focus:ring-[#cf7e28] outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-extrabold text-black">New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#cf7e28] transition-colors" />
                                        <input
                                            required
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-[#fdfaf7] border border-[#f5eadb] rounded-xl py-3.5 pl-11 pr-11 text-[14px] font-bold text-black placeholder-gray-400 focus:bg-white focus:border-[#cf7e28] focus:ring-1 focus:ring-[#cf7e28] outline-none transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-extrabold text-black">Confirm New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#cf7e28] transition-colors" />
                                        <input
                                            required
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-[#fdfaf7] border border-[#f5eadb] rounded-xl py-3.5 pl-11 pr-11 text-[14px] font-bold text-black placeholder-gray-400 focus:bg-white focus:border-[#cf7e28] focus:ring-1 focus:ring-[#cf7e28] outline-none transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-[#cf7e28] hover:bg-[#b56e22] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors mt-8 shadow-md shadow-[#cf7e28]/20 disabled:opacity-90 disabled:pointer-events-none"
                        >
                            {loading ? <ButtonLoader text={step === 1 ? 'Sending OTP' : 'Resetting Password'} /> : <>{step === 1 ? 'Send OTP' : 'Reset Password'} <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>

                    {step === 1 && (
                        <div className="mt-8 text-center border-t border-gray-100 pt-6">
                            <Link to="/login" className="text-gray-500 text-[14px] font-bold hover:text-[#cf7e28] transition-colors">
                                Back to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
