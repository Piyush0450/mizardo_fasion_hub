import React, { createContext, useState, useEffect, useContext } from 'react';
import {
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const token = await currentUser.getIdToken();
                    localStorage.setItem('token', token);

                    // Sync with backend to get role
                    const res = await axios.post(`${API_URL}/auth/verify-token`, { token });

                    setUser({
                        uid: currentUser.uid,
                        email: currentUser.email,
                        full_name: currentUser.displayName || res.data.user.full_name || currentUser.email.split('@')[0],
                        photoURL: currentUser.photoURL,
                        role: res.data.user.role, // Role from backend
                        addresses: res.data.user.addresses || []
                    });
                } catch (error) {
                    console.error("Auth Sync Error:", error);
                    // Fallback if backend fails
                    setUser({
                        uid: currentUser.uid,
                        email: currentUser.email,
                        role: 'user'
                    });
                }
            } else {
                localStorage.removeItem('token');
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const googleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            return { success: true };
        } catch (error) {
            console.error("Google Login failed", error);
            return { success: false, error: error.message };
        }
    };

    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error) {
            console.error("Login failed", error);
            return { success: false, error: error.message };
        }
    };

    const register = async (full_name, email, password) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // TODO: Update profile with full_name
            return { success: true };
        } catch (error) {
            console.error("Registration failed", error);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const updateUserProfile = async (updates) => {
        try {
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, updates);
                setUser(prev => ({ ...prev, ...updates }));
                return { success: true };
            }
            return { success: false, error: "No user logged in" };
        } catch (error) {
            console.error("Profile update failed", error);
            return { success: false, error: error.message };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, googleLogin, logout, updateUserProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
