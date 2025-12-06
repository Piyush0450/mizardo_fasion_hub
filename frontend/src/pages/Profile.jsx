import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Package, LogOut, Camera, Loader, MapPin, Plus, Trash2, Edit, Check, X } from 'lucide-react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import axios from 'axios';

export default function Profile() {
    const { user, logout, updateUserProfile } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState({
        fullName: '', phone: '', email: '', addressLine1: '', city: '', state: '', pincode: '', isDefault: false
    });
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [visibleOrdersCount, setVisibleOrdersCount] = useState(2);
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [trackingData, setTrackingData] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

    React.useEffect(() => {
        if (user?.uid) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${API_URL}/orders/${user.uid}`);
            setOrders(res.data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoadingOrders(false);
        }
    };

    const trackOrder = async (orderId) => {
        try {
            const res = await axios.get(`${API_URL}/orders/${orderId}/track`);
            setTrackingData(res.data);
            setShowTrackingModal(true);
        } catch (error) {
            console.error("Tracking error:", error);
            alert("Unable to fetch tracking details");
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const storageRef = ref(storage, `profile_images/${user.uid}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            await updateUserProfile({ photoURL: downloadURL });
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleNameUpdate = async () => {
        if (!newName.trim()) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/auth/profile`, { full_name: newName }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await updateUserProfile({ displayName: newName, full_name: newName });
            setIsEditingName(false);
        } catch (error) {
            console.error("Failed to update name", error);
            alert("Failed to update name");
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (editingAddress) {
                await axios.put(`${API_URL}/auth/address/${editingAddress.id}`, addressForm, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Address updated successfully!");
            } else {
                await axios.post(`${API_URL}/auth/address`, addressForm, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Address added successfully!");
            }
            // Refresh user profile to get updated addresses
            window.location.reload();
        } catch (error) {
            console.error("Address error:", error);
            alert("Failed to save address");
        }
    };

    const deleteAddress = async (id) => {
        if (!confirm("Delete this address?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/auth/address/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            window.location.reload();
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete address");
        }
    };

    const openEditAddress = (addr) => {
        setEditingAddress(addr);
        setAddressForm(addr);
        setShowAddressForm(true);
    };

    if (!user) {
        return <div className="text-center text-white pt-20">Please log in to view your profile.</div>;
    }

    return (
        <div className="min-h-screen bg-brand-black pt-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-brand-dark rounded-2xl border border-gray-800 p-8 shadow-glow mb-8"
                >
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-brand-green relative">
                                {uploading ? (
                                    <Loader className="animate-spin text-brand-green" size={32} />
                                ) : user.photoURL ? (
                                    <img src={user.photoURL} alt={user.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={48} className="text-gray-400" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-brand-green text-black p-2 rounded-full cursor-pointer hover:bg-white transition-colors shadow-lg">
                                <Camera size={16} />
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                />
                            </label>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            {isEditingName ? (
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700 focus:border-brand-green outline-none"
                                    />
                                    <button onClick={handleNameUpdate} className="text-brand-green hover:text-white"><Check size={20} /></button>
                                    <button onClick={() => setIsEditingName(false)} className="text-red-500 hover:text-white"><X size={20} /></button>
                                </div>
                            ) : (
                                <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-3 group">
                                    {user.full_name || 'User'}
                                    <button onClick={() => { setNewName(user.full_name || ''); setIsEditingName(true); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-brand-green">
                                        <Edit size={18} />
                                    </button>
                                </h1>
                            )}
                            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 mb-4">
                                <Mail size={16} />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <span className="px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-sm font-medium border border-brand-green/20">
                                    {user.role === 'admin' ? 'Administrator' : 'Member'}
                                </span>
                                <button
                                    onClick={logout}
                                    className="px-4 py-1 rounded-full border border-red-500/50 text-red-400 text-sm hover:bg-red-500/10 transition-colors flex items-center gap-2"
                                >
                                    <LogOut size={14} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-2">
                        <Package className="text-brand-green" />
                        Order History
                    </h2>

                    {/* Order History */}
                    {loadingOrders ? (
                        <div className="text-center text-gray-400 py-10">Loading orders...</div>
                    ) : orders.length === 0 ? (
                        <div className="bg-brand-dark rounded-xl border border-gray-800 p-8 text-center">
                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package size={32} className="text-gray-600" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">No orders yet</h3>
                            <p className="text-gray-400 mb-6">Looks like you haven't made any purchases yet.</p>
                            <a href="/products" className="inline-block bg-brand-green text-black font-bold px-8 py-3 rounded-full hover:bg-white transition-all">
                                Start Shopping
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.slice(0, visibleOrdersCount).map(order => (
                                <div key={order.id} className="bg-brand-dark p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row justify-between gap-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-lg">Order #{order.id.slice(-6).toUpperCase()}</h3>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                                                order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-gray-700 text-gray-300'
                                                }`}>
                                                {order.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-1">Date: {new Date(order.created).toLocaleDateString()}</p>
                                        <p className="text-gray-400 text-sm mb-2">Total: ₹{order.total_amount}</p>
                                        <div className="text-xs text-gray-500 mb-2 bg-gray-800/50 p-2 rounded">
                                            <p className="font-bold text-gray-400">Shipped to:</p>
                                            <p>{order.address?.fullName}</p>
                                            <p>{order.address?.addressLine1}, {order.address?.city}</p>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            {order.products.map((p, i) => (
                                                <img key={i} src={p.image || '/hero-mock.png'} className="w-10 h-10 rounded object-cover border border-gray-700" title={p.name} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end justify-center gap-2">
                                        <span className="text-sm text-gray-400">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                                        {order.status !== 'created' && order.status !== 'cancelled' && (
                                            <button
                                                onClick={() => trackOrder(order.id)}
                                                className="text-sm text-brand-green hover:text-white border border-brand-green/30 px-3 py-1 rounded-full hover:bg-brand-green/10 transition-colors flex items-center gap-1"
                                            >
                                                <MapPin size={14} /> Track Order
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {orders.length > 2 && (
                                <div className="text-center mt-6 pt-4 border-t border-gray-800">
                                    {visibleOrdersCount < orders.length ? (
                                        <button
                                            onClick={() => setVisibleOrdersCount(orders.length)}
                                            className="text-brand-green hover:text-white font-bold text-sm transition-colors"
                                        >
                                            Show More Orders ({orders.length - visibleOrdersCount} more)
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setVisibleOrdersCount(2)}
                                            className="text-gray-400 hover:text-white font-bold text-sm transition-colors"
                                        >
                                            Show Less
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                            <MapPin className="text-brand-green" />
                            Saved Addresses
                        </h2>
                        <button
                            onClick={() => {
                                setEditingAddress(null);
                                setAddressForm({ fullName: '', phone: '', email: '', addressLine1: '', city: '', state: '', pincode: '', isDefault: false });
                                setShowAddressForm(true);
                            }}
                            className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                        >
                            <Plus size={16} /> Add New
                        </button>
                    </div>

                    {showAddressForm && (
                        <div className="bg-brand-dark rounded-xl border border-gray-800 p-6 mb-6">
                            <h3 className="font-bold mb-4">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                            <form onSubmit={handleAddressSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="Full Name" className="input-field" value={addressForm.fullName} onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })} required />
                                    <input placeholder="Phone" className="input-field" value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} required />
                                </div>
                                <input placeholder="Email" className="input-field w-full" value={addressForm.email} onChange={e => setAddressForm({ ...addressForm, email: e.target.value })} required />
                                <input placeholder="Address Line 1" className="input-field w-full" value={addressForm.addressLine1} onChange={e => setAddressForm({ ...addressForm, addressLine1: e.target.value })} required />
                                <div className="grid grid-cols-3 gap-4">
                                    <input placeholder="City" className="input-field" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} required />
                                    <input placeholder="State" className="input-field" value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} required />
                                    <input placeholder="Pincode" className="input-field" value={addressForm.pincode} onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })} required />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })} />
                                    <label className="text-sm text-gray-400">Set as default address</label>
                                </div>
                                <div className="flex gap-3">
                                    <button type="submit" className="btn-primary py-2 px-6">Save Address</button>
                                    <button type="button" onClick={() => setShowAddressForm(false)} className="btn-secondary py-2 px-6">Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                        {user.addresses?.map((addr, idx) => (
                            <div key={idx} className="bg-brand-dark p-6 rounded-2xl border border-gray-800 relative group">
                                {addr.isDefault && <span className="absolute top-4 right-4 bg-brand-green/20 text-brand-green text-xs px-2 py-1 rounded">Default</span>}
                                <h4 className="font-bold text-lg mb-1">{addr.fullName}</h4>
                                <p className="text-gray-400 text-sm">{addr.addressLine1}</p>
                                <p className="text-gray-400 text-sm">{addr.city}, {addr.state} - {addr.pincode}</p>
                                <p className="text-gray-400 text-sm mt-2">Phone: {addr.phone}</p>

                                <div className="mt-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditAddress(addr)} className="text-sm text-brand-green hover:underline flex items-center gap-1"><Edit size={14} /> Edit</button>
                                    <button onClick={() => deleteAddress(addr.id)} className="text-sm text-red-500 hover:underline flex items-center gap-1"><Trash2 size={14} /> Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Tracking Modal */}
            {showTrackingModal && trackingData && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-brand-dark rounded-2xl border border-gray-800 p-6 max-w-md w-full relative">
                        <button
                            onClick={() => setShowTrackingModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-xl font-bold mb-1">Track Shipment</h3>
                        <p className="text-sm text-gray-400 mb-6">AWB: {trackingData.awb || 'N/A'}</p>

                        <div className="space-y-6 relative pl-4 border-l-2 border-gray-800 ml-2">
                            {trackingData.events?.map((event, idx) => (
                                <div key={idx} className="relative pl-6">
                                    <div className={`absolute -left-[21px] top-0 w-4 h-4 rounded-full border-2 ${idx === 0 ? 'bg-brand-green border-brand-green' : 'bg-brand-dark border-gray-600'}`} />
                                    <p className="font-bold text-white">{event.status}</p>
                                    <p className="text-sm text-gray-400">{event.location}</p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(event.time).toLocaleString()}</p>
                                </div>
                            ))}

                            {(!trackingData.events || trackingData.events.length === 0) && (
                                <p className="text-gray-500 italic pl-6">No tracking updates available yet.</p>
                            )}
                        </div>

                        <div className="mt-8 pt-4 border-t border-gray-800 text-center">
                            <p className="text-brand-green font-bold text-lg">{trackingData.current_status}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
