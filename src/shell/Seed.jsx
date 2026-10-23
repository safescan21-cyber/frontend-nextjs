'use client';
// Puts data the server already fetched (serverData.js) into the RTK Query cache before
// the page renders, so the server sends finished HTML and the browser doesn't fetch
// the same thing again.
//   <Seed entries={[{ api: 'products', endpoint: 'fetchAllProducts', arg, value }]}>
import { useState } from 'react';
import { useStore } from 'react-redux';
import productsApi from '../components/store/products/productsApi';
import { heroApi } from '../components/store/heroApi';
import { reviewApi } from '../components/store/review/reviewApi';
import { jobsApi } from '../components/pages/dashboard/admin/jobs/jobsApi';

const APIS = { products: productsApi, hero: heroApi, reviews: reviewApi, jobs: jobsApi };

export default function Seed({ entries = [], children }) {
  const store = useStore();
  useState(() => {
    // Only what the store doesn't have yet. The header and footer read the same product
    // list: writing it again while they are on screen would make React redo this render.
    const state = store.getState();
    const byApi = {};
    for (const { api, endpoint, arg, value } of entries) {
      if (value === undefined || !APIS[api]) continue;
      if (APIS[api].endpoints[endpoint].select(arg)(state).data !== undefined) continue;
      (byApi[api] ||= []).push({ endpointName: endpoint, arg, value });
    }
    for (const [api, list] of Object.entries(byApi)) store.dispatch(APIS[api].util.upsertQueryEntries(list));
  });
  return children;
}
