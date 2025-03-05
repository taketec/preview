import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AdminPreviewManager from './Admin.jsx'
import './index.css'
import App from './App.jsx'
import GLBViewer from './GLBViewer.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
