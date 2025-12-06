import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Heart, ShoppingBag, Check, Star, MessageSquare } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { addToCart: addToCartContext } = useCart()

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`${API_URL}/products/${id}`)
        setProduct(res.data)
        // Set default variants if available
        if (res.data.variants && res.data.variants.length > 0) {
          setSelectedColor(res.data.variants[0].color)
          setSelectedSize(res.data.variants[0].size)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const isWishlisted = product ? isInWishlist(product.id || product._id) : false

  const addToCart = () => {
    if (!selectedColor || !selectedSize) {
      alert("Please select color and size")
      return
    }

    addToCartContext(product, { color: selectedColor, size: selectedSize })
    // TODO: Replace with Toast
    alert(`Added to cart: ${product.name} (${selectedColor}, ${selectedSize})`)
  }

  const toggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id || product._id)
    } else {
      addToWishlist(product)
    }
  }

  if (loading) return <div className='min-h-screen flex items-center justify-center text-brand-green'>Loading...</div>
  if (!product) return <div className='min-h-screen flex items-center justify-center text-red-500'>Product not found</div>

  // Extract unique colors and sizes from variants
  const uniqueColors = [...new Set(product.variants?.map(v => v.color))]
  const uniqueSizes = [...new Set(product.variants?.map(v => v.size))]

  // Fallback if no variants defined (legacy products)
  const colors = uniqueColors.length ? uniqueColors : ['Black']
  const sizes = uniqueSizes.length ? uniqueSizes : ['S', 'M', 'L', 'XL']

  return (
    <div className='max-w-7xl mx-auto p-8 grid md:grid-cols-2 gap-12'>
      {/* Image Gallery */}
      <div className='space-y-4'>
        <div className='bg-brand-dark rounded-3xl overflow-hidden border border-gray-800 shadow-2xl aspect-[4/5] relative group'>
          <img
            src={product.images?.[0] || '/hero-mock.png'}
            alt={product.name}
            className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
          />
          <button
            onClick={toggleWishlist}
            className='absolute top-4 right-4 bg-black/50 backdrop-blur-md p-3 rounded-full hover:bg-brand-green hover:text-white transition-all duration-300 group-hover:opacity-100'
          >
            <Heart size={24} fill={isWishlisted ? "currentColor" : "none"} className={isWishlisted ? "text-brand-green" : "text-white"} />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className='flex flex-col justify-center'>
        <div className='mb-6'>
          {product.tags?.map(tag => (
            <span key={tag} className='inline-block bg-brand-green/10 text-brand-green text-xs font-bold px-3 py-1 rounded-full mb-4 mr-2 border border-brand-green/20'>
              {tag}
            </span>
          ))}
          <h1 className='text-5xl font-display font-bold mb-4 leading-tight'>{product.name}</h1>
          <p className='text-gray-400 text-lg leading-relaxed mb-6'>{product.description}</p>

          <div className='flex items-baseline gap-4 mb-8'>
            <span className='text-4xl font-bold text-white'>₹{product.price}</span>
            {product.mrp > product.price && (
              <>
                <span className='text-xl text-gray-500 line-through'>₹{product.mrp}</span>
                <span className='text-brand-green font-bold text-sm bg-brand-green/10 px-2 py-1 rounded'>
                  {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                </span>
              </>
            )}
          </div>
        </div>

        {/* Variants */}
        <div className='space-y-8 mb-10'>
          {/* Color Selector */}
          <div>
            <h3 className='text-sm font-bold text-gray-400 uppercase tracking-wider mb-4'>Select Color</h3>
            <div className='flex gap-4'>
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${selectedColor === color ? 'border-brand-green shadow-glow scale-110' : 'border-transparent hover:border-gray-600'}`}
                  style={{ backgroundColor: color.toLowerCase() === 'black' ? '#000' : color.toLowerCase() }}
                  title={color}
                >
                  {selectedColor === color && <Check size={16} className="text-white mix-blend-difference" />}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <h3 className='text-sm font-bold text-gray-400 uppercase tracking-wider mb-4'>Select Size</h3>
            <div className='flex flex-wrap gap-3'>
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[3rem] h-12 px-4 rounded-xl font-bold border transition-all duration-300 ${selectedSize === size ? 'bg-brand-green border-brand-green text-black shadow-glow' : 'bg-brand-dark border-gray-700 text-gray-400 hover:border-gray-500'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex gap-4'>
          <button
            onClick={addToCart}
            className='flex-1 btn-primary flex items-center justify-center gap-3 text-lg'
          >
            <ShoppingBag size={20} />
            Add to Cart
          </button>
          <button className='flex-1 btn-secondary text-lg'>
            Buy Now
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="col-span-1 md:col-span-2 mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <MessageSquare className="text-brand-green" /> Customer Reviews
        </h2>
        <Reviews productId={id} user={user} />
      </div>
    </div>
  )
}

function Reviews({ productId, user }) {
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_URL}/reviews/${productId}`)
      setReviews(res.data)
    } catch (error) {
      console.error("Failed to fetch reviews")
    }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!user) return alert("Please login to review")

    try {
      await axios.post(`${API_URL}/reviews`, {
        product_id: productId,
        user_id: user.uid,
        user_name: user.full_name,
        rating,
        comment
      })
      setComment('')
      fetchReviews()
    } catch (error) {
      alert("Failed to submit review")
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-12">
      {/* Review Form */}
      <div className="bg-brand-dark p-6 rounded-2xl border border-gray-800 h-fit">
        <h3 className="text-xl font-bold mb-4">Write a Review</h3>
        {user ? (
          <form onSubmit={submitReview} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`}
                  >
                    <Star fill={star <= rating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="input-field w-full h-32 resize-none"
                placeholder="Share your thoughts..."
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full py-3">Submit Review</button>
          </form>
        ) : (
          <div className="text-center py-10 text-gray-400">
            Please <a href="/login" className="text-brand-green underline">login</a> to write a review.
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-gray-500 italic">No reviews yet. Be the first!</p>
        ) : (
          reviews.map(review => (
            <div key={review._id} className="bg-brand-dark p-6 rounded-2xl border border-gray-800">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold">{review.user_name}</p>
                  <div className="flex text-yellow-400 text-xs mt-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={12} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-500">{new Date(review.created).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-300 text-sm mt-2">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
