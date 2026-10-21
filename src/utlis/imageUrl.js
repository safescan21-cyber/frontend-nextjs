// Smaller, compressed copies of Cloudinary images for cards and thumbnails:
// f_auto picks WebP/AVIF, q_auto compresses, w_ resizes (never upscales).
// Other URLs, and Cloudinary URLs that already carry a transformation, are returned as they are.
export const sizedImage = (url, width = 480) => {
  if (typeof url !== 'string' || !url.includes('res.cloudinary.com/') || !url.includes('/image/upload/')) return url;
  const [base, rest] = url.split('/image/upload/');
  if (/^[a-z]{1,3}_[^/]*\//.test(rest)) return url; // already transformed
  return `${base}/image/upload/f_auto,q_auto,c_limit,w_${width}/${rest}`;
};
