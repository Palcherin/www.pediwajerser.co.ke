import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import useCustomerTracker from '../../hooks/useCustomerTracker';
import logo from '../../assets/final5-removebg-preview.png';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Shown immediately and kept as a fallback if the categories fetch fails,
// so the navbar is never empty or broken for a visitor.
const FALLBACK_CATEGORIES = [
  { name: 'New Season', slug: 'new-season' },
  { name: 'National Teams', slug: 'national-teams' },
  { name: 'Retro Kits', slug: 'retro-kits' },
  { name: 'Footwear', slug: 'footwear' },
  { name: 'Others', slug: 'others' },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const navigate = useNavigate();
  useCustomerTracker(); // Track customer visits

  const { cartCount } = useCart();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Pull live categories from the database instead of hardcoding the list.
  // ⚠️ Adjust the endpoint/field names (`name`, `slug`) if your categories
  // API shapes them differently (e.g. `title`, `id`, `is_active`).
  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const res = await fetch(`${API}/api/categories`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.categories;
        if (!cancelled && Array.isArray(list) && list.length) {
          setCategories(
            list
              .filter((c) => c.is_active !== false) // keep hidden categories out of the navbar
              .map((c) => ({ name: c.name, slug: c.slug }))
          );
        }
      } catch {
        // Keep FALLBACK_CATEGORIES on failure — fail quiet, don't break the navbar.
      }
    };

    loadCategories();
    return () => { cancelled = true; };
  }, []);

  // Connect Search to Backend
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      closeMobileMenu();
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <img src={logo} alt="City Sports Logo" className="h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 font-medium text-gray-700">
            <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="hover:text-emerald-600 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
            <Link to="/blog" className="hover:text-emerald-600 transition-colors">Blog</Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-72 pl-10 pr-4 py-2.5 bg-gray-100 border border-transparent focus:border-emerald-500 rounded-full text-sm focus:outline-none transition-all"
                />
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </form>

            {/* Mobile Search Button */}
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-full transition">
              <FiSearch className="text-2xl text-gray-700" />
            </button>

            {/* Cart Icon */}
            <Link 
              to="/cart" 
              className="p-2 hover:bg-gray-100 rounded-full transition relative"
              aria-label="Shopping Cart"
            >
              <FaShoppingCart className="text-2xl text-emerald-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="text-3xl text-gray-700" />
              ) : (
                <FaBars className="text-3xl text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-6 py-6 border-t border-gray-200 bg-white">
            <div className="flex flex-col gap-6 text-lg font-medium text-gray-700 px-2">
              <Link to="/" onClick={closeMobileMenu}>Home</Link>
              {categories.map((cat) => (
                <Link key={cat.slug} to={`/category/${cat.slug}`} onClick={closeMobileMenu}>
                  {cat.name}
                </Link>
              ))}
              <Link to="/blog" onClick={closeMobileMenu}>Blog</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;