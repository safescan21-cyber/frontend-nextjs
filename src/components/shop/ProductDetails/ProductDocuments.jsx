import React from 'react';
import { FileText, FileSpreadsheet, FileImage, FileArchive, Eye, Download } from 'lucide-react';
import { docType, docLabel, docUrl, canRead, formatSize } from '../../../utlis/documents';

const ICON = { xls: FileSpreadsheet, xlsx: FileSpreadsheet, png: FileImage, jpg: FileImage, jpeg: FileImage, zip: FileArchive };

// Technical documents attached by the admin: PDFs and images open in the
// browser to read; everything can be downloaded.
const ProductDocuments = ({ documents }) => (
  <div>
    <h3 className="mb-1 text-lg font-bold text-gray-900">Technical Documents</h3>
    <p className="mb-4 text-sm text-gray-600">Datasheets, manuals, drawings and certificates for this machine.</p>
    <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
      {documents.map((d) => {
        const Icon = ICON[docType(d)] || FileText;
        const readUrl = canRead(d) ? docUrl(d) : null;
        const downloadUrl = docUrl(d, { download: true });
        if (!downloadUrl) return null;
        return (
          <li key={d.file} className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block break-words font-medium text-gray-900">{d.name}</span>
              <span className="block text-xs text-gray-500">{docLabel(d)}{d.size ? ` · ${formatSize(d.size)}` : ''}</span>
            </span>
            <span className="flex gap-2">
              {readUrl && (
                <a
                  href={readUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" aria-hidden="true" /> Read
                </a>
              )}
              <a
                href={downloadUrl}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
                aria-label={`Download ${d.name}`}
              >
                <Download className="h-4 w-4" aria-hidden="true" /> Download
              </a>
            </span>
          </li>
        );
      })}
    </ul>
  </div>
);

export default ProductDocuments;
