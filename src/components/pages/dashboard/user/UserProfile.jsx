import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useEditProfileMutation, useGetProfileQuery } from '../../../store/authApi';
import { Camera, Pencil, Briefcase, MapPin, Mail, Loader2, Trash2, UserRound } from 'lucide-react';
import UserAvatar from '../../../UserAvatar';
import { setUser } from '../../../store/authSlice';
import getBaseURL from '../../../../utlis/baseURL'; // ✅ adjust path to match where getBaseURL.js actually lives

const UserProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [editProfile, { isLoading, isError, error, isSuccess, reset }] = useEditProfileMutation();

  const { data: freshUser, isLoading: profileLoading, isError: profileError } = useGetProfileQuery();

  useEffect(() => {
    if (freshUser) {
      dispatch(setUser(freshUser));
      localStorage.setItem('user', JSON.stringify(freshUser));
    }
  }, [freshUser, dispatch]);

  const [formData, setFormData] = useState({
    username: '',
    profileImage: '',
    bio: '',
    profession: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const debounceRef = useRef(null);
  const suggestionBoxRef = useRef(null);
  const fileInputRef = useRef(null);
  const quickInputRef = useRef(null); // camera button on the profile card (saves immediately)

  useEffect(() => {
    if (user) {
      setFormData({
        username: user?.username || '',
        profileImage: user?.profileImage || '',
        bio: user?.bio || '',
        profession: user?.profession || '',
        address: {
          street: user?.address?.street || '',
          city: user?.address?.city || '',
          state: user?.address?.state || '',
          postalCode: user?.address?.postalCode || '',
          country: user?.address?.country || '',
        },
      });
    }
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      address: {
        ...formData.address,
        [name]: value,
      },
    });

    if (name === 'street') {
      fetchAddressSuggestions(value);
    }
  };

  const fetchAddressSuggestions = (query) => {
    clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSuggestLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Address suggestion error:', err);
        setSuggestions([]);
      } finally {
        setSuggestLoading(false);
      }
    }, 400);
  };

  const handleSelectSuggestion = (place) => {
    const addr = place.address || {};
    setFormData((prev) => ({
      ...prev,
      address: {
        street: [addr.house_number, addr.road].filter(Boolean).join(' ') || place.display_name.split(',')[0],
        city: addr.city || addr.town || addr.village || addr.county || '',
        state: addr.state || '',
        postalCode: addr.postcode || '',
        country: addr.country || '',
      },
    }));
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // ── Profile photo upload ────────────────────────────────────────────────
  const handleFileSelect = (e, autoSave = false) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, GIF, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    uploadProfileImage(file, autoSave);
  };

  const uploadProfileImage = async (file, autoSave = false) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('images', file);

    try {
      // ✅ Uses the same base URL helper as the rest of the app —
      // resolves to your actual backend port, not the frontend's own origin.
      // Uploads require a login: send the saved token (and the login cookie)
      let token = null;
      try { token = localStorage.getItem('token'); } catch { /* storage blocked */ }
      const response = await fetch(`${getBaseURL()}/api/uploadImages`, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? 'Your session has expired. Please log in again and retry.'
            : data.message || `Upload failed (error ${response.status}). Please try again.`
        );
      }

      const imageUrl = data.urls?.[0];
      if (!imageUrl) throw new Error('No URL returned from server');

      setFormData((prev) => ({
        ...prev,
        profileImage: imageUrl,
      }));

      // Camera button on the card: save straight away, no extra "Save" click
      if (autoSave) {
        const response = await editProfile({
          username: user?.username || formData.username,
          profileImage: imageUrl,
          bio: user?.bio || '',
          profession: user?.profession || '',
          address: user?.address || formData.address,
        }).unwrap();
        dispatch(setUser(response.user));
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    } catch (err) {
      console.error('Profile image upload error:', err);
      alert('Failed to upload image: ' + (err?.data?.message || err.message));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (quickInputRef.current) quickInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    if (window.confirm('Remove your profile photo?')) {
      setFormData((prev) => ({
        ...prev,
        profileImage: '',
      }));
    }
  };

  const openModal = () => {
    reset();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    reset();
    setIsModalOpen(false);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      alert('Username cannot be empty');
      return;
    }

    const updatedUser = {
      username: formData.username,
      profileImage: formData.profileImage,
      bio: formData.bio,
      profession: formData.profession,
      address: formData.address,
    };

    try {
      const response = await editProfile(updatedUser).unwrap();
      dispatch(setUser(response.user));
      localStorage.setItem('user', JSON.stringify(response.user));
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    const parts = [address.street, address.city, address.state, address.postalCode, address.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  if (profileLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center gap-2 pt-24 text-gray-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading profile…</div>;
  }

  if (profileError) {
    return (
      <div className="px-4 pt-28 text-center text-red-500 xl:pt-36">
        Failed to load profile. Please try logging in again.
      </div>
    );
  }

  const details = [
    { icon: Mail, label: 'Email', value: user?.email },
    { icon: Briefcase, label: 'Profession', value: user?.profession },
    { icon: MapPin, label: 'Address', value: formatAddress(user?.address) !== 'N/A' ? formatAddress(user?.address) : '' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 pb-24 pt-24 xl:pt-32">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Banner */}
        <div className="relative h-32 overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-amber-700 sm:h-40">
          <span className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10" aria-hidden="true" />
          <span className="absolute -bottom-20 left-1/4 h-40 w-40 rounded-full bg-amber-400/20" aria-hidden="true" />
        </div>

        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-16 flex flex-col items-center gap-4 sm:-mt-14 sm:flex-row sm:items-end">
            {/* Avatar with change-photo controls */}
            <div className="group relative">
              <UserAvatar src={user?.profileImage} name={user?.username || user?.email} size={128} ring priority />
              <button
                type="button"
                onClick={() => quickInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-1 hidden items-center justify-center rounded-full bg-black/55 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 sm:flex"
                aria-label="Change profile photo"
              >
                <span className="flex flex-col items-center gap-1"><Camera className="h-6 w-6" /> Change photo</span>
              </button>
              <button
                type="button"
                onClick={() => quickInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-amber-500 text-slate-900 shadow-md transition hover:bg-amber-400 disabled:opacity-60"
                aria-label="Upload a new profile photo"
              >
                <Camera className="h-4 w-4" />
              </button>
              {uploading && (
                <span className="absolute inset-1 flex items-center justify-center rounded-full bg-black/60 text-white" role="status" aria-label="Uploading photo">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </span>
              )}
              <input ref={quickInputRef} type="file" accept="image/*" onChange={(e) => handleFileSelect(e, true)} className="hidden" />
            </div>

            <div className="flex-1 text-center sm:pb-2 sm:text-left">
              <h1 className="text-2xl font-bold text-slate-800">{user?.username || 'Your profile'}</h1>
              {user?.profession && <p className="text-slate-500">{user.profession}</p>}
            </div>

            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:text-amber-700 sm:mb-2"
            >
              <Pencil className="h-4 w-4" /> Edit profile
            </button>
          </div>

          {user?.bio && <p className="mt-5 rounded-xl bg-gray-50 p-4 text-slate-700">{user.bio}</p>}

          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            {details.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 rounded-xl border border-gray-100 p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><Icon className="h-4 w-4" /></span>
                <div className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
                  <dd className="break-words text-slate-700">{value || <span className="text-slate-400">Not added yet</span>}</dd>
                </div>
              </div>
            ))}
          </dl>

          {!user?.profileImage && (
            <p className="mt-5 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <UserRound className="h-4 w-4 shrink-0" />
              Add a profile photo with the camera button. A clear, front-facing photo works best: we crop it around your face automatically.
            </p>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white p-6 rounded-lg md:w-96 max-w-xl mx-auto relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

            {/* ── Profile photo upload ── */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
              <div className="flex items-center gap-3">
                <UserAvatar src={formData.profileImage} name={formData.username || user?.email} size={72} ring />
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    {uploading ? 'Uploading…' : 'Change photo'}
                  </button>
                  {formData.profileImage && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center gap-1 text-left text-xs text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove photo
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF up to 5MB</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="username"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Write Your Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="3"
                  maxLength={200}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="add your bio"
                />
                <p className="text-xs text-gray-400 mt-1">{formData.bio.length}/200</p>
              </div>

              <div className="mb-4">
                <label htmlFor="profession" className="block text-sm font-medium text-gray-700">
                  Profession
                </label>
                <input
                  type="text"
                  id="profession"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  placeholder="profession"
                  maxLength={100}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm"
                />
              </div>

              <div className="mb-4 pt-2 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mt-3 mb-2">Address</h3>

                <div className="mb-3 relative" ref={suggestionBoxRef}>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                    Street <span className="text-gray-400 font-normal">(start typing for suggestions)</span>
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    autoComplete="off"
                    value={formData.address.street}
                    onChange={handleAddressChange}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Start typing your address..."
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm"
                  />
                  {suggestLoading && (
                    <div className="absolute right-2 top-9 text-xs text-gray-400">Searching...</div>
                  )}
                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {suggestions.map((place) => (
                        <li
                          key={place.place_id}
                          onClick={() => handleSelectSuggestion(place)}
                          className="px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                        >
                          {place.display_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.address.city}
                      onChange={handleAddressChange}
                      placeholder="City"
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.address.state}
                      onChange={handleAddressChange}
                      placeholder="State"
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.address.postalCode}
                      onChange={handleAddressChange}
                      placeholder="PIN code"
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.address.country}
                      onChange={handleAddressChange}
                      placeholder="Country"
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || uploading}
                className={`mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md ${
                  isLoading || uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>

              {isError && (
                <p className="mt-2 text-red-500">
                  {error?.data?.message || 'Failed to update profile. Please try again'}
                </p>
              )}
              {isSuccess && <p className="mt-2 text-green-500">Profile updated successfully!</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;