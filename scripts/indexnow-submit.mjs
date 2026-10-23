// Tells IndexNow search engines (Bing — which also feeds Yahoo —, Yandex, Seznam, Naver…)
// to re-read every page in the sitemaps. Run after big changes to many pages:
//   node scripts/indexnow-submit.mjs            submit
//   node scripts/indexnow-submit.mjs --dry-run  only list what would be sent
// Single products, articles and pharma APIs are already sent by the backend when they
// change (Backend/src/utils/indexnow.js, same key).
const SITE = process.env.SITE_URL || 'https://www.foodpharmamachinery.com';
const KEY = process.env.INDEXNOW_KEY || '4abb4644a05433712c6848f5a3d6c3a7'; // public by design: public/<key>.txt
const dryRun = process.argv.includes('--dry-run');

const text = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.text();
};

// The search engines check this file before trusting the list
const served = (await text(`${SITE}/${KEY}.txt`)).trim();
if (served !== KEY) throw new Error(`${SITE}/${KEY}.txt does not contain the key`);

const urls = new Set();
for (const map of ['/sitemap.xml', '/sitemap-content.xml']) {
  const xml = await text(`${SITE}${map}`).catch(() => '');
  for (const [, loc] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.add(loc.trim());
}
const urlList = [...urls].filter((u) => u.startsWith('https://www.foodpharmamachinery.com'));
console.log(`${urlList.length} pages from the sitemaps`);

if (dryRun) {
  console.log(urlList.slice(0, 10).join('\n'), urlList.length > 10 ? `\n… and ${urlList.length - 10} more` : '');
} else {
  // One request takes up to 10,000 addresses
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: 'www.foodpharmamachinery.com', key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
  });
  // 200 or 202 = accepted; 422 = an address doesn't match the host; 429 = too many requests
  console.log(`IndexNow answered ${res.status} ${res.statusText}`, (await res.text()).slice(0, 300));
}
