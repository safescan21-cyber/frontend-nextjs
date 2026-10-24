// Spec sheets as PDF, made in the browser (jsPDF): one machine, or a comparison of up
// to 3. Buyers forward these to their managers.
//   downloadSpecSheet(product, useLocale())   downloadComparison([p1, p2, p3], useLocale())
// Labels follow the page's language (i18n/messages.js); the machine's own details are
// what the admin wrote (English). The PDF fonts only draw Latin text, so anything else
// (Japanese, Korean, Urdu, ₹, €…) is drawn by the browser on a canvas and added as an
// image. Prices are ex-works INR ("Rs."), plus the visitor's currency where there is one.

import { gaEvent } from './analytics';
import { PRODUCT_DATA } from '../components/pages/productCategoryData';

const SITE = 'https://www.foodpharmamachinery.com';
const COMPANY = 'Food Pharma Machinery (PureLine Machinery Pvt. Ltd.), Q-37 Shivalik Nagar, Haridwar, Uttarakhand, India';
const PHONE = '+91 87007 92607';
const ENGLISH = { t: (s, vars) => (vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : s), info: { language: 'en', lang: 'en-IN' }, formatLocal: () => null };

const plain = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const rs = (n) => `Rs. ${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const label = (slug) => String(slug || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
// Numbers, phone and web addresses inside Urdu text stay left to right (Unicode isolates)
const ltr = (rtl, s) => (rtl ? `\u2066${s}\u2069` : String(s));
const fileName = (s) => String(s || 'machine').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 60);

// Every fact we have for a machine, as [label, value] rows, in the page's language
export const machineFacts = (p, { t, formatLocal } = ENGLISH) => {
  const local = Number(p.price) > 0 ? formatLocal?.(Number(p.price)) : null;
  return [
    [t('Category'), t(PRODUCT_DATA[p.category]?.title || label(p.category))],
    ...(p.modelNumber ? [[t('Model number'), p.modelNumber]] : []),
    ...(p.manufacturer ? [[t('Manufacturer'), p.manufacturer]] : []),
    [t('Price (ex-works, INR)'), Number(p.price) > 0 ? rs(p.price) : t('Contact for price')],
    ...(local ? [[t('Approx. price'), `≈ ${local}`]] : []),
    ...(Array.isArray(p.specifications) ? p.specifications : []).filter((s) => s?.key && s?.value).map((s) => [s.key, String(s.value)]),
    ...(Number(p.warranty) > 0 ? [[t('Warranty'), t('{n} months', { n: p.warranty })]] : []),
    ...(p.origin ? [[t('Origin'), t(label(p.origin))]] : []),
    [t('Availability'), Number(p.stock) > 0 ? t('In stock') : t('Made to order')],
  ];
};

// ── Text the PDF fonts can't draw, drawn by the browser ────────────────────────
const PLAIN = /^[\u0000-ÿ–—‘’]*$/; // Latin-1 plus dashes and quotes
const needsImage = (s) => !PLAIN.test(String(s ?? ''));
const FONT = '"Segoe UI", "Noto Sans", "Noto Sans JP", "Noto Sans KR", "Noto Naskh Arabic", "Yu Gothic", "Malgun Gothic", Arial, sans-serif';
const PX_PER_PT = 3; // canvas resolution: about 216 dpi, sharp when printed
const MM_PER_PT = 0.3528;

// { url, w, h } in mm; wraps at maxWidth (mm), by words, or by characters for Japanese
const textImage = (text, { size = 10, bold = false, color = [20, 20, 20], maxWidth = 180, rtl = false } = {}) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const px = size * PX_PER_PT;
  const font = `${bold ? '700 ' : ''}${px}px ${FONT}`;
  ctx.font = font;
  const maxPx = (maxWidth / MM_PER_PT) * PX_PER_PT;
  const lines = [];
  for (const para of String(text).split('\n')) {
    let line = '';
    for (const token of para.split(/(\s+)/)) {
      for (const piece of ctx.measureText(token).width > maxPx ? [...token] : [token]) {
        if (line.trim() && ctx.measureText(line + piece).width > maxPx) {
          lines.push(line.trimEnd());
          line = piece.trimStart();
        } else {
          line += piece;
        }
      }
    }
    lines.push(line);
  }
  const lineH = px * 1.3;
  canvas.width = Math.ceil(Math.min(maxPx, Math.max(1, ...lines.map((l) => ctx.measureText(l).width))) + 2);
  canvas.height = Math.ceil(lineH * lines.length);
  ctx.font = font; // resizing the canvas resets it
  ctx.fillStyle = `rgb(${color.join(',')})`;
  ctx.textBaseline = 'middle';
  ctx.direction = rtl ? 'rtl' : 'ltr';
  ctx.textAlign = rtl ? 'right' : 'left';
  lines.forEach((l, i) => ctx.fillText(l, rtl ? canvas.width - 1 : 1, lineH * (i + 0.5)));
  const toMm = (v) => (v / PX_PER_PT) * MM_PER_PT;
  return { url: canvas.toDataURL('image/png'), w: toMm(canvas.width), h: toMm(canvas.height) };
};

// Writes text with its top at y; x is the right edge when align is 'right'. Returns the height (mm).
const put = (doc, text, x, y, { size = 10, bold = false, color = [20, 20, 20], maxWidth = 180, align = 'left', rtl = false } = {}) => {
  if (!needsImage(text)) {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(String(text), maxWidth);
    doc.text(lines, x, y, { baseline: 'top', align });
    return lines.length * size * MM_PER_PT * doc.getLineHeightFactor();
  }
  const img = textImage(text, { size, bold, color, maxWidth, rtl });
  doc.addImage(img.url, 'PNG', align === 'right' ? x - img.w : x, y, img.w, img.h, undefined, 'FAST');
  return img.h;
};

// autoTable hooks: cells with such text are left blank and the image is drawn in them.
// `widths` = the table's column widths (mm), known up front so the text can wrap.
const tableHooks = (widths, rtl) => {
  const pad = 2.5;
  const imgs = new Map();
  return {
    didParseCell: (data) => {
      const text = (data.cell.text || []).join(' ');
      if (!needsImage(text)) return;
      const head = data.section === 'head';
      const img = textImage(text, { size: data.cell.styles.fontSize, bold: head || data.cell.styles.fontStyle === 'bold', color: head ? [255, 255, 255] : [40, 40, 40], maxWidth: widths[data.column.index] - 2 * pad, rtl });
      imgs.set(data.cell, img);
      data.cell.text = [''];
      data.cell.styles.minCellHeight = Math.max(data.cell.styles.minCellHeight || 0, img.h + 2 * pad);
    },
    didDrawCell: (data) => {
      const img = imgs.get(data.cell);
      if (!img) return;
      const x = rtl ? data.cell.x + data.cell.width - pad - img.w : data.cell.x + pad;
      data.doc.addImage(img.url, 'PNG', x, data.cell.y + pad, img.w, img.h, undefined, 'FAST');
    },
  };
};

// First photo as a JPEG data URL (Cloudinary resizes it); null when it can't load
const photo = async (url) => {
  if (typeof url !== 'string' || !url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) return null;
  try {
    const res = await fetch(url.replace('/image/upload/', '/image/upload/w_700,h_500,c_pad,b_white,f_jpg,q_80/'));
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => resolve(null);
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

const load = async () => {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  return { jsPDF, autoTable };
};

const header = (doc, title, rtl) => {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, w, 22, 'F');
  put(doc, 'Food Pharma Machinery', 14, 9.2, { size: 13, bold: true, color: [255, 255, 255] });
  put(doc, title, w - 14, 9.8, { size: 9, color: [255, 255, 255], align: 'right', maxWidth: 90, rtl });
};

const footer = (doc, { t, info }, rtl) => {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(220);
    doc.line(14, h - 18, w - 14, h - 18);
    put(doc, COMPANY, 14, h - 15, { size: 8, color: [90, 90, 90] });
    put(doc, `${t('Phone / WhatsApp')}: ${ltr(rtl, PHONE)}   |   ${ltr(rtl, 'www.foodpharmamachinery.com')}`, 14, h - 10, { size: 8, color: [90, 90, 90], maxWidth: 130, rtl });
    put(doc, `${ltr(rtl, new Date().toLocaleDateString(info.lang || 'en-IN'))}  ·  ${t('page {i}/{n}', { i: ltr(rtl, i), n: ltr(rtl, pages) })}`, w - 14, h - 10, { size: 8, color: [90, 90, 90], align: 'right', maxWidth: 50, rtl });
  }
};

// Closing lines: link(s), price note, and for other languages a note that details are English
const closing = (doc, lines, y, { t, info }, rtl, width) => {
  let at = y;
  for (const line of lines) at += put(doc, line, 14, at, { size: 10, maxWidth: width, rtl }) + 1.5;
  at += put(doc, t('Prices are indicative; installation, freight and taxes are quoted separately.'), 14, at, { size: 10, maxWidth: width, rtl }) + 1.5;
  if (info.language && info.language !== 'en') put(doc, t('Machine details are in English.'), 14, at, { size: 9, color: [100, 100, 100], maxWidth: width, rtl });
};

export async function downloadSpecSheet(product, loc = ENGLISH) {
  const { t } = loc;
  const rtl = loc.info?.dir === 'rtl';
  const { jsPDF, autoTable } = await load();
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  header(doc, t('Machine specification sheet'), rtl);

  let y = 28;
  y += put(doc, product.name || 'Machine', 14, y, { size: 18, bold: true, maxWidth: w - 28 }) + 3;

  const img = await photo(product.images?.[0]);
  if (img) {
    doc.addImage(img, 'JPEG', 14, y, 84, 60);
    const desc = plain(product.description).slice(0, 700);
    if (desc) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(20, 20, 20);
      if (needsImage(desc)) put(doc, desc, 104, y + 1, { size: 10, maxWidth: w - 118 });
      else doc.text(doc.splitTextToSize(desc, w - 118).slice(0, 22), 104, y + 1, { baseline: 'top' });
    }
    y += 66;
  } else {
    const desc = plain(product.description).slice(0, 900);
    if (desc) y += put(doc, desc, 14, y, { size: 10, maxWidth: w - 28 }) + 6;
  }

  const widths = [60, w - 28 - 60];
  autoTable(doc, {
    startY: y,
    head: [[t('Specification'), t('Value')]],
    body: machineFacts(product, loc),
    styles: { fontSize: 10, cellPadding: 2.5 },
    headStyles: { fillColor: [234, 88, 12] },
    columnStyles: { 0: { cellWidth: widths[0], fontStyle: 'bold' } },
    margin: { left: 14, right: 14, bottom: 24 },
    ...tableHooks(widths, rtl),
  });

  closing(doc, [`${t('Full details and quotation:')} ${ltr(rtl, `${SITE}/shop/${product._id}`)}`], doc.lastAutoTable.finalY + 8, loc, rtl, w - 28);
  footer(doc, loc, rtl);
  doc.save(`${fileName(product.name)}-spec-sheet.pdf`);
  gaEvent('file_download', { file_name: 'spec-sheet', machine: String(product.name || '').slice(0, 100) });
}

export async function downloadComparison(products, loc = ENGLISH) {
  const { t } = loc;
  const rtl = loc.info?.dir === 'rtl';
  const { jsPDF, autoTable } = await load();
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: products.length > 2 ? 'landscape' : 'portrait' });
  const w = doc.internal.pageSize.getWidth();
  header(doc, t('Machine comparison'), rtl);
  put(doc, t('Machine comparison'), 14, 28, { size: 16, bold: true, maxWidth: w - 28, rtl });

  // One row per fact; a dash where a machine doesn't list it
  const facts = products.map((p) => new Map(machineFacts(p, loc)));
  const keys = [...new Set(facts.flatMap((m) => [...m.keys()]))];
  const widths = [45, ...products.map(() => (w - 28 - 45) / products.length)];
  autoTable(doc, {
    startY: 40,
    head: [['', ...products.map((p) => p.name)]],
    body: keys.map((k) => [k, ...facts.map((m) => m.get(k) ?? '—')]),
    styles: { fontSize: 9, cellPadding: 2.5, valign: 'top' },
    headStyles: { fillColor: [234, 88, 12] },
    columnStyles: Object.fromEntries(widths.map((cw, i) => [i, { cellWidth: cw, ...(i === 0 && { fontStyle: 'bold' }) }])),
    margin: { left: 14, right: 14, bottom: 24 },
    ...tableHooks(widths, rtl),
  });
  closing(doc, products.map((p) => `${p.name}: ${SITE}/shop/${p._id}`), doc.lastAutoTable.finalY + 8, loc, rtl, w - 28);
  footer(doc, loc, rtl);
  doc.save(`machine-comparison-${new Date().toISOString().slice(0, 10)}.pdf`);
  gaEvent('file_download', { file_name: 'machine-comparison', machines: products.length });
}
