import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Page, StillNeedHelp, inputClass } from './SupportsShared';

/* EDIT: keep answers in sync with your Delivery and Returns pages */
const FAQS = [
  {
    group: 'Ordering and payment',
    items: [
      {
        q: 'How do I place an order?',
        a: 'Add items to your cart, go to checkout, enter your name, phone number and delivery location, then choose how to pay. You do not need an account. Call or whatsapp +254743666719 if you need help.',
      },
      {
        q: 'Which payment methods do you accept?',
        a: 'You can pay with M-Pesa or choose cash on delivery and pay the rider when your order arrives. Cash on delivery is only available for orders within Nairobi.',
      },
      {
        q: 'Do I need an account to order?',
        a: 'No. You can check out as a guest. An account is only needed to like and comment on blog posts.',
      },
      {
        q: 'Can I change or cancel my order?',
        a: 'Contact us as soon as possible. If your order has not been shipped, we can change or cancel it.',
      },
    ],
  },
  {
    group: 'Delivery',
    items: [
      {
        q: 'How long does delivery take?',
        a: 'Within Nairobi it is usually same day or next day after we confirm your order. Outside Nairobi it takes 2 to 4 days. Printed kits take a little longer.',
      },
      {
        q: 'How much is delivery?',
        a: 'Delivery in Nairobi CBD and surrounds is KES 150. Other areas are confirmed when we call you. See the Delivery info page for details.',
      },
      {
        q: 'How do I track my order?',
        a: 'Use the Track Order page with your order number and the phone number you used at checkout.',
      },
    ],
  },
  {
    group: 'Products and sizing',
    items: [
      {
        q: 'Are your kits original?',
        a: 'Each product page describes the kit, including whether it is a fan version, player version or retro replica. Contact us if you want to confirm before you buy. Call/whatsapp +254743666719',
      },
      {
        q: 'How do I choose my size?',
        a: 'Check the size options on the product page. If you are between sizes, message us and we will advise. Kit sizing can differ by brand.',
      },
      {
        q: 'Can I add a name and number to my kit?',
        a: 'Yes, where printing is offered on the product page. Printed kits cannot be returned unless they are faulty.',
      },
    ],
  },
  {
    group: 'Returns and refunds',
    items: [
      {
        q: 'Can I return an item?',
        a: 'Yes, unworn items with tags attached can be returned within 3 days of delivery. See the Returns and refunds page for the full rules.',
      },
      {
        q: 'How will I get my refund?',
        a: 'Approved refunds go to the M-Pesa number used for your order, usually within a few working days of us receiving the item.',
      },
    ],
  },
];

const Item = ({ q, a, forceOpen }) => (
  <details open={forceOpen || undefined} className="group border-b border-gray-100 last:border-0">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold text-gray-900 hover:text-emerald-700 focus-visible:outline-none focus-visible:text-emerald-700 [&::-webkit-details-marker]:hidden">
      {q}
      <span
        aria-hidden="true"
        className="shrink-0 text-xl leading-none text-gray-400 transition-transform group-open:rotate-45"
      >
        +
      </span>
    </summary>
    <p className="pb-5 pr-8 text-sm text-gray-600 leading-relaxed">{a}</p>
  </details>
);

const FAQsPage = () => {
  const [search, setSearch] = useState('');
  const term = search.trim().toLowerCase();

  const groups = useMemo(
    () =>
      FAQS.map((g) => ({
        ...g,
        items: g.items.filter(
          (i) => !term || i.q.toLowerCase().includes(term) || i.a.toLowerCase().includes(term)
        ),
      })).filter((g) => g.items.length > 0),
    [term]
  );

  return (
    <Page
      title="Frequently asked questions"
      intro="Quick answers about ordering, delivery, sizing and returns."
      width="max-w-3xl"
    >
      <div>
        <label htmlFor="faq-search" className="sr-only">
          Search questions
        </label>
        <input
          id="faq-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions..."
          className={inputClass}
        />
      </div>

      {groups.length === 0 ? (
        <Card className="text-center">
          <h2 className="text-xl font-bold text-gray-900">No matching questions</h2>
          <p className="mt-2 text-sm text-gray-500">
            Try different words, or{' '}
            <Link to="/contact" className="font-semibold text-emerald-600 hover:underline">
              ask us directly
            </Link>
            .
          </p>
        </Card>
      ) : (
        groups.map((g) => (
          <Card key={g.group}>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{g.group}</h2>
            <div>
              {g.items.map((i) => (
                <Item key={i.q} {...i} forceOpen={!!term} />
              ))}
            </div>
          </Card>
        ))
      )}

      <StillNeedHelp />
    </Page>
  );
};

export default FAQsPage;