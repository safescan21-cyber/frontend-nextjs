'use client';
// "Machines available for <place>": the shop machines on the state, industrial area and pharma hub
// pages (the page's server part picks them: machinesFor in components/seo/machineryHubs.js)
import { Link } from '../../shell/router';
import MachineCards from './MachineCards';

export default function AvailableMachines({ place, machines = [] }) {
  if (!machines.length) return null;
  return (
    <>
      <h2 className="mt-10 text-xl font-bold text-slate-900">Machines available for {place}</h2>
      <p className="mt-1 text-sm text-slate-500">In our shop now, delivered from Haridwar with installation support. Taxes and freight are quoted separately.</p>
      <MachineCards machines={machines} />
      <Link to="/products" className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline">All products by category &rarr;</Link>
    </>
  );
}
