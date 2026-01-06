import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Key } from 'lucide-react';

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (res.ok) {
                setStep(2);
                setMessage(data.message);
            } else {
                setError(data.detail || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            const data = await res.json();

            if (res.ok) {
                setStep(3);
                setMessage('OTP Verified. Enter new password.');
            } else {
                setError(data.detail || 'Invalid OTP');
            }
        } catch (err) {
            setError('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, new_password: newPassword })
            });
            const data = await res.json();

            if (res.ok) {
                setMessage('Password reset successful! Redirecting...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(data.detail || 'Reset failed');
            }
        } catch (err) {
            setError('Reset failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-black text-white px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-brand-dark p-8 rounded-2xl border border-gray-800 shadow-glow"
            >
                <h2 className="text-2xl font-display font-bold mb-2 text-center text-brand-green">
                    {step === 1 ? 'Forgot Password' : step === 2 ? 'Verify OTP' : 'Reset Password'}
                </h2>
                <p className="text-gray-400 text-center text-sm mb-6">
                    {step === 1 ? 'Enter your email to receive an OTP' : step === 2 ? `Enter OTP sent to ${email}` : 'Create a new strong password'}
                </p>

                {error && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm text-center">{error}</div>}
                {message && <div className="bg-green-500/10 text-green-500 p-3 rounded mb-4 text-sm text-center">{message}</div>}

                <AnimatePresence mode='wait'>
                    {step === 1 && (
                        <motion.form key="step1" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} onSubmit={handleSendOTP} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 pl-10 focus:border-brand-green focus:outline-none"
                                        required
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>
                            <button disabled={loading} className="w-full bg-brand-green text-black font-bold py-3 rounded-full hover:bg-brand-neon hover:shadow-glow transition-all disabled:opacity-50">
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </motion.form>
                    )}

                    {step === 2 && (
                        <motion.form key="step2" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} onSubmit={handleVerifyOTP} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Enter 6-Digit OTP</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 pl-10 focus:border-brand-green focus:outline-none tracking-widest text-center text-lg"
                                        required
                                        maxLength="6"
                                        placeholder="000000"
                                    />
                                </div>
                            </div>
                            <button disabled={loading} className="w-full bg-brand-green text-black font-bold py-3 rounded-full hover:bg-brand-neon hover:shadow-glow transition-all disabled:opacity-50">
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-gray-500 hover:text-white mt-2">
                                Change Email
                            </button>
                        </motion.form>
                    )}

                    {step === 3 && (
                        <motion.form key="step3" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 pl-10 focus:border-brand-green focus:outline-none"
                                        required
                                        placeholder="New secure password"
                                        minLength="6"
                                    />
                                </div>
                            </div>
                            <button disabled={loading} className="w-full bg-brand-green text-black font-bold py-3 rounded-full hover:bg-brand-neon hover:shadow-glow transition-all disabled:opacity-50">
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className="mt-6 border-t border-gray-800 pt-4 text-center">
                    <Link to="/login" className="text-sm text-gray-400 hover:text-brand-green transition-colors">
                        Back to Login
                    </Link>
                </div>

            </motion.div>
        </div>
    );
}
