import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'
import { ShoppingBag, Heart, User } from 'lucide-react'
import { useCart } from '../context/CartContext';

import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart(); // Changed from getCartCount()
  const cartCount = cart.length; // Derived from cart.length
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate(); // Added useNavigate

  const handleLogout = () => { // Added handleLogout
    logout();
    navigate('/login');
  };

  const navItem = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <nav className='fixed w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-black/10 dark:border-white/10 transition-colors duration-300'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-20'>
          {/* Logo */}
          <Link to='/' className='flex items-center gap-2 group'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <img src="/logo.jpg" alt="Mizardo Logo" className="h-16 w-auto object-contain" />
            </motion.div>
            <span className='font-display font-bold text-2xl tracking-tighter text-black dark:text-white group-hover:text-brand-green transition-colors'>
              MIZARDO
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className='hidden md:flex items-center gap-8'>
            <Link to='/products' className='text-sm font-medium hover:text-brand-green transition-colors'>COLLECTION</Link>
            <Link to='/about' className='text-sm font-medium hover:text-brand-green transition-colors'>STORY</Link>

            <div className='flex items-center gap-6 ml-4 pl-6 border-l border-gray-800'>
              {user && <NotificationBell />} {/* Added NotificationBell */}
              <ThemeToggle />

              <Link to='/wishlist' className='hover:text-brand-green transition-colors'>
                <Heart size={20} />
              </Link>

              <Link to='/cart' className='hover:text-brand-green transition-colors relative'>
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-green text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className='flex items-center gap-4'>
                  <Link to={user.role === 'admin' || user.role === 'super_admin' ? '/admin' : '/profile'} className='flex items-center gap-2 hover:text-brand-green transition-colors'>
                    <User size={20} />
                  </Link>
                  <button onClick={logout} className='text-xs border border-gray-600 px-3 py-1 rounded-full hover:border-red-500 hover:text-red-500 transition-all'>
                    Logout
                  </button>
                </div>
              ) : (
                <div className='flex items-center gap-4'>
                  <Link to='/login' className='text-sm font-bold hover:text-brand-green transition-colors'>LOGIN</Link>
                  <Link to='/register' className='bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-brand-green hover:text-white hover:shadow-glow transition-all duration-300'>
                    JOIN
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className='md:hidden flex items-center gap-4'>
            <Link to='/cart' className='hover:text-brand-green transition-colors relative mr-2'>
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-green text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className='text-black dark:text-white focus:outline-none'>
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className='md:hidden bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-black/10 dark:border-white/10'
        >
          <div className='px-4 pt-2 pb-6 space-y-4'>
            <Link to='/products' onClick={() => setIsMobileMenuOpen(false)} className='block text-lg font-medium hover:text-brand-green transition-colors py-2 border-b border-gray-800'>COLLECTION</Link>
            <Link to='/about' onClick={() => setIsMobileMenuOpen(false)} className='block text-lg font-medium hover:text-brand-green transition-colors py-2 border-b border-gray-800'>STORY</Link>
            <Link to='/wishlist' onClick={() => setIsMobileMenuOpen(false)} className='block text-lg font-medium hover:text-brand-green transition-colors py-2 border-b border-gray-800'>WISHLIST</Link>

            <div className="flex items-center justify-between py-2 border-b border-gray-800">
              <span className="text-lg font-medium">Theme</span>
              <ThemeToggle />
            </div>

            {user ? (
              <div className='pt-2 space-y-3'>
                <Link to={user.role === 'admin' || user.role === 'super_admin' ? '/admin' : '/profile'} onClick={() => setIsMobileMenuOpen(false)} className='flex items-center gap-2 text-lg font-medium hover:text-brand-green transition-colors'>
                  <User size={20} /> My Profile
                </Link>
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className='w-full text-left text-red-500 font-medium py-2'>
                  Logout
                </button>
              </div>
            ) : (
              <div className='grid grid-cols-2 gap-4 pt-2'>
                <Link to='/login' onClick={() => setIsMobileMenuOpen(false)} className='text-center py-3 border border-gray-600 rounded-lg font-bold hover:border-brand-green hover:text-brand-green transition-all'>
                  LOGIN
                </Link>
                <Link to='/register' onClick={() => setIsMobileMenuOpen(false)} className='text-center py-3 bg-white text-black rounded-lg font-bold hover:bg-brand-green hover:shadow-glow transition-all'>
                  JOIN
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  )
}
