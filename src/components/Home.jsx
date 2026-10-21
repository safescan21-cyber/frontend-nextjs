import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Grid } from 'lucide-react';
import ShopPage from '../components/pages/ShopePage';
import { useGetHeroSlidesQuery } from '../components/store/heroApi';
import OfferBanner from './offers/OfferBanner';
import Seo from './Seo';
import { seoPages } from './pages/seoPages';
import TestimonialsSection from './testimonials/TestimonialsSection';

const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInDelay {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInDelay2 {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-fade-in { animation: fadeIn 1s ease-out forwards; }
  .animate-fade-in-delay { animation: fadeInDelay 1s ease-out 0.3s forwards; opacity: 0; }
  .animate-fade-in-delay-2 { animation: fadeInDelay2 1s ease-out 0.6s forwards; opacity: 0; }
  .marquee-track {
    display: flex;
    animation: marquee 30s linear infinite;
    width: max-content;
  }
`;

// Unsplash serves any width on request: give phones a small file and big screens a large one
const SLIDE_WIDTHS = [640, 960, 1280, 1600];
const slideSrcSet = (url) => {
  if (!/^https:\/\/images\.unsplash\.com\//.test(url || '')) return undefined;
  const base = url.replace(/([?&])w=\d+&?/, '$1').replace(/[?&]$/, '');
  const join = base.includes('?') ? '&' : '?';
  return SLIDE_WIDTHS.map((w) => `${base}${join}w=${w} ${w}w`).join(', ');
};

// ── Fallback image (high‑quality, free) ──
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1524514587686-e2909d726e9b?w=1200';

// ── Running text marquee ──
const RunningData = () => {
  const messages = [
    { icon: '🏭', text: 'GMP-Ready Machinery for Pharma & Food' },
    { icon: '⭐', text: 'Industry-Leading Quality Guaranteed' },
    { icon: '🔥', text: 'New Arrivals Every Week' },
    { icon: '💰', text: 'Bulk Discounts Available – Contact Us' },
    { icon: '🔧', text: 'Expert Support & Custom Solutions' },
    { icon: '📦', text: 'Same-Day Dispatch on Stock Items' },
  ];
  const doubledMessages = [...messages, ...messages];
  return (
    <div className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 py-3 overflow-hidden shadow-lg mb-0 pb-0">
      <div className="relative flex items-center">
        <div className="marquee-track whitespace-nowrap text-white font-semibold text-sm sm:text-base md:text-lg">
          {doubledMessages.map((msg, idx) => (
            <span key={idx} className="mx-6 flex items-center gap-2">
              <span className="text-xl">{msg.icon}</span>
              <span>{msg.text}</span>
              <span className="mx-4 text-white/30">|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Default slides: pharma & food machinery (free Unsplash photos, no attribution required) ──
// Admin slides from the dashboard are shown alongside these, ordered by `order`.
const DEFAULT_SLIDES = [
  {
    id: 'default-1',
    url: 'https://images.unsplash.com/photo-1757578097654-fdae0f7cf008?w=1600&q=80&auto=format&fit=crop',
    title: 'Tablet Press & Coating Machines',
    subtitle: 'Rotary and single-punch presses, coating pans and dedusters for solid dosage',
    cta: 'Shop Now',
    ctaLink: '/shop?search=Tablet%20Press',
    offer: { type: 'new', value: 'GMP DESIGN', details: 'cGMP machines for tablets & nutraceuticals' },
    category: 'solid-dosage',
    order: 100,
  },
  {
    id: 'default-2',
    url: 'https://images.unsplash.com/photo-1778353776992-aa95383455cd?w=1600&q=80&auto=format&fit=crop',
    title: 'Capsule Filling Machines',
    subtitle: 'Manual, semi-automatic and fully automatic fillers for hard gelatin capsules',
    cta: 'Shop Now',
    ctaLink: '/shop?search=Capsule',
    offer: { type: 'default', value: 'BULK QUOTES', details: 'Request a quote for multiple machines' },
    category: 'capsule-filling',
    order: 101,
  },
  {
    id: 'default-3',
    url: 'https://images.unsplash.com/photo-1577401132921-cb39bb0adcff?w=1600&q=80&auto=format&fit=crop',
    title: 'Blister Packaging Lines',
    subtitle: 'Clean, Tamper-Evident Packaging for Tablets & Capsules',
    cta: 'Shop Now',
    ctaLink: '/shop?search=Blister%20Packaging',
    offer: { type: 'new', value: 'GMP DESIGN', details: 'Alu-PVC & Alu-Alu blister lines' },
    category: 'packaging',
    order: 102,
  },
  {
    id: 'default-4',
    url: 'https://images.unsplash.com/photo-1745420052527-a75fcc6aba58?w=1600&q=80&auto=format&fit=crop',
    title: 'Liquid & Bottle Filling Lines',
    subtitle: 'Syrups, suspensions, oils and sprays — filling, capping and labelling',
    cta: 'Shop Now',
    ctaLink: '/shop?search=Filling',
    offer: { type: 'new', value: 'FULL LINES', details: 'Filling, capping & labelling in one line' },
    category: 'liquid-processing',
    order: 103,
  },
  {
    id: 'default-5',
    url: 'https://images.unsplash.com/photo-1764745021344-317b80f09e40?w=1600&q=80&auto=format&fit=crop',
    title: 'Tube Filling & Sealing Machines',
    subtitle: 'For Ointments, Creams, Gels & Lotions — Aluminium & Plastic Tubes',
    cta: 'Shop Now',
    ctaLink: '/shop?search=Tube%20Filling%20Machine',
    offer: { type: 'new', value: 'TUBE LINES', details: 'Plastic, laminated & aluminium tubes' },
    category: 'liquid-processing',
    order: 104,
  },
  {
    id: 'default-6',
    url: 'https://images.unsplash.com/photo-1717386255773-a456c611dc4e?w=1600&q=80&auto=format&fit=crop',
    title: 'Granulation Equipment',
    subtitle: 'Wet & Dry Granulation Systems for Consistent Tablet Quality',
    cta: 'Shop Now',
    ctaLink: '/shop?search=Granulation',
    offer: { type: 'new', value: 'WET & DRY', details: 'High-shear & fluid bed granulators' },
    category: 'solid-dosage',
    order: 105,
  },
  {
    id: 'default-7',
    url: 'https://images.unsplash.com/photo-1513828170880-00eeeac21306?w=1600&q=80&auto=format&fit=crop',
    title: 'Mixing & Process Vessels',
    subtitle: 'Blenders, sigma mixers and stainless steel process tanks',
    cta: 'Shop Now',
    ctaLink: '/shop?search=Mixer',
    offer: { type: 'new', value: 'SS 316L', details: 'Hygienic stainless steel construction' },
    category: 'mixing',
    order: 106,
  },
  {
    id: 'default-8',
    url: 'https://images.unsplash.com/photo-1754372069872-3fef8a815c87?w=1600&q=80&auto=format&fit=crop',
    title: 'Cleanroom & Sterile Processing',
    subtitle: 'Equipment for aseptic filling, sterile areas and controlled environments',
    cta: 'Enquire Now',
    ctaLink: '/contact',
    offer: { type: 'new', value: 'STERILE', details: 'For aseptic & cleanroom areas' },
    category: 'sterile',
    order: 107,
  },
  {
    id: 'default-9',
    url: 'https://images.unsplash.com/photo-1762330018258-2cf9b8f80618?w=1600&q=80&auto=format&fit=crop',
    title: 'Food Processing Equipment',
    subtitle: 'Hygienic machines for mixing, filling, sealing and packing food products',
    cta: 'Shop Now',
    ctaLink: '/shop',
    offer: { type: 'new', value: 'FOOD GRADE', details: 'Machines for food manufacturers' },
    category: 'food-processing',
    order: 108,
  },
  {
    id: 'default-10',
    url: 'https://images.unsplash.com/photo-1602052577122-f73b9710adba?w=1600&q=80&auto=format&fit=crop',
    title: 'QC & Laboratory Equipment',
    subtitle: 'Analytical balances, testers and instruments for QC and R&D labs',
    cta: 'Shop Now',
    ctaLink: '/shop?search=Balance',
    offer: { type: 'default', value: 'QC & R&D', details: 'Balances, testers & lab instruments' },
    category: 'lab-equipment',
    order: 109,
  },
  {
    id: 'default-11',
    url: 'https://images.unsplash.com/photo-1787039467622-ddec5c24320c?w=1600&q=80&auto=format&fit=crop',
    title: 'Genuine Spares & Change Parts',
    subtitle: 'Punches, Dies, Filling Nozzles, Belts & Wear Components',
    cta: 'Browse Spares',
    ctaLink: '/shop?search=Spares',
    offer: { type: 'default', value: 'SPARES', details: 'For tablet, capsule & filling machines' },
    category: 'spares',
    order: 110,
  },
];

// ── Map API slide to component shape ──
const mapApiSlide = (slide) => ({
  id: slide._id || slide.id,
  url: slide.imageUrl || slide.image || slide.url || slide.mediaUrl || '',
  title: slide.title || '',
  subtitle: slide.subtitle || slide.description || '',
  cta: slide.ctaText || slide.cta || 'Shop Now',
  ctaLink: slide.ctaLink || slide.link || '#',
  offer:
    slide.offer ||
    (slide.offerValue
      ? { type: slide.offerType || 'default', value: slide.offerValue, details: slide.offerDetails }
      : null),
  category: slide.category || '',
  order: slide.order ?? 999, // default high order if missing
});

const Home = () => {
  const { data: heroSlidesData, isLoading: heroSlidesLoading, isError: heroSlidesError } = useGetHeroSlidesQuery();

  // ── Merge admin slides + default slides, sorted by order ──
  const images = (() => {
    let adminSlides = [];
    if (!heroSlidesLoading && !heroSlidesError && Array.isArray(heroSlidesData) && heroSlidesData.length > 0) {
      adminSlides = heroSlidesData
        .map(mapApiSlide)
        .filter(s => s.url); // only keep slides with a valid URL
    }
    // Combine and sort by order
    const combined = [...adminSlides, ...DEFAULT_SLIDES];
    return combined.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  })();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [slideDuration, setSlideDuration] = useState(5000);
  const autoPlayRef = useRef();

  // Keep index in range
  useEffect(() => {
    if (currentIndex >= images.length) {
      setCurrentIndex(0);
    }
  }, [images.length, currentIndex]);

  useEffect(() => {
    if (isAutoPlaying && images.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, slideDuration);
    }
    return () => clearInterval(autoPlayRef.current);
  }, [isAutoPlaying, images.length, slideDuration]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  const goToSlide = (index) => {
    setCurrentIndex(index);
    if (isAutoPlaying) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = setInterval(() => nextSlide(), slideDuration);
    }
  };

  const speedOptions = [
    { label: 'Slow', value: 7000 },
    { label: 'Normal', value: 5000 },
    { label: 'Fast', value: 3000 },
  ];

  const getOfferBadgeColor = (type) => {
    switch (type) {
      case 'discount': return 'bg-green-500';
      case 'flash': return 'bg-red-500';
      case 'new': return 'bg-blue-500';
      default: return 'bg-yellow-500';
    }
  };

  const getOfferIcon = (type) => {
    switch (type) {
      case 'discount': return <span className="text-xs">%</span>;
      case 'flash': return <span className="text-xs">⚡</span>;
      case 'new': return <span className="text-xs">✨</span>;
      default: return <span className="text-xs">🏷️</span>;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'loadcells': return <span className="text-xs">⚙️</span>;
      case 'scales': return <span className="text-xs">📏</span>;
      case 'digital': return <span className="text-xs">💻</span>;
      case 'weighing': return <span className="text-xs">⚖️</span>;
      case 'packaging': return <span className="text-xs">📦</span>;
      case 'solid-dosage': return <span className="text-xs">💊</span>;
      case 'liquid-processing': return <span className="text-xs">🧴</span>;
      case 'spares': return <span className="text-xs">🔩</span>;
      default: return <span className="text-xs">🔧</span>;
    }
  };

  // ── Image error handler ──
  const handleImageError = (e) => {
    if (e.target.src !== FALLBACK_IMAGE) {
      e.target.src = FALLBACK_IMAGE;
    }
  };

  return (
    <>
      <Seo {...seoPages.home} />
      {/* The page's one h1 (the slider and sections below use h2) */}
      <h1 className="sr-only">Food Pharma Machinery — industrial pharma and food processing equipment, load cells and weighing scales</h1>
      <style>{styles}</style>
      <div className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] w-full overflow-hidden bg-black">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-blue-900 to-gray-800"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {images.map((image, index) => (
          <div
            key={image.id}
            className={`absolute top-0 left-0 w-full h-full transition-all duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'
            }`}
          >
            {/* First slide loads straight away (it is the first thing visitors see); the rest load in the background */}
            <img
              src={image.url}
              srcSet={slideSrcSet(image.url)}
              sizes="100vw"
              alt={image.title}
              className="w-full h-full object-cover"
              onError={handleImageError}
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'low'}
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

            {image.offer && (
              <div className={`absolute top-4 sm:top-8 left-4 sm:left-8 z-20 ${getOfferBadgeColor(image.offer.type)} text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-lg`}>
                <div className="flex items-center space-x-2">
                  {getOfferIcon(image.offer.type)}
                  <span className="font-bold text-xs sm:text-sm">{image.offer.value}</span>
                </div>
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-4xl mx-auto">
                <div className="flex items-center justify-center mb-2 sm:mb-4 space-x-2">
                  {getCategoryIcon(image.category)}
                  <span className="text-xs sm:text-sm uppercase tracking-wider text-blue-300">
                    {image.category || 'Professional'}
                  </span>
                </div>
                {/* Slides use h2 — the page has a single h1 below */}
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-2 sm:mb-4 animate-fade-in drop-shadow-lg">
                  {image.title}
                </h2>
                <p className="text-base sm:text-lg md:text-2xl lg:text-3xl mb-4 sm:mb-6 animate-fade-in-delay drop-shadow-md">
                  {image.subtitle}
                </p>
                {image.offer?.details && (
                  <div className="mb-4 sm:mb-6 animate-fade-in-delay-2">
                    <p className="text-xs sm:text-sm bg-black/30 backdrop-blur-sm inline-block px-3 sm:px-4 py-1 sm:py-2 rounded-full">
                      {image.offer.details}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => window.location.href = image.ctaLink || '#'}
                  className="bg-blue-600 text-white px-6 sm:px-8 md:px-10 py-2 sm:py-3 md:py-4 rounded-full font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base md:text-lg shadow-lg animate-fade-in-delay-2 flex items-center space-x-2 mx-auto"
                >
                  <span>{image.cta}</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {images.length > 1 && (
          <>
            <button onClick={prevSlide} className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all">
              <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
            </button>
            <button onClick={nextSlide} className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all">
              <ChevronRight size={20} className="sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2 sm:space-x-3">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'bg-blue-500 w-6 sm:w-8' : 'bg-white/50 w-1.5 sm:w-2'
                }`}
              />
            ))}
          </div>
        )}

        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-20 flex justify-between items-center">
          <div className="flex space-x-1 sm:space-x-2">
            {/* Slide grid and speed controls are desktop-only; on phones they crowd the offer badge */}
            <button onClick={() => setShowThumbnails(!showThumbnails)} aria-label="Show all slides" className="hidden md:block bg-black/50 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg">
              <Grid size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            {images.length > 1 && (
              <select
                value={slideDuration}
                onChange={(e) => setSlideDuration(parseInt(e.target.value))}
                aria-label="Slide speed"
                className="hidden md:block bg-black/50 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm"
              >
                {speedOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
            {images.length > 1 && (
              <button onClick={() => setIsAutoPlaying(!isAutoPlaying)} aria-label={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'} className="bg-black/50 backdrop-blur-sm text-white p-1.5 sm:p-2 rounded-lg">
                {isAutoPlaying ? <Pause size={14} className="sm:w-4 sm:h-4" /> : <Play size={14} className="sm:w-4 sm:h-4" />}
              </button>
            )}
          </div>
        </div>

        {showThumbnails && (
          <div className="absolute bottom-16 sm:bottom-24 left-0 right-0 z-30 overflow-x-auto py-2 sm:py-4 px-4 sm:px-8 bg-black/50 backdrop-blur-sm">
            <div className="flex space-x-2 justify-center">
              {images.map((image, idx) => (
                <button
                  key={image.id}
                  onClick={() => goToSlide(idx)}
                  className={`flex-shrink-0 w-16 h-12 sm:w-24 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    currentIndex === idx ? 'border-blue-500 scale-105' : 'border-gray-400 opacity-70'
                  }`}
                >
                  <img
                    src={image.url}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <OfferBanner />
      <RunningData />
      <div className="[&>*:first-child]:mt-0 [&>*:first-child]:pt-0 -mt-1">
        <ShopPage embedded />
      </div>
      <TestimonialsSection />
    </>
  );
};

export default Home;