// Pharma manufacturing hubs with their own page: /pharma-machinery-supplier/<slug>.
// Only general, well-known facts about each cluster; installations shown on the page
// come from the admin (Dashboard → Factory & clients), never from this file.
export const CITY_HUBS = [
  {
    slug: 'haridwar',
    city: 'Haridwar',
    state: 'Uttarakhand',
    area: 'Haridwar, SIDCUL Haridwar, Roorkee and Dehradun (Selaqui)',
    intro: 'Haridwar is our home base: the factory of PureLine Machinery is in Haridwar, Uttarakhand. The SIDCUL industrial estate and the nearby Roorkee and Selaqui (Dehradun) areas have many pharma, nutraceutical and FMCG plants.',
  },
  {
    slug: 'baddi',
    city: 'Baddi',
    state: 'Himachal Pradesh',
    area: 'Baddi, Barotiwala, Nalagarh and Parwanoo',
    intro: 'The Baddi–Barotiwala–Nalagarh belt in Himachal Pradesh is one of India’s largest pharma manufacturing clusters, with hundreds of plants making tablets, capsules, liquids and ointments.',
  },
  {
    slug: 'ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    area: 'Ahmedabad, Changodar, Sanand, Bavla and Moraiya',
    intro: 'Ahmedabad and its industrial belt (Changodar, Sanand, Bavla, Moraiya) are among the main pharma manufacturing areas of Gujarat, from formulations to APIs.',
  },
  {
    slug: 'hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    area: 'Hyderabad, Genome Valley, Jeedimetla, Patancheru and Pashamylaram',
    intro: 'Hyderabad is often called the bulk drug capital of India: Genome Valley and the Jeedimetla, Patancheru and Pashamylaram estates host many API and formulation plants.',
  },
  {
    slug: 'vapi',
    city: 'Vapi',
    state: 'Gujarat',
    area: 'Vapi, Daman, Silvassa and Sarigam',
    intro: 'The Vapi GIDC estate and nearby Daman, Silvassa and Sarigam form a large industrial belt with chemical, pharma and packaging plants.',
  },
  {
    slug: 'mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    area: 'Mumbai, Thane, Navi Mumbai, Bhiwandi and Tarapur',
    intro: 'Mumbai, Thane, Navi Mumbai and the Tarapur MIDC area are home to many pharma companies, from head offices to formulation and API plants.',
  },
  {
    slug: 'pune',
    city: 'Pune',
    state: 'Maharashtra',
    area: 'Pune, Chakan, Kurkumbh, Ranjangaon and Jejuri',
    intro: 'Pune and the MIDC areas around it (Chakan, Kurkumbh, Ranjangaon, Jejuri) have a strong base of pharma, chemical and food processing plants.',
  },
  {
    slug: 'indore',
    city: 'Indore',
    state: 'Madhya Pradesh',
    area: 'Indore, Pithampur and Dewas',
    intro: 'Indore with the Pithampur industrial area and SEZ and nearby Dewas is a major pharma manufacturing centre of Madhya Pradesh.',
  },
  {
    slug: 'sikkim',
    city: 'Sikkim',
    state: 'Sikkim',
    area: 'East Sikkim (Rangpo, Majitar) and nearby areas',
    intro: 'Sikkim, mainly East Sikkim around Rangpo and Majitar, has a number of pharma formulation plants set up by leading Indian companies.',
  },
];

export const cityHub = (slug) => CITY_HUBS.find((c) => c.slug === slug) || null;

// For the sitemap / page SEO (seo/pageSeo.js)
export const CITY_PAGES = CITY_HUBS.map((c) => ({
  path: `/pharma-machinery-supplier/${c.slug}`,
  title: `Pharma Machinery Supplier in ${c.city}`,
  description: `Tablet presses, capsule fillers, blister packing, liquid filling and other pharma machines for plants in ${c.area}. Quotation, delivery, installation support, AMC and spares.`.slice(0, 160),
}));
