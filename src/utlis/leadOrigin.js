// Where a visitor first came from (Google, WhatsApp, IndiaMART, an ad…), kept on the
// device for 90 days and sent with quote requests, so admin can see which channels
// bring enquiries. First visit wins; ad links (utm_…) replace it.
//   recordLeadOrigin()   on every page view (PageViewTracker)
//   getLeadOrigin()      when sending a quote form
const KEY = 'lead_origin_v1';
const DAYS = 90;

const SEARCH = { google: 'google', bing: 'bing', yahoo: 'yahoo', duckduckgo: 'other', yandex: 'other' };
const SOCIAL = { whatsapp: 'whatsapp', 'wa.me': 'whatsapp', facebook: 'facebook', 'fb.com': 'facebook', instagram: 'instagram', linkedin: 'linkedin', 'lnkd.in': 'linkedin', youtube: 'youtube', 't.co': 'other', twitter: 'other' };
const MARKETPLACES = { indiamart: 'indiamart', tradeindia: 'tradeindia' };

const channelOf = (source, medium) => {
  const s = String(source || '').toLowerCase();
  const m = String(medium || '').toLowerCase();
  if (/cpc|ppc|paid|ads?$/.test(m)) return 'ads';
  if (m === 'email' || s.includes('mail')) return 'email';
  for (const [k, v] of Object.entries({ ...MARKETPLACES, ...SOCIAL, ...SEARCH })) if (s.includes(k)) return v;
  return s ? 'referral' : 'direct';
};

const read = () => {
  try {
    const o = JSON.parse(localStorage.getItem(KEY) || 'null');
    return o && Date.now() - o.at < DAYS * 86400000 ? o : null;
  } catch {
    return null;
  }
};

export const recordLeadOrigin = () => {
  try {
    const url = new URL(window.location.href);
    const utm = (k) => url.searchParams.get(`utm_${k}`) || '';
    const tagged = utm('source');
    if (read() && !tagged) return; // keep the first visit unless this is a tagged campaign link
    let ref = '';
    try {
      const r = document.referrer ? new URL(document.referrer) : null;
      if (r && r.host !== url.host && !r.host.endsWith('foodpharmamachinery.com')) ref = r.host.replace(/^www\./, '');
    } catch { /* no referrer */ }
    const source = tagged || ref;
    const o = {
      channel: channelOf(source, utm('medium')),
      source: source.slice(0, 100),
      medium: utm('medium').slice(0, 100),
      campaign: utm('campaign').slice(0, 150),
      landing: (url.pathname + (url.search.length < 200 ? url.search : '')).slice(0, 300),
      at: Date.now(),
    };
    localStorage.setItem(KEY, JSON.stringify(o));
  } catch { /* storage blocked: nothing to record */ }
};

export const getLeadOrigin = () => {
  const o = read();
  if (!o) return undefined;
  const { at, ...rest } = o; // eslint-disable-line no-unused-vars
  return rest;
};
