import React from 'react';

const Announcements = () => {
  const announcements = [
    {
      id: 1,
      message: "🚚 Free delivery within Nairobi on orders above Ksh 5,000",
      type: "success",
    },
    {
      id: 2,
      message: "🎉 20% OFF on first order! Use code: WELCOME20",
      type: "promo",
    },
  ];

  return (
    <div className="space-y-1">
      {announcements.map((announcement) => (
        <section
          key={announcement.id}
          className={`py-3 text-center font-medium text-sm transition-all duration-300
            ${announcement.type === 'promo'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-accent text-white'
            }`}
        >
          {announcement.message}
        </section>
      ))}
    </div>
  );
};

export default Announcements;