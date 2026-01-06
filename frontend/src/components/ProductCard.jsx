import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

const cardVar = { hover: { scale: 1.02 } }

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  const isWishlisted = isInWishlist(product.id || product._id)
  const cutPrice = Number(product.price) + 300

  const handleAddToCart = (e) => {
    e.preventDefault() // Prevent navigation if wrapped in Link
    e.stopPropagation()

    // Default to first variant or generic
    const defaultVariant = product.variants?.[0] || { color: 'Black', size: 'S' }

    addToCart(product, defaultVariant)
    alert(`Added to cart: ${product.name}`)
  }

  const toggleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (isWishlisted) {
      removeFromWishlist(product.id || product._id)
    } else {
      addToWishlist(product)
    }
  }

  return (
    <Link to={`/product/${product.id || product._id}`} className='block'>
      <motion.div variants={cardVar} whileHover="hover" className='card p-4 group relative h-full'>
        <div className='relative overflow-hidden rounded-xl'>
          <img src={product.images?.[0] || '/mizardo-logo.svg'} alt={product.name} className='w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110' />
          <button
            onClick={toggleWishlist}
            className='absolute top-3 right-3 bg-black/40 backdrop-blur-md p-2 rounded-full hover:bg-brand-green hover:text-white transition-colors z-10'
          >
            <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} className={isWishlisted ? "text-brand-green" : "text-white"} />
          </button>
          {/* Quick Add Overlay */}
          <div className='absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10'>
            <button
              onClick={handleAddToCart}
              className='w-full bg-brand-green text-white font-bold py-3 rounded-xl shadow-lg hover:bg-brand-neon transition-colors'
            >
              Add to Cart
            </button>
          </div>
        </div>

        <div className='mt-4'>
          <h3 className='text-lg font-bold font-display tracking-tight truncate'>{product.name}</h3>
          <div className='mt-2 flex items-baseline gap-2'>
            <span className='text-xl font-bold text-brand-green'>₹{product.price}</span>
            <span className='line-through text-sm text-gray-500'>₹{cutPrice}</span>
            <span className='text-xs font-bold text-brand-neon bg-brand-green/10 px-2 py-1 rounded-full'>
              {Math.round(((cutPrice - product.price) / cutPrice) * 100)}% OFF
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
