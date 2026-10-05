import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const PAGE_SIZE = 9;

const categoryColors = {
  Footwear: { bg: 'bg-blue-100', text: 'text-blue-800' },
  Kits: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  Retro: { bg: 'bg-amber-100', text: 'text-amber-800' },
  Training: { bg: 'bg-orange-100', text: 'text-orange-800' },
};

const FALLBACK_IMAGE = 'https://placehold.co/1200x800?text=City+Sports';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

const postPath = (post) => `/blog/${post.slug || post.id}`;

const Badge = ({ category }) => {
  const colors = categoryColors[category] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}>
      {category}
    </span>
  );
};

const handleImgError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = FALLBACK_IMAGE;
};

const SkeletonCard = () => (
  <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white animate-pulse">
    <div className="h-60 bg-gray-200" />
    <div className="p-6 space-y-4">
      <div className="h-5 w-20 rounded-full bg-gray-200" />
      <div className="h-6 w-3/4 rounded bg-gray-200" />
      <div className="h-4 w-full rounded bg-gray-100" />
    </div>
  </div>
);

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const fetchPosts = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/blogs`, { signal });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to load blog posts');
      }
      setPosts(json.data);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Cannot connect to server.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchPosts(controller.signal);
    return () => controller.abort();
  }, [fetchPosts]);

  // Reset pagination when filters change
  useEffect(() => setVisible(PAGE_SIZE), [activeCategory, search]);

  const categories = useMemo(() => ['All', ...new Set(posts.map((p) => p.category))], [posts]);

  // Newest first (the server already sorts, this keeps it correct after filtering)
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return posts
      .filter((p) => {
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
        const matchesSearch =
          !term || p.title.toLowerCase().includes(term) || p.excerpt.toLowerCase().includes(term);
        return matchesCategory && matchesSearch;
      })
      .sort(
        (a, b) =>
          new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt)
      );
  }, [posts, activeCategory, search]);

  // Only a post that is really marked featured gets the hero slot
  const featured = filtered.find((p) => p.featured) || null;
  const rest = filtered.filter((p) => p !== featured);
  const shown = rest.slice(0, visible);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <p className="text-emerald-600 text-sm font-bold tracking-[0.25em] uppercase mb-4">City Sports Blog</p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 leading-tight max-w-4xl">
            Football Culture, Gear & Performance
          </h1>
          <p className="mt-6 text-lg text-gray-500 max-w-2xl">
            Explore football kits, boots, training gear, lifestyle trends, and exclusive stories from the football world.
          </p>
          <div className="mt-8 max-w-md">
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {error && !loading && (
          <div className="py-24 text-center">
            <h3 className="text-3xl font-bold text-gray-300">Couldn't load posts</h3>
            <p className="mt-3 text-gray-400">{error}</p>
            <button
              onClick={() => fetchPosts()}
              className="mt-6 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {loading && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                    activeCategory === cat
                      ? 'bg-gray-900 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <span className="ml-auto text-sm text-gray-400">
                {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
              </span>
            </div>

            {featured && (
              <Link to={postPath(featured)} className="group block mb-14">
                <div className="grid md:grid-cols-2 overflow-hidden rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500">
                  <div className="relative overflow-hidden min-h-[320px]">
                    <img
                      src={featured.image}
                      alt={featured.title}
                      onError={handleImgError}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute top-5 left-5 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full">
                      Featured
                    </span>
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <Badge category={featured.category} />
                    <h2 className="mt-5 text-3xl md:text-4xl font-black leading-tight text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {featured.title}
                    </h2>
                    <p className="mt-5 text-gray-500 leading-relaxed text-lg">{featured.excerpt}</p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mt-8">
                      <span>{featured.author}</span>
                      <span>•</span>
                      <span>{formatDate(featured.publishedAt || featured.createdAt)}</span>
                      <span>•</span>
                      <span>{featured.readTime} min read</span>
                    </div>
                    <span className="mt-6 text-sm font-semibold text-emerald-600">Read article →</span>
                  </div>
                </div>
              </Link>
            )}

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((post) => (
                <Link key={post.id} to={postPath(post)} className="group">
                  <article className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white hover:shadow-xl transition-all duration-500 h-full flex flex-col">
                    <div className="relative overflow-hidden h-60">
                      <img
                        src={post.image}
                        alt={post.title}
                        onError={handleImgError}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <Badge category={post.category} />
                      <h3 className="mt-4 text-2xl font-bold leading-snug text-gray-900 group-hover:text-emerald-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="mt-3 text-gray-500 leading-relaxed flex-1 line-clamp-3">{post.excerpt}</p>
                      <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-sm text-gray-400">
                        <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                        <span>
                          ♥ {post.likeCount ?? 0} · 💬 {post.commentCount ?? 0} · {post.readTime} min
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {rest.length > visible && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="rounded-full bg-gray-900 px-8 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
                >
                  Show more articles
                </button>
              </div>
            )}

            {filtered.length === 0 && (
              <div className="py-24 text-center">
                <h3 className="text-3xl font-bold text-gray-300">No posts found</h3>
                <p className="mt-3 text-gray-400">
                  {posts.length === 0 ? 'No articles have been published yet.' : 'Try another category or search term.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogPage;