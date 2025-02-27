import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

function Model({ url }) {
  // Loads the GLB model from the provided object URL
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export default function GLBViewer() {
  const [fileUrl, setFileUrl] = useState(null);
  const dist = 10; // Adjust this value to position your lights

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setFileUrl(objectUrl);
    }
  };

  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  return (
    <div className="w-screen h-screen bg-gray-800 relative">
      {!fileUrl && (
        <input
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-12 bg-gray-700 text-white"
          type="file"
          accept=".glb"
          onChange={handleFileChange}
        />
      )}
      {fileUrl && (
        <Canvas
          style={{ width: '100vw', height: '100vh' }}
          // Camera positioned slightly upwards (Y axis) and zoomed out (Z axis)
          camera={{ position: [0, 3, 3] }}
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
          <Suspense fallback={null}>
            <Model url={fileUrl} />
          </Suspense>
          <OrbitControls />
        </Canvas>
      )}
    </div>
  );
}
