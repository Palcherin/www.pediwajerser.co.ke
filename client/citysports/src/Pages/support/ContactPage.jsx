import React, { useState } from 'react';
import { Card, Page, SUPPORT, inputClass } from './SupportsShared';

const TOPICS = ['Order question', 'Sizing help', 'Return or exchange', 'Product question', 'Something else'];

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', phone: '', topic: TOPICS[0], orderNumber: '', message: '' });
  const [error, setError] = useState('');

  const set = (key) => (e) => {
    setError('');
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const buildText = () =>
    [
      `Hi City Sports, my name is ${form.name.trim()}.`,
      `Topic: ${form.topic}`,
      form.orderNumber.trim() && `Order number: ${form.orderNumber.trim()}`,
      form.phone.trim() && `My phone: ${form.phone.trim()}`,
      '',
      form.message.trim(),
    ]
      .filter((l) => l !== false && l !== '')
      .join('\n');

  const validate = () => {
    if (!form.name.trim() || !form.message.trim()) {
      setError('Please enter your name and a message.');
      return false;
    }
    return true;
  };

  const sendWhatsApp = (e) => {
    e.preventDefault();
    if (!validate()) return;
    window.open(
      `https://wa.me/${SUPPORT.whatsapp}?text=${encodeURIComponent(buildText())}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const sendEmail = () => {
    if (!validate()) return;
    window.location.href = `mailto:${SUPPORT.email}?subject=${encodeURIComponent(
      `${form.topic} - ${form.name.trim()}`
    )}&body=${encodeURIComponent(buildText())}`;
  };

  const channels = [
    { label: 'WhatsApp', value: SUPPORT.phone, href: `https://wa.me/${SUPPORT.whatsapp}`, external: true },
    { label: 'Call', value: SUPPORT.phone, href: `tel:${SUPPORT.phone.replace(/\s/g, '')}` },
    { label: 'Email', value: SUPPORT.email, href: `mailto:${SUPPORT.email}` },
  ];

  return (
    <Page
      title="Contact us"
      intro="Questions about an order, sizing or a return? Send us a message and we will get back to you."
    >
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          {channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.external ? '_blank' : undefined}
              rel={c.external ? 'noopener noreferrer' : undefined}
              className="block rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:border-emerald-300 transition-colors"
            >
              <p className="text-sm text-gray-400">{c.label}</p>
              <p className="mt-1 font-semibold text-gray-900 break-words">{c.value}</p>
            </a>
          ))}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-400">Opening hours</p>
            <p className="mt-1 font-semibold text-gray-900">{SUPPORT.hours}</p>
          </div>
        </div>

        <Card className="lg:col-span-3">
          <h2 className="text-xl font-bold text-gray-900">Send a message</h2>
          <form onSubmit={sendWhatsApp} className="mt-6 space-y-5" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="c-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Your name
                </label>
                <input id="c-name" value={form.name} onChange={set('name')} autoComplete="name" className={inputClass} />
              </div>
              <div>
                <label htmlFor="c-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="c-phone"
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  autoComplete="tel"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="c-topic" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Topic
                </label>
                <select id="c-topic" value={form.topic} onChange={set('topic')} className={inputClass}>
                  {TOPICS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="c-order" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Order number <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input id="c-order" value={form.orderNumber} onChange={set('orderNumber')} className={inputClass} />
              </div>
            </div>

            <div>
              <label htmlFor="c-message" className="block text-sm font-medium text-gray-700 mb-1.5">
                Message
              </label>
              <textarea
                id="c-message"
                rows={5}
                value={form.message}
                onChange={set('message')}
                maxLength={1000}
                className={inputClass}
              />
            </div>

            {error && (
              <div role="alert" className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-2xl">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3.5 text-sm font-semibold text-white transition-colors"
              >
                Send on WhatsApp
              </button>
              <button
                type="button"
                onClick={sendEmail}
                className="flex-1 rounded-2xl border border-gray-200 px-6 py-3.5 text-sm font-semibold text-gray-700 hover:border-gray-400 transition-colors"
              >
                Send by email
              </button>
            </div>
            <p className="text-xs text-gray-400">
              This opens WhatsApp or your email app with your message filled in. Nothing is sent until
              you press send there.
            </p>
          </form>
        </Card>
      </div>
    </Page>
  );
};

export default ContactPage;
