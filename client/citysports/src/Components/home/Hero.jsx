import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import jerseyImage from '../../assets/AC INTER.jpeg';
import juventusImage from '../../assets/Juventus1995.jpg';
import FieldImage from '../../assets/Field image.jpeg';
import Footware from '../../assets/FOOTWARE.jpeg';
import Backpack from '../../assets/backpack.jpeg';
import NewSeason from '../../assets/newseason2.jpeg';
import Retro from '../../assets/RETRO3.jpeg';
import Gloves from '../../assets/gloves.jpeg';
import Training from '../../assets/training.jpeg';
import footware1 from '../../assets/footware1.jpeg';

const slides = [
  {
    image: NewSeason,
    bgColor: "#1a2e1e",
    accent: "#4ade80",
    ctaBg: "bg-green-600 hover:bg-green-700",
    tag: "New Arrival",
    title: "New Season\nKits 2025/26",
    subtitle: "Wear the passion. Play like a pro.",
    cta: "Shop Now",
    link: "/category/new-season"
  },
  {
    image: Retro,
    bgColor: "#1e1a10",
    accent: "#fbbf24",
    ctaBg: "bg-amber-600 hover:bg-amber-700",
    tag: "Fan Favourite",
    title: "Retro Kits\nRevival",
    subtitle: "Classic designs, timeless glory.",
    cta: "Explore Retro Kits",
    link: "/category/retro-kits"
  },
  {
    image: footware1,
    bgColor: "#101828",
    accent: "#60a5fa",
    ctaBg: "bg-blue-600 hover:bg-blue-700",
    tag: "Best Sellers",
    title: "Elite Footwear\nCollection",
    subtitle: "Speed. Control. Power.",
    cta: "Browse Footwear",
    link: "/category/footwear"
  },
  {
    image: Training,
    bgColor: "#1c1410",
    accent: "#fb923c",
    ctaBg: "bg-orange-600 hover:bg-orange-700",
    tag: "Pro Series",
    title: "Durable\nTraining Gear",
    subtitle: "Built for champions.",
    cta: "Explore Training Gear",
    link: "/category/training-gear"
  },
  {
    image: Gloves,
    bgColor: "#10181e",
    accent: "#38bdf8",
    ctaBg: "bg-sky-600 hover:bg-sky-700",
    tag: "New In",
    title: "Glorious\nBackpacks",
    subtitle: "Carry your passion in style.",
    cta: "Explore Backpacks",
    link: "/category/backpacks"
  },
];

export const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const goTo = (index) => {
    setCurrent((index + slides.length) % slides.length);
    setAnimKey((k) => k + 1);
  };

  useEffect(() => {
    const timer = setInterval(() => goTo(current + 1), 7000);
    return () => clearInterval(timer);
  }, [current]);

  const slide = slides[current];

  return (
    <div
      className="relative h-[75vh] sm:h-[85vh] lg:h-[92vh] overflow-hidden rounded-none sm:rounded-xl"
      style={{ backgroundColor: slide.bgColor }}
    >

      {/* Background images */}
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundColor: s.bgColor }}
        >
          <img
            src={s.image}
            alt={s.title}
            className="w-full h-full object-cover sm:object-contain"
          />
        </div>
      ))}

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.15) 100%)'
        }}
      />

      {/* Slide Number */}
      <div className="absolute top-5 left-5 sm:top-7 sm:left-12 text-[10px] sm:text-xs font-medium tracking-widest text-white/40 z-20">
        0{current + 1} / 0{slides.length}
      </div>

      {/* Vertical Dots */}
      <div className="absolute top-5 right-4 sm:top-7 sm:right-7 flex flex-col gap-1.5 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="w-[3px] rounded-full transition-all duration-300 border-none"
            style={{
              height: i === current ? '24px' : '10px',
              background:
                i === current
                  ? '#fff'
                  : 'rgba(255,255,255,0.3)'
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <div
        key={animKey}
        className="absolute inset-0 flex flex-col justify-end px-5 pb-10 sm:px-8 sm:pb-14 lg:pl-12 lg:pr-40 lg:pb-16 z-20"
      >

        {/* Tag */}
        <span
          className="inline-block text-[9px] sm:text-[10px] font-medium tracking-[3px] uppercase px-3 py-1.5 rounded mb-4 sm:mb-5 w-fit animate-fadeUp"
          style={{
            color: slide.accent,
            background: `${slide.accent}20`,
            border: `1px solid ${slide.accent}40`
          }}
        >
          {slide.tag}
        </span>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-black text-white leading-none mb-3 uppercase tracking-wide animate-fadeUp animation-delay-100 max-w-[95%] sm:max-w-3xl">
          {slide.title.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < slide.title.split('\n').length - 1 && <br />}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-white/70 mb-6 sm:mb-8 max-w-md animate-fadeUp animation-delay-200 leading-relaxed">
          {slide.subtitle}
        </p>

        {/* CTA */}
        <Link
          to={slide.link}
          className={`inline-flex items-center gap-2 text-sm sm:text-base font-semibold px-5 sm:px-6 py-3 rounded-lg text-white w-fit transition-all animate-fadeUp animation-delay-300 ${slide.ctaBg}`}
        >
          {slide.cta}

          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Arrows */}
      <div className="absolute bottom-5 right-5 sm:bottom-10 sm:right-10 lg:bottom-16 lg:right-12 flex gap-2 z-20">
        {['prev', 'next'].map((dir) => (
          <button
            key={dir}
            onClick={() =>
              goTo(dir === 'prev' ? current - 1 : current + 1)
            }
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/20 bg-black/30 text-white flex items-center justify-center hover:bg-white/15 transition-all"
            aria-label={
              dir === 'prev'
                ? 'Previous slide'
                : 'Next slide'
            }
          >
            {dir === 'prev' ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-20">
        <div
          key={`prog-${animKey}`}
          className="h-full rounded-r transition-none"
          style={{
            background: slide.accent,
            animation: 'progress 7s linear forwards'
          }}
        />
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0% }
          to { width: 100% }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeUp {
          animation: fadeUp 0.5s ease forwards;
        }

        .animation-delay-100 {
          animation-delay: 0.20s;
          opacity: 0;
        }

        .animation-delay-200 {
          animation-delay: 0.3s;
          opacity: 0;
        }

        .animation-delay-300 {
          animation-delay: 0.45s;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default HeroCarousel;