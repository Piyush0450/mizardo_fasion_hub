import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();

  const total = getCartTotal();
  const shipping = total > 499 ? 0 : 99; // Free shipping over 499
  const finalTotal = total + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center text-center px-4">
        <div className="bg-brand-dark p-8 rounded-full mb-6">
          <ShoppingBag size={64} className="text-brand-green opacity-50" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-400 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Go ahead and explore our top categories.</p>
        <Link to="/products" className="btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 max-w-7xl mx-auto">
      <h1 className="text-4xl font-display font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <motion.div
              key={item.cartItemId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-brand-dark border border-gray-800 rounded-2xl p-4 sm:p-6 flex gap-6 items-center"
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-black rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={item.images?.[0] || '/hero-mock.png'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg sm:text-xl">{item.name}</h3>
                    <p className="text-gray-400 text-sm">{item.selectedVariant.color} / {item.selectedVariant.size}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="text-gray-500 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="flex justify-between items-end mt-4">
                  <div className="flex items-center gap-3 bg-black rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      className="p-2 hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-bold w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      className="p-2 hover:bg-gray-800 rounded-md transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="text-right">
                    {item.mrp > item.price && (
                      <p className="text-sm text-gray-500 line-through">₹{item.mrp * item.quantity}</p>
                    )}
                    <p className="text-xl font-bold text-brand-green">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-brand-dark border border-gray-800 rounded-2xl p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-white font-medium">₹{total}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span className="text-white font-medium">{shipping === 0 ? <span className="text-brand-green">Free</span> : `₹${shipping}`}</span>
              </div>
              <div className="border-t border-gray-700 pt-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg"
            >
              Checkout <ArrowRight size={20} />
            </button>

            <p className="text-xs text-center text-gray-500 mt-4">
              Secure Checkout powered by Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
