import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../products/ProductCard.jsx';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');

        const data = await res.json();
        const allProducts = data.data || data;

        // Filter New Season products and limit to 8
        const newSeasonProducts = allProducts
          .filter(p => p.categorySlug === 'new-season' || p.category === 'new-season')
          .slice(0, 8);

        setProducts(newSeasonProducts);
      } catch (err) {
        console.error('Error fetching new arrivals:', err);
        setError('Failed to load new arrivals');
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-5 text-center">
          <p className="text-gray-500">Loading new arrivals...</p>
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return (
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-5 text-center">
          <p className="text-gray-500">{error || 'No new arrivals available at the moment.'}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-5 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              New Arrivals
            </h2>
            <p className="mt-3 text-lg text-gray-600 max-w-md">
              Fresh drops from the biggest brands. Be the first to own them.
            </p>
          </div>

          <Link
            to="/category/new-season"
            className="mt-6 md:mt-0 group flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
          >
            View All New Items
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Link
            to="/category/new-season"
            className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Explore All New Season Gear
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;