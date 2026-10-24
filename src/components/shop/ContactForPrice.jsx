'use client';
// Machines saved without a price: "Contact for price" with a WhatsApp button (and a quote
// link on the product page) instead of the price and the cart buttons.
//   <ContactForPrice product={p} />           product page box
//   <ContactForPrice product={p} compact />   shop card
import { MessageCircle } from 'lucide-react';
import { Link } from '../../shell/router';
import { whatsappLink } from '../../utlis/contact';
import { useLocale } from '../../i18n/LocaleContext';

export const hasPrice = (p) => Number(p?.price) > 0;

const priceMessage = (p) =>
  `Hello Food Pharma Machinery, please share the price of ${p.name}${p.modelNumber ? ` (model ${p.modelNumber})` : ''}. https://www.foodpharmamachinery.com/shop/${p._id}`;

export default function ContactForPrice({ product, compact = false }) {
  const { t } = useLocale();
  const wa = (
    <a
      href={whatsappLink(priceMessage(product))}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 font-semibold text-white hover:bg-green-700 ${compact ? 'w-full px-3 py-2 text-sm' : 'px-5 py-3 text-sm shadow'}`}
    >
      <MessageCircle className="h-4 w-4" aria-hidden="true" /> {t('Ask price on WhatsApp')}
    </a>
  );
  if (compact) {
    return (
      <div>
        <p className="mb-3 text-lg font-bold text-slate-800">{t('Contact for price')}</p>
        {wa}
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-4">
      <p className="text-2xl font-extrabold text-slate-900">{t('Contact for price')}</p>
      <p className="mt-1 text-sm text-slate-700">{t('The price depends on the configuration. Message us and we will send it quickly.')}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {wa}
        <Link
          to={`/bulk-quote?product=${encodeURIComponent(product.name)}&id=${product._id}&source=product`}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-orange-400 px-5 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-50"
        >
          {t('Request quotation →')}
        </Link>
      </div>
    </div>
  );
}
