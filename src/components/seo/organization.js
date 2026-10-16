// Company + website structured data (schema.org), shared by the Navbar (live app)
// and scripts/prerender-meta.mjs (static HTML that crawlers see without JavaScript).
export const SITE_URL = 'https://www.foodpharmamachinery.com';
export const SITE_NAME = 'Food Pharma Machinery';

export const COMPANY = {
  legalName: 'PureLine Machinery Pvt. Ltd.',
  streetAddress: 'Q-37, Shivalik Nagar',
  addressLocality: 'Haridwar',
  addressRegion: 'Uttarakhand',
  addressCountry: 'IN',
  telephone: '+91-8700792607',
  email: 'safescan21@gmail.com',
};

export const organizationNode = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  legalName: COMPANY.legalName,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/favicon-192.png`,
  image: `${SITE_URL}/og-image.png`,
  email: COMPANY.email,
  telephone: COMPANY.telephone,
  address: {
    '@type': 'PostalAddress',
    streetAddress: COMPANY.streetAddress,
    addressLocality: COMPANY.addressLocality,
    addressRegion: COMPANY.addressRegion,
    addressCountry: COMPANY.addressCountry,
  },
  areaServed: 'IN',
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: COMPANY.telephone,
      contactType: 'customer support',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
  ],
};

export const websiteNode = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};
