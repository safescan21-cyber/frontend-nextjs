// Approximate local prices for the country versions. Checkout stays in INR; these are
// estimates only. Rates (1 INR in each currency) are refreshed daily by /api/fx from
// open.er-api.com; the numbers below are used until then (21 Oct 2026).
let RATES = { USD: 0.010527, GBP: 0.007887, EUR: 0.009389, JPY: 1.666793, KRW: 13.95986 };

export const setRates = (rates) => {
  if (!rates || typeof rates !== 'object') return;
  const next = { ...RATES };
  for (const k of Object.keys(next)) if (typeof rates[k] === 'number' && rates[k] > 0) next[k] = rates[k];
  RATES = next;
};

export const convertFromInr = (inr, currency) => (RATES[currency] ? inr * RATES[currency] : null);

// Rounded the way a buyer reads an estimate: no decimals, ¥/₩ to the nearest 100
export const formatMoney = (value, currency, lang) => {
  const rounded = ['JPY', 'KRW'].includes(currency) ? Math.round(value / 100) * 100 : Math.round(value);
  try {
    return new Intl.NumberFormat(lang, { style: 'currency', currency, maximumFractionDigits: 0 }).format(rounded);
  } catch {
    return `${currency} ${rounded}`;
  }
};
