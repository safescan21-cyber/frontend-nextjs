'use client';
import Toggle from '../../ui/Toggle';
import React, { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from '../../../shell/router';
import {
  Calculator, Pill, Package, Droplets, Beaker, Syringe, Factory, ShieldCheck, Clock,
  Printer, MessageCircle, FileText, RotateCcw, ChevronDown, Info, Ruler, Wrench,
  Egg, Box, TestTube, Snowflake, Eye, Droplet, Zap, Wind, Flame, Users, Thermometer,
} from 'lucide-react';
import {
  SECTIONS, SECTION_GROUPS, TIERS, COMPLIANCE, calculate, formatLakh, formatRange, formatRupees,
  EFFICIENCY, HOURS_PER_SHIFT, DEFAULT_TARIFF,
} from './costModel';

// Public "Pharma Project Cost Calculator". Runs entirely in the browser:
// the visitor's choices live in the page address (so a link can be shared)
// and nothing is sent to our server.

const ICONS = {
  tablets: Pill, capsules: Package, softgels: Egg, powders: Box, liquids: Droplets, ointments: Beaker,
  injectables: Syringe, ampoules: TestTube, lyo: Snowflake, ophthalmic: Eye, lvp: Droplet,
};
const WHATSAPP = '918700792607';
const GROUP_COLORS = {
  machinery: 'bg-blue-600', building: 'bg-amber-500', utilities: 'bg-teal-500', qc: 'bg-violet-500',
  project: 'bg-rose-500', contingency: 'bg-slate-400', land: 'bg-lime-600', hvac: 'bg-cyan-500',
};
const DEFAULTS = { forms: 'tablets', tier: 'auto', comp: 'schedM', shifts: 1, coating: 1, land: 0, tariff: DEFAULT_TARIFF };

const readState = (params) => {
  const forms = (params.get('forms') ?? DEFAULTS.forms).split(',').filter((k) => SECTIONS[k]);
  const sections = {};
  for (const [k, sec] of Object.entries(SECTIONS)) {
    const v = Number(params.get(k));
    sections[k] = { on: forms.includes(k), daily: Number.isFinite(v) && v > 0 ? Math.min(sec.max, v) : sec.defaultDaily };
  }
  const tier = TIERS[params.get('tier')] ? params.get('tier') : DEFAULTS.tier;
  const compliance = COMPLIANCE[params.get('comp')] ? params.get('comp') : DEFAULTS.comp;
  const shifts = [1, 2, 3].includes(Number(params.get('shifts'))) ? Number(params.get('shifts')) : DEFAULTS.shifts;
  const coating = params.get('coating') !== '0';
  const landCost = Math.max(0, Math.min(100000, Number(params.get('land')) || 0));
  const t = Number(params.get('tariff'));
  const tariff = t > 0 && t <= 30 ? t : DEFAULTS.tariff;
  return { sections, tier, compliance, shifts, coating, landCost, tariff };
};

const toParams = (s) => {
  const p = new URLSearchParams();
  const forms = Object.keys(SECTIONS).filter((k) => s.sections[k].on);
  p.set('forms', forms.join(','));
  for (const k of forms) if (s.sections[k].daily !== SECTIONS[k].defaultDaily) p.set(k, String(s.sections[k].daily));
  if (s.tier !== DEFAULTS.tier) p.set('tier', s.tier);
  if (s.compliance !== DEFAULTS.comp) p.set('comp', s.compliance);
  if (s.shifts !== DEFAULTS.shifts) p.set('shifts', String(s.shifts));
  if (!s.coating) p.set('coating', '0');
  if (s.landCost) p.set('land', String(s.landCost));
  if (s.tariff !== DEFAULTS.tariff) p.set('tariff', String(s.tariff));
  return p;
};

const num = (n) => Number(n).toLocaleString('en-IN');
const capText = (cap, unit, perDay) => (cap ? `${num(cap)} ${unit}/${perDay ? 'day' : 'hr'}` : '');
const kw = (n) => `${num(Math.round(n))} kW`;

const Stat = ({ icon: Icon, label, value, sub }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 print:break-inside-avoid">
    <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}</p>
    <p className="mt-0.5 text-lg font-semibold text-slate-900">{value}</p>
    {sub && <p className="text-xs text-slate-500">{sub}</p>}
  </div>
);

