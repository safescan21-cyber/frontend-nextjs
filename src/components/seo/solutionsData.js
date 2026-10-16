// Content for the /solutions pages. Machine lists match the Navbar menu.
// Keep wording factual — no numbers or certifications that aren't true for the business.
export const SOLUTIONS = [
  {
    slug: 'solid-dosage',
    name: 'Solid Dosage',
    title: 'Solid Dosage Machinery',
    intro:
      'Equipment for making tablets and capsules — from granulation and drying to compression, coating and capsule filling. We help pharma and nutraceutical manufacturers choose machines that match their batch size, product and GMP requirements.',
    machines: ['Tablet Press Machines', 'Capsule Filling Machines', 'Granulation Equipment', 'Coating Systems', 'Dryers & Sifters', 'Compression Tooling'],
    points: [
      'Single-rotary and double-rotary tablet presses for R&D, pilot and production scale',
      'Manual, semi-automatic and fully automatic capsule fillers',
      'Rapid mixer granulators, fluid bed dryers, multi-mills and sifters',
      'Punches, dies and tooling with change parts for existing machines',
    ],
  },
  {
    slug: 'liquid-processing',
    name: 'Liquid Processing',
    title: 'Liquid & Semi-Solid Processing Equipment',
    intro:
      'Machines for syrups, suspensions, ointments, creams and gels — mixing, homogenising, holding and filling. Suitable for pharmaceutical, cosmetic and food liquid lines.',
    machines: ['Liquid Filling Machines', 'Ointment Mixers', 'Emulsion Tanks', 'Suspension Equipment', 'Homogenizers', 'Sterile Liquid Filling'],
    points: [
      'Volumetric and servo-driven liquid filling for bottles and vials',
      'Ointment, cream and gel manufacturing plants with vacuum homogenisers',
      'Jacketed storage and emulsion tanks in stainless steel',
      'Sterile liquid filling for injectables and ophthalmic products',
    ],
  },
  {
    slug: 'packaging',
    name: 'Packaging',
    title: 'Pharma & Food Packaging Machines',
    intro:
      'Primary and secondary packaging equipment — blister and strip packing, cartoning, labelling, wrapping and sachet filling — to take your product from line to shipment.',
    machines: ['Blister Packaging Lines', 'Strip Packaging Machines', 'Cartoning Machines', 'Labelling Machines', 'Wrapping Systems', 'Sachet Filling Machines'],
    points: [
      'Alu-alu and alu-PVC blister packing machines',
      'Strip packing for tablets and capsules',
      'Horizontal and vertical cartoners with leaflet insertion',
      'Sticker labelling, shrink wrapping and sachet / pouch filling',
    ],
  },
  {
    slug: 'sterile',
    name: 'Sterile & Aseptic',
    title: 'Sterile & Aseptic Processing Equipment',
    intro:
      'Equipment for sterile manufacturing environments — freeze drying, isolators, VHP pass-throughs, autoclaves and cleanroom equipment for injectables and biologics.',
    machines: ['Lyophilizers (Freeze Dryers)', 'VHP Pass-Throughs', 'Isolators', 'Sterile Filling Lines', 'Autoclaves', 'Cleanroom Equipment'],
    points: [
      'Laboratory, pilot and production freeze dryers',
      'Isolators and RABS for aseptic filling',
      'Steam sterilisers and VHP decontamination pass boxes',
      'Laminar air flow units, pass boxes and other cleanroom equipment',
    ],
  },
  {
    slug: 'inspection',
    name: 'Inspection & QC',
    title: 'Inspection & Quality Control Equipment',
    intro:
      'Inspection systems that catch defects before products leave the line — vision inspection, leak testing, metal detection, checkweighing and X-ray.',
    machines: ['Vision Inspection Systems', 'Leak Testers', 'Metal Detectors', 'Checkweighers', 'X-Ray Inspection', 'Automatic Defect Removal'],
    points: [
      'Camera-based inspection for print, fill level and blister defects',
      'Leak testing for blisters, bottles and pouches',
      'Metal detectors and checkweighers with automatic rejection',
      'X-ray inspection for foreign bodies in food and pharma products',
    ],
  },
  {
    slug: 'automation',
    name: 'Automation & Industry 4.0',
    title: 'Automation & Industry 4.0 Solutions',
    intro:
      'Connect and automate your plant — SCADA, MES, IoT sensors and data analytics that give you real-time visibility of production and help with data-integrity requirements.',
    machines: ['SCADA Systems', 'MES (Manufacturing Execution)', 'IoT Sensors', 'Data Analytics', 'Robotic Arms', 'Automated Guidance Vehicles'],
    points: [
      'SCADA and HMI upgrades for existing machines',
      'Electronic batch records and production reporting',
      'Sensor and load-cell integration for weighing and monitoring',
      'Robotic handling and automated material movement',
    ],
  },
  {
    slug: 'turnkey',
    name: 'Turnkey Projects',
    title: 'Turnkey Pharma & Food Plant Projects',
    intro:
      'From site survey to handover — we help plan, source, install and commission complete production lines and plants, with training and after-sales support.',
    machines: ['Site Survey & Planning', 'Equipment Sourcing', 'Installation & Commissioning', 'Training & Handover', 'After-Sales Support', 'Plant Upgradation'],
    points: [
      'Layout planning and equipment selection for new plants and expansions',
      'One point of contact for sourcing multiple machines',
      'Installation, commissioning and operator training',
      'Upgrades and refurbishment of existing lines',
    ],
  },
  {
    slug: 'compliance',
    name: 'Compliance & Validation',
    title: 'GMP Compliance & Validation Support',
    intro:
      'Documentation and support to help your equipment meet GMP expectations — IQ/OQ/PQ protocols, SOPs, audit preparation and operator training.',
    machines: ['IQ/OQ/PQ Documentation', 'GMP Audits', 'FDA/EMA Compliance', 'Validation Protocols', 'Standard Operating Procedures', 'Training & Certification'],
    points: [
      'Installation, operational and performance qualification documents',
      'Help preparing for customer and regulatory audits',
      'Standard operating procedures for supplied equipment',
      'Operator and maintenance training',
    ],
  },
];

export const RESOURCES = [
  { slug: 'technical', name: 'Technical Library', title: 'Technical Library', description: 'Manuals, operating guides and technical documentation for the machines we supply.' },
  { slug: 'catalogs', name: 'Product Catalogs', title: 'Product Catalogs', description: 'Product catalogs with machine specifications and options.' },
  { slug: 'cad', name: 'CAD Drawings', title: 'CAD Drawings', description: '2D and 3D drawings to help plan your layout and installation.' },
  { slug: 'case-studies', name: 'Case Studies', title: 'Case Studies', description: 'How manufacturers use our machinery in their production lines.' },
  { slug: 'white-papers', name: 'White Papers', title: 'White Papers', description: 'Articles on pharma and food processing technology and compliance.' },
  { slug: 'sds', name: 'SDS Sheets', title: 'Safety Data Sheets', description: 'Safety data sheets for materials and products supplied with our machinery.' },
];
