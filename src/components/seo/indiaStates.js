// Every Indian state and union territory with its own page: /machinery-supplier/<slug>.
// Only general, well-known facts about each one (its pharma clusters where it has them, main
// food products, the state's industrial development corporation). Nothing here says we have
// customers or installations there: installations shown on a page come from the admin
// (Dashboard → Factory & clients). India-only pages (no country versions, seo/localizeSeo.js).
//   pharma: well-known pharma manufacturing areas ('' when the state has no notable cluster)
//   food:   main farm and food products processed there
//   corp:   the state's industrial development corporation ('' when there is none to name)
//   lines:  machine lines that fit (keys of LINES below), cities: city pages (cityHubs.js)
//   sea:    machines reach it partly by sea (islands)
import { MACHINERY_HUBS } from './machineryHubs';

export const INDIA_STATES = [
  { slug: 'andhra-pradesh', name: 'Andhra Pradesh', kind: 'state', corp: 'APIIC', pharma: 'Visakhapatnam (Jawaharlal Nehru Pharma City, Parawada) and the Nakkapalli–Srikakulam belt are major API manufacturing centres.', food: 'rice, Guntur chillies, mangoes and aquaculture (shrimp)', lines: ['tablets', 'oral-liquids', 'spices', 'juices'] },
  { slug: 'arunachal-pradesh', name: 'Arunachal Pradesh', kind: 'state', corp: 'APIDFC', pharma: '', food: 'oranges, kiwi, large cardamom, ginger and tea', lines: ['spices', 'juices', 'snacks'] },
  { slug: 'assam', name: 'Assam', kind: 'state', corp: 'AIDC', pharma: 'Several pharma formulation plants operate around Guwahati.', food: 'tea, rice and fish', lines: ['tablets', 'snacks', 'dry-mixes'] },
  { slug: 'bihar', name: 'Bihar', kind: 'state', corp: 'BIADA', pharma: '', food: 'makhana (fox nuts), litchi, maize and dairy', lines: ['snacks', 'juices', 'dry-mixes'] },
  { slug: 'chhattisgarh', name: 'Chhattisgarh', kind: 'state', corp: 'CSIDC', pharma: '', food: 'rice, pulses and forest produce', lines: ['dry-mixes', 'snacks'] },
  { slug: 'goa', name: 'Goa', kind: 'state', corp: 'Goa IDC', pharma: 'Goa has many pharma formulation plants in industrial estates such as Verna, Kundaim and Madkaim.', food: 'cashew, coconut and seafood', lines: ['tablets', 'capsules', 'oral-liquids', 'snacks'] },
  { slug: 'gujarat', name: 'Gujarat', kind: 'state', corp: 'GIDC', pharma: 'Gujarat is one of India’s largest pharma states: Ahmedabad, Vadodara, Ankleshwar and Vapi have formulation and API plants.', food: 'groundnut and cottonseed oil, dairy, cumin and other spices', lines: ['tablets', 'capsules', 'injectables', 'spices', 'juices'], cities: ['ahmedabad', 'vapi'] },
  { slug: 'haryana', name: 'Haryana', kind: 'state', corp: 'HSIIDC', pharma: 'Gurugram, Manesar and other HSIIDC estates have pharma, nutraceutical and FMCG units.', food: 'wheat, basmati rice and dairy', lines: ['tablets', 'dry-mixes', 'snacks'] },
  { slug: 'himachal-pradesh', name: 'Himachal Pradesh', kind: 'state', corp: 'HPSIDC', pharma: 'The Baddi–Barotiwala–Nalagarh belt is one of India’s largest pharma clusters; Paonta Sahib and Parwanoo have pharma plants too.', food: 'apples and other fruit', lines: ['tablets', 'capsules', 'oral-liquids', 'ointments', 'juices'], cities: ['baddi'] },
  { slug: 'jharkhand', name: 'Jharkhand', kind: 'state', corp: 'JIADA', pharma: '', food: 'rice, vegetables and forest produce', lines: ['dry-mixes', 'snacks'] },
  { slug: 'karnataka', name: 'Karnataka', kind: 'state', corp: 'KIADB', pharma: 'Bengaluru is a major biotech and pharma centre.', food: 'coffee, spices, sugar and ragi', lines: ['tablets', 'capsules', 'injectables', 'spices', 'snacks'] },
  { slug: 'kerala', name: 'Kerala', kind: 'state', corp: 'KSIDC and KINFRA', pharma: 'Kerala is known for its Ayurvedic medicine makers (tablets, oils, arishtas and ointments).', food: 'pepper, cardamom and other spices, coconut oil, cashew and seafood', lines: ['spices', 'juices', 'tablets', 'oral-liquids', 'ointments'] },
  { slug: 'madhya-pradesh', name: 'Madhya Pradesh', kind: 'state', corp: 'MPIDC', pharma: 'Indore with the Pithampur industrial area and nearby Dewas is a major pharma centre.', food: 'soybean, wheat, pulses and garlic', lines: ['tablets', 'capsules', 'dry-mixes', 'juices'], cities: ['indore'] },
  { slug: 'maharashtra', name: 'Maharashtra', kind: 'state', corp: 'MIDC', pharma: 'Mumbai, Thane, Tarapur, Pune, Aurangabad (Chhatrapati Sambhajinagar) and Nashik have many pharma companies and plants.', food: 'sugar, onions, grapes, mangoes and dairy', lines: ['tablets', 'capsules', 'injectables', 'oral-liquids', 'snacks', 'juices'], cities: ['mumbai', 'pune'] },
  { slug: 'manipur', name: 'Manipur', kind: 'state', corp: 'MANIDCO', pharma: '', food: 'rice, pineapple and ginger', lines: ['juices', 'spices'] },
  { slug: 'meghalaya', name: 'Meghalaya', kind: 'state', corp: 'MIDC Meghalaya', pharma: '', food: 'Lakadong turmeric, ginger and pineapple', lines: ['spices', 'juices'] },
  { slug: 'mizoram', name: 'Mizoram', kind: 'state', corp: 'ZIDCO', pharma: '', food: 'ginger, turmeric and fruit', lines: ['spices', 'juices'] },
  { slug: 'nagaland', name: 'Nagaland', kind: 'state', corp: 'NIDC', pharma: '', food: 'king chilli, ginger and pineapple', lines: ['spices', 'sauces'] },
  { slug: 'odisha', name: 'Odisha', kind: 'state', corp: 'IDCO', pharma: '', food: 'rice, seafood and Kandhamal turmeric', lines: ['dry-mixes', 'spices'] },
  { slug: 'punjab', name: 'Punjab', kind: 'state', corp: 'PSIEC', pharma: 'Mohali and Derabassi have pharma units.', food: 'wheat, rice and dairy', lines: ['tablets', 'dry-mixes', 'snacks'] },
  { slug: 'rajasthan', name: 'Rajasthan', kind: 'state', corp: 'RIICO', pharma: 'Bhiwadi and Jaipur have pharma and chemical units.', food: 'coriander, cumin and other seed spices, mustard oil and guar', lines: ['spices', 'juices', 'tablets'] },
  { slug: 'sikkim', name: 'Sikkim', kind: 'state', corp: 'SIDICO', pharma: 'East Sikkim, around Rangpo and Majitar, has pharma formulation plants of leading Indian companies.', food: 'large cardamom, ginger and tea', lines: ['tablets', 'capsules', 'spices'], cities: ['sikkim'] },
  { slug: 'tamil-nadu', name: 'Tamil Nadu', kind: 'state', corp: 'SIPCOT', pharma: 'Chennai and its SIPCOT estates have pharma and medical-device units.', food: 'rice, Erode turmeric, coconut, spices and dairy', lines: ['tablets', 'oral-liquids', 'spices', 'snacks'] },
  { slug: 'telangana', name: 'Telangana', kind: 'state', corp: 'TGIIC (formerly TSIIC)', pharma: 'Hyderabad is often called the bulk drug capital of India: Genome Valley, Jeedimetla, Patancheru and Pashamylaram host many API and formulation plants.', food: 'rice, Nizamabad turmeric and chillies', lines: ['tablets', 'capsules', 'injectables', 'spices'], cities: ['hyderabad'] },
  { slug: 'tripura', name: 'Tripura', kind: 'state', corp: 'TIDC', pharma: '', food: 'pineapple, tea and rubber', lines: ['juices', 'snacks'] },
  { slug: 'uttar-pradesh', name: 'Uttar Pradesh', kind: 'state', corp: 'UPSIDA', pharma: 'Lucknow and the Noida–Ghaziabad area have pharma units.', food: 'sugar, wheat, dairy, mangoes and potatoes', lines: ['tablets', 'dry-mixes', 'snacks', 'juices'] },
  { slug: 'uttarakhand', name: 'Uttarakhand', kind: 'state', corp: 'SIIDCUL', pharma: 'Our factory is in Haridwar. SIDCUL Haridwar, Roorkee, Selaqui (Dehradun) and Pantnagar have many pharma, nutraceutical and FMCG plants.', food: 'basmati rice, fruit and herbs', lines: ['tablets', 'capsules', 'oral-liquids', 'ointments', 'juices'], cities: ['haridwar'] },
  { slug: 'west-bengal', name: 'West Bengal', kind: 'state', corp: 'WBIDC', pharma: 'Kolkata has a long-established pharma industry.', food: 'rice, Darjeeling tea, fish and sweets', lines: ['tablets', 'snacks', 'dry-mixes'] },
  { slug: 'andaman-and-nicobar-islands', name: 'Andaman and Nicobar Islands', kind: 'union territory', corp: 'ANIIDCO', pharma: '', food: 'coconut, seafood and spices', lines: ['juices', 'spices'], sea: true },
  { slug: 'chandigarh', name: 'Chandigarh', kind: 'union territory', corp: '', pharma: 'Chandigarh sits next to Mohali and Panchkula and about an hour from the Baddi pharma belt.', food: 'bakery, dairy and packaged foods', lines: ['tablets', 'snacks'] },
  { slug: 'dadra-nagar-haveli-daman-diu', name: 'Dadra and Nagar Haveli and Daman and Diu', kind: 'union territory', corp: '', pharma: 'Silvassa and Daman, next to Vapi, have pharma, plastics and packaging plants.', food: 'packaged foods and seafood', lines: ['tablets', 'oral-liquids', 'snacks'], cities: ['vapi'] },
  { slug: 'delhi', name: 'Delhi', kind: 'union territory', corp: 'DSIIDC', pharma: 'Many pharma companies have head offices in Delhi; industrial areas include Okhla, Narela and Bawana.', food: 'spices (Khari Baoli market), snacks and confectionery', lines: ['spices', 'snacks', 'tablets'] },
  { slug: 'jammu-and-kashmir', name: 'Jammu and Kashmir', kind: 'union territory', corp: 'J&K SIDCO', pharma: 'Industrial estates in Kathua and Samba have pharma units.', food: 'saffron, apples and walnuts', lines: ['spices', 'juices', 'tablets'] },
  { slug: 'ladakh', name: 'Ladakh', kind: 'union territory', corp: '', pharma: '', food: 'apricots and sea buckthorn', lines: ['juices'] },
  { slug: 'lakshadweep', name: 'Lakshadweep', kind: 'union territory', corp: '', pharma: '', food: 'coconut and tuna', lines: ['juices'], sea: true },
  { slug: 'puducherry', name: 'Puducherry', kind: 'union territory', corp: 'PIPDIC', pharma: 'Puducherry has pharma formulation units.', food: 'rice and seafood', lines: ['tablets', 'oral-liquids'] },
];

// Machine lines a state page can suggest: the lines of /pharma-machinery and /food-machinery
// (MACHINERY_HUBS[hub].lines[index]), so the text and links come from one place
export const LINES = {
  tablets: ['pharma', 0],
  capsules: ['pharma', 1],
  'oral-liquids': ['pharma', 2],
  injectables: ['pharma', 3],
  ointments: ['pharma', 4],
  spices: ['food', 0],
  'dry-mixes': ['food', 1],
  snacks: ['food', 2],
  sauces: ['food', 3],
  juices: ['food', 4],
};

export const indiaState = (slug) => INDIA_STATES.find((s) => s.slug === slug) || null;

// A state's lines with their text and link: [{ key, hub, form, line, to }]
export const stateLines = (state) => state.lines.map((key) => {
  const [hub, index] = LINES[key];
  return { key, hub, ...MACHINERY_HUBS[hub].lines[index] };
});

// The questions on the page, also its FAQ structured data (seo/pageSeo.js)
export const stateFaqs = (state) => [
  [`Do you deliver machines to ${state.name}?`, state.sea
    ? `Yes. Machines are built at our Haridwar factory, go by road to the port and by sea to ${state.name}. Freight and delivery time are confirmed in your quotation.`
    : `Yes. Machines are built and tested at our Haridwar factory and sent by road to ${state.name}. Freight and delivery time are confirmed in your quotation.`],
  [`Which machines suit ${state.name}?`, `That depends on your product and output. ${state.name} is known for ${state.food}${state.pharma ? ', and it has pharma manufacturing' : ''}, so good lines to start with are: ${stateLines(state).map((l) => l.form.toLowerCase()).join(', ')}. Tell us your product and we will suggest the machines.`],
  ['Can you install the machine and train our operators?', 'Yes. Installation, commissioning and operator training at your site can be arranged with the order, and annual maintenance contracts (AMC) and spare parts are available after that.'],
];

// For the sitemap / page SEO (seo/pageSeo.js): India-only pages
export const STATE_PAGES = [
  {
    path: '/machinery-supplier',
    title: 'Pharma & Food Machinery Suppliers by State in India',
    description: 'Pharma and food processing machinery for every Indian state and union territory: machines, delivery from our Haridwar factory, installation support, AMC and spares.',
    indiaOnly: true,
  },
  ...INDIA_STATES.map((s) => ({
    path: `/machinery-supplier/${s.slug}`,
    title: `Pharma & Food Machinery Supplier in ${s.name}`,
    description: `Pharma and food processing machines for ${s.name}${s.pharma ? ' pharma plants' : ''} and ${s.food.split(',')[0]} processing: quotation, delivery from Haridwar, installation support, AMC and spares.`.slice(0, 160),
    indiaOnly: true,
  })),
];
