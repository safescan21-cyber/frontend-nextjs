import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Share2, Mail, Link2, Check, X, MoreHorizontal } from 'lucide-react';
import { FaWhatsapp, FaFacebookF, FaLinkedinIn, FaTelegramPlane, FaPinterestP } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { track } from '../../utlis/track';

const SITE = 'https://www.foodpharmamachinery.com';

// /p/:id is served by the API with the product's name, photo and price as
// Open Graph tags, so WhatsApp / Facebook / LinkedIn show a rich preview card,
// then it forwards visitors straight to /shop/:id.
// eslint-disable-next-line react-refresh/only-export-components
export const productShareUrl = (id) => `${SITE}/p/${id}`;

const priceText = (price) =>
  Number(price) > 0 ? `₹${Number(price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '';

const buildNetworks = ({ url, title, text, image }) => {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  return [
    { key: 'whatsapp', label: 'WhatsApp', Icon: FaWhatsapp, bg: 'bg-[#25D366]', href: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}` },
    { key: 'facebook', label: 'Facebook', Icon: FaFacebookF, bg: 'bg-[#1877F2]', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { key: 'x', label: 'X', Icon: FaXTwitter, bg: 'bg-black', href: `https://twitter.com/intent/tweet?text=${t}&url=${u}` },
    { key: 'linkedin', label: 'LinkedIn', Icon: FaLinkedinIn, bg: 'bg-[#0A66C2]', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { key: 'telegram', label: 'Telegram', Icon: FaTelegramPlane, bg: 'bg-[#229ED9]', href: `https://t.me/share/url?url=${u}&text=${t}` },
    {
      key: 'pinterest', label: 'Pinterest', Icon: FaPinterestP, bg: 'bg-[#E60023]',
      href: `https://pinterest.com/pin/create/button/?url=${u}&description=${t}${image ? `&media=${encodeURIComponent(image)}` : ''}`,
    },
    {
      key: 'email', label: 'Email', Icon: Mail, bg: 'bg-slate-600',
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
    },
  ];
};

/**
 * Share button for a product: opens a sheet with WhatsApp, Facebook, X, LinkedIn,
 * Telegram, Pinterest, Email, copy link and (on phones) the system share menu.
 *   <ShareProduct product={product} />                 – round icon (product cards)
 *   <ShareProduct product={product} variant="button" /> – labelled button (product page)
 */
const ShareProduct = ({ product, variant = 'icon', className = '' }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!product?._id) return null;

  const url = productShareUrl(product._id);
  const title = product.name || 'Food Pharma Machinery';
  const price = priceText(product.price);
  const text = `Check out ${title}${price ? ` – ${price}` : ''} on Food Pharma Machinery`;
  const image = (Array.isArray(product.images) && product.images[0]) || product.image || '';
  const networks = buildNetworks({ url, title, text, image });
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const logShare = () => track('product_share', { productId: String(product._id), productName: title });

  const openSheet = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCopied(false);
    setOpen(true);
  };

  // Older browsers and in-app browsers (Instagram, Facebook…) often block the
  // Clipboard API, so fall back to a hidden textarea + execCommand.
  const legacyCopy = () => {
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  };

  const copyLink = async (e) => {
    const input = e.currentTarget.parentElement?.querySelector('input'); // read before await
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      ok = legacyCopy();
    }
    if (ok) {
      setCopied(true);
      toast.success('Link copied');
      logShare();
      setTimeout(() => setCopied(false), 2500);
    } else {
      input?.select();
      toast('Link selected – press Ctrl+C (or long-press) to copy');
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title, text, url });
      logShare();
      setOpen(false);
    } catch { /* user closed the share menu */ }
  };

  const trigger =
    variant === 'button' ? (
      <button
        type="button"
        onClick={openSheet}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-500 hover:text-blue-600 ${className}`}
        aria-label={`Share ${title}`}
      >
        <Share2 className="h-4 w-4" /> Share
      </button>
    ) : (
      <button
        type="button"
        onClick={openSheet}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md backdrop-blur transition hover:scale-110 hover:text-blue-600 ${className}`}
        aria-label={`Share ${title}`}
        title="Share"
      >
        <Share2 className="h-4 w-4" />
      </button>
    );

  const sheet = open && createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={() => setOpen(false)}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share this product"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Share this product</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
          {image && (
            <img src={image} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" loading="lazy" />
          )}
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-semibold text-slate-800">{title}</p>
            {price && <p className="text-sm font-bold text-blue-600">{price}</p>}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-x-2 gap-y-4">
          {networks.map(({ key, label, Icon, bg, href }) => (
            <a
              key={key}
              href={href}
              target={key === 'email' ? '_self' : '_blank'}
              rel="noopener noreferrer"
              onClick={logShare}
              className="group flex flex-col items-center gap-1.5 text-xs font-medium text-slate-600"
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-sm transition group-hover:scale-110 ${bg}`}>
                <Icon className="h-5 w-5" />
              </span>
              {label}
            </a>
          ))}
          {canNativeShare && (
            <button
              type="button"
              onClick={nativeShare}
              className="group flex flex-col items-center gap-1.5 text-xs font-medium text-slate-600"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-700 transition group-hover:scale-110">
                <MoreHorizontal className="h-5 w-5" />
              </span>
              More
            </button>
          )}
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-xl border border-slate-200 p-1.5 pl-3">
          <Link2 className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            readOnly
            value={url}
            onFocus={(e) => e.target.select()}
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-600 outline-none"
            aria-label="Product link"
          />
          <button
            type="button"
            onClick={copyLink}
            className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-white transition ${copied ? 'bg-emerald-500' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {copied ? <><Check className="h-4 w-4" /> Copied</> : 'Copy'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      {trigger}
      {sheet}
    </>
  );
};

export default ShareProduct;
