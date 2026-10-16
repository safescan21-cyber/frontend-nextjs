import React, { useState } from 'react';

// Cloudinary photos are re-cropped on the fly: a square centred on the face,
// gently enhanced, served at 2× for sharp phone screens, in WebP/AVIF when supported.
// eslint-disable-next-line react-refresh/only-export-components
export const avatarUrl = (url, size = 96) => {
  if (!url || typeof url !== 'string') return '';
  const marker = '/image/upload/';
  if (!url.includes('res.cloudinary.com') || !url.includes(marker)) return url;
  const px = Math.round(size * 2);
  const t = `c_fill,g_face,w_${px},h_${px},e_improve,q_auto,f_auto`;
  const [head, tail] = url.split(marker);
  // Already transformed? Keep the original public path after any existing transformation
  const rest = tail.replace(/^([a-z]_[^/]+\/)+/i, '');
  return `${head}${marker}${t}/${rest}`;
};

const COLORS = [
  'from-amber-400 to-orange-600',
  'from-sky-400 to-blue-600',
  'from-emerald-400 to-teal-600',
  'from-fuchsia-400 to-purple-600',
  'from-rose-400 to-red-600',
  'from-indigo-400 to-violet-600',
];

const initialsOf = (name = '') =>
  name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

const colorFor = (seed = '') => COLORS[[...seed].reduce((n, c) => n + c.charCodeAt(0), 0) % COLORS.length];

/**
 * Round profile picture with a gradient ring.
 *   <UserAvatar src={user.profileImage} name={user.username} size={128} ring />
 * Falls back to coloured initials when there is no photo or it fails to load.
 * Use `priority` for avatars that are always visible (profile header, navbar).
 */
const UserAvatar = ({ src, name = '', size = 40, ring = false, online = false, priority = false, className = '' }) => {
  const [failedSrc, setFailedSrc] = useState(null);
  const url = avatarUrl(src, size);
  const showPhoto = url && failedSrc !== url;
  const ringPad = ring ? Math.max(2, Math.round(size / 32)) : 0;

  return (
    <span
      className={`relative inline-flex shrink-0 rounded-full ${ring ? 'bg-gradient-to-tr from-amber-400 via-orange-500 to-fuchsia-500 shadow-lg' : ''} ${className}`}
      style={{ width: size, height: size, padding: ringPad }}
    >
      <span className={`flex h-full w-full overflow-hidden rounded-full bg-slate-100 ${ring ? 'ring-2 ring-white' : ''}`}>
        {showPhoto ? (
          <img
            src={url}
            alt={name ? `${name}'s profile photo` : 'Profile photo'}
            width={size}
            height={size}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            onError={() => setFailedSrc(url)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className={`flex h-full w-full select-none items-center justify-center bg-gradient-to-br font-bold text-white ${colorFor(name)}`}
            style={{ fontSize: Math.max(11, Math.round(size * 0.38)) }}
            aria-label={name || 'User'}
            role="img"
          >
            {initialsOf(name)}
          </span>
        )}
      </span>
      {online && (
        <span
          className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-emerald-500"
          style={{ width: Math.max(8, size * 0.22), height: Math.max(8, size * 0.22) }}
          aria-hidden="true"
        />
      )}
    </span>
  );
};

export default UserAvatar;
