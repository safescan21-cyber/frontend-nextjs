// Smaller, compressed copies of Cloudinary images for cards and thumbnails:
// f_auto picks WebP/AVIF, q_auto compresses, w_ resizes (never upscales).
// Also for video poster frames (/video/upload/…jpg) and images that already carry a
// transformation (e.g. "c_limit,so_10,w_1200"): compression is added and the width capped.
// Other URLs are returned as they are.
export const sizedImage = (url, width = 480) => {
  if (typeof url !== 'string' || !url.includes('res.cloudinary.com/')) return url;
  const kind = url.includes('/image/upload/') ? 'image' : url.includes('/video/upload/') ? 'video' : null;
  if (!kind) return url;
  const [base, rest] = url.split(`/${kind}/upload/`);
  // a video URL is only an image when it asks for a frame (.jpg/.png/.webp)
  if (kind === 'video' && !/\.(jpe?g|png|webp)(\?|$)/i.test(rest)) return url;
  const m = rest.match(/^([a-z]{1,3}_[^/]*)\/(.*)$/);
  if (!m) return `${base}/${kind}/upload/f_auto,q_auto,c_limit,w_${width}/${rest}`;
  // already transformed: keep it, add compression, never ask for more than `width`
  let t = m[1];
  if (!/(^|,)f_/.test(t)) t = `f_auto,${t}`;
  if (!/(^|,)q_/.test(t)) t = `q_auto,${t}`;
  t = /(^|,)w_\d+/.test(t) ? t.replace(/(^|,)w_(\d+)/, (s, c, w) => `${c}w_${Math.min(Number(w), width)}`) : `${t},c_limit,w_${width}`;
  return `${base}/${kind}/upload/${t}/${m[2]}`;
};

// srcset with a few widths, for images that fill a column on phones and computers
export const sizedSrcSet = (url, widths = [480, 800, 1200]) =>
  sizedImage(url, widths[0]) === url ? undefined : widths.map((w) => `${sizedImage(url, w)} ${w}w`).join(', ');
