// Every page of the site, in each country version: /shop is served as
// /_in/shop (India), /fr/shop as /fr/shop (see proxy.js and i18n/locales.js).
// The header, footer and providers live in shell/SiteShell.jsx.
import SiteShell from '../../shell/SiteShell';
import { pageLocale } from '../pageMeta';

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  return <SiteShell locale={pageLocale(locale)}>{children}</SiteShell>;
}
