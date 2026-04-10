import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getPendingUsers, getApprovedUsers, getRejectedUsers, approveUser, rejectUser, deleteUser } from '../utils/auth';

export default function AdminPage({ user }) {
  const [tab, setTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState('');

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const fetchData = async () => {
    setLoading(true);
    const [p, a, r] = await Promise.all([getPendingUsers(), getApprovedUsers(), getRejectedUsers()]);
    setPending(p);
    setApproved(a);
    setRejected(r);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    const result = await approveUser(id);
    setActionLoading(null);
    if (result.success) {
      showToast(result.message);
      fetchData();
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    const result = await rejectUser(id);
    setActionLoading(null);
    if (result.success) {
      showToast(result.message);
      fetchData();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setActionLoading(id);
    const result = await deleteUser(id);
    setActionLoading(null);
    if (result.success) {
      showToast(result.message);
      fetchData();
    }
  };

  const tabs = [
    { id: 'pending', label: 'Pending', count: pending.length, color: 'text-yellow-500' },
    { id: 'approved', label: 'Approved', count: approved.length, color: 'text-green-500' },
    { id: 'rejected', label: 'Rejected', count: rejected.length, color: 'text-red-400' },
  ];

  const currentList = tab === 'pending' ? pending : tab === 'approved' ? approved : rejected;

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 px-5 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm shadow-xl backdrop-blur-xl animate-fade-in">
          ✅ {toast}
        </div>
      )}

      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-stone-100">Admin Dashboard</h1>
            <p className="text-stone-500 text-sm">Manage access requests for the yearbook</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 mb-8">
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                tab === t.id
                  ? 'bg-stone-800 text-stone-100 border border-stone-700'
                  : 'text-stone-500 hover:text-stone-300 border border-transparent'
              }`}
            >
              {t.label}
              <span className={`text-xs font-bold ${t.color}`}>({t.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* User List */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-24">
        {loading ? (
          <div className="text-center py-20">
            <svg className="w-8 h-8 animate-spin text-gold-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-stone-500">Loading...</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-600 font-handwriting text-2xl">
              {tab === 'pending' ? 'No pending requests' : tab === 'approved' ? 'No approved users yet' : 'No rejected users'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentList.map((u) => (
              <div
                key={u._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-stone-900/60 border border-stone-800/50 rounded-xl hover:border-stone-700/50 transition-all"
              >
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-stone-400 font-serif text-sm font-bold">
                      {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-stone-100 font-medium">{u.name}</h3>
                    <p className="text-stone-500 text-sm">{u.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gold-500 text-xs font-semibold">{u.major}</span>
                      {u.rollNo && (
                        <>
                          <span className="text-stone-700">•</span>
                          <span className="text-stone-500 text-xs font-mono">{u.rollNo}</span>
                        </>
                      )}
                      <span className="text-stone-700">•</span>
                      <span className="text-stone-600 text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-16 sm:ml-0">
                  {tab === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(u._id)}
                        disabled={actionLoading === u._id}
                        className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg hover:bg-green-500/20 transition-all disabled:opacity-50"
                      >
                        {actionLoading === u._id ? '...' : '✓ Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(u._id)}
                        disabled={actionLoading === u._id}
                        className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50"
                      >
                        {actionLoading === u._id ? '...' : '✗ Reject'}
                      </button>
                    </>
                  )}
                  {tab === 'rejected' && (
                    <button
                      onClick={() => handleApprove(u._id)}
                      disabled={actionLoading === u._id}
                      className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg hover:bg-green-500/20 transition-all disabled:opacity-50"
                    >
                      {actionLoading === u._id ? '...' : 'Approve'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(u._id)}
                    disabled={actionLoading === u._id}
                    className="px-3 py-2 text-stone-600 hover:text-red-400 text-sm transition-all disabled:opacity-50"
                    title="Delete user"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
