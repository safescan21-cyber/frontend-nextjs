import React, { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Calculator, Pill, Package, Droplets, Beaker, Syringe, Factory, ShieldCheck, Clock,
  Printer, MessageCircle, FileText, RotateCcw, ChevronDown, Info, Ruler, Wrench,
} from 'lucide-react';
import { SECTIONS, TIERS, COMPLIANCE, calculate, formatLakh, formatRange, EFFICIENCY, HOURS_PER_SHIFT } from './costModel';

// Public "Pharma Project Cost Calculator". Runs entirely in the browser:
// the visitor's choices live in the page address (so a link can be shared)
// and nothing is sent to our server.

const ICONS = { tablets: Pill, capsules: Package, liquids: Droplets, ointments: Beaker, injectables: Syringe };
const WHATSAPP = '918700792607';
const GROUP_COLORS = {
  machinery: 'bg-blue-600', building: 'bg-amber-500', utilities: 'bg-teal-500', qc: 'bg-violet-500',
  project: 'bg-rose-500', contingency: 'bg-slate-400', land: 'bg-lime-600',
};
const DEFAULTS = { forms: 'tablets', tier: 'auto', comp: 'schedM', shifts: 1, coating: 1, land: 0 };

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
  return { sections, tier, compliance, shifts, coating, landCost };
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
  return p;
};

const num = (n) => Number(n).toLocaleString('en-IN');
const capText = (cap, unit) => (cap ? `${num(cap)} ${unit}/hr` : '');

const Card = ({ title, step, children }) => (
  <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-800">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{step}</span>
      {title}
    </h2>
    {children}
  </section>
);

const CostTable = ({ title, icon: Icon, rows, total, open: startOpen = false }) => {
  const [open, setOpen] = useState(startOpen);
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm print:break-inside-avoid print:border-slate-300 print:shadow-none">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 p-4 text-left">
        <span className="flex items-center gap-2 font-semibold text-slate-800"><Icon className="h-5 w-5 text-blue-600" />{title}</span>
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
      `Machinery: ${formatRange(result.groups[0].total)}`,
      '',
      'Please send me a detailed quotation.',
      typeof window !== 'undefined' ? window.location.href : '',
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
            Estimate the cost of a new pharma plant: machines, building and cleanrooms, HVAC, water systems, QC lab,
            validation and GST. Choose your products and capacity; the estimate updates instantly.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 pt-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* ── Inputs ── */}
        <div className="space-y-4 print:hidden">
          <Card step={1} title="What will you make?">
            <div className="space-y-2">
              {Object.entries(SECTIONS).map(([k, sec]) => {
                const Icon = ICONS[k];
                const s = state.sections[k];
                return (
                  <div key={k} className={`rounded-lg border p-3 transition-colors ${s.on ? 'border-blue-300 bg-blue-50/60' : 'border-slate-200'}`}>
                    <label className="flex cursor-pointer items-center gap-3">
                      <input type="checkbox" checked={s.on} onChange={(e) => setSection(k, { on: e.target.checked })} className="h-4 w-4 accent-blue-600" />
                      <Icon className={`h-5 w-5 ${s.on ? 'text-blue-600' : 'text-slate-400'}`} aria-hidden="true" />
                      <span className="font-medium text-slate-800">{sec.label}</span>
                    </label>
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
                          <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={state.coating} onChange={(e) => set({ coating: e.target.checked })} className="h-4 w-4 accent-blue-600" />
                            Film coating section
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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

          <Card step={4} title="Working shifts & land">
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
                  <span className="text-sm font-semibold text-slate-700">{formatRange(result.groups[0].total)}</span>
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
                        <table className="w-full min-w-[600px] text-sm">
                          <thead>
                            <tr className="text-left text-xs uppercase text-slate-500">
                              <th className="px-4 py-2 font-medium">Machine</th>
                              <th className="px-4 py-2 text-center font-medium">Qty</th>
                              <th className="px-4 py-2 text-right font-medium">Price each</th>
                              <th className="px-4 py-2 text-right font-medium">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {s.rows.map((l, i) => (
                              <tr key={i} className="border-t border-slate-50">
                                <td className="px-4 py-2.5">
                                  <p className="font-medium text-slate-800">{l.name}</p>
                                  <p className="text-xs text-slate-500">{l.model}{l.cap ? ` · ${capText(l.cap, s.unit)}` : ''}</p>
                                </td>
                                <td className="px-4 py-2.5 text-center text-slate-700">{l.qty}</td>
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

              <CostTable title="Building, cleanrooms & HVAC" icon={Factory} rows={result.building} total={result.groups[1].total} />
              <CostTable title="Utilities" icon={Droplets} rows={result.utilities} total={result.groups[2].total} />
              <CostTable title="QC & micro labs" icon={Beaker} rows={result.qc} total={result.groups[3].total} />
              <CostTable title="Installation, validation & pre-operative" icon={ShieldCheck} rows={result.project} total={result.groups[4].total} />

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
