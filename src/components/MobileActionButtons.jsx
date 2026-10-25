import { useLocale } from '../i18n/LocaleContext';
import React, { useState, useEffect } from 'react';
import { Link } from '../shell/router';
import { useSelector } from 'react-redux';
import UserAvatar from './UserAvatar';

/**
 * MobileActionButtons Component
 * Displays action buttons (Contact, Shop, Bulk Order, WhatsApp, Login/Account) only on mobile and tablet devices.
 * Uses React Router for internal navigation and regular links for external URLs.
 */
const MobileActionButtons = () => {
  const { t } = useLocale();
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const user = useSelector((state) => state.auth?.user);

  // Check device width on mount and window resize
  useEffect(() => {
    const checkDevice = () => {
      // Typically, devices with max-width 1024px are considered tablets and mobiles
      setIsMobileOrTablet(window.innerWidth <= 1024);
    };

    // Initial check
    checkDevice();

    // Add event listener for window resize
    window.addEventListener('resize', checkDevice);

    // Cleanup event listener
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // If not mobile/tablet, don't render anything
  if (!isMobileOrTablet) {
    return null;
  }

  // Helper function to check if URL is external
  const isExternalLink = (url) => {
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:');
  };

  // Action button data
  const buttons = [
    {
      id: 'contact',
      label: 'Contact',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      link: '/contact',
      bgColor: 'bg-blue-600',
      hoverBg: 'hover:bg-blue-700',
    },
    {
      id: 'shop',
      label: 'Shop',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      link: '/shop',
      bgColor: 'bg-amber-700',
      hoverBg: 'hover:bg-amber-800',
    },
    {
      id: 'bulk',
      label: 'Bulk Order',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      link: '/bulk-quote',
      bgColor: 'bg-indigo-600',
      hoverBg: 'hover:bg-indigo-700',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.449l-6.305 1.655zm6.972-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
          <path d="M8.075 6.542c-.179-.396-.366-.405-.536-.412-.152-.006-.325-.006-.498-.006-.173 0-.454.065-.692.325-.238.26-.909.888-.909 2.166 0 1.278.931 2.513 1.061 2.687.13.174 1.828 2.796 4.424 3.928 2.192.957 2.635.766 3.11.718.475-.048 1.533-.627 1.749-1.233.216-.606.216-1.125.151-1.233-.065-.108-.239-.174-.499-.304-.26-.13-1.533-.757-1.77-.844-.237-.087-.409-.13-.582.13-.173.26-.672.844-.823 1.017-.151.174-.302.195-.562.065-.26-.13-1.098-.405-2.091-1.29-.773-.689-1.295-1.54-1.447-1.8-.151-.26-.016-.401.114-.531.117-.117.26-.304.39-.456.13-.152.173-.26.26-.434.087-.173.043-.325-.022-.456-.065-.13-.582-1.404-.798-1.922-.21-.507-.423-.438-.582-.446-.151-.008-.325-.008-.498-.008-.173 0-.454.065-.692.325z" />
        </svg>
      ),
      link: 'https://wa.me/918700792607?text=Hello%20I%20would%20like%20to%20know%20more',
      bgColor: 'bg-green-600',
      hoverBg: 'hover:bg-green-700',
    },
    // Signed out: Login. Signed in: Account (their photo) → dashboard
    user
      ? {
          id: 'account',
          label: 'Account',
          icon: <UserAvatar src={user.profileImage} name={user.username || user.email || ''} size={20} />,
          link: '/dashboard',
          bgColor: 'bg-slate-800',
          hoverBg: 'hover:bg-slate-900',
        }
      : {
          id: 'login',
          label: 'Login',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9 9 0 0112 15a9 9 0 016.879 2.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          link: '/login',
          bgColor: 'bg-slate-800',
          hoverBg: 'hover:bg-slate-900',
        },
    
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg lg:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around py-1.5 px-1.5 sm:px-4">
        {buttons.map((button) => {
          const isExternal = isExternalLink(button.link);
          
          // Render React Router Link for internal routes
          if (!isExternal) {
            return (
              <Link
                key={button.id}
                to={button.link}
                className={`flex flex-col items-center justify-center min-w-0 flex-1 py-1.5 rounded-lg transition-all duration-200 ${button.bgColor} ${button.hoverBg} mx-0.5 sm:mx-1 text-white shadow-md active:scale-95`}
              >
                {button.icon}
                <span className="mt-0.5 whitespace-nowrap text-[11px] font-semibold leading-tight sm:text-xs">{t(button.label)}</span>
              </Link>
            );
          }
          
          // Render regular anchor tag for external links
          return (
            <a
              key={button.id}
              href={button.link}
              target={button.sameTab ? '_self' : '_blank'}
              rel={button.sameTab ? undefined : 'noopener noreferrer'}
              className={`flex flex-col items-center justify-center min-w-0 flex-1 py-1.5 rounded-lg transition-all duration-200 ${button.bgColor} ${button.hoverBg} mx-0.5 sm:mx-1 text-white shadow-md active:scale-95`}
            >
              {button.icon}
              <span className="mt-0.5 whitespace-nowrap text-[11px] font-semibold leading-tight sm:text-xs">{t(button.label)}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default MobileActionButtons;