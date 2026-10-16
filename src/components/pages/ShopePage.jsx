import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { addToCart, removeFromCart, selectCartItems } from '../store/cartSlice';
import { useFetchAllProductsQuery } from '../store/products/productsApi';
import toast from 'react-hot-toast';
import Seo from '../Seo';
import ShareProduct from '../shop/ShareProduct';


// Empty boxes = no limit, so expensive machines are never hidden by default
const DEFAULT_PRICE = { min: '', max: '' };

// Fetch ALL products once. Category / price / search / sort are applied
// client-side so the category list never shrinks and filters always work.
const API_PARAMS = { page: 1, limit: 1000 };

// Search: menu links send phrases like "Tablet Press Machines" or "Dryers & Sifters".
// Ignore words that only say what *kind* of thing it is (and one-letter words),
// match singular/plural, and look in the name, category and description.
const GENERIC_WORDS = new Set(['machine', 'machines', 'equipment', 'system', 'systems', 'line', 'lines', 'unit', 'units', 'and', 'the', 'for', 'of', 'with']);
const stem = (w) => w.replace(/(ss|sh|ch|x)es$/, '$1').replace(/([^s])s$/, '$1');
const searchWords = (term) => {
  const words = term.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !GENERIC_WORDS.has(w)).map(stem);
  return words.length ? words : [term.toLowerCase().trim()];
};
const tokens = (text) => String(text || '').replace(/<[^>]+>/g, ' ').replace(/-/g, ' ').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
// A search word matches the start of a word in the text: "press" finds "presses", not "spray"
const countHits = (words, toks) => words.filter((w) => toks.some((t) => t.startsWith(w))).length;
// Ranking: a match in the category counts most, then the name, then the description
const scoreProduct = (p, words) => {
  const name = tokens(p.name);
  const category = tokens(p.category);
  const any = countHits(words, [...name, ...category, ...tokens(p.description)]);
  return { any, rank: countHits(words, category) * 3 + countHits(words, name) * 2 + any };
};

