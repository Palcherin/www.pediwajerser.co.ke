import React, { useState, useEffect } from 'react';
import ProductCard from '../products/ProductCard.jsx';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        const data = await res.json();
        setProducts(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(p => p.categorySlug === filter);

  if (loading) return <div className="py-20 text-center">Loading shop...</div>;

  return (
    <div className="max-w-7xl mx-auto px-5 py-12">
      <h1 className="text-4xl font-bold mb-8">Shop All Products</h1>

      {/* Filter Buttons */}
      <div className="flex gap-3 mb-10 flex-wrap">
        {['all', 'new-season', 'retro-kits', 'footwear', 'backpacks'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2 rounded-2xl capitalize transition-all ${
              filter === cat 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {cat.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
 
export default ShopPage;