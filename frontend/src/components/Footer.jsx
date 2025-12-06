import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className='border-t border-gray-200 dark:border-gray-800 mt-20 bg-brand-light-bg dark:bg-brand-black transition-colors duration-300'>
      <div className='max-w-7xl mx-auto p-8 md:p-12'>
        <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
          <div className='text-center md:text-left'>
            <img src="/logo.jpg" alt="Mizardo Logo" className="h-16 w-auto object-contain mx-auto md:mx-0" />
            <p className='text-gray-500 text-sm mt-2'>Elevating everyday comfort.</p>
          </div>
          <div className='flex gap-6 text-sm font-medium text-gray-400'>
            <Link to='/privacy-policy' className='hover:text-brand-green transition-colors'>Privacy Policy</Link>
            <Link to='/terms-of-service' className='hover:text-brand-green transition-colors'>Terms of Service</Link>
            <a href='#' className='hover:text-brand-green transition-colors'>Contact</a>
          </div>
        </div>
        <div className='mt-8 pt-8 border-t border-gray-200 dark:border-gray-900 text-center text-xs text-gray-500 dark:text-gray-600'>
          © {new Date().getFullYear()} Mizardo Fashion Hub. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
