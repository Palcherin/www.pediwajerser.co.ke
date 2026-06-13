import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../../Components/products/ProductCard';
import useCustomerTracker from '../../hooks/useCustomerTracker';

const image1 = new URL('../../assets/WhatsApp Image 2026-06-18 at 15.57.10.jpeg', import.meta.url).href;
const image2 = new URL('../../assets/WhatsApp Image 2026-06-16at 15.57.12.jpeg', import.meta.url).href;
const image3 = new URL('../../assets/AC INTER.jpeg', import.meta.url).href;
const image4 = new URL('../../assets/FOOTWARE.jpeg', import.meta.url).href;

const API = 'http://localhost:5000/api';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `http://localhost:5000${path}`;
};

const CATEGORY_CONFIGS = {
  'new-season': {
    title:      'New Season 2025/26',
    subtitle:   'Fresh kits, boots & gear. Be the first to play in the latest drops.',
    heroColor:  'from-emerald-900/80 to-emerald-800/60',
    heroImage:  image1,
  },
  'world-cup': {
    title:      'World Cup',
    subtitle:   'Official kits and gear for the biggest tournament.',
    heroColor:  'from-blue-900/80 to-indigo-800/60',
    heroImage:  image2,
  },
  'retro-kits': {
    title:      'Retro Kits',
    subtitle:   'Classic football jerseys from the golden eras.',
    heroColor:  'from-amber-900/80 to-orange-800/60',
    heroImage:  image3,
  },
  'footwear': {
    title:      'Footwear',
    subtitle:   'Premium boots and trainers for every pitch and street.',
    heroColor:  'from-blue-900/80 to-indigo-800/60',
    heroImage:  image4,
  },
  'backpacks': {
    title:      'Backpacks',
    subtitle:   'Durable training and matchday bags built for champions.',
    heroColor:  'from-teal-900/80 to-cyan-800/60',
    heroImage:  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1600&q=80',
  },
  'special-kits': {
    title:      'Special Kits',
    subtitle:   'Limited edition and special release kits.',
    heroColor:  'from-purple-900/80 to-violet-800/60',
    heroImage:  'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1600&q=80',
  },
  'others': {
    title:      'Others',
    subtitle:   'Other sports gear and accessories to complete your collection.',
    heroColor:  'from-gray-900/80 to-gray-800/60',
    heroImage:  'https://images.unsplash.com/photo-1526976668912-3f65a7c6c8f3?w=1600&q=80',
  },
};

const CategoryPage = () => {
  useCustomerTracker();
  const { slug } = useParams();
  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [sortOption,  setSortOption]  = useState('newest');

  const config = CATEGORY_CONFIGS[slug] || {
    title:     slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'All Products',
    subtitle:  'Discover premium sports equipment',
    heroColor: 'from-emerald-900/80 to-emerald-800/60',
    heroImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1600&q=80',
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res  = await fetch(`${API}/products?category=${slug}`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();

        const resolved = (data.data || []).map(p => ({
          ...p,
          images: (p.images || []).map(getImageUrl),
          image:  p.images?.[0] ? getImageUrl(p.images[0]) : null,
        }));

        setProducts(resolved);
      } catch (err) {
        console.error('CategoryPage fetch error:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProducts();
  }, [slug]);

  const sorted = useMemo(() => {
    const list = [...products];
    if (sortOption === 'price-low')  return list.sort((a, b) => a.price - b.price);
    if (sortOption === 'price-high') return list.sort((a, b) => b.price - a.price);
    if (sortOption === 'discount')   return list.sort((a, b) => {
      const dA = a.oldPrice ? ((a.oldPrice - a.price) / a.oldPrice) : 0;
      const dB = b.oldPrice ? ((b.oldPrice - b.price) / b.oldPrice) : 0;
      return dB - dA;
    });
    return list;
  }, [products, sortOption]);

  return (
    <div className="bg-white">

      {/* Hero */}
      <div
        className="relative h-[360px] flex items-center"
        style={{ backgroundImage: `url(${config.heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${config.heroColor}`} />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-white">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">{config.title}</h1>
          <p className="text-xl text-white/90 max-w-lg">{config.subtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-6 lg:px-8 py-12">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{config.title}</h2>
            <p className="text-gray-600 mt-1">
              {loading ? 'Loading...' : `${sorted.length} product${sorted.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
            className="border border-gray-300 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-emerald-500 bg-white"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="discount">Biggest Discount</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">{error}</p>
          </div>
        )}

        {/* Products */}
        {!loading && !error && sorted.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {sorted.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && sorted.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">No products in this category yet.</p>
            <p className="text-gray-400 mt-2">We're adding more items daily!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;