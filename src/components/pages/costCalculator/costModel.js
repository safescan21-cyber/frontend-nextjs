// Pharma project cost model, used by the public Project Cost Calculator.
// Everything runs in the visitor's browser; nothing is sent anywhere.
//
// All money is in ₹ lakh (1 lakh = 1,00,000; 100 lakh = 1 crore) as [low, high]
// ranges: indicative 2026 Indian market prices for new, GMP-grade equipment,
// before GST. Update the numbers here when prices change.

export const TIERS = {
  semi: { label: 'Semi-automatic', note: 'Lowest investment, more operators' },
  auto: { label: 'Automatic', note: 'Balanced cost and output' },
  high: { label: 'High-speed', note: 'Large volumes, fewest operators' },
};

export const COMPLIANCE = {
  schedM: { label: 'Revised Schedule M (India)', short: 'Schedule M', area: 1, validation: [0.02, 0.03], qc: [45, 75], micro: [15, 25], licence: [10, 20], months: [9, 12], water: 1 },
  who: { label: 'WHO-GMP (export to ROW markets)', short: 'WHO-GMP', area: 1.2, validation: [0.03, 0.05], qc: [80, 130], micro: [20, 35], licence: [20, 40], months: [12, 16], water: 1.15 },
  eu: { label: 'EU-GMP / US FDA (regulated markets)', short: 'EU-GMP / USFDA', area: 1.6, validation: [0.06, 0.09], qc: [140, 240], micro: [30, 50], licence: [50, 100], months: [18, 24], water: 1.4 },
};

const m = (name, area, semi, auto, high, opts = {}) => ({ name, area, tiers: { semi, auto, high }, ...opts });
// tier spec: { model, cap (units per hour, rated), price: [lo, hi] } — null = not used at this tier
const t = (model, cap, lo, hi) => ({ model, cap, price: [lo, hi] });

