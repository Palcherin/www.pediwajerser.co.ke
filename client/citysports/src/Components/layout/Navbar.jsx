import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-emerald-600 hover:text-emerald-700 transition">
            City Sports Kenya
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 font-medium text-gray-700">
            <Link to="/" className="hover:text-emerald-600 transition">Home</Link>
            <Link to="/category/new-season" className="hover:text-emerald-600 transition">New Season</Link>
            <Link to="/category/retro-kits" className="hover:text-emerald-600 transition">Retro Kits</Link>
            <Link to="/category/footwear" className="hover:text-emerald-600 transition">Footwear</Link>
            <Link to="/category/backpacks" className="hover:text-emerald-600 transition">Backpacks</Link>
            <Link to="/blogs" className="hover:text-emerald-600 transition">Blog</Link>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4">
            {/* Search Icon */}
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <FiSearch className="text-2xl text-gray-700" />
            </button>

            {/* Cart Icon */}
            <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full transition relative">
              <FaShoppingCart className="text-2xl text-emerald-600" />
              {/* Cart Count Badge */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                3
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMobileMenu}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? 
                <FaTimes className="text-3xl text-gray-700" /> : 
                <FaBars className="text-3xl text-gray-700" />
              }
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-6 border-t border-gray-200">
            <div className="flex flex-col gap-6 text-lg font-medium text-gray-700 px-2">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-600 transition">
                Home
              </Link>
              <Link to="/category/new-season" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-600 transition">
                New Season
              </Link>
              <Link to="/category/retro-kits" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-600 transition">
                Retro Kits
              </Link>
              <Link to="/category/footwear" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-600 transition">
                Footwear
              </Link>
              <Link to="/category/backpacks" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-600 transition">
                Backpacks
              </Link>
              <Link to="/blogs" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-600 transition">
                Blog
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;