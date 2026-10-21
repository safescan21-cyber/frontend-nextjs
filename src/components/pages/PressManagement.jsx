import Toggle from '../ui/Toggle';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import getBaseUrl from '../../utlis/baseURL';
import {
  Plus, Edit, Trash2, Eye, Image, Video, FileText,
  X, Calendar, User, ChevronLeft, ChevronRight, Newspaper,
} from 'lucide-react';

// ─── API base ─────────────────────────────────────────────────
const API_BASE = getBaseUrl() + '/api/press';

// ─── Axios instance that sends the login token ───────────────
const api = axios.create({ withCredentials: true });
api.interceptors.request.use((config) => {
  let token = null;
  try {
    token = localStorage.getItem('token');
  } catch (e) {
    token = null;
  }
  if (token && token !== 'null' && token !== 'undefined') {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const PAGE_SIZE = 10;
const MAX_FILES = 10;
const MAX_FILE_MB = 50;
const ALLOWED_EXT = /\.(jpe?g|png|gif|mp4|mov|avi|pdf|docx?)$/i;

const EMPTY_FORM = {
  title: '',
  summary: '',
  content: '',
  publishedDate: new Date().toISOString().slice(0, 10),
  isActive: true,
};

const errorMessage = (err, fallback) => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.status === 401) return 'Your session has expired. Please log in again.';
  if (err?.response?.status === 403) return 'Admin access is required.';
  if (err && !err.response) return 'Could not reach the server. Check your connection.';
  return fallback;
};

const MediaIcon = ({ type, size = 16 }) => {
  if (type === 'video') return <Video size={size} className="text-purple-600" />;
  if (type === 'document') return <FileText size={size} className="text-orange-600" />;
  return <Image size={size} className="text-blue-600" />;
};

const formatDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

// ─── Component ───────────────────────────────────────────────
const PressManagement = () => {
  const [presses, setPresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0 });
  const [filterActive, setFilterActive] = useState(null); // null = all, true, false

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingPress, setViewingPress] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [notice, setNotice] = useState('');

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 4000);
  };

  // ── Load list ──
  const fetchPresses = useCallback(
    async (page = 1) => {
      setLoading(true);
      setListError('');
      try {
        const params = { page, limit: PAGE_SIZE };
        if (filterActive !== null) params.active = filterActive;
        const res = await api.get(API_BASE, { params });
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setPresses(list);
        // Never store undefined: the page reads pagination.total below
        setPagination((prev) => ({
          page,
          limit: PAGE_SIZE,
          total: Number.isFinite(res.data?.pagination?.total) ? res.data.pagination.total : list.length,
        }));
      } catch (err) {
        console.error('Load press error:', err);
        setPresses([]);
        setListError(errorMessage(err, 'Could not load press releases.'));
      } finally {
        setLoading(false);
      }
    },
    [filterActive]
  );

  useEffect(() => {
    fetchPresses(1);
  }, [fetchPresses]);

  // ── Form helpers ──
  const openCreate = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM, publishedDate: new Date().toISOString().slice(0, 10) });
    setMediaFiles([]);
    setExistingMedia([]);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (press) => {
    setEditingId(press._id);
    setFormData({
      title: press.title || '',
      summary: press.summary || '',
      content: press.content || '',
      publishedDate: press.publishedDate ? new Date(press.publishedDate).toISOString().slice(0, 10) : '',
      isActive: press.isActive !== false,
    });
    setMediaFiles([]);
    setExistingMedia(Array.isArray(press.media) ? press.media : []);
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    if (formLoading) return;
    setShowForm(false);
    setEditingId(null);
    setFormError('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    const problems = [];
    const valid = picked.filter((f) => {
      if (!ALLOWED_EXT.test(f.name)) {
        problems.push(`"${f.name}" is not an allowed file type.`);
        return false;
      }
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        problems.push(`"${f.name}" is larger than ${MAX_FILE_MB} MB.`);
        return false;
      }
      return true;
    });
    const merged = [...mediaFiles, ...valid];
    if (merged.length > MAX_FILES) problems.push(`You can upload up to ${MAX_FILES} files.`);
    setMediaFiles(merged.slice(0, MAX_FILES));
    setFormError(problems.join(' '));
  };

  const removeNewFile = (idx) => setMediaFiles((files) => files.filter((_, i) => i !== idx));

  // ── Save (create / update) ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formLoading) return;
    if (!formData.title.trim() || !formData.content.trim()) {
      setFormError('Title and content are required.');
      return;
    }
    setFormLoading(true);
    setFormError('');
    try {
      const body = new FormData();
      body.append('title', formData.title.trim());
      body.append('summary', formData.summary.trim());
      body.append('content', formData.content.trim());
      if (formData.publishedDate) body.append('publishedDate', formData.publishedDate);
      body.append('isActive', String(formData.isActive));
      mediaFiles.forEach((f) => body.append('media', f));

      const config = { timeout: 5 * 60 * 1000 };
      if (editingId) await api.put(`${API_BASE}/${editingId}`, body, config);
      else await api.post(API_BASE, body, config);

      setShowForm(false);
      setEditingId(null);
      showNotice(editingId ? 'Press release updated.' : 'Press release published.');
      await fetchPresses(editingId ? pagination.page : 1);
    } catch (err) {
      console.error('Save press error:', err);
      setFormError(errorMessage(err, 'Could not save the press release.'));
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete ──
  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await api.delete(`${API_BASE}/${deleteTarget._id}`);
      setDeleteTarget(null);
      showNotice('Press release deleted.');
      // If we deleted the last item on this page, go back one page
      const page = presses.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      await fetchPresses(page);
    } catch (err) {
      console.error('Delete press error:', err);
      setDeleteTarget(null);
      setListError(errorMessage(err, 'Could not delete the press release.'));
    } finally {
      setDeleting(false);
    }
  };

  const total = pagination.total || 0;
  const limit = pagination.limit || PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <Newspaper size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Press Releases</h1>
            <p className="text-sm text-gray-500">
              {total} total release{total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> New Press Release
        </button>
      </div>

      {notice && (
        <div role="status" className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {notice}
        </div>
      )}
      {listError && (
        <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {listError}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-4" role="tablist" aria-label="Filter by status">
        {[
          { label: 'All', value: null },
          { label: 'Active', value: true },
          { label: 'Inactive', value: false },
        ].map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => setFilterActive(opt.value)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              filterActive === opt.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading…</div>
        ) : presses.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            {listError ? 'Nothing to show.' : 'No press releases found.'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {presses.map((p) => (
              <li key={p._id} className="p-4 flex flex-wrap items-center gap-4 hover:bg-gray-50">
                <div className="flex-1 min-w-[220px]">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-gray-900">{p.title}</h2>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full ${
                        p.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {p.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {p.summary && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{p.summary}</p>}
                  <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} /> {formatDate(p.publishedDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={13} /> {p.author?.name || 'Admin'}
                    </span>
                    <span className="flex items-center gap-1">
                      {(p.media || []).slice(0, 4).map((m, i) => (
                        <MediaIcon key={i} type={m.type} size={13} />
                      ))}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setViewingPress(p);
                      setShowView(true);
                    }}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                    aria-label={`View ${p.title}`}
                  >
                    <Eye size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                    aria-label={`Edit ${p.title}`}
                  >
                    <Edit size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(p)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                    aria-label={`Delete ${p.title}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-gray-500">
            Page {pagination.page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fetchPresses(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 border rounded-lg disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              type="button"
              onClick={() => fetchPresses(pagination.page + 1)}
              disabled={pagination.page * limit >= total || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 border rounded-lg disabled:opacity-40"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Create / Edit modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8"
            aria-label={editingId ? 'Edit press release' : 'New press release'}
          >
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Press Release' : 'New Press Release'}</h2>
              <button type="button" onClick={closeForm} className="p-1 rounded hover:bg-gray-100" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {formError && (
                <div role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {formError}
                </div>
              )}

              <div>
                <label htmlFor="pm-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="pm-title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Headline of the release"
                />
              </div>

              <div>
                <label htmlFor="pm-summary" className="block text-sm font-medium text-gray-700 mb-1">
                  Summary
                </label>
                <input
                  id="pm-summary"
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="One-line summary shown in lists"
                />
              </div>

              <div>
                <label htmlFor="pm-content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="pm-content"
                  name="content"
                  rows={7}
                  value={formData.content}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full text of the press release"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pm-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Published date
                  </label>
                  <input
                    id="pm-date"
                    type="date"
                    name="publishedDate"
                    value={formData.publishedDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Toggle className="sm:mt-6" tone="green" checked={!!formData.isActive} onChange={(v) => setFormData((f) => ({ ...f, isActive: v }))} label="Active" description="Visible on the website" />
              </div>

              {/* Media */}
              <div>
                <label htmlFor="pm-media" className="block text-sm font-medium text-gray-700 mb-1">
                  Media (images, videos, PDF / Word — up to {MAX_FILES} files, {MAX_FILE_MB} MB each)
                </label>
                <input
                  id="pm-media"
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.pdf,.doc,.docx"
                  onChange={handleFiles}
                  className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700"
                />

                {editingId && existingMedia.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">
                      Current media{mediaFiles.length > 0 ? ' (will be replaced by the new files below)' : ''}:
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {existingMedia.map((m, i) => (
                        <li
                          key={m.public_id || i}
                          className={`flex items-center gap-1 text-xs border rounded-lg px-2 py-1 bg-gray-50 ${
                            mediaFiles.length > 0 ? 'line-through opacity-60' : ''
                          }`}
                        >
                          <MediaIcon type={m.type} size={13} />
                          <span className="max-w-[160px] truncate">{m.caption || m.type}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {mediaFiles.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {mediaFiles.map((f, i) => (
                      <li key={`${f.name}-${i}`} className="flex items-center justify-between text-sm border rounded-lg px-3 py-1.5">
                        <span className="truncate">
                          {f.name} <span className="text-gray-400">({(f.size / 1024 / 1024).toFixed(1)} MB)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeNewFile(i)}
                          className="text-red-500 hover:text-red-700 ml-2"
                          aria-label={`Remove ${f.name}`}
                        >
                          <X size={15} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {editingId && (
                  <p className="text-xs text-gray-400 mt-2">
                    Leave the file picker empty to keep the current media.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 p-5 border-t">
              <button
                type="button"
                onClick={closeForm}
                disabled={formLoading}
                className="px-4 py-2 rounded-lg border text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-60"
              >
                {formLoading ? 'Saving…' : editingId ? 'Save changes' : 'Publish'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── View modal ── */}
      {showView && viewingPress && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-semibold">{viewingPress.title}</h2>
              <button
                type="button"
                onClick={() => setShowView(false)}
                className="p-1 rounded hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={15} /> {formatDate(viewingPress.publishedDate)}
                </span>
                <span className="flex items-center gap-1">
                  <User size={15} /> {viewingPress.author?.name || 'Admin'}
                </span>
                <span>{viewingPress.isActive !== false ? 'Active' : 'Inactive'}</span>
              </div>
              {viewingPress.summary && (
                <p className="italic text-gray-600 border-l-4 border-blue-300 pl-3">{viewingPress.summary}</p>
              )}
              <p className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">{viewingPress.content}</p>
              {(viewingPress.media || []).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {viewingPress.media.map((m, i) => (
                    <div key={m.public_id || i} className="border rounded-lg overflow-hidden bg-gray-50">
                      {m.type === 'image' && <img src={m.url} alt={m.caption || 'media'} className="w-full h-32 object-cover" />}
                      {m.type === 'video' && <video src={m.url} controls className="w-full h-32 object-cover" />}
                      {m.type === 'document' && (
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 p-4 text-sm text-blue-600 hover:underline"
                        >
                          <FileText size={20} className="text-orange-600" />
                          <span className="truncate">{m.caption || 'Document'}</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div role="dialog" aria-label="Confirm delete" className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete press release?</h2>
            <p className="text-sm text-gray-600 mb-5">
              &ldquo;{deleteTarget.title}&rdquo; and its media will be permanently deleted.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PressManagement;