// Content of /pharma-machinery, the main page for the search "pharma machinery".
// General, well-known facts about the machine types only; prices and models come from
// the real products in the shop. Google gets the same FAQs as FAQPage data (seo/pageSeo.js).

export const PHARMA_MACHINERY_PAGE = {
  path: '/pharma-machinery',
  title: 'Pharma Machinery Manufacturer & Supplier in India',
  description:
    'Pharma machinery from Haridwar, India: tablet presses, capsule fillers, blister packing, liquid filling, granulation, coating and more. Prices, specs and quotes.',
};

// Machine types in the order a solid / liquid line runs. `slug` = /products/<slug> page.
export const MACHINE_TYPES = [
  { slug: 'granulation', name: 'Granulation & mixing', text: 'Mixers, rapid mixer granulators, fluid bed dryers, multi mills and blenders that turn raw powders into a uniform granule ready for compression or filling.' },
  { slug: 'tablet-press', name: 'Tablet presses', text: 'Single punch (eccentric) presses for R&D and small batches, and rotary presses with 8 to 45+ stations for production.' },
  { slug: 'coating', name: 'Tablet coating', text: 'Coating pans and auto coaters for film, sugar and enteric coating of tablets.' },
  { slug: 'capsule-filling', name: 'Capsule filling', text: 'Manual, semi-automatic and fully automatic capsule filling machines for hard gelatin and HPMC capsules of sizes 00 to 5.' },
  { slug: 'powder-filling', name: 'Powder filling', text: 'Auger and vacuum powder fillers for dry syrups, sachets, jars and bottles.' },
  { slug: 'liquid-filling', name: 'Liquid filling & capping', text: 'Filling, capping and sealing machines for syrups, suspensions, oils, sprays and aerosols.' },
  { slug: 'aseptic-filling', name: 'Sterile & aseptic filling', text: 'Vial and ampoule washing, depyrogenation, filling and sealing for injectables, usually inside clean rooms or isolators.' },
  { slug: 'blister-packaging', name: 'Blister packing', text: 'Alu-PVC and Alu-Alu blister packing machines for tablets and capsules.' },
  { slug: 'cartoning', name: 'Cartoning', text: 'Machines that fold cartons and insert blisters, bottles or tubes with the leaflet.' },
  { slug: 'labeling', name: 'Labelling', text: 'Sticker labelling for round bottles, vials and cartons, with batch and expiry printing.' },
  { slug: 'inspection', name: 'Inspection & checkweighing', text: 'Checkweighers, metal detectors and vision inspection that reject faulty packs.' },
  { slug: 'cleanroom', name: 'Clean room equipment', text: 'Pass boxes, laminar air flow units, dispensing booths and other clean room equipment.' },
];

// Which machines a plant needs, by dosage form (links go to the solution pages)
export const BY_DOSAGE_FORM = [
  { form: 'Tablets', line: 'Sifter → mixer / granulator → fluid bed dryer → blender → tablet press → coater → blister packing → cartoning', to: '/solutions/solid-dosage' },
  { form: 'Capsules', line: 'Sifter → blender → capsule filling machine → capsule polisher → blister packing → cartoning', to: '/solutions/solid-dosage' },
  { form: 'Oral liquids', line: 'Manufacturing vessel → filter press → bottle washing → liquid filling & capping → labelling → cartoning', to: '/solutions/liquid-processing' },
  { form: 'Injectables', line: 'Vial / ampoule washing → depyrogenation tunnel → aseptic filling & sealing → inspection → labelling', to: '/solutions/sterile' },
  { form: 'Ointments & creams', line: 'Ointment manufacturing plant → tube filling & sealing → cartoning', to: '/solutions/liquid-processing' },
];

export const BUYING_TIPS = [
  ['Output', 'Work out the output you need per hour or per shift, with room to grow. It decides the model (for example the number of stations on a tablet press).'],
  ['GMP & contact parts', 'Check that parts touching the product are stainless steel (usually SS 316 / 316L) and that the design is easy to clean.'],
  ['Documents', 'Ask for the documents your plant needs: drawings, manuals, material certificates and validation papers (DQ, IQ, OQ, PQ) where required.'],
  ['Change parts', 'List every product size you make: punches, dies, change parts and formats must be ordered for each.'],
  ['Utilities', 'Confirm power supply, compressed air and floor space before the machine arrives.'],
  ['Service & spares', 'Plan for installation, operator training, spare parts and an annual maintenance contract.'],
];

// Demo products (Backend/scripts/seed-demo-products.js) are never shown or priced here
const DEMO_MATCH = /\/demo-products\//;
export const realMachines = (products = []) =>
  products.filter((p) => p?._id && p.name && !(p.images || []).some((i) => DEMO_MATCH.test(i)));

const lakh = (n) => `Rs. ${(n / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} lakh`;

// FAQs; the price answer is built from the real shop prices when there are any
export const pharmaMachineryFaqs = (products = []) => {
  const prices = products.map((p) => Number(p.price)).filter((n) => n > 0);
  const priceAnswer = prices.length
    ? `It depends on the machine type, output and options. The machines listed on our website currently range from ${lakh(Math.min(...prices))} to ${lakh(Math.max(...prices))} (ex-works, taxes and freight extra). Ask for a quotation for your exact requirement.`
    : 'It depends on the machine type, output and options. Ask for a quotation with your product and the output you need, and we will send prices with specifications.';
  return [
    { q: 'What is pharma machinery?', a: 'Pharma machinery is the equipment used to make and pack medicines: granulators, tablet presses, capsule fillers, coating machines, liquid and powder fillers, sterile filling lines, blister packing, cartoning, labelling and inspection machines.' },
    { q: 'What is the price of pharma machinery in India?', a: priceAnswer },
    { q: 'Which machines do I need for a tablet plant?', a: 'A typical tablet line has a sifter, a mixer or rapid mixer granulator, a fluid bed dryer, a blender, a tablet press, a coating machine, and blister packing and cartoning machines. The exact list depends on your products and output.' },
    { q: 'Where are your machines made?', a: 'Our factory is at Q-37 Shivalik Nagar, Haridwar, Uttarakhand, India. Machines are built and tested there before dispatch.' },
    { q: 'Do you supply machines outside Uttarakhand and outside India?', a: 'Yes. We send machines to plants across India and can quote for export. Tell us your city and country when you ask for a quotation.' },
    { q: 'Do you provide installation, AMC and spare parts?', a: 'Installation and operator training can be arranged with the order. After installation you can book an annual maintenance contract, raise service requests and order spare parts on this website.' },
    { q: 'How do I get a quotation?', a: 'Use the quick quote form on this page or the bulk quote page, or call / WhatsApp +91 87007 92607. Share the product, the output you need and your location.' },
  ];
};
