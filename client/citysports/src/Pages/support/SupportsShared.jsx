import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

/* EDIT: your real contact details (used by Contact, FAQs, Delivery, Returns) */
export const SUPPORT = {
  phone: '+254 743666719',
  whatsapp: '254743666719', // digits only, no +
  email: 'pediwajersey@gmail.com',
  hours: 'Mon to Sat, 9am to 6pm (EAT)',
};

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const formatKES = (n) => `KES ${Number(n || 0).toLocaleString('en-KE')}`;

export const inputClass =
  'w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all';

export const usePageTitle = (title) => {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} | City Sports Kenya`;
    return () => {
      document.title = previous;
    };
  }, [title]);
};

export const Card = ({ className = '', children }) => (
  <div className={`rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm ${className}`}>
    {children}
  </div>
);

export const Page = ({ title, intro, width = 'max-w-5xl', children }) => {
  usePageTitle(title);
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">{title}</h1>
          {intro && <p className="mt-4 text-lg text-gray-500 max-w-2xl">{intro}</p>}
        </div>
      </section>
      <div className={`${width} mx-auto px-4 py-12 space-y-8`}>{children}</div>
    </div>
  );
};

export const StillNeedHelp = () => (
  <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-gray-900 border-gray-900">
    <div>
      <h2 className="text-xl font-bold text-white">Still need help?</h2>
      <p className="mt-1 text-sm text-gray-400">
        Message us and we will reply as soon as we can. {SUPPORT.hours}.
      </p>
    </div>
    <Link
      to="/contact"
      className="shrink-0 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-center text-sm font-semibold text-white transition-colors"
    >
      Contact us
    </Link>
  </Card>
);