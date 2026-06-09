import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../../Components/products/ProductCard';
import { allProducts } from '../../data/AllProducts';


const categoryConfigs = {
  'new-season': {
    title: 'New Season 2025/26',
    subtitle: 'Fresh kits, boots & gear. Be the first to play in the latest drops.',
    heroColor: 'from-emerald-900/80 to-emerald-800/60',
    heroImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1600&q=80',
  },
  'retro-kits': {
    title: 'Retro Kits',
    subtitle: 'Classic football jerseys from the golden eras.',
    heroColor: 'from-amber-900/80 to-orange-800/60',
    heroImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1600&q=80',
  },
  'footwear': {
    title: 'Footwear',
    subtitle: 'Premium boots and trainers for every pitch and street.',
    heroColor: 'from-blue-900/80 to-indigo-800/60',
    heroImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&q=80',
  },
  'backpacks': {
    title: 'Backpacks & Bags',
    subtitle: 'Durable training and matchday bags built for champions.',
    heroColor: 'from-teal-900/80 to-cyan-800/60',
    heroImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1600&q=80',
  },
};

const CategoryPage = () => {
  const { slug } = useParams();
  const [sortOption, setSortOption] = useState('newest');

  const config = categoryConfigs[slug] || {
    title: slug ? slug.replace('-', ' ').toUpperCase() : 'All Products',
    subtitle: 'Discover premium sports equipment',
    heroColor: 'from-emerald-800 to-emerald-900',
  };

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = allProducts.filter(product =>
      product.category === slug || product.slug === slug
    );

    const sorted = [...filtered];

    if (sortOption === 'price-low') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'discount') {
      sorted.sort((a, b) => {
        const discA = ((a.oldPrice - a.price) / a.oldPrice) * 100;
        const discB = ((b.oldPrice - b.price) / b.oldPrice) * 100;
        return discB - discA;
      });
    }

    return sorted;
  }, [slug, sortOption]);

  return (
    <div className="bg-white">
      <div
  className="relative h-[360px] flex items-center"
  style={{
    backgroundImage: `url(${config.heroImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
  {/* Gradient overlay for text legibility */}
  <div className={`absolute inset-0 bg-gradient-to-r ${config.heroColor}`} />

  {/* Content sits above the overlay */}
  <div className="relative z-10 max-w-7xl mx-auto px-6 text-white">
    <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
      {config.title}
    </h1>
    <p className="text-xl text-white/90 max-w-lg">
      {config.subtitle}
    </p>
  </div>
</div>

      <div className="max-w-7xl mx-auto px-5 md:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{config.title}</h2>
            <p className="text-gray-600 mt-1">
              {filteredAndSortedProducts.length} products
            </p>
          </div>

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

        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">No products found in this category yet.</p>
            <p className="text-gray-400 mt-2">We're adding more items daily!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;