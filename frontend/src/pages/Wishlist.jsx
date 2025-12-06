import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useWishlist } from '../context/WishlistContext'

export default function Wishlist() {
    const { wishlist, removeFromWishlist } = useWishlist()

    return (
        <div className='min-h-screen pt-20 pb-10 px-4 max-w-7xl mx-auto'>
            <h1 className='text-4xl font-display font-bold mb-8 flex items-center gap-3'>
                <Heart className='text-brand-green fill-brand-green' size={32} />
                Your Wishlist
            </h1>

            {wishlist.length === 0 ? (
                <div className='text-center py-20'>
                    <p className='text-gray-500 text-xl mb-6'>Your wishlist is empty.</p>
                    <Link to='/products' className='btn-primary'>Explore Collection</Link>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {wishlist.map(item => (
                        <motion.div
                            key={item.id || item._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className='card p-4 flex gap-4 items-center'
                        >
                            <Link to={`/product/${item.id || item._id}`} className="shrink-0">
                                <img src={item.images?.[0] || '/hero-mock.png'} alt={item.name} className='w-24 h-24 object-cover rounded-xl' />
                            </Link>
                            <div className='flex-1'>
                                <Link to={`/product/${item.id || item._id}`}>
                                    <h3 className='font-bold text-lg hover:text-brand-green transition-colors'>{item.name}</h3>
                                </Link>
                                <p className='text-brand-green font-bold mt-1'>₹{item.price}</p>
                            </div>
                            <div className='flex flex-col gap-2'>
                                <Link to={`/product/${item.id || item._id}`} className='p-2 bg-brand-green text-black rounded-full hover:shadow-glow transition-all flex items-center justify-center'>
                                    <ShoppingBag size={18} />
                                </Link>
                                <button
                                    onClick={() => removeFromWishlist(item.id || item._id)}
                                    className='p-2 bg-gray-800 text-red-500 rounded-full hover:bg-red-500/10 transition-all'
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
