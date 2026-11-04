// Every country with its own export page: /export/<slug> (one English version, no country
// copies, like the state pages: seo/localizeSeo.js). Only general, well-known facts: region,
// mains supply, currency, whether it has a sea port, and the national medicines regulator
// where we are sure of its name. Nothing here says we have customers there.
// Left out: North Korea (UN sanctions) and Pakistan (India–Pakistan trade is suspended).
//   row: slug | name | region | volts | hertz | currency | flags | medicines regulator
//   flags: L = landlocked (by sea to a neighbouring country's port, then road),
//          R = can be reached by road from India, I = island country
import { fitDescription } from '../../i18n/seoText';

const ROWS = `
afghanistan|Afghanistan|central-asia|220|50|AFN|L|
albania|Albania|europe|230|50|ALL||
algeria|Algeria|north-africa|230|50|DZD||
andorra|Andorra|eu|230|50|EUR|L|
angola|Angola|southern-africa|220|50|AOA||
antigua-and-barbuda|Antigua and Barbuda|caribbean|230|60|XCD|I|
argentina|Argentina|south-america|220|50|ARS||ANMAT
armenia|Armenia|central-asia|230|50|AMD|L|
australia|Australia|oceania|230|50|AUD||TGA (Therapeutic Goods Administration)
austria|Austria|eu|230|50|EUR|L|
azerbaijan|Azerbaijan|central-asia|220|50|AZN|L|
bahamas|Bahamas|caribbean|120|60|BSD|I|
bahrain|Bahrain|gulf|230|50|BHD|I|NHRA (National Health Regulatory Authority)
bangladesh|Bangladesh|south-asia|220|50|BDT|R|DGDA (Directorate General of Drug Administration)
barbados|Barbados|caribbean|115|50|BBD|I|
belarus|Belarus|europe|220|50|BYN|L|
belgium|Belgium|eu|230|50|EUR||
belize|Belize|central-america|110|60|BZD||
benin|Benin|west-africa|220|50|XOF||
bhutan|Bhutan|south-asia|230|50|BTN|LR|
bolivia|Bolivia|south-america|230|50|BOB|L|
bosnia-and-herzegovina|Bosnia and Herzegovina|europe|230|50|BAM||
botswana|Botswana|southern-africa|230|50|BWP|L|BoMRA (Botswana Medicines Regulatory Authority)
brazil|Brazil|south-america|127|60|BRL||ANVISA
brunei|Brunei|southeast-asia|240|50|BND||
bulgaria|Bulgaria|eu|230|50|EUR||
burkina-faso|Burkina Faso|west-africa|220|50|XOF|L|
burundi|Burundi|east-africa|220|50|BIF|L|
cabo-verde|Cabo Verde|west-africa|230|50|CVE|I|
cambodia|Cambodia|southeast-asia|230|50|KHR||
cameroon|Cameroon|central-africa|220|50|XAF||
canada|Canada|north-america|120|60|CAD||Health Canada
central-african-republic|Central African Republic|central-africa|220|50|XAF|L|
chad|Chad|central-africa|220|50|XAF|L|
chile|Chile|south-america|220|50|CLP||ISP (Instituto de Salud Pública)
china|China|east-asia|220|50|CNY||NMPA (National Medical Products Administration)
colombia|Colombia|south-america|120|60|COP||INVIMA
comoros|Comoros|east-africa|220|50|KMF|I|
congo|Republic of the Congo|central-africa|230|50|XAF||
dr-congo|DR Congo|central-africa|220|50|CDF||
costa-rica|Costa Rica|central-america|120|60|CRC||
cote-d-ivoire|Côte d’Ivoire|west-africa|220|50|XOF||
croatia|Croatia|eu|230|50|EUR||
cuba|Cuba|caribbean|110|60|CUP|I|CECMED
cyprus|Cyprus|eu|230|50|EUR|I|
czechia|Czechia|eu|230|50|CZK|L|
denmark|Denmark|eu|230|50|DKK||
djibouti|Djibouti|east-africa|220|50|DJF||
dominica|Dominica|caribbean|230|50|XCD|I|
dominican-republic|Dominican Republic|caribbean|120|60|DOP|I|
ecuador|Ecuador|south-america|120|60|USD||ARCSA
egypt|Egypt|north-africa|220|50|EGP||EDA (Egyptian Drug Authority)
el-salvador|El Salvador|central-america|115|60|USD||
equatorial-guinea|Equatorial Guinea|central-africa|220|50|XAF||
eritrea|Eritrea|east-africa|230|50|ERN||
estonia|Estonia|eu|230|50|EUR||
eswatini|Eswatini|southern-africa|230|50|SZL|L|
ethiopia|Ethiopia|east-africa|220|50|ETB|L|EFDA (Ethiopian Food and Drug Authority)
fiji|Fiji|oceania|240|50|FJD|I|
finland|Finland|eu|230|50|EUR||
france|France|eu|230|50|EUR||
gabon|Gabon|central-africa|220|50|XAF||
gambia|Gambia|west-africa|230|50|GMD||
georgia|Georgia|central-asia|220|50|GEL||
germany|Germany|eu|230|50|EUR||
ghana|Ghana|west-africa|230|50|GHS||FDA Ghana (Food and Drugs Authority)
greece|Greece|eu|230|50|EUR||
grenada|Grenada|caribbean|230|50|XCD|I|
guatemala|Guatemala|central-america|120|60|GTQ||
guinea|Guinea|west-africa|220|50|GNF||
guinea-bissau|Guinea-Bissau|west-africa|220|50|XOF||
guyana|Guyana|south-america|240|60|GYD||
haiti|Haiti|caribbean|110|60|HTG|I|
honduras|Honduras|central-america|120|60|HNL||
hungary|Hungary|eu|230|50|HUF|L|
iceland|Iceland|europe|230|50|ISK|I|
indonesia|Indonesia|southeast-asia|230|50|IDR|I|BPOM (Badan Pengawas Obat dan Makanan)
iran|Iran|middle-east|230|50|IRR||
iraq|Iraq|middle-east|230|50|IQD||
ireland|Ireland|eu|230|50|EUR|I|
israel|Israel|middle-east|230|50|ILS||
italy|Italy|eu|230|50|EUR||
jamaica|Jamaica|caribbean|110|50|JMD|I|
japan|Japan|east-asia|100|50/60|JPY|I|PMDA (Pharmaceuticals and Medical Devices Agency)
jordan|Jordan|middle-east|230|50|JOD||JFDA (Jordan Food and Drug Administration)
kazakhstan|Kazakhstan|central-asia|220|50|KZT|L|
kenya|Kenya|east-africa|240|50|KES||Pharmacy and Poisons Board
kiribati|Kiribati|oceania|240|50|AUD|I|
kuwait|Kuwait|gulf|240|50|KWD||
kyrgyzstan|Kyrgyzstan|central-asia|220|50|KGS|L|
laos|Laos|southeast-asia|230|50|LAK|L|
latvia|Latvia|eu|230|50|EUR||
lebanon|Lebanon|middle-east|230|50|LBP||
lesotho|Lesotho|southern-africa|220|50|LSL|L|
liberia|Liberia|west-africa|120|60|LRD||
libya|Libya|north-africa|230|50|LYD||
liechtenstein|Liechtenstein|europe|230|50|CHF|L|
lithuania|Lithuania|eu|230|50|EUR||
luxembourg|Luxembourg|eu|230|50|EUR|L|
madagascar|Madagascar|east-africa|220|50|MGA|I|
malawi|Malawi|southern-africa|230|50|MWK|L|PMRA (Pharmacy and Medicines Regulatory Authority)
malaysia|Malaysia|southeast-asia|240|50|MYR||NPRA (National Pharmaceutical Regulatory Agency)
maldives|Maldives|south-asia|230|50|MVR|I|
mali|Mali|west-africa|220|50|XOF|L|
malta|Malta|eu|230|50|EUR|I|
marshall-islands|Marshall Islands|oceania|120|60|USD|I|
mauritania|Mauritania|west-africa|220|50|MRU||
mauritius|Mauritius|east-africa|230|50|MUR|I|
mexico|Mexico|north-america|127|60|MXN||COFEPRIS
micronesia|Micronesia|oceania|120|60|USD|I|
moldova|Moldova|europe|230|50|MDL|L|
monaco|Monaco|eu|230|50|EUR||
mongolia|Mongolia|east-asia|230|50|MNT|L|
montenegro|Montenegro|europe|230|50|EUR||
morocco|Morocco|north-africa|220|50|MAD||
mozambique|Mozambique|southern-africa|220|50|MZN||
myanmar|Myanmar|southeast-asia|230|50|MMK||FDA Myanmar
namibia|Namibia|southern-africa|220|50|NAD||NMRC (Namibia Medicines Regulatory Council)
nauru|Nauru|oceania|240|50|AUD|I|
nepal|Nepal|south-asia|230|50|NPR|LR|DDA (Department of Drug Administration)
netherlands|Netherlands|eu|230|50|EUR||
new-zealand|New Zealand|oceania|230|50|NZD|I|Medsafe
nicaragua|Nicaragua|central-america|120|60|NIO||
niger|Niger|west-africa|220|50|XOF|L|
nigeria|Nigeria|west-africa|230|50|NGN||NAFDAC (National Agency for Food and Drug Administration and Control)
north-macedonia|North Macedonia|europe|230|50|MKD|L|
norway|Norway|europe|230|50|NOK||
oman|Oman|gulf|240|50|OMR||
palau|Palau|oceania|120|60|USD|I|
palestine|Palestine|middle-east|230|50|ILS||
panama|Panama|central-america|120|60|USD||
papua-new-guinea|Papua New Guinea|oceania|240|50|PGK||
paraguay|Paraguay|south-america|220|50|PYG|L|
peru|Peru|south-america|220|60|PEN||DIGEMID
philippines|Philippines|southeast-asia|220|60|PHP|I|FDA Philippines
poland|Poland|eu|230|50|PLN||
portugal|Portugal|eu|230|50|EUR||
qatar|Qatar|gulf|240|50|QAR||
romania|Romania|eu|230|50|RON||
russia|Russia|europe|230|50|RUB||
rwanda|Rwanda|east-africa|230|50|RWF|L|Rwanda FDA
saint-kitts-and-nevis|Saint Kitts and Nevis|caribbean|230|60|XCD|I|
saint-lucia|Saint Lucia|caribbean|240|50|XCD|I|
saint-vincent-and-the-grenadines|Saint Vincent and the Grenadines|caribbean|230|50|XCD|I|
samoa|Samoa|oceania|230|50|WST|I|
san-marino|San Marino|eu|230|50|EUR|L|
sao-tome-and-principe|São Tomé and Príncipe|central-africa|230|50|STN|I|
saudi-arabia|Saudi Arabia|gulf|230|60|SAR||SFDA (Saudi Food and Drug Authority)
senegal|Senegal|west-africa|230|50|XOF||
serbia|Serbia|europe|230|50|RSD|L|
seychelles|Seychelles|east-africa|240|50|SCR|I|
sierra-leone|Sierra Leone|west-africa|230|50|SLE||
singapore|Singapore|southeast-asia|230|50|SGD|I|HSA (Health Sciences Authority)
slovakia|Slovakia|eu|230|50|EUR|L|
slovenia|Slovenia|eu|230|50|EUR||
solomon-islands|Solomon Islands|oceania|230|50|SBD|I|
somalia|Somalia|east-africa|220|50|SOS||
south-africa|South Africa|southern-africa|230|50|ZAR||SAHPRA (South African Health Products Regulatory Authority)
south-korea|South Korea|east-asia|220|60|KRW||MFDS (Ministry of Food and Drug Safety)
south-sudan|South Sudan|east-africa|230|50|SSP|L|
spain|Spain|eu|230|50|EUR||
sri-lanka|Sri Lanka|south-asia|230|50|LKR|I|NMRA (National Medicines Regulatory Authority)
sudan|Sudan|north-africa|230|50|SDG||
suriname|Suriname|south-america|127|60|SRD||
sweden|Sweden|eu|230|50|SEK||
switzerland|Switzerland|europe|230|50|CHF|L|Swissmedic
syria|Syria|middle-east|220|50|SYP||
taiwan|Taiwan|east-asia|110|60|TWD|I|TFDA (Taiwan Food and Drug Administration)
tajikistan|Tajikistan|central-asia|220|50|TJS|L|
tanzania|Tanzania|east-africa|230|50|TZS||TMDA (Tanzania Medicines and Medical Devices Authority)
thailand|Thailand|southeast-asia|230|50|THB||Thai FDA
timor-leste|Timor-Leste|southeast-asia|220|50|USD||
togo|Togo|west-africa|220|50|XOF||
tonga|Tonga|oceania|240|50|TOP|I|
trinidad-and-tobago|Trinidad and Tobago|caribbean|115|60|TTD|I|
tunisia|Tunisia|north-africa|230|50|TND||
turkey|Türkiye|middle-east|230|50|TRY||TİTCK (Turkish Medicines and Medical Devices Agency)
turkmenistan|Turkmenistan|central-asia|220|50|TMT|L|
tuvalu|Tuvalu|oceania|230|50|AUD|I|
uganda|Uganda|east-africa|240|50|UGX|L|NDA (National Drug Authority)
ukraine|Ukraine|europe|230|50|UAH||
united-arab-emirates|United Arab Emirates|gulf|230|50|AED||
united-kingdom|United Kingdom|europe|230|50|GBP|I|MHRA (Medicines and Healthcare products Regulatory Agency)
united-states|United States|north-america|120|60|USD||FDA (U.S. Food and Drug Administration)
uruguay|Uruguay|south-america|230|50|UYU||
uzbekistan|Uzbekistan|central-asia|220|50|UZS|L|
vanuatu|Vanuatu|oceania|220|50|VUV|I|
vatican-city|Vatican City|eu|230|50|EUR|L|
venezuela|Venezuela|south-america|120|60|VES||
vietnam|Vietnam|southeast-asia|220|50|VND||DAV (Drug Administration of Vietnam)
yemen|Yemen|middle-east|230|50|YER||
zambia|Zambia|southern-africa|230|50|ZMW|L|ZAMRA (Zambia Medicines Regulatory Authority)
zimbabwe|Zimbabwe|southern-africa|220|50|ZWG|L|MCAZ (Medicines Control Authority of Zimbabwe)
`;

// Region: its name, the usual route from India and machine lines that fit (keys of LINES in
// indiaStates.js). General wording only.
export const REGIONS = {
  'south-asia': { name: 'South Asia', route: 'by sea from Indian ports, and for neighbouring countries by road across the border', lines: ['tablets', 'capsules', 'oral-liquids', 'spices', 'snacks'] },
  'southeast-asia': { name: 'Southeast Asia', route: 'by sea from Chennai or Nhava Sheva (Mumbai) to the main ports of the region', lines: ['tablets', 'capsules', 'oral-liquids', 'sauces', 'snacks'] },
  'east-asia': { name: 'East Asia', route: 'by sea from Indian ports to the major container ports of East Asia', lines: ['tablets', 'capsules', 'ointments', 'snacks'] },
  'central-asia': { name: 'Central Asia and the Caucasus', route: 'by sea and then overland through neighbouring countries', lines: ['tablets', 'capsules', 'oral-liquids', 'dry-mixes'] },
  gulf: { name: 'the Gulf', route: 'by sea from Mundra or Nhava Sheva on India’s west coast, usually one of the shortest export routes', lines: ['tablets', 'oral-liquids', 'injectables', 'spices', 'juices'] },
  'middle-east': { name: 'the Middle East', route: 'by sea from India’s west coast ports', lines: ['tablets', 'capsules', 'oral-liquids', 'ointments', 'spices'] },
  'north-africa': { name: 'North Africa', route: 'by sea from India’s west coast through the Red Sea or around to the Mediterranean', lines: ['tablets', 'capsules', 'oral-liquids', 'dry-mixes'] },
  'west-africa': { name: 'West Africa', route: 'by sea from India’s west coast to the ports of the Gulf of Guinea and the Atlantic coast', lines: ['tablets', 'capsules', 'oral-liquids', 'ointments', 'dry-mixes'] },
  'east-africa': { name: 'East Africa', route: 'by sea from India’s west coast to Mombasa, Dar es Salaam, Djibouti or the island ports', lines: ['tablets', 'capsules', 'oral-liquids', 'juices', 'dry-mixes'] },
  'central-africa': { name: 'Central Africa', route: 'by sea to the Atlantic ports of Central Africa', lines: ['tablets', 'oral-liquids', 'ointments', 'dry-mixes'] },
  'southern-africa': { name: 'Southern Africa', route: 'by sea to Durban, Maputo, Walvis Bay or Luanda', lines: ['tablets', 'capsules', 'oral-liquids', 'snacks', 'juices'] },
  eu: { name: 'the European Union', route: 'by sea from India’s west coast to the main European container ports', lines: ['tablets', 'capsules', 'ointments', 'spices', 'sauces'] },
  europe: { name: 'Europe', route: 'by sea from India’s west coast to the main European container ports', lines: ['tablets', 'capsules', 'ointments', 'spices', 'snacks'] },
  'north-america': { name: 'North America', route: 'by sea to the Atlantic or Pacific coast ports of North America', lines: ['tablets', 'capsules', 'spices', 'snacks', 'sauces'] },
  'central-america': { name: 'Central America', route: 'by sea through the Panama Canal region and Caribbean ports', lines: ['tablets', 'oral-liquids', 'sauces', 'juices'] },
  caribbean: { name: 'the Caribbean', route: 'by sea to the Caribbean container ports', lines: ['tablets', 'oral-liquids', 'sauces', 'juices'] },
  'south-america': { name: 'South America', route: 'by sea to the Atlantic or Pacific ports of South America', lines: ['tablets', 'capsules', 'oral-liquids', 'snacks', 'juices'] },
  oceania: { name: 'Oceania and the Pacific', route: 'by sea to Australia, New Zealand and the Pacific island ports', lines: ['tablets', 'oral-liquids', 'snacks', 'juices'] },
};

export const COUNTRIES = ROWS.trim().split('\n').map((row) => {
  const [slug, name, region, volts, hertz, currency, flags, regulator] = row.split('|');
  return { slug, name, region, volts: Number(volts), hertz, currency, landlocked: flags.includes('L'), road: flags.includes('R'), island: flags.includes('I'), regulator: regulator || '' };
});

export const exportCountry = (slug) => COUNTRIES.find((c) => c.slug === slug) || null;

// How machines get there
export const countryRoute = (c) => {
  if (c.road && c.landlocked) return `Machines go by road from our Haridwar factory to ${c.name}.`;
  if (c.road) return `Machines go by road from our Haridwar factory to ${c.name}, or by sea for larger lines.`;
  if (c.landlocked) return `${c.name} has no sea port: machines go by sea to a port in a neighbouring country and then by road.`;
  return `Machines are packed for export at our Haridwar factory and shipped ${REGIONS[c.region].route}.`;
};

// Mains supply as it is usually stated (motors and controls are confirmed with each plant)
export const countrySupply = (c) => `${c.volts} V, ${c.hertz} Hz`;

// The questions on the page, also its FAQ structured data (seo/pageSeo.js)
export const countryFaqs = (c) => [
  [`Do you export machines to ${c.name}?`, `Yes, machines can be exported to ${c.name}. ${countryRoute(c)} Freight, export documents and delivery time are confirmed in your quotation.`],
  [`Will the machine work on the power supply in ${c.name}?`, `Mains supply in ${c.name} is generally ${countrySupply(c)}. Machines are built for your plant’s supply: we confirm the motor and control voltage (single or three-phase) and the frequency before manufacturing.`],
  [`In which currency is the quotation?`, `Quotations are in Indian rupees (INR) or US dollars; ${c.currency === 'USD' ? `${c.name} uses the US dollar, so a USD quotation is simplest.` : `the local currency in ${c.name} is ${c.currency}, and payment terms are agreed in the quotation.`}`],
  c.regulator
    ? [`Which authority approves medicine plants in ${c.name}?`, `Medicines in ${c.name} are regulated by ${c.regulator}. We support GMP compliance with machine documentation and validation (IQ/OQ/PQ); the plant licence itself is applied for by the manufacturer.`]
    : ['Do you supply GMP documents with the machines?', 'Yes. Machines come with their documentation, and validation support (IQ/OQ/PQ) can be arranged for GMP plants.'],
  ['Can you install the machine and train our operators?', `Installation, commissioning and operator training in ${c.name} can be arranged with the order (on site or remotely), and spare parts and service are available after that.`],
];

// Within the ~60 characters Google shows
const fit = (...titles) => titles.find((t) => t.length <= 60) || titles[titles.length - 1];

// For the sitemap / page SEO (seo/pageSeo.js): one version per page (no country copies)
export const COUNTRY_PAGES = [
  {
    path: '/export',
    title: 'Pharma & Food Machinery Exporter from India – All Countries',
    description: 'Pharma and food processing machinery exported from India to every region: machines built in Haridwar, export packing, documents and spares.',
    indiaOnly: true,
  },
  ...COUNTRIES.map((c) => ({
    path: `/export/${c.slug}`,
    title: fit(`Pharma & Food Machinery Exporter to ${c.name}`, `Pharma Machinery Exporter to ${c.name}`, `Pharma Machinery for ${c.name}`),
    description: fitDescription(`Pharma and food machinery from India for ${c.name}: built for ${countrySupply(c)}, ${c.landlocked ? 'shipped via a neighbouring port' : c.road ? 'delivered by road' : 'shipped by sea'}, export documents, installation help and spares.`),
    indiaOnly: true,
  })),
];
