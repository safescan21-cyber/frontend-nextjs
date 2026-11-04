'use client';
// Our Haridwar address (Contact, Haridwar and Uttarakhand pages). No Google map yet: searching the
// address pins B-49 Shivalik Nagar, not Q-37, so a map needs the exact map link or coordinates.
import { MapPin, Phone } from 'lucide-react';
import { COMPANY, MAP_ADDRESS } from '../seo/organization';

export default function LocationMap({ heading = 'Find us in Haridwar, Uttarakhand', className = 'mt-10', dark = false }) {
  return (
    <section className={className} aria-label="Our location">
      <h2 className={`text-xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{heading}</h2>
      <p className={`mt-2 flex gap-2 text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" aria-hidden="true" />
        <span>{COMPANY.legalName}, {MAP_ADDRESS}</span>
      </p>
      <a href={`tel:${COMPANY.telephone.replace(/-/g, '')}`} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
        <Phone className="h-4 w-4" aria-hidden="true" /> Call us to plan a visit
      </a>
    </section>
  );
}
