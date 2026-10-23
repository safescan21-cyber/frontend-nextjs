// Questions buyers ask about this machine, written in admin (Google also gets them as
// FAQ structured data, see seo/pageSeo.js)
import { ChevronDown } from 'lucide-react';

export default function ProductFaqs({ faqs = [], title = 'Frequently asked questions' }) {
  const list = faqs.filter((f) => f?.q && f?.a);
  if (!list.length) return null;
  return (
    <section className="container mx-auto px-4 pb-12" aria-labelledby="product-faq">
      <h2 id="product-faq" className="mb-4 text-xl font-bold text-gray-800 md:text-2xl">{title}</h2>
      <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
        {list.map((f, i) => (
          <details key={i} className="group p-4 [&_summary::-webkit-details-marker]:hidden" {...(i === 0 && { open: true })}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-gray-900">
              {f.q}
              <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
