import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CheckoutPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [orderId, setOrderId] = useState('');

    // Dummy Order Data
    const orderData = {
        id: `MIZ-${Math.floor(Math.random() * 10000)}`,
        amount: 1299, // in Rupees
        items: [
            { name: 'Premium Hoodie', price: 1299, qty: 1 }
        ]
    };

    useEffect(() => {
        // Dynamically load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
            console.log('Razorpay SDK loaded');
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePayment = async () => {
        setLoading(true);
        setError(null);

        try {
            // 1. Create Order on Backend
            const { data } = await axios.post('http://localhost:8000/api/payments/create-order', {
                orderId: orderData.id,
                amount: orderData.amount
            });

            console.log('Order Created:', data);

            // 2. Open Razorpay Checkout
            const options = {
                key: data.razorpay_key_id,
                amount: data.amount,
                currency: data.currency,
                name: "Mizardo Fashion Hub",
                description: "Order Payment",
                order_id: data.razorpay_order_id,
                handler: async function (response) {
                    console.log('Payment Success:', response);
                    await verifyPayment(response, orderData.id);
                },
                prefill: {
                    name: "Test User",
                    email: "test@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#1DB954" // Spotify Green
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                console.error('Payment Failed:', response.error);
                setError(`Payment Failed: ${response.error.description}`);
                setLoading(false);
            });

            rzp1.open();

        } catch (err) {
            console.error('Error initiating payment:', err);
            setError('Failed to initiate payment. Please try again.');
            setLoading(false);
        }
    };

    const verifyPayment = async (paymentData, orderId) => {
        try {
            const { data } = await axios.post('http://localhost:8000/api/payments/verify', {
                razorpay_order_id: paymentData.razorpay_order_id,
                razorpay_payment_id: paymentData.razorpay_payment_id,
                razorpay_signature: paymentData.razorpay_signature,
                orderId: orderId
            });

            if (data.success) {
                setSuccess(true);
                setOrderId(data.orderId);
            } else {
                setError('Payment verification failed.');
            }
        } catch (err) {
            console.error('Verification Error:', err);
            setError('Payment verification failed on server.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-green-500/30">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-green-400 mb-2">Payment Successful!</h2>
                    <p className="text-gray-400 mb-6">Order ID: {orderId}</p>
                    <p className="text-gray-500 text-sm">Thank you for your purchase.</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="mt-6 w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-full transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-800">
                <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                    Checkout
                </h1>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                        <span className="text-gray-400">Product</span>
                        <span className="font-medium">Total</span>
                    </div>
                    {orderData.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                            <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                            </div>
                            <span>₹{item.price}</span>
                        </div>
                    ))}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-800 text-xl font-bold">
                        <span>Total Amount</span>
                        <span className="text-green-400">₹{orderData.amount}</span>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className={`w-full py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 ${loading
                            ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                            : 'bg-green-500 hover:bg-green-400 text-black shadow-lg shadow-green-500/20'
                        }`}
                >
                    {loading ? 'Processing...' : 'Pay with Razorpay'}
                </button>

                <p className="text-center text-gray-600 text-xs mt-4">
                    Secured by Razorpay
                </p>
            </div>
        </div>
    );
};

export default CheckoutPage;
