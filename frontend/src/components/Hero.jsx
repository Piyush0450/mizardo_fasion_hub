import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProductCarousel from './ProductCarousel'

const left = {
  hidden: { x: -60, opacity: 0 },
  show: { x: 0, opacity: 1, transition: { duration: 0.7 } }
}
const right = {
  hidden: { scale: 0.95, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { duration: 0.8 } }
}

export default function Hero() {
  return (
    <section className='max-w-6xl mx-auto p-8 grid md:grid-cols-2 gap-8 items-center'>
      <motion.div variants={left} initial="hidden" animate="show">
        <h1 className='text-4xl sm:text-5xl md:text-7xl font-display font-extrabold leading-tight tracking-tight'>
          Elevate your <br />
          <span className='text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-brand-neon'>COMFORT</span>
        </h1>
        <p className='mt-6 text-gray-400 text-lg max-w-lg'>
          Luxury hoodies and sweatshirts crafted for everyday life.
          Minimal aesthetic, <span className='text-white font-semibold'>premium feel</span>.
        </p>
        <div className='mt-8 flex gap-4'>
          <Link to="/products" className='btn-primary inline-block text-center'>Shop Collection</Link>
          <Link to="/about" className='btn-secondary inline-block text-center'>View Lookbook</Link>
        </div>
      </motion.div>
      <motion.div variants={right} initial="hidden" animate="show" className='flex justify-center'>
        <ProductCarousel />
      </motion.div>
    </section>
  )
}
