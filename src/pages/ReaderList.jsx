// client/src/pages/ReaderList.jsx
import React, { useEffect, useState } from 'react';
import API from '../Api/api';

export default function ReaderList() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchList(query = '') {
    try {
      setLoading(true);
      setError(null);
      const url = '/articles/approved' + (query ? '?q=' + encodeURIComponent(query) : '');
      const res = await API.get(url);
      setList(res.data.items || res.data || []);
    } catch (err) {
      console.error('fetchList error', err);
      setError(err.response?.data?.msg || 'Failed to load articles');
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-semibold">Approved Articles</h2>
        <div className="text-sm text-gray-600">Browse the latest approved posts</div>
      </div>

      <div className="mb-6 flex gap-3 items-center">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') fetchList(q); }}
          placeholder="Search title or author"
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <button
          onClick={() => fetchList(q)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Search
        </button>
        <button
          onClick={() => { setQ(''); fetchList(); }}
          className="px-3 py-2 bg-gray-100 border border-gray-200 rounded hover:bg-gray-200 text-sm"
        >
          Clear
        </button>
      </div>

      {loading && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">Loading articles…</div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded">
          {error}
        </div>
      )}

      {(!loading && list.length === 0) && (
        <div className="p-6 bg-gray-50 border border-gray-100 rounded text-gray-600">No approved articles yet.</div>
      )}

      <div className="space-y-6">
        {list.map(a => (
          <article key={a._id} className="bg-white border border-gray-100 rounded shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">{a.title}</h3>
                <div className="text-sm text-gray-500 mb-3">
                  By: <span className="font-medium text-gray-700">{a.author?.name || 'Unknown'}</span>
                  {a.approvedBy && <> — Approved by: <span className="font-medium text-gray-700">{a.approvedBy?.name}</span></>}
                </div>
                <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: a.content }} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
