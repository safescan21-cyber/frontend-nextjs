// Product technical documents (served by the API: Backend/src/documents)
import getBaseUrl from './baseURL';

export const DOC_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.pptx,.dwg,.dxf,.step,.stp,.zip,.png,.jpg,.jpeg';
export const MAX_DOC_MB = 25;
export const MAX_DOCS = 20;

const LABELS = {
  pdf: 'PDF', doc: 'Word', docx: 'Word', xls: 'Excel', xlsx: 'Excel', pptx: 'PowerPoint',
  dwg: 'AutoCAD', dxf: 'DXF drawing', step: 'STEP 3D', stp: 'STEP 3D', zip: 'ZIP', png: 'Image', jpg: 'Image', jpeg: 'Image',
};
const READABLE = new Set(['pdf', 'png', 'jpg', 'jpeg']); // open in the browser

export const docType = (d) => String(d?.type || d?.file || '').toLowerCase().split('.').pop();
export const docLabel = (d) => LABELS[docType(d)] || 'File';
export const canRead = (d) => READABLE.has(docType(d));

export const docUrl = (d, { download = false } = {}) => {
  if (!d || !/^[a-f0-9]{32}\.[a-z]{3,4}$/.test(d.file || '')) return null;
  const q = new URLSearchParams({ name: d.name || 'document' });
  if (download) q.set('download', '1');
  return `${getBaseUrl()}/api/documents/${d.file}?${q}`;
};

export const formatSize = (bytes) => {
  const n = Number(bytes) || 0;
  if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return n ? `${n} B` : '';
};
