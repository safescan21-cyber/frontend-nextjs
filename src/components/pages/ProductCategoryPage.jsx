'use client';
// /products (all categories) and /products/:category. The machines shown are the real ones in
// the shop (the page's server part passes them: app/[locale]/products/…), never sample models.
import { useLocale } from '../../i18n/LocaleContext';
import { useParams, Link } from '../../shell/router';
import Seo from "../Seo";
import { seoPages } from "./seoPages";
import NotFound from "../seo/NotFound";
import { PRODUCT_DATA, categoryMachines } from "./productCategoryData";
import MachineCards from "./MachineCards";
import QuickQuote from "../quote/QuickQuote";

const SITE = "https://www.foodpharmamachinery.com";

/* ─── Helper: WhatsApp link generator ───────────────────── */
const getWhatsAppLink = (productName) => {
  const phone = "918700792607"; // +91 87007 92607
  const message = encodeURIComponent(`Hi Food Pharma Machinery, I'm interested in ${productName}. Please send more details.`);
  return `https://wa.me/${phone}?text=${message}`;
};

const machinesText = (n) => `${n} ${n === 1 ? "machine" : "machines"}`;

/* ─── Page Component ─── */
export default function ProductCategoryPage({ products = [] }) {
  const { t } = useLocale();
  const { category } = useParams();
  const data = PRODUCT_DATA[category];

  // /products — the machines in the shop, then every category
  if (!category) {
    return (
      <div className="min-h-screen bg-[#0d1017] pb-24">
        <Seo
          {...seoPages.products}
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: Object.entries(PRODUCT_DATA).map(([slug, c], i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: c.title,
              url: `${SITE}/products/${slug}`,
            })),
          }}
        />
        <section className="bg-gradient-to-r from-orange-600 to-amber-700 px-5 sm:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-barlowC font-bold text-4xl sm:text-5xl tracking-tight text-white">{t("Pharma & food machinery products")}</h1>
            <p className="mt-3 text-lg text-white/80 max-w-2xl">{seoPages.products.description}</p>
          </div>
        </section>

        {products.length > 0 && (
          <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-12" aria-labelledby="available">
            <h2 id="available" className="font-barlowC font-bold text-3xl text-white">{t("Machines available now")} ({products.length})</h2>
            <p className="mt-1 text-sm text-slate-400">{t("Ex-works prices; taxes, freight and installation are quoted separately.")}</p>
            <MachineCards machines={products} />
            <Link to="/shop" className="mt-4 inline-block text-sm font-semibold text-orange-400 hover:underline">{t("All machines in the shop")} &rarr;</Link>
          </section>
        )}

        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-12" aria-labelledby="categories">
          <h2 id="categories" className="font-barlowC font-bold text-3xl text-white">{t("Machine categories")}</h2>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(PRODUCT_DATA).map(([slug, c]) => {
              const n = categoryMachines(products, slug).length;
              return (
                <li key={slug}>
                  <Link
                    to={`/products/${slug}`}
                    className="flex h-full flex-col rounded-lg border border-slate-800 bg-slate-900 p-5 transition-all hover:border-orange-500/60 hover:-translate-y-0.5"
                  >
                    <h3 className="font-barlowC font-bold text-xl text-white">{t(c.title)}</h3>
                    <p className="mt-2 flex-1 text-sm text-slate-400">{t(c.description)}</p>
                    <span className="mt-4 text-sm font-semibold text-orange-400">
                      {n ? `${machinesText(n)} listed` : t("Made to order – ask for a quote")} &rarr;
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    );
  }

  if (!data) return <NotFound />;

  return (
    <div className="min-h-screen bg-[#0d1017] text-slate-300 font-barlow">
      <Seo
        title={t(data.seoTitle || data.title)}
        description={`${t(data.description)} Get specifications and a quote.`}
        path={`/products/${category}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: data.title,
          itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: `${SITE}/shop/${p._id}` })),
        }}
      />
      <section className="bg-gradient-to-r from-orange-600 to-amber-700 px-5 sm:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <Link
            to="/products"
            className="text-white/80 hover:text-white text-sm mb-4 inline-block transition"
          >
            &larr; All products
          </Link>
          <h1 className="font-barlowC font-bold text-4xl sm:text-5xl tracking-tight text-white">
            {t(data.title)}
          </h1>
          <p className="mt-3 text-lg text-white/80 max-w-2xl">
            {t(data.description)}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
        {products.length > 0 ? (
          <>
            <h2 className="font-barlowC font-bold text-2xl text-white">{machinesText(products.length)} {t("available")}</h2>
            <p className="mt-1 text-sm text-slate-400">{t("Ex-works prices; taxes, freight and installation are quoted separately.")}</p>
            <MachineCards machines={products} />
          </>
        ) : (
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <h2 className="font-barlowC font-bold text-2xl text-white">{t("Made to order")}</h2>
            <p className="mt-2 max-w-2xl text-slate-400">
              {t("No models of this type are listed online right now. Tell us your product, output and budget and we will send suitable options with a quotation.")}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={getWhatsAppLink(data.title.toLowerCase())}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded bg-green-600 px-4 py-2 font-barlowC text-xs font-bold uppercase tracking-widest text-white transition hover:bg-green-500"
              >
                {t("Request Info via WhatsApp")}
              </a>
              <Link to="/shop" className="inline-flex items-center rounded border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-orange-500">
                {t("See machines in the shop")}
              </Link>
            </div>
          </div>
        )}
        <div className="mx-auto mt-10 max-w-2xl">
          <QuickQuote id="quick-quote" machines={products.length ? products.map((p) => p.name) : [data.title]} />
        </div>
      </section>
    </div>
  );
}
