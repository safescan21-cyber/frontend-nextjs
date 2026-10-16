// pages/SearchPage.jsx
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, X, Filter, ChevronDown,
  Package, Shield, ArrowRight, Tag, Star, Truck,
  Clock, TrendingUp, Grid, List, ChevronRight, AlertCircle
} from 'lucide-react';
import { useFetchAllProductsQuery } from '../store/products/productsApi';

// ─── Config ────────────────────────────────────────────────────────────────
const CATEGORY_META = {
  'load-cells':      { label: 'Load Cells',     emoji: '⚖️' },
  'controllers':     { label: 'Controllers',     emoji: '🖥️' },
  'weighing-scales': { label: 'Weighing Scales', emoji: '📦' },
};

const SORT_OPTIONS = [
  { label: 'Most Relevant',     value: 'relevant'   },
  { label: 'Price: Low → High', value: 'price_asc'  },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Top Rated',         value: 'rating'     },
  { label: 'Most Reviews',      value: 'reviews'    },
];
const POPULAR_SEARCHES = ['Load Cell', 'Scale', 'Controller', 'Wireless', 'Crane', 'Waterproof', 'PID'];

// ─── Placeholder image (fallback) ──────────────────────────────────────────
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23222'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='20' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";

// ─── Helpers ──────────────────────────────────────────────────────────────
const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
    ))}
  </div>
);

