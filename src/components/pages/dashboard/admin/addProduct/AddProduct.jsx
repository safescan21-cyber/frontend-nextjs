import FaqEditor from '../FaqEditor';
import Toggle from '../../../../ui/Toggle';
import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from '../../../../../shell/router';
import { CheckCircle, AlertCircle, Plus, X } from 'lucide-react';
import TextInput from './TextInput';
import SelectInput from './SelectInput';
import UploadImage from './UploadImage';
import DocumentUploader from './DocumentUploader';
import { useAddProductMutation } from '../../../../store/products/productsApi';
import getBaseUrl from '../../../../../utlis/baseURL';

const MAX_VIDEO_MB = 100;

// ─── Predefined categories for pharmaceutical equipment ────────
const predefinedCategories = [
  { label: 'Tablet Press Machines', value: 'tablet-press' },
  { label: 'Capsule Filling Machines', value: 'capsule-filling' },
  { label: 'Blister Packaging Machines', value: 'blister-packaging' },
  { label: 'Strip Packaging Machines', value: 'strip-packaging' },
  { label: 'Powder Filling Machines', value: 'powder-filling' },
  { label: 'Liquid Filling Machines', value: 'liquid-filling' },
  { label: 'Granulation Equipment', value: 'granulation' },
  { label: 'Coating Systems', value: 'coating' },
  { label: 'Fluid Bed Dryers', value: 'fluid-bed-dryer' },
  { label: 'Milling & Sizing', value: 'milling' },
  { label: 'Mixing & Blending', value: 'mixing' },
  { label: 'Compression Tooling', value: 'tooling' },
  { label: 'Inspection & Detection', value: 'inspection' },
  { label: 'Lab Equipment', value: 'lab-equipment' },
  { label: 'Sterile Processing', value: 'sterile' },
  { label: 'HVAC & Utilities', value: 'hvac' },
  { label: 'Material Handling', value: 'material-handling' },
  { label: 'Packaging Accessories', value: 'packaging-accessories' },
  { label: 'Process Control Software', value: 'process-control' },
  { label: 'Turnkey Projects', value: 'turnkey' },
];

const colors = [
  { label: 'Red', value: 'red' },
  { label: 'Blue', value: 'blue' },
  { label: 'Green', value: 'green' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Black', value: 'black' },
  { label: 'White', value: 'white' },
  { label: 'Silver', value: 'silver' },
  { label: 'Custom', value: 'custom' },
];

// ─── Origin and product-type lists (admin can add more; saved in this browser) ───
const defaultOrigins = [
  { label: 'India', value: 'india' },
  { label: 'Germany', value: 'germany' },
  { label: 'China', value: 'china' },
  { label: 'Italy', value: 'italy' },
  { label: 'USA', value: 'usa' },
  { label: 'Japan', value: 'japan' },
  { label: 'Switzerland', value: 'switzerland' },
  { label: 'United Kingdom', value: 'united-kingdom' },
  { label: 'South Korea', value: 'south-korea' },
  { label: 'Taiwan', value: 'taiwan' },
];

const defaultProductTypes = [
  { label: 'Tablet Press', value: 'tablet-press' },
  { label: 'Capsule Filler', value: 'capsule-filler' },
  { label: 'Blister Packing Machine', value: 'blister-packing-machine' },
  { label: 'Filling Machine', value: 'filling-machine' },
  { label: 'Labelling Machine', value: 'labelling-machine' },
  { label: 'Mixer / Blender', value: 'mixer-blender' },
  { label: 'Dryer', value: 'dryer' },
  { label: 'Mill / Grinder', value: 'mill-grinder' },
  { label: 'Coating Machine', value: 'coating-machine' },
  { label: 'Inspection Machine', value: 'inspection-machine' },
];

const slugify = (text) => text.trim().toLowerCase().replace(/\s+/g, '-');

// Keeps a list in state and remembers the admin's own additions in localStorage
const useSavedList = (storageKey, defaults) => {
  const [list, setList] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const extra = Array.isArray(saved)
        ? saved.filter(
            (i) => i && i.label && i.value && !defaults.some((d) => d.value === i.value)
          )
        : [];
      return [...defaults, ...extra];
    } catch (e) {
      return defaults;
    }
  });

  const addItem = (item) => {
    setList((prev) => {
      const next = [...prev, item];
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify(next.filter((i) => !defaults.some((d) => d.value === i.value)))
        );
      } catch (e) {
        /* storage unavailable: the item still works for this session */
      }
      return next;
    });
  };

  return [list, addItem];
};

