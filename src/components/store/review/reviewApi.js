import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import getBaseUrl from '../../../utlis/baseURL';

export const reviewApi = createApi({
  reducerPath: 'reviewApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/api/reviews`,
    credentials: 'include',
    // Send the login so likes, comments and admin moderation know who you are
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Reviews", "AdminReviews"],
  endpoints: (builder) => ({
    postReview: builder.mutation({
      query: (reviewData) => ({
        url: "/post-review",
        method: "POST",
        body: reviewData,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Reviews", id: productId },
      ],
    }),
    getReviewsCount: builder.query({
      query: () => "/total-reviews",
    }),
    getReviewsByProductId: builder.query({
      query: (productId) => `/product/${productId}`,
      providesTags: (result, error, productId) =>
        result ? [{ type: "Reviews", id: productId }] : [],
    }),
    getReviewsByUserId: builder.query({
      query: (userId) => `/${userId}`,
      providesTags: (result) =>
        result ? [{ type: "Reviews", id: result[0]?.email }] : [],
    }),

    // Like / dislike (send the same type again to undo)
    reactToReview: builder.mutation({
      query: ({ reviewId, type }) => ({ url: `/${reviewId}/react`, method: "POST", body: { type } }),
      invalidatesTags: (result, error, { productId }) => [{ type: "Reviews", id: productId }],
    }),
    addReviewComment: builder.mutation({
      query: ({ reviewId, text }) => ({ url: `/${reviewId}/comments`, method: "POST", body: { text } }),
      invalidatesTags: (result, error, { productId }) => [{ type: "Reviews", id: productId }],
    }),

    // Admin moderation
    getAdminReviews: builder.query({
      query: ({ status = "all", q = "", page = 1 } = {}) =>
        `/admin/all?status=${status}&q=${encodeURIComponent(q)}&page=${page}`,
      providesTags: ["AdminReviews"],
    }),
    blockReview: builder.mutation({
      query: ({ reviewId, blocked }) => ({ url: `/admin/${reviewId}/block`, method: "PATCH", body: { blocked } }),
      invalidatesTags: ["AdminReviews", "Reviews"],
    }),
    blockReviewComment: builder.mutation({
      query: ({ reviewId, commentId, blocked }) => ({
        url: `/admin/${reviewId}/comments/${commentId}/block`,
        method: "PATCH",
        body: { blocked },
      }),
      invalidatesTags: ["AdminReviews", "Reviews"],
    }),
  }),
});

export const {
  usePostReviewMutation,
  useGetReviewsCountQuery,
  useGetReviewsByProductIdQuery,
  useGetReviewsByUserIdQuery,
  useReactToReviewMutation,
  useAddReviewCommentMutation,
  useGetAdminReviewsQuery,
  useBlockReviewMutation,
  useBlockReviewCommentMutation,
} = reviewApi;

export default reviewApi;
