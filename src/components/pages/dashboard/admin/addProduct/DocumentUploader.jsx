import React, { useState } from 'react';
import axios from 'axios';
import { FileText, X, ExternalLink, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import getBaseUrl from '../../../../../utlis/baseURL';
import { DOC_ACCEPT, MAX_DOC_MB, MAX_DOCS, docLabel, docUrl, formatSize, canRead } from '../../../../../utlis/documents';

// Technical documents for a product (datasheets, manuals, drawings, certificates).
// Used by Add Product and Update Product. Files upload one by one to the API;
// the product keeps the list { name, file, size, type } in the order shown here.
const DocumentUploader = ({ documents, setDocuments, onBusyChange }) => {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  const setBusyBoth = (v) => { setBusy(v); onBusyChange?.(v); };

  const upload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setError('');
    const room = MAX_DOCS - documents.length;
    if (files.length > room) {
      setError(`A product can have up to ${MAX_DOCS} documents. You can add ${room} more.`);
      return;
    }
    const tooBig = files.find((f) => f.size > MAX_DOC_MB * 1024 * 1024);
    if (tooBig) {
      setError(`"${tooBig.name}" is larger than ${MAX_DOC_MB} MB.`);
      return;
    }
    setBusyBoth(true);
    let token = null;
    try { token = localStorage.getItem('token'); } catch { /* storage blocked */ }
    try {
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData();
        fd.append('document', files[i]);
        setProgress(`Uploading ${i + 1} of ${files.length}: ${files[i].name}`);
        const res = await axios.post(`${getBaseUrl()}/api/upload/document`, fd, {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          onUploadProgress: (p) => p.total && setProgress(`Uploading ${i + 1} of ${files.length}: ${files[i].name} (${Math.round((p.loaded / p.total) * 100)}%)`),
        });
        setDocuments((prev) => [...prev, res.data]); // show each as soon as it's saved
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setProgress('');
      setBusyBoth(false);
    }
  };

  const rename = (i, name) => setDocuments(documents.map((d, j) => (j === i ? { ...d, name: name.slice(0, 120) } : d)));
  const remove = (i) => setDocuments(documents.filter((_, j) => j !== i));
  const move = (i, dir) => {
    const next = [...documents];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    setDocuments(next);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Technical documents <span className="text-xs text-gray-400">(optional — datasheets, manuals, drawings, certificates)</span>
      </label>
      <input
        type="file"
        accept={DOC_ACCEPT}
        multiple
        onChange={upload}
        disabled={busy || documents.length >= MAX_DOCS}
        aria-label="Attach technical documents"
        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
      />
      {busy && <p className="mt-2 flex items-center gap-1.5 text-sm text-blue-600"><Loader2 className="h-4 w-4 animate-spin" />{progress}</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {documents.length > 0 && (
        <ul className="mt-3 divide-y divide-gray-100 rounded-lg border border-gray-200">
          {documents.map((d, i) => (
            <li key={d.file} className="flex flex-wrap items-center gap-2 p-2.5">
              <FileText className="h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
              <input
                value={d.name}
                onChange={(e) => rename(i, e.target.value)}
                onBlur={(e) => !e.target.value.trim() && rename(i, 'Document')}
                aria-label="Document name shown to customers"
                className="min-w-0 flex-1 rounded border border-gray-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
              />
              <span className="text-xs text-gray-500">{docLabel(d)}{d.size ? ` · ${formatSize(d.size)}` : ''}</span>
              <a href={docUrl(d, { download: !canRead(d) })} target="_blank" rel="noopener noreferrer" title="Open" aria-label={`Open ${d.name}`} className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600">
                <ExternalLink className="h-4 w-4" />
              </a>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === documents.length - 1} aria-label="Move down" className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
              <button type="button" onClick={() => remove(i)} aria-label={`Remove ${d.name}`} className="rounded-full bg-red-600 p-1 text-white hover:bg-red-700"><X size={14} /></button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-1 text-xs text-gray-400">
        PDF, Word, Excel, PowerPoint, AutoCAD (DWG/DXF), STEP, ZIP or images · up to {MAX_DOC_MB} MB each · {MAX_DOCS} per product.
        The name you type is what customers see. PDFs and images open in the browser; other files download.
      </p>
    </div>
  );
};

export default DocumentUploader;
