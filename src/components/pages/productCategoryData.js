// Machine categories shown at /products/:category (ProductCategoryPage.jsx); also read by
// the server for each category page's title, description and canonical (seo/pageSeo.js).
/* ─── Product Data – one object per category ─────────────── */
export const PRODUCT_DATA = {
  "tablet-press": {
    title: "Tablet Press Machines",
    description: "High‑speed rotary and single‑punch tablet presses for pharma production.",
    products: [
      {
        name: "ZP-35D Rotary Press",
        images: [
          "https://placehold.co/400x300?text=ZP-35D+Angle+1",
          "https://placehold.co/400x300?text=ZP-35D+Angle+2",
        ],
        video: "", // add a real demo video URL here
        spec: "35 stations, 150k tabs/h",
      },
      {
        name: "ZP-41A High‑Speed",
        images: [
          "https://placehold.co/400x300?text=ZP-41A+Front",
          "https://placehold.co/400x300?text=ZP-41A+Side",
        ],
        video: "", // add a real demo video URL here
        spec: "41 stations, 250k tabs/h",
      },
      {
        name: "THP-10 Single Punch",
        images: [
          "https://placehold.co/400x300?text=THP-10",
          "https://placehold.co/400x300?text=THP-10+Detail",
        ],
        video: "", // add a real demo video URL here
        spec: "R&D / small batch",
      },
      {
        name: "ZPW-23 Multi‑Layer",
        images: [
          "https://placehold.co/400x300?text=ZPW-23+1",
          "https://placehold.co/400x300?text=ZPW-23+2",
        ],
        video: "", // add a real demo video URL here
        spec: "Bilayer capable",
      },
      {
        name: "CPHI-55 GMP Press",
        images: [
          "https://placehold.co/400x300?text=CPHI-55+1",
          "https://placehold.co/400x300?text=CPHI-55+2",
        ],
        video: "", // add a real demo video URL here
        spec: "Full containment",
      },
      {
        name: "MiniPress-II",
        images: [
          "https://placehold.co/400x300?text=MiniPress-II+1",
          "https://placehold.co/400x300?text=MiniPress-II+2",
        ],
        video: "", // add a real demo video URL here
        spec: "Lab scale",
      },
    ],
  },
  // --------------------------------- other categories (shortened for brevity)
  "capsule-filling": {
    title: "Capsule Filling Machines",
    description: "Automatic capsule fillers for powders, pellets & liquids.",
    products: [
      { name: "NJP-1200C", images: ["https://placehold.co/400x300?text=NJP-1200C"], video: "", spec: "120k caps/h" },
      { name: "CFM-6000", images: ["https://placehold.co/400x300?text=CFM-6000"], video: "", spec: "Liquid fill capable" },
    ],
  },
  "blister-packaging": {
    title: "Blister Packaging Machines",
    description: "Thermoforming and cold‑form blister lines for tablets and capsules.",
    products: [
      { name: "BLM-350 Rotary", images: ["https://placehold.co/400x300?text=BLM-350"], video: "", spec: "350 blisters/min" },
    ],
  },
  "liquid-filling": {
    title: "Liquid Filling & Capping",
    description: "Volumetric and peristaltic filling lines for syrups, suspensions, and solutions.",
    products: [
      { name: "LF-4A Monoblock", images: ["https://placehold.co/400x300?text=LF-4A"], video: "", spec: "4 heads, up to 60 bpm" },
    ],
  },
  "powder-filling": {
    title: "Powder Filling Machines",
    description: "Auger‑based and vacuum‑type powder fillers for sterile and non‑sterile applications.",
    products: [
      { name: "AFS-2 Auger Filler", images: ["https://placehold.co/400x300?text=AFS-2"], video: "", spec: "Dual auger, 40 fills/min" },
    ],
  },
  "cartoning": {
    title: "Cartoning Machines",
    description: "Horizontal and vertical cartoners for pharma, nutraceutical, and cosmetic packaging.",
    products: [
      { name: "HC-200 Horizontal", images: ["https://placehold.co/400x300?text=HC-200"], video: "", spec: "200 cartons/min" },
    ],
  },
  "labeling": {
    title: "Labeling Machines",
    description: "Wrap‑around, top‑label, and print‑and‑apply labeling systems.",
    products: [
      { name: "LabelJet 360", images: ["https://placehold.co/400x300?text=LabelJet+360"], video: "", spec: "350 bpm, servo drive" },
    ],
  },
  "coating": {
    title: "Coating Systems",
    description: "Film coating, sugar coating, and fully perforated pan systems.",
    products: [
      { name: "CoataPan 600", images: ["https://placehold.co/400x300?text=CoataPan+600"], video: "", spec: "600 kg batch" },
    ],
  },
  "granulation": {
    title: "Granulation & Mixing",
    description: "High‑shear granulators, fluid‑bed dryers, and rapid mixer granulators.",
    products: [
      { name: "RMG-150 Mixer", images: ["https://placehold.co/400x300?text=RMG-150"], video: "", spec: "150 L bowl" },
    ],
  },
  "inspection": {
    title: "Inspection & Checkweighing",
    description: "Vision inspection, metal detectors, and high‑precision checkweighers.",
    products: [
      { name: "VisioCheck 360", images: ["https://placehold.co/400x300?text=VisioCheck+360"], video: "", spec: "Multi‑camera" },
    ],
  },
  "aseptic-filling": {
    title: "Aseptic Filling Lines",
    description: "Barrier‑isolator and RABS filling systems for injectables and biologics.",
    products: [
      { name: "AseptiFill 1000", images: ["https://placehold.co/400x300?text=AseptiFill+1000"], video: "", spec: "Vial + syringe" },
    ],
  },
  "cleanroom": {
    title: "Cleanroom Equipment",
    description: "Laminar flow units, pass‑boxes, and environmental monitoring solutions.",
    products: [
      { name: "LaminarFlow 2400", images: ["https://placehold.co/400x300?text=LaminarFlow+2400"], video: "", spec: "ISO 5 (Class 100)" },
    ],
  },
};