const StockBadge = ({ stock }) => {
  const map = {
    'In Stock':      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Low Stock':     'bg-amber-500/20  text-amber-400  border-amber-500/30',
    'Made to Order': 'bg-blue-500/20   text-blue-400   border-blue-500/30',
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${map[stock] || 'bg-slate-700 text-slate-400'}`}>
      {stock}
    </span>
  );
};

const discountPct = (price, oldPrice) =>
  oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : null;

// ─── Product Card ──────────────────────────────────────────────────────────
const ProductCard = ({ product, view }) => {
  const pct = discountPct(product.price, product.oldPrice);
  const productLink = `/shop/${product._id}`;
  // ✅ Use `images` (same as ShopPage)
  const [imgSrc, setImgSrc] = useState(product.images?.[0] || PLACEHOLDER_IMAGE);

  const handleImageError = () => setImgSrc(PLACEHOLDER_IMAGE);

  if (view === 'list') {
    return (
      <div className="group bg-slate-800/60 border border-slate-700/50 hover:border-amber-500/40 rounded-xl p-4 flex gap-4 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5">
        <Link to={productLink} className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-slate-700/40 hover:border-amber-400/50 transition-colors">
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={handleImageError}
          />
          {pct && <span className="absolute top-1 left-1 text-[9px] font-bold bg-red-500 text-white rounded px-1 py-0.5">-{pct}%</span>}
        </Link>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {product.tag && (
                <span className="inline-block text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded px-1.5 py-0.5 mb-1 uppercase tracking-wider mr-1">{product.tag}</span>
              )}
              <Link to={productLink} className="hover:text-amber-400 transition-colors">
                <h3 className="font-semibold text-slate-100 group-hover:text-amber-400 transition-colors text-sm leading-snug">{product.name}</h3>
              </Link>
              <p className="text-[10px] text-slate-500 mt-0.5 capitalize">{CATEGORY_META[product.category]?.label || product.category} · {product.color}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-bold text-amber-400">₹{product.price.toFixed(2)}</div>
              {product.oldPrice && <div className="text-xs text-slate-500 line-through">₹{product.oldPrice.toFixed(2)}</div>}
              <div className="mt-1"><StockBadge stock={product.stock} /></div>
            </div>
          </div>
          <p className="text-xs text-slate-400 line-clamp-1">{product.description}</p>
          <div className="flex items-center justify-between mt-auto pt-1">
            <div className="flex items-center gap-1.5">
              <StarRating rating={product.rating} />
              <span className="text-xs text-slate-500">{product.rating} ({product.reviews || 0})</span>
            </div>
            <Link to={productLink} className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
              View <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <Link to={productLink} className="block group bg-slate-800/60 border border-slate-700/50 hover:border-amber-500/40 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-0.5 flex flex-col">
      <div className="relative h-44 overflow-hidden bg-slate-700/30">
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
        {product.tag && (
          <span className="absolute top-2 left-2 text-[9px] font-bold text-amber-400 bg-slate-900/80 border border-amber-400/30 rounded px-1.5 py-0.5 uppercase tracking-wider backdrop-blur-sm">{product.tag}</span>
        )}
        {pct && (
          <span className="absolute top-2 right-2 text-[9px] font-bold bg-red-500 text-white rounded px-1.5 py-0.5">-{pct}%</span>
        )}
        <div className="absolute bottom-2 left-2"><StockBadge stock={product.stock} /></div>
      </div>
      <div className="p-3.5 flex flex-col flex-1">
        <p className="text-[10px] text-slate-500 capitalize mb-1">
          {CATEGORY_META[product.category]?.emoji} {CATEGORY_META[product.category]?.label || product.category} · <span className="capitalize">{product.color}</span>
        </p>
        <h3 className="font-semibold text-slate-100 group-hover:text-amber-400 transition-colors text-sm leading-snug line-clamp-2 mb-1.5">{product.name}</h3>
        <p className="text-xs text-slate-400 line-clamp-2 mb-3 flex-1">{product.description}</p>
        <div className="flex items-center gap-1.5 mb-3">
          <StarRating rating={product.rating} />
          <span className="text-xs text-slate-500">({product.reviews || 0})</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-base font-bold text-amber-400">₹{product.price.toFixed(2)}</div>
            {product.oldPrice && <div className="text-[10px] text-slate-500 line-through">₹{product.oldPrice.toFixed(2)}</div>}
          </div>
          <span className="text-xs bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-900 font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1">
            View <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
};

// ─── Main SearchPage ──────────────────────────────────────────────────────
const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [inputValue,       setInputValue]      = useState('');
  const [activeQuery,      setActiveQuery]      = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy,           setSortBy]           = useState('relevant');
  const [view,             setView]             = useState('grid');
  const [categoryOpen,     setCategoryOpen]     = useState(false);
  const [sortOpen,         setSortOpen]         = useState(false);
  const [hasSearched,      setHasSearched]      = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);
  const inputRef = useRef(null);

  const categoryParam = selectedCategory !== 'All Categories' ? selectedCategory : undefined;
  const { data, isLoading, error } = useFetchAllProductsQuery({
    category: categoryParam,
    limit: 100,
  });
  const products = data?.products || [];

  // Sync from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q    = params.get('q')    || '';
    const cat  = params.get('cat')  || 'All Categories';
    const sort = params.get('sort') || 'relevant';
    setInputValue(q);
    setSelectedCategory(cat);
    setSortBy(sort);
    if (q || cat !== 'All Categories') {
      setHasSearched(true);
      setActiveQuery(q);
    } else {
      setHasSearched(false);
      setActiveQuery('');
    }
  }, [location.search]);

  useEffect(() => {
    const close = () => { setCategoryOpen(false); setSortOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const debounceTimeout = useRef(null);

  const updateSuggestions = useCallback((query) => {
    if (!query || query.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const q = query.toLowerCase().trim();
    const matchedProducts = products.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.color?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );

    const productSuggestions = matchedProducts.map(p => ({
      type: 'product',
      label: p.name,
      id: p._id,
      category: p.category,
      color: p.color,
      // ✅ Use `images` same as ShopPage
      image: p.images?.[0] || PLACEHOLDER_IMAGE,
    }));

    const categorySet = new Set();
    const categorySuggestions = [];
    matchedProducts.forEach(p => {
      if (p.category && !categorySet.has(p.category)) {
        categorySet.add(p.category);
        const meta = CATEGORY_META[p.category] || { label: p.category, emoji: '📦' };
        categorySuggestions.push({
          type: 'category',
          label: meta.label,
          value: p.category,
          emoji: meta.emoji,
        });
      }
    });

    const colorSet = new Set();
    const colorSuggestions = [];
    matchedProducts.forEach(p => {
      if (p.color && !colorSet.has(p.color)) {
        colorSet.add(p.color);
        colorSuggestions.push({
          type: 'color',
          label: p.color,
          value: p.color,
        });
      }
    });

    const combined = [...productSuggestions, ...categorySuggestions, ...colorSuggestions];
    setSuggestions(combined.slice(0, 10));
    setShowSuggestions(combined.length > 0);
  }, [products]);

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      updateSuggestions(inputValue);
    }, 300);
    return () => clearTimeout(debounceTimeout.current);
  }, [inputValue, updateSuggestions]);

  const handleSuggestionClick = (suggestion) => {
    let searchTerm = '';
    if (suggestion.type === 'product') {
      searchTerm = suggestion.label;
    } else if (suggestion.type === 'category') {
      searchTerm = suggestion.label;
      setSelectedCategory(suggestion.value);
    } else if (suggestion.type === 'color') {
      searchTerm = suggestion.label;
    }
    setInputValue(searchTerm);
    setActiveQuery(searchTerm);
    setHasSearched(true);
    setShowSuggestions(false);
    updateURL(searchTerm, selectedCategory, sortBy);
  };

  const searchProductsLocally = (query, sort) => {
    let results = [...products];
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      results = results.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.color?.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case 'price_asc':  results.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
      case 'price_desc': results.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
      case 'rating':     results.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'reviews':    results.sort((a, b) => (b.reviews || 0) - (a.reviews || 0)); break;
      default: break;
    }
    return results;
  };

  const filteredResults = searchProductsLocally(activeQuery, sortBy);

  const updateURL = (q, cat, sort) => {
    const params = new URLSearchParams();
    if (q)   params.set('q', q);
    if (cat && cat !== 'All Categories') params.set('cat', cat);
    if (sort && sort !== 'relevant')     params.set('sort', sort);
    navigate(`/Search?${params.toString()}`, { replace: true });
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    setActiveQuery(inputValue);
    setHasSearched(true);
    setShowSuggestions(false);
    updateURL(inputValue, selectedCategory, sortBy);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCategoryOpen(false);
    setHasSearched(true);
    updateURL(activeQuery, cat, sortBy);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setSortOpen(false);
    updateURL(activeQuery, selectedCategory, sort);
  };

  const handlePopular = (term) => {
    setInputValue(term);
    setActiveQuery(term);
    setHasSearched(true);
    setShowSuggestions(false);
    updateURL(term, selectedCategory, sortBy);
  };

  const handleClearAll = () => {
    setInputValue('');
    setActiveQuery('');
    setSelectedCategory('All Categories');
    setSortBy('relevant');
    setHasSearched(false);
    setShowSuggestions(false);
    navigate('/Search');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleClear = () => {
    setInputValue('');
    setActiveQuery('');
    setHasSearched(false);
    setShowSuggestions(false);
    navigate('/Search');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Most Relevant';
  const featuredProducts = products.filter(p => p.tag);
  const categoriesFromData = ['All Categories', ...new Set(products.map(p => p.category).filter(Boolean))];
  const displayCategories = products.length > 0 ? categoriesFromData : ['All Categories'];

  const hasActiveFilters = activeQuery || selectedCategory !== 'All Categories';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 pt-24 lg:pt-28">

      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-800/90 to-slate-700/80 border-b border-slate-700/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
            Search <span className="text-amber-400">Products</span>
          </h1>
          <p className="text-slate-400 text-sm mb-5">
            {isLoading ? 'Loading...' : `${products.length} products`} · {displayCategories.length - 1} categories
          </p>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-3 relative">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                  placeholder="Search by name, category, color…"
                  autoFocus
                  className="w-full pl-12 pr-10 py-3.5 rounded-xl bg-slate-900/70 border border-slate-600 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300 text-sm"
                />
                {inputValue && (
                  <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}

                {showSuggestions && suggestions.length > 0 && (
                  <div ref={suggestionRef} className="absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto">
                    {suggestions.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(item)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-700/60 transition-colors border-b border-slate-700/30 last:border-0"
                      >
                        {item.type === 'product' && (
                          <>
                            <img
                              src={item.image || PLACEHOLDER_IMAGE}
                              alt={item.label}
                              className="w-8 h-8 rounded object-cover flex-shrink-0 border border-slate-600"
                              onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                            />
                            <div>
                              <span className="text-sm text-slate-200">{item.label}</span>
                              <span className="text-xs text-slate-500 ml-2">product</span>
                              {item.category && (
                                <span className="text-xs text-slate-500 ml-1">· {CATEGORY_META[item.category]?.label || item.category}</span>
                              )}
                            </div>
                          </>
                        )}
                        {item.type === 'category' && (
                          <>
                            <span className="text-xl">{item.emoji}</span>
                            <span className="text-sm text-slate-200">Category: {item.label}</span>
                          </>
                        )}
                        {item.type === 'color' && (
                          <>
                            <span className="w-4 h-4 rounded-full border border-slate-600" style={{ backgroundColor: item.value }} />
                            <span className="text-sm text-slate-200">Color: {item.label}</span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" className="flex items-center justify-center gap-2 px-7 py-3.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm whitespace-nowrap">
                <Search className="w-4 h-4" /> Search
              </button>
            </div>
          </form>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-xs text-slate-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Popular:</span>
            {POPULAR_SEARCHES.map(term => (
              <button key={term} onClick={() => handlePopular(term)}
                className="text-xs px-3 py-1 rounded-full bg-slate-700/60 text-slate-300 hover:bg-amber-500/20 hover:text-amber-400 border border-slate-600/50 hover:border-amber-500/40 transition-all duration-200">
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter/Sort Bar */}
      <div className="border-b-2 border-amber-500/20 bg-slate-800/60 backdrop-blur-md sticky top-16 lg:top-20 z-30 shadow-lg shadow-amber-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 py-3 md:py-4 lg:py-5">

            <div className="relative flex-shrink-0" onClick={e => e.stopPropagation()}>
              <button onClick={() => { setCategoryOpen(!categoryOpen); setSortOpen(false); }}
                className="flex items-center gap-2 text-sm md:text-base font-medium text-slate-200 hover:text-amber-400 border-2 border-slate-700 hover:border-amber-500/50 rounded-xl px-3 py-2 md:px-5 md:py-3 bg-slate-900/60 transition-all duration-200 shadow-sm hover:shadow-md">
                <Filter className="w-4 h-4 md:w-5 md:h-5" />
                <span className="max-w-[120px] md:max-w-[180px] truncate">
                  {selectedCategory === 'All Categories' ? 'All Categories' : (CATEGORY_META[selectedCategory]?.label || selectedCategory)}
                </span>
                <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 transition-transform duration-200 ${categoryOpen ? 'rotate-180' : ''}`} />
              </button>
              {categoryOpen && (
                <div className="absolute top-full mt-2 left-0 bg-slate-800 border-2 border-slate-700 rounded-xl shadow-2xl z-50 py-2 min-w-[180px] md:min-w-56 max-h-72 overflow-y-auto">
                  {displayCategories.map(cat => (
                    <button key={cat} onClick={() => handleCategoryChange(cat)}
                      className={`w-full text-left px-4 py-2.5 md:px-5 md:py-3 text-sm transition-colors ${selectedCategory === cat ? 'text-amber-400 bg-amber-500/10 font-semibold' : 'text-slate-300 hover:bg-slate-700/60 hover:text-amber-400'}`}>
                      {cat === 'All Categories' ? 'All Categories' : `${CATEGORY_META[cat]?.emoji || '📦'} ${CATEGORY_META[cat]?.label || cat}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative flex-shrink-0" onClick={e => e.stopPropagation()}>
              <button onClick={() => { setSortOpen(!sortOpen); setCategoryOpen(false); }}
                className="flex items-center gap-2 text-sm md:text-base font-medium text-slate-200 hover:text-amber-400 border-2 border-slate-700 hover:border-amber-500/50 rounded-xl px-3 py-2 md:px-5 md:py-3 bg-slate-900/60 transition-all duration-200 shadow-sm hover:shadow-md">
                Sort: <span className="text-amber-400 text-xs md:text-sm font-bold">{currentSortLabel}</span>
                <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortOpen && (
                <div className="absolute top-full mt-2 left-0 bg-slate-800 border-2 border-slate-700 rounded-xl shadow-2xl z-50 py-2 min-w-[180px] md:min-w-56">
                  {SORT_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => handleSortChange(opt.value)}
                      className={`w-full text-left px-4 py-2.5 md:px-5 md:py-3 text-sm transition-colors ${sortBy === opt.value ? 'text-amber-400 bg-amber-500/10 font-semibold' : 'text-slate-300 hover:bg-slate-700/60 hover:text-amber-400'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {hasSearched && !isLoading && (
              <span className="text-xs md:text-sm text-slate-400 flex-shrink-0 font-medium bg-slate-800/40 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-slate-700/50">
                {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}{activeQuery ? ` for “${activeQuery}”` : ''}
              </span>
            )}

            {hasActiveFilters && (
              <button onClick={handleClearAll}
                className="flex items-center gap-1.5 text-xs md:text-sm text-slate-400 hover:text-amber-400 transition-colors px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-slate-700/50 hover:border-amber-500/30 bg-slate-800/30">
                <X className="w-3 h-3 md:w-4 md:h-4" />
                Clear All
              </button>
            )}

            <div className="ml-auto flex items-center flex-shrink-0 border-2 border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <button onClick={() => setView('grid')} className={`p-2 md:p-3 transition-all duration-200 ${view === 'grid' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'}`}>
                <Grid className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button onClick={() => setView('list')} className={`p-2 md:p-3 transition-all duration-200 ${view === 'list' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'}`}>
                <List className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {hasActiveFilters && !isLoading && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="text-xs text-slate-500">Filters:</span>
            {activeQuery && (
              <span className="flex items-center gap-1.5 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full px-3 py-1">
                <Search className="w-3 h-3" /> {activeQuery}
                <button onClick={handleClear}><X className="w-3 h-3 ml-1 hover:text-amber-200" /></button>
              </span>
            )}
            {selectedCategory !== 'All Categories' && (
              <span className="flex items-center gap-1.5 text-xs bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full px-3 py-1">
                <Tag className="w-3 h-3" /> {CATEGORY_META[selectedCategory]?.label || selectedCategory}
                <button onClick={() => handleCategoryChange('All Categories')}><X className="w-3 h-3 ml-1 hover:text-blue-200" /></button>
              </span>
            )}
          </div>
        )}

        {isLoading && (
          <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`bg-slate-800/40 rounded-xl animate-pulse ${view === 'list' ? 'h-28' : 'h-72'}`} />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-red-500/30">
            <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Failed to load products</h3>
            <p className="text-slate-400 text-sm">Please try again later.</p>
          </div>
        )}

        {!isLoading && !error && hasSearched && (
          filteredResults.length > 0 ? (
            <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {filteredResults.map(p => <ProductCard key={p._id} product={p} view={view} />)}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700/30">
              <div className="w-20 h-20 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <AlertCircle className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                No results for <span className="text-amber-400">"{activeQuery}"</span>. Try a different keyword.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {POPULAR_SEARCHES.map(term => (
                  <button key={term} onClick={() => handlePopular(term)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 hover:text-amber-400 hover:bg-slate-600 transition-colors">
                    {term}
                  </button>
                ))}
              </div>
              <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 font-medium">
                View all products <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )
        )}

        {/* Initial / browse state */}
        {!isLoading && !error && !hasSearched && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" /> Browse by Category
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {displayCategories.filter(c => c !== 'All Categories').map(cat => {
                const count = products.filter(p => p.category === cat).length;
                const meta = CATEGORY_META[cat] || { label: cat, emoji: '📦' };
                return (
                  <button key={cat} onClick={() => handleCategoryChange(cat)}
                    className="group flex items-center gap-4 p-5 bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/40 hover:border-amber-500/40 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 text-left">
                    <span className="text-4xl">{meta.emoji}</span>
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">{meta.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{count} products</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 ml-auto transition-colors" />
                  </button>
                );
              })}
            </div>

            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" /> Popular Products
            </h2>
            {(() => {
              const popular = [...products]
                .sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviews || 0) - (a.reviews || 0))
                .slice(0, 8);
              return popular.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
                  {popular.map(p => <ProductCard key={p._id} product={p} view="grid" />)}
                </div>
              ) : (
                <p className="text-slate-400 text-sm mb-10">No popular products yet.</p>
              );
            })()}

            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" /> Featured Products
            </h2>
            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {featuredProducts.slice(0, 8).map(p => <ProductCard key={p._id} product={p} view="grid" />)}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No featured products at the moment.</p>
            )}
          </div>
        )}
      </div>

      {/* Trust Bar */}
      <div className="border-t border-slate-700/40 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck,   title: 'Free Shipping',  sub: 'On orders ₹1000+' },
              { icon: Clock,   title: '24/7 Support',   sub: '9773910846' },
              { icon: Shield,  title: 'ISO 9001:2024',  sub: 'Certified supplier' },
              { icon: Package, title: 'Bulk Discounts', sub: 'Volume pricing' },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30">
                <div className="w-9 h-9 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">{title}</div>
                  <div className="text-[10px] text-slate-500">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;