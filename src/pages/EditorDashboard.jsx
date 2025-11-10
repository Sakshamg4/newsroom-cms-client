import React, { useEffect, useState, useContext } from 'react';
import API, { setAuthHeader } from '../Api/api';
import { AuthContext } from '../AuthContext/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function EditorDashboard() {
  const { auth } = useContext(AuthContext);
  const [queue, setQueue] = useState([]);
  const [reviewed, setReviewed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // Modal state for rejection comment
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [rejectTargetId, setRejectTargetId] = useState(null);

  useEffect(() => {
    setAuthHeader(auth?.token);
    loadQueue();
    loadReviewed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  async function loadQueue() {
    try {
      setLoading(true);
      const res = await API.get('/articles/assigned');
      setQueue(res.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.msg || 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  }

  async function loadReviewed() {
    try {
      const res = await API.get('/articles/reviewed');
      setReviewed(res.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.msg || 'Failed to load reviewed list');
    }
  }

  // Kick off approve or open reject modal
  function act(id, action) {
    if (action === 'reject') {
      setRejectTargetId(id);
      setRejectComment('');
      setShowRejectModal(true);
    } else {
      handleApprove(id);
    }
  }

  async function handleApprove(id) {
    try {
      setProcessingId(id);
      await API.post(`/articles/${id}/review`, { action: 'approve' });
      toast.success('Article approved');
      await Promise.all([loadQueue(), loadReviewed()]);
    } catch (err) {
      toast.error(err?.response?.data?.msg || 'Approve failed');
    } finally {
      setProcessingId(null);
    }
  }

  async function confirmReject() {
    if (!rejectComment.trim()) {
      toast.error('Rejection comment is required');
      return;
    }
    const id = rejectTargetId;
    try {
      setProcessingId(id);
      await API.post(`/articles/${id}/review`, { action: 'reject', comment: rejectComment });
      toast.success('Article rejected');
      setShowRejectModal(false);
      setRejectTargetId(null);
      setRejectComment('');
      await Promise.all([loadQueue(), loadReviewed()]);
    } catch (err) {
      toast.error(err?.response?.data?.msg || 'Reject failed');
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="mx-auto max-w-4xl">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Editor Dashboard</h2>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-medium text-gray-700">Review Queue</h3>
            <button
              onClick={() => { loadQueue(); loadReviewed(); toast('Refreshing…'); }}
              className="text-sm px-3 py-1 bg-white border rounded-md shadow-sm hover:bg-gray-100"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-gray-500">Loading…</div>
          ) : queue.length === 0 ? (
            <div className="text-gray-500">No submitted articles</div>
          ) : (
            queue.map(a => (
              <article
                key={a._id}
                className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">{a.title}</h4>
                    <div className="text-sm text-gray-500">By: {a.author?.name || 'Unknown'}</div>
                  </div>
                  <div className="text-sm text-gray-400">{new Date(a.createdAt || Date.now()).toLocaleString()}</div>
                </div>

                <div
                  className="prose mt-3 max-w-full prose-sm text-gray-700"
                  dangerouslySetInnerHTML={{ __html: a.content }}
                />

                <div className="mt-4 flex items-center">
                  <button
                    onClick={() => act(a._id, 'approve')}
                    disabled={processingId === a._id}
                    className={`mr-3 px-4 py-2 rounded-md text-white ${
                      processingId === a._id ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    } transition`}
                  >
                    {processingId === a._id ? 'Processing…' : 'Approve'}
                  </button>

                  <button
                    onClick={() => act(a._id, 'reject')}
                    disabled={processingId === a._id}
                    className={`px-4 py-2 rounded-md text-gray-700 border ${
                      processingId === a._id ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    {processingId === a._id ? 'Processing…' : 'Reject'}
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        <section>
          <h3 className="text-xl font-medium text-gray-700 mb-3">Previously Reviewed</h3>
          <div className="bg-white border border-gray-200 rounded-lg divide-y">
            {reviewed.length === 0 && <div className="p-4 text-gray-500">No reviewed articles yet</div>}
            {reviewed.map(a => (
              <div key={a._id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800">{a.title}</div>
                  <div className="text-sm text-gray-500">
                    {a.status} {a.editorComment && <> — <span className="text-gray-600">{a.editorComment}</span></>}
                  </div>
                </div>
                <div className="text-sm text-gray-400">{new Date(a.reviewedAt || Date.now()).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <h4 className="text-lg font-semibold mb-2">Reject Article</h4>
            <p className="text-sm text-gray-600 mb-4">Please add a comment explaining the rejection (required).</p>

            <textarea
              value={rejectComment}
              onChange={e => setRejectComment(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="Write rejection reason..."
            />

            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => { setShowRejectModal(false); setRejectComment(''); setRejectTargetId(null); }}
                className="px-4 py-2 rounded-md bg-white border hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={processingId === rejectTargetId}
                className={`px-4 py-2 rounded-md text-white ${
                  processingId === rejectTargetId ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processingId === rejectTargetId ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
