// Pharma project cost model, used by the public Project Cost Calculator.
// Everything runs in the visitor's browser; nothing is sent anywhere.
//
// Money is in ₹ lakh (1 lakh = 1,00,000; 100 lakh = 1 crore) as [low, high]
// ranges: indicative 2026 Indian market prices for new, GMP-grade equipment,
// before GST. Utilities are engineering rules of thumb for early planning.
// Update the numbers here when prices change.

export const TIERS = {
  semi: { label: 'Semi-automatic', note: 'Lowest investment, more operators', operators: 1.5 },
  auto: { label: 'Automatic', note: 'Balanced cost and output', operators: 1 },
  high: { label: 'High-speed', note: 'Large volumes, fewest operators', operators: 0.6 },
};

export const COMPLIANCE = {
  schedM: { label: 'Revised Schedule M (India)', short: 'Schedule M', area: 1, hvac: 1, validation: [0.02, 0.03], qc: [45, 75], micro: [15, 25], licence: [10, 20], months: [9, 12], water: 1, qa: 15, qcKw: 30 },
  who: { label: 'WHO-GMP (export to ROW markets)', short: 'WHO-GMP', area: 1.2, hvac: 1.1, validation: [0.03, 0.05], qc: [80, 130], micro: [20, 35], licence: [20, 40], months: [12, 16], water: 1.15, qa: 25, qcKw: 50 },
  eu: { label: 'EU-GMP / US FDA (regulated markets)', short: 'EU-GMP / USFDA', area: 1.6, hvac: 1.3, validation: [0.06, 0.09], qc: [140, 240], micro: [30, 50], licence: [50, 100], months: [18, 24], water: 1.4, qa: 40, qcKw: 80 },
};

// m(name, floor area sq ft per machine, semi, auto, high, options)
//   options.line: one per production line · options.per: counted from its own speed
//   options.perDay: speed is units per DAY (batch machines, e.g. lyophilizer)
//   options.perMachine: same count as the machine with that id · options.id
//   options.steam / options.air: [semi, auto, high] steam kg/hr and compressed air CFM per machine
const m = (name, area, semi, auto, high, opts = {}) => ({ name, area, tiers: { semi, auto, high }, ...opts });
// t(model, speed (units/hr, or units/day for perDay), price low, price high (₹ lakh), connected load kW)
const t = (model, cap, lo, hi, kw) => ({ model, cap, price: [lo, hi], kw });

const SIFTER = m('Vibro sifter', 80, t('30" sifter', 0, 1.5, 3, 1.5), t('36" sifter', 0, 2.5, 4.5, 2.2), t('48" sifter', 0, 4, 7, 3.7), { line: true });
const BLENDER = m('Blender', 200, t('300 L octagonal blender', 0, 5, 9, 3.7), t('600 L bin blender', 0, 10, 18, 7.5), t('1000 L IBC bin blender', 0, 20, 35, 11), { line: true });
const BLISTER = m('Blister packing', 250, t('Flat blister machine, 40 blisters/min', 24000, 10, 18, 10), t('Blister machine, 120 blisters/min', 72000, 30, 50, 18), t('High-speed blister line, 300 blisters/min', 180000, 80, 140, 35), { per: true, id: 'blister', air: [8, 12, 20] });
const cartoner = (ref) => m('Cartoning', 150, null, t('Auto cartoner, 100 cartons/min', 0, 22, 40, 3), t('High-speed cartoner + checkweigher', 0, 45, 75, 5.5), { perMachine: ref, air: [0, 10, 15] });
const STERILE_VESSELS = m('Manufacturing vessel set (SS316L, jacketed)', 300, t('300 L vessel set', 0, 12, 22, 5.5), t('500 L vessel set, PLC', 0, 25, 45, 11), t('1000 L vessel set, CIP/SIP', 0, 45, 80, 18.5), { line: true, steam: [40, 70, 120] });
const AUTOCLAVE = m('Autoclave (steam sterilizer)', 200, t('Autoclave, 600 L', 0, 8, 15, 3), t('Autoclave, 1000 L, PLC', 0, 15, 30, 5), t('Double-door autoclave, 2000 L', 0, 30, 55, 7.5), { line: true, steam: [40, 70, 130] });
const rlaf = (ref) => m('Laminar airflow / RABS / isolator', 0, t('RLAF over filling', 0, 4, 8, 1.5), t('RLAF + curtains', 0, 8, 15, 3), t('RABS / isolator', 0, 40, 80, 7.5), { perMachine: ref });
const inspection = (ref) => m('Visual inspection', 150, t('Manual inspection booth', 0, 1, 2, 0.5), t('Semi-auto inspection machine', 0, 8, 15, 1.5), t('Automatic inspection machine', 0, 60, 100, 5), { perMachine: ref });
const labeller = (ref, what = 'Sticker') => m('Labelling', 80, t(`${what} labeller`, 0, 3, 6, 0.75), t(`Auto ${what.toLowerCase()} labeller`, 0, 6, 12, 1.5), t('High-speed labeller', 0, 12, 22, 2.2), { perMachine: ref, air: [2, 2, 3] });

// Each segment: production unit, default daily output, its machines, and
// rules for process water (KLD = kilolitres per day) and WFI need.
export const SECTIONS = {
  // ── Oral solid dosage ──
  tablets: {
    label: 'Tablets', group: 'osd', unit: 'tablets', defaultDaily: 1000000, min: 50000, max: 20000000, step: 50000,
    hint: 'e.g. 10 lakh tablets per day', sterile: false, wet: false, dust: true,
    lineCap: { semi: 100000, auto: 200000, high: 400000 },
    water: ({ lines }) => 2 + lines * 3,
    machines: [
      SIFTER,
      m('Rapid mixer granulator (RMG)', 300, t('150 L RMG', 0, 8, 14, 15), t('300 L RMG, PLC', 0, 18, 30, 30), t('600 L RMG, PLC, WIP', 0, 35, 60, 55), { line: true, air: [3, 5, 8] }),
      m('Fluid bed dryer (FBD)', 300, t('60 kg FBD', 0, 8, 14, 15), t('120 kg FBD, PLC', 0, 16, 28, 30), t('200 kg FBD, PLC, WIP', 0, 30, 50, 45), { line: true, steam: [80, 150, 250], air: [5, 10, 15] }),
      m('Multi mill / cone mill', 80, t('Multi mill', 0, 1.2, 2.5, 3.7), t('Cone mill', 0, 3, 6, 5.5), t('Cone mill, in-line', 0, 5, 9, 7.5), { line: true }),
      BLENDER,
      m('Rotary tablet press', 250, t('16-station single rotary', 40000, 6, 10, 5.5), t('37-station double rotary', 130000, 20, 35, 11), t('45-station high-speed GMP press', 250000, 55, 95, 22), { per: true, id: 'press', air: [2, 4, 6] }),
      m('Deduster + metal detector', 0, t('Deduster + metal detector', 0, 1.5, 3, 1), t('Deduster + metal detector', 0, 3, 6, 1.5), t('Deduster + metal detector, auto reject', 0, 5, 9, 2), { perMachine: 'press', air: [2, 3, 4] }),
      m('Tablet coating', 300, t('36" conventional coating pan', 60000, 3, 6, 3), t('48" auto coater', 150000, 18, 30, 22), t('60" auto coater, PLC', 300000, 35, 60, 30), { per: true, optional: 'coating', steam: [0, 40, 60], air: [10, 20, 30] }),
      BLISTER,
      cartoner('blister'),
    ],
  },
  capsules: {
    label: 'Hard gelatin capsules', group: 'osd', unit: 'capsules', defaultDaily: 500000, min: 20000, max: 10000000, step: 20000,
    hint: 'e.g. 5 lakh capsules per day', sterile: false, wet: false, dust: true,
    lineCap: { semi: 100000, auto: 200000, high: 400000 },
    water: ({ lines }) => 1.5 + lines * 2,
    machines: [
      SIFTER,
      BLENDER,
      m('Capsule filling', 250, t('Semi-auto capsule filler', 20000, 4, 7, 2), t('Auto capsule filler (NJP-1200)', 60000, 18, 30, 7.5), t('High-speed filler (NJP-3500)', 180000, 45, 75, 15), { per: true, id: 'filler', air: [5, 10, 20] }),
      m('Capsule polisher + sorter', 0, t('Capsule polisher', 0, 1, 2, 0.5), t('Polisher + sorter', 0, 1.5, 3, 1), t('Polisher + sorter + metal detector', 0, 3, 5, 1.5), { perMachine: 'filler' }),
      BLISTER,
      cartoner('blister'),
    ],
  },
  softgels: {
    label: 'Soft gelatin capsules (softgels)', group: 'osd', unit: 'softgels', defaultDaily: 300000, min: 20000, max: 5000000, step: 10000,
    hint: 'e.g. 3 lakh softgels per day', sterile: false, wet: true, dust: false,
    lineCap: { semi: 8000, auto: 30000, high: 60000 },
    water: ({ lines }) => 3 + lines * 3,
    machines: [
      m('Softgel encapsulation machine', 300, t('Small softgel encapsulator (4" dies)', 8000, 20, 35, 7.5), t('Softgel encapsulation machine (7.5" dies)', 30000, 60, 100, 15), t('High-speed softgel line (10" dies)', 60000, 120, 200, 22), { per: true, id: 'encap', air: [5, 8, 12] }),
      m('Gelatin melting tank', 150, t('150 L gelatin melter', 0, 6, 12, 9), t('300 L gelatin melter, PLC', 0, 10, 18, 15), t('600 L gelatin melter, PLC', 0, 15, 25, 22), { perMachine: 'encap', steam: [30, 50, 80] }),
      m('Medicine preparation tank + colloid mill', 150, t('Medicine tank + colloid mill', 0, 4, 8, 5.5), t('Vacuum medicine tank + colloid mill', 0, 6, 12, 7.5), t('Vacuum medicine tank + homogeniser', 0, 10, 18, 11), { perMachine: 'encap' }),
      m('Tumble dryer', 100, t('Tumble dryer, 4 baskets', 0, 5, 10, 3), t('Tumble dryer, 8 baskets', 0, 8, 15, 5.5), t('Tumble dryer, 12 baskets', 0, 12, 22, 7.5), { perMachine: 'encap' }),
      m('Drying room (dehumidified) with trays', 400, t('Drying room + trolleys', 0, 5, 10, 10), t('Drying room + dehumidifier', 0, 10, 20, 20), t('Large drying tunnel + dehumidifier', 0, 20, 35, 35), { perMachine: 'encap' }),
      BLISTER,
      cartoner('blister'),
    ],
  },
  powders: {
    label: 'Dry syrup / powders (bottles or sachets)', group: 'osd', unit: 'packs', defaultDaily: 20000, min: 2000, max: 300000, step: 1000,
    hint: 'bottles or sachets per day', sterile: false, wet: false, dust: true,
    lineCap: { semi: 3000, auto: 6000, high: 12000 },
    water: ({ lines }) => 1.5 + lines * 1.5,
    machines: [
      SIFTER,
      BLENDER,
      m('Powder filling (auger)', 200, t('Single-head auger filler', 1800, 3.5, 6, 1.5), t('Twin-head auger filler', 4800, 10, 18, 3), t('4-head auger filler', 9600, 20, 35, 5.5), { per: true, id: 'filler', air: [3, 5, 8] }),
      m('Bottle air-jet cleaning', 100, t('Air-jet bottle cleaner', 0, 2, 4, 2), t('Inverted air-jet cleaner', 0, 4, 8, 3), t('High-speed air/vacuum cleaner', 0, 8, 14, 5), { perMachine: 'filler', air: [8, 12, 20] }),
      m('Capping / sachet sealing', 0, t('Single-head capper', 0, 2.5, 5, 1), t('Multi-head capper', 0, 6, 12, 2), t('High-speed capper', 0, 12, 22, 3.7), { perMachine: 'filler', air: [3, 5, 8] }),
      labeller('filler'),
      cartoner('filler'),
    ],
  },
  // ── Oral liquids & topicals ──
  liquids: {
    label: 'Oral liquids / syrups', group: 'liquids', unit: 'bottles', defaultDaily: 20000, min: 2000, max: 300000, step: 1000,
    hint: 'bottles of 60–200 ml per day', sterile: false, wet: true, dust: false,
    lineCap: { semi: 2000, auto: 5000, high: 10000 },
    water: ({ daily }) => 8 + (daily * 0.12 * 1.6) / 1000,
    machines: [
      m('Sugar melting vessel', 150, t('500 L vessel', 0, 4, 8, 3.7), t('1000 L vessel', 0, 6, 12, 5.5), t('2000 L vessel', 0, 10, 18, 7.5), { line: true, steam: [60, 100, 180] }),
      m('Manufacturing vessel with stirrer', 300, t('1000 L vessel', 0, 6, 12, 5.5), t('2000 L vessel, PLC', 0, 10, 20, 7.5), t('5000 L vessel, PLC, CIP', 0, 18, 32, 15), { line: true, steam: [40, 70, 120] }),
      m('Storage vessel', 150, t('1000 L storage tank', 0, 4, 8, 1.5), t('2000 L storage tank', 0, 7, 14, 2.2), t('5000 L storage tank', 0, 12, 22, 3.7), { line: true }),
      m('Filter press + transfer pumps', 0, t('Filter press + pumps', 0, 1.5, 3, 3), t('Filter press + pumps', 0, 2.5, 5, 4), t('Filtration skid + pumps', 0, 4, 8, 5.5), { line: true }),
      m('Bottle washing', 120, t('Rotary bottle washer', 2400, 3, 6, 3), t('Linear bottle washer', 6000, 8, 15, 5.5), t('High-speed bottle washer', 12000, 15, 28, 9), { per: true, air: [3, 5, 8] }),
      m('Liquid filling', 200, t('4-head liquid filler', 2400, 4, 8, 1.5), t('8-head liquid filler', 6000, 10, 18, 3), t('12-head liquid filler', 12000, 20, 35, 5.5), { per: true, id: 'filler', air: [5, 8, 12] }),
      m('Capping', 0, t('Single-head ROPP capper', 2400, 2.5, 5, 1), t('Multi-head capper', 6000, 6, 12, 2), t('High-speed capper', 12000, 12, 22, 3.7), { per: true, air: [3, 5, 8] }),
      m('Labelling', 80, t('Sticker labeller', 2400, 2.5, 5, 0.75), t('Auto sticker labeller', 6000, 5, 10, 1.5), t('High-speed labeller', 12000, 10, 18, 2.2), { per: true, air: [2, 2, 3] }),
      cartoner('filler'),
    ],
  },
  ointments: {
    label: 'Ointments / creams / gels', group: 'liquids', unit: 'tubes', defaultDaily: 20000, min: 2000, max: 300000, step: 1000,
    hint: 'tubes of 5–50 g per day', sterile: false, wet: true, dust: false,
    lineCap: { semi: 1500, auto: 3600, high: 7200 },
    water: ({ daily }) => 6 + (daily * 0.03 * 1.6) / 1000,
    machines: [
      m('Ointment manufacturing plant (vessels + homogeniser)', 400, t('250 kg plant', 0, 18, 30, 22), t('500 kg plant, PLC', 0, 35, 60, 37), t('1000 kg plant, PLC, CIP', 0, 60, 100, 55), { line: true, steam: [80, 130, 220] }),
      m('Tube filling & sealing', 200, t('Semi-auto tube filler, 25 tubes/min', 1500, 5, 9, 3), t('Auto tube filler, 60 tubes/min', 3600, 15, 28, 7.5), t('High-speed tube filler, 120 tubes/min', 7200, 35, 60, 11), { per: true, id: 'filler', air: [5, 10, 15] }),
      cartoner('filler'),
    ],
  },
  // ── Sterile injectables & ophthalmics ──
  injectables: {
    label: 'Injectables – liquid vials', group: 'sterile', unit: 'vials', defaultDaily: 20000, min: 2000, max: 300000, step: 1000,
    hint: 'vials of 2–30 ml per day', sterile: true, wet: true, dust: false, wfi: 500,
    lineCap: { semi: 2400, auto: 6000, high: 12000 },
    water: ({ daily }) => 10 + (daily * 0.1) / 1000,
    machines: [
      STERILE_VESSELS,
      AUTOCLAVE,
      m('Vial washing', 300, t('Rotary vial washer', 2400, 12, 20, 5), t('Linear vial washer', 6000, 25, 40, 9), t('High-speed vial washer', 12000, 40, 70, 15), { per: true, id: 'filler', air: [5, 8, 12] }),
      m('Depyrogenation', 300, t('Hot-air sterilizer (batch)', 0, 6, 12, 18), t('Depyrogenation tunnel', 0, 35, 60, 45), t('High-speed depyrogenation tunnel', 0, 60, 100, 75), { perMachine: 'filler' }),
      m('Vial filling & stoppering', 400, t('Vial filling & stoppering', 0, 15, 28, 2), t('Vial filling & stoppering, PLC', 0, 35, 60, 4), t('High-speed filling & stoppering', 0, 70, 120, 7.5), { perMachine: 'filler', air: [5, 10, 15] }),
      rlaf('filler'),
      m('Vial capping', 200, t('Vial capping machine', 0, 5, 9, 1), t('Vial capping machine, PLC', 0, 10, 18, 2), t('High-speed capping', 0, 18, 30, 3.5), { perMachine: 'filler', air: [3, 5, 8] }),
      inspection('filler'),
      labeller('filler', 'Vial'),
    ],
  },
  ampoules: {
    label: 'Injectables – ampoules', group: 'sterile', unit: 'ampoules', defaultDaily: 50000, min: 5000, max: 500000, step: 5000,
    hint: 'ampoules of 1–10 ml per day', sterile: true, wet: true, dust: false, wfi: 500,
    lineCap: { semi: 3000, auto: 9000, high: 18000 },
    water: ({ daily }) => 10 + (daily * 0.06) / 1000,
    machines: [
      STERILE_VESSELS,
      AUTOCLAVE,
      m('Ampoule washing', 300, t('Rotary ampoule washer', 3000, 10, 18, 4), t('Linear ampoule washer', 9000, 22, 38, 7.5), t('High-speed ampoule washer', 18000, 40, 65, 11), { per: true, id: 'filler', air: [5, 8, 12] }),
      m('Depyrogenation', 300, t('Hot-air sterilizer (batch)', 0, 6, 12, 18), t('Depyrogenation tunnel', 0, 35, 60, 45), t('High-speed depyrogenation tunnel', 0, 60, 100, 75), { perMachine: 'filler' }),
      m('Ampoule filling & sealing', 400, t('2-head ampoule filling & sealing', 0, 8, 15, 2), t('8-head ampoule filling & sealing', 0, 25, 45, 4), t('12-head ampoule filling & sealing', 0, 50, 85, 6), { perMachine: 'filler', air: [3, 5, 8] }),
      rlaf('filler'),
      inspection('filler'),
      labeller('filler', 'Ampoule'),
    ],
  },
  lyo: {
    label: 'Injectables – freeze-dried (lyophilized) vials', group: 'sterile', unit: 'vials', defaultDaily: 10000, min: 1000, max: 100000, step: 1000,
    hint: 'lyophilized vials per day', sterile: true, wet: true, dust: false, wfi: 500,
    lineCap: { semi: 2400, auto: 6000, high: 12000 },
    water: ({ daily }) => 15 + (daily * 0.1) / 1000,
    machines: [
      STERILE_VESSELS,
      AUTOCLAVE,
      m('Vial washing', 300, t('Rotary vial washer', 2400, 12, 20, 5), t('Linear vial washer', 6000, 25, 40, 9), t('High-speed vial washer', 12000, 40, 70, 15), { per: true, id: 'filler', air: [5, 8, 12] }),
      m('Depyrogenation', 300, t('Hot-air sterilizer (batch)', 0, 6, 12, 18), t('Depyrogenation tunnel', 0, 35, 60, 45), t('High-speed depyrogenation tunnel', 0, 60, 100, 75), { perMachine: 'filler' }),
      m('Vial filling & half-stoppering', 400, t('Filling & half-stoppering', 0, 18, 32, 2), t('Filling & half-stoppering, PLC', 0, 40, 70, 4), t('High-speed filling & half-stoppering', 0, 80, 130, 7.5), { perMachine: 'filler', air: [5, 10, 15] }),
      m('Lyophilizer (freeze dryer)', 500, t('5 m² lyophilizer, manual loading', 8000, 150, 250, 60), t('10 m² lyophilizer + auto loading', 16000, 300, 500, 110), t('20 m² lyophilizer + ALUS + CIP/SIP', 32000, 600, 950, 200), { perDay: true, steam: [0, 60, 120], air: [5, 10, 20] }),
      rlaf('filler'),
      m('Vial capping', 200, t('Vial capping machine', 0, 5, 9, 1), t('Vial capping machine, PLC', 0, 10, 18, 2), t('High-speed capping', 0, 18, 30, 3.5), { perMachine: 'filler', air: [3, 5, 8] }),
      inspection('filler'),
      labeller('filler', 'Vial'),
    ],
  },
  ophthalmic: {
    label: 'Eye / ear / nasal drops (sterile)', group: 'sterile', unit: 'bottles', defaultDaily: 20000, min: 2000, max: 300000, step: 1000,
    hint: 'dropper bottles of 5–15 ml per day', sterile: true, wet: true, dust: false, wfi: 300,
    lineCap: { semi: 1800, auto: 4800, high: 9000 },
    water: ({ daily }) => 8 + (daily * 0.03) / 1000,
    machines: [
      m('Manufacturing vessel set (SS316L)', 250, t('200 L vessel set', 0, 10, 18, 4), t('500 L vessel set, PLC', 0, 20, 35, 7.5), t('1000 L vessel set, CIP/SIP', 0, 35, 60, 11), { line: true, steam: [30, 50, 90] }),
      m('Sterile filtration skid', 0, t('Filter housing + integrity tester', 0, 3, 6, 0.5), t('Filtration skid + integrity tester', 0, 6, 12, 1), t('Automated filtration skid', 0, 12, 22, 2), { line: true }),
      AUTOCLAVE,
      m('Aseptic filling, plugging & capping', 400, t('3-piece filling-plugging-capping', 1800, 12, 22, 2), t('Auto 3-piece filling-plugging-capping', 4800, 30, 55, 3.5), t('High-speed monoblock filler', 9000, 60, 100, 6), { per: true, id: 'filler', air: [5, 8, 12] }),
      rlaf('filler'),
      labeller('filler'),
      cartoner('filler'),
    ],
  },
  lvp: {
    label: 'IV fluids – large volume parenterals (BFS)', group: 'sterile', unit: 'bottles', defaultDaily: 20000, min: 2000, max: 200000, step: 1000,
    hint: '100–1000 ml bottles per day', sterile: true, wet: true, dust: false, wfi: 3000,
    lineCap: { semi: 1500, auto: 3000, high: 6000 },
    water: ({ daily }) => 20 + (daily * 0.5 * 1.5) / 1000,
    machines: [
      m('Blow-fill-seal (BFS) machine', 600, t('BFS machine, 1,500 bottles/hr', 1500, 250, 400, 75), t('BFS machine, 3,000 bottles/hr', 3000, 450, 700, 110), t('BFS machine, 6,000 bottles/hr', 6000, 800, 1200, 160), { per: true, id: 'bfs', air: [80, 120, 200] }),
      m('Solution preparation vessels', 400, t('5,000 L vessels + filtration', 0, 30, 55, 15), t('10,000 L vessels + filtration', 0, 50, 85, 22), t('20,000 L vessels + CIP/SIP', 0, 80, 140, 37), { perMachine: 'bfs', steam: [60, 100, 180] }),
      m('Terminal sterilizer (superheated water)', 400, t('Terminal sterilizer, 6 m³', 0, 40, 70, 15), t('Terminal sterilizer, 10 m³', 0, 70, 120, 22), t('Terminal sterilizer, 20 m³', 0, 120, 200, 37), { perMachine: 'bfs', steam: [120, 200, 350] }),
      m('Leak test & inspection', 200, t('Manual inspection + leak test', 0, 8, 15, 3), t('Semi-auto leak tester + inspection', 0, 15, 30, 5), t('Automatic leak test + inspection', 0, 40, 70, 11), { perMachine: 'bfs' }),
      m('Labelling & shrink packing', 200, t('Labeller + shrink tunnel', 0, 8, 15, 5), t('Auto labeller + shrink wrapper', 0, 15, 28, 7.5), t('High-speed labelling + case packer', 0, 30, 50, 15), { perMachine: 'bfs', air: [3, 5, 8] }),
    ],
  },
};

