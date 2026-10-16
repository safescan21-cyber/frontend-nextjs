import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, ThumbsUp, ThumbsDown, MessageCircle, Ban, CheckCircle, Star, Loader2 } from 'lucide-react';
import {
  useGetAdminReviewsQuery,
  useBlockReviewMutation,
  useBlockReviewCommentMutation,
} from '../../../../store/review/reviewApi';

const formatDate = (d) =>
  new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const Stars = ({ n }) => (
  <span className="inline-flex" aria-label={`${n} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} className={`h-3.5 w-3.5 ${i <= n ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
    ))}
  </span>
);

const ManageReviews = () => {
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, error } = useGetAdminReviewsQuery({ status, q: query, page });
  const [blockReview] = useBlockReviewMutation();
  const [blockComment] = useBlockReviewCommentMutation();
  const [busy, setBusy] = useState(null);

  const reviews = data?.reviews || [];
  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / 50));

  const toggleReview = async (r) => {
    setBusy(r._id);
    try {
      const res = await blockReview({ reviewId: r._id, blocked: !r.isBlocked }).unwrap();
      toast.success(res.message);
    } catch (e) {
      toast.error(e?.data?.message || 'Failed to update review');
    } finally {
      setBusy(null);
    }
  };

  const toggleComment = async (r, c) => {
    setBusy(c._id);
    try {
      const res = await blockComment({ reviewId: r._id, commentId: c._id, blocked: !c.isBlocked }).unwrap();
      toast.success(res.message);
    } catch (e) {
      toast.error(e?.data?.message || 'Failed to update comment');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="px-4 pb-6 pt-24 md:px-6 xl:pt-32">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Reviews & comments</h1>
        <p className="text-sm text-gray-500">
          Blocked reviews and comments are hidden from the website. You can unblock them any time.
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQuery(search.trim());
          }}
          className="flex flex-1 items-center rounded-lg border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-blue-200"
        >
          <Search className="ml-3 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search text or name…"
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
          />
          <button type="submit" className="px-4 py-2 text-sm font-medium text-blue-600">Search</button>
        </form>
        <div className="inline-flex overflow-hidden rounded-lg border border-gray-300 text-sm">
          {[
            ['all', 'All'],
            ['blocked', 'Blocked'],
          ].map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => { setStatus(v); setPage(1); }}
              className={`px-4 py-2 ${status === v ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading reviews…</div>
      ) : error ? (
        <p className="text-red-600">Could not load reviews: {error?.data?.message || 'please log in again as admin.'}</p>
      ) : reviews.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">No reviews found.</p>
      ) : (
        <div className={`space-y-4 ${isFetching ? 'opacity-60' : ''}`}>
          {reviews.map((r) => (
            <div
              key={r._id}
              className={`rounded-xl border bg-white p-4 shadow-sm ${r.isBlocked ? 'border-red-200 bg-red-50/40' : 'border-gray-200'}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-800">{r.userName}</span>
                    {String(r.userId).startsWith('guest:') && (
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500">guest</span>
                    )}
                    <Stars n={r.rating} />
                    {r.isBlocked && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Blocked</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {formatDate(r.createdAt)} ·{' '}
                    <Link to={`/shop/${r.productId}`} className="text-blue-600 hover:underline" target="_blank">
                      {r.productName || 'View product'}
                    </Link>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleReview(r)}
                  disabled={busy === r._id}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
                    r.isBlocked ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {r.isBlocked ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                  {r.isBlocked ? 'Unblock review' : 'Block review'}
                </button>
              </div>

              <p className="mt-3 whitespace-pre-line break-words text-sm text-gray-700">{r.comment}</p>

              <div className="mt-3 flex gap-4 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" /> {r.likeCount}</span>
                <span className="inline-flex items-center gap-1"><ThumbsDown className="h-3.5 w-3.5" /> {r.dislikeCount}</span>
                <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {(r.comments || []).length}</span>
              </div>

              {(r.comments || []).length > 0 && (
                <ul className="mt-3 space-y-2 border-l-2 border-gray-100 pl-3">
                  {r.comments.map((c) => (
                    <li key={c._id} className={`flex items-start justify-between gap-3 rounded-lg p-2 ${c.isBlocked ? 'bg-red-50' : ''}`}>
                      <div className="min-w-0 text-sm">
                        <span className="font-medium text-gray-800">{c.userName}</span>
                        <span className="ml-2 text-xs text-gray-400">{formatDate(c.createdAt)}</span>
                        {c.isBlocked && <span className="ml-2 text-xs font-medium text-red-600">Blocked</span>}
                        <p className="break-words text-gray-700">{c.text}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleComment(r, c)}
                        disabled={busy === c._id}
                        className={`shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${
                          c.isBlocked ? 'border-green-300 text-green-700 hover:bg-green-50' : 'border-red-300 text-red-600 hover:bg-red-50'
                        }`}
                      >
                        {c.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2 text-sm">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageReviews;
