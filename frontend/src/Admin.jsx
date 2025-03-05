import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { baseUrl } from './apis';

function Admin() {
  const [previews, setPreviews] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all preview documents from the API
  const fetchPreviews = async () => {
    try {
      const res = await fetch(`${baseUrl}/admin/all`);
      const data = await res.json();
      if (res.ok) {
        setPreviews(data.previews);
      } else {
        setError(data.error || 'Error fetching previews');
      }
    } catch (err) {
      setError('Error fetching previews');
    }
  };

  useEffect(() => {
    fetchPreviews();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch(`${baseUrl}/admin/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        // Refresh the list after a successful upload
        fetchPreviews();
        setSelectedFile(null);
      } else {
        setError(data.error || 'Error uploading file');
      }
    } catch (err) {
      setError('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  // Handle deletion of a preview by key
  const handleDelete = async (key) => {
    try {
      const res = await fetch(`${baseUrl}/admin/${key}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        // Remove the deleted preview from state using the key
        setPreviews((prev) => prev.filter((preview) => preview.key !== key));
      } else {
        setError(data.error || 'Error deleting preview');
      }
    } catch (err) {
      setError('Error deleting preview');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Preview Manager</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Upload Section */}
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="file" 
          onChange={handleFileChange} 
          accept=".glb" 
        />
        <button 
          onClick={handleUpload} 
          disabled={uploading || !selectedFile}
          style={{ marginLeft: '10px' }}
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>

      {/* Previews List */}
      <div>
        <h3>Previews</h3>
        {previews.length === 0 ? (
          <p>No previews available.</p>
        ) : (
          <ul>
            {previews.map((preview) => (
              <li key={preview._id} style={{ marginBottom: '15px' }}>
                <div>
                  <strong>Key:</strong> {preview.key}
                </div>
                <div>
                  <strong>URL:</strong>{' '}
                  <a 
                    href={preview.s3Url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {preview.s3Url}
                  </a>
                </div>
                <div>
                  <strong>View:</strong>{' '}
                  <Link to={`/viewer/${preview.key}`}>Go to Viewer</Link>
                </div>
                <button 
                  onClick={() => handleDelete(preview.key)}
                  style={{ marginTop: '5px' }}
                >
                  Delete Preview
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Admin;
