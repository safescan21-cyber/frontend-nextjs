// Content of the main search pages /pharma-machinery and /food-machinery (one design:
// components/pages/MachineryHubPage.jsx). General, well-known facts about the machine
// types only; prices and models come from the real products in the shop. Google gets the
// same FAQs as FAQPage data (seo/pageSeo.js).

export const realMachines = (products = [], categories = null) =>
  products.filter((p) => p?._id && p.name && p.active !== false &&(!categories || categories.includes(p.category)));

const lakh = (n) => `Rs. ${(n / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} lakh`;

// "What is the price…" answer, from the real shop prices when there are any
const priceAnswer = (products) => {
  const prices = products.map((p) => Number(p.price)).filter((n) => n > 0);
  return prices.length
    ? `It depends on the machine type, output and options. The machines listed on our website currently range from ${lakh(Math.min(...prices))} to ${lakh(Math.max(...prices))} (ex-works, taxes and freight extra). Ask for a quotation for your exact requirement.`
    : 'It depends on the machine type, output and options. Ask for a quotation with your product and the output you need, and we will send prices with specifications.';
};

const WHERE_MADE = { q: 'Where are your machines made?', a: 'Our factory is at Q-37 Shivalik Nagar, Haridwar, Uttarakhand, India. Machines are built and tested there before dispatch.' };
const OUTSIDE = { q: 'Do you supply machines outside Uttarakhand and outside India?', a: 'Yes. We send machines to plants across India and can quote for export. Tell us your city and country when you ask for a quotation.' };
const AFTER_SALES = { q: 'Do you provide installation, AMC and spare parts?', a: 'Installation and operator training can be arranged with the order. After installation you can book an annual maintenance contract, raise service requests and order spare parts on this website.' };
const HOW_QUOTE = { q: 'How do I get a quotation?', a: 'Use the quick quote form on this page or the bulk quote page, or call / WhatsApp +91 87007 92607. Share the product, the output you need and your location.' };

export const PHARMA_HUB = {
  key: 'pharma',
  page: {
    path: '/pharma-machinery',
    title: 'Pharma Machinery Manufacturer & Supplier in India',
    description:
      'Pharma machinery from Haridwar, India: tablet presses, capsule fillers, blister packing, liquid filling, granulation, coating and more. Prices, specs and quotes.',
  },
  crumb: 'Pharma machinery',
  theme: 'blue',
  h1: 'Pharma machinery manufacturer & supplier in India',
  intro:
    'Food Pharma Machinery (PureLine Machinery Pvt. Ltd.) makes and supplies pharmaceutical machines for tablets, capsules, liquids, injectables and packaging, from single machines to complete lines, with installation support, AMC and spare parts.',
  typesTitle: 'Types of pharma machinery we supply',
  // In the order a solid / liquid line runs. `slug` = /products/<slug> page when there is one.
  types: [
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
  ],
  categories: null, // every real machine in the shop
  machinesTitle: 'Pharma machines with prices',
  linesTitle: 'Which machines does your plant need?',
  lines: [
    { form: 'Tablets', line: 'Sifter → mixer / granulator → fluid bed dryer → blender → tablet press → coater → blister packing → cartoning', to: '/solutions/solid-dosage' },
    { form: 'Capsules', line: 'Sifter → blender → capsule filling machine → capsule polisher → blister packing → cartoning', to: '/solutions/solid-dosage' },
    { form: 'Oral liquids', line: 'Manufacturing vessel → filter press → bottle washing → liquid filling & capping → labelling → cartoning', to: '/solutions/liquid-processing' },
    { form: 'Injectables', line: 'Vial / ampoule washing → depyrogenation tunnel → aseptic filling & sealing → inspection → labelling', to: '/solutions/sterile' },
    { form: 'Ointments & creams', line: 'Ointment manufacturing plant → tube filling & sealing → cartoning', to: '/solutions/liquid-processing' },
  ],
  tipsTitle: 'How to choose pharma machinery',
  tips: [
    ['Output', 'Work out the output you need per hour or per shift, with room to grow. It decides the model (for example the number of stations on a tablet press).'],
    ['GMP & contact parts', 'Check that parts touching the product are stainless steel (usually SS 316 / 316L) and that the design is easy to clean.'],
    ['Documents', 'Ask for the documents your plant needs: drawings, manuals, material certificates and validation papers (DQ, IQ, OQ, PQ) where required.'],
    ['Change parts', 'List every product size you make: punches, dies, change parts and formats must be ordered for each.'],
    ['Utilities', 'Confirm power supply, compressed air and floor space before the machine arrives.'],
    ['Service & spares', 'Plan for installation, operator training, spare parts and an annual maintenance contract.'],
  ],
  showHubs: true, // links to the city pages (they are about pharma)
  other: { to: '/food-machinery', label: 'Food processing & packaging machinery' },
  faqTitle: 'Pharma machinery: frequently asked questions',
  faqs: (products = []) => [
    { q: 'What is pharma machinery?', a: 'Pharma machinery is the equipment used to make and pack medicines: granulators, tablet presses, capsule fillers, coating machines, liquid and powder fillers, sterile filling lines, blister packing, cartoning, labelling and inspection machines.' },
    { q: 'What is the price of pharma machinery in India?', a: priceAnswer(products) },
    { q: 'Which machines do I need for a tablet plant?', a: 'A typical tablet line has a sifter, a mixer or rapid mixer granulator, a fluid bed dryer, a blender, a tablet press, a coating machine, and blister packing and cartoning machines. The exact list depends on your products and output.' },
    WHERE_MADE,
    OUTSIDE,
    AFTER_SALES,
    HOW_QUOTE,
  ],
};

export const FOOD_HUB = {
  key: 'food',
  page: {
    path: '/food-machinery',
    title: 'Food Processing & Packaging Machinery Manufacturer in India',
    description:
      'Food machinery from Haridwar, India: mixers, pulverisers, powder and liquid filling, pouch packing, sealing, labelling and inspection. Prices, specs and quotes.',
  },
  crumb: 'Food machinery',
  theme: 'emerald',
  h1: 'Food processing & packaging machinery manufacturer in India',
  intro:
    'Food Pharma Machinery (PureLine Machinery Pvt. Ltd.) makes and supplies machines for food plants: mixing, grinding, filling, pouch packing, sealing, labelling and inspection, from single machines to complete lines, with installation support, AMC and spare parts.',
  typesTitle: 'Types of food machinery we supply',
  types: [
    { slug: 'mixing', name: 'Mixing & blending', text: 'Ribbon blenders, planetary mixers, double cone and V blenders for spices, flour, premixes and other dry or semi-dry foods.' },
    { slug: 'milling', name: 'Grinding & size reduction', text: 'Pulverisers, hammer mills and multi mills that grind spices, grains, sugar and dry ingredients to the size you need.' },
    { slug: 'sifting', name: 'Sifting & cleaning', text: 'Vibro sifters and screens that remove lumps and foreign matter and grade powders before packing.' },
    { slug: 'process-vessels', name: 'Process vessels & kettles', text: 'Stainless steel mixing tanks, jacketed kettles and storage vessels for sauces, syrups, juices and other liquid foods.' },
    { slug: 'powder-filling', name: 'Powder & granule filling', text: 'Auger fillers for powders such as flour, masala and milk powder, and cup fillers for free-flowing granules, into jars, cans and pouches.' },
    { slug: 'liquid-filling', name: 'Liquid & paste filling', text: 'Filling and capping machines for water, juices, oils, sauces, ketchup, honey and pastes in bottles and jars.' },
    { slug: 'pouch-packing', name: 'Pouch packing (FFS)', text: 'Form-fill-seal machines that make, fill and seal pouches and sachets of snacks, spices, sugar, tea and liquids.' },
    { slug: 'sealing', name: 'Sealing & capping', text: 'Band sealers, induction cap sealers and capping machines that close packs and keep food fresh.' },
    { slug: 'labeling', name: 'Labelling & coding', text: 'Labelling machines for bottles, jars and cartons, with batch, MRP and expiry coding.' },
    { slug: 'cartoning', name: 'Cartoning & case packing', text: 'Machines that put packs into cartons and cases ready for dispatch.' },
    { slug: 'inspection', name: 'Checkweighing & metal detection', text: 'Checkweighers and metal detectors that reject under-weight packs and packs with metal contamination.' },
    { slug: 'conveying', name: 'Conveyors & material handling', text: 'Conveyors, screw feeders and elevators that move product and packs between machines.' },
  ],
  categories: ['mixing', 'milling', 'powder-filling', 'liquid-filling', 'inspection', 'material-handling', 'packaging-accessories'],
  machinesTitle: 'Food machines with prices',
  linesTitle: 'Which machines does your food plant need?',
  lines: [
    { form: 'Spices & masala', line: 'Cleaning → pulveriser → sifter → ribbon blender → pouch packing (FFS) → checkweigher → case packing', to: '/solutions/packaging' },
    { form: 'Flour, milk powder & dry mixes', line: 'Sifter → ribbon blender → auger powder filling (jars or pouches) → sealing → checkweigher → labelling', to: '/solutions/packaging' },
    { form: 'Snacks, tea & sugar', line: 'Feeding conveyor → pouch packing (FFS) → metal detector → checkweigher → case packing', to: '/solutions/packaging' },
    { form: 'Sauces, ketchup & pastes', line: 'Jacketed kettle / mixing tank → transfer pump → piston (paste) filling → capping → labelling', to: '/solutions/liquid-processing' },
    { form: 'Juices, drinks & edible oils', line: 'Mixing tank → filter → bottle filling & capping → induction sealing → labelling → shrink wrapping or cartoning', to: '/solutions/liquid-processing' },
  ],
  tipsTitle: 'How to choose food machinery',
  tips: [
    ['Output', 'Work out how many kilos, pouches or bottles you need per hour or per shift, with room to grow.'],
    ['Food-grade contact parts', 'Parts touching food should be stainless steel (SS 304 or SS 316) with food-grade seals, and easy to clean.'],
    ['Your product', 'Free-flowing or sticky powder, thin or thick liquid, with or without pieces: this decides the type of filler (auger, cup, piston or gravity).'],
    ['Pack formats', 'List every pack size and material (pouch laminate, jar, bottle, can). Each format may need its own change parts.'],
    ['Hygiene & licences', 'Plan the plant layout for cleaning, and the licences your plant needs, such as FSSAI.'],
    ['Service & spares', 'Plan for installation, operator training, spare parts and an annual maintenance contract.'],
  ],
  showHubs: false,
  other: { to: '/pharma-machinery', label: 'Pharma machinery' },
  faqTitle: 'Food machinery: frequently asked questions',
  faqs: (products = []) => [
    { q: 'What is food processing machinery?', a: 'Food processing machinery is the equipment used to prepare and pack food: mixers, blenders, grinders and pulverisers, sifters, process vessels, filling machines, pouch packing (form-fill-seal) machines, sealers, labellers, checkweighers and metal detectors.' },
    { q: 'What is the price of food processing machinery in India?', a: priceAnswer(products) },
    { q: 'Which machines do I need for a spice (masala) plant?', a: 'A typical spice line has cleaning, a pulveriser, a sifter, a ribbon blender, a pouch packing (FFS) machine, a checkweigher and case packing. The exact list depends on your spices, pack sizes and output.' },
    { q: 'Which filling machine is right for my product?', a: 'Auger fillers suit powders such as flour, masala and milk powder; cup fillers suit free-flowing granules such as sugar, rice and pulses; piston fillers suit thick products such as sauces, honey and pastes; gravity or overflow fillers suit thin liquids such as water, juice and oil.' },
    { q: 'Are your machines food grade?', a: 'Machines for food are made with stainless steel contact parts (SS 304 or SS 316, depending on the product). The material of the contact parts is stated in our quotation.' },
    WHERE_MADE,
    OUTSIDE,
    AFTER_SALES,
    HOW_QUOTE,
  ],
};

export const MACHINERY_HUBS = { pharma: PHARMA_HUB, food: FOOD_HUB };
export const HUB_PAGES = [PHARMA_HUB.page, FOOD_HUB.page];
