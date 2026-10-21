import Toggle from '../../../ui/Toggle';
import React, { useState, useEffect, useRef } from 'react';
import {
  useGetHeroSlidesQuery,
  useCreateHeroSlideMutation,
  useUpdateHeroSlideMutation,
  useDeleteHeroSlideMutation,
  useUpdateHeroSlidesBulkMutation,
} from '../../../store/heroApi';
import axios from 'axios';
import getBaseUrl from '../../../../utlis/baseURL';
import { ChevronLeft, ChevronRight, Scale, Weight, Zap, Activity, Ruler } from 'lucide-react';

const AdminHeroSlides = () => {
  // ── RTK Query hooks ──
  const {
    data: slides = [],
    isLoading,
    isError,
    error,
  } = useGetHeroSlidesQuery();

  const [createSlide, { isLoading: isCreating }] = useCreateHeroSlideMutation();
  const [updateSlide, { isLoading: isUpdating }] = useUpdateHeroSlideMutation();
  const [deleteSlide, { isLoading: isDeleting }] = useDeleteHeroSlideMutation();
  const [bulkUpdate, { isLoading: isBulkUpdating }] = useUpdateHeroSlidesBulkMutation();

  // ── Local form state ──
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    imageUrl: '',
    title: '',
    subtitle: '',
    cta: 'Shop Now',
    ctaLink: '/products',
    category: 'professional',
    order: 0,
    active: true,
  });

  // ── Upload state ──
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // ── Carousel preview state ──
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef();
  const slideDuration = 5000;

  // ── Auto-play carousel ──
  useEffect(() => {
    if (isAutoPlaying && slides.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      }, slideDuration);
    }
    return () => clearInterval(autoPlayRef.current);
  }, [isAutoPlaying, slides.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // ── Helper: category icon ──
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'loadcells': return <Scale size={14} />;
      case 'scales': return <Weight size={14} />;
      case 'industrial': return <Zap size={14} />;
      case 'digital': return <Activity size={14} />;
      default: return <Ruler size={14} />;
    }
  };

  // ── File upload handler ──
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image or video file (jpg, png, gif, webp, mp4, webm).');
      e.target.value = '';
      return;
    }

    const fd = new FormData();
    fd.append('file', file);

    setUploading(true);
    setUploadError(null);
    try {
      // Must go to the API domain (not the website) and carry the login token
      const token = localStorage.getItem('token');
      const response = await axios.post(`${getBaseUrl()}/api/hero-slides/upload`, fd, {
        withCredentials: true,
        timeout: 5 * 60 * 1000,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const { url } = response.data;
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (err) {
      console.error('Upload error:', err);
      const status = err.response?.status;
      let msg = err.response?.data?.message || err.message || 'Upload failed';
      if (status === 401) msg = 'Please log out and log in again, then retry.';
      if (status === 403) msg = 'Admin access is required to upload.';
      if (status === 413) msg = 'The file is too large for the server.';
      if (!err.response && err.request) msg = 'Could not reach the server. Check your connection.';
      setUploadError(msg);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // ── Form handlers ──
  const resetForm = () => {
    setEditing(null);
    setFormData({
      imageUrl: '',
      title: '',
      subtitle: '',
      cta: 'Shop Now',
      ctaLink: '/products',
      category: 'professional',
      order: 0,
      active: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateSlide({ id: editing._id, ...formData }).unwrap();
        alert('Slide updated!');
      } else {
        await createSlide(formData).unwrap();
        alert('Slide created!');
      }
      resetForm();
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save slide.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return;
    try {
      await deleteSlide(id).unwrap();
      alert('Slide deleted.');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete slide.');
    }
  };

  const editSlide = (slide) => {
    setEditing(slide);
    setFormData(slide);
  };

  const toggleActive = async (slide) => {
    try {
      await updateSlide({ id: slide._id, ...slide, active: !slide.active }).unwrap();
    } catch (err) {
      console.error('Toggle active error:', err);
      alert('Failed to toggle active status.');
    }
  };

  // ── Reorder via bulk update ──
  const moveSlide = async (index, direction) => {
    const newSlides = [...slides];
    const [moved] = newSlides.splice(index, 1);
    newSlides.splice(index + direction, 0, moved);
    const reordered = newSlides.map((slide, idx) => ({
      _id: slide._id,
      order: idx,
    }));
    try {
      await bulkUpdate(reordered).unwrap();
    } catch (err) {
      console.error('Reorder error:', err);
      alert('Failed to reorder slides.');
    }
  };

  // ── Render states ──
  if (isLoading) return <div className="p-4 text-center">Loading slides...</div>;
  if (isError)
    return (
      <div className="p-4 text-center text-red-500">
        Failed to load slides: {error?.data?.message || error?.error || 'Unknown error'}
      </div>
    );

  const activeSlides = slides.filter(s => s.active);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Manage Hero Slides</h2>

      {/* ─── Carousel Preview ─── */}
      {activeSlides.length > 0 ? (
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden rounded-lg mb-6 bg-gray-900">
          {activeSlides.map((slide, index) => {
            const isVideo = slide.imageUrl?.match(/\.(mp4|webm|ogg)$/i);
            return (
              <div
                key={slide._id}
                className={`absolute top-0 left-0 w-full h-full transition-all duration-1000 ease-in-out ${
                  index === currentIndex ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'
                }`}
              >
                {isVideo ? (
                  <video
                    src={slide.imageUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/800x400?text=Image+not+found'; }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white px-4">
                    <div className="flex items-center justify-center mb-2 space-x-2">
                      {getCategoryIcon(slide.category)}
                      <span className="text-xs uppercase tracking-wider text-blue-300">
                        {slide.category || 'Professional'}
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-1">{slide.title}</h3>
                    <p className="text-sm sm:text-base text-gray-200">{slide.subtitle}</p>
                    <button className="mt-3 bg-blue-600 text-white px-6 py-1.5 rounded-full text-sm hover:bg-blue-700 transition">
                      {slide.cta || 'Shop Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Carousel controls */}
          {activeSlides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70"
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 flex space-x-1.5">
                {activeSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentIndex === idx ? 'bg-blue-500 w-6' : 'bg-white/50 w-1.5'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="absolute top-2 right-2 z-20 bg-black/50 backdrop-blur-sm text-white px-2 py-0.5 rounded text-xs"
              >
                {isAutoPlaying ? '⏸' : '▶'}
              </button>
            </>
          )}
        </div>
      ) : (
        <p className="text-gray-500 mb-4">No active slides to preview. Add a slide and set it to active.</p>
      )}

      {/* ─── Form ─── */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Image URL + upload */}
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Image/Video URL</label>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Paste URL or upload a file"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="flex-1 border p-2 rounded"
              required
            />
            <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm">
              {uploading ? 'Uploading...' : 'Choose File'}
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            {formData.imageUrl && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, imageUrl: '' })}
                className="bg-red-100 text-red-600 px-3 py-2 rounded hover:bg-red-200 text-sm"
              >
                Clear
              </button>
            )}
          </div>
          {uploadError && <p className="text-red-500 text-sm mt-1">{uploadError}</p>}
          {uploading && <p className="text-blue-500 text-sm mt-1">Uploading...</p>}
          {formData.imageUrl && (
            <div className="mt-2 h-24 w-full overflow-hidden rounded border">
              {formData.imageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                <video src={formData.imageUrl} controls className="h-full w-full object-cover" />
              ) : (
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+URL'; }}
                />
              )}
            </div>
          )}
        </div>

        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Subtitle"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="CTA Text (e.g., Shop Now)"
          value={formData.cta}
          onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="CTA Link (e.g., /products)"
          value={formData.ctaLink}
          onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Category (e.g., loadcells, scales)"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Order (numeric, lower first)"
          value={formData.order}
          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
          className="border p-2 rounded"
        />
        <Toggle className="self-center" tone="green" checked={!!formData.active} onChange={(v) => setFormData({ ...formData, active: v })} label="Active" description="Shown in the home page slider" />
        <div className="col-span-2 flex gap-2">
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isCreating || isUpdating ? 'Saving...' : editing ? 'Update Slide' : 'Add Slide'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* ─── Slides List (Management) ─── */}
      <h3 className="text-lg font-semibold mb-2">All Slides</h3>
      {slides.length === 0 ? (
        <p className="text-gray-500">No slides yet. Add one above.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((slide, index) => (
            <div key={slide._id} className="border rounded p-3 flex flex-col relative">
              <div className="h-32 w-full overflow-hidden rounded">
                {slide.imageUrl?.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video src={slide.imageUrl} className="h-full w-full object-cover" muted />
                ) : (
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="h-full w-full object-cover"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'; }}
                  />
                )}
              </div>
              <h4 className="font-bold mt-1 text-sm">{slide.title}</h4>
              <p className="text-xs text-gray-600 truncate">{slide.subtitle}</p>
              <p className="text-xs text-gray-400">
                Order: {slide.order} | {slide.active ? 'Active' : 'Inactive'}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                <button
                  onClick={() => editSlide(slide)}
                  className="bg-yellow-500 text-white px-2 py-0.5 rounded text-xs hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(slide._id)}
                  disabled={isDeleting}
                  className="bg-red-500 text-white px-2 py-0.5 rounded text-xs hover:bg-red-600 disabled:opacity-50"
                >
                  Delete
                </button>
                <Toggle size="sm" tone="green" checked={!!slide.active} onChange={() => toggleActive(slide)} label={slide.active ? 'Active' : 'Inactive'} aria-label={`Slide active: ${slide.title || index + 1}`} labelClassName="font-medium text-gray-700" />
                <button
                  onClick={() => moveSlide(index, -1)}
                  disabled={index === 0 || isBulkUpdating}
                  className="bg-gray-200 px-2 py-0.5 rounded text-xs hover:bg-gray-300 disabled:opacity-50"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveSlide(index, 1)}
                  disabled={index === slides.length - 1 || isBulkUpdating}
                  className="bg-gray-200 px-2 py-0.5 rounded text-xs hover:bg-gray-300 disabled:opacity-50"
                >
                  ↓
                </button>
              </div>
              {isBulkUpdating && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded">
                  <span className="text-xs font-semibold text-gray-700">Updating...</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminHeroSlides;