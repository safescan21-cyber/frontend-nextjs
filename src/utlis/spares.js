// Spare parts in the shop: products in the "spares" category or listing the machine models they
// fit (admin product form). The company is the Manufacturer field up to " – " ("SGWEIGH – Shanghai…").
export const isSpare = (p) => p?.category === 'spares' || (Array.isArray(p?.fitsModels) && p.fitsModels.length > 0);
export const spareCompany = (p) => String(p?.manufacturer || '').split(/\s[–—-]\s/)[0].trim() || 'Other';

// [{ name, count }], most parts first
export const spareCompanies = (products = []) => {
  const counts = {};
  for (const p of products) if (isSpare(p)) counts[spareCompany(p)] = (counts[spareCompany(p)] || 0) + 1;
  return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};
