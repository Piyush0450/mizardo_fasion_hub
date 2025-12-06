import React, { useEffect, useState } from 'react'
import Hero from '../components/Hero'
import ProductGrid from '../components/ProductGrid'
import axios from 'axios'

export default function Home() {
  const [products, setProducts] = useState([])
  useEffect(() => {
    async function load() {
      try {
        const url = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
        const res = await axios.get(url + '/products/featured')
        setProducts(res.data || [])
      } catch (e) {
        console.error('could not load products', e)
        // fallback sample products
        setProducts([
          { _id: '1', name: 'Classic Black Hoodie', price: 1999, images: ['product1.png'] },
          { _id: '2', name: 'Soft Gray Sweatshirt', price: 1799, images: ['download (1).png'] },
          { _id: '3', name: 'Minimal White Hoodie', price: 2099, images: ['download.png'] }
        ])
      }
    }
    load()
  }, [])
  return (
    <>
      <Hero />
      <section className='py-8'>
        <h2 className='max-w-6xl mx-auto px-8 text-3xl font-bold'>Featured</h2>
        <ProductGrid products={products} />
      </section>
    </>
  )
}
