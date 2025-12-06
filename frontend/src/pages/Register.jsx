import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await register(name, email, password);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.error);
        }
    };

    const handleGoogleLogin = async () => {
        const res = await googleLogin();
        if (res.success) {
            navigate('/');
        } else {
            setError(res.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-black text-white px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-brand-dark p-8 rounded-2xl border border-gray-800 shadow-glow"
            >
                <h2 className="text-3xl font-display font-bold mb-6 text-center text-brand-green">Create Account</h2>
                {error && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

                <button
                    onClick={handleGoogleLogin}
                    className="w-full bg-white text-black font-bold py-3 rounded-full mb-6 flex items-center justify-center gap-2 hover:bg-gray-200 transition"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    Sign up with Google
                </button>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-brand-dark text-gray-500">Or continue with email</span></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 focus:border-brand-green focus:outline-none transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 focus:border-brand-green focus:outline-none transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 focus:border-brand-green focus:outline-none transition-colors"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-brand-green text-white font-bold py-3 rounded-full hover:bg-brand-neon hover:shadow-glow transition-all">
                        Sign Up
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-400 text-sm">
                    Already have an account? <Link to="/login" className="text-brand-green hover:underline">Log in</Link>
                </p>
            </motion.div>
        </div>
    );
}
