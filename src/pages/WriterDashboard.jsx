// client/src/pages/WriterDashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import API, { setAuthHeader } from '../Api/api';
import { AuthContext } from '../AuthContext/AuthContext';

export default function WriterDashboard() {
  const { auth } = useContext(AuthContext);
  const [list, setList] = useState([]);
  const [editors, setEditors] = useState([]);
  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [assignedEditorId, setAssignedEditorId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auth?.token) return; // wait until token exists
    setAuthHeader(auth.token);
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [mineRes, editorsRes] = await Promise.allSettled([
        API.get('/articles/mine'),
        API.get('/users/editors') // safe editors endpoint
      ]);

      if (mineRes.status === 'fulfilled') {
        setList(mineRes.value.data || []);
      } else {
        console.error('Failed to load articles/mine', mineRes.reason);
        setError(prev => (prev ? prev + '\n' : '') + 'Failed to load your articles.');
      }

      if (editorsRes.status === 'fulfilled') {
        const all = editorsRes.value.data || [];
        setEditors(all);
      } else {
        console.error('Failed to load users/editors', editorsRes.reason);
        setError(prev => (prev ? prev + '\n' : '') + 'Failed to load editors.');
      }
    } catch (err) {
      console.error('Unexpected error', err);
      setError('Unexpected error while loading data.');
    } finally {
      setLoading(false);
    }
  }

  async function create(submit = false) {
    try {
      if (!title || !contentHtml) return alert('Title and content required');
      await API.post('/articles/create', { title, content: contentHtml, assignedEditorId, submit });
      setTitle(''); setContentHtml(''); setAssignedEditorId('');
      await loadAll();
    } catch (err) {
      console.error('create error', err);
      alert(err.response?.data?.msg || 'Create failed');
    }
  }

  async function startEdit(a) {
    setEditingId(a._id);
    setTitle(a.title);
    setContentHtml(a.content);
    setAssignedEditorId(a.assignedEditor?._id || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function saveEdit() {
    try {
      await API.put(`/articles/${editingId}`, { title, content: contentHtml, submit: true });
      setEditingId(null);
      setTitle(''); setContentHtml(''); setAssignedEditorId('');
      await loadAll();
    } catch (err) {
      console.error('saveEdit error', err);
      alert(err.response?.data?.msg || 'Save failed');
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-semibold">Writer Dashboard</h2>
        <div className="text-sm text-gray-600">{auth?.user?.name} ({auth?.user?.role})</div>
      </div>

      {loading && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">Loading your data…</div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded whitespace-pre-wrap">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-medium">{editingId ? 'Edit & Resubmit' : 'New Article'}</h3>
          {editingId && (
            <span className="text-sm text-gray-500">Editing</span>
          )}
        </div>

        <div className="mb-3">
          <input
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
            aria-label="Article title"
          />
        </div>

        <div className="mb-3">
          <textarea
            className="w-full border border-gray-300 rounded px-3 py-2 min-h-[180px] resize-vertical focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={contentHtml}
            onChange={e => setContentHtml(e.target.value)}
            placeholder="Write HTML or plain text here..."
            aria-label="Article content"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Assign Editor</label>
            <select
              value={assignedEditorId}
              onChange={e => setAssignedEditorId(e.target.value)}
              className="w-full sm:w-64 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Select editor</option>
              {editors.map(ed => <option key={ed._id} value={ed._id}>{ed.name}</option>)}
            </select>
          </div>

          <div className="mt-4 sm:mt-0">
            {!editingId ? (
              <>
                <button
                  onClick={() => create(false)}
                  className="inline-block mr-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => create(true)}
                  className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Submit
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={saveEdit}
                  className="inline-block mr-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Save & Resubmit
                </button>
                <button
                  onClick={() => { setEditingId(null); setTitle(''); setContentHtml(''); }}
                  className="inline-block px-4 py-2 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <h3 className="text-2xl font-semibold mb-4">Your Articles</h3>

      <div className="space-y-4">
        {list.length === 0 && !loading && (
          <div className="p-4 bg-gray-50 border border-gray-100 rounded text-gray-600">No articles yet.</div>
        )}

        {list.map(a => (
          <div key={a._id} className="bg-white border border-gray-100 rounded shadow-sm p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-medium">{a.title}</h4>
                <div className="text-sm text-gray-500 mt-1">Editor: {a.assignedEditor?.name || '—'}</div>
              </div>
              <div className="text-sm text-gray-600">{a.status}</div>
            </div>

            <div className="mt-3 prose max-w-none" dangerouslySetInnerHTML={{ __html: a.content }} />

            <div className="mt-4 flex items-center justify-between">
              {a.status === 'Rejected' && (
                <div className="text-sm text-red-600">Editor comment: <span className="font-medium text-red-700">{a.editorComment}</span></div>
              )}

              <div>
                {(a.status === 'Draft' || a.status === 'Rejected') && (
                  <button
                    onClick={() => startEdit(a)}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
