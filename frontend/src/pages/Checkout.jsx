import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, Truck, CheckCircle } from 'lucide-react';

export default function Checkout() {
    const { cart, getCartTotal, clearCart } = useCart();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [selectedAddressId, setSelectedAddressId] = useState('new');

    const total = getCartTotal();
    const shipping = total > 499 ? 0 : 99;
    const finalTotal = total + shipping;

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const token = localStorage.getItem('token');

            // 1. Create Order on Backend
            const orderPayload = {
                user_id: user?.uid || 'guest', // Should be real user ID
                products: cart.map(item => ({
                    product_id: item.id || item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    color: item.selectedVariant.color,
                    size: item.selectedVariant.size,
                    image: item.images?.[0]
                })),
                total_amount: finalTotal,
                address: data,
                payment_method: paymentMethod
            };

            const res = await axios.post(`${API_URL}/orders/`, orderPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const order = res.data;

            if (paymentMethod === 'cod') {
                clearCart();
                alert("Order Placed Successfully via Cash on Delivery!");
                navigate('/profile');
                return;
            }

            // 2. Open Razorpay
            const isLoaded = await loadRazorpay();
            if (!isLoaded) {
                alert('Razorpay SDK failed to load');
                setLoading(false);
                return;
            }

            console.log("DEBUG: Order Response:", order);
            const keyId = "rzp_test_RokO9SEU1KkXGY"; // Hardcoded for debugging to ensure no env issues
            console.log("DEBUG: Using Razorpay Key:", keyId);
            console.log("DEBUG: Order ID:", order.razorpay_order_id);

            const options = {
                key: keyId,
                amount: order.total_amount * 100,
                currency: "INR",
                name: "Mizardo Luxury",
                description: "Order Payment",
                order_id: order.razorpay_order_id,
                handler: async function (response) {
                    // 3. Verify Payment
                    try {
                        await axios.post(`${API_URL}/orders/payment/verify`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            order_db_id: order.id
                        });

                        clearCart();
                        alert("Payment Successful! Order Placed.");
                        navigate('/profile'); // Or order success page
                    } catch (error) {
                        alert("Payment Verification Failed");
                    }
                },
                prefill: {
                    name: user?.full_name || data.fullName,
                    email: user?.email || data.email,
                    contact: data.phone
                },
                theme: {
                    color: "#1DB954"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error("Checkout Error:", error);
            alert("Checkout Failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return <div className="pt-24 text-center text-white">Loading...</div>;
    }

    if (cart.length === 0) {
        return <div className="pt-24 text-center">Cart is empty</div>;
    }

    return (
        <div className="min-h-screen pt-24 pb-10 px-4 max-w-7xl mx-auto">
            <h1 className="text-4xl font-display font-bold mb-8">Checkout</h1>

            <div className="grid lg:grid-cols-2 gap-12">
                {/* Address Form */}
                <div className="bg-brand-dark p-8 rounded-3xl border border-gray-800">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <Truck className="text-brand-green" /> Shipping Address
                    </h2>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <Truck className="text-brand-green" /> Shipping Address
                    </h2>

                    {user?.addresses?.length > 0 && (
                        <div className="mb-6 grid gap-4">
                            {user.addresses.map(addr => (
                                <label key={addr.id} className={`cursor-pointer border p-4 rounded-xl flex items-start gap-3 transition-all ${selectedAddressId === addr.id ? 'border-brand-green bg-brand-green/10' : 'border-gray-700 hover:border-gray-600'}`}>
                                    <input
                                        type="radio"
                                        name="addressSelection"
                                        value={addr.id}
                                        checked={selectedAddressId === addr.id}
                                        onChange={() => {
                                            setSelectedAddressId(addr.id);
                                            setValue('fullName', addr.fullName);
                                            setValue('phone', addr.phone);
                                            setValue('email', addr.email);
                                            setValue('addressLine1', addr.addressLine1);
                                            setValue('city', addr.city);
                                            setValue('state', addr.state);
                                            setValue('pincode', addr.pincode);
                                        }}
                                        className="mt-1"
                                    />
                                    <div>
                                        <p className="font-bold">{addr.fullName}</p>
                                        <p className="text-sm text-gray-400">{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                                        <p className="text-sm text-gray-400">Phone: {addr.phone}</p>
                                    </div>
                                </label>
                            ))}
                            <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-3 transition-all ${selectedAddressId === 'new' ? 'border-brand-green bg-brand-green/10' : 'border-gray-700 hover:border-gray-600'}`}>
                                <input
                                    type="radio"
                                    name="addressSelection"
                                    value="new"
                                    checked={selectedAddressId === 'new'}
                                    onChange={() => {
                                        setSelectedAddressId('new');
                                        setValue('fullName', '');
                                        setValue('phone', '');
                                        setValue('email', '');
                                        setValue('addressLine1', '');
                                        setValue('city', '');
                                        setValue('state', '');
                                        setValue('pincode', '');
                                    }}
                                />
                                <span className="font-bold">Use a new address</span>
                            </label>
                        </div>
                    )}

                    <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                                <input {...register("fullName", { required: true })} className="input-field w-full" placeholder="John Doe" />
                                {errors.fullName && <span className="text-red-500 text-xs">Required</span>}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Phone</label>
                                <input {...register("phone", { required: true })} className="input-field w-full" placeholder="+91 9876543210" />
                                {errors.phone && <span className="text-red-500 text-xs">Required</span>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Email</label>
                            <input {...register("email", { required: true })} className="input-field w-full" placeholder="john@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Address Line 1</label>
                            <input {...register("addressLine1", { required: true })} className="input-field w-full" placeholder="Flat, House no., Building, Company, Apartment" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">City</label>
                                <input {...register("city", { required: true })} className="input-field w-full" placeholder="Mumbai" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Pincode</label>
                                <input {...register("pincode", { required: true })} className="input-field w-full" placeholder="400001" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">State</label>
                            <input {...register("state", { required: true })} className="input-field w-full" placeholder="Maharashtra" />
                        </div>

                        <div className="pt-4">
                            <label className="block text-sm text-gray-400 mb-3">Payment Method</label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-3 transition-all ${paymentMethod === 'razorpay' ? 'border-brand-green bg-brand-green/10' : 'border-gray-700 hover:border-gray-600'}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="razorpay"
                                        checked={paymentMethod === 'razorpay'}
                                        onChange={() => setPaymentMethod('razorpay')}
                                        className="hidden"
                                    />
                                    <CreditCard className={paymentMethod === 'razorpay' ? 'text-brand-green' : 'text-gray-400'} />
                                    <span className={paymentMethod === 'razorpay' ? 'text-white font-bold' : 'text-gray-400'}>Online Payment</span>
                                </label>

                                <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-3 transition-all ${paymentMethod === 'cod' ? 'border-brand-green bg-brand-green/10' : 'border-gray-700 hover:border-gray-600'}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={() => setPaymentMethod('cod')}
                                        className="hidden"
                                    />
                                    <Truck className={paymentMethod === 'cod' ? 'text-brand-green' : 'text-gray-400'} />
                                    <span className={paymentMethod === 'cod' ? 'text-white font-bold' : 'text-gray-400'}>Cash on Delivery</span>
                                </label>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="space-y-6">
                    <div className="bg-brand-dark p-8 rounded-3xl border border-gray-800">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <CheckCircle className="text-brand-green" /> Order Summary
                        </h2>
                        <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {cart.map(item => (
                                <div key={item.cartItemId} className="flex gap-4 items-center">
                                    <img src={item.images?.[0]} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                                    <div className="flex-1">
                                        <p className="font-bold text-sm">{item.name}</p>
                                        <p className="text-xs text-gray-400">{item.selectedVariant.color} / {item.selectedVariant.size} x {item.quantity}</p>
                                    </div>
                                    <p className="font-bold">₹{item.price * item.quantity}</p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-700 pt-4 space-y-2">
                            <div className="flex justify-between text-gray-400">
                                <span>Subtotal</span>
                                <span>₹{total}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Shipping</span>
                                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-white pt-2">
                                <span>Total</span>
                                <span>₹{finalTotal}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            form="checkout-form"
                            disabled={loading}
                            className="w-full mt-6 btn-primary py-4 text-lg flex items-center justify-center gap-2"
                        >
                            {loading ? 'Processing...' : <>{paymentMethod === 'cod' ? <Truck size={20} /> : <CreditCard size={20} />} {paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
