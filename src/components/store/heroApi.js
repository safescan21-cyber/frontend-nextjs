import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import getBaseUrl from '../../utlis/baseURL';

export const heroApi = createApi({
  reducerPath: 'heroApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/api`,
    credentials: 'include',
    // Also send the saved login token (needed for admin actions)
    prepareHeaders: (headers) => {
      try {
        const token = localStorage.getItem('token');
        if (token) headers.set('Authorization', `Bearer ${token}`);
      } catch (e) {
        /* storage unavailable */
      }
      return headers;
    },
  }),
  tagTypes: ['HeroSlide'],
  endpoints: (builder) => ({
    getHeroSlides: builder.query({
      query: () => '/hero-slides',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'HeroSlide', id: _id })),
              { type: 'HeroSlide', id: 'LIST' },
            ]
          : [{ type: 'HeroSlide', id: 'LIST' }],
    }),
    createHeroSlide: builder.mutation({
      query: (body) => ({
        url: '/hero-slides',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'HeroSlide', id: 'LIST' }],
    }),
    updateHeroSlide: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/hero-slides/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'HeroSlide', id }],
    }),
    deleteHeroSlide: builder.mutation({
      query: (id) => ({
        url: `/hero-slides/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'HeroSlide', id: 'LIST' }],
    }),
    updateHeroSlidesBulk: builder.mutation({
      query: (slides) => ({
        url: '/hero-slides/bulk',
        method: 'PUT',
        body: { slides },
      }),
      invalidatesTags: [{ type: 'HeroSlide', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetHeroSlidesQuery,
  useCreateHeroSlideMutation,
  useUpdateHeroSlideMutation,
  useDeleteHeroSlideMutation,
  useUpdateHeroSlidesBulkMutation,
} = heroApi;