// A dropdown whose last option lets the admin type a new name when it is not in the list
const SelectWithAdd = ({ label, name, value, onPick, list, onAdd, newLabel, placeholder }) => {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');
  const [err, setErr] = useState('');

  const handleSelect = (e) => {
    if (e.target.value === '__add__') {
      setAdding(true);
      return;
    }
    setAdding(false);
    setErr('');
    onPick(e.target.value);
  };

  const confirmAdd = () => {
    const name2 = text.trim().replace(/\s+/g, ' ');
    if (!name2) {
      setErr('Please enter a name.');
      return;
    }
    const slug = slugify(name2);
    const existing = list.find((i) => i.value === slug || i.label.toLowerCase() === name2.toLowerCase());
    if (existing) {
      // Already in the list: just select it
      onPick(existing.value);
    } else {
      onAdd({ label: name2, value: slug });
      onPick(slug);
    }
    setAdding(false);
    setText('');
    setErr('');
  };

  return (
    <div>
      <SelectInput
        label={label}
        name={name}
        value={adding ? '__add__' : value}
        onChange={handleSelect}
        options={[...list, { label: newLabel, value: '__add__' }]}
      />
      {adding && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            type="text"
            autoFocus
            maxLength={60}
            placeholder={placeholder}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setErr('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                confirmAdd();
              }
            }}
            className="flex-1 min-w-[200px] border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={confirmAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setAdding(false);
              setText('');
              setErr('');
            }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
          {err && <p className="text-red-500 text-xs w-full mt-1">{err}</p>}
        </div>
      )}
    </div>
  );
};

