import LocaleSwitcher from '../i18n/LocaleSwitcher';
import { useLocale } from '../i18n/LocaleContext';
import { formTool } from './webmcp/webmcpTools';
import useSiteLogout from './useSiteLogout';
import { ADMIN_LINKS, USER_LINKS } from './pages/dashboard/dashboardNav';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useLocation } from '../shell/router';
import { useDispatch, useSelector } from 'react-redux';
import {
  Menu, X, ChevronDown, Package,
  Truck, Shield, Users, FileText, Phone,
  BarChart3, BookOpen, Download, Mail,
  Wind, Gauge, HardHat, Award,
  Search, Heart, ShoppingCart, LogOut,
  LayoutDashboard, User, CreditCard, ShoppingBag, PlusCircle, MessageSquare,
  TrendingUp, Image, Newspaper, FlaskConical
} from 'lucide-react';
import toast from 'react-hot-toast';
import UserAvatar from "./UserAvatar";
import ThemeToggle from "./ThemeToggle";
import { API_CATEGORIES } from './pages/pharmaApi/pharmaApiShared';
import getBaseURL from '../utlis/baseURL';
import { organizationNode, websiteNode } from './seo/organization';
import PharmaLogoAsset from "../assets/pharmamachinehub-logo-v2_2.svg";
// Next.js gives image imports as { src, width, height }
const PharmaLogo = PharmaLogoAsset?.src ?? PharmaLogoAsset;
import { logout } from '../components/store/authSlice';
import { selectCartTotalQuantity, clearCart } from '../components/store/cartSlice';
import { useFetchAllProductsQuery } from '../components/store/products/productsApi';

// ── SEO constants ──
const SITE_URL = 'https://www.foodpharmamachinery.com';
const SITE_NAME = 'Food Pharma Machinery';

const adminDropDownMenus = ADMIN_LINKS; // same list as the admin side menu

const userDropDownMenus = USER_LINKS; // same list as the account side menu

// ✅ Pharma Solutions with machine lists
const solutionsData = [
  {
    name: 'Solid Dosage',
    icon: Package,
    machines: [
      'Tablet Press Machines',
      'Capsule Filling Machines',
      'Granulation Equipment',
      'Coating Systems',
      'Dryers & Sifters',
      'Compression Tooling',
    ],
    path: '/solutions/solid-dosage',
  },
  {
    name: 'Liquid Processing',
    icon: Wind,
    machines: [
      'Liquid Filling Machines',
      'Ointment Mixers',
      'Emulsion Tanks',
      'Suspension Equipment',
      'Homogenizers',
      'Sterile Liquid Filling',
    ],
    path: '/solutions/liquid-processing',
  },
  {
    name: 'Packaging Solutions',
    icon: Shield,
    machines: [
      'Blister Packaging Lines',
      'Strip Packaging Machines',
      'Cartoning Machines',
      'Labelling Machines',
      'Wrapping Systems',
      'Sachet Filling Machines',
    ],
    path: '/solutions/packaging',
  },
  {
    name: 'Sterile & Aseptic',
    icon: Award,
    machines: [
      'Lyophilizers (Freeze Dryers)',
      'VHP Pass-Throughs',
      'Isolators',
      'Sterile Filling Lines',
      'Autoclaves',
      'Cleanroom Equipment',
    ],
    path: '/solutions/sterile',
  },
  {
    name: 'Inspection & QC',
    icon: Gauge,
    machines: [
      'Vision Inspection Systems',
      'Leak Testers',
      'Metal Detectors',
      'Checkweighers',
      'X-Ray Inspection',
      'Automatic Defect Removal',
    ],
    path: '/solutions/inspection',
  },
  {
    name: 'Automation & Industry 4.0',
    icon: BarChart3,
    machines: [
      'SCADA Systems',
      'MES (Manufacturing Execution)',
      'IoT Sensors',
      'Data Analytics',
      'Robotic Arms',
      'Automated Guidance Vehicles',
    ],
    path: '/solutions/automation',
  },
  {
    name: 'Turnkey Projects',
    icon: Truck,
    machines: [
      'Site Survey & Planning',
      'Equipment Sourcing',
      'Installation & Commissioning',
      'Training & Handover',
      'After-Sales Support',
      'Plant Upgradation',
    ],
    path: '/solutions/turnkey',
  },
  {
    name: 'Compliance & Validation',
    icon: HardHat,
    machines: [
      'IQ/OQ/PQ Documentation',
      'GMP Audits',
      'FDA/EMA Compliance',
      'Validation Protocols',
      'Standard Operating Procedures',
      'Training & Certification',
    ],
    path: '/solutions/compliance',
  },
];

const resourcesLinks = [
  { name: 'Project Cost Calculator', path: '/project-cost-calculator', icon: Gauge, description: 'Estimate plant & machine cost' },
  { name: 'Technical Library', path: '/resources/technical',    icon: BookOpen,  description: 'Manuals and documentation' },
  { name: 'Product Catalogs',  path: '/resources/catalogs',     icon: FileText,  description: 'Download PDF catalogs' },
  { name: 'CAD Drawings',      path: '/resources/cad',          icon: Gauge,     description: '2D/3D models' },
  { name: 'Case Studies',      path: '/resources/case-studies', icon: Users,     description: 'Success stories' },
  { name: 'White Papers',      path: '/resources/white-papers', icon: FileText,  description: 'Industry research' },
  { name: 'SDS Sheets',        path: '/resources/sds',          icon: Shield,    description: 'Safety data sheets' },
];

// Main links exposed to search engines as site navigation (JSON-LD)
const seoNavLinks = [
  { name: 'Home', path: '/' },
  { name: 'Shop Pharma & Food Machinery', path: '/shop' },
  { name: 'Pharma Solutions', path: '/solutions' },
  ...solutionsData.map((s) => ({ name: s.name, path: s.path })),
  { name: 'Products', path: '/products' },
  { name: 'Pharma APIs', path: '/pharma-api' },
  { name: 'Customer Testimonials', path: '/testimonials' },
  { name: 'Track Order', path: '/track-order' },
  { name: 'Bulk Quote', path: '/bulk-quote' },
  { name: 'Pharma Project Cost Calculator', path: '/project-cost-calculator' },
  { name: 'Press & News', path: '/press' },
  { name: 'Careers', path: '/career' },
  { name: 'Projects', path: '/projects' },
  { name: 'About Us', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const makeHover = (setFn, ref) => ({
  onMouseEnter: () => {
    clearTimeout(ref.current);
    setFn(true);
  },
  onMouseLeave: () => {
    ref.current = setTimeout(() => setFn(false), 300);
  },
});

// Dropdown content stays in the DOM (hidden with CSS only), so crawlers can
// always see and follow every link inside it.
const HoverDropdown = ({ label, open, setOpen, timeoutRef, children, wide, id }) => {
  const buttonId = `dropdown-${id || label.toLowerCase().replace(/\s+/g, '-')}`;
  const contentId = `${buttonId}-content`;

  return (
    <li className="relative" {...makeHover(setOpen, timeoutRef)}>
      <button
        id={buttonId}
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        className="flex items-center space-x-1 whitespace-nowrap px-2 2xl:px-4 py-2 text-xs 2xl:text-sm font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-700/50 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
      >
        <span>{label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <div
        id={contentId}
        className={`absolute left-0 mt-2 ${
          wide
            ? 'min-w-[300px] max-w-[90vw] sm:max-w-[600px] lg:max-w-[700px]'
            : 'w-80'
        } bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-4 z-50 transition-all duration-300 transform ${
          open ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2 pointer-events-none'
        }`}
      >
        {children}
      </div>
    </li>
  );
};

const Navbar = () => {
  const { t } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth ?? {});
  const cartTotalQuantity = useSelector(selectCartTotalQuantity);

  const { data: apiData, isLoading: productsQueryLoading } = useFetchAllProductsQuery({
    page: 1,
    limit: 1000,
  });
  // The server draws the header before the page's product data is in the store, so its HTML
  // says "Loading". The browser's first render must say the same (or React reports a
  // hydration error and redraws the page); the product menus fill in right after.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  const productsLoading = productsQueryLoading || !hydrated;
  const allProducts = apiData?.products || [];

  // Pharma API categories with at least one visible API (they follow what the admin adds
  // or deletes); usual order first, any new category after
  const [apiCategories, setApiCategories] = useState([]);
  useEffect(() => {
    let live = true;
    fetch(`${getBaseURL()}/api/pharma-apis/categories`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => {
        if (!live || !Array.isArray(rows)) return;
        const rank = (c) => (API_CATEGORIES.includes(c) ? API_CATEGORIES.indexOf(c) : API_CATEGORIES.length);
        setApiCategories(rows.filter((r) => r?.category && r.count > 0).map((r) => r.category).sort((a, b) => rank(a) - rank(b)));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [productsDropdown, setProductsDropdown] = useState(false);
  const [apiDropdown, setApiDropdown] = useState(false);
  const [apiMobileOpen, setApiMobileOpen] = useState(false);
  const [solutionsDropdown, setSolutionsDropdown] = useState(false);
  const [resourcesDropdown, setResourcesDropdown] = useState(false);
  const [isUserDropOpen, setIsUserDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [cartNotification, setCartNotification] = useState(false);

  const productsTimeoutRef = useRef(null);
  const apiTimeoutRef = useRef(null);
  const solutionsTimeoutRef = useRef(null);
  const resourcesTimeoutRef = useRef(null);
  const userDropRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // The header is fixed, so a spacer below it keeps pages from sliding under it.
  // Its height follows the header's real height (it differs per screen size).
  // While the phone menu is open the header is taller; the page stays put.
  const headerRef = useRef(null);
  const menuOpenRef = useRef(false);
  const [headerHeight, setHeaderHeight] = useState(null);
  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const update = () => { if (!menuOpenRef.current) setHeaderHeight(el.offsetHeight); };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);
  // Shared with fixed elements that sit under the header (admin side menu)
  useEffect(() => {
    if (headerHeight) document.documentElement.style.setProperty('--site-header-h', `${headerHeight}px`);
  }, [headerHeight]);
  menuOpenRef.current = isOpen; // set during render, before the resize observer fires
  useEffect(() => {
    if (!isOpen && headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
  }, [isOpen]);

  // ── 🔎 Structured data: Organization + WebSite (sitelinks search box) + site navigation ──
  const structuredData = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        organizationNode,
        websiteNode,
        ...seoNavLinks.map((l) => ({
          '@type': 'SiteNavigationElement',
          name: l.name,
          url: `${SITE_URL}${l.path}`,
        })),
      ],
    }),
    []
  );

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 20 && currentScrollY > lastScrollY) {
        setScrolled(true);
      } else if (currentScrollY === 0) {
        setScrolled(false);
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (userDropRef.current && !userDropRef.current.contains(e.target)) {
        setIsUserDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const productsRef = productsTimeoutRef;
    const solutionsRef = solutionsTimeoutRef;
    const resourcesRef = resourcesTimeoutRef;
    return () => {
      clearTimeout(productsRef.current);
      clearTimeout(solutionsRef.current);
      clearTimeout(resourcesRef.current);
    };
  }, []);

  const dropdownMenus = user?.role === 'admin' ? adminDropDownMenus : userDropDownMenus;

  const { signOut, isLoggingOut: logoutLoading } = useSiteLogout();
  const handleLogout = () => signOut(() => { setIsUserDropOpen(false); setIsOpen(false); });

  const handleSearchSubmit = (e, query) => {
    e.preventDefault();
    const trimmed = query?.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      setSearchQuery('');
      setMobileSearchQuery('');
      setIsOpen(false);
    }
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    setProductsDropdown(false);
    setSolutionsDropdown(false);
    setResourcesDropdown(false);
    setIsUserDropOpen(false);
  };

  useEffect(() => {
    const handleCartItemAdded = () => {
      setCartNotification(true);
      setTimeout(() => setCartNotification(false), 1500);
    };
    window.addEventListener('cartItemAdded', handleCartItemAdded);
    return () => window.removeEventListener('cartItemAdded', handleCartItemAdded);
  }, []);

  // Close menus when the page changes
  useEffect(() => {
    setIsOpen(false);
    setProductsDropdown(false);
    setSolutionsDropdown(false);
    setResourcesDropdown(false);
    setIsUserDropOpen(false);
  }, [location.pathname]);

  // Escape closes the mobile menu; switching to desktop width closes it too
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsUserDropOpen(false);
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 1280) setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Stop the page scrolling behind the open mobile menu
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = isOpen ? 'hidden' : prev;
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const isActive = (path) => location.pathname === path;

  // Display product names list (limited for performance, but will scroll)
  const productList = allProducts.slice(0, 50);

  return (
    <>
      {/* Structured data for Google (Organization, WebSite search box, navigation) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <header
        ref={headerRef}
        className={`fixed w-full top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-gradient-to-r from-slate-900 to-slate-800 shadow-2xl'
            : 'bg-gradient-to-r from-slate-800 to-slate-700'
        }`}
      >
        {/* Top bar */}
        <div className="hidden xl:block border-b border-slate-600/50 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-12 text-xs">
              <div className="flex items-center space-x-4 2xl:space-x-6">
                <LocaleSwitcher compact className="text-slate-300 hover:text-amber-400" />
                <a
                  href="tel:+918700792607"
                  className="flex items-center space-x-2 text-slate-300 hover:text-amber-400 transition-colors"
                >
                  <Phone className="w-3 h-3" aria-hidden="true" />
                  <span className="font-mono">24/7 Support: 8700792607</span>
                </a>
                <a
                  href="mailto:safescan21@gmail.com"
                  className="flex items-center space-x-2 text-slate-300 hover:text-amber-400 transition-colors"
                >
                  <Mail className="w-3 h-3" aria-hidden="true" />
                  <span>safescan21@gmail.com</span>
                </a>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden 2xl:flex items-center space-x-2 text-amber-400">
                  <Truck className="w-3 h-3" aria-hidden="true" />
                  <span className="font-semibold">{t("Free Shipping on Orders ₹10,000+")}</span>
                </div>
                <div className="hidden 2xl:block h-4 w-px bg-slate-600" aria-hidden="true" />
                <nav aria-label={t("Company links")} className="flex items-center space-x-3 text-slate-300">
                  <Link to="/track-order" onClick={handleLinkClick} className="inline-flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300 transition-colors"><Truck className="w-3 h-3" aria-hidden="true" />{t("Track Order")}</Link>
                  <Link to="/bulk-quote" onClick={handleLinkClick} className="hover:text-amber-400 transition-colors">{t("Bulk Orders")}</Link>
                  <Link to="/shop" onClick={handleLinkClick} className="hover:text-amber-400 transition-colors">{t("Products")}</Link>
                  <Link to="/project-cost-calculator" onClick={handleLinkClick} className="hover:text-amber-400 transition-colors">{t("Cost Calculator")}</Link>
                  <Link to="/about" onClick={handleLinkClick} className="hover:text-amber-400 transition-colors">{t("About Us")}</Link>
                  <Link to="/projects" onClick={handleLinkClick} className="hover:text-amber-400 transition-colors">{t("Projects")}</Link>
                  <Link to="/contact" onClick={handleLinkClick} className="hover:text-amber-400 transition-colors">{t("Contact")}</Link>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Main row - increased height to accommodate large logo */}
        <div className="border-b border-slate-600/30">
          <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20 sm:h-24 md:h-28 xl:h-36 gap-2">

              {/* Logo - only the image, no text */}
              <div className="shrink-0 group">
                <Link
                  to="/"
                  onClick={handleLinkClick}
                  aria-label={`${SITE_NAME} – Home`}
                  title={`${SITE_NAME} – Pharma & Food Processing Machinery`}
                >
                  {/* The logo is a wide wordmark (640×200): size it by height on phones/tablets so it reads clearly */}
                  <img
                    src={PharmaLogo}
                    alt={`${SITE_NAME} logo`}
                    width="640"
                    height="200"
                    fetchPriority="high"
                    decoding="async"
                    className="h-12 min-[375px]:h-14 sm:h-16 md:h-[72px] w-auto xl:w-36 xl:h-36 2xl:w-52 2xl:h-52 object-contain transition-opacity duration-300 group-hover:opacity-90"
                  />
                </Link>
              </div>

              {/* Desktop Navigation */}
              <nav aria-label={t("Main navigation")} className="hidden xl:flex flex-1 min-w-0 justify-start px-2 2xl:px-4 overflow-visible">
                <ul className="flex items-center space-x-0.5 xl:space-x-1">
                  <li>
                    <Link
                      to="/"
                      onClick={handleLinkClick}
                      title={t("Food Pharma Machinery home")}
                      aria-current={isActive('/') ? 'page' : undefined}
                      className="whitespace-nowrap px-2 2xl:px-3 py-2 text-xs 2xl:text-sm font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-700/50 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    >
                      {t("Home")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/shop"
                      onClick={handleLinkClick}
                      title={t("Shop pharma and food processing machinery")}
                      aria-current={isActive('/shop') ? 'page' : undefined}
                      className="whitespace-nowrap px-2 2xl:px-3 py-2 text-xs 2xl:text-sm font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-700/50 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    >
                      {t("Shop")}
                    </Link>
                  </li>

                  {/* Products Dropdown - showing product names */}
                  <HoverDropdown
                    label={t("Products")}
                    open={productsDropdown}
                    setOpen={setProductsDropdown}
                    timeoutRef={productsTimeoutRef}
                    wide
                    id="products"
                  >
                    {productsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                        <span className="ml-2 text-sm text-slate-400">{t("Loading products...")}</span>
                      </div>
                    ) : allProducts.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-sm">{t("No products available")}</div>
                    ) : (
                      <>
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar px-2">
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                            {productList.map((product) => (
                              <li key={product._id}>
                                <Link
                                  to={`/shop/${product._id}`}
                                  onClick={handleLinkClick}
                                  title={product.name}
                                  className="block px-3 py-2 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 rounded-lg transition-colors truncate"
                                >
                                  {product.name}
                                </Link>
                              </li>
                            ))}
                            {allProducts.length > 50 && (
                              <li className="col-span-2 text-center text-xs text-slate-500 py-1">
                                + {allProducts.length - 50} more products
                              </li>
                            )}
                          </ul>
                        </div>
                        <div className="border-t border-slate-700 mt-2 pt-3 px-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <span className="text-xs text-slate-500">
                            {allProducts.length} total products
                          </span>
                          <div className="flex gap-4">
                            <Link to="/products" onClick={handleLinkClick} className="text-xs text-amber-400 hover:text-amber-300">
                              {t("Products Overview")}
                            </Link>
                            <Link to="/shop" onClick={handleLinkClick} className="text-xs text-amber-400 hover:text-amber-300">
                              {t("Browse Full Catalog →")}
                            </Link>
                          </div>
                        </div>
                      </>
                    )}
                  </HoverDropdown>

                  {/* Pharma APIs: active pharmaceutical ingredients catalogue */}
                  <HoverDropdown
                    label={t("Pharma API")}
                    open={apiDropdown}
                    setOpen={setApiDropdown}
                    timeoutRef={apiTimeoutRef}
                    wide
                    id="pharma-api"
                  >
                    <div className="px-4 pt-3 pb-1">
                      <p className="flex items-center gap-2 text-sm font-semibold text-slate-200"><FlaskConical className="w-4 h-4 text-amber-400" aria-hidden="true" />{t("Active Pharmaceutical Ingredients")}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{t("Bulk drugs in IP, BP, USP and EP grades with COA and MSDS")}</p>
                    </div>
                    {apiCategories.length > 0 && (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-2 max-h-[360px] overflow-y-auto custom-scrollbar">
                      {apiCategories.map((c) => (
                        <li key={c}>
                          <Link
                            to={`/pharma-api?category=${encodeURIComponent(c)}`}
                            onClick={handleLinkClick}
                            className="block px-3 py-2 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 rounded-lg transition-colors truncate"
                          >
                            {t(c)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    )}
                    <div className="border-t border-slate-700 mt-1 pt-3 px-4 flex justify-between items-center gap-2">
                      <Link to="/bulk-quote?product=Pharma%20API&source=pharma-api" onClick={handleLinkClick} className="text-xs text-slate-400 hover:text-amber-400">{t("Can't find an API? Send an enquiry")}</Link>
                      <Link to="/pharma-api" onClick={handleLinkClick} className="text-xs text-amber-400 hover:text-amber-300">{t("View all APIs →")}</Link>
                    </div>
                  </HoverDropdown>

                  {/* Solutions Dropdown */}
                  <HoverDropdown
                    label={t("Solutions")}
                    open={solutionsDropdown}
                    setOpen={setSolutionsDropdown}
                    timeoutRef={solutionsTimeoutRef}
                    wide
                    id="solutions"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                      {solutionsData.map((category) => (
                        <div key={t(category.name)} className="group/sol">
                          <div className="flex items-center gap-2 mb-2">
                            <category.icon className="w-5 h-5 text-amber-400" aria-hidden="true" />
                            <Link
                              to={category.path}
                              onClick={handleLinkClick}
                              title={`${t(category.name)} – pharma machinery solutions`}
                              className="font-semibold text-slate-200 hover:text-amber-400 transition-colors text-sm"
                            >
                              {t(category.name)}
                            </Link>
                          </div>
                          <ul className="space-y-1 pl-7">
                            {category.machines.map((machine) => (
                              <li key={t(machine)}>
                                <Link
                                  to={`/shop?search=${encodeURIComponent(machine)}`}
                                  onClick={handleLinkClick}
                                  title={t(machine)}
                                  className="text-xs text-slate-400 hover:text-amber-400 transition-colors block py-0.5"
                                >
                                  • {t(machine)}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-slate-700 mt-2 pt-3 px-4 flex justify-end">
                      <Link to="/solutions" onClick={handleLinkClick} className="text-xs text-amber-400 hover:text-amber-300">
                        {t("View All Solutions →")}
                      </Link>
                    </div>
                  </HoverDropdown>

                  {/* Resources Dropdown */}
                  <HoverDropdown
                    label={t("Resources")}
                    open={resourcesDropdown}
                    setOpen={setResourcesDropdown}
                    timeoutRef={resourcesTimeoutRef}
                    id="resources"
                  >
                    {resourcesLinks.map((r) => {
                      const Icon = r.icon;
                      return (
                        <Link
                          key={r.path}
                          to={r.path}
                          onClick={handleLinkClick}
                          title={`${t(r.name)} – ${t(r.description)}`}
                          className="group/r flex items-start space-x-3 px-4 py-3 hover:bg-slate-700/70 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                        >
                          <Icon className="w-5 h-5 text-amber-400 mt-0.5" aria-hidden="true" />
                          <div>
                            <div className="font-medium text-slate-200 group-hover/r:text-amber-400">{t(r.name)}</div>
                            <p className="text-xs text-slate-400">{t(r.description)}</p>
                          </div>
                        </Link>
                      );
                    })}
                    <div className="border-t border-slate-700 mt-2 pt-3 px-4 flex flex-col sm:flex-row gap-2 sm:gap-6">
                      <button type="button" className="text-xs text-slate-400 hover:text-amber-400 flex items-center space-x-1">
                        <Download className="w-3 h-3" aria-hidden="true" />
                        <span>{t("Downloads")}</span>
                      </button>
                      <button type="button" className="text-xs text-slate-400 hover:text-amber-400 flex items-center space-x-1">
                        <Award className="w-3 h-3" aria-hidden="true" />
                        <span>{t("Certifications")}</span>
                      </button>
                    </div>
                  </HoverDropdown>

                  {/* Projects and Contact live in the top bar: the main row has no room for them (content stops at 1536px) */}
                </ul>
              </nav>

              {/* Desktop actions */}
              <div className="hidden xl:flex shrink-0 items-center space-x-1 2xl:space-x-3">
                <Link
                  to="/bulk-quote"
                  onClick={handleLinkClick}
                  aria-current={isActive('/bulk-quote') ? 'page' : undefined}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-amber-400/70 px-3 py-1.5 text-xs 2xl:text-sm font-semibold text-amber-300 hover:bg-amber-400 hover:text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                >
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  {t("Bulk Quote")}
                </Link>
                <ThemeToggle className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-amber-400/50" />
                <Link
                  to="/wishlist"
                  onClick={handleLinkClick}
                  aria-label={t("Wishlist")}
                  rel="nofollow"
                  className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                >
                  <Heart className="w-5 h-5" aria-hidden="true" />
                </Link>

                <Link
                  to="/cart"
                  onClick={handleLinkClick}
                  aria-label={`Shopping cart, ${cartTotalQuantity} items`}
                  rel="nofollow"
                  className={`flex items-center gap-1 2xl:gap-2 px-2 2xl:px-4 py-2 text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 rounded-lg transition-all relative ${
                    cartNotification ? 'animate-pulse-cart' : ''
                  } focus:outline-none focus:ring-2 focus:ring-amber-400/50`}
                >
                  <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                  {cartTotalQuantity > 0 ? (
                    <>
                      <span className="font-medium text-sm hidden 2xl:inline">
                        {cartTotalQuantity} {cartTotalQuantity === 1 ? 'item' : 'items'}
                      </span>
                      <span className="absolute -top-1 -right-0 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {cartTotalQuantity}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-400 hidden 2xl:inline">{t("Cart")}</span>
                  )}
                </Link>

                <div className="flex items-center space-x-1 2xl:space-x-3 ml-1 2xl:ml-4 pl-1 2xl:pl-4 border-l border-slate-600">
                  {user ? (
                    <div className="relative" ref={userDropRef}>
                      <button
                        type="button"
                        id="user-menu-button"
                        onClick={() => setIsUserDropOpen(!isUserDropOpen)}
                        aria-haspopup="true"
                        aria-expanded={isUserDropOpen}
                        aria-controls="user-menu"
                        className="flex items-center gap-1 2xl:gap-2 focus:outline-none focus:ring-2 focus:ring-amber-400/50 rounded-full"
                        aria-label={t("User menu")}
                      >
                        <UserAvatar src={user?.profileImage} name={user?.username || user?.email} size={34} ring priority />
                        <span className={`hidden 2xl:inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                          user?.role === 'admin'
                            ? 'bg-blue-900/60 text-blue-300 border border-blue-700'
                            : 'bg-green-900/60 text-green-300 border border-green-700'
                        }`}>
                          {user?.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </button>

                      {isUserDropOpen && (
                        <div
                          id="user-menu"
                          role="menu"
                          aria-labelledby="user-menu-button"
                          className="absolute right-0 mt-3 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-slate-700 bg-slate-900/50">
                            <p className="text-sm font-medium text-slate-100 truncate">
                              {user?.username || user?.name || 'User'}
                            </p>
                            <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email || ''}</p>
                          </div>
                          <div className="border-b border-slate-700 py-1">
                            <button
                              type="button"
                              onClick={handleLogout}
                              disabled={logoutLoading}
                              role="menuitem"
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors disabled:opacity-50 focus:outline-none focus:bg-red-900/20"
                            >
                              <LogOut className="w-4 h-4" aria-hidden="true" />
                              {logoutLoading ? t('Logging out…') : t('Logout')}
                            </button>
                          </div>
                          <ul className="py-1 max-h-[min(60vh,26rem)] overflow-y-auto overscroll-contain">
                            {dropdownMenus.map((menu) => {
                              const Icon = menu.icon;
                              return (
                                <li key={menu.path}>
                                  <Link
                                    to={menu.path}
                                    onClick={handleLinkClick}
                                    role="menuitem"
                                    rel="nofollow"
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700/60 transition-colors focus:outline-none focus:bg-slate-700/60"
                                  >
                                    <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                                    {menu.label}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={handleLinkClick}
                        rel="nofollow"
                        className="whitespace-nowrap px-2 2xl:px-5 py-2 text-sm font-medium text-slate-200 hover:text-amber-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50 rounded-lg"
                      >
                        {t("Login")}
                      </Link>
                      <Link
                        to="/register"
                        onClick={handleLinkClick}
                        rel="nofollow"
                        className="whitespace-nowrap px-3 2xl:px-6 py-2 text-sm font-semibold text-slate-900 bg-amber-400 rounded-lg hover:bg-amber-300 hover:scale-105 transform transition-all shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-400/50"
                      >
                        {t("Register")}
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Mobile actions */}
              <div className="xl:hidden flex shrink-0 items-center space-x-1 sm:space-x-2">
                <ThemeToggle className="p-2 text-slate-200 hover:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 rounded-lg" />
                <button
                  type="button"
                  onClick={() => { navigate('/search'); setIsOpen(false); }}
                  className="p-2 text-slate-200 hover:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 rounded-lg"
                  aria-label={t("Search")}
                >
                  <Search className="w-5 h-5" aria-hidden="true" />
                </button>
                <Link
                  to="/cart"
                  onClick={handleLinkClick}
                  aria-label={`Shopping cart, ${cartTotalQuantity} items`}
                  rel="nofollow"
                  className={`p-2 text-slate-200 hover:text-amber-400 relative ${
                    cartNotification ? 'animate-pulse-cart' : ''
                  } focus:outline-none focus:ring-2 focus:ring-amber-400/50 rounded-lg`}
                >
                  <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                  {cartTotalQuantity > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartTotalQuantity}
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  aria-expanded={isOpen}
                  aria-controls="mobile-menu"
                  className="p-2 rounded-lg text-slate-200 hover:text-amber-400 hover:bg-slate-700/50 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  aria-label={isOpen ? t('Close menu') : t('Open menu')}
                >
                  {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Row (desktop) */}
        <div className="hidden xl:block bg-slate-800/50 backdrop-blur-sm py-4 border-b border-slate-600/30">
          <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <form {...formTool('search')} onSubmit={(e) => handleSearchSubmit(e, searchQuery)} className="flex gap-4 items-center" role="search">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  type="search"
                  name="q"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("🔍  Search for machines, categories, brands, SKU…")}
                  aria-label={t("Search products")}
                  className="w-full px-4 pl-10 pr-16 md:pl-14 md:pr-24 py-3 md:py-4 rounded-2xl bg-slate-700/60 border-2 border-slate-600 focus:border-amber-400 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-400/20 transition-all duration-300 text-base md:text-lg font-medium shadow-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 md:px-6 py-1.5 md:py-2.5 text-sm md:text-base font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-400/50"
                  aria-label={t("Submit search")}
                >
                  {t("Search")}
                </button>
              </div>
              <div className="flex-shrink-0 flex gap-2">
                <span className="text-sm text-slate-400 flex items-center hidden xl:inline">{t("Popular:")}</span>
                {['Tablet Press', 'Capsule Filler', 'Lyophilizer'].map(term => (
                  <button
                    key={term}
                    type="button"
                    onClick={(e) => {
                      setSearchQuery(term);
                      handleSearchSubmit(e, term);
                    }}
                    className="text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 rounded-full bg-slate-700/60 text-slate-300 hover:bg-amber-500/20 hover:text-amber-400 border border-slate-600/50 hover:border-amber-400/50 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <nav
            id="mobile-menu"
            aria-label={t("Mobile navigation")}
            className="xl:hidden bg-slate-800 border-t border-slate-700 max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain"
            ref={mobileMenuRef}
          >
            <div className="px-4 py-3 space-y-1">
              {/* Mobile search */}
              <div className="px-3 py-4 border-b border-slate-700 mb-2">
                <form {...formTool('search')} onSubmit={(e) => handleSearchSubmit(e, mobileSearchQuery)} role="search">
                  <div className="relative">
                    <input
                      type="search"
                      name="q"
                      value={mobileSearchQuery}
                      onChange={(e) => setMobileSearchQuery(e.target.value)}
                      placeholder={t("Search machines…")}
                      aria-label={t("Search")}
                      className="w-full px-4 py-3 pl-10 rounded-lg bg-slate-700 border border-slate-600 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                    />
                    <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" aria-hidden="true" />
                    <button type="submit" className="absolute right-2 top-2 px-3 py-1 text-sm bg-amber-500 text-slate-900 font-semibold rounded-md">{t("Go")}</button>
                  </div>
                </form>
              </div>

              {user ? (
                <div className="px-3 py-3 mb-2 bg-slate-700/40 rounded-lg border border-slate-600">
                  <div className="flex items-center gap-3 mb-3">
                    <UserAvatar src={user?.profileImage} name={user?.username || user?.email} size={40} ring />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-100 truncate">{user?.username || user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <span className={`ml-auto shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                      user?.role === 'admin' ? 'bg-blue-900 text-blue-300' : 'bg-green-900 text-green-300'
                    }`}>
                      {user?.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {dropdownMenus.map((menu) => {
                      const Icon = menu.icon;
                      return (
                        <li key={menu.path}>
                          <Link
                            to={menu.path}
                            onClick={handleLinkClick}
                            rel="nofollow"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            {menu.label}
                          </Link>
                        </li>
                      );
                    })}
                    <li>
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={logoutLoading}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-900/20 rounded-lg transition-colors border-t border-slate-600 mt-1 pt-3 disabled:opacity-50"
                      >
                        <LogOut className="w-4 h-4" aria-hidden="true" />
                        {logoutLoading ? t('Logging out…') : t('Logout')}
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="flex gap-2 px-3 mb-3">
                  <Link to="/login" onClick={handleLinkClick} rel="nofollow" className="flex-1 py-2.5 text-center text-sm font-medium text-slate-200 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">{t("Login")}</Link>
                  <Link to="/register" onClick={handleLinkClick} rel="nofollow" className="flex-1 py-2.5 text-center text-sm font-semibold text-slate-900 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors">{t("Register")}</Link>
                </div>
              )}

              <ul className="space-y-1">
                <li>
                  <Link
                    to="/"
                    onClick={handleLinkClick}
                    aria-current={isActive('/') ? 'page' : undefined}
                    className="block px-3 py-3 text-base font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    {t("Home")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop"
                    onClick={handleLinkClick}
                    aria-current={isActive('/shop') ? 'page' : undefined}
                    className="block px-3 py-3 text-base font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    {t("Shop")}
                  </Link>
                </li>

                {/* Mobile Products - now showing product names */}
                <li>
                  <button
                    type="button"
                    onClick={() => setProductsDropdown(!productsDropdown)}
                    aria-expanded={productsDropdown}
                    aria-controls="mobile-products"
                    className="w-full flex items-center justify-between px-3 py-3 text-base font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  >
                    <span>{t("Products")}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${productsDropdown ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {productsDropdown && (
                    <ul id="mobile-products" className="pl-4 space-y-1 mt-1 mb-2">
                      {productsLoading ? (
                        <li className="px-3 py-4 text-sm text-slate-400 flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                          {t("Loading...")}
                        </li>
                      ) : allProducts.length === 0 ? (
                        <li className="px-3 py-4 text-sm text-slate-400">{t("No products")}</li>
                      ) : (
                        <>
                          {allProducts.slice(0, 30).map((product) => (
                            <li key={product._id}>
                              <Link
                                to={`/shop/${product._id}`}
                                onClick={handleLinkClick}
                                title={product.name}
                                className="block px-3 py-2 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors truncate"
                              >
                                {product.name}
                              </Link>
                            </li>
                          ))}
                          {allProducts.length > 30 && (
                            <li className="px-3 py-2 text-xs text-slate-500">
                              + {allProducts.length - 30} more products
                            </li>
                          )}
                          <li className="px-3 pt-2 flex gap-4">
                            <Link to="/products" onClick={handleLinkClick} className="text-xs text-amber-400 hover:text-amber-300">
                              {t("Products Overview")}
                            </Link>
                            <Link to="/shop" onClick={handleLinkClick} className="text-xs text-amber-400 hover:text-amber-300">
                              {t("Browse Full Catalog →")}
                            </Link>
                          </li>
                        </>
                      )}
                    </ul>
                  )}
                </li>

                {/* Mobile Pharma APIs */}
                <li>
                  <button
                    type="button"
                    onClick={() => setApiMobileOpen(!apiMobileOpen)}
                    aria-expanded={apiMobileOpen}
                    aria-controls="mobile-pharma-api"
                    className="w-full flex items-center justify-between px-3 py-3 text-base font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  >
                    <span className="flex items-center gap-2"><FlaskConical className="w-4 h-4 text-amber-400" aria-hidden="true" />{t("Pharma API")}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${apiMobileOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {apiMobileOpen && (
                    <ul id="mobile-pharma-api" className="pl-4 space-y-1 mt-1 mb-2">
                      <li>
                        <Link to="/pharma-api" onClick={handleLinkClick} className="block px-3 py-2 text-sm font-semibold text-amber-400 hover:bg-slate-700 rounded-lg">
                          {t("All APIs →")}
                        </Link>
                      </li>
                      {apiCategories.map((c) => (
                        <li key={c}>
                          <Link
                            to={`/pharma-api?category=${encodeURIComponent(c)}`}
                            onClick={handleLinkClick}
                            className="block px-3 py-2 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors truncate"
                          >
                            {t(c)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>

                {/* Mobile Solutions */}
                <li>
                  <button
                    type="button"
                    onClick={() => setSolutionsDropdown(!solutionsDropdown)}
                    aria-expanded={solutionsDropdown}
                    aria-controls="mobile-solutions"
                    className="w-full flex items-center justify-between px-3 py-3 text-base font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  >
                    <span>{t("Solutions")}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${solutionsDropdown ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {solutionsDropdown && (
                    <ul id="mobile-solutions" className="pl-4 space-y-3 mt-1 mb-2">
                      {solutionsData.map((category) => (
                        <li key={t(category.name)} className="border-b border-slate-700 pb-2 last:border-0">
                          <div className="flex items-center gap-2 mb-1">
                            <category.icon className="w-4 h-4 text-amber-400" aria-hidden="true" />
                            <Link
                              to={category.path}
                              onClick={handleLinkClick}
                              className="text-sm font-semibold text-slate-200 hover:text-amber-400"
                            >
                              {t(category.name)}
                            </Link>
                          </div>
                          <ul className="pl-6 space-y-0.5">
                            {category.machines.map((machine) => (
                              <li key={t(machine)}>
                                <Link
                                  to={`/shop?search=${encodeURIComponent(machine)}`}
                                  onClick={handleLinkClick}
                                  className="text-xs text-slate-400 hover:text-amber-400 transition-colors block py-1"
                                >
                                  • {t(machine)}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>

                {/* Mobile Resources */}
                <li>
                  <button
                    type="button"
                    onClick={() => setResourcesDropdown(!resourcesDropdown)}
                    aria-expanded={resourcesDropdown}
                    aria-controls="mobile-resources"
                    className="w-full flex items-center justify-between px-3 py-3 text-base font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  >
                    <span>{t("Resources")}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${resourcesDropdown ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {resourcesDropdown && (
                    <ul id="mobile-resources" className="pl-4 space-y-1 mt-1 mb-2">
                      {resourcesLinks.map((item) => {
                        const Icon = item.icon;
                        return (
                          <li key={item.path}>
                            <Link
                              to={item.path}
                              onClick={handleLinkClick}
                              className="flex items-center gap-3 px-3 py-3 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                              <Icon className="w-4 h-4 text-amber-400 flex-shrink-0" aria-hidden="true" />
                              <div>
                                <div>{t(item.name)}</div>
                                <p className="text-xs text-slate-400">{item.description}</p>
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>

                <li>
                  <Link
                    to="/bulk-quote"
                    onClick={handleLinkClick}
                    aria-current={isActive('/bulk-quote') ? 'page' : undefined}
                    className="flex items-center justify-center gap-2 px-3 py-3 mb-1 text-base font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
                  >
                    <FileText className="w-5 h-5" aria-hidden="true" />
                    {t("Bulk Quote / Bulk Order")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/track-order"
                    onClick={handleLinkClick}
                    aria-current={isActive('/track-order') ? 'page' : undefined}
                    className="flex items-center gap-2 px-3 py-3 text-base font-semibold text-amber-400 hover:text-amber-300 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Truck className="w-5 h-5" aria-hidden="true" />
                    {t("Track Order")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/projects"
                    onClick={handleLinkClick}
                    aria-current={isActive('/projects') ? 'page' : undefined}
                    className="block px-3 py-3 text-base font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    {t("Projects")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    onClick={handleLinkClick}
                    aria-current={isActive('/contact') ? 'page' : undefined}
                    className="block px-3 py-3 text-base font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    {t("Contact")}
                  </Link>
                </li>
                {[
                  { name: 'About Us', path: '/about' },
                ].map((l) => (
                  <li key={l.path}>
                    <Link
                      to={l.path}
                      onClick={handleLinkClick}
                      aria-current={isActive(l.path) ? 'page' : undefined}
                      className="block px-3 py-3 text-base font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      {t(l.name)}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-4 px-3 py-4 bg-slate-700/50 rounded-lg space-y-3">
                <LocaleSwitcher className="text-sm text-slate-300" />
                <a href="tel:+918700792607" className="flex items-center space-x-3 text-sm text-slate-300 hover:text-amber-400">
                  <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" aria-hidden="true" />
                  <span>24/7 Support: 8700792607</span>
                </a>
                <a href="mailto:safescan21@gmail.com" className="flex items-center space-x-3 text-sm text-slate-300 hover:text-amber-400">
                  <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" aria-hidden="true" />
                  <span>safescan21@gmail.com</span>
                </a>
                <div className="flex items-center space-x-3 text-sm text-slate-300">
                  <Truck className="w-4 h-4 text-amber-400 flex-shrink-0" aria-hidden="true" />
                  <span>{t("Free Shipping ₹10,000+")}</span>
                </div>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Spacer: same height as the fixed header (classes = first paint, then measured) */}
      <div
        className="h-20 sm:h-24 md:h-28 xl:h-[290px]"
        style={headerHeight ? { height: headerHeight } : undefined}
        aria-hidden="true"
      />

      <style>{`
        @keyframes pulseCart {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); color: #4ade80; }
          100% { transform: scale(1); }
        }
        .animate-pulse-cart {
          animation: pulseCart 0.6s ease-in-out 2;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        @media (min-width: 480px) {
          .xs\\:flex {
            display: flex !important;
          }
        }
        .xs\\:flex {
          display: none;
        }
      `}</style>
    </>
  );
};

export default Navbar;