// Each section: production units, a default daily output, and its machines.
// `line` machines come as a set: one set per `lineCap` units/hour.
// `per` machines are counted from their own capacity; `perMachine` follows another machine's count.
export const SECTIONS = {
  tablets: {
    label: 'Tablets', unit: 'tablets', defaultDaily: 1000000, min: 50000, max: 20000000, step: 50000,
    hint: 'e.g. 10 lakh tablets per day', sterile: false, wet: false, dust: true,
    lineCap: { semi: 100000, auto: 200000, high: 400000 },
    lineLabel: 'Granulation line',
    machines: [
      m('Vibro sifter', 80, t('30" sifter', 0, 1.5, 3), t('36" sifter', 0, 2.5, 4.5), t('48" sifter', 0, 4, 7), { line: true }),
      m('Rapid mixer granulator (RMG)', 300, t('150 L RMG', 0, 8, 14), t('300 L RMG, PLC', 0, 18, 30), t('600 L RMG, PLC, WIP', 0, 35, 60), { line: true }),
      m('Fluid bed dryer (FBD)', 300, t('60 kg FBD', 0, 8, 14), t('120 kg FBD, PLC', 0, 16, 28), t('200 kg FBD, PLC, WIP', 0, 30, 50), { line: true }),
      m('Multi mill / cone mill', 80, t('Multi mill', 0, 1.2, 2.5), t('Cone mill', 0, 3, 6), t('Cone mill, in-line', 0, 5, 9), { line: true }),
      m('Blender', 200, t('300 L octagonal blender', 0, 5, 9), t('600 L bin blender', 0, 10, 18), t('1000 L IBC bin blender', 0, 20, 35), { line: true }),
      m('Rotary tablet press', 250, t('16-station single rotary', 40000, 6, 10), t('37-station double rotary', 130000, 20, 35), t('45-station high-speed GMP press', 250000, 55, 95), { per: true, id: 'press' }),
      m('Deduster + metal detector', 0, t('Deduster + metal detector', 0, 1.5, 3), t('Deduster + metal detector', 0, 3, 6), t('Deduster + metal detector, auto reject', 0, 5, 9), { perMachine: 'press' }),
      m('Tablet coating', 300, t('36" conventional coating pan', 60000, 3, 6), t('48" auto coater', 150000, 18, 30), t('60" auto coater, PLC', 300000, 35, 60), { per: true, optional: 'coating' }),
      m('Blister packing', 250, t('Flat blister machine, 40 blisters/min', 24000, 10, 18), t('Blister machine, 120 blisters/min', 72000, 30, 50), t('High-speed blister line, 300 blisters/min', 180000, 80, 140), { per: true, id: 'blister' }),
      m('Cartoning', 150, null, t('Auto cartoner, 100 cartons/min', 0, 22, 40), t('High-speed cartoner + checkweigher', 0, 45, 75), { perMachine: 'blister' }),
    ],
  },
  capsules: {
    label: 'Capsules', unit: 'capsules', defaultDaily: 500000, min: 20000, max: 10000000, step: 20000,
    hint: 'e.g. 5 lakh capsules per day', sterile: false, wet: false, dust: true,
    lineCap: { semi: 100000, auto: 200000, high: 400000 },
    lineLabel: 'Blending line',
    machines: [
      m('Vibro sifter', 80, t('30" sifter', 0, 1.5, 3), t('36" sifter', 0, 2.5, 4.5), t('48" sifter', 0, 4, 7), { line: true }),
      m('Blender', 200, t('300 L octagonal blender', 0, 5, 9), t('600 L bin blender', 0, 10, 18), t('1000 L IBC bin blender', 0, 20, 35), { line: true }),
      m('Capsule filling', 250, t('Semi-auto capsule filler', 20000, 4, 7), t('Auto capsule filler (NJP-1200)', 60000, 18, 30), t('High-speed filler (NJP-3500)', 180000, 45, 75), { per: true, id: 'filler' }),
      m('Capsule polisher + sorter', 0, t('Capsule polisher', 0, 1, 2), t('Polisher + sorter', 0, 1.5, 3), t('Polisher + sorter + metal detector', 0, 3, 5), { perMachine: 'filler' }),
      m('Blister packing', 250, t('Flat blister machine, 40 blisters/min', 24000, 10, 18), t('Blister machine, 120 blisters/min', 72000, 30, 50), t('High-speed blister line, 300 blisters/min', 180000, 80, 140), { per: true, id: 'blister' }),
      m('Cartoning', 150, null, t('Auto cartoner, 100 cartons/min', 0, 22, 40), t('High-speed cartoner + checkweigher', 0, 45, 75), { perMachine: 'blister' }),
    ],
  },
  liquids: {
    label: 'Oral liquids / syrups', unit: 'bottles', defaultDaily: 20000, min: 2000, max: 300000, step: 1000,
    hint: 'bottles of 60–200 ml per day', sterile: false, wet: true, dust: false,
    lineCap: { semi: 2000, auto: 5000, high: 10000 },
    lineLabel: 'Manufacturing line',
    machines: [
      m('Sugar melting vessel', 200, t('500 L vessel', 0, 4, 8), t('1000 L vessel', 0, 6, 12), t('2000 L vessel', 0, 10, 18), { line: true }),
      m('Manufacturing vessel with stirrer', 300, t('1000 L vessel', 0, 6, 12), t('2000 L vessel, PLC', 0, 10, 20), t('5000 L vessel, PLC, CIP', 0, 18, 32), { line: true }),
      m('Storage vessel', 200, t('1000 L storage tank', 0, 4, 8), t('2000 L storage tank', 0, 7, 14), t('5000 L storage tank', 0, 12, 22), { line: true }),
      m('Filter press + transfer pumps', 0, t('Filter press + pumps', 0, 1.5, 3), t('Filter press + pumps', 0, 2.5, 5), t('Filtration skid + pumps', 0, 4, 8), { line: true }),
      m('Bottle washing', 120, t('Rotary bottle washer', 2400, 3, 6), t('Linear bottle washer', 6000, 8, 15), t('High-speed bottle washer', 12000, 15, 28), { per: true }),
      m('Liquid filling', 200, t('4-head liquid filler', 2400, 4, 8), t('8-head liquid filler', 6000, 10, 18), t('12-head liquid filler', 12000, 20, 35), { per: true, id: 'filler' }),
      m('Capping', 0, t('Single-head ROPP capper', 2400, 2.5, 5), t('Multi-head capper', 6000, 6, 12), t('High-speed capper', 12000, 12, 22), { per: true }),
      m('Labelling', 80, t('Sticker labeller', 2400, 2.5, 5), t('Auto sticker labeller', 6000, 5, 10), t('High-speed labeller', 12000, 10, 18), { per: true }),
      m('Cartoning', 150, null, t('Auto cartoner', 0, 20, 35), t('High-speed cartoner + checkweigher', 0, 35, 60), { perMachine: 'filler' }),
    ],
  },
  ointments: {
    label: 'Ointments / creams / gels', unit: 'tubes', defaultDaily: 20000, min: 2000, max: 300000, step: 1000,
    hint: 'tubes of 5–50 g per day', sterile: false, wet: true, dust: false,
    lineCap: { semi: 1500, auto: 3600, high: 7200 },
    lineLabel: 'Manufacturing line',
    machines: [
      m('Ointment manufacturing plant (vessels + homogeniser)', 400, t('250 kg plant', 0, 18, 30), t('500 kg plant, PLC', 0, 35, 60), t('1000 kg plant, PLC, CIP', 0, 60, 100), { line: true }),
      m('Tube filling & sealing', 200, t('Semi-auto tube filler, 25 tubes/min', 1500, 5, 9), t('Auto tube filler, 60 tubes/min', 3600, 15, 28), t('High-speed tube filler, 120 tubes/min', 7200, 35, 60), { per: true, id: 'filler' }),
      m('Cartoning', 150, null, t('Auto cartoner', 0, 20, 35), t('High-speed cartoner + checkweigher', 0, 35, 60), { perMachine: 'filler' }),
    ],
  },
  injectables: {
    label: 'Injectables (liquid vials)', unit: 'vials', defaultDaily: 20000, min: 2000, max: 300000, step: 1000,
    hint: 'vials of 2–30 ml per day', sterile: true, wet: true, dust: false,
    lineCap: { semi: 2400, auto: 6000, high: 12000 },
    lineLabel: 'Sterile manufacturing line',
    machines: [
      m('Manufacturing vessel set (SS316L, jacketed)', 300, t('300 L vessel set', 0, 12, 22), t('500 L vessel set, PLC', 0, 25, 45), t('1000 L vessel set, CIP/SIP', 0, 45, 80), { line: true }),
      m('Autoclave (steam sterilizer)', 200, t('Autoclave, 600 L', 0, 8, 15), t('Autoclave, 1000 L, PLC', 0, 15, 30), t('Double-door autoclave, 2000 L', 0, 30, 55), { line: true }),
      m('Vial washing', 300, t('Rotary vial washer', 2400, 12, 20), t('Linear vial washer', 6000, 25, 40), t('High-speed vial washer', 12000, 40, 70), { per: true, id: 'filler' }),
      m('Depyrogenation', 300, t('Hot-air sterilizer (batch)', 0, 6, 12), t('Depyrogenation tunnel', 0, 35, 60), t('High-speed depyrogenation tunnel', 0, 60, 100), { perMachine: 'filler' }),
      m('Vial filling & stoppering', 400, t('Vial filling & stoppering', 0, 15, 28), t('Vial filling & stoppering, PLC', 0, 35, 60), t('High-speed filling & stoppering', 0, 70, 120), { perMachine: 'filler' }),
      m('Laminar airflow / RABS / isolator', 0, t('RLAF over filling', 0, 4, 8), t('RLAF + curtains', 0, 8, 15), t('RABS / isolator', 0, 40, 80), { perMachine: 'filler' }),
      m('Vial capping', 200, t('Vial capping machine', 0, 5, 9), t('Vial capping machine, PLC', 0, 10, 18), t('High-speed capping', 0, 18, 30), { perMachine: 'filler' }),
      m('Visual inspection', 150, t('Manual inspection booth', 0, 1, 2), t('Semi-auto inspection machine', 0, 8, 15), t('Automatic inspection machine', 0, 60, 100), { perMachine: 'filler' }),
      m('Labelling', 80, t('Vial sticker labeller', 0, 3, 6), t('Auto vial labeller', 0, 6, 12), t('High-speed labeller', 0, 12, 22), { perMachine: 'filler' }),
    ],
  },
};

