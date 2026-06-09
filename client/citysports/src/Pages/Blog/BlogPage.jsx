import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const blogPosts = [
  {
    id: 1,
    title: 'Top 10 Football Boots of 2025',
    excerpt:
      'Discover the best football boots for speed, control, and power this season.',
    image:
      'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=1200&q=80',
    category: 'Footwear',
    author: 'City Sports',
    date: 'May 10, 2025',
    readTime: '5 min read',
    featured: true,
  },
  {
    id: 2,
    title: 'How to Choose the Right Kit Size',
    excerpt:
      'A complete guide to finding the perfect fit for your football jersey.',
    image:
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&q=80',
    category: 'Kits',
    author: 'City Sports',
    date: 'Apr 28, 2025',
    readTime: '3 min read',
    featured: false,
  },
  {
    id: 3,
    title: 'The Return of Retro: Why Classic Kits Are Back',
    excerpt:
      'Vintage football jerseys are having a massive revival.',
    image:
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80',
    category: 'Retro',
    author: 'City Sports',
    date: 'Apr 15, 2025',
    readTime: '4 min read',
    featured: false,
  },
  {
    id: 4,
    title: 'Training Gear Essentials for Serious Players',
    excerpt:
      'Everything you need in your training bag for peak performance.',
    image:
      'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&q=80',
    category: 'Training',
    author: 'City Sports',
    date: 'Apr 5, 2025',
    readTime: '6 min read',
    featured: false,
  },
];

const CATEGORIES = [
  'All',
  ...new Set(blogPosts.map((p) => p.category)),
];

const categoryColors = {
  Footwear: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
  },
  Kits: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
  },
  Retro: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
  },
  Training: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
  },
};

const Badge = ({
  category,}) => {
  const colors = categoryColors[category] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700', 
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}
    >
      {category}
    </span>
  );
};

const BlogPage = () => {
  const [activeCategory, setActiveCategory] =
    useState('All');

  const [search, setSearch] = useState('');

 const filtered = useMemo(() => {
  return blogPosts
    .filter((post) => {
      const matchesCategory =
        activeCategory === 'All'
          ? true
          : post.category === activeCategory;

      const matchesSearch =
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
}, [activeCategory, search]);
  const featured = filtered[0];
const rest = filtered.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16">

          <p className="text-emerald-600 text-sm font-bold tracking-[0.25em] uppercase mb-4">
            City Sports Blog
          </p>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 leading-tight max-w-4xl">
            Football Culture, Gear & Performance
          </h1>

          <p className="mt-6 text-lg text-gray-500 max-w-2xl">
            Explore football kits, boots, training
            gear, lifestyle trends, and exclusive
            stories from the football world.
          </p>

          {/* Search */}
          <div className="mt-8 max-w-md">
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">

        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setActiveCategory(cat)
              }
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured */}
        {featured && (
          <Link
            to={`/blog/${featured.id}`}
            className="group block mb-14"
          >
            <div className="grid md:grid-cols-2 overflow-hidden rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500">

              <div className="relative overflow-hidden min-h-[320px]">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                <div className="absolute top-5 left-5">
                  <span className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full">
                    Featured
                  </span>
                </div>
              </div>

              <div className="p-8 md:p-12 flex flex-col justify-center">
                <Badge category={featured.category} />

                <h2 className="mt-5 text-3xl md:text-4xl font-black leading-tight text-gray-900 group-hover:text-emerald-600 transition-colors">
                  {featured.title}
                </h2>

                <p className="mt-5 text-gray-500 leading-relaxed text-lg">
                  {featured.excerpt}
                </p>

                <div className="flex items-center gap-3 text-sm text-gray-400 mt-8">
                  <span>{featured.author}</span>
                  <span>•</span>
                  <span>{featured.date}</span>
                  <span>•</span>
                  <span>{featured.readTime}</span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="group"
            >
              <article className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white hover:shadow-xl transition-all duration-500 h-full flex flex-col">

                <div className="relative overflow-hidden h-60">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <Badge category={post.category} />

                  <h3 className="mt-4 text-2xl font-bold leading-snug text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {post.title}
                  </h3>

                  <p className="mt-3 text-gray-500 leading-relaxed flex-1">
                    {post.excerpt}
                  </p>

                  <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-sm text-gray-400">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <h3 className="text-3xl font-bold text-gray-300">
              No posts found
            </h3>
            <p className="mt-3 text-gray-400">
              Try another category or search term.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;