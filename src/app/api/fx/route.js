// /api/fx — today's exchange rates from INR for the approximate local prices shown on
// the country versions (i18n/currency.js). Cached for a day; on failure the app keeps
// its built-in rates.
export const revalidate = 86400;

const WANTED = ['USD', 'GBP', 'EUR', 'JPY', 'KRW', 'AUD'];

export async function GET() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/INR', { next: { revalidate: 86400 } });
    const data = await res.json();
    if (data?.result !== 'success') throw new Error('rates unavailable');
    const rates = Object.fromEntries(WANTED.filter((k) => typeof data.rates?.[k] === 'number').map((k) => [k, data.rates[k]]));
    return Response.json({ base: 'INR', rates, updated: data.time_last_update_utc }, { headers: { 'Cache-Control': 'public, max-age=3600' } });
  } catch {
    return Response.json({ base: 'INR', rates: null }, { status: 503 });
  }
}
