'use client';
// Cards of real shop machines (photo, category, name, price), linking to their shop pages.
// Used by /pharma-machinery, /food-machinery and the /products pages.
import { Link } from '../../shell/router';

export const label = (slug) => String(slug || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
export const rs = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
// Cloudinary photo (or a video's first frame) at card size
const thumb = (url) => {
  if (typeof url !== 'string' || !url.includes('res.cloudinary.com')) return null;
  if (url.includes('/video/upload/')) return url.replace('/video/upload/', '/video/upload/so_1,w_480,h_360,c_pad,b_white/').replace(/\.\w+(\?.*)?$/, '.jpg');
  return url.replace('/image/upload/', '/image/upload/w_480,h_360,c_pad,b_white,f_auto,q_auto/');
};

export default function MachineCards({ machines, hover = 'hover:border-orange-400', price = 'text-orange-700' }) {
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {machines.map((p) => {
        const img = thumb(p.images?.[0]);
        return (
          <Link key={p._id} to={`/shop/${p._id}`} className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${hover}`}>
            {img ? <img src={img} alt={p.name} loading="lazy" width="480" height="360" className="aspect-[4/3] w-full bg-white object-contain" /> : <div className="aspect-[4/3] bg-slate-100" />}
            <span className="block p-3">
              <span className="block text-xs font-medium uppercase text-slate-500">{label(p.category)}</span>
              <span className="mt-0.5 block font-semibold text-slate-900">{p.name}</span>
              <span className={`mt-1 block font-bold ${price}`}>{Number(p.price) > 0 ? rs(p.price) : 'Price on request'}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