export const SECTION_GROUPS = [
  { key: 'osd', label: 'Oral solid dosage' },
  { key: 'liquids', label: 'Oral liquids & topicals' },
  { key: 'sterile', label: 'Sterile injectables & ophthalmics' },
];

const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (r, k) => [r[0] * (Array.isArray(k) ? k[0] : k), r[1] * (Array.isArray(k) ? k[1] : k)];
const sum = (rows, f) => rows.reduce((acc, r) => add(acc, f(r)), [0, 0]);
const TIER_INDEX = { semi: 0, auto: 1, high: 2 };
const up = (x, sizes) => sizes.find((s) => s >= x) || Math.ceil(x / 500) * 500;
const TRANSFORMERS = [63, 100, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150];
const DG_SETS = [62.5, 82.5, 125, 160, 200, 250, 320, 380, 500, 625, 750, 1010, 1250, 1500, 2000, 2500];
const PW_SIZES = [500, 1000, 2000, 3000, 5000, 8000, 10000];

export const EFFICIENCY = 0.7; // machines run ~70% of rated speed over a shift
export const HOURS_PER_SHIFT = 8;
export const DEFAULT_TARIFF = 8.5; // ₹ per kWh, Indian industrial supply
const DEMAND_CHARGE = 350; // ₹ per kVA per month
const WORKING_DAYS = 26;

// inputs: { sections: { tablets: { on, daily }, ... }, tier, compliance, shifts, coating, landCost, tariff }
export function calculate(inputs) {
  const tierKey = TIERS[inputs.tier] ? inputs.tier : 'auto';
  const ti = TIER_INDEX[tierKey];
  const comp = COMPLIANCE[inputs.compliance] || COMPLIANCE.schedM;
  const shifts = Math.min(3, Math.max(1, Number(inputs.shifts) || 1));
  const tariff = Number(inputs.tariff) > 0 ? Math.min(30, Number(inputs.tariff)) : DEFAULT_TARIFF;
  const runHours = shifts * HOURS_PER_SHIFT;
  const machines = [];
  const segments = [];

  for (const [key, sec] of Object.entries(SECTIONS)) {
    const s = inputs.sections?.[key];
    if (!s?.on) continue;
    const daily = Math.min(sec.max, Math.max(sec.min, Number(s.daily) || sec.defaultDaily));
    const perHour = daily / (runHours * EFFICIENCY);
    const lines = Math.max(1, Math.ceil(perHour / sec.lineCap[tierKey]));
    const counts = {};
    const rows = [];
    for (const mc of sec.machines) {
      const spec = mc.tiers[tierKey];
      if (!spec) continue;
      if (mc.optional === 'coating' && !inputs.coating) continue;
      let qty = 1;
      if (mc.line) qty = lines;
      else if (mc.perDay) qty = Math.max(1, Math.ceil(daily / spec.cap));
      else if (mc.per) qty = Math.max(1, Math.ceil(perHour / spec.cap));
      else if (mc.perMachine) qty = counts[mc.perMachine] || 1;
      if (mc.id) counts[mc.id] = qty;
      rows.push({
        section: key, sectionLabel: sec.label, name: mc.name, model: spec.model, cap: spec.cap, perDay: !!mc.perDay, qty,
        unit: spec.price, total: mul(spec.price, qty),
        kw: spec.kw * qty, steam: (mc.steam?.[ti] || 0) * qty, air: (mc.air?.[ti] ?? 3) * qty, area: mc.area * qty,
      });
    }
    machines.push(...rows);
    const machineArea = rows.reduce((a, r) => a + r.area, 0);
    const area = Math.round(machineArea * 1.2 + 400); // rooms, corridors, airlocks, change rooms
    const machineKw = rows.reduce((a, r) => a + r.kw, 0);
    const operators = Math.ceil(rows.reduce((a, r) => a + r.qty, 0) * TIERS[tierKey].operators * 0.6) * shifts;
    // HVAC: sterile rooms need far more air changes than oral solid rooms
    const tr = Math.round((area / (sec.sterile ? 45 : 85)) * comp.hvac);
    segments.push({
      key, label: sec.label, unit: sec.unit, daily, lines, sterile: sec.sterile, area,
      machineCount: rows.reduce((a, r) => a + r.qty, 0),
      machineKw: Math.round(machineKw),
      tr, hvacKw: Math.round(tr * 1.1),
      steam: Math.round(rows.reduce((a, r) => a + r.steam, 0)),
      air: Math.round(rows.reduce((a, r) => a + r.air, 0) * 1.2), // + leaks and future
      water: Math.round(sec.water({ daily, lines }) * comp.water * 10) / 10,
      wfi: sec.wfi || 0,
      operators,
      cost: sum(rows, (r) => r.total),
    });
  }
  if (!segments.length) return null;

  const machinery = sum(machines, (r) => r.total);
  const keys = segments.map((s) => s.key);
  const any = (prop) => keys.some((k) => SECTIONS[k][prop]);
  const sterile = any('sterile');
  const wet = any('wet');
  const dust = any('dust');

  // ── Areas ──
  const cleanArea = segments.filter((s) => !s.sterile).reduce((a, s) => a + s.area, 0);
  const sterileArea = segments.filter((s) => s.sterile).reduce((a, s) => a + s.area, 0);
  const production = cleanArea + sterileArea;
  const qcArea = Math.round(1200 * comp.area + (sterile ? 600 : 0));
  const warehouse = Math.round(production * 0.5 + 1000);
  const support = Math.round(production * 0.4 + 800);
  const builtUp = production + qcArea + warehouse + support;

  // ── Staff ──
  const operators = segments.reduce((a, s) => a + s.operators, 0);
  const qa = comp.qa + segments.length * 4 + (sterile ? 10 : 0);
  const staff = Math.round((operators + qa) * 1.25); // + stores, engineering, admin

  // ── Common utilities (whole plant) ──
  const processWater = segments.reduce((a, s) => a + s.water, 0);
  const pwLph = up((processWater * 1000 * 0.6) / Math.max(8, runHours) * 1.3, PW_SIZES);
  const wfiLph = Math.max(0, ...segments.map((s) => s.wfi)); // the largest WFI user sizes the plant's system
  const totalTr = segments.reduce((a, s) => a + s.tr, 0) + Math.round((qcArea + warehouse + support) / 220);
  const steamProcess = segments.reduce((a, s) => a + s.steam, 0);
  const steamWfi = wfiLph ? Math.round(wfiLph * 0.3 + 100) : 0; // multi-column still + pure steam generator
  const steamTotal = Math.round((steamProcess + steamWfi) * 1.15);
  const airTotal = segments.reduce((a, s) => a + s.air, 0) + 10;
  const domesticKld = Math.round(staff * 0.045 * 10) / 10;
  const coolingKld = Math.round(totalTr * 0.2 * 10) / 10;
  const waterTotal = Math.round((processWater + domesticKld + coolingKld) * 10) / 10;

  const commonLoads = [
    { name: 'HVAC for QC, stores & offices', kw: Math.round(((qcArea + warehouse + support) / 220) * 1.1) },
    { name: `Purified water system (${pwLph.toLocaleString('en-IN')} L/hr)`, kw: Math.round(5 + pwLph / 200) },
    wfiLph && { name: `WFI + pure steam (${wfiLph.toLocaleString('en-IN')} L/hr)`, kw: Math.round(10 + wfiLph / 150) },
    { name: `Air compressors (${airTotal} CFM)`, kw: Math.round(airTotal * 0.19 + 3) },
    steamTotal > 0 && { name: `Boiler auxiliaries (${steamTotal} kg/hr steam)`, kw: Math.round(3 + steamTotal * 0.012) },
    { name: 'Process chiller & cooling tower', kw: wet || tierKey !== 'semi' ? 15 : 7.5 },
    { name: 'Effluent treatment plant', kw: wet ? 15 : 7.5 },
    dust && { name: 'Dust collectors', kw: 7.5 + 3.7 * segments.filter((s) => SECTIONS[s.key].dust).length },
    { name: 'QC lab instruments', kw: comp.qcKw + (sterile ? 15 : 0) },
    { name: 'Lighting, offices & IT', kw: Math.round(builtUp * 0.0018) },
  ].filter(Boolean);
  const commonKw = commonLoads.reduce((a, l) => a + l.kw, 0);

  // ── Power: connected load → maximum demand → transformer / DG / monthly bill ──
  const machineKw = segments.reduce((a, s) => a + s.machineKw, 0);
  const hvacKw = segments.reduce((a, s) => a + s.hvacKw, 0);
  const connectedKw = Math.round(machineKw + hvacKw + commonKw);
  const demandKw = Math.round(machineKw * 0.6 + hvacKw * 0.85 + commonKw * 0.65);
  const demandKva = Math.round(demandKw / 0.9);
  const transformer = up(demandKva * 1.25, TRANSFORMERS);
  const dgSet = up(demandKva * 1.1, DG_SETS);
  // daily energy: machines run in shifts, HVAC runs round the clock
  const dailyKwh = machineKw * 0.6 * runHours + hvacKw * 0.7 * 24 + commonKw * 0.55 * (runHours + 4);
  const monthlyKwh = Math.round(dailyKwh * WORKING_DAYS);
  const monthlyBill = monthlyKwh * tariff + demandKva * DEMAND_CHARGE;
  for (const s of segments) {
    s.connectedKw = s.machineKw + s.hvacKw;
    s.monthlyKwh = Math.round((s.machineKw * 0.6 * runHours + s.hvacKw * 0.7 * 24) * WORKING_DAYS);
  }

  // ── Building ──
  const perSqft = (sqft, rate) => [(sqft * rate[0]) / 1e5, (sqft * rate[1]) / 1e5]; // ₹/sq ft → lakh
  const civil = perSqft(builtUp, [1500, 2200]);
  const cleanroom = add(perSqft(cleanArea, mul([1100, 1800], comp.area)), perSqft(sterileArea, mul([3000, 4800], comp.area)));
  const hvac = add(perSqft(cleanArea, mul([900, 1500], comp.area)), perSqft(sterileArea, mul([2500, 4000], comp.area)));

  // ── Utility equipment, sized from the loads above ──
  const scale = (base, size, ref) => mul(base, Math.max(1, (size / ref) ** 0.6));
  const utilities = [
    { name: 'Purified water system (RO + EDI + loop)', basis: `${pwLph.toLocaleString('en-IN')} L/hr`, total: mul(scale([10, 18], pwLph, 500), comp.water) },
    wfiLph && { name: 'Water for injection (distillation + pure steam + loop)', basis: `${wfiLph.toLocaleString('en-IN')} L/hr`, total: mul(scale([60, 110], wfiLph, 500), comp.water) },
    { name: 'Oil-free compressed air + dryer', basis: `${airTotal} CFM`, total: [Math.max(6, airTotal * 0.08), Math.max(12, airTotal * 0.12)] },
    steamTotal > 0 && { name: 'Steam boiler', basis: `${steamTotal.toLocaleString('en-IN')} kg/hr`, total: [Math.max(8, steamTotal * 0.015), Math.max(16, steamTotal * 0.025)] },
    (wet || tierKey !== 'semi') && { name: 'Process chiller + cooling tower', basis: 'process cooling', total: [6, 14] },
    dust && { name: 'Dust collection system', basis: 'for powder rooms', total: [4, 10] },
    { name: 'Transformer + HT panel', basis: `${transformer.toLocaleString('en-IN')} kVA`, total: [transformer * 0.016, transformer * 0.024] },
    { name: 'DG set (power backup)', basis: `${dgSet.toLocaleString('en-IN')} kVA`, total: [dgSet * 0.035, dgSet * 0.045] },
    { name: 'LT panels, cabling, lighting, earthing', basis: `${connectedKw.toLocaleString('en-IN')} kW connected`, total: [connectedKw * 0.02, connectedKw * 0.03] },
    { name: 'Effluent treatment plant (ETP)', basis: `${waterTotal} KLD water use`, total: wet ? [15, 30] : [8, 15] },
  ].filter(Boolean);
  const utilitiesTotal = sum(utilities, (u) => u.total);

  const qc = [
    { name: 'Quality control lab (HPLC, dissolution, UV, stability chambers…)', basis: comp.short, total: comp.qc },
    (sterile || inputs.compliance !== 'schedM') && { name: 'Microbiology lab', basis: sterile ? 'required for sterile products' : comp.short, total: comp.micro },
  ].filter(Boolean);
  const qcTotal = sum(qc, (u) => u.total);

  const installation = mul(machinery, [0.04, 0.07]);
  const validation = mul(add(add(machinery, utilitiesTotal), hvac), comp.validation);
  const project = [
    { name: 'Installation & commissioning', basis: '4–7% of machinery', total: installation },
    { name: 'Qualification & validation (DQ/IQ/OQ/PQ, documents)', basis: `${Math.round(comp.validation[0] * 100)}–${Math.round(comp.validation[1] * 100)}% of equipment`, total: validation },
    { name: 'Warehouse racking & material handling', basis: `${warehouse.toLocaleString('en-IN')} sq ft store`, total: [Math.max(6, warehouse * 0.0015), Math.max(15, warehouse * 0.003)] },
    { name: 'Furniture, IT & software (ERP / LIMS)', basis: 'offices, QA, labs', total: inputs.compliance === 'eu' ? [25, 50] : [8, 18] },
    { name: 'Licences, consultancy & pre-operative expenses', basis: comp.short, total: comp.licence },
  ];
  const projectTotal = sum(project, (u) => u.total);

  const building = [
    { name: 'Civil construction (RCC building)', basis: `${builtUp.toLocaleString('en-IN')} sq ft built-up`, total: civil },
    { name: 'Cleanroom panels, epoxy floors & doors', basis: `${production.toLocaleString('en-IN')} sq ft clean area${sterileArea ? ` (${sterileArea.toLocaleString('en-IN')} sterile)` : ''}`, total: cleanroom },
    { name: 'HVAC: AHUs, chillers, ducting, HEPA, BMS', basis: `${totalTr.toLocaleString('en-IN')} TR · ${comp.short}`, total: hvac },
  ];
  const buildingTotal = add(add(civil, cleanroom), hvac);

  const subtotal = [machinery, buildingTotal, utilitiesTotal, qcTotal, projectTotal].reduce(add, [0, 0]);
  const contingency = mul(subtotal, [0.05, 0.08]);
  const gst = mul(add(subtotal, mul(comp.licence, -1)), 0.18); // licences & consultancy are not taxed the same way
  const land = Math.max(0, Number(inputs.landCost) || 0);
  const totalExGst = add(add(subtotal, contingency), [land, land]);
  const total = add(totalExGst, gst);
  const months = [comp.months[0] + (sterile ? 3 : 0), comp.months[1] + (sterile ? 3 : 0)];

  return {
    tier: tierKey,
    compliance: comp,
    shifts,
    tariff,
    machines,
    segments,
    machineCount: machines.reduce((n, l) => n + l.qty, 0),
    groups: [
      { key: 'machinery', label: 'Process & packing machinery', total: machinery },
      { key: 'building', label: 'Building, cleanrooms & HVAC', total: buildingTotal },
      { key: 'utilities', label: 'Utilities & power', total: utilitiesTotal },
      { key: 'qc', label: 'QC & micro labs', total: qcTotal },
      { key: 'project', label: 'Installation, validation & pre-operative', total: projectTotal },
      { key: 'contingency', label: 'Contingency (5–8%)', total: contingency },
      ...(land ? [{ key: 'land', label: 'Land', total: [land, land] }] : []),
    ],
    building, utilities, qc, project,
    area: { production, sterile: sterileArea, qc: qcArea, warehouse, support, builtUp, plot: Math.round(builtUp / 0.45) },
    power: {
      machineKw: Math.round(machineKw), hvacKw: Math.round(hvacKw), commonKw: Math.round(commonKw), commonLoads,
      connectedKw, demandKw, demandKva, transformer, dgSet, dailyKwh: Math.round(dailyKwh), monthlyKwh, monthlyBill,
    },
    plant: { tr: totalTr, steam: steamTotal, air: airTotal, water: waterTotal, processWater: Math.round(processWater * 10) / 10, domesticKld, coolingKld, pwLph, wfiLph },
    staff: { total: staff, operators, qa },
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
// whole rupees → readable (for the monthly power bill)
export const formatRupees = (rs) => formatLakh(rs / 100000);
