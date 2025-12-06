import React from 'react'
import ProductCard from './ProductCard'
import { motion } from 'framer-motion'

const container = { show: { transition: { staggerChildren: 0.06 } } }

export default function ProductGrid({products}){
  return (
    <motion.div variants={container} initial="hidden" animate="show" className='max-w-6xl mx-auto p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
      {products.map(p => <ProductCard key={p._id} product={p} />)}
    </motion.div>
  )
}
