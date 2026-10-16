import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ThumbsUp, ThumbsDown, MessageCircle, Send, Loader2 } from 'lucide-react';
import { useReactToReviewMutation, useAddReviewCommentMutation } from '../../store/review/reviewApi';

const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 30 * 86400) return `${Math.floor(s / 86400)}d ago`;
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Like / dislike / comment bar shown under each review
const ReviewActions = ({ review, productId }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [react, { isLoading: reacting }] = useReactToReviewMutation();
  const [addComment, { isLoading: commenting }] = useAddReviewCommentMutation();
  const [showComments, setShowComments] = useState(false);
  const [text, setText] = useState('');

  const comments = review.comments || [];

  const requireLogin = (action) => {
    if (user) return true;
    toast(`Please log in to ${action}`, { icon: '🔒' });
    navigate('/login', { state: { from: location.pathname } });
    return false;
  };

  const handleReact = async (type) => {
    if (!requireLogin(type === 'like' ? 'like reviews' : 'dislike reviews')) return;
    try {
      await react({ reviewId: review._id, type, productId }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || 'Could not save your reaction');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!requireLogin('comment')) return;
    const clean = text.trim();
    if (clean.length < 2) return;
    try {
      await addComment({ reviewId: review._id, text: clean, productId }).unwrap();
      setText('');
      setShowComments(true);
    } catch (err) {
      toast.error(err?.data?.message || 'Could not post your comment');
    }
  };

  const btn = (active, activeCls) =>
    `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${
      active ? activeCls : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
    }`;

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => handleReact('like')}
          disabled={reacting}
          aria-pressed={review.myReaction === 'like'}
          aria-label={`Like this review (${review.likeCount || 0})`}
          className={btn(review.myReaction === 'like', 'border-green-200 bg-green-50 text-green-700')}
        >
          <ThumbsUp className="h-3.5 w-3.5" fill={review.myReaction === 'like' ? 'currentColor' : 'none'} />
          {review.likeCount || 0}
        </button>
        <button
          type="button"
          onClick={() => handleReact('dislike')}
          disabled={reacting}
          aria-pressed={review.myReaction === 'dislike'}
          aria-label={`Dislike this review (${review.dislikeCount || 0})`}
          className={btn(review.myReaction === 'dislike', 'border-red-200 bg-red-50 text-red-600')}
        >
          <ThumbsDown className="h-3.5 w-3.5" fill={review.myReaction === 'dislike' ? 'currentColor' : 'none'} />
          {review.dislikeCount || 0}
        </button>
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          aria-expanded={showComments}
          className={btn(showComments, 'border-blue-200 bg-blue-50 text-blue-700')}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {comments.length ? `${comments.length} ${comments.length === 1 ? 'comment' : 'comments'}` : 'Comment'}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 space-y-3 border-l-2 border-gray-100 pl-3 sm:pl-4">
          {comments.map((c) => (
            <div key={c._id} className="text-sm">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-gray-800">{c.userName}</span>
                <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
              </div>
              <p className="mt-0.5 whitespace-pre-line break-words text-gray-700">{c.text}</p>
            </div>
          ))}

          {user ? (
            <form onSubmit={handleComment} className="flex items-end gap-2">
              <label htmlFor={`comment-${review._id}`} className="sr-only">Write a comment</label>
              <textarea
                id={`comment-${review._id}`}
                rows={1}
                maxLength={1000}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment…"
                className="min-h-[40px] flex-1 resize-y rounded-lg border border-gray-200 px-3 py-2 text-base sm:text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="submit"
                disabled={commenting || text.trim().length < 2}
                aria-label="Post comment"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
              >
                {commenting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => requireLogin('comment')}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Log in to comment
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewActions;