// embedded = shown inside the home page: the home page owns the title and the <h1>
const ShopPage = ({ embedded = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [searchParams] = useSearchParams();
  // ?category=tablet-press (menu/footer links) pre-selects that category
  const urlCategory = searchParams.get('category') || 'all';
  const [filter, setFilter] = useState(urlCategory);
  const [prevUrlCategory, setPrevUrlCategory] = useState(urlCategory);
  if (urlCategory !== prevUrlCategory) {
    setPrevUrlCategory(urlCategory);
    setFilter(urlCategory);
  }
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false); // phones/tablets: filter panel folds away
  const [priceRange, setPriceRange] = useState(DEFAULT_PRICE);
  // Read ?search= from the URL (e.g. from the navbar search) and keep it in sync
  const urlSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearchTerm(urlSearch);
  }
  const [addedProductId, setAddedProductId] = useState(null);

  const cartItems = useSelector(selectCartItems);

  const {
    data: apiData,
    error: apiError,
    isLoading,
  } = useFetchAllProductsQuery(API_PARAMS);

  const products = useMemo(() => apiData?.products || [], [apiData]);

  // Categories always built from the full product list
  const categories = useMemo(
    () => ['all', ...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  // Product count per category (shown next to each category)
  const categoryCounts = useMemo(() => {
    const counts = { all: products.length };
    products.forEach((p) => {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Client-side category + price + search + sorting
  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim();
    const min = Number(priceRange.min) || 0;
    const max = priceRange.max === '' ? Infinity : Number(priceRange.max);

    let list = products.filter((product) => {
      if (filter !== 'all' && product.category !== filter) return false;
      if (product.price < min || product.price > max) return false;
      return true;
    });
    if (term) {
      const words = searchWords(term);
      const scored = list.map((p) => ({ p, s: scoreProduct(p, words) })).filter((x) => x.s.any > 0);
      const exact = scored.filter((x) => x.s.any === words.length);
      // Nothing matches every word: show the closest matches rather than an empty page.
      // Best matches first (the price/rating sort below still applies when chosen).
      list = (exact.length ? exact : scored).sort((a, b) => b.s.rank - a.s.rank).map((x) => x.p);
    }

    return list
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [products, filter, priceRange, searchTerm, sortBy]);

  const activeFilterCount =
    (filter !== 'all' ? 1 : 0) + (priceRange.min !== '' || priceRange.max !== '' ? 1 : 0) + (sortBy !== 'default' ? 1 : 0);

  const resetFilters = () => {
    setFilter('all');
    setSortBy('default');
    setPriceRange(DEFAULT_PRICE);
    setSearchTerm('');
  };

  // ── 🔐 LOGIN GUARD ──
  const requireAuth = (redirectTo = '/shop') => {
    if (!user) {
      toast.error('Please login to continue');
      navigate('/login', { state: { from: redirectTo } });
      return false;
    }
    return true;
  };

  // ── 🛒 Add to Cart ──
  const handleAddToCart = (product) => {
    if (!requireAuth('/shop')) return;

    const thumbnail = product.images && product.images.length > 0 ? product.images[0] : '';
    const isAlreadyInCart = cartItems.some((item) => item._id === product._id);

    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: thumbnail,
        quantity: 1,
        category: product.category,
        color: product.color,
      })
    );

    window.dispatchEvent(
      new CustomEvent('cartItemAdded', {
        detail: { name: product.name, isNew: !isAlreadyInCart },
      })
    );

    setAddedProductId(product._id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  // ── 🔢 Quantity Increase ──
  const handleIncreaseQuantity = (product) => {
    if (!requireAuth('/shop')) return;

    const existingItem = cartItems.find((item) => item._id === product._id);
    const newQuantity = (existingItem?.quantity || 0) + 1;

    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        quantity: newQuantity,
        category: product.category,
        color: product.color,
      })
    );

    toast.success(`Quantity updated to ${newQuantity}`);
  };

  // ── 🔢 Quantity Decrease ──
  const handleDecreaseQuantity = (product) => {
    if (!requireAuth('/shop')) return;

    const existingItem = cartItems.find((item) => item._id === product._id);
    if (!existingItem || existingItem.quantity <= 1) {
      toast.error('Minimum quantity is 1. Remove item from cart instead.');
      return;
    }

    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        quantity: existingItem.quantity - 1,
        category: product.category,
        color: product.color,
      })
    );

    toast.success(`Quantity decreased to ${existingItem.quantity - 1}`);
  };

  // ── 🗑️ Remove from Cart ──
  const handleRemoveFromCart = (productId) => {
    if (!requireAuth('/shop')) return;
    dispatch(removeFromCart(productId));
    toast.success('Item removed from cart');
  };

  const isInCart = (productId) => cartItems.some((item) => item._id === productId);
  const getCartQuantity = (productId) => {
    const item = cartItems.find((item) => item._id === productId);
    return item ? item.quantity : 0;
  };

  const formatPrice = (price) =>
    '₹' + Number(price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  if (apiError) {
    console.error('API error:', apiError);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-500 mb-2">Failed to load products</h2>
          <p className="text-gray-500">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!embedded && (
        <Seo
          title="Shop Pharma & Food Processing Machinery"
          description="Buy tablet presses, capsule fillers, load cells, weighing scales and packaging machines. Built to cGMP standards, with genuine spares and support."
          path="/shop"
        />
      )}
      <div className="bg-gray-50 min-h-screen pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 md:py-16">
          <div className="container mx-auto px-4 text-center">
            {embedded ? (
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">Pharma &amp; Food Processing Machinery</h2>
            ) : (
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">Pharma &amp; Food Processing Machinery</h1>
            )}
            <p className="text-base md:text-xl text-blue-100 max-w-2xl mx-auto">
              Tablet presses, capsule fillers, packaging lines and lab equipment for pharma and food manufacturers
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-5 md:py-12">
          <div className="flex flex-col lg:flex-row gap-5 lg:gap-8">
            {/* Sidebar Filters */}
            <div className="lg:w-1/4">
              {/* Phones/tablets: search box + a Filters button instead of the full panel */}
              <div className="flex gap-2 lg:hidden">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search machines..."
                  aria-label="Search machines in the shop"
                  className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowFilters((v) => !v)}
                  aria-expanded={showFilters}
                  aria-controls="shop-filters"
                  className={`relative inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm ${showFilters ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-700'}`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
                  </svg>
                  Filters
                  {activeFilterCount > 0 && (
                    <span className={`ml-0.5 rounded-full px-1.5 text-xs ${showFilters ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>{activeFilterCount}</span>
                  )}
                </button>
              </div>

              <div id="shop-filters" className={`${showFilters ? 'block mt-3' : 'hidden'} lg:block lg:mt-0 bg-white rounded-lg shadow-md p-5 lg:p-6 lg:sticky lg:top-24`}>
                <h2 className="text-xl font-bold text-gray-800 mb-4 hidden lg:block">Filters</h2>

                <div className="mb-6 hidden lg:block">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={cat}
                          checked={filter === cat}
                          onChange={(e) => setFilter(e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700 capitalize flex-1">
                          {cat === 'all' ? 'All Products' : cat.replace(/-/g, ' ')}
                        </span>
                        <span className="text-xs text-gray-400">({categoryCounts[cat] || 0})</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (₹)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="0"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, min: e.target.value === '' ? '' : Number(e.target.value) })
                      }
                      className="w-1/2 px-2 py-1 border border-gray-300 rounded-md text-sm"
                      placeholder="Min"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      min="0"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, max: e.target.value === '' ? '' : Number(e.target.value) })
                      }
                      className="w-1/2 px-2 py-1 border border-gray-300 rounded-md text-sm"
                      placeholder="No limit"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="default">Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>

                <button
                  onClick={resetFilters}
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:w-3/4">
              <div className="mb-6 flex justify-between items-center">
                <p className="text-gray-600">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your filters or search term</p>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => {
                    const productImage =
                      product.images && product.images.length > 0
                        ? product.images[0]
                        : 'https://picsum.photos/id/20/400/300';

                    const isInStock = product.stock && product.stock > 0;
                    const stockCount = product.stock || 0;
                    const isReadyToDispatch = product.readyToDispatch === true;
                    const warrantyMonths = product.warranty && product.warranty > 0 ? product.warranty : null;
                    const cartQuantity = getCartQuantity(product._id);
                    const productInCart = isInCart(product._id);

                    return (
                      <div
                        key={product._id}
                        className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
                      >
                        <ShareProduct product={product} className="absolute left-2 top-2 z-10" />
                        <Link to={`/shop/${product._id}`}>
                          <div className="relative overflow-hidden bg-gray-100 h-48">
                            <img
                              src={productImage}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = 'https://picsum.photos/id/20/400/300';
                              }}
                            />
                            {product.oldPrice && (
                              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                SAVE {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                              </span>
                            )}
                            {!isInStock && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm">
                                  Out of Stock
                                </span>
                              </div>
                            )}
                            {addedProductId === product._id && (
                              <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center animate-pulse">
                                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                  Added to Cart!
                                </span>
                              </div>
                            )}
                          </div>
                        </Link>

                        <div className="p-4">
                          <Link to={`/shop/${product._id}`}>
                            <h3 className="font-semibold text-gray-800 mb-1 hover:text-blue-600 transition-colors line-clamp-2 min-h-[3rem]">
                              {product.name}
                            </h3>
                          </Link>

                          {product.rating ? (
                            <div className="flex items-center gap-1 mb-2">
                              <span className="text-xs text-gray-500">({product.rating.toFixed(1)})</span>
                            </div>
                          ) : null}

                          <p className="text-sm text-gray-500 mb-2 capitalize">
                            {product.category?.replace(/-/g, ' ')}
                          </p>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {isInStock ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                In Stock ({stockCount})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                Out of Stock
                              </span>
                            )}

                            {isReadyToDispatch && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Ready to Ship
                              </span>
                            )}

                            {warrantyMonths && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {warrantyMonths} mo warranty
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl font-bold text-blue-600">{formatPrice(product.price)}</span>
                            {product.oldPrice && (
                              <span className="text-sm text-gray-400 line-through">{formatPrice(product.oldPrice)}</span>
                            )}
                          </div>

                          {/* ── 🛒 CART CONTROLS ── */}
                          {!productInCart ? (
                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={!isInStock}
                              className={`w-full py-2 rounded-md font-medium transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 ${
                                !isInStock
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 15v6" />
                              </svg>
                              {!isInStock ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <button
                                onClick={() => handleDecreaseQuantity(product)}
                                className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors"
                                title="Decrease quantity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>

                              <div className="flex-1 text-center py-2 bg-green-50 rounded-lg border border-green-200">
                                <span className="text-green-700 font-bold text-lg">{cartQuantity}</span>
                                <span className="text-green-600 text-xs ml-1">in cart</span>
                              </div>

                              <button
                                onClick={() => handleIncreaseQuantity(product)}
                                disabled={!isInStock || cartQuantity >= stockCount}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-colors ${
                                  !isInStock || cartQuantity >= stockCount
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                                }`}
                                title="Increase quantity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>

                              <button
                                onClick={() => handleRemoveFromCart(product._id)}
                                className="w-10 h-10 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors"
                                title="Remove from cart"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}

                          {productInCart && (
                            <button
                              onClick={() => {
                                if (!requireAuth('/cart')) return;
                                navigate('/cart');
                              }}
                              className="w-full mt-2 py-2 rounded-md font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                              View Cart & Checkout
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopPage;