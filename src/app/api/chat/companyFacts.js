// Company facts the chat assistant answers from (knowledge.js) and that our own model is
// trained on (llm-training/export_dataset.mjs). Only what the website itself says: nothing
// here may be made up. To teach the chat something new, add an entry (or use Dashboard →
// Chatbot Training) and run llm-training/retrain.ps1.
//   title: what the fact is about; text: the answer; url: the page with the details;
//   asks: ways customers ask it (searched too, and used as training questions)
// (with ".js": llm-training/export_dataset.mjs imports this file with plain Node)
import { PRODUCT_DATA } from '../../../components/pages/productCategoryData.js';

const SITE = 'https://www.foodpharmamachinery.com';
export const PHONE = '+91 87007 92607';
export const EMAIL = 'safescan21@gmail.com';

const RANGE = Object.values(PRODUCT_DATA).map((c) => c.title).join(', ');

export const COMPANY_FACTS = [
  {
    title: 'Company and factory address',
    text: 'Food Pharma Machinery is the brand of PureLine Machinery Pvt. Ltd. Factory and office: Q-37 Shivalik Nagar, Haridwar, Uttarakhand, India. Machines are built and tested there before dispatch.',
    url: `${SITE}/about`,
    asks: ['Where is your factory?', 'Where are you located?', 'What is your address?', 'Which company is this?', 'Where is your office?'],
  },
  {
    title: 'Contact, phone, email and WhatsApp',
    text: `Call or WhatsApp ${PHONE}, email ${EMAIL}, use the contact form, or click the green WhatsApp button in this chat.`,
    url: `${SITE}/contact`,
    asks: ['How can I contact you?', 'What is your email?', 'What is your phone number?', 'Give me your contact details', 'Can I email you?'],
  },
  {
    title: 'Visit the factory',
    text: `Our factory is at Q-37 Shivalik Nagar, Haridwar. To plan a visit, call or WhatsApp ${PHONE} first and our team will confirm a time.`,
    url: `${SITE}/contact`,
    asks: ['Can I visit your factory?', 'Can I come and see the machine?', 'Can I meet you in Haridwar?'],
  },
  {
    title: 'Machines we sell (product range)',
    text: `We make and supply pharma and food machines: ${RANGE}, plus complete processing lines and turnkey plants. Browse them in the shop or the product pages.`,
    url: `${SITE}/shop`,
    asks: ['What machines do you sell?', 'What products do you have?', 'Show me your machine list', 'What do you manufacture?', 'What is your product range?'],
  },
  {
    title: 'How to get a quotation',
    text: `Use the quick quote form on any machine page or the bulk quote page, or call/WhatsApp ${PHONE}. Share the product, the output you need and your city. Machines with a listed price also have an instant quotation (PDF) button on their page.`,
    url: `${SITE}/bulk-quote`,
    asks: ['How do I get a quotation?', 'I need a quote', 'Send me your price list', 'How can I get prices?'],
  },
  {
    title: 'Starting a new tablet, capsule or food manufacturing unit',
    text: 'We plan new units from the product and output you want: the machine list, layout, installation and training, or a complete turnkey plant. Share your product, batch size and city and we will suggest the line.',
    url: `${SITE}/solutions/turnkey`,
    asks: ['I want to start a tablet manufacturing unit', 'I want to set up a pharma plant', 'Can you make a turnkey pharma plant?', 'I am starting a new factory, which machines do I need?'],
  },
  {
    title: 'GMP and cGMP standard',
    text: 'Our machines are built to cGMP standards for pharma and food manufacturing, and we offer GMP compliance and validation support.',
    url: `${SITE}/solutions/compliance`,
    asks: ['Are your machines GMP compliant?', 'Are the machines cGMP?', 'Do you help with validation?', 'Do you give GMP documents?'],
  },
  {
    title: 'Installation, commissioning and operator training',
    text: 'Installation, commissioning and operator training at your site can be arranged with the order.',
    url: `${SITE}/pharma-machinery`,
    asks: ['Do you provide installation?', 'Will you install the machine?', 'Do you train our operators?', 'Do you do commissioning?'],
  },
  {
    title: 'Machine testing (FAT) before dispatch',
    text: 'Every machine is built and tested at our Haridwar factory before dispatch (machine testing / FAT).',
    url: `${SITE}/factory`,
    asks: ['Do you do FAT before dispatch?', 'Is the machine tested before delivery?', 'Can we do factory acceptance test?'],
  },
  {
    title: 'Warranty',
    text: 'The warranty depends on the machine: it is shown on each machine page and in your quotation. After the warranty you can take an annual maintenance contract (AMC).',
    url: `${SITE}/shop`,
    asks: ['What is the warranty?', 'Do your machines have a guarantee?', 'How many months warranty?'],
  },
  {
    title: 'GST invoice',
    text: 'Yes, you get a GST invoice: enter your GSTIN at checkout or in the quote request. Listed prices are ex-works, GST extra.',
    url: `${SITE}/bulk-quote`,
    asks: ['Do you give GST invoice?', 'Is GST included in the price?', 'Can I get a bill with GST?'],
  },
  {
    title: 'Payment',
    text: 'Machines bought in the shop can be paid online at checkout. For quoted orders our team confirms the payment terms with your quotation.',
    url: `${SITE}/shop`,
    asks: ['What payment terms do you have?', 'How can I pay?', 'Do you take advance payment?', 'Can I pay online?'],
  },
  {
    title: 'Delivery across India and export',
    text: 'We deliver from our Haridwar factory across India; for delivery outside India our team confirms freight and timing. Machines in stock are ready to dispatch, others are made to order; the delivery time is confirmed in your quotation.',
    url: `${SITE}/bulk-quote`,
    asks: ['How long does delivery take?', 'Do you export?', 'Do you deliver outside India?', 'Can you ship to my country?', 'What is the lead time?'],
  },
  {
    title: 'Service request for a machine problem or breakdown',
    text: 'Raise a service request with the machine model, serial number and a short description of the problem (photos help). If the machine has stopped, also message us on WhatsApp.',
    url: `${SITE}/service-request`,
    asks: ['My machine has a problem', 'My machine is not working', 'I need a service engineer', 'Machine breakdown, please help'],
  },
  {
    title: 'Spare parts',
    text: 'Find spare parts by machine model on the spares page, or send the model and serial number and we will quote.',
    url: `${SITE}/spares`,
    asks: ['Do you sell spare parts?', 'I need spares for my machine', 'Where can I buy parts?'],
  },
  {
    title: 'AMC annual maintenance contract',
    text: 'Annual maintenance contracts with planned preventive visits and priority breakdown support.',
    url: `${SITE}/amc`,
    asks: ['Do you offer AMC?', 'Do you have a maintenance contract?', 'Do you do yearly servicing?'],
  },
  {
    title: 'Track an order',
    text: 'Track an order with the order number on the track order page; logged-in customers also see their orders in their account.',
    url: `${SITE}/track-order`,
    asks: ['Track my order', 'Where is my order?', 'What is my order status?'],
  },
];
