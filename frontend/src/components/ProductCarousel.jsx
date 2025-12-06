import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ProductCarousel() {
    const [products, setProducts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNewProducts() {
            try {
                const url = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
                const res = await axios.get(`${url}/products/new`);
                if (Array.isArray(res.data)) {
                    setProducts(res.data);
                } else {
                    console.error("Invalid products data format:", res.data);
                    setProducts([]);
                }
            } catch (error) {
                console.error("Failed to fetch new products", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        }
        fetchNewProducts();
    }, []);

    useEffect(() => {
        if (products.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % products.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [products]);

    if (loading) return <div className="w-full h-full flex items-center justify-center text-gray-500">Loading...</div>;
    if (!products || products.length === 0) return null;

    const currentProduct = products[currentIndex];
    if (!currentProduct) return null;

    return (
        <div className="relative w-full max-w-md aspect-square mx-auto">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentProduct._id || currentProduct.id}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                >
                    <Link to={`/product/${currentProduct._id || currentProduct.id}`} className="block w-full h-full relative group">
                        <img
                            src={currentProduct.images?.[0] || '/mizardo-logo.svg'}
                            alt={currentProduct.name}
                            className="w-full h-full object-cover rounded-2xl shadow-2xl"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
                            <h3 className="text-white font-bold text-lg truncate">{currentProduct.name}</h3>
                            <p className="text-brand-green font-bold">₹{currentProduct.price}</p>
                        </div>
                    </Link>
                </motion.div>
            </AnimatePresence>

            {/* Indicators */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-2">
                {products.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-brand-green' : 'w-1.5 bg-gray-600'}`}
                    />
                ))}
            </div>
        </div>
    );
}
