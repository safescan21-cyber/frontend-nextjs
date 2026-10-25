import Toggle from '../../../../ui/Toggle';
import React, { useMemo, useState } from 'react';
import { Search, Mail, Phone, MessageCircle, X } from 'lucide-react';
import { useDeleteUserMutation, useGetUserQuery, useUpdateUserRoleMutation } from '../../../../store/authApi';
import UpdateUserModal from './UpdateUserModal';
import UserAvatar, { avatarUrl } from '../../../../UserAvatar';

const joined = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
// wa.me needs digits only, with the country code (assume India for 10-digit numbers)
const waNumber = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length === 10 ? `91${digits}` : digits;
};

const ManageUser = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null); // track which user is updating
  const [query, setQuery] = useState('');
  const [photo, setPhoto] = useState(null); // { url, name } shown large
  const { data: usersData, error, isLoading, refetch } = useGetUserQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUserRole] = useUpdateUserRoleMutation();

  // Ensure users is always an array
  const users = useMemo(() => (Array.isArray(usersData) ? usersData : []), [usersData]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    const qDigits = q.replace(/\D/g, '');
    return users.filter(
      (u) =>
        `${u.name || ''} ${u.email || ''} ${u.city || ''}`.toLowerCase().includes(q) ||
        (qDigits.length >= 3 && String(u.phone || '').replace(/\D/g, '').includes(qDigits))
    );
  }, [users, query]);

  // ─── Delete user ─────────────────────────────────────────────
  const handleDelete = async (user) => {
    if (!window.confirm(`Delete the account of ${user.name || user.email}? This cannot be undone.`)) return;
    try {
      await deleteUser(user._id).unwrap();
      alert('User deleted');
      refetch();
    } catch (err) {
      console.error(err);
      alert(err?.data?.message || 'Delete failed');
    }
  };

  // ─── Toggle role (admin ↔ user) ────────────────────────────
  const handleToggleRole = async (user) => {
    if (!user?._id) return;
    const newRole = user.role === 'admin' ? 'user' : 'admin';

    // Prevent double‑click while updating
    if (updatingUserId === user._id) return;
    setUpdatingUserId(user._id);

    try {
      await updateUserRole({ userId: user._id, role: newRole }).unwrap();
      refetch(); // refresh the list
    } catch (err) {
      console.error('Role update failed:', err);
      alert(err?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // ─── Edit (open modal) ──────────────────────────────────────
  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // ─── Loading / error states ────────────────────────────────
  if (isLoading) return <div className="text-center py-8">Loading users...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Failed to load users.</div>;

  const th = 'px-4 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap text-gray-500 bg-gray-50 border-b border-gray-200';
  const td = 'px-4 py-3 align-middle text-sm border-b border-gray-100';

  return (
    <section className="py-1">
      <div className="w-full mb-12 xl:mb-0 px-4 mx-auto">
        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">All Users</h3>
              <p className="text-xs text-gray-500">
                {shown.length === users.length ? `${users.length} users` : `${shown.length} of ${users.length} users`}
              </p>
            </div>
            <label className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email or phone"
                aria-label="Search users"
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </label>
          </div>

          <div className="block w-full overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={th}>User</th>
                  <th className={th}>Email</th>
                  <th className={th}>Phone</th>
                  <th className={th}>City</th>
                  <th className={`${th} text-right`}>Orders</th>
                  <th className={th}>Role</th>
                  <th className={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((user) => {
                  const isUpdating = updatingUserId === user._id;
                  return (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className={td}>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => user.profilePicture && setPhoto({ url: user.profilePicture, name: user.name })}
                            className={user.profilePicture ? 'cursor-zoom-in' : 'cursor-default'}
                            title={user.profilePicture ? 'View photo' : 'No photo uploaded'}
                            aria-label={user.profilePicture ? `View photo of ${user.name}` : `${user.name} has no photo`}
                          >
                            <UserAvatar src={user.profilePicture} name={user.name || user.email} size={40} />
                          </button>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-800">{user.name || '—'}</p>
                            <p className="text-xs text-gray-400">Joined {joined(user.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`${td} whitespace-nowrap`}>
                        {user.email ? (
                          <a href={`mailto:${user.email}`} className="inline-flex items-center gap-1.5 text-blue-600 hover:underline">
                            <Mail className="h-3.5 w-3.5" /> {user.email}
                          </a>
                        ) : '—'}
                      </td>
                      <td className={`${td} whitespace-nowrap`}>
                        {user.phone ? (
                          <div>
                            <div className="flex items-center gap-2">
                              <a href={`tel:${user.phone}`} className="inline-flex items-center gap-1.5 text-gray-800 hover:text-blue-600">
                                <Phone className="h-3.5 w-3.5" /> {user.phone}
                              </a>
                              <a
                                href={`https://wa.me/${waNumber(user.phone)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open WhatsApp chat"
                                aria-label={`WhatsApp ${user.name || user.phone}`}
                                className="rounded p-1 text-green-600 hover:bg-green-50"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </a>
                            </div>
                            <p className="text-[11px] text-gray-400">
                              {user.phoneSource === 'address' ? 'from saved address' : 'from latest order'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Not provided</span>
                        )}
                      </td>
                      <td className={`${td} text-gray-600`}>{user.city || '—'}</td>
                      <td className={`${td} text-right`}>{user.orders || 0}</td>
                      <td className={`${td} whitespace-nowrap`}>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full py-[2px] px-3 text-xs ${
                              user?.role === 'admin' ? 'bg-indigo-500 text-white' : 'bg-amber-300'
                            }`}
                          >
                            {user?.role}
                          </span>
                          {/* Toggle Switch */}
                          <Toggle size="sm" checked={user?.role === 'admin'} busy={isUpdating} onChange={() => handleToggleRole(user)}
                            title="Make admin / user" aria-label={`Admin role for ${user.name || user.email}`} />
                        </div>
                      </td>
                      <td className={`${td} whitespace-nowrap`}>
                        <button
                          onClick={() => handleEdit(user)}
                          className="bg-blue-500 text-white text-xs px-3 py-1 rounded mr-2 hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!shown.length && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                      {users.length ? 'No users match your search.' : 'No users yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Larger view of a user's photo */}
      {photo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPhoto(null)} role="presentation">
          <div className="relative" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`Photo of ${photo.name}`}>
            <img src={avatarUrl(photo.url, 240)} alt={`Photo of ${photo.name}`} className="h-72 w-72 max-w-[85vw] rounded-2xl object-cover shadow-2xl sm:h-96 sm:w-96" />
            <p className="mt-2 text-center text-sm font-medium text-white">{photo.name}</p>
            <button
              type="button"
              onClick={() => setPhoto(null)}
              aria-label="Close photo"
              className="absolute -right-3 -top-3 rounded-full bg-white p-1.5 text-gray-700 shadow hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <UpdateUserModal
          user={selectedUser}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          onRoleUpdate={refetch}
        />
      )}
    </section>
  );
};

export default ManageUser;
