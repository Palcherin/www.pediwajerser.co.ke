import React from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-10">

          {/* Brand Section — full width on mobile */}
          <div className="col-span-2 lg:col-span-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              City Sports Kenya
            </h1>
            <p className="mt-3 text-gray-400 leading-relaxed text-sm sm:text-base max-w-md">
              Premium football kits, boots, and sports equipment.
              Gear up like a champion.
            </p>

            {/* Social Links */}
            <div className="flex gap-4 mt-5">
              <a href="#" className="hover:text-emerald-500 transition-colors">
                <FaInstagram size={22} />
              </a>
              <a href="#" className="hover:text-emerald-500 transition-colors">
                <FaFacebook size={22} />
              </a>
              <a href="#" className="hover:text-emerald-500 transition-colors">
                <FaTwitter size={22} />
              </a>
              <a href="#" className="hover:text-emerald-500 transition-colors">
                <FaWhatsapp size={22} />
              </a>
            </div>
          </div>

          {/* Shop Links — half width on mobile */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-white font-semibold mb-4 text-base">Shop</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/category/new-season"   className="hover:text-white transition">New Season</Link></li>
              <li><Link to="/category/retro-kits"   className="hover:text-white transition">Retro Kits</Link></li>
              <li><Link to="/category/national-teams" className="hover:text-white transition">National Teams</Link></li>
              <li><Link to="/category/footwear"     className="hover:text-white transition">Footwear</Link></li>
              <li><Link to="/category/backpacks"    className="hover:text-white transition">Backpacks</Link></li>
            </ul>
          </div>

          {/* Support — half width on mobile */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-white font-semibold mb-4 text-base">Support</h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-white transition">Track Order</a></li>
              <li><a href="#" className="hover:text-white transition">Delivery Info</a></li>
              <li><a href="#" className="hover:text-white transition">Returns &amp; Refunds</a></li>
              <li><a href="#" className="hover:text-white transition">FAQs</a></li>
              <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
            </ul>
          </div>

          {/* Newsletter — full width on mobile */}
          <div className="col-span-2 lg:col-span-4">
            <h3 className="text-white font-semibold mb-4 text-base">Stay Updated</h3>
            <p className="text-sm text-gray-400 mb-4">
              Get exclusive offers and latest drops straight to your inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 min-w-0 bg-gray-900 border border-gray-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition"
              />
              <button className="bg-emerald-600 hover:bg-emerald-700 px-5 sm:px-8 rounded-2xl font-semibold text-sm transition whitespace-nowrap">
                Join
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              We respect your inbox. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs sm:text-sm text-gray-500">
          © {new Date().getFullYear()} City Sports Kenya. All Rights Reserved.
          <span className="mx-2">•</span>
          Built with passion for sport
        </div>
      </div>
    </footer>
  );
};

export default Footer;