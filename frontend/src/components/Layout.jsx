import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="min-h-screen bg-brand-light-bg dark:bg-brand-black text-brand-light-text dark:text-white font-sans selection:bg-brand-green selection:text-black flex flex-col transition-colors duration-300">
      <Navbar />
      <main className='flex-grow pt-20'>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