const AddProduct = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // ── Category state ──
  const [categories, setCategories] = useState(predefinedCategories);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [categoryError, setCategoryError] = useState('');

  // ── Origin and product-type lists ──
  const [origins, addOrigin] = useSavedList('pm_custom_origins', defaultOrigins);
  const [productTypes, addProductType] = useSavedList('pm_custom_product_types', defaultProductTypes);

  // ── Product form state ──
  const [product, setProduct] = useState({
    name: '',
    category: '',
    color: '',
    origin: '',
    productType: '',
    price: '',
    oldPrice: '',
    warranty: '',
    stock: '',
    readyToDispatch: false,
    description: '',
    fitsModels: '', // spare parts: machine models, comma separated
  });
  const [images, setImages] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [videos, setVideos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [docsUploading, setDocsUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoStatus, setVideoStatus] = useState('');

  // ── UI toggles ──
  const [showSuccessToggle, setShowSuccessToggle] = useState(false);
  const [addedProductName, setAddedProductName] = useState('');
  const [formError, setFormError] = useState('');

  const [addProductApi, { isLoading, error: mutationError }] = useAddProductMutation();

  // ── Handlers ──
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (name === 'category') {
      if (value === 'other') {
        setShowCustomCategory(true);
      } else {
        setShowCustomCategory(false);
        setCustomCategory('');
        setCategoryError('');
      }
    }
  };

  const handleCustomCategoryChange = (e) => {
    const val = e.target.value;
    setCustomCategory(val);
    const slug = val.trim().toLowerCase().replace(/\s+/g, '-');
    if (val.trim() && categories.some(cat => cat.value === slug)) {
      setCategoryError('Category already exists.');
    } else {
      setCategoryError('');
    }
  };

  const addCustomCategory = () => {
    const trimmed = customCategory.trim();
    if (!trimmed) {
      setCategoryError('Please enter a category name.');
      return;
    }
    const slug = trimmed.toLowerCase().replace(/\s+/g, '-');
    if (categories.some(cat => cat.value === slug)) {
      setCategoryError('Category already exists.');
      return;
    }
    const newCat = { label: trimmed, value: slug };
    setCategories((prev) => [...prev, newCat]);
    setProduct((prev) => ({ ...prev, category: slug }));
    setShowCustomCategory(false);
    setCustomCategory('');
    setCategoryError('');
  };

  // ── Specification handlers ──
  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const removeSpecification = (index) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const updateSpecification = (index, field, value) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  // ── Video handlers ──
  // Uploads ONE video to the API domain with the login token.
  const uploadOneVideo = async (file, onProgress) => {
    const formData = new FormData();
    formData.append('video', file);

    const token = localStorage.getItem('token');
    const res = await axios.post(`${getBaseUrl()}/api/upload/video`, formData, {
      withCredentials: true,
      timeout: 15 * 60 * 1000, // 15 minutes
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      onUploadProgress: (ev) => {
        if (ev.total) onProgress(Math.round((ev.loaded * 100) / ev.total));
      },
    });

    if (!res.data?.url) throw new Error('No video URL was returned.');
    return res.data.url;
  };

  const handleVideoUpload = async (e) => {
    const input = e.target;
    const files = Array.from(input.files || []);
    if (!files.length) return;

    // Check every file first, so nothing is uploaded if one is invalid
    const notVideo = files.find((f) => !f.type.startsWith('video/'));
    if (notVideo) {
      showError(`"${notVideo.name}" is not a video file.`);
      input.value = '';
      return;
    }
    const tooBig = files.find((f) => f.size > MAX_VIDEO_MB * 1024 * 1024);
    if (tooBig) {
      showError(`"${tooBig.name}" is larger than ${MAX_VIDEO_MB} MB.`);
      input.value = '';
      return;
    }

    setVideoUploading(true);
    setVideoProgress(0);
    const uploaded = [];

    try {
      // One at a time: keeps server memory low and shows clear progress
      for (let i = 0; i < files.length; i++) {
        setVideoStatus(`Uploading video ${i + 1} of ${files.length}...`);
        setVideoProgress(0);
        const url = await uploadOneVideo(files[i], setVideoProgress);
        uploaded.push(url);
        setVideos((prev) => [...prev, url]); // show each as soon as it finishes
      }
    } catch (err) {
      const status = err.response?.status;
      let message = err.response?.data?.message || err.message || 'Failed to upload video.';
      if (status === 401) message = 'Session expired. Please log out, log in again, then retry.';
      if (status === 413) message = 'The video is too large for the server.';
      if (status === 404) message = 'Video upload endpoint not found on the server.';
      if (!err.response && err.request) message = 'Could not reach the server. Check your connection.';
      console.error('Video upload failed:', status, message);
      showError(uploaded.length ? `${message} (${uploaded.length} uploaded before the error)` : message);
    } finally {
      setVideoUploading(false);
      setVideoProgress(0);
      setVideoStatus('');
      input.value = '';
    }
  };

  const removeVideo = (index) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  // ── Error toast helper ──
  const showError = (msg) => {
    setFormError(msg);
    setTimeout(() => setFormError(''), 3000);
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showError('You are not logged in. Please log in first.');
      return;
    }
    if (!user._id) {
      showError('User ID is missing. Please log out and log in again.');
      return;
    }
    if (user.role !== 'admin') {
      showError('You do not have admin privileges to add a product.');
      return;
    }

    if (!product.name || !product.category || !product.price || !product.description || !product.color) {
      showError('Please fill in all required fields.');
      return;
    }
    if (images.length === 0) {
      showError('Please upload at least one product image.');
      return;
    }

    try {
      const cleanSpecs = specifications.filter(s => s.key.trim() !== '' || s.value.trim() !== '');

      const payload = {
        ...product,
        price: Number(product.price),
        oldPrice: product.oldPrice ? Number(product.oldPrice) : undefined,
        warranty: product.warranty ? Number(product.warranty) : undefined,
        stock: product.stock ? Number(product.stock) : undefined,
        images,
        videos,
        documents,
        author: user._id,
        specifications: cleanSpecs,
        faqs: faqs.filter((f) => f.q.trim() && f.a.trim()),
      };

      await addProductApi(payload).unwrap();

      setAddedProductName(product.name);
      setShowSuccessToggle(true);

      // Reset form
      setProduct({
        name: '',
        category: '',
        color: '',
        origin: '',
        productType: '',
        price: '',
        oldPrice: '',
        warranty: '',
        stock: '',
        readyToDispatch: false,
        description: '',
        fitsModels: '',
        active: true,
        sellOnline: true,
      });
      setImages([]);
      setVideos([]);
      setDocuments([]);
      setSpecifications([]);
      setCustomCategory('');
      setShowCustomCategory(false);
      setCategoryError('');

      setTimeout(() => {
        setShowSuccessToggle(false);
        navigate('/shop');
      }, 2200);

    } catch (err) {
      console.error('Failed to submit product:', err);
      showError(err?.data?.message || 'An unexpected error occurred.');
    }
  };

  // ── Category options ──
  const categoryOptions = [
    ...categories.map(cat => ({ label: cat.label, value: cat.value })),
    { label: '➕ Add new category...', value: 'other' },
  ];

  // ── Render ──
  return (
    <div className="container mx-auto mt-8 relative">
      {/* Success Toggle & Error Toast (unchanged) */}
      {showSuccessToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 shadow-2xl transform animate-scale-up">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-4 animate-bounce">
                <CheckCircle size={48} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Product Added! ✓</h2>
              <p className="text-white/90 text-lg">"{addedProductName}" has been added successfully.</p>
              <div className="mt-4 flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {formError && (
        <div className="fixed top-5 right-5 z-50 animate-slide-in-right">
          <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <AlertCircle size={24} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">{formError}</p>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ── Basic fields ── */}
        <TextInput
          label="Product Name"
          name="name"
          placeholder="Ex: High-Speed Tablet Press"
          value={product.name}
          onChange={handleChange}
        />

        <div>
          <SelectInput
            label="Category"
            name="category"
            value={product.category}
            onChange={handleChange}
            options={categoryOptions}
          />
          {showCustomCategory && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Enter new category name"
                value={customCategory}
                onChange={handleCustomCategoryChange}
                className="flex-1 min-w-[200px] border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addCustomCategory}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
              {categoryError && <p className="text-red-500 text-xs w-full mt-1">{categoryError}</p>}
            </div>
          )}
        </div>

        <SelectInput
          label="Color"
          name="color"
          value={product.color}
          onChange={handleChange}
          options={colors}
        />

        <SelectWithAdd
          label="Origin (made in)"
          name="origin"
          value={product.origin}
          onPick={(v) => setProduct((prev) => ({ ...prev, origin: v }))}
          list={origins}
          onAdd={addOrigin}
          newLabel="➕ Add new origin..."
          placeholder="Enter country / origin name"
        />

        <SelectWithAdd
          label="Product Type"
          name="productType"
          value={product.productType}
          onPick={(v) => setProduct((prev) => ({ ...prev, productType: v }))}
          list={productTypes}
          onAdd={addProductType}
          newLabel="➕ Add new product type..."
          placeholder="Enter product type name"
        />

        <TextInput
          label="Price (₹)"
          name="price"
          type="number"
          placeholder="50000"
          value={product.price}
          onChange={handleChange}
        />
        <TextInput
          label="Original Price (₹) – for discount"
          name="oldPrice"
          type="number"
          placeholder="60000"
          value={product.oldPrice}
          onChange={handleChange}
        />

        <TextInput
          label="Fits machine models (spare parts, comma separated)"
          name="fitsModels"
          placeholder="ZP-35D, NJP-1200"
          value={product.fitsModels}
          onChange={handleChange}
        />
        <TextInput
          label="Stock Quantity"
          name="stock"
          type="number"
          placeholder="10"
          value={product.stock}
          onChange={handleChange}
        />
        <TextInput
          label="Warranty (months)"
          name="warranty"
          type="number"
          placeholder="24"
          value={product.warranty}
          onChange={handleChange}
        />

        <div className="grid gap-4 rounded-xl border border-gray-200 bg-gray-50/60 p-4 sm:grid-cols-3">
          <Toggle
            checked={!!product.readyToDispatch}
            onChange={(v) => setProduct((p) => ({ ...p, readyToDispatch: v }))}
            label="Ready to dispatch"
            description="Available for immediate shipping"
            tone="green"
          />
          <Toggle
            checked={product.active !== false}
            onChange={(v) => setProduct((p) => ({ ...p, active: v }))}
            label="Show on website"
            description="Off = hidden from shop, search and Google"
          />
          <Toggle
            checked={product.sellOnline !== false}
            onChange={(v) => setProduct((p) => ({ ...p, sellOnline: v }))}
            label="Sell online"
            description="Off = enquiry only, no Add to cart"
          />
        </div>

        {/* Images */}
        <UploadImage name="images" setImages={setImages} />

        {/* ── Videos ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Videos <span className="text-xs text-gray-400">(optional, MP4/WebM/AVI)</span>
          </label>
          <input
            type="file"
            accept="video/*"
            multiple
            onChange={handleVideoUpload}
            disabled={videoUploading}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          {videoUploading && (
            <div className="mt-2">
              <div className="w-full h-2 bg-gray-200 rounded">
                <div
                  className="h-2 bg-blue-600 rounded transition-all"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>
              <p className="mt-1 text-sm text-blue-600">
                {videoStatus} {videoProgress < 100 ? `${videoProgress}%` : '(processing...)'}
              </p>
            </div>
          )}
          {videos.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {videos.map((url, idx) => (
                <div key={idx} className="relative w-32 h-24 rounded overflow-hidden border border-gray-300">
                  <video src={url} className="w-full h-full object-cover" controls />
                  <button
                    type="button"
                    onClick={() => removeVideo(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Upload one or more videos (max {MAX_VIDEO_MB} MB each). Preview thumbnails shown.
          </p>
        </div>

        {/* ── Technical documents ── */}
        <DocumentUploader documents={documents} setDocuments={setDocuments} onBusyChange={setDocsUploading} />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            className="add-product-InputCSS"
            value={product.description}
            placeholder="Describe the machine, its features, and applications"
            onChange={handleChange}
          />
        </div>

        <FaqEditor value={faqs} onChange={setFaqs} />

        {/* ── Specifications ── */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Technical Specifications <span className="text-xs text-gray-400">(optional key–value pairs)</span>
            </label>
            <button
              type="button"
              onClick={addSpecification}
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <Plus size={16} /> Add Specification
            </button>
          </div>

          {specifications.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">No specifications added yet.</p>
          )}

          <div className="mt-2 space-y-2">
            {specifications.map((spec, index) => (
              <div key={index} className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                <input
                  type="text"
                  placeholder="Key (e.g. Capacity)"
                  value={spec.key}
                  onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                  className="flex-1 min-w-[120px] border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 500kg/h)"
                  value={spec.value}
                  onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                  className="flex-1 min-w-[120px] border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeSpecification(index)}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <button type="submit" className="add-product-btn" disabled={isLoading || videoUploading || docsUploading}>
            {isLoading ? 'Adding...' : videoUploading ? 'Uploading video...' : docsUploading ? 'Uploading documents...' : 'Add Product'}
          </button>
        </div>

        {mutationError && (
          <div className="text-red-600 text-sm mt-2">
            {mutationError?.data?.message || 'Something went wrong. Please try again.'}
          </div>
        )}
      </form>

      {/* Animations (unchanged) */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-up { animation: scale-up 0.4s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default AddProduct;