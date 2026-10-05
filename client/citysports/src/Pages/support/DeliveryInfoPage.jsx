import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Page, StillNeedHelp, formatKES } from './SupportsShared';

/* EDIT: make these match what you actually offer */
const ZONES = [
  {
    area: 'Nairobi CBD and surrounds (Westlands, Kilimani and nearby)',
    fee: formatKES(150),
    time: 'Same day or next day',
  },
  { area: 'Rest of Nairobi and environs', fee: 'Confirmed when we call you', time: '1 to 2 days' },
  { area: 'Outside Nairobi', fee: 'Confirmed when we call you', time: '2 to 3 days by courier' },
];

const STEPS = [
  { title: 'Place your order', text: 'Pick your items, enter your delivery details and choose how you want to pay.' },
  { title: 'We confirm', text: 'We contact you on the phone number you gave to confirm your order and delivery time.' },
  { title: 'We pack and dispatch', text: 'Your order is packed and handed to our rider or courier.' },
  { title: 'You receive it', text: 'Check your items on delivery. Pay the rider if you chose cash on delivery.' },
];

const DeliveryInfoPage = () => (
  <Page
    title="Delivery info"
    intro="Where we deliver, how long it takes, and what it costs."
  >
    <Card>
      <h2 className="text-xl font-bold text-gray-900">Delivery areas and fees</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="py-3 pr-4 font-semibold">Area</th>
              <th className="py-3 pr-4 font-semibold">Fee</th>
              <th className="py-3 font-semibold">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ZONES.map((z) => (
              <tr key={z.area}>
                <td className="py-4 pr-4 font-medium text-gray-900">{z.area}</td>
                <td className="py-4 pr-4 text-gray-600 whitespace-nowrap">{z.fee}</td>
                <td className="py-4 text-gray-600">{z.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-gray-500">
        Delivery times start once we have confirmed your order. Printed and personalised kits can
        take an extra 1 to 3 days.
      </p>
    </Card>

    <Card>
      <h2 className="text-xl font-bold text-gray-900">How it works</h2>
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
      <h2 className="text-xl font-bold text-gray-900">Payment on delivery</h2>
      <p className="mt-3 text-sm text-gray-600 leading-relaxed max-w-2xl">
        You can pay with M-Pesa when you order, or choose cash on delivery and pay the rider when
        your order arrives. Please keep your phone on so the rider can reach you.
      </p>
      <p className="mt-4 text-sm text-gray-600">
        Already ordered?{' '}
        <Link to="/track-order" className="font-semibold text-emerald-600 hover:underline">
          Track your order
        </Link>
        .
      </p>
    </Card>

    <StillNeedHelp />
  </Page>
);

export default DeliveryInfoPage;