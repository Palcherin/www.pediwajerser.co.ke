import React, { useState } from 'react';
import ProductCard from '../../Components/products/ProductCard';
import { allProducts } from '../../data/AllProducts';


// const newSeasonProducts = allProducts.filter(p => p.category === 'new-season');
// Add this above the component
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `http://localhost:5000${path}`;
};

// Then pass it to ProductCard or use it when building product data:
const newSeasonProducts = allProducts
  .filter(p => p.categorySlug === 'new-season' || p.category?.slug === 'new-season')
  .slice(0, 8)
  .map(p => ({
    ...p,
    // ✅ Resolve image URLs before passing to ProductCard
    images: (p.images || []).map(getImageUrl),
    image:  p.images?.[0] ? getImageUrl(p.images[0]) : null,
  }));

const NewSeason = () => {
  const [sortOption, setSortOption] = useState('newest');

  return (
    <div className="bg-white">
      {/* Category Hero Banner */}
      <div className="relative h-[380px] bg-gradient-to-r from-emerald-800 to-emerald-900 flex items-center">
        <div className="max-w-7xl mx-auto px-6 text-white">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
            New Season 2025/26
          </h1>
          <p className="text-xl md:text-2xl text-emerald-100 max-w-lg">
            Fresh kits, boots, and gear. Be the first to play in the latest drops.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-6 lg:px-8 py-12">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">All New Season Items</h2>
            <p className="text-gray-600 mt-1">{newSeasonProducts.length} products</p>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-gray-300 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {newSeasonProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Load More Button */}
        <div className="flex justify-center mt-16">
          <button className="px-10 py-4 bg-gray-900 hover:bg-black text-white font-semibold rounded-2xl transition-all duration-200 flex items-center gap-3">
            Load More Products
            <span>↓</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewSeason;