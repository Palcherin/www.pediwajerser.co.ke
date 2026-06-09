import React from 'react'
import { FaWhatsapp } from 'react-icons/fa'

const ProductPage = () => {
  return (
    <div className='max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-12'>
      <img
        src='https://images.unsplash.com/photo-1517466787929-bc90951d0974'
        className='rounded-2xl'
      />

      <div>
        <h1 className='text-4xl font-bold'>Manchester United Kit</h1>

        <div className='flex items-center gap-4 mt-4'>
          <span className='text-primary text-3xl font-bold'>Ksh 2200</span>
          <span className='line-through text-gray-400'>Ksh 3000</span>
        </div>
        <p className='mt-6 text-gray-700'>
          Experience the thrill of playing for your favorite team with this authentic Manchester United kit. Designed for comfort and performance, it's perfect for matches and training.
        </p>
        <div className='mt-8'>
          <button className='bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors'>
            Add to Cart
          </button>
          <button className='ml-4 border border-primary text-primary py-3 px-6 rounded-lg hover:bg-primary hover:text-white transition-colors'>
            <FaWhatsapp className='inline mr-2' />
            Chat on WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductPage