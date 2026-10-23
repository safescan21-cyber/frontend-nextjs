'use client';
import React from 'react';
import { Link } from '../../shell/router';
import { Search, Home, ShoppingBag, Phone } from 'lucide-react';
import Seo from '../Seo';

// Shown for any URL that doesn't exist. "noindex" stops Google listing it
// (this is a single-page app, so the server can't send a real 404 status).
const NotFound = () => (
  <>
    <Seo title="Page not found" description="The page you're looking for doesn't exist." noindex />
    <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4 pb-24 pt-8">
      <div className="max-w-lg text-center">
        <p className="text-6xl font-black text-amber-500">404</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-800 md:text-3xl">We couldn't find that page</h1>
        <p className="mt-2 text-slate-600">The link may be old or mistyped. Try one of these instead:</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['/', 'Home', Home],
            ['/shop', 'Shop', ShoppingBag],
            ['/search', 'Search', Search],
            ['/contact', 'Contact', Phone],
          ].map(([to, label, Icon]) => (
            <Link key={to} to={to} className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 bg-white p-3 text-sm font-medium text-slate-700 hover:border-amber-300">
              <Icon className="h-5 w-5 text-amber-500" /> {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </>
);

export default NotFound;
