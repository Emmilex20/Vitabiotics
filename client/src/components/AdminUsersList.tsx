import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface UserItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  disabled?: boolean;
}

const AdminUsersList: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<UserItem>>({});

  // Message modal state
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageTargetId, setMessageTargetId] = useState<string | null>(null);
  const [messageSubject, setMessageSubject] = useState<string>('Message from Vitabiotics');
  const [messageBody, setMessageBody] = useState<string>('');
  const [messageSending, setMessageSending] = useState<boolean>(false);

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteSending, setDeleteSending] = useState<boolean>(false);
  const [permanentConfirmChecked, setPermanentConfirmChecked] = useState<boolean>(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('authToken'); if (!token) { setError('Missing token'); setLoading(false); return; }
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data.users || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally { setLoading(false); }
  };

  const startEdit = (u: UserItem) => {
    setEditingId(u._id);
    setEditValues({ firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone, role: u.role, disabled: !!u.disabled });
  };

  const cancelEdit = () => { setEditingId(null); setEditValues({}); };

  const saveEdit = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken'); if (!token) { setError('Missing token'); return; }
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${id}`, editValues, { headers: { Authorization: `Bearer ${token}` } });
      (await import('react-hot-toast')).default.success('User updated');
      setEditingId(null); setEditValues({});
      await fetchUsers();
    } catch (err: any) {
      (await import('react-hot-toast')).default.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  const openDeleteModal = (id: string) => {
    setDeleteTargetId(id);
    setDeleteModalOpen(true);
  };

  const restoreUser = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken'); if (!token) { setError('Missing token'); return; }
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${id}/restore`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(u => u.map(x => x._id === id ? { ...x, disabled: false } : x));
      (await import('react-hot-toast')).default.success('User restored');
    } catch (err: any) {
      (await import('react-hot-toast')).default.error(err.response?.data?.message || 'Failed to restore user');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteSending(true);
    try {
      const token = localStorage.getItem('authToken'); if (!token) { setError('Missing token'); setDeleteSending(false); return; }
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${deleteTargetId}`, { headers: { Authorization: `Bearer ${token}` } });

      // optimistically mark disabled locally
      setUsers(u => u.map(x => x._id === deleteTargetId ? { ...x, disabled: true } : x));

      setDeleteModalOpen(false);
      setDeleteTargetId(null);

      // reset permanent checkbox
      setPermanentConfirmChecked(false);

      // Show toast with Undo action
      const toastLib = (await import('react-hot-toast')).default;
      toastLib((t: any) => (
        <div className="flex items-center gap-3">
          <div>User disabled</div>
          <button onClick={async () => { await restoreUser(deleteTargetId!); toastLib.dismiss(t.id); }} className="px-2 py-1 bg-amber-100 text-amber-800 rounded">Undo</button>
        </div>
      ), { duration: 5000 });

    } catch (err: any) {
      (await import('react-hot-toast')).default.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteSending(false);
    }
  };

  const confirmPermanentDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteSending(true);
    try {
      const token = localStorage.getItem('authToken'); if (!token) { setError('Missing token'); setDeleteSending(false); return; }
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${deleteTargetId}/permanent`, { headers: { Authorization: `Bearer ${token}` } });
      // remove user from list
      setUsers(u => u.filter(x => x._id !== deleteTargetId));
      setDeleteModalOpen(false);
      setDeleteTargetId(null);
      setPermanentConfirmChecked(false);
      (await import('react-hot-toast')).default.success('User permanently deleted');
    } catch (err: any) {
      (await import('react-hot-toast')).default.error(err.response?.data?.message || 'Failed to permanently delete user');
    } finally {
      setDeleteSending(false);
    }
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteTargetId(null);
    setDeleteSending(false);
  }; 

  const openMessageModal = (id: string) => {
    setMessageTargetId(id);
    setMessageSubject('Message from Vitabiotics');
    setMessageBody('');
    setMessageModalOpen(true);
  };

  const submitMessage = async () => {
    if (!messageTargetId) return;
    setMessageSending(true);
    try {
      const token = localStorage.getItem('authToken'); if (!token) { setError('Missing token'); setMessageSending(false); return; }
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${messageTargetId}/message`, { subject: messageSubject, message: messageBody }, { headers: { Authorization: `Bearer ${token}` } });
      (await import('react-hot-toast')).default.success('Message sent');
      setMessageModalOpen(false);
      setMessageTargetId(null);
    } catch (err: any) {
      (await import('react-hot-toast')).default.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setMessageSending(false);
    }
  };

  const closeMessageModal = () => {
    setMessageModalOpen(false);
    setMessageTargetId(null);
  }; 

  if (loading) return <div className="py-12 text-center">Loading users...</div>;
  if (error) return <div className="py-6 text-red-600">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">User Management</h2>
        <div className="text-sm text-gray-600">Total: {users.length}</div>
      </div>

      <div className="space-y-3">
        {users.map(u => (
          <div key={u._id} className="border rounded p-3 flex items-center justify-between gap-4">
            <div className="flex-1">
              {editingId === u._id ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <input placeholder="First name" className="p-2 border rounded" value={(editValues.firstName as string) || ''} onChange={(e)=> setEditValues({...editValues, firstName: e.target.value})} />
                  <input placeholder="Last name" className="p-2 border rounded" value={(editValues.lastName as string) || ''} onChange={(e)=> setEditValues({...editValues, lastName: e.target.value})} />
                  <input placeholder="Email" type="email" className="p-2 border rounded" value={(editValues.email as string) || ''} onChange={(e)=> setEditValues({...editValues, email: e.target.value})} />
                  <input placeholder="Phone (optional)" className="p-2 border rounded" value={(editValues.phone as string) || ''} onChange={(e)=> setEditValues({...editValues, phone: e.target.value})} />
                </div>
              ) : (
                <div>
                  <div className="font-semibold">{u.firstName} {u.lastName} {u.disabled && <span className="text-xs text-red-600 ml-2">(Restricted)</span>}</div>
                  <div className="text-sm text-gray-600">{u.email} {u.phone && <>• {u.phone}</>}</div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {editingId === u._id ? (
                <>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editValues.disabled} onChange={(e)=> setEditValues({...editValues, disabled: e.target.checked})} /> Restricted</label>
                  <select value={(editValues.role as string) || u.role} onChange={(e)=> setEditValues({...editValues, role: e.target.value as any})} className="p-1 border rounded">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button onClick={() => saveEdit(u._id)} className="px-3 py-1 bg-vita-primary text-white rounded">Save</button>
                  <button onClick={cancelEdit} className="px-3 py-1 border rounded">Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(u)} className="px-3 py-1 border rounded">Edit</button>
                  <button onClick={() => openMessageModal(u._id)} className="px-3 py-1 bg-amber-100 text-amber-800 rounded">Message</button> 
                  <button onClick={() => openDeleteModal(u._id)} className="px-3 py-1 bg-red-100 text-red-700 rounded">Delete</button> 
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Message Modal */}
      {messageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeMessageModal} />
          <div className="bg-white rounded-lg p-6 z-10 w-full max-w-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Send message to user</h3>
            <div className="space-y-3">
              <input value={messageSubject} onChange={(e) => setMessageSubject(e.target.value)} className="w-full p-2 border rounded" placeholder="Subject" />
              <textarea value={messageBody} onChange={(e) => setMessageBody(e.target.value)} className="w-full p-2 border rounded h-40" placeholder="Message body" />
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={closeMessageModal} className="px-3 py-1 border rounded">Cancel</button>
              <button onClick={submitMessage} disabled={messageSending} className="px-4 py-2 bg-vita-primary text-white rounded">{messageSending ? 'Sending...' : 'Send'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeDeleteModal} />
          <div className="bg-white rounded-lg p-6 z-10 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-3 text-red-600">Confirm delete</h3>
            <p>Are you sure you want to disable (soft-delete) <strong>{users.find(u => u._id === deleteTargetId)?.email || 'this user'}</strong>? This action can be undone via the Undo toast.</p>

            <div className="mt-3 border-t pt-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={permanentConfirmChecked} onChange={(e) => setPermanentConfirmChecked(e.target.checked)} />
                <span className="text-sm text-red-600">Permanently delete this user (irreversible)</span>
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={closeDeleteModal} className="px-3 py-1 border rounded">Cancel</button>
              <button onClick={confirmDelete} disabled={deleteSending} className="px-4 py-2 bg-amber-600 text-white rounded">{deleteSending ? 'Deleting...' : 'Disable'}</button>
              <button onClick={confirmPermanentDelete} disabled={deleteSending || !permanentConfirmChecked} className="px-4 py-2 bg-red-600 text-white rounded">{deleteSending ? 'Deleting...' : 'Delete permanently'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersList;
