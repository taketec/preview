import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminPreviewManager from './Admin.jsx';
import GLBViewer from './GLBViewer.jsx';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminPreviewManager />} />
        {/* The viewer route expects a preview key as a URL parameter */}
        <Route path="/viewer/:previewKey" element={<GLBViewer />} />
        {/* Optionally, a default home page */}
      </Routes>
    </Router>
  );
}
