// Lets plain Node load the site's modules for unit tests: Next.js allows imports without
// ".js" ("../seo/pageSeo"), Node doesn't. Used by: npm test (node --import ./test/register.mjs)
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (err) {
    if (!/^\.{1,2}\//.test(specifier) || /\.[cm]?jsx?$/.test(specifier)) throw err;
    for (const ext of ['.js', '/index.js']) {
      try { return await next(specifier + ext, context); } catch { /* try the next one */ }
    }
    throw err;
  }
}