// Power and utilities, per segment and for the whole plant
const UtilitiesPanel = ({ result }) => {
  const [showCommon, setShowCommon] = useState(false);
  const { power, plant, segments, staff } = result;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 print:shadow-none">
      <h2 className="flex items-center gap-2 font-semibold text-slate-800"><Zap className="h-5 w-5 text-amber-500" />Utilities &amp; power by segment</h2>
      <p className="mt-1 text-xs text-slate-500">Electrical load, HVAC, steam, compressed air and water each product line needs, and what the whole plant needs.</p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        <Stat icon={Zap} label="Connected load" value={kw(power.connectedKw)} sub={`Max demand ${kw(power.demandKw)} · ${num(power.demandKva)} kVA`} />
        <Stat icon={Factory} label="Transformer" value={`${num(power.transformer)} kVA`} sub="sanctioned load to apply for" />
        <Stat icon={Zap} label="DG set (backup)" value={`${num(power.dgSet)} kVA`} sub="keeps HVAC & production running" />
        <Stat icon={Clock} label="Electricity per month" value={`${num(power.monthlyKwh)} units`} sub={`≈ ${formatRupees(power.monthlyBill)} bill @ ₹${result.tariff}/unit`} />
        <Stat icon={Thermometer} label="HVAC" value={`${num(plant.tr)} TR`} sub="air-conditioning tonnage" />
        <Stat icon={Flame} label="Steam" value={plant.steam ? `${num(plant.steam)} kg/hr` : 'Not needed'} sub={plant.steam ? 'boiler capacity' : 'no steam users'} />
        <Stat icon={Wind} label="Compressed air" value={`${num(plant.air)} CFM`} sub="oil-free" />
        <Stat icon={Droplets} label="Water" value={`${plant.water} KLD`} sub={`PW ${num(plant.pwLph)} L/hr${plant.wfiLph ? ` · WFI ${num(plant.wfiLph)} L/hr` : ''}`} />
        <Stat icon={Users} label="Staff (approx.)" value={num(staff.total)} sub={`${num(staff.operators)} operators · ${num(staff.qa)} QA/QC`} />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
              <th className="px-3 py-2 font-medium">Segment</th>
              <th className="px-3 py-2 text-right font-medium">Machines</th>
              <th className="px-3 py-2 text-right font-medium">HVAC</th>
              <th className="px-3 py-2 text-right font-medium">Steam</th>
              <th className="px-3 py-2 text-right font-medium">Air</th>
              <th className="px-3 py-2 text-right font-medium">Water</th>
              <th className="px-3 py-2 text-right font-medium">Units / month</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((sg) => (
              <tr key={sg.key} className="border-b border-slate-100">
                <td className="px-3 py-2.5">
                  <p className="font-medium text-slate-800">{sg.label}</p>
                  <p className="text-xs text-slate-500">{num(sg.machineCount)} machines · {num(sg.area)} sq ft{sg.sterile ? ' sterile' : ''} · {kw(sg.connectedKw)} total</p>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-700">{kw(sg.machineKw)}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-700">{num(sg.tr)} TR<span className="block text-xs text-slate-500">{kw(sg.hvacKw)}</span></td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-700">{sg.steam ? `${num(sg.steam)} kg/hr` : '—'}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-700">{num(sg.air)} CFM</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-700">{sg.water} KLD</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-700">{num(sg.monthlyKwh)}</td>
              </tr>
            ))}
            <tr className="border-b border-slate-100">
              <td className="px-3 py-2.5">
                <button type="button" onClick={() => setShowCommon(!showCommon)} aria-expanded={showCommon} className="flex items-center gap-1 text-left font-medium text-slate-800">
                  Common plant utilities
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform print:hidden ${showCommon ? 'rotate-180' : ''}`} />
                </button>
                <p className="text-xs text-slate-500">water systems, compressors, boiler, QC lab, stores, offices, lighting</p>
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-700" colSpan={6}>{kw(power.commonKw)}</td>
            </tr>
            {power.commonLoads.map((l) => (
              <tr key={l.name} className={`${showCommon ? '' : 'hidden'} border-b border-slate-50 text-xs print:table-row`}>
                <td className="py-1.5 pl-6 pr-3 text-slate-600">{l.name}</td>
                <td className="px-3 py-1.5 text-right text-slate-600" colSpan={6}>{kw(l.kw)}</td>
              </tr>
            ))}
            <tr className="bg-slate-50 font-semibold text-slate-900">
              <td className="px-3 py-2.5">Whole plant</td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right">{kw(power.connectedKw)}<span className="block text-xs font-normal text-slate-500">connected</span></td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right">{num(plant.tr)} TR</td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right">{plant.steam ? `${num(plant.steam)} kg/hr` : '—'}</td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right">{num(plant.air)} CFM</td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right">{plant.water} KLD</td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right">{num(power.monthlyKwh)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Whole-plant steam includes WFI and pure steam; air includes 20% for leaks; water includes staff use ({plant.domesticKld} KLD) and cooling tower make-up ({plant.coolingKld} KLD).
        HVAC runs 24 hours; machines run {result.shifts} shift{result.shifts > 1 ? 's' : ''} a day, 26 days a month.
      </p>
    </section>
  );
};

const Card = ({ title, step, children }) => (
  <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-800">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{step}</span>
      {title}
    </h2>
    {children}
  </section>
);

const CostTable = ({ title, icon: Icon, rows, total, summary, open: startOpen = false }) => {
  const [open, setOpen] = useState(startOpen);
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm print:break-inside-avoid print:border-slate-300 print:shadow-none">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 p-4 text-left">
        <span>
          <span className="flex items-center gap-2 font-semibold text-slate-800"><Icon className="h-5 w-5 text-blue-600" />{title}</span>
          {summary && <span className="mt-0.5 block pl-7 text-xs font-normal text-slate-500">{summary}</span>}
        </span>
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          {formatRange(total)}
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform print:hidden ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      <div className={`${open ? 'block' : 'hidden'} overflow-x-auto border-t border-slate-100 print:block`}>
        <table className="w-full min-w-[520px] text-sm">
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-2.5">
                  <p className="font-medium text-slate-800">{r.name}</p>
                  {r.basis && <p className="text-xs text-slate-500">{r.basis}</p>}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right text-slate-700">{formatRange(r.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

// What each product block costs, with its share of the common plant
const SegmentCosts = ({ result }) => (
  <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 print:break-inside-avoid print:shadow-none">
    <h2 className="flex items-center gap-2 font-semibold text-slate-800"><Factory className="h-5 w-5 text-blue-600" />Plant cost by segment</h2>
    <p className="mt-1 text-xs text-slate-500">
      Each block&apos;s machines plus its share of the building (by floor area), HVAC (by air volume) and utilities (by power).
      QC lab, installation, validation, contingency, land and GST are shared in the same proportion, so the rows add up to the total.
    </p>
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
            <th className="px-3 py-2 font-medium">Segment</th>
            <th className="px-3 py-2 text-right font-medium">Machines</th>
            <th className="px-3 py-2 text-right font-medium">Building</th>
            <th className="px-3 py-2 text-right font-medium">HVAC</th>
            <th className="px-3 py-2 text-right font-medium">Utilities</th>
            <th className="px-3 py-2 text-right font-medium">Shared + GST</th>
            <th className="px-3 py-2 text-right font-medium">Plant cost</th>
          </tr>
        </thead>
        <tbody>
          {result.segments.map((sg) => (
            <tr key={sg.key} className="border-b border-slate-100 align-top">
              <td className="px-3 py-2.5">
                <p className="font-medium text-slate-800">{sg.label}</p>
                <p className="text-xs text-slate-500">
                  {num(sg.daily)} {sg.unit}/day · ₹{num(Math.round(sg.perUnitDay[0]))}–{num(Math.round(sg.perUnitDay[1]))} per {sg.unit.replace(/s$/, '')}/day of capacity
                </p>
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-700">{formatRange(sg.cost)}</td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-700">{formatRange(sg.buildingCost)}</td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-700">{formatRange(sg.hvacCost)}</td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-700">{formatRange(sg.utilitiesCost)}</td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-700">{formatRange(sg.sharedCost)}</td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-slate-900">{formatRange(sg.plantCost)}</td>
            </tr>
          ))}
          <tr className="bg-slate-50 font-semibold text-slate-900">
            <td className="px-3 py-2.5">Whole project (incl. GST)</td>
            <td className="px-3 py-2.5" colSpan={5} />
            <td className="whitespace-nowrap px-3 py-2.5 text-right">{formatRange(result.total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
);

const ProjectCostCalculator = () => {
  const [params, setParams] = useSearchParams();
  const [state, setState] = useState(() => readState(params));
  const [openSection, setOpenSection] = useState(null);
  const [reportVisible, setReportVisible] = useState(false);

  // Phones show the inputs first; a small pill keeps the total in sight until the report scrolls into view
  useEffect(() => {
    const el = document.getElementById('cost-report');
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setReportVisible(e.isIntersecting), { rootMargin: '0px 0px -40% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Keep the address in sync, so the estimate can be bookmarked or shared
  useEffect(() => {
    const next = toParams(state).toString();
    if (next !== params.toString()) setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const result = useMemo(() => calculate(state), [state]);
  const groupTotal = (key) => result?.groups.find((g) => g.key === key)?.total || [0, 0];
  const set = (patch) => setState((s) => ({ ...s, ...patch }));
  const setSection = (k, patch) => setState((s) => ({ ...s, sections: { ...s.sections, [k]: { ...s.sections[k], ...patch } } }));
  const reset = () => setState(readState(new URLSearchParams()));

  const selected = Object.keys(SECTIONS).filter((k) => state.sections[k].on);
  const mid = (r) => (r[0] + r[1]) / 2;
  const midTotal = result ? result.groups.reduce((a, g) => a + mid(g.total), 0) : 0;

  const summaryText = () => {
    if (!result) return '';
    const forms = selected.map((k) => `${SECTIONS[k].label}: ${num(state.sections[k].daily)} ${SECTIONS[k].unit}/day`).join('\n');
    return [
      'Hello, I used the Pharma Project Cost Calculator on foodpharmamachinery.com.',
      '',
      forms,
      `Automation: ${TIERS[result.tier].label} | ${result.compliance.short} | ${result.shifts} shift(s)`,
      `Estimated project cost: ${formatRange(result.total)} (incl. GST)`,
      `Machinery: ${formatRange(groupTotal('machinery'))} | HVAC plant: ${formatRange(groupTotal('hvac'))}`,
      `Power: ${num(result.power.connectedKw)} kW connected, ${num(result.power.transformer)} kVA transformer, DG ${num(result.power.dgSet)} kVA`,
      '',
      'Please send me a detailed quotation.',
      `https://www.foodpharmamachinery.com/project-cost-calculator${params.toString() ? `?${params}` : ''}`, // this calculation
    ].join('\n');
  };

  const machinesBySection = useMemo(() => {
    if (!result) return [];
    return selected.map((k) => {
      const rows = result.machines.filter((l) => l.section === k);
      const total = rows.reduce((a, l) => [a[0] + l.total[0], a[1] + l.total[1]], [0, 0]);
      return { key: k, label: SECTIONS[k].label, unit: SECTIONS[k].unit, rows, total };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #cost-report, #cost-report * { visibility: visible !important; }
          #cost-report { position: absolute; left: 0; top: 0; width: 100%; padding: 0 12px; }
          @page { margin: 12mm; }
        }
      `}</style>

      {result && !reportVisible && (
        <button
          type="button"
          onClick={() => document.getElementById('cost-report')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="fixed bottom-[72px] left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-xl lg:hidden print:hidden"
        >
          <Calculator className="h-4 w-4" /> {formatRange(result.total)}
          <ChevronDown className="h-4 w-4" />
        </button>
      )}

      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-800 to-blue-900 px-4 py-8 text-white sm:py-10">
        <div className="mx-auto max-w-7xl">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-100">
            <Calculator className="h-3.5 w-3.5" /> Free planning tool
          </p>
          <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">Pharma Project Cost Calculator</h1>
          <p className="mt-2 max-w-3xl text-sm text-blue-100 sm:text-base">
            Estimate any pharma project — tablets, capsules, softgels, powders, liquids, ointments, vials, ampoules,
            lyophilized products, eye drops and IV fluids: machines, power load, utilities, building and cleanrooms, HVAC, water systems, QC lab,
            validation and GST. Choose your products and capacity; the estimate updates instantly.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 pt-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* ── Inputs ── */}
        <div className="space-y-4 print:hidden">
          <Card step={1} title="What will you make?">
            <div className="space-y-4">
              {SECTION_GROUPS.map((g) => (
              <div key={g.key}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{g.label}</p>
              <div className="space-y-2">
              {Object.entries(SECTIONS).filter(([, sec]) => sec.group === g.key).map(([k, sec]) => {
                const Icon = ICONS[k];
                const s = state.sections[k];
                return (
                  <div key={k} className={`rounded-lg border p-3 transition-colors ${s.on ? 'border-blue-300 bg-blue-50/60' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                      <Toggle checked={s.on} onChange={(v) => setSection(k, { on: v })} aria-label={sec.label} />
                      <Icon className={`h-5 w-5 ${s.on ? 'text-blue-600' : 'text-slate-400'}`} aria-hidden="true" />
                      <button type="button" onClick={() => setSection(k, { on: !s.on })} className="font-medium text-slate-800">{sec.label}</button>
                    </div>
                    {s.on && (
                      <div className="mt-3 pl-7">
                        <label htmlFor={`daily-${k}`} className="text-xs font-medium text-slate-600">Output per day ({sec.unit})</label>
                        <input
                          id={`daily-${k}`}
                          type="number"
                          inputMode="numeric"
                          min={sec.min}
                          max={sec.max}
                          step={sec.step}
                          value={s.daily}
                          onChange={(e) => setSection(k, { daily: Math.max(0, Math.min(sec.max, Number(e.target.value) || 0)) })}
                          onBlur={() => s.daily < sec.min && setSection(k, { daily: sec.min })}
                          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                        <input
                          type="range"
                          aria-label={`${sec.label} output per day`}
                          min={sec.min}
                          max={sec.max}
                          step={sec.step}
                          value={Math.max(sec.min, s.daily)}
                          onChange={(e) => setSection(k, { daily: Number(e.target.value) })}
                          className="mt-2 w-full accent-blue-600"
                        />
                        <p className="text-xs text-slate-500">{num(s.daily)} {sec.unit}/day · {sec.hint}</p>
                        {k === 'tablets' && (
                          <Toggle className="mt-2" size="sm" checked={!!state.coating} onChange={(v) => set({ coating: v })} label="Film coating section" labelClassName="text-slate-700" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
              </div>
              ))}
            </div>
          </Card>

          <Card step={2} title="Automation level">
            <div className="grid gap-2">
              {Object.entries(TIERS).map(([k, t]) => (
                <label key={k} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${state.tier === k ? 'border-blue-300 bg-blue-50/60' : 'border-slate-200'}`}>
                  <input type="radio" name="tier" checked={state.tier === k} onChange={() => set({ tier: k })} className="mt-0.5 h-4 w-4 accent-blue-600" />
                  <span>
                    <span className="block font-medium text-slate-800">{t.label}</span>
                    <span className="block text-xs text-slate-500">{t.note}</span>
                  </span>
                </label>
              ))}
            </div>
          </Card>

          <Card step={3} title="GMP standard">
            <div className="grid gap-2">
              {Object.entries(COMPLIANCE).map(([k, c]) => (
                <label key={k} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${state.compliance === k ? 'border-blue-300 bg-blue-50/60' : 'border-slate-200'}`}>
                  <input type="radio" name="compliance" checked={state.compliance === k} onChange={() => set({ compliance: k })} className="h-4 w-4 accent-blue-600" />
                  <span className="font-medium text-slate-800">{c.label}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card step={4} title="Shifts, land & electricity">
            <div className="flex gap-2" role="radiogroup" aria-label="Shifts per day">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={state.shifts === n}
                  onClick={() => set({ shifts: n })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${state.shifts === n ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                >
                  {n} shift{n > 1 ? 's' : ''}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">More shifts = fewer machines for the same output.</p>
            <label htmlFor="land" className="mt-4 block text-sm font-medium text-slate-700">Land cost (₹ lakh, optional)</label>
            <input
              id="land"
              type="number"
              inputMode="decimal"
              min={0}
              value={state.landCost || ''}
              placeholder="0 = you already have land"
              onChange={(e) => set({ landCost: Math.max(0, Math.min(100000, Number(e.target.value) || 0)) })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <label htmlFor="tariff" className="mt-4 block text-sm font-medium text-slate-700">Electricity rate (₹ per unit)</label>
            <input
              id="tariff"
              type="number"
              inputMode="decimal"
              min={1}
              max={30}
              step={0.1}
              value={state.tariff}
              onChange={(e) => set({ tariff: Math.max(0, Math.min(30, Number(e.target.value) || 0)) })}
              onBlur={() => !(state.tariff > 0) && set({ tariff: DEFAULT_TARIFF })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">Industrial rate in your state; ₹{DEFAULT_TARIFF} is a typical average.</p>
          </Card>

          <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
            <RotateCcw className="h-4 w-4" /> Start again
          </button>
        </div>

        {/* ── Results ── */}
        <div id="cost-report" className="min-w-0 scroll-mt-28 space-y-4 xl:scroll-mt-[300px]">
          {!result ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              <Factory className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              Select at least one product type to see the estimate.
            </div>
          ) : (
            <>
              <p className="hidden text-lg font-bold text-slate-900 print:block">Pharma project cost estimate — foodpharmamachinery.com</p>

              <section className="rounded-xl bg-gradient-to-br from-blue-700 to-slate-800 p-5 text-white shadow-lg sm:p-6 print:bg-none print:text-slate-900 print:shadow-none">
                <p className="text-sm font-medium text-blue-100 print:text-slate-600">Estimated total project cost (incl. 18% GST)</p>
                <p className="mt-1 text-3xl font-bold sm:text-4xl" aria-live="polite">{formatRange(result.total)}</p>
                <p className="mt-1 text-sm text-blue-100 print:text-slate-600">
                  {formatRange(result.totalExGst)} before GST · GST {formatRange(result.gst)} (input tax credit may apply)
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div className="rounded-lg bg-white/10 p-3 print:border print:border-slate-200">
                    <p className="flex items-center gap-1 text-blue-100 print:text-slate-500"><Wrench className="h-3.5 w-3.5" />Machines</p>
                    <p className="text-lg font-semibold">{result.machineCount}</p>
                  </div>
                  <div className="rounded-lg bg-white/10 p-3 print:border print:border-slate-200">
                    <p className="flex items-center gap-1 text-blue-100 print:text-slate-500"><Ruler className="h-3.5 w-3.5" />Built-up area</p>
                    <p className="text-lg font-semibold">{num(result.area.builtUp)} sq ft</p>
                  </div>
                  <div className="rounded-lg bg-white/10 p-3 print:border print:border-slate-200">
                    <p className="flex items-center gap-1 text-blue-100 print:text-slate-500"><Factory className="h-3.5 w-3.5" />Plot needed</p>
                    <p className="text-lg font-semibold">~{num(result.area.plot)} sq ft</p>
                  </div>
                  <div className="rounded-lg bg-white/10 p-3 print:border print:border-slate-200">
                    <p className="flex items-center gap-1 text-blue-100 print:text-slate-500"><Clock className="h-3.5 w-3.5" />Time to start</p>
                    <p className="text-lg font-semibold">{result.months[0]}–{result.months[1]} months</p>
                  </div>
                </div>
              </section>

              {/* Where the money goes */}
              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 print:break-inside-avoid">
                <h2 className="mb-3 font-semibold text-slate-800">Where the money goes</h2>
                <div className="flex h-4 overflow-hidden rounded-full bg-slate-100" role="img" aria-label="Cost breakdown">
                  {result.groups.map((g) => (
                    <div key={g.key} className={GROUP_COLORS[g.key]} style={{ width: `${(mid(g.total) / midTotal) * 100}%` }} title={g.label} />
                  ))}
                </div>
                <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  {result.groups.map((g) => (
                    <li key={g.key} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-slate-700">
                        <span className={`h-3 w-3 shrink-0 rounded-sm ${GROUP_COLORS[g.key]}`} />
                        {g.label}
                        <span className="text-xs text-slate-400">{Math.round((mid(g.total) / midTotal) * 100)}%</span>
                      </span>
                      <span className="whitespace-nowrap font-medium text-slate-800">{formatRange(g.total)}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Machines */}
              <section className="rounded-xl border border-slate-200 bg-white shadow-sm print:shadow-none">
                <div className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <h2 className="flex items-center gap-2 font-semibold text-slate-800"><Wrench className="h-5 w-5 text-blue-600" />Machine list &amp; cost</h2>
                  <span className="text-sm font-semibold text-slate-700">{formatRange(groupTotal('machinery'))}</span>
                </div>
                {machinesBySection.map((s) => {
                  const open = openSection === null ? machinesBySection.length === 1 || s.key === machinesBySection[0].key : openSection === s.key;
                  return (
                    <div key={s.key} className="border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setOpenSection(open ? '' : s.key)}
                        aria-expanded={open}
                        className="flex w-full items-center justify-between gap-3 bg-slate-50 px-4 py-2.5 text-left text-sm print:bg-white"
                      >
                        <span className="font-semibold text-slate-700">{s.label} · {num(state.sections[s.key].daily)} {s.unit}/day</span>
                        <span className="flex items-center gap-2 font-medium text-slate-700">
                          {formatRange(s.total)}
                          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform print:hidden ${open ? 'rotate-180' : ''}`} />
                        </span>
                      </button>
                      <div className={`${open ? 'block' : 'hidden'} overflow-x-auto print:block`}>
                        <table className="w-full min-w-[660px] text-sm">
                          <thead>
                            <tr className="text-left text-xs uppercase text-slate-500">
                              <th className="px-4 py-2 font-medium">Machine</th>
                              <th className="px-4 py-2 text-center font-medium">Qty</th>
                              <th className="px-4 py-2 text-right font-medium">Power</th>
                              <th className="px-4 py-2 text-right font-medium">Price each</th>
                              <th className="px-4 py-2 text-right font-medium">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {s.rows.map((l, i) => (
                              <tr key={i} className="border-t border-slate-50">
                                <td className="px-4 py-2.5">
                                  <p className="font-medium text-slate-800">{l.name}</p>
                                  <p className="text-xs text-slate-500">{l.model}{l.cap ? ` · ${capText(l.cap, s.unit, l.perDay)}` : ''}</p>
                                </td>
                                <td className="px-4 py-2.5 text-center text-slate-700">{l.qty}</td>
                                <td className="whitespace-nowrap px-4 py-2.5 text-right text-slate-600">{kw(l.kw)}</td>
                                <td className="whitespace-nowrap px-4 py-2.5 text-right text-slate-600">{formatRange(l.unit)}</td>
                                <td className="whitespace-nowrap px-4 py-2.5 text-right font-medium text-slate-800">{formatRange(l.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </section>

              <SegmentCosts result={result} />

              <UtilitiesPanel result={result} />

              <CostTable title="Building & cleanrooms" icon={Factory} rows={result.building} total={groupTotal('building')} />
              <CostTable
                title="HVAC plant"
                icon={Thermometer}
                rows={result.hvacPlant}
                total={groupTotal('hvac')}
                summary={`${num(result.hvacSummary.cfm)} CFM · ${result.hvacSummary.ahus} AHUs · ${num(result.hvacSummary.tr)} TR · chillers ${result.hvacSummary.chillers} × ${result.hvacSummary.chillerTr} TR · ${result.hvacSummary.hepa} HEPA filters`}
              />
              <CostTable title="Utilities & power equipment" icon={Zap} rows={result.utilities} total={groupTotal('utilities')} />
              <CostTable title="QC & micro labs" icon={Beaker} rows={result.qc} total={groupTotal('qc')} />
              <CostTable title="Installation, validation & pre-operative" icon={ShieldCheck} rows={result.project} total={groupTotal('project')} />

              {/* Actions */}
              <div className="flex flex-wrap gap-2 print:hidden">
                <Link to="/bulk-quote" className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-orange-600">
                  <FileText className="h-4 w-4" /> Get exact quotation
                </Link>
                <a
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(summaryText())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-green-700"
                >
                  <MessageCircle className="h-4 w-4" /> Discuss on WhatsApp
                </a>
                <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <Printer className="h-4 w-4" /> Print / save PDF
                </button>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 sm:text-sm">
                <p className="flex items-center gap-1.5 font-semibold"><Info className="h-4 w-4" /> How this estimate works</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Indicative 2026 Indian prices for new GMP-grade equipment and construction. Actual quotes depend on make, specifications, location and timing.</li>
                  <li>Machine numbers assume {HOURS_PER_SHIFT}-hour shifts at about {Math.round(EFFICIENCY * 100)}% of rated speed; tablet capacity assumes a 300 mg average tablet.</li>
                  <li>Power, HVAC, steam, air and water are planning estimates to size the transformer, DG set, boiler and water systems; your consultant will finalise them.</li>
                  <li>Not included: land (unless entered), working capital, raw materials, salaries and product registration fees.</li>
                  <li>Nothing you enter here is sent to us. Use &quot;Get exact quotation&quot; or WhatsApp for a detailed project report.</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCostCalculator;
