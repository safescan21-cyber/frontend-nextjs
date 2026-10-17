// Shared bits for the Pharma API (active pharmaceutical ingredient) catalogue.
// API calls go to Backend/src/pharmaApi/pharmaApiRoutes.js.
import getBaseURL from '../../../utlis/baseURL';

export const API_CATEGORIES = [
  'Analgesic & Antipyretic', 'Anti-inflammatory (NSAID)', 'Antibiotic & Anti-infective', 'Antidiabetic',
  'Cardiovascular & Antihypertensive', 'Antiviral', 'Antifungal', 'Antihistamine & Anti-allergic',
  'Gastrointestinal & Antacid', 'CNS (Antidepressant, Antiepileptic)', 'Respiratory', 'Steroids & Hormones',
  'Anticancer (Oncology)', 'Vitamins & Nutraceuticals', 'Excipients', 'Others',
];
export const GRADES = ['IP', 'BP', 'USP', 'EP', 'JP', 'In-house'];
export const GRADE_NAMES = { IP: 'Indian Pharmacopoeia', BP: 'British Pharmacopoeia', USP: 'United States Pharmacopeia', EP: 'European Pharmacopoeia', JP: 'Japanese Pharmacopoeia', 'In-house': 'In-house specification' };

export const apiBase = () => `${getBaseURL()}/api/pharma-apis`;

export const authHeaders = () => {
  let token = null;
  try { token = localStorage.getItem('token'); } catch { /* storage blocked */ }
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, { credentials: 'include', ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...authHeaders(), ...options.headers } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.message || `Request failed (${res.status})`), { status: res.status });
  return data;
};

// Rows of the "chemical identity" table, in display order (only filled ones are shown)
export const IDENTITY_FIELDS = [
  ['chemicalName', 'Chemical name (IUPAC)'],
  ['casNumber', 'CAS number'],
  ['molecularFormula', 'Molecular formula'],
  ['molecularWeight', 'Molecular weight'],
  ['composition', 'Composition / assay'],
  ['form', 'Physical form'],
  ['appearance', 'Appearance'],
  ['solubility', 'Solubility'],
  ['storage', 'Storage'],
  ['shelfLife', 'Shelf life / retest'],
  ['packaging', 'Packaging'],
  ['moq', 'Minimum order'],
  ['price', 'Price'],
];

// "C8H9NO2" → C₈H₉NO₂ for display
const SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };
export const prettyFormula = (f) => String(f || '').replace(/([A-Za-z)\]])(\d+)/g, (_, a, n) => a + n.replace(/\d/g, (d) => SUB[d]));
