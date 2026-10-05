import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Page, StillNeedHelp, SUPPORT } from './SupportsShared';

/* EDIT: set the window and rules you actually honour */
const RETURN_DAYS = 3;

const OK = [
  'Unworn, unwashed items with tags still attached',
  'Items that arrived damaged or faulty',
  'Wrong item or wrong size sent by us',
];

const NOT_OK = [
  'Printed or personalised kits (names and numbers), unless faulty',
  'Items that have been worn, washed or altered',
  'Items returned after the return window',
];

const STEPS = [
  {
    title: 'Contact us',
    text: `Within ${RETURN_DAYS} days of delivery, message us on WhatsApp or through the contact page with your order number and the reason.`,
  },
  { title: 'We confirm', text: 'We will check your request and tell you how to send the item back.' },
  { title: 'Send it back', text: 'Pack the item with its tags and original packaging if you still have them.' },
  {
    title: 'Exchange or refund',
    text: 'Once we have inspected the item, we send the replacement or refund you.',
  },
];

const List = ({ items, good }) => (
  <ul className="mt-4 space-y-3">
    {items.map((t) => (
      <li key={t} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
        <span
          aria-hidden="true"
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            good ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
          }`}
        >
          {good ? '✓' : '✕'}
        </span>
        {t}
      </li>
    ))}
  </ul>
);

const ReturnsPage = () => (
  <Page
    title="Returns and refunds"
    intro={`Changed your mind or got the wrong size? You have ${RETURN_DAYS} days from delivery to ask for an exchange or refund.`}
  >
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <h2 className="text-xl font-bold text-gray-900">What we accept</h2>
        <List items={OK} good />
      </Card>
      <Card>
        <h2 className="text-xl font-bold text-gray-900">What we cannot accept</h2>
        <List items={NOT_OK} good={false} />
      </Card>
    </div>

    <Card>
      <h2 className="text-xl font-bold text-gray-900">How to return an item</h2>
      <ol className="mt-6 grid gap-6 sm:grid-cols-2">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
              {i + 1}
            </span>
            <div>
              <h3 className="font-semibold text-gray-900">{s.title}</h3>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Card>

    <Card>
      <h2 className="text-xl font-bold text-gray-900">Refunds</h2>
      <p className="mt-3 text-sm text-gray-600 leading-relaxed max-w-2xl">
        Approved refunds are sent to the M-Pesa number used for your order, usually within a few
        working days of us receiving the item. For cash on delivery orders, we will agree the
        refund method with you. Delivery fees are refunded only when the return is our mistake.
      </p>
      <p className="mt-4 text-sm text-gray-600">
        Start a return on WhatsApp:{' '}
        <a
          href={`https://wa.me/${SUPPORT.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-emerald-600 hover:underline"
        >
          {SUPPORT.phone}
        </a>{' '}
        or{' '}
        <Link to="/contact" className="font-semibold text-emerald-600 hover:underline">
          use the contact form
        </Link>
        .
      </p>
    </Card>

    <StillNeedHelp />
  </Page>
);

export default ReturnsPage;