// "Pharma plant setup checklist" PDF, made in the browser (jsPDF) after the visitor
// leaves their email on /pharma-plant-checklist. General guidance only.
export const CHECKLIST = [
  ['1. Product & capacity plan', [
    'List each dosage form (tablets, capsules, liquids, ointments, injectables…) and target output per shift',
    'Decide batch sizes and number of shifts for the first 3 years',
    'Note the markets you will supply (India only, regulated export markets) – it sets the GMP level',
  ]],
  ['2. Site & building', [
    'Land / shed in an approved industrial area with the right zoning',
    'Layout with one-way flow of people, material and waste; separate areas for each dosage form',
    'Ceiling height, floor loading and utility space for the machines you plan',
    'Warehouse with quarantine, approved, rejected and cold-storage areas',
  ]],
  ['3. Clean rooms & HVAC', [
    'Area classification for each room (e.g. Grade D / ISO 8 for oral solids; higher for sterile)',
    'AHUs with HEPA filtration, pressure differentials and temperature / humidity control',
    'Dust extraction for granulation, compression and capsule filling',
    'HVAC qualification and periodic monitoring plan',
  ]],
  ['4. Utilities', [
    'Purified water system (and WFI for injectables) with storage and loop',
    'Oil-free compressed air, dried and filtered at points of use',
    'Steam (for some processes), chilled water, power supply and DG backup sized for the full load',
    'Effluent handling as per the pollution control board conditions',
  ]],
  ['5. Machines (example: oral solid dosage)', [
    'Weighing and dispensing: balances, dispensing booth',
    'Granulation: sifter, rapid mixer granulator, fluid bed dryer, multi mill, blender',
    'Compression: tablet press with tooling, deduster, metal detector',
    'Coating: coating pan or auto coater; capsule filling machine for capsules',
    'Packing: blister or strip packing, cartoning, labelling, checkweigher',
    'QC lab: dissolution, HPLC, disintegration, hardness, friability and moisture testers',
  ]],
  ['6. Documentation & validation', [
    'URS for every machine, then DQ, IQ, OQ and PQ',
    'Process validation and cleaning validation plans',
    'SOPs, batch manufacturing and packing records, change control and deviation system',
    'Calibration and preventive maintenance schedule (consider an AMC)',
  ]],
  ['7. Licences & approvals (check current rules)', [
    'Company registration, GST and Udyam (MSME) registration',
    'Consent to establish / operate from the State Pollution Control Board',
    'Factory licence and fire NOC',
    'Drug manufacturing licence from the State Licensing Authority, with an inspection against Schedule M (GMP)',
  ]],
  ['8. People & training', [
    'Qualified production head, QA and QC heads as required by the licence',
    'Operator training on each machine (ask for it with the purchase order)',
    'Hygiene, gowning and GMP training records',
  ]],
  ['9. Timeline & budget', [
    'Building and clean rooms: plan several months before machine delivery',
    'Machine lead time: confirm with each quotation',
    'Installation, qualification and trial batches before the licence inspection',
    'Use our project cost calculator for a first estimate: foodpharmamachinery.com/project-cost-calculator',
  ]],
];

export async function downloadChecklist() {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  const header = () => {
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, w, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Food Pharma Machinery', 14, 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Pharma plant setup checklist', w - 14, 13, { align: 'right' });
    doc.setTextColor(20, 20, 20);
  };
  header();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Pharma plant setup checklist', 14, 34);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(doc.splitTextToSize('Tick each item as you plan a new pharma plant or a new line. General guidance only: always check the current regulations with your consultant and the licensing authority.', w - 28), 14, 41);
  let y = 54;
  for (const [title, items] of CHECKLIST) {
    if (y > h - 40) { doc.addPage(); header(); y = 30; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(234, 88, 12);
    doc.text(title, 14, y);
    doc.setTextColor(20, 20, 20);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    for (const item of items) {
      const lines = doc.splitTextToSize(item, w - 36);
      if (y + lines.length * 5 > h - 22) { doc.addPage(); header(); y = 30; }
      doc.rect(16, y - 3.2, 3.5, 3.5);
      doc.text(lines, 23, y);
      y += lines.length * 5 + 1.5;
    }
    y += 4;
  }
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(90);
    doc.text('PureLine Machinery Pvt. Ltd., Haridwar  |  +91 87007 92607  |  www.foodpharmamachinery.com', 14, h - 8);
    doc.text(`${i}/${pages}`, w - 14, h - 8, { align: 'right' });
  }
  doc.save('pharma-plant-setup-checklist.pdf');
}
