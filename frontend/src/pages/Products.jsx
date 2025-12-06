import React, {useEffect, useState} from 'react'
import ProductGrid from '../components/ProductGrid'
import axios from 'axios'

export default function Products(){
  const [products,setProducts]=useState([])
  useEffect(()=>{
    async function load(){
      try{
        const url = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
        const res = await axios.get(url + '/products')
        setProducts(res.data || [])
      }catch(e){
        console.error(e)
        setProducts([])
      }
    }
    load()
  },[])
  return (
    <div className='py-8'>
      <h2 className='max-w-6xl mx-auto px-8 text-3xl font-bold'>All Products</h2>
      <ProductGrid products={products} />
    </div>
  )
}
