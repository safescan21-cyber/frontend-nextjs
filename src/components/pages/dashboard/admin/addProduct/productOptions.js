// Choices shared by the Add Product and Update Product forms

// Machine categories (the values are the category part of shop links: /shop?category=…)
export const CATEGORIES = [
  { label: 'Tablet Press Machines', value: 'tablet-press' },
  { label: 'Capsule Filling Machines', value: 'capsule-filling' },
  { label: 'Blister Packaging Machines', value: 'blister-packaging' },
  { label: 'Strip Packaging Machines', value: 'strip-packaging' },
  { label: 'Powder Filling Machines', value: 'powder-filling' },
  { label: 'Liquid Filling Machines', value: 'liquid-filling' },
  { label: 'Granulation Equipment', value: 'granulation' },
  { label: 'Coating Systems', value: 'coating' },
  { label: 'Fluid Bed Dryers', value: 'fluid-bed-dryer' },
  { label: 'Milling & Sizing', value: 'milling' },
  { label: 'Mixing & Blending', value: 'mixing' },
  { label: 'Compression Tooling', value: 'tooling' },
  { label: 'Inspection & Detection', value: 'inspection' },
  { label: 'Lab Equipment', value: 'lab-equipment' },
  { label: 'Sterile Processing', value: 'sterile' },
  { label: 'HVAC & Utilities', value: 'hvac' },
  { label: 'Material Handling', value: 'material-handling' },
  { label: 'Packaging Accessories', value: 'packaging-accessories' },
  { label: 'Process Control Software', value: 'process-control' },
  { label: 'Turnkey Projects', value: 'turnkey' },
];

export const COLORS = [
  { label: 'Red', value: 'red' },
  { label: 'Blue', value: 'blue' },
  { label: 'Green', value: 'green' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Black', value: 'black' },
  { label: 'White', value: 'white' },
  { label: 'Silver', value: 'silver' },
  { label: 'Custom', value: 'custom' },
];

// A list plus the product's current value when it isn't in it (a category an admin added
// earlier, an old colour), so the form shows what is saved instead of something else
export const withCurrent = (list, value) => (!value || list.some((o) => o.value === value)
  ? list
  : [...list, { label: String(value).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), value }]);

export const ORIGINS = [
  { label: 'India', value: 'india' },
  { label: 'Germany', value: 'germany' },
  { label: 'China', value: 'china' },
  { label: 'Italy', value: 'italy' },
  { label: 'USA', value: 'usa' },
  { label: 'Japan', value: 'japan' },
  { label: 'Switzerland', value: 'switzerland' },
  { label: 'United Kingdom', value: 'united-kingdom' },
  { label: 'South Korea', value: 'south-korea' },
  { label: 'Taiwan', value: 'taiwan' },
];
