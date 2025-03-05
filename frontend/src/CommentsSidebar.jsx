// CommentsSidebar.jsx
import React, { useState, useEffect } from 'react';
import { baseUrl } from './apis';

const CommentsSidebar = ({ previewKey }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [editingUsername, setEditingUsername] = useState(false);
  const [error, setError] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  // Fetch comments for the preview by its key
  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const res = await fetch(`${baseUrl}/admin/comments/${previewKey}`);
      const data = await res.json();
      if (res.ok) {
        setComments(data.comments);
      } else {
        setError(data.error || 'Error fetching comments');
      }
    } catch (err) {
      setError('Error fetching comments');
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (previewKey) {
      fetchComments();
    }
  }, [previewKey]);

  // Handle new comment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) {
      setError('Please set your username first.');
      return;
    }
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`${baseUrl}/admin/comment/${previewKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username, comment: newComment }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewComment('');
        fetchComments();
      } else {
        setError(data.error || 'Error adding comment');
      }
    } catch (err) {
      setError('Error adding comment');
    }
  };

  // Save username to local storage
  const handleUsernameSave = () => {
    localStorage.setItem('username', username);
    setEditingUsername(false);
  };

  return (
    <div
      className={`absolute top-0 right-0 h-full bg-black bg-opacity-85 text-white transition-all duration-300 box-border flex flex-col p-2 overflow-visible ${
        collapsed ? 'w-8' : 'w-72'
      }`}
    >
      {/* Toggle button that spills outward */}
<button
onClick={() => setCollapsed(!collapsed)}
className="absolute top-1/2 transform -translate-y-1/2 w-8 h-16 bg-black bg-opacity-85 text-white flex items-center justify-center rounded-l z-10"
style={{ left: "-2rem" }}
>
{collapsed ? '<' : '>'}
</button>

      {!collapsed && (
        <>
          <h3 className="text-xl mb-2 pb-1 border-b border-white/30">
            Comments
          </h3>
          {/* Comments list container */}
          <div className="flex-1 overflow-y-auto mb-2">
            {loadingComments ? (
              <p>Loading comments...</p>
            ) : (
              <ul className="list-none p-0">
                {comments.map((c, index) => (
                  <li key={index} className="mb-2">
                    <strong>{c.name}:</strong> {c.comment}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Form container pinned at the bottom */}
          <form onSubmit={handleSubmit} className="space-y-2">
            {(!username || editingUsername) ? (
              <>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:border-blue-400"
                />
                <button
                  type="button"
                  onClick={handleUsernameSave}
                  className="w-full p-2 rounded bg-green-600 text-white hover:bg-green-700"
                >
                  Save Username
                </button>
              </>
            ) : (
              <div className="mb-2">
                <span>Username: {username}</span>{' '}
                <button
                  type="button"
                  onClick={() => setEditingUsername(true)}
                  className="px-2 py-1 rounded bg-gray-600 text-white hover:bg-gray-700"
                >
                  Edit
                </button>
              </div>
            )}
            <textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:border-blue-400 resize-y"
              rows="3"
            />
            <button
              type="submit"
              className="w-full p-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Submit Comment
            </button>
          </form>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </>
      )}
    </div>
  );
};

export default CommentsSidebar;
