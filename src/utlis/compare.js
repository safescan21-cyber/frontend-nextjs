// Machines picked for side-by-side comparison (/compare), kept on this device.
//   const ids = useCompare();  toggleCompare(id);  clearCompare();
import { useSyncExternalStore } from 'react';

export const MAX_COMPARE = 3;
const KEY = 'compare_v1';
const EVENT = 'compare-change';
const NONE = [];

let cache = null;
const read = () => {
  if (cache) return cache;
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    cache = Array.isArray(list) ? list.filter((id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id)).slice(0, MAX_COMPARE) : NONE;
  } catch {
    cache = NONE;
  }
  return cache;
};
const write = (ids) => {
  cache = ids;
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* storage blocked: keeps working for this page */ }
  window.dispatchEvent(new Event(EVENT));
};

const subscribe = (cb) => {
  const onStorage = (e) => { if (e.key === KEY) { cache = null; cb(); } };
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', onStorage); // other open tabs
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', onStorage);
  };
};

// Empty on the server and in the first render, so the HTML matches
export const useCompare = () => useSyncExternalStore(subscribe, read, () => NONE);

// Adds or removes a machine; returns false when the list is already full
export const toggleCompare = (id) => {
  const ids = read();
  if (ids.includes(id)) { write(ids.filter((x) => x !== id)); return true; }
  if (ids.length >= MAX_COMPARE) return false;
  write([...ids, id]);
  return true;
};

export const removeFromCompare = (id) => write(read().filter((x) => x !== id));
export const clearCompare = () => write([]);
