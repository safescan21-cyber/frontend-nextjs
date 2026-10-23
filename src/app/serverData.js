// Data the public pages show, fetched on the server so the HTML arrives finished.
// Each function returns a <Seed> entry (shell/Seed.jsx): the same endpoint and
// arguments the page's RTK Query hook uses, so the browser finds it in its cache.
// The URLs must match the endpoints in components/store/*.
import { preload } from 'react-dom';
import { orderedSlides, slideSrcSet } from '../components/heroSlidesData';

const API = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.foodpharmamachinery.com').replace(/\/api\/?$/, '').replace(/\/$/, '');

// undefined when the API is down: the page then loads the data in the browser as before
export const getJson = async (path, revalidate = 60) => {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate } });
    return res.ok ? await res.json() : undefined;
  } catch {
    return undefined;
  }
};

// productsApi.fetchAllProducts
export const SHOP_PARAMS = { page: 1, limit: 1000 }; // what the shop, home and search pages ask for
export const productList = async (arg = SHOP_PARAMS) => {
  const { category, color, minPrice, maxPrice, page = 1, limit = 10 } = arg;
  const qs = new URLSearchParams({
    category: category || '',
    color: color || '',
    minPrice: minPrice || 0,
    maxPrice: maxPrice || '',
    page: page.toString(),
    limit: limit.toString(),
  }).toString();
  return { api: 'products', endpoint: 'fetchAllProducts', arg, value: await getJson(`/api/products/?${qs}`) };
};

// One product, its related products and reviews (SingleProduct.jsx)
export const productDetail = async (id) => {
  const [product, related, reviews] = await Promise.all([
    getJson(`/api/products/${id}`),
    getJson(`/api/products/related/${id}`),
    getJson(`/api/reviews/product/${id}`),
  ]);
  return [
    { api: 'products', endpoint: 'fetchProductById', arg: id, value: product },
    { api: 'products', endpoint: 'fetchRelatedProducts', arg: id, value: related },
    { api: 'reviews', endpoint: 'getReviewsByProductId', arg: id, value: reviews },
  ];
};

// heroApi.getHeroSlides. Also starts downloading the first slide with the HTML
// (it is the largest thing on screen, Google's LCP).
export const heroSlides = async () => {
  const slides = await getJson('/api/hero-slides', 300);
  const first = orderedSlides(Array.isArray(slides) ? slides : [])[0];
  if (first?.url) {
    const srcSet = slideSrcSet(first.url);
    preload(first.url, { as: 'image', fetchPriority: 'high', ...(srcSet && { imageSrcSet: srcSet, imageSizes: '100vw' }) });
  }
  return { api: 'hero', endpoint: 'getHeroSlides', arg: undefined, value: slides };
};

// jobsApi.getJobs with the career page's starting filters (CareerPage.jsx)
export const jobList = async () => {
  const arg = { department: 'all', type: 'all' };
  return { api: 'jobs', endpoint: 'getJobs', arg, value: await getJson(`/api/jobs/?${new URLSearchParams(arg)}`) };
};
