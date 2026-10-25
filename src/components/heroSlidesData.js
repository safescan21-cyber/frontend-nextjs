// Hero slider data shared by the home page (components/Home.jsx) and the server page,
// which preloads the first slide's image so it starts downloading before the app's JS.
import { sizedImage } from '../utlis/imageUrl';

// Unsplash serves any width on request: give phones a small file and big screens a large one
export const SLIDE_WIDTHS = [640, 960, 1280, 1600];
export const slideSrcSet = (url) => {
  // Cloudinary slides (uploaded by the admin): resized, compressed copies
  if (sizedImage(url, 640) !== url) return SLIDE_WIDTHS.map((w) => `${sizedImage(url, w)} ${w}w`).join(', ');
  if (!/^https:\/\/images\.unsplash\.com\//.test(url || '')) return undefined;
  const base = url.replace(/([?&])w=\d+&?/, '$1').replace(/[?&]$/, '');
  const join = base.includes('?') ? '&' : '?';
  return SLIDE_WIDTHS.map((w) => `${base}${join}w=${w} ${w}w`).join(', ');
};

// A small copy for the slide thumbnails (Unsplash at 240 px instead of the 1600 px slide)
export const slideThumb = (url) => (/^https:\/\/images\.unsplash\.com\//.test(url || '')
  ? url.replace(/([?&])w=\d+/, '$1w=240')
  : sizedImage(url, 240));

// ── Default slides: pharma & food machinery (free Unsplash photos, no attribution required) ──
// Admin slides from the dashboard are shown alongside these, ordered by `order`.
export const DEFAULT_SLIDES = [
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
export const mapApiSlide = (slide) => ({
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

// Admin slides (valid URLs) and the default slides, in display order
export const orderedSlides = (apiSlides) => {
  const admin = Array.isArray(apiSlides) ? apiSlides.map(mapApiSlide).filter((s) => s.url) : [];
  return [...admin, ...DEFAULT_SLIDES].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
};
