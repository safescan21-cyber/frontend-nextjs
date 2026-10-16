import React, { useState, useEffect } from 'react';
import axios from 'axios';
import getBaseUrl from '../../../../../utlis/baseURL';

const MAX_IMAGES = 5;
const MAX_MB = 10;

const UploadImage = ({ name, setImages }) => {
  const [loading, setLoading] = useState(false);
  const [urls, setUrls] = useState([]);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Preview URLs for the selected files
  useEffect(() => {
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(newPreviews);
    return () => newPreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  const uploadImages = async (event) => {
    const input = event.target;
    const files = Array.from(input.files || []);
    if (files.length === 0) return;

    if (files.length > MAX_IMAGES) {
      setError(`You can only upload up to ${MAX_IMAGES} images at once`);
      input.value = '';
      return;
    }
    const notImage = files.find((f) => !f.type.startsWith('image/'));
    if (notImage) {
      setError(`"${notImage.name}" is not an image file.`);
      input.value = '';
      return;
    }
    const tooBig = files.find((f) => f.size > MAX_MB * 1024 * 1024);
    if (tooBig) {
      setError(`"${tooBig.name}" is larger than ${MAX_MB} MB.`);
      input.value = '';
      return;
    }

    setSelectedFiles(files);
    setError('');
    setLoading(true);

    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const uploadUrl = `${getBaseUrl()}/api/uploadImages`;

    // ✅ Read token from localStorage for cross-subdomain Bearer auth
    const token = localStorage.getItem('token');

    try {
      // Do NOT set Content-Type — browser adds the multipart boundary
      const response = await axios.post(uploadUrl, formData, {
        withCredentials: true,
        timeout: 120000,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const imageUrls = response.data?.urls || [];
      if (imageUrls.length === 0) throw new Error('No image URLs were returned.');

      setUrls(imageUrls);
      if (typeof setImages === 'function') setImages(imageUrls);
      setSelectedFiles([]);
    } catch (err) {
      let message = err.response?.data?.message || err.message || 'Upload failed';
      if (err.response?.status === 401) message = 'Please log in again, then retry the upload.';
      if (err.response?.status === 413) message = 'The files are too large for the server.';
      if (err.response?.status === 404) message = `Upload endpoint not found: ${uploadUrl}`;
      if (!err.response && err.request) message = 'Could not reach the server. Check your connection.';
      setError(message);
      console.error('Upload error:', err.response?.status, message);
    } finally {
      setLoading(false);
      input.value = '';
    }
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    if (newFiles.length === 0) {
      const el = document.getElementById(name);
      if (el) el.value = '';
    }
  };

  return (
    <div>
      <label htmlFor={name}>
        Upload Images (max {MAX_IMAGES}, {MAX_MB} MB each)
      </label>
      <input
        type="file"
        name={name}
        id={name}
        multiple
        accept="image/*"
        onChange={uploadImages}
        className="add-product-InputCSS"
        disabled={loading}
      />

      {loading && <div className="mt-2 text-sm text-blue-600">Uploading images...</div>}
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

      {selectedFiles.length > 0 && !loading && (
        <div className="mt-2">
          <p className="text-sm text-gray-600">{selectedFiles.length} image(s) selected</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="relative w-20 h-20 group">
                <img
                  src={previewUrls[idx]}
                  alt={`preview-${idx}`}
                  className="w-full h-full object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {urls.length > 0 && (
        <div className="mt-2">
          <p className="text-sm text-green-600">{urls.length} image(s) uploaded successfully!</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {urls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`uploaded-${idx}`}
                className="w-20 h-20 object-cover rounded border"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadImage;