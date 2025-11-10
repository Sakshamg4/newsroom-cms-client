// client/src/pages/AdminDashboard.jsx
import React, { useEffect, useState, useContext } from 'react';
import API, { setAuthHeader } from '../Api/api';
import { AuthContext } from '../AuthContext/AuthContext';

export default function AdminDashboard() {
  const { auth } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [changing, setChanging] = useState({}); // { userId: true }

  useEffect(() => {
    if (!auth?.token) return;
    setAuthHeader(auth.token);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [uRes, aRes] = await Promise.all([
        API.get('/admin/users'),
        API.get('/admin/approved-articles')
      ]);
      setUsers(uRes.data || []);
      setArticles(aRes.data || []);
    } catch (err) {
      console.error('Admin load error', err);
      setError(err.response?.data?.msg || 'Failed to load admin data.');
      setUsers([]);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  async function changeRole(id, role) {
    const ok = window.confirm(`Change role to "${role}"?`);
    if (!ok) return;
    setChanging(prev => ({ ...prev, [id]: true }));
    try {
      await API.post(`/admin/role/${id}`, { role });
      await load();
    } catch (err) {
      console.error('changeRole error', err);
      alert(err.response?.data?.msg || 'Role change failed');
    } finally {
      setChanging(prev => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-semibold">Admin Dashboard</h2>
        <div className="text-sm text-gray-600">{auth?.user?.name} ({auth?.user?.role})</div>
      </div>

      {loading && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">Loading admin data…</div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users */}
        <section className="bg-white border border-gray-100 rounded shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-medium">Users</h3>
            <div className="text-sm text-gray-500">{users.length} users</div>
          </div>

          <div className="divide-y divide-gray-100">
            {users.map(u => (
              <div key={u._id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-sm text-gray-500">{u.email}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm px-2 py-1 rounded-md bg-gray-50 border border-gray-200 text-gray-700">{u.role}</div>

                  {u.role !== 'Admin' && (
                    <>
                      <button
                        disabled={changing[u._id]}
                        onClick={() => changeRole(u._id, 'Editor')}
                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                      >
                        Make Editor
                      </button>

                      <button
                        disabled={changing[u._id]}
                        onClick={() => changeRole(u._id, 'Writer')}
                        className="px-3 py-1 text-sm bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50"
                      >
                        Make Writer
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {users.length === 0 && !loading && (
              <div className="p-4 text-gray-600">No users found.</div>
            )}
          </div>
        </section>

        {/* Approved Articles */}
        <section className="bg-white border border-gray-100 rounded shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-medium">Approved Articles</h3>
            <div className="text-sm text-gray-500">{articles.length}</div>
          </div>

          <div className="divide-y divide-gray-100">
            {articles.map(a => (
              <div key={a._id} className="py-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{a.title}</div>
                    <div className="text-sm text-gray-500">
                      by <span className="font-medium text-gray-700">{a.author?.name || '—'}</span>
                      {a.approvedBy && <> — approved by <span className="font-medium">{a.approvedBy?.name}</span></>}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {articles.length === 0 && !loading && (
              <div className="p-4 text-gray-600">No approved articles yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
