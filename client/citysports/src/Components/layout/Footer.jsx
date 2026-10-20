import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaTruck,
  FaMobileAlt,
  FaUndoAlt,
  FaArrowUp,
} from 'react-icons/fa';

/* ------------------------------------------------------------------ */
/* Edit links here. Internal links use `to`, external/placeholder `href`. */
/* ------------------------------------------------------------------ */
const SOCIALS = [
  { label: 'Instagram', href: '#', Icon: FaInstagram },
  { label: 'Facebook', href: '#', Icon: FaFacebook },
  { label: 'Twitter', href: '#', Icon: FaTwitter },
  { label: 'WhatsApp', href: '#', Icon: FaWhatsapp }, // e.g. https://wa.me/2547XXXXXXXX
];

const SHOP_LINKS = [
  { label: 'New Season', to: '/category/new-season' },
  { label: 'Retro Kits', to: '/category/retro-kits' },
  { label: 'National Teams', to: '/category/national-teams' },
  { label: 'Footwear', to: '/category/footwear' },
  { label: 'Backpacks', to: '/category/backpacks' },
];

const SUPPORT_LINKS = [
  { label: 'Blog', to: '/blog' },
  { label: 'Track Order', to: '/track-order' },
  { label: 'Delivery Info', to: '/delivery' },
  { label: 'Returns & Refunds', to: '/returns' },
  { label: 'FAQs', to: '/faqs' },
  { label: 'Contact Us', to: '/contact' },
];

const PROMISES = [
  { Icon: FaTruck, title: 'Nairobi delivery', text: 'Same-day or next-day, depending on your area' },
  { Icon: FaMobileAlt, title: 'Pay with M-Pesa', text: 'Or pay cash when your order arrives' },
  { Icon: FaUndoAlt, title: 'Easy exchanges', text: 'Wrong size? We will swap it for you' },
];

const linkClass =
  'text-gray-400 hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:underline underline-offset-4 transition-colors';

const FooterLink = ({ label, to, href }) =>
  to ? (
    <Link to={to} className={linkClass}>
      {label}
    </Link>
  ) : (
    <a href={href} className={linkClass}>
      {label}
    </a>
  );

const Column = ({ title, links, className = '' }) => (
  <nav aria-label={title} className={className}>
    <h3 className="text-white font-semibold mb-4 text-base">{title}</h3>
    <ul className="space-y-2.5 text-sm">
      {links.map((l) => (
        <li key={l.label}>
          <FooterLink {...l} />
        </li>
      ))}
    </ul>
  </nav>
);

/**
 * Footer
 *
 * Optional prop `onSubscribe(email)`: an async function that saves the email.
 * Throw inside it to show an error message. Without it, the form only
 * validates the address and shows the confirmation.
 */
const Footer = ({ onSubscribe }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const value = email.trim();

    if (!/^\S+@\S+\.\S+$/.test(value)) {
      setStatus('error');
      setMessage('Enter a valid email address.');
      return;
    }

    setStatus('sending');
    try {
      if (onSubscribe) await onSubscribe(value);
      setStatus('done');
      setMessage('You are on the list. Watch your inbox for the next drop.');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err?.message || 'Could not subscribe right now. Try again shortly.');
    }
  };

  const scrollToTop = () => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <footer className="bg-gray-950 text-gray-300 mt-auto">
      {/* Promise strip */}
      <div className="border-b border-gray-800/80">
        <ul className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid gap-5 sm:grid-cols-3">
          {PROMISES.map(({ Icon, title, text }) => (
            <li key={title} className="flex items-start gap-4">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-400">
                <Icon size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-sm text-gray-400 leading-snug">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-8 md:gap-10">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              City Sports Kenya
            </h2>
            <p className="mt-3 text-gray-400 leading-relaxed text-sm sm:text-base max-w-md">
              Premium football kits, boots, and sports equipment. Gear up like a champion.
            </p>

            <div className="flex gap-3 mt-6">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-800 bg-gray-900 text-gray-300 hover:border-emerald-500 hover:bg-emerald-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
                >
                  <Icon size={20} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <Column title="Shop" links={SHOP_LINKS} className="col-span-1 lg:col-span-2" />
          <Column title="Support" links={SUPPORT_LINKS} className="col-span-1 lg:col-span-2" />

          {/* Newsletter */}
          <div className="col-span-2 lg:col-span-4">
            <h3 className="text-white font-semibold mb-4 text-base">Stay Updated</h3>
            <p className="text-sm text-gray-400 mb-4">
              Get exclusive offers and the latest drops straight to your inbox.
            </p>

            <form onSubmit={handleSubscribe} noValidate>
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <div className="flex gap-2">
                <input
                  id="footer-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status !== 'idle' && status !== 'sending') setStatus('idle');
                  }}
                  placeholder="Your email address"
                  autoComplete="email"
                  aria-invalid={status === 'error'}
                  aria-describedby="footer-email-note"
                  className="flex-1 min-w-0 bg-gray-900 border border-gray-700 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 px-5 sm:px-8 rounded-2xl font-semibold text-sm text-white transition whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
                >
                  {status === 'sending' ? 'Joining...' : 'Join'}
                </button>
              </div>

              <p
                id="footer-email-note"
                role="status"
                aria-live="polite"
                className={`text-xs mt-3 ${
                  status === 'error'
                    ? 'text-red-400'
                    : status === 'done'
                    ? 'text-emerald-400'
                    : 'text-gray-500'
                }`}
              >
                {status === 'idle' || status === 'sending'
                  ? 'We respect your inbox. Unsubscribe anytime.'
                  : message}
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between text-xs sm:text-sm text-gray-500">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} City Sports Kenya. All Rights Reserved.
            <span className="mx-2">•</span>
            Built with passion for sport
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 rounded-full border border-gray-800 px-4 py-2 text-gray-400 hover:border-gray-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
          >
            <FaArrowUp size={12} aria-hidden="true" />
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;