import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import CommentsSidebar from './CommentsSidebar';
import { baseUrl } from './apis';

// Model component that loads and displays the GLB model from the given S3 URL.
// It calls onLoaded once the model is available.
function Model({ url, onLoaded }) {
  const { scene } = useGLTF(url);
  useEffect(() => {
    if (scene && onLoaded) {
      onLoaded();
    }
  }, [scene, onLoaded]);
  return <primitive object={scene} />;
}

export default function GLBViewer() {
  const { previewKey } = useParams(); // Extract preview key from URL params
  const [s3Url, setS3Url] = useState(null);
  const [loading, setLoading] = useState(true); // controls preview fetch
  const [modelLoaded, setModelLoaded] = useState(false); // controls model download
  const [status, setStatus] = useState('Fetching preview...');
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false); // Theme toggle state
  const dist = 10; // Light distance value

  useEffect(() => {
    async function fetchPreview() {
      setLoading(true);
      setStatus('Fetching preview details...');
      try {
        const res = await fetch(`${baseUrl}/admin/preview/${previewKey}`);
        if (!res.ok) {
          throw new Error('Failed to fetch preview details');
        }
        const data = await res.json();
        if (data.preview && data.preview.s3Url) {
          setStatus('Loading model...');
          setS3Url(data.preview.s3Url);
        } else {
          throw new Error('Invalid preview data received');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (previewKey) {
      fetchPreview();
    } else {
      setError('No preview key provided');
      setLoading(false);
    }
  }, [previewKey]);

  if (error) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-gray-800 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  // We'll consider the overall loading state to be when preview is fetching or model isn't loaded yet.
  const overallLoading = loading || !modelLoaded;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          zIndex: 20,
          background: 'rgba(255,255,255,0.2)',
          padding: '10px',
          borderRadius: '5px',
          color: isDarkMode ? '#A9A9A9' : '#A9A9A9',
          cursor: 'pointer',
          transition: 'opacity 0.3s ease',
          opacity: 0.5,
        }}
        onMouseEnter={(e) => (e.target.style.opacity = 1)}
        onMouseLeave={(e) => (e.target.style.opacity = 0.5)}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      {/* Logo in the top left */}
      <img
        src="https://abhishekcreations.com/wp-content/uploads/2023/09/abhishek-logo.png"
        alt="Logo"
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          width: 50,
          height: 50,
          zIndex: 20,
        }}
      />

      <Canvas
        camera={{ position: [0, 3, 3] }}
        style={{ width: '100%', height: '100%', background: isDarkMode ? '#111' : '#fff' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[dist, dist, dist]} intensity={1} />
        <directionalLight position={[-dist, dist, dist]} intensity={1} />
        <directionalLight position={[dist, -dist, dist]} intensity={1} />
        <directionalLight position={[-dist, -dist, dist]} intensity={1} />
        <directionalLight position={[dist, dist, -dist]} intensity={1} />
        <directionalLight position={[-dist, dist, -dist]} intensity={1} />
        <directionalLight position={[dist, -dist, -dist]} intensity={1} />
        <directionalLight position={[-dist, -dist, -dist]} intensity={1} />
        <Suspense fallback={<Html center />}>{s3Url && <Model url={s3Url} onLoaded={() => setModelLoaded(true)} />}</Suspense>
        <OrbitControls />
      </Canvas>
      {/* Loader overlay: remains visible until both preview and model are loaded */}
      {overallLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            zIndex: 10,
          }}
        >
          <div
            style={{
              border: '4px solid rgba(255, 255, 255, 0.3)',
              borderLeftColor: '#fff',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p className="mt-4">{status}</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      {/* Overlay the collapsible CommentsSidebar */}
      <CommentsSidebar previewKey={previewKey} />
      
      {/* Disclaimer */}
      <div
        style={{
          position: 'absolute',
          bottom: 3,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '8px',
          color: isDarkMode ? '#bbb' : '#555',
          textAlign: 'center',
          zIndex: 20,
        }}
      >
        Disclaimer: All rights are reserved by Abhishek Creations for this design until final option is selected & payment made towards the same. This design cannot be copied/replicated/used in any form unless written consent taken from Abhishek Creations.
      </div>
    </div>
  );
}
