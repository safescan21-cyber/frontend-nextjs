// Frame for every admin page: a side menu with all admin pages and Logout always in
// reach. Large screens: pinned on the left, slides closed to icons (remembered).
// Phones/tablets: slides in from the floating "Admin" button; tap outside or Esc closes.
// It sits right under the site header (--site-header-h, set by Navbar.jsx).
import { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LogOut, PanelLeftClose, PanelLeftOpen, X, Menu, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import { ADMIN_NAV } from './adminNav';
import useSiteLogout from '../../../useSiteLogout';

const KEY = 'admin_menu_collapsed';
const readCollapsed = () => {
  try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
};

export default function AdminShell() {
  const { user } = useSelector((s) => s.auth ?? {});
  const { signOut, isLoggingOut } = useSiteLogout();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(readCollapsed); // large screens
  const [open, setOpen] = useState(false); // phones / tablets

  useEffect(() => {
    try { localStorage.setItem(KEY, collapsed ? '1' : '0'); } catch { /* storage blocked */ }
  }, [collapsed]);

  useEffect(() => setOpen(false), [pathname]); // close the drawer after choosing a page

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // keep the page still behind the drawer
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const narrow = collapsed && !open; // icon-only (large screens only)
  const name = user?.username || user?.name || user?.email || 'Admin';

  return (
    <div className={`transition-[padding] duration-300 ${collapsed ? 'lg:ps-[4.5rem]' : 'lg:ps-64'}`}>
      {/* Phone/tablet: dark backdrop behind the open drawer */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      <aside
        id="admin-menu"
        aria-label="Admin menu"
        className={`fixed bottom-0 start-0 z-[70] flex flex-col border-e border-slate-800 bg-slate-900 text-slate-200 shadow-2xl transition-all duration-300 ease-out
          top-0 lg:top-[var(--site-header-h,0px)] lg:z-30 lg:shadow-none
          ${open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'} lg:translate-x-0 rtl:lg:translate-x-0
          ${narrow ? 'w-72 lg:w-[4.5rem]' : 'w-72 lg:w-64'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-3 py-3">
          <div className={`flex min-w-0 items-center gap-2 ${narrow ? 'lg:hidden' : ''}`}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600"><ShieldCheck className="h-4 w-4 text-white" aria-hidden="true" /></span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white">Admin panel</p>
              <p className="truncate text-xs text-slate-400">{name}</p>
            </div>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close admin menu" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden">
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand admin menu' : 'Collapse admin menu'}
            title={collapsed ? 'Expand menu' : 'Collapse menu'}
            className={`hidden rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:inline-flex ${narrow ? 'lg:mx-auto' : ''}`}
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5 rtl:-scale-x-100" /> : <PanelLeftClose className="h-5 w-5 rtl:-scale-x-100" />}
          </button>
        </div>

        {/* Pages */}
        <nav className="flex-1 overflow-y-auto overscroll-contain px-2 py-3 [scrollbar-width:thin]">
          {ADMIN_NAV.map((g) => (
            <div key={g.group} className="mb-3">
              <p className={`px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${narrow ? 'lg:sr-only' : ''}`}>{g.group}</p>
              <ul className="space-y-0.5">
                {g.items.map(({ label, path, icon: Icon }) => (
                  <li key={path}>
                    <NavLink
                      to={path}
                      end
                      title={narrow ? label : undefined}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${narrow ? 'lg:justify-center lg:px-0' : ''} ${
                          isActive ? 'bg-blue-600/90 font-semibold text-white shadow' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className={narrow ? 'lg:sr-only' : ''}>{label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Always in reach */}
        <div className="space-y-1 border-t border-slate-800 p-2">
          <Link to="/" title={narrow ? 'View website' : undefined} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white ${narrow ? 'lg:justify-center lg:px-0' : ''}`}>
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className={narrow ? 'lg:sr-only' : ''}>View website</span>
          </Link>
          <button
            type="button"
            onClick={() => signOut()}
            disabled={isLoggingOut}
            title={narrow ? 'Logout' : undefined}
            className={`flex w-full items-center gap-3 rounded-lg bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-300 ring-1 ring-inset ring-red-500/30 transition-colors hover:bg-red-500 hover:text-white disabled:opacity-60 ${narrow ? 'lg:justify-center lg:px-0' : ''}`}
          >
            {isLoggingOut ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" /> : <LogOut className="h-4 w-4 shrink-0 rtl:-scale-x-100" aria-hidden="true" />}
            <span className={narrow ? 'lg:sr-only' : ''}>{isLoggingOut ? 'Logging out…' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* Phone/tablet: floating button that slides the menu in */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-controls="admin-menu"
        aria-expanded={open}
        className={`fixed bottom-24 start-4 z-40 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-blue-900/30 transition-transform hover:scale-105 active:scale-95 lg:hidden ${open ? 'pointer-events-none opacity-0' : ''}`}
      >
        <Menu className="h-4 w-4" aria-hidden="true" /> Admin
      </button>

      <Outlet />
    </div>
  );
}
