'use client';
import React, { useState, useEffect } from 'react';
import { Link } from '../../shell/router';
import axios from 'axios';
import { Calendar, Image, Video, FileText } from 'lucide-react';
// If this file is directly in src/components/pages/, this path is right.
// Add one more "../" for each extra folder level.
import getBaseUrl from '../../utlis/baseURL';

// initial: the first page as the server fetched it ({ data, pagination }, app/[locale]/press)
const PublicPressList = ({ initial }) => {
  const first = Array.isArray(initial?.data) ? initial : null;
  const [presses, setPresses] = useState(first?.data || []);
  const [loading, setLoading] = useState(!first);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(first?.pagination || { page: 1, limit: 10, total: first?.data.length || 0 });

  const fetchPress = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${getBaseUrl()}/api/press`, {
        params: { active: true, page, limit: 10 },
        withCredentials: true,
      });
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setPresses(list);
      // Never store "undefined": the page reads pagination.total below
      setPagination(
        res.data?.pagination || { page, limit: 10, total: list.length }
      );
    } catch (err) {
      console.error(err);
      setError('Could not load press releases. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!first) fetchPress();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const MediaTypeIcon = ({ type }) => {
    switch (type) {
      case 'video': return <Video size={16} className="text-purple-600" />;
      case 'document': return <FileText size={16} className="text-orange-600" />;
      default: return <Image size={16} className="text-blue-600" />;
    }
  };

  if (loading) return <div className="p-6 text-center">Loading press releases...</div>;

  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || 10)));

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Press Releases</h1>

      {error && <div className="p-4 mb-4 text-center text-red-500">{error}</div>}
      {!error && presses.length === 0 && (
        <div className="p-4 text-center text-gray-500">No press releases yet.</div>
      )}

      <div className="space-y-6">
        {presses.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <Link to={`/press/${item._id}`} className="block">
              <h2 className="text-xl font-semibold text-blue-600 hover:underline">{item.title}</h2>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar size={14} /> {new Date(item.publishedDate).toLocaleDateString()}
                </span>
                <div className="flex gap-1">
                  {(item.media || []).map((m, idx) => (
                    <MediaTypeIcon key={idx} type={m.type} />
                  ))}
                </div>
              </div>
              {item.summary && <p className="mt-2 text-gray-700">{item.summary}</p>}
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => fetchPress(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {pagination.page} of {totalPages}</span>
        <button
          onClick={() => fetchPress(pagination.page + 1)}
          disabled={pagination.page * pagination.limit >= pagination.total}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PublicPressList;