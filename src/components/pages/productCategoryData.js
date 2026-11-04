// Machine categories shown at /products/:category (ProductCategoryPage.jsx); also read by
// the server for each category page's title, description and canonical (seo/pageSeo.js).
// The machines on each page are the real ones in the shop (categoryMachines below): `shop` lists
// the shop categories a page shows when it is more than its own (Add Product form categories).
/* ─── Product Data – one object per category ─────────────── */
export const PRODUCT_DATA = {
  "tablet-press": {
    title: "Tablet Press Machines",
    shop: ["tablet-press", "tooling"],
    description: "High‑speed rotary and single‑punch tablet presses for pharma production.",
  },
  "capsule-filling": {
    title: "Capsule Filling Machines",
    description: "Automatic capsule fillers for powders, pellets & liquids.",
  },
  "blister-packaging": {
    title: "Blister Packaging Machines",
    // Search title (Search Console: "blister packaging suppliers")
    seoTitle: "Blister Packaging Machine Suppliers",
    description: "Blister packaging machine suppliers: thermoforming and cold‑form blister lines for tablets and capsules.",
  },
  "liquid-filling": {
    title: "Liquid Filling & Capping",
    // Search title (Google Search Console query: "pharmaceutical filling machine")
    seoTitle: "Pharmaceutical Filling Machine for Liquids & Capping",
    description: "Pharmaceutical filling machines: volumetric and peristaltic liquid filling lines for syrups, suspensions, and solutions.",
  },
  "powder-filling": {
    title: "Powder Filling Machines",
    description: "Auger‑based and vacuum‑type powder fillers for sterile and non‑sterile applications.",
  },
  "cartoning": {
    title: "Cartoning Machines",
    description: "Horizontal and vertical cartoners for pharma, nutraceutical, and cosmetic packaging.",
  },
  "labeling": {
    title: "Labeling Machines",
    // Search title (Search Console: "food/pharma labeling")
    seoTitle: "Food & Pharma Labeling Machines",
    description: "Food and pharma labeling machines: wrap‑around, top‑label, and print‑and‑apply labeling systems.",
  },
  "coating": {
    title: "Coating Systems",
    // Search title (Search Console: "food machinery coating companies")
    seoTitle: "Coating Machines for Pharma & Food Companies",
    description: "Coating machines for pharma and food companies: film coating, sugar coating and fully perforated coating pans for tablets and confectionery.",
  },
  "granulation": {
    title: "Granulation & Mixing",
    shop: ["granulation", "mixing", "fluid-bed-dryer", "milling"],
    description: "High‑shear granulators, fluid‑bed dryers, and rapid mixer granulators.",
  },
  "inspection": {
    title: "Inspection & Checkweighing",
    shop: ["inspection", "metal-detector", "checkweigher"],
    description: "Vision inspection, metal detectors, and high‑precision checkweighers.",
  },
  "aseptic-filling": {
    title: "Aseptic Filling Lines",
    description: "Barrier‑isolator and RABS filling systems for injectables and biologics.",
  },
  "cleanroom": {
    title: "Cleanroom Equipment",
    shop: ["cleanroom", "sterile"],
    // Search titles (Search Console: "food processing cleanroom", "pharmaceutical cleanroom mixing machine")
    seoTitle: "Pharmaceutical & Food Processing Cleanroom Equipment",
    description: "Pharmaceutical and food processing cleanroom equipment: laminar flow units, pass boxes and environmental monitoring.",
  },
};

// The shop machines a category page shows (public ones only)
export const categoryMachines = (products = [], slug) => {
  const cats = PRODUCT_DATA[slug]?.shop || [slug];
  return (products || []).filter((p) => p?._id && p.name && p.active !== false && cats.includes(p.category));
};

// Only what the machine cards show (MachineCards.jsx), so pages send the browser little
export const cardFields = ({ _id, name, category, price, images }) => ({ _id, name, category, price, images: (images || []).slice(0, 1) });