const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (r, k) => [r[0] * (Array.isArray(k) ? k[0] : k), r[1] * (Array.isArray(k) ? k[1] : k)];
const ZERO = [0, 0];
export const EFFICIENCY = 0.7; // machines run ~70% of rated speed over a shift
export const HOURS_PER_SHIFT = 8;

// inputs: { sections: { tablets: { on, daily }, ... }, tier, compliance, shifts, coating, landCost }
export function calculate(inputs) {
  const tierKey = TIERS[inputs.tier] ? inputs.tier : 'auto';
  const comp = COMPLIANCE[inputs.compliance] || COMPLIANCE.schedM;
  const shifts = Math.min(3, Math.max(1, Number(inputs.shifts) || 1));
  const machines = [];
  let cleanArea = 0;
  let sterileArea = 0;
  const active = [];

  for (const [key, sec] of Object.entries(SECTIONS)) {
    const s = inputs.sections?.[key];
    if (!s?.on) continue;
    const daily = Math.min(sec.max, Math.max(sec.min, Number(s.daily) || sec.defaultDaily));
    active.push(key);
    const perHour = daily / (shifts * HOURS_PER_SHIFT * EFFICIENCY);
    const lines = Math.max(1, Math.ceil(perHour / sec.lineCap[tierKey]));
    const counts = {};
    let secArea = 0;
    for (const mc of sec.machines) {
      const spec = mc.tiers[tierKey];
      if (!spec) continue;
      if (mc.optional === 'coating' && !inputs.coating) continue;
      let qty = 1;
      if (mc.line) qty = lines;
      else if (mc.per) qty = Math.max(1, Math.ceil(perHour / spec.cap));
      else if (mc.perMachine) qty = counts[mc.perMachine] || 1;
      if (mc.id) counts[mc.id] = qty;
      const total = mul(spec.price, qty);
      secArea += mc.area * qty;
      machines.push({ section: key, sectionLabel: sec.label, name: mc.name, model: spec.model, cap: spec.cap, qty, unit: spec.price, total });
    }
    // rooms, corridors, airlocks and change rooms around the machines
    const area = Math.round(secArea * 1.2 + 400);
    if (sec.sterile) sterileArea += area; else cleanArea += area;
  }
  if (!active.length) return null;
  const lines = machines;

  const machinery = lines.reduce((acc, l) => add(acc, l.total), ZERO);
  const any = (prop) => active.some((k) => SECTIONS[k][prop]);
  const sterile = any('sterile');
  const wet = any('wet');
  const dust = any('dust');

  // Built-up area: production + warehouse + QC + utilities/admin
  const production = cleanArea + sterileArea;
  const qcArea = Math.round(1200 * comp.area + (sterile ? 600 : 0));
  const warehouse = Math.round(production * 0.5 + 1000);
  const support = Math.round(production * 0.4 + 800);
  const builtUp = production + qcArea + warehouse + support;

  const perSqft = (sqft, rate) => [(sqft * rate[0]) / 1e5, (sqft * rate[1]) / 1e5]; // ₹/sqft → lakh
  const civil = perSqft(builtUp, [1500, 2200]);
  const cleanroom = add(perSqft(cleanArea, mul([1100, 1800], comp.area)), perSqft(sterileArea, mul([3000, 4800], comp.area)));
  const hvac = add(perSqft(cleanArea, mul([900, 1500], comp.area)), perSqft(sterileArea, mul([2500, 4000], comp.area)));

  const machineCount = lines.reduce((n, l) => n + l.qty, 0);
  const utilities = [
    { name: 'Purified water system (RO + EDI + loop)', basis: wet ? '2,000 L/hr' : '500 L/hr', total: mul(wet ? [18, 35] : [10, 18], comp.water) },
    sterile && { name: 'Water for injection (distillation + pure steam + loop)', basis: 'for injectables', total: mul([60, 110], comp.water) },
    { name: 'Oil-free compressed air + dryer', basis: machineCount > 15 ? 'large plant' : 'standard', total: machineCount > 15 ? [10, 20] : [6, 12] },
    (wet || inputs.coating) && { name: 'Steam boiler', basis: 'process steam', total: [8, 16] },
    (wet || tierKey !== 'semi') && { name: 'Chiller + cooling tower', basis: 'process cooling', total: [6, 14] },
    dust && { name: 'Dust collection system', basis: 'for powder rooms', total: [4, 10] },
    { name: 'Electrical: transformer, DG set, panels, cabling', basis: '7–10% of machinery', total: [Math.max(12, machinery[0] * 0.07), Math.max(20, machinery[1] * 0.1)] },
    { name: 'Effluent treatment plant (ETP)', basis: wet ? 'liquid sections' : 'standard', total: wet ? [15, 30] : [8, 15] },
  ].filter(Boolean);
  const utilitiesTotal = utilities.reduce((acc, u) => add(acc, u.total), ZERO);

  const qc = [
    { name: 'Quality control lab (HPLC, dissolution, UV, stability chambers…)', basis: comp.short, total: comp.qc },
    (sterile || inputs.compliance !== 'schedM') && { name: 'Microbiology lab', basis: sterile ? 'required for injectables' : comp.short, total: comp.micro },
  ].filter(Boolean);
  const qcTotal = qc.reduce((acc, u) => add(acc, u.total), ZERO);

  const installation = mul(machinery, [0.04, 0.07]);
  const validation = mul(add(add(machinery, utilitiesTotal), hvac), comp.validation);
  const project = [
    { name: 'Installation & commissioning', basis: '4–7% of machinery', total: installation },
    { name: 'Qualification & validation (DQ/IQ/OQ/PQ, documents)', basis: `${Math.round(comp.validation[0] * 100)}–${Math.round(comp.validation[1] * 100)}% of equipment`, total: validation },
    { name: 'Warehouse racking & material handling', basis: `${warehouse.toLocaleString('en-IN')} sq ft store`, total: [Math.max(6, warehouse * 0.0015), Math.max(15, warehouse * 0.003)] },
    { name: 'Furniture, IT & software (ERP / LIMS)', basis: 'offices, QA, labs', total: inputs.compliance === 'eu' ? [25, 50] : [8, 18] },
    { name: 'Licences, consultancy & pre-operative expenses', basis: comp.short, total: comp.licence },
  ];
  const projectTotal = project.reduce((acc, u) => add(acc, u.total), ZERO);

  const building = [
    { name: 'Civil construction (RCC building)', basis: `${builtUp.toLocaleString('en-IN')} sq ft built-up`, total: civil },
    { name: 'Cleanroom panels, epoxy floors & doors', basis: `${production.toLocaleString('en-IN')} sq ft clean area${sterileArea ? ` (${sterileArea.toLocaleString('en-IN')} sterile)` : ''}`, total: cleanroom },
    { name: 'HVAC: AHUs, ducting, HEPA filters, BMS', basis: comp.short, total: hvac },
  ];
  const buildingTotal = add(add(civil, cleanroom), hvac);

  const subtotal = [machinery, buildingTotal, utilitiesTotal, qcTotal, projectTotal].reduce(add, ZERO);
  const contingency = mul(subtotal, [0.05, 0.08]);
  const gstBase = add(subtotal, mul(comp.licence, -1)); // licences & consultancy not taxed the same way
  const gst = mul(gstBase, 0.18);
  const land = Math.max(0, Number(inputs.landCost) || 0);
  const totalExGst = add(add(subtotal, contingency), [land, land]);
  const total = add(totalExGst, gst);

  const months = [comp.months[0] + (sterile ? 3 : 0), comp.months[1] + (sterile ? 3 : 0)];

  return {
    tier: tierKey,
    compliance: comp,
    shifts,
    machines: lines,
    machineCount,
    groups: [
      { key: 'machinery', label: 'Process & packing machinery', total: machinery },
      { key: 'building', label: 'Building, cleanrooms & HVAC', total: buildingTotal },
      { key: 'utilities', label: 'Utilities', total: utilitiesTotal },
      { key: 'qc', label: 'QC & micro labs', total: qcTotal },
      { key: 'project', label: 'Installation, validation & pre-operative', total: projectTotal },
      { key: 'contingency', label: 'Contingency (5–8%)', total: contingency },
      ...(land ? [{ key: 'land', label: 'Land', total: [land, land] }] : []),
    ],
    building, utilities, qc, project,
    area: { production, sterile: sterileArea, qc: qcArea, warehouse, support, builtUp, plot: Math.round(builtUp / 0.45) },
    months,
    totalExGst,
    gst,
    total,
  };
}

// ₹ lakh → readable Indian amount
export const formatLakh = (lakh) => {
  if (!Number.isFinite(lakh)) return '—';
  if (lakh >= 100) return `₹${(lakh / 100).toFixed(lakh >= 1000 ? 1 : 2).replace(/\.?0+$/, '')} Cr`;
  if (lakh >= 1) return `₹${lakh.toFixed(lakh >= 10 ? 0 : 1).replace(/\.0$/, '')} L`;
  return `₹${Math.round(lakh * 100000).toLocaleString('en-IN')}`;
};
export const formatRange = ([lo, hi]) => (Math.abs(hi - lo) < 0.01 ? formatLakh(lo) : `${formatLakh(lo)} – ${formatLakh(hi)}`);
