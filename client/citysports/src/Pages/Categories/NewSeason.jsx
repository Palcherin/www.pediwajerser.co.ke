import React, { useState, useEffect, useMemo } from 'react';
import ProductCard from '../../Components/products/ProductCard';

const API = 'http://localhost:5000/api';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `http://localhost:5000${path}`;
};

const NewSeason = () => {
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res  = await fetch(`${API}/products?category=new-season`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();

        const resolved = (data.data || []).map(p => ({
          ...p,
          images: (p.images || []).map(getImageUrl),
          image:  p.images?.[0] ? getImageUrl(p.images[0]) : null,
        }));

        setProducts(resolved);
      } catch (err) {
        console.error('NewSeason fetch error:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
      <div className="relative h-[380px] bg-gradient-to-r from-emerald-800 to-emerald-900 flex items-center">
        <div className="max-w-7xl mx-auto px-6 text-white">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">New Season 2025/26</h1>
          <p className="text-xl md:text-2xl text-emerald-100 max-w-lg">
            Fresh kits, boots, and gear. Be the first to play in the latest drops.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-6 lg:px-8 py-12">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">All New Season Items</h2>
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
            <p className="text-2xl text-gray-500">No new season products yet.</p>
            <p className="text-gray-400 mt-2">We're adding more items daily!</p>
          </div>
        )}

        {/* Load More — only show if there are products */}
        {!loading && sorted.length > 0 && (
          <div className="flex justify-center mt-16">
            <button className="px-10 py-4 bg-gray-900 hover:bg-black text-white font-semibold rounded-2xl transition-all duration-200 flex items-center gap-3">
              Load More Products <span>↓</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewSeason;