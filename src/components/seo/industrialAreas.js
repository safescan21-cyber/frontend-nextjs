// Well-known pharma and food industrial areas in India with their own page:
// /industrial-areas/<slug> (one English version, like the state pages). Only general,
// well-known facts; nothing here says we have customers there (installations shown on a
// state page come from the admin). The 9 pharma hub cities have their own pages
// (cityHubs.js); areas inside them link there.
import { fitDescription } from '../../i18n/seoText';
//   row: slug | name | state | kind (pharma / food / both) | hub city slug | developer | note
const ROWS = `
nalagarh|Nalagarh|Himachal Pradesh|pharma|baddi|HPSIDC|Part of the Baddi–Barotiwala–Nalagarh (BBN) belt, one of India’s largest pharma formulation clusters.
barotiwala|Barotiwala|Himachal Pradesh|pharma|baddi|HPSIDC|Part of the Baddi–Barotiwala–Nalagarh (BBN) pharma belt in Solan district.
paonta-sahib|Paonta Sahib|Himachal Pradesh|pharma||HPSIDC|An industrial town in Sirmaur district with pharma formulation plants.
parwanoo|Parwanoo|Himachal Pradesh|both||HPSIDC|An industrial town at the entrance of Himachal Pradesh with pharma and food units.
una|Una|Himachal Pradesh|both||HPSIDC|Industrial areas in Una district (such as Mehatpur and Tahliwal) have pharma and food units.
selaqui|Selaqui (Dehradun)|Uttarakhand|pharma|haridwar|SIIDCUL|The Selaqui industrial area near Dehradun has many pharma and nutraceutical plants.
roorkee|Roorkee|Uttarakhand|both|haridwar|SIIDCUL|Industrial areas around Roorkee (such as Bhagwanpur) have pharma, FMCG and food units, close to our Haridwar factory.
sidcul-haridwar|SIDCUL Haridwar|Uttarakhand|both|haridwar|SIIDCUL|The SIDCUL Integrated Industrial Estate in Haridwar has pharma, FMCG and food plants; our factory is in Haridwar.
pantnagar|Pantnagar|Uttarakhand|both||SIIDCUL|The SIDCUL estate at Pantnagar (Udham Singh Nagar) has pharma, FMCG and food plants.
kashipur|Kashipur|Uttarakhand|both||SIIDCUL|An industrial town in Udham Singh Nagar district with pharma, paper and food units.
ankleshwar|Ankleshwar GIDC|Gujarat|pharma|vapi|GIDC|One of Asia’s largest chemical estates, with many API and bulk drug plants.
jhagadia|Jhagadia GIDC|Gujarat|pharma||GIDC|A large GIDC estate in Bharuch district with chemical and pharma plants.
dahej|Dahej|Gujarat|pharma||GIDC|The Dahej SEZ and PCPIR in Bharuch district host chemical and pharma manufacturing.
vadodara|Vadodara|Gujarat|pharma||GIDC|Vadodara and its estates (such as Makarpura and Nandesari) have pharma and chemical plants.
changodar|Changodar|Gujarat|pharma|ahmedabad|GIDC|An industrial area near Ahmedabad with pharma formulation plants.
vatva|Vatva GIDC|Gujarat|pharma|ahmedabad|GIDC|A large GIDC estate in Ahmedabad with chemical, pharma and engineering units.
sarigam|Sarigam GIDC|Gujarat|pharma|vapi|GIDC|A GIDC estate in Valsad district near Vapi with chemical and pharma plants.
unjha|Unjha|Gujarat|food||APMC|Home of one of the world’s largest cumin and seed-spice markets (APMC Unjha).
rajkot|Rajkot|Gujarat|food||GIDC|Rajkot has many namkeen, snack and food processing units as well as engineering industry.
anand|Anand|Gujarat|food||GIDC|Known as the milk capital of India and the home of Amul; dairy and food processing.
tarapur|Tarapur MIDC|Maharashtra|pharma|mumbai|MIDC|A large MIDC estate in Palghar district with API, chemical and pharma plants.
taloja|Taloja MIDC|Maharashtra|pharma|mumbai|MIDC|An MIDC estate in Navi Mumbai with pharma, chemical and food units.
ambernath|Ambernath MIDC|Maharashtra|pharma|mumbai|MIDC|An MIDC estate in Thane district with pharma and chemical units.
kurkumbh|Kurkumbh MIDC|Maharashtra|pharma|pune|MIDC|An MIDC chemical estate in Pune district with API and pharma plants.
jejuri|Jejuri MIDC|Maharashtra|pharma|pune|MIDC|An MIDC estate in Pune district with pharma and chemical units.
aurangabad|Aurangabad (Chhatrapati Sambhajinagar)|Maharashtra|pharma||MIDC|Waluj, Chikalthana and Shendra MIDC estates have pharma plants of leading companies.
nashik|Nashik|Maharashtra|both||MIDC|Satpur, Ambad and Sinnar MIDC estates have pharma units; Nashik is also India’s main grape and wine region.
mahad|Mahad MIDC|Maharashtra|pharma||MIDC|An MIDC chemical estate in Raigad district with API and chemical plants.
lote-parshuram|Lote Parshuram MIDC|Maharashtra|pharma||MIDC|An MIDC chemical estate in Ratnagiri district with chemical and API plants.
satara|Satara|Maharashtra|food||MIDC|Satara district has a mega food park and food processing units for fruit and vegetables.
nagpur|Nagpur|Maharashtra|both||MIDC|Butibori and Hingna MIDC estates have pharma and food units; Nagpur is famous for oranges.
ratnagiri|Ratnagiri|Maharashtra|food||MIDC|Known for Alphonso mangoes and seafood processing.
sangli|Sangli|Maharashtra|food||MIDC|A major turmeric and raisin market with food processing units.
jeedimetla|Jeedimetla|Telangana|pharma|hyderabad|TGIIC|One of Hyderabad’s oldest industrial estates, with many API and formulation units.
patancheru|Patancheru|Telangana|pharma|hyderabad|TGIIC|An industrial area near Hyderabad with many bulk drug (API) plants.
pashamylaram|Pashamylaram|Telangana|pharma|hyderabad|TGIIC|An industrial area in Sangareddy district with API and pharma plants.
bollaram|Bollaram|Telangana|pharma|hyderabad|TGIIC|An industrial area near Hyderabad with pharma and chemical units.
genome-valley|Genome Valley|Telangana|pharma|hyderabad|TGIIC|A life-sciences cluster north of Hyderabad with biotech, vaccine and pharma R&D facilities.
kazipally|Kazipally|Telangana|pharma|hyderabad|TGIIC|An industrial area in Sangareddy district with API manufacturing units.
parawada|Jawaharlal Nehru Pharma City (Parawada)|Andhra Pradesh|pharma||APIIC|A dedicated pharma city near Visakhapatnam with many API and formulation plants.
nakkapalli|Nakkapalli|Andhra Pradesh|pharma||APIIC|An industrial area in Anakapalli district with large API plants.
srikakulam|Srikakulam (Pydibhimavaram)|Andhra Pradesh|pharma||APIIC|Pydibhimavaram in Srikakulam district has pharma and API plants.
sri-city|Sri City|Andhra Pradesh|both||Sri City|A large multi-product industrial city on the Andhra Pradesh–Tamil Nadu border with food and pharma units.
chittoor|Chittoor|Andhra Pradesh|food||APIIC|Chittoor district has a mega food park and is known for mango pulp processing.
guntur|Guntur|Andhra Pradesh|food||APIIC|Home of one of Asia’s largest chilli markets; spice processing and cold storage.
bommasandra|Bommasandra|Karnataka|pharma||KIADB|A KIADB industrial area in Bengaluru with pharma, biotech and engineering units.
jigani|Jigani|Karnataka|pharma||KIADB|A KIADB industrial area near Bengaluru with pharma and biotech units.
peenya|Peenya|Karnataka|both||KIADB|One of Asia’s largest industrial estates, in Bengaluru, with engineering, pharma and food units.
nanjangud|Nanjangud|Karnataka|both||KIADB|An industrial area near Mysuru with pharma, FMCG and food units.
tumakuru|Tumakuru|Karnataka|food||KIADB|Tumakuru district has a mega food park and food processing units.
alathur|Alathur|Tamil Nadu|pharma||SIDCO|An industrial estate near Chennai known for its pharma formulation units.
sriperumbudur|Sriperumbudur|Tamil Nadu|both||SIPCOT|SIPCOT estates near Chennai with manufacturing, pharma and food units.
hosur|Hosur|Tamil Nadu|both||SIPCOT|SIPCOT Hosur has engineering, pharma and food processing units near Bengaluru.
gummidipoondi|Gummidipoondi|Tamil Nadu|pharma||SIPCOT|A SIPCOT estate north of Chennai with chemical and pharma units.
erode|Erode|Tamil Nadu|food||SIPCOT|A major turmeric market (Erode turmeric) with spice and food processing.
pithampur|Pithampur|Madhya Pradesh|pharma|indore|MPIDC|A major industrial area near Indore with many pharma, automotive and food plants.
dewas|Dewas|Madhya Pradesh|both|indore|MPIDC|An industrial city near Indore with pharma plants and a mega food park.
mandideep|Mandideep|Madhya Pradesh|both||MPIDC|An industrial area near Bhopal with pharma, FMCG and food units.
verna|Verna|Goa|pharma||Goa IDC|An industrial estate in South Goa with many pharma formulation plants.
kundaim|Kundaim|Goa|pharma||Goa IDC|An industrial estate in North Goa with pharma units.
madkaim|Madkaim|Goa|pharma||Goa IDC|An industrial estate in North Goa with pharma formulation plants.
derabassi|Derabassi|Punjab|pharma||PSIEC|An industrial area near Chandigarh with pharma and chemical units.
mohali|Mohali|Punjab|pharma||PSIEC|Mohali’s industrial areas have pharma and life-science units.
fazilka|Fazilka|Punjab|food||PSIEC|Fazilka district has a mega food park; farm produce and food processing.
kapurthala|Kapurthala|Punjab|food||PSIEC|Kapurthala district has a mega food park and food processing units.
manesar|Manesar|Haryana|both||HSIIDC|An IMT industrial area near Gurugram with pharma, FMCG and food units.
bawal|Bawal|Haryana|pharma||HSIIDC|A growth centre in Rewari district with pharma and engineering units.
sonipat|Sonipat (Kundli and Rai)|Haryana|food||HSIIDC|The Kundli and Rai industrial areas north of Delhi have food processing units.
bhiwadi|Bhiwadi|Rajasthan|pharma||RIICO|A RIICO industrial area near Delhi with pharma and chemical units.
neemrana|Neemrana|Rajasthan|both||RIICO|A RIICO industrial area on the Delhi–Jaipur highway with manufacturing and food units.
bikaner|Bikaner|Rajasthan|food||RIICO|Famous for Bikaneri bhujia and namkeen; snack and food processing units.
ajmer|Ajmer|Rajasthan|food||RIICO|Ajmer district has a mega food park and food processing units.
kathua|Kathua|Jammu and Kashmir|pharma||J&K SIDCO|Industrial estates in Kathua district have pharma units.
samba|Samba|Jammu and Kashmir|pharma||J&K SIDCO|Industrial estates in Samba district have pharma and food units.
rangpo|Rangpo and Majitar|Sikkim|pharma|sikkim|SIDICO|East Sikkim has pharma formulation plants of leading Indian companies.
silvassa|Silvassa|Dadra and Nagar Haveli and Daman and Diu|pharma|vapi||Silvassa, next to Vapi, has pharma, plastics and packaging plants.
daman|Daman|Dadra and Nagar Haveli and Daman and Diu|pharma|vapi||Daman’s industrial areas have pharma and packaging units.
greater-noida|Greater Noida|Uttar Pradesh|both||UPSIDA|Industrial areas in Greater Noida have pharma, FMCG and food units.
sahibabad|Sahibabad (Ghaziabad)|Uttar Pradesh|both||UPSIDA|The Sahibabad industrial area in Ghaziabad has pharma and food units.
kalyani|Kalyani|West Bengal|both||WBIDC|An industrial town near Kolkata with pharma and food units.
jangipur|Jangipur|West Bengal|food||WBIDC|Jangipur (Murshidabad district) has a mega food park.
kanjikode|Kanjikode (Palakkad)|Kerala|both||KINFRA|An industrial area in Palakkad with food, Ayurvedic and engineering units.
kochi|Kochi|Kerala|food||KSIDC|Kochi is a centre for spice trading and seafood processing.
mettupalayam-puducherry|Puducherry industrial estates|Puducherry|pharma||PIPDIC|Industrial estates such as Mettupalayam and Thirubhuvanai have pharma formulation units.
guwahati|Guwahati|Assam|both||AIDC|Several pharma formulation plants and food units operate around Guwahati.
nalbari|Nalbari|Assam|food||AIDC|Nalbari district has a mega food park.
raipur|Raipur|Chhattisgarh|food||CSIDC|Raipur has food processing units for rice and pulses.
rayagada|Rayagada|Odisha|food||IDCO|Rayagada district has a mega food park.
narela|Narela and Bawana|Delhi|food||DSIIDC|Industrial areas in north Delhi with food, snack and packaging units.
`;

const KIND = {
  pharma: { label: 'Pharma', lines: ['tablets', 'capsules', 'oral-liquids', 'injectables', 'ointments'] },
  food: { label: 'Food', lines: ['spices', 'dry-mixes', 'snacks', 'sauces', 'juices'] },
  both: { label: 'Pharma & food', lines: ['tablets', 'capsules', 'oral-liquids', 'spices', 'snacks', 'juices'] },
};

export const INDUSTRIAL_AREAS = ROWS.trim().split('\n').map((row) => {
  const [slug, name, state, kind, hub, developer, note] = row.split('|');
  return { slug, name, state, kind, hub, developer, note, lines: KIND[kind].lines, label: KIND[kind].label };
});

export const industrialArea = (slug) => INDUSTRIAL_AREAS.find((a) => a.slug === slug) || null;

// The questions on the page, also its FAQ structured data (seo/pageSeo.js)
export const areaFaqs = (a) => [
  [`Do you supply machines to ${a.name}?`, `Yes. Machines are built and tested at our Haridwar factory and sent by road to ${a.name}, ${a.state}. Freight and delivery time are confirmed in your quotation.`],
  [`Which machines suit plants in ${a.name}?`, `${a.note} ${a.kind === 'food' ? 'Food lines such as spice grinding and packing, powder filling, snack packing, sauces and juices' : a.kind === 'pharma' ? 'Pharma lines for tablets, capsules, oral liquids, injectables and ointments' : 'Both pharma lines (tablets, capsules, liquids) and food lines (spices, snacks, juices)'} are a good fit; the right machines depend on your product and output.`],
  [a.kind === 'food' ? 'Which licence does a food plant need?' : 'Which licence does a pharma plant need?', a.kind === 'food'
    ? `Food plants in ${a.state} need an FSSAI licence. We supply machines in food-grade stainless steel with their documentation.`
    : `Pharma plants in ${a.state} need a manufacturing licence from the state drugs control authority under the Drugs and Cosmetics Act. We support GMP compliance with machine documentation and validation (IQ/OQ/PQ).`],
  ['Can you install the machine and train our operators?', 'Yes. Installation, commissioning and operator training at your site can be arranged with the order, and annual maintenance contracts (AMC) and spare parts are available after that.'],
];

const fit = (...titles) => titles.find((t) => t.length <= 60) || titles[titles.length - 1];

// For the sitemap / page SEO (seo/pageSeo.js): one version per page (no country copies)
// "Part of the BBN belt" -> "part of…" after a colon (names such as "Vadodara…" stay as they are)
const lowerStart = (s) => s.replace(/^(Part|One|An|A|Home|Known|Industrial|The|Several)\b/, (w) => w.toLowerCase());

export const AREA_PAGES = [
  {
    path: '/industrial-areas',
    title: 'Pharma & Food Industrial Areas in India – Machinery',
    description: 'Pharma and food processing machinery for India’s industrial areas: BBN, Ankleshwar, Tarapur, Jeedimetla, Pithampur, mega food parks and more.',
    indiaOnly: true,
  },
  ...INDUSTRIAL_AREAS.map((a) => ({
    path: `/industrial-areas/${a.slug}`,
    title: a.kind === 'food'
      ? fit(`Food Processing Machinery in ${a.name}`, `Food Machinery in ${a.name}`)
      : a.kind === 'pharma'
        ? fit(`Pharma Machinery Supplier in ${a.name}`, `Pharma Machinery in ${a.name}`)
        : fit(`Pharma & Food Machinery in ${a.name}`, `Pharma Machinery in ${a.name}`),
    description: fitDescription(`${a.label} machinery for ${a.name}, ${a.state}: ${lowerStart(a.note).replace(/\.$/, '')}. Quotation, delivery from Haridwar, installation and spares.`),
    indiaOnly: true,
  })),
];
