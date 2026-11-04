'use client';
// Our Haridwar address with a Google map (Contact, Haridwar and Uttarakhand pages). Google Maps
// sets its own cookies, so the map only loads by itself for visitors who allowed preference
// cookies; everyone else gets a button. The address and directions link always show.
import { useEffect, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { COMPANY, MAP_ADDRESS, MAP_URL } from '../seo/organization';

export default function LocationMap({ heading = 'Find us in Haridwar, Uttarakhand', className = 'mt-10', dark = false }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (JSON.parse(localStorage.getItem('cookie_consent') || '{}').preferences) setShow(true);
    } catch { /* no storage: the button still works */ }
  }, []);
  const text = dark ? 'text-slate-300' : 'text-slate-600';
  return (
    <section className={className} aria-label="Our location">
      <h2 className={`text-xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{heading}</h2>
      <p className={`mt-2 flex gap-2 text-sm ${text}`}>
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" aria-hidden="true" />
        <span>{COMPANY.legalName}, {MAP_ADDRESS}</span>
      </p>
      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        {show ? (
          <iframe
            title={`Map: ${COMPANY.legalName}, Haridwar`}
            src={`https://www.google.com/maps?q=${encodeURIComponent(MAP_ADDRESS)}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-72 w-full border-0"
          />
        ) : (
          <div className="flex h-40 items-center justify-center p-4">
            <button type="button" onClick={() => setShow(true)} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
              Show map (Google Maps)
            </button>
          </div>
        )}
      </div>
      <a href={MAP_URL} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
        <Navigation className="h-4 w-4" aria-hidden="true" /> Get directions
      </a>
    </section>
  );
}
