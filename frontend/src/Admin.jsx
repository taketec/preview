import React, { useState, useEffect } from 'react';
import { baseUrl } from './apis';
import { Link } from 'react-router-dom';

function Admin() {
  const checkAuth = () => {
    const token = localStorage.getItem("adminToken");
    const lastLoggedIn = localStorage.getItem("lastloggedin");
    if (token && lastLoggedIn) {
      if (Date.now() - parseInt(lastLoggedIn) < 172800000) {
        return true;
      } else {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("lastloggedin");
      }
    }
    return false;
  };

  const [authenticated, setAuthenticated] = useState(checkAuth());
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [previews, setPreviews] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log(baseUrl)
      const res = await fetch(`${baseUrl}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("lastloggedin", Date.now().toString());
        setAuthenticated(true);
        setLoginError("");
      } else {
        setLoginError(data.error || "Login failed");
      }
    } catch {
      setLoginError("Network error");
    }
  };

  const fetchPreviews = async () => {
    try {
      const res = await fetch(`${baseUrl}/admin/all`);
      const data = await res.json();
      if (res.ok) {
        setPreviews(data.previews);
      } else {
        setError(data.error || "Error fetching previews");
      }
    } catch {
      setError("Error fetching previews");
    }
  };

  useEffect(() => {
    if (authenticated) fetchPreviews();
  }, [authenticated]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${baseUrl}/admin/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileName: selectedFile.name, contentType: selectedFile.type || "model/gltf-binary" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error obtaining URL");
      
      await fetch(data.presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": selectedFile.type || "model/gltf-binary" },
        body: selectedFile,
      });
      
      fetchPreviews();
      setSelectedFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (key) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${baseUrl}/admin/${key}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setPreviews((prev) => prev.filter((preview) => preview.key !== key));
      } else {
        setError(data.error || "Error deleting preview");
      }
    } catch {
      setError("Error deleting preview");
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-900 text-white">
        <h2 className="text-3xl font-bold mb-6">Admin Login</h2>
        {loginError && <p className="text-red-500 mb-4">{loginError}</p>}
        <form onSubmit={handleLogin} className="flex flex-col items-center">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="p-3 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none mb-4"
          />
          <button className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h2 className="text-3xl font-bold mb-6">Admin Preview Manager</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-6">
        <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} accept=".glb" className="border p-2 rounded bg-gray-800 text-white" />
        <button onClick={handleUpload} disabled={uploading || !selectedFile} className="ml-4 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded disabled:opacity-50">
          {uploading ? "Uploading..." : "Upload File"}
        </button>
      </div>
      <div>
        <h3 className="text-2xl font-semibold mb-4">Previews</h3>
        {previews.length === 0 ? <p>No previews available.</p> : previews.map((preview) => (
          <div key={preview._id} className="p-4 border-b border-gray-700">
            <div className="mb-2"><strong>Key:</strong> {preview.key}</div>
            <a href={`http://localhost:5173/viewer/${preview.key}`} target="_blank" rel="noopener noreferrer" className="text-gray-300 underline hover:text-white">View</a>
            <button onClick={() => handleDelete(preview.key)} className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin;
