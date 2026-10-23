// Spec sheets as PDF, made in the browser (jsPDF): one machine, or a comparison of up
// to 3. Buyers forward these to their managers.
//   downloadSpecSheet(product)   downloadComparison([p1, p2, p3])
// (The PDF fonts have no ₹ sign, so prices read "Rs.")

const SITE = 'https://www.foodpharmamachinery.com';
const COMPANY = 'Food Pharma Machinery (PureLine Machinery Pvt. Ltd.), Q-37 Shivalik Nagar, Haridwar, Uttarakhand, India';
const CONTACT = 'Phone / WhatsApp: +91 87007 92607   |   www.foodpharmamachinery.com';

const plain = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const rs = (n) => (Number(n) > 0 ? `Rs. ${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : 'On request');
const label = (slug) => String(slug || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const fileName = (s) => String(s || 'machine').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 60);

// Every fact we have for a machine, as [label, value] rows
export const machineFacts = (p) => [
  ['Category', label(p.category)],
  ['Price (ex-works, INR)', rs(p.price)],
  ...(Array.isArray(p.specifications) ? p.specifications : []).filter((s) => s?.key && s?.value).map((s) => [s.key, String(s.value)]),
  ...(Number(p.warranty) > 0 ? [['Warranty', `${p.warranty} months`]] : []),
  ...(p.origin ? [['Origin', label(p.origin)]] : []),
  ['Availability', Number(p.stock) > 0 ? 'In stock' : 'Made to order'],
];

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

const header = (doc, title) => {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, w, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Food Pharma Machinery', 14, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(title, w - 14, 14, { align: 'right' });
  doc.setTextColor(20, 20, 20);
};

const footer = (doc) => {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(220);
    doc.line(14, h - 18, w - 14, h - 18);
    doc.setFontSize(8);
    doc.setTextColor(90);
    doc.text(COMPANY, 14, h - 12);
    doc.text(CONTACT, 14, h - 7);
    doc.text(`${new Date().toLocaleDateString('en-IN')}  ·  page ${i}/${pages}`, w - 14, h - 7, { align: 'right' });
  }
};

export async function downloadSpecSheet(product) {
  const { jsPDF, autoTable } = await load();
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  header(doc, 'Machine specification sheet');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  const nameLines = doc.splitTextToSize(product.name || 'Machine', w - 28);
  doc.text(nameLines, 14, 34);
  let y = 34 + nameLines.length * 7;

  const img = await photo(product.images?.[0]);
  if (img) {
    doc.addImage(img, 'JPEG', 14, y, 84, 60);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const desc = doc.splitTextToSize(plain(product.description).slice(0, 700), w - 112);
    doc.text(desc.slice(0, 22), 104, y + 4);
    y += 66;
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const desc = doc.splitTextToSize(plain(product.description).slice(0, 900), w - 28);
    doc.text(desc.slice(0, 14), 14, y + 2);
    y += Math.min(desc.length, 14) * 5 + 6;
  }

  autoTable(doc, {
    startY: y,
    head: [['Specification', 'Value']],
    body: machineFacts(product),
    styles: { fontSize: 10, cellPadding: 2.5 },
    headStyles: { fillColor: [234, 88, 12] },
    columnStyles: { 0: { cellWidth: 60, fontStyle: 'bold' } },
    margin: { left: 14, right: 14, bottom: 24 },
  });

  const end = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setTextColor(20);
  doc.text(`Full details and quotation: ${SITE}/shop/${product._id}`, 14, end);
  doc.text('Prices are indicative; installation, freight and taxes are quoted separately.', 14, end + 6);
  footer(doc);
  doc.save(`${fileName(product.name)}-spec-sheet.pdf`);
}

export async function downloadComparison(products) {
  const { jsPDF, autoTable } = await load();
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: products.length > 2 ? 'landscape' : 'portrait' });
  header(doc, 'Machine comparison');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Machine comparison', 14, 34);

  // One row per fact; a dash where a machine doesn't list it
  const facts = products.map((p) => new Map(machineFacts(p)));
  const keys = [...new Set(facts.flatMap((m) => [...m.keys()]))];
  autoTable(doc, {
    startY: 40,
    head: [['', ...products.map((p) => p.name)]],
    body: keys.map((k) => [k, ...facts.map((m) => m.get(k) ?? '—')]),
    styles: { fontSize: 9, cellPadding: 2.5, valign: 'top' },
    headStyles: { fillColor: [234, 88, 12] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } },
    margin: { left: 14, right: 14, bottom: 24 },
  });
  const end = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  products.forEach((p, i) => doc.text(`${p.name}: ${SITE}/shop/${p._id}`, 14, end + i * 6));
  footer(doc);
  doc.save(`machine-comparison-${new Date().toISOString().slice(0, 10)}.pdf`);
}
