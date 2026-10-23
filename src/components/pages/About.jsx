'use client';
import React from 'react';
import { Link } from '../../shell/router';
import {
  Shield, Users, Clock, Zap, CheckCircle, TrendingUp, Eye,
  Settings, HeartHandshake, Package, Wrench, FileText,
} from 'lucide-react';

import Seo from '../Seo';
import { seoPages } from './seoPages';
import TestimonialsSection from '../testimonials/TestimonialsSection';

const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Food Pharma Machinery',
  url: 'https://www.foodpharmamachinery.com/about',
  description: seoPages.about.description,
  isPartOf: {
    '@type': 'WebSite',
    name: 'Food Pharma Machinery',
    url: 'https://www.foodpharmamachinery.com',
  },
};

const HIGHLIGHTS = [
  { icon: Package, title: 'Machinery Range', text: 'Tablet presses, capsule fillers, packaging and processing equipment' },
  { icon: Shield, title: 'Quality Focus', text: 'Equipment built to cGMP standards' },
  { icon: Wrench, title: 'Genuine Spares', text: 'Original parts to keep your line running' },
  { icon: Users, title: 'Technical Support', text: 'Help with selection, installation and service' },
];

const REASONS = [
  { icon: Settings, title: 'Right-Fit Advice', desc: 'We help you choose machinery that matches your product, capacity and budget.' },
  { icon: FileText, title: 'Clear Specifications', desc: 'Straightforward technical details so you can compare options with confidence.' },
  { icon: Clock, title: 'Fast Quotes', desc: 'Send your requirement and get pricing and availability without delay.' },
  { icon: Shield, title: 'Compliance Focus', desc: 'Equipment suited to cGMP-regulated pharma and food environments.' },
  { icon: Package, title: 'Genuine Spares', desc: 'Original spare parts available for the machinery we supply.' },
  { icon: Zap, title: 'After-Sales Support', desc: 'Technical help after delivery, from installation to troubleshooting.' },
];

const About = () => (
  <>
    <Seo {...seoPages.about} jsonLd={aboutJsonLd} />

    <div className="bg-slate-900 text-slate-300 min-h-screen">
      {/* ─── HERO ─── */}
      <header className="relative bg-gradient-to-br from-slate-800 to-slate-900 py-20 px-4 md:py-28 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            About <span className="text-orange-500">Food Pharma Machinery</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-3xl mx-auto">
            We supply tablet presses, capsule fillers, packaging machines and weighing equipment to
            pharma and food manufacturers, built to cGMP standards.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/bulk-quote"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-full transition shadow-lg"
            >
              Get a Quote
            </Link>
            <Link
              to="/products"
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-full transition"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </header>

      {/* ─── WHO WE ARE ─── */}
      <section className="py-16 px-4 max-w-6xl mx-auto" aria-labelledby="who-we-are">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <article>
            <h2 id="who-we-are" className="text-3xl md:text-4xl font-bold text-white">Who We Are</h2>
            <div className="w-16 h-1 bg-orange-500 mt-2 mb-6" aria-hidden="true"></div>
            <p className="text-slate-400 text-lg leading-relaxed">
              Food Pharma Machinery is a <strong>B2B supplier of pharmaceutical and food processing
              machinery</strong>. We help manufacturers find the right equipment for their plant, from a
              single machine to a complete production line.
            </p>
            <p className="text-slate-400 text-lg leading-relaxed mt-4">
              Our focus is on precision, reliability and compliance with{' '}
              <abbr title="Current Good Manufacturing Practice">cGMP</abbr> expectations. We work with you
              from the first enquiry through delivery and support.
            </p>
          </article>
          <div className="grid grid-cols-2 gap-4" role="list">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="bg-slate-800 p-6 rounded-2xl border border-slate-700" role="listitem">
                <h.icon className="text-orange-500 w-10 h-10 mb-3" aria-hidden="true" />
                <h3 className="text-white font-bold text-lg">{h.title}</h3>
                <p className="text-slate-500 text-sm">{h.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MISSION, VISION, VALUES ─── */}
      <section className="bg-slate-800/50 py-16 px-4" aria-labelledby="core-principles">
        <div className="max-w-6xl mx-auto">
          <h2 id="core-principles" className="text-3xl md:text-4xl font-bold text-white text-center">
            Our <span className="text-orange-500">Core</span> Principles
          </h2>
          <div className="w-16 h-1 bg-orange-500 mx-auto mt-2 mb-10" aria-hidden="true"></div>
          <div className="grid md:grid-cols-3 gap-8">
            <article className="bg-slate-900 p-8 rounded-2xl border border-slate-700 hover:border-orange-500 transition">
              <div className="bg-orange-600/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="text-orange-500 w-7 h-7" aria-hidden="true" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Mission</h3>
              <p className="text-slate-400 leading-relaxed">
                To help pharma and food manufacturers get dependable machinery that improves
                productivity and protects product quality.
              </p>
            </article>
            <article className="bg-slate-900 p-8 rounded-2xl border border-slate-700 hover:border-orange-500 transition">
              <div className="bg-orange-600/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Eye className="text-orange-500 w-7 h-7" aria-hidden="true" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Vision</h3>
              <p className="text-slate-400 leading-relaxed">
                To be a trusted source for industrial pharma and food machinery, known for honest
                advice and reliable support.
              </p>
            </article>
            <article className="bg-slate-900 p-8 rounded-2xl border border-slate-700 hover:border-orange-500 transition">
              <div className="bg-orange-600/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <HeartHandshake className="text-orange-500 w-7 h-7" aria-hidden="true" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Values</h3>
              <ul className="text-slate-400 space-y-2">
                {['Integrity & transparency', 'Customer-focused service', 'Uncompromising quality', 'Safety & compliance'].map((v) => (
                  <li key={v} className="flex items-start gap-2">
                    <CheckCircle className="text-orange-500 w-4 h-4 mt-1 shrink-0" aria-hidden="true" />
                    {v}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* ─── WHY CHOOSE US ─── */}
      <section className="py-16 px-4 max-w-6xl mx-auto" aria-labelledby="why-choose">
        <h2 id="why-choose" className="text-3xl md:text-4xl font-bold text-white text-center">
          Why <span className="text-orange-500">Choose Us</span>
        </h2>
        <div className="w-16 h-1 bg-orange-500 mx-auto mt-2 mb-10" aria-hidden="true"></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {REASONS.map((item) => (
            <article key={item.title} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-orange-500 transition group">
              <div className="bg-orange-600/20 w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-600/40 transition">
                <item.icon className="text-orange-500 w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-white font-bold text-lg">{item.title}</h3>
              <p className="text-slate-400 text-sm mt-1">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIALS (approved, real customers) ─── */}
      <TestimonialsSection dark />

      {/* ─── CALL TO ACTION ─── */}
      <section className="py-16 px-4" aria-labelledby="cta">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-10 text-center border border-slate-700">
          <h2 id="cta" className="text-3xl font-bold text-white">
            Ready to <span className="text-orange-500">Partner</span> With Us?
          </h2>
          <p className="text-slate-400 text-lg mt-2 max-w-2xl mx-auto">
            Tell us about your project, whether it is a single machine or a full plant.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              to="/bulk-quote"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-full transition shadow-lg"
            >
              Get a Quote
            </Link>
            <Link
              to="/contact"
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-full transition"
            >
              Contact Us
            </Link>
            <Link
              to="/shop"
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-full transition"
            >
              View Our Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  </>
);

export default